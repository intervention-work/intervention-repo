import type { Section, DetailContent, ContentBlock } from '@/content/types';

const WP_API =
  process.env.NEXT_PUBLIC_WP_API_URL ??
  'https://interventiodev.wpenginepowered.com/wp-json';

const REVALIDATE = Number(process.env.NEXT_REVALIDATE_SECONDS ?? '3600');
const IS_DEV = process.env.NODE_ENV === 'development';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Cap concurrent WP requests per process so builds don't trip WP Engine's
// rate limiter (which caused prerender timeouts). Simple FIFO semaphore.
const MAX_CONCURRENT = 4;
let active = 0;
const queue: Array<() => void> = [];
async function acquire(): Promise<void> {
  if (active < MAX_CONCURRENT) {
    active++;
    return;
  }
  await new Promise<void>((resolve) => queue.push(resolve));
  active++;
}
function release(): void {
  active--;
  const next = queue.shift();
  if (next) next();
}

// Dedupe identical GET requests within a single process (a build renders many
// pages that need the same section/settings data — this avoids hammering WP
// and tripping WP Engine's rate limiter).
const inflight = new Map<string, Promise<unknown>>();

async function wpFetchRaw<T>(path: string): Promise<T> {
  // In development, always hit WordPress live so content edits show immediately.
  // In production, use ISR (revalidate window) for cached, fast responses.
  const cacheOpts: RequestInit = IS_DEV
    ? { cache: 'no-store' }
    : { next: { revalidate: REVALIDATE } };

  const url = `${WP_API}${path}`;
  const maxAttempts = 8;
  await acquire();
  try {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      let res: Response;
      try {
        res = await fetch(url, cacheOpts);
      } catch (err) {
        // Network blip — retry with backoff too.
        if (attempt < maxAttempts) {
          await sleep(Math.min(500 * 2 ** (attempt - 1), 10000) + Math.random() * 300);
          continue;
        }
        throw err;
      }
      if (res.ok) return (await res.json()) as T;

      // Back off and retry on rate-limit / transient server errors.
      if ((res.status === 429 || res.status >= 500) && attempt < maxAttempts) {
        const retryAfter = Number(res.headers.get('retry-after'));
        const wait = Number.isFinite(retryAfter) && retryAfter > 0
          ? retryAfter * 1000
          : Math.min(500 * 2 ** (attempt - 1), 10000) + Math.random() * 400;
        await sleep(wait);
        continue;
      }
      throw new Error(`WP fetch ${res.status}: ${url}`);
    }
    throw new Error(`WP fetch failed after ${maxAttempts} attempts: ${url}`);
  } finally {
    release();
  }
}

async function wpFetch<T>(path: string): Promise<T> {
  const existing = inflight.get(path);
  if (existing) return existing as Promise<T>;
  const p = wpFetchRaw<T>(path).finally(() => {
    // Keep the entry briefly so a burst of near-simultaneous callers share it,
    // then drop it so later renders can refetch within the revalidate window.
    setTimeout(() => inflight.delete(path), 50);
  });
  inflight.set(path, p);
  return p;
}

// Raw ACF types from WP REST response

type AcfLayout = {
  acf_fc_layout: string;
  heading?: string;
  body?: string;
  bullets?: Array<{ item: string }>;
  stats?: Array<{ value: string; label: string }>;
  features?: Array<{ title: string; body: string }>;
  steps?: Array<{ title: string; body: string }>;
};

type AcfSectionFields = {
  label: string;
  eyebrow?: string;
  title: string;
  summary: string;
  intro: string;
  image: string;
  childrenEyebrow: string;
  childrenTitle: string;
  content_blocks?: AcfLayout[];
  faq?: Array<{ q: string; a: string }>;
  source_page_slug?: string;
};

type AcfDetailFields = AcfSectionFields & {
  slug: string;
  parent_section: string;
  nav_href_override?: string;
};

// Normalize an ACF textarea into a single string or an array of paragraphs.
// WordPress stores newlines as \r\n; multi-paragraph bodies split on newlines.
function normalizeBody(raw?: string): string | string[] | undefined {
  if (!raw) return undefined;
  const paragraphs = raw.split(/\r?\n/).filter(Boolean);
  return paragraphs.length > 1 ? paragraphs : raw.replace(/\r\n/g, '\n');
}

