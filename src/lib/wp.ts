import type { Section, DetailContent, ContentBlock } from '@/content/site';

const WP_API =
  process.env.NEXT_PUBLIC_WP_API_URL ??
  'https://interventiodev.wpenginepowered.com/wp-json';

const REVALIDATE = Number(process.env.NEXT_REVALIDATE_SECONDS ?? '3600');
const IS_DEV = process.env.NODE_ENV === 'development';

async function wpFetch<T>(path: string): Promise<T> {
  // In development, always hit WordPress live so content edits show immediately.
  // In production, use ISR (revalidate window) for cached, fast responses.
  const cacheOpts: RequestInit = IS_DEV
    ? { cache: 'no-store' }
    : { next: { revalidate: REVALIDATE } };

  const res = await fetch(`${WP_API}${path}`, cacheOpts);
  if (!res.ok) {
    throw new Error(`WP fetch ${res.status}: ${WP_API}${path}`);
  }
  return res.json() as Promise<T>;
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
  title: string;
  summary: string;
  intro: string;
  image: string;
  childrenEyebrow: string;
  childrenTitle: string;
  content_blocks?: AcfLayout[];
  faq?: Array<{ q: string; a: string }>;
};

type AcfDetailFields = AcfSectionFields & {
  slug: string;
  parent_section: string;
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
    title: acf.title,
    summary: acf.summary,
    intro: acf.intro,
    image: acf.image || undefined,
    childrenEyebrow: acf.childrenEyebrow,
    childrenTitle: acf.childrenTitle,
    blocks: (acf.content_blocks ?? []).map(mapAcfToContentBlock),
    faq: acf.faq ?? [],
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
    blocks: (acf.content_blocks ?? []).map(mapAcfToContentBlock),
    faq: acf.faq ?? [],
  };
}

async function fetchDetailsByParent(parentSlug: string): Promise<DetailContent[]> {
  const posts = await wpFetch<Array<{ slug: string; acf: AcfDetailFields }>>(
    `/wp/v2/detail_page?_fields=slug,acf&per_page=100&acf_format=standard`
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

export async function fetchGlobalSettings(): Promise<{
  phoneDisplay: string;
  phoneHref: string;
  email: string;
}> {
  const data = await wpFetch<{
    acf: { phone_display: string; phone_href: string; email: string };
  }>('/acf/v3/options/options');
  return {
    phoneDisplay: data.acf.phone_display,
    phoneHref: data.acf.phone_href,
    email: data.acf.email,
  };
}