// ACF flexible content layout -> ContentBlock.
// Every layout may carry an optional body paragraph in addition to its
// collection (bullets / stats / features / steps).
export function mapAcfToContentBlock(layout: AcfLayout): ContentBlock {
  const block: ContentBlock = {};
  if (layout.heading) block.heading = layout.heading;

  const body = normalizeBody(layout.body);
  if (body) block.body = body;

  if (layout.bullets?.length) block.bullets = layout.bullets.map((b) => b.item);
  if (layout.stats?.length) block.stats = layout.stats;
  if (layout.features?.length) block.features = layout.features;
  if (layout.steps?.length) block.steps = layout.steps;

  return block;
}

function toSection(
  slug: string,
  acf: AcfSectionFields,
  children: DetailContent[] = []
): Section {
  return {
    slug,
    label: acf.label,
    eyebrow: acf.eyebrow || undefined,
    title: acf.title,
    summary: acf.summary,
    intro: acf.intro,
    image: acf.image || undefined,
    childrenEyebrow: acf.childrenEyebrow,
    childrenTitle: acf.childrenTitle,
    blocks: (Array.isArray(acf.content_blocks) ? acf.content_blocks : []).map(mapAcfToContentBlock),
    faq: Array.isArray(acf.faq) ? acf.faq : [],
    sourcePageSlug: acf.source_page_slug || undefined,
    children,
  };
}

function toDetailContent(slug: string, acf: AcfDetailFields): DetailContent {
  return {
    slug: acf.slug || slug,
    label: acf.label,
    title: acf.title,
    summary: acf.summary,
    intro: acf.intro,
    image: acf.image || undefined,
    blocks: (Array.isArray(acf.content_blocks) ? acf.content_blocks : []).map(mapAcfToContentBlock),
    faq: Array.isArray(acf.faq) ? acf.faq : [],
    navHrefOverride: acf.nav_href_override || undefined,
    sourcePageSlug: acf.source_page_slug || undefined,
  };
}

async function fetchDetailsByParent(parentSlug: string): Promise<DetailContent[]> {
  // menu_order is the WP "Order" field (Page Attributes). Editors set it in WP
  // Admin to control the nav and landing-page card order without code changes.
  const posts = await wpFetch<Array<{ slug: string; menu_order: number; acf: AcfDetailFields }>>(
    `/wp/v2/detail_page?_fields=slug,menu_order,acf&per_page=100&acf_format=standard&orderby=menu_order&order=asc`
  );
  return posts
    .filter((p) => p.acf?.parent_section === parentSlug)
    .map((p) => toDetailContent(p.slug, p.acf));
}

export async function fetchSection(slug: string): Promise<Section | null> {
  const pages = await wpFetch<Array<{ slug: string; acf: AcfSectionFields }>>(
    `/wp/v2/pages?slug=${slug}&_fields=slug,acf&acf_format=standard`
  );
  if (!pages.length) return null;
  const children = await fetchDetailsByParent(slug);
  return toSection(slug, pages[0].acf, children);
}

// ---------------------------------------------------------------------------
// WordPress page body (the real editorial content).
//
// The migrated ACF fields only hold the hero (title/summary) and structured
// blocks. The full page copy lives in the WP page's native `content.rendered`
// (built in Elementor). We fetch it, strip the Elementor/theme chrome, and
// return clean semantic HTML that the new design restyles via <WpProse>.
// ---------------------------------------------------------------------------

// Tags we keep. Everything else is unwrapped (content kept) or dropped.
const ALLOWED_TAGS = new Set([
  'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'ul', 'ol', 'li',
  'a', 'strong', 'b', 'em', 'i', 'u',
  'blockquote', 'br', 'hr',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'img',
]);

// WP host whose absolute internal links should become site-relative.
const WP_HOST = (() => {
  try {
    return new URL(WP_API).origin;
  } catch {
    return '';
  }
})();

export function sanitizeWpHtml(html: string): string {
  let out = html;

  // Drop whole blocks we never want.
  out = out.replace(/<(script|style|noscript|iframe|form|button|svg)[^>]*>[\s\S]*?<\/\1>/gi, '');
  // Drop self-closing / void junk.
  out = out.replace(/<(input|source|track)[^>]*\/?>/gi, '');
  // Elementor comments.
  out = out.replace(/<!--[\s\S]*?-->/g, '');

  // Demote H1 to H2 (hero already shows the H1).
  out = out.replace(/<(\/?)h1(\s[^>]*)?>/gi, '<$1h2>');

  // Walk every tag: keep allowed ones (stripped of attributes except href/src/alt),
  // unwrap the rest (drop the tag, keep inner content).
  out = out.replace(/<(\/?)([a-zA-Z0-9]+)((?:[^>"']|"[^"]*"|'[^']*')*)>/g, (_m, slash, tag, attrs) => {
    const t = tag.toLowerCase();
    if (!ALLOWED_TAGS.has(t)) return ''; // unwrap: remove tag, keep children
    // Void elements: never emit a closing tag (invalid `</br>`/`</hr>` cause
    // browser reparsing that breaks React hydration). Normalize to self-close.
    if (t === 'br' || t === 'hr') return slash ? '' : `<${t} />`;
    if (slash) return `</${t}>`;
    if (t === 'a') {
      const m = /href\s*=\s*"([^"]*)"|href\s*=\s*'([^']*)'/i.exec(attrs);
      let href = m ? (m[1] ?? m[2] ?? '') : '';
      // Internal links → site-relative so navigation stays on the new site.
      if (WP_HOST && href.startsWith(WP_HOST)) href = href.slice(WP_HOST.length) || '/';
      const external = /^https?:\/\//i.test(href);
      if (!href) return '<a>';
      return external
        ? `<a href="${href}" target="_blank" rel="noopener noreferrer">`
        : `<a href="${href}">`;
    }
    if (t === 'img') {
      // Keep image src ABSOLUTE (WP-hosted) so it loads on any deploy.
      const m = /(?:data-src|src)\s*=\s*"([^"]*)"|(?:data-src|src)\s*=\s*'([^']*)'/i.exec(attrs);
      const src = m ? (m[1] ?? m[2] ?? '') : '';
      const am = /alt\s*=\s*"([^"]*)"|alt\s*=\s*'([^']*)'/i.exec(attrs);
      const alt = am ? (am[1] ?? am[2] ?? '') : '';
      if (!src) return '';
      return `<img src="${src}" alt="${alt}" loading="lazy" />`;
    }
    return `<${t}>`;
  });

  // Collapse empty tags and runaway whitespace left after unwrapping.
  for (let i = 0; i < 3; i++) {
    out = out.replace(/<(p|span|strong|b|em|i|u|li)>\s*<\/\1>/gi, '');
  }
  out = out.replace(/(&nbsp;|\s){2,}/g, ' ');
  out = out.replace(/(\s*<br\s*\/?>\s*){3,}/gi, '<br /><br />');

  return out.trim();
}

async function rawPageBody(slug: string): Promise<string> {
  const pages = await wpFetch<Array<{ content: { rendered: string } }>>(
    `/wp/v2/pages?slug=${slug}&_fields=content`
  );
  return pages.length ? (pages[0].content?.rendered ?? '') : '';
}

// Fetch and sanitize a WP page's body content by slug. Returns '' if missing.
//
// Some detail_page CPT slugs (e.g. `eating-disorder-intervention`) don't match
// their WP content page slug (`eating-disorder`). When the exact slug has no
// page, we retry with the trailing "-intervention" stripped. A `source_page_slug`
// ACF field can override the lookup explicitly when needed.
export async function fetchPageBody(slug: string): Promise<string> {
  try {
    let raw = await rawPageBody(slug);
    if (!raw && slug.endsWith('-intervention')) {
      raw = await rawPageBody(slug.replace(/-intervention$/, ''));
    }
    return sanitizeWpHtml(raw);
  } catch {
    return '';
  }
}

// ---------------------------------------------------------------------------
// Generic WP page rendering (catch-all route).
//
// Every published WP page is mirrored on the new site at its own URL path and
// rendered in the new design. This is what guarantees "whatever is in WP shows
// up on the site" without building a route per page.
// ---------------------------------------------------------------------------

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&#0?38;/g, '&')
    .replace(/&#8217;/g, '’')
    .replace(/&#8216;/g, '‘')
    .replace(/&#8220;/g, '“')
    .replace(/&#8221;/g, '”')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
}

// Absolute WP permalink → site-relative path (no trailing slash, '' → '/').
function linkToPath(link: string): string {
  let p = link;
  if (WP_HOST && p.startsWith(WP_HOST)) p = p.slice(WP_HOST.length);
  p = p.replace(/\/+$/, '');
  return p || '/';
}

export type WpPage = {
  slug: string;
  path: string;
  title: string;
  body: string;
};

// All published WP page paths (for generateStaticParams on the catch-all).
export async function fetchAllPagePaths(): Promise<string[]> {
  try {
    const pages = await wpFetch<Array<{ link: string }>>(
      `/wp/v2/pages?per_page=100&status=publish&_fields=link`
    );
    return pages.map((p) => linkToPath(p.link)).filter((p) => p && p !== '/');
  } catch {
    return [];
  }
}

// Fetch a single WP page by slug (last URL segment), sanitized for rendering.
export async function fetchWpPage(slug: string): Promise<WpPage | null> {
  try {
    const pages = await wpFetch<
      Array<{ slug: string; link: string; title: { rendered: string }; content: { rendered: string } }>
    >(`/wp/v2/pages?slug=${encodeURIComponent(slug)}&_fields=slug,link,title,content`);
    if (!pages.length) return null;
    const p = pages[0];
    return {
      slug: p.slug,
      path: linkToPath(p.link),
      title: decodeEntities(p.title?.rendered ?? ''),
      body: sanitizeWpHtml(p.content?.rendered ?? ''),
    };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Content mapping — assemble raw WP body into the new design's structure.
//
// WP pages open with an eyebrow + H1 + intro that duplicates our hero. We split
// that "hero region" off so the hero shows it once and the body continues from
// the first real section ("head + para up top, then division, then content").
// ---------------------------------------------------------------------------

type Block = { tag: string; start: number; end: number; html: string };

function tokenizeBlocks(html: string): Block[] {
  const re =
    /<(h[2-4]|p|ul|ol|blockquote|table)\b[^>]*>[\s\S]*?<\/\1>|<(?:img|hr)\b[^>]*\/?>/gi;
  const blocks: Block[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const tagMatch = /^<\s*([a-z0-9]+)/i.exec(m[0]);
    blocks.push({
      tag: (m[1] ?? tagMatch?.[1] ?? '').toLowerCase(),
      start: m.index,
      end: re.lastIndex,
      html: m[0],
    });
  }
  return blocks;
}

const stripTags = (h: string) => h.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const normalizeText = (h: string) =>
  stripTags(h).replace(/[^a-z0-9 ]/gi, ' ').replace(/\s+/g, ' ').trim().toLowerCase();

export type MappedContent = {
  eyebrow: string;
  title: string;
  summary: string;
  body: string;
};

/**
 * Splits sanitized WP HTML into hero fields + remaining body.
 * `hero` lets curated pages pass their own title/summary so the matching
 * intro paragraphs are stripped from the body (removing the duplication).
 */
export function mapWpContent(
  rawHtml: string,
  hero: { title?: string; summary?: string } = {}
): MappedContent {
  const toks = tokenizeBlocks(rawHtml);
  const isHeading = (t: Block) => /^h[2-4]$/.test(t.tag);
  const wordCount = (h: string) => stripTags(h).split(' ').filter(Boolean).length;

  if (!toks.length) {
    return { eyebrow: '', title: hero.title ?? '', summary: hero.summary ?? '', body: rawHtml };
  }

  // Derive hero fields from the document opening.
  let i = 0;
  let eyebrow = '';
  let derivedTitle = '';
  let derivedSummary = '';

  if (
    toks[i]?.tag === 'p' &&
    wordCount(toks[i].html) <= 8 &&
    stripTags(toks[i].html) !== '' &&
    stripTags(toks[i].html) === stripTags(toks[i].html).toUpperCase()
  ) {
    eyebrow = stripTags(toks[i].html);
    i++;
  }
  if (toks[i] && isHeading(toks[i])) {
    derivedTitle = stripTags(toks[i].html);
    i++;
  }
  if (toks[i]?.tag === 'p') derivedSummary = stripTags(toks[i].html);

  // Determine where the body proper begins: skip eyebrow, the title heading (if
  // it duplicates the hero title), and any leading paragraphs contained in the
  // hero summary/intro.
  let j = 0;
  if (
    toks[j]?.tag === 'p' &&
    wordCount(toks[j].html) <= 8 &&
    stripTags(toks[j].html) !== '' &&
    stripTags(toks[j].html) === stripTags(toks[j].html).toUpperCase()
  ) {
    j++;
  }
  const heroTitleN = normalizeText(hero.title || derivedTitle);
  if (toks[j] && isHeading(toks[j])) {
    const hn = normalizeText(toks[j].html);
    if (hn && heroTitleN && (heroTitleN.includes(hn) || hn.includes(heroTitleN))) j++;
  }
  const heroSummaryN = normalizeText(hero.summary || derivedSummary);
  while (toks[j]?.tag === 'p') {
    const pn = normalizeText(toks[j].html);
    if (pn && heroSummaryN && heroSummaryN.includes(pn)) j++;
    else break;
  }

  const bodyStart = toks[j] ? toks[j].start : rawHtml.length;
  return {
    eyebrow,
    title: hero.title || derivedTitle,
    summary: hero.summary || derivedSummary,
    body: rawHtml.slice(bodyStart).trim(),
  };
}

// ---------------------------------------------------------------------------
// WP blog posts (47 of them, at /intervention-blog/{slug}).
// ---------------------------------------------------------------------------

export type PostCard = {
  slug: string;
  path: string;
  title: string;
  excerpt: string;
  date: string;
  image?: string;
};

// Fetch a single WP post by slug, sanitized like a page.
export async function fetchWpPost(slug: string): Promise<WpPage | null> {
  try {
    const posts = await wpFetch<
      Array<{ slug: string; link: string; title: { rendered: string }; content: { rendered: string } }>
    >(`/wp/v2/posts?slug=${encodeURIComponent(slug)}&_fields=slug,link,title,content`);
    if (!posts.length) return null;
    const p = posts[0];
    return {
      slug: p.slug,
      path: linkToPath(p.link),
      title: decodeEntities(p.title?.rendered ?? ''),
      body: sanitizeWpHtml(p.content?.rendered ?? ''),
    };
  } catch {
    return null;
  }
}

type RawPost = {
  slug: string;
  link: string;
  date: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  _embedded?: { 'wp:featuredmedia'?: Array<{ source_url?: string }> };
};

// All published posts as cards for the blog index (and their paths).
export async function fetchAllPosts(): Promise<PostCard[]> {
  const out: PostCard[] = [];
  try {
    for (let page = 1; page <= 5; page++) {
      const posts = await wpFetch<RawPost[]>(
        `/wp/v2/posts?per_page=100&page=${page}&status=publish&_embed=wp:featuredmedia&_fields=slug,link,date,title,excerpt,_links,_embedded`
      );
      if (!posts.length) break;
      for (const p of posts) {
        out.push({
          slug: p.slug,
          path: linkToPath(p.link),
          title: decodeEntities(p.title?.rendered ?? ''),
          excerpt: stripTags(decodeEntities(p.excerpt?.rendered ?? '')).slice(0, 200),
          date: p.date,
          image: p._embedded?.['wp:featuredmedia']?.[0]?.source_url,
        });
      }
      if (posts.length < 100) break;
    }
  } catch {
    /* return whatever we collected */
  }
  return out;
}

// Returns { section, detail } for a single detail page.
// section.children is fully populated, so generateStaticParams can use fetchSection alone.
export async function fetchDetail(
  parentSlug: string,
  detailSlug: string
): Promise<{ section: Section; detail: DetailContent } | null> {
  const section = await fetchSection(parentSlug);
  if (!section) return null;
  const detail = section.children.find((d) => d.slug === detailSlug) ?? null;
  if (!detail) return null;
  return { section, detail };
}

// WP menu node (from /intervention/v1/nav). Mirrors Appearance > Menus exactly.
export type NavNode = {
  id: number;
  label: string;
  url: string;
  target: string;
  children: NavNode[];
};

// Fetch the WordPress-managed nav menu. Empty array => caller falls back to the
// detail_page-derived nav so the site still renders before the menu is set up.
export async function fetchNav(): Promise<NavNode[]> {
  try {
    const data = await wpFetch<NavNode[]>('/intervention/v1/nav');
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export type NavSection = {
  slug: string;
  label: string;
  children: Array<{ slug: string; label: string; hrefOverride?: string }>;
};

// Nav dropdown structure for the given section slugs (label + children).
export async function fetchNavSections(slugs: string[]): Promise<NavSection[]> {
  const sections = await Promise.all(slugs.map((s) => fetchSection(s)));
  return sections
    .filter((s): s is Section => s !== null)
    .map((s) => ({
      slug: s.slug,
      label: s.label,
      children: s.children.map((c) => ({
        slug: c.slug,
        label: c.label,
        hrefOverride: c.navHrefOverride,
      })),
    }));
}

export type GlobalSettings = {
  phoneDisplay: string;
  phoneHref: string;
  email: string;
};

const SETTINGS_FALLBACK: GlobalSettings = {
  phoneDisplay: '(800) 789-1605',
  phoneHref: 'tel:+18007891605',
  email: 'help@intervention.com',
};

export async function fetchGlobalSettings(): Promise<GlobalSettings> {
  try {
    const data = await wpFetch<{
      phone_display: string;
      phone_href: string;
      email: string;
    }>('/intervention/v1/settings');
    return {
      phoneDisplay: data.phone_display || SETTINGS_FALLBACK.phoneDisplay,
      phoneHref: data.phone_href || SETTINGS_FALLBACK.phoneHref,
      email: data.email || SETTINGS_FALLBACK.email,
    };
  } catch {
    // If WP is unreachable, fall back to brand defaults so pages still render.
    return SETTINGS_FALLBACK;
  }
}
