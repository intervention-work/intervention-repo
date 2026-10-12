/**
 * DOM-based Elementor parser. Walks the WordPress/Elementor widget tree with a
 * real HTML parser (node-html-parser) and maps every `elementor-widget-{type}`
 * to a Block. This replaces the old flatten-then-regex approach so ALL instances
 * of a widget type are handled uniformly across every page.
 */
import { parse, type HTMLElement, type Node } from 'node-html-parser';
import {
  type Block,
  type Card,
  stripTags,
  wordCount,
} from './wp-content-parse';
import { filterSuppressedBlocks } from './suppressed-services';

const WP_HOST = (() => {
  try {
    return new URL(
      process.env.NEXT_PUBLIC_WP_API_URL ?? 'https://interventiodev.wpenginepowered.com/wp-json'
    ).origin;
  } catch {
    return '';
  }
})();

const INLINE_KEEP = new Set(['a', 'strong', 'b', 'em', 'i', 'u', 'br']);

// Clean inline HTML for paragraphs/headings: keep basic inline tags, make links
// site-relative, drop everything else (unwrap), balance anchors.
function cleanInline(node: HTMLElement): string {
  const walk = (n: Node): string => {
    // text node
    if ((n as HTMLElement).tagName === undefined || (n as HTMLElement).tagName === null) {
      return (n as unknown as { rawText?: string; text?: string }).rawText ??
        (n as unknown as { text?: string }).text ?? '';
    }
    const el = n as HTMLElement;
    const tag = (el.tagName ?? '').toLowerCase();
    const inner = el.childNodes.map(walk).join('');
    if (tag === 'a') {
      let href = el.getAttribute('href') ?? '';
      if (WP_HOST && href.startsWith(WP_HOST)) href = href.slice(WP_HOST.length) || '/';
      const ext = /^https?:\/\//i.test(href);
      if (!href) return inner;
      return ext
        ? `<a href="${href}" target="_blank" rel="noopener noreferrer">${inner}</a>`
        : `<a href="${href}">${inner}</a>`;
    }
    if (tag === 'br') return '<br />';
    if (INLINE_KEEP.has(tag)) return `<${tag}>${inner}</${tag}>`;
    return inner; // unwrap
  };
  return node.childNodes.map(walk).join('').replace(/\s+/g, ' ').trim();
}

// Read the FontAwesome glyph name from an icon element (inline SVG `e-fas-x`
// or an <i class="fas fa-x">), searching within the given container.
function iconKey(container: HTMLElement | null): string {
  if (!container) return 'dot';
  const el = container.querySelector('svg, i') ?? container;
  const cls = el.getAttribute('class') ?? '';
  return (
    /e-(?:fas|far|fab|fal)-([a-z0-9-]+)/i.exec(cls)?.[1] ??
    /\bfa-([a-z0-9-]+)/i.exec(cls)?.[1] ??
    'dot'
  );
}

function hasClass(el: HTMLElement, cls: string): boolean {
  return (el.getAttribute('class') ?? '').split(/\s+/).includes(cls);
}

// Elementor's per-device visibility toggles. An element hidden on desktop is
// either switched off entirely or a mobile-only duplicate of content the desktop
// layout already shows; rendering it puts back what editors chose to hide.
function hiddenOnDesktop(el: HTMLElement): boolean {
  return hasClass(el, 'elementor-hidden-desktop');
}

function widgetType(el: HTMLElement): string | null {
  const m = /\belementor-widget-([a-z0-9-]+)\b/i.exec(el.getAttribute('class') ?? '');
  return m ? m[1].toLowerCase() : null;
}

// Heading level from the title element's tag or Elementor size class.
function headingLevel(titleEl: HTMLElement | null): 2 | 3 | 4 {
  const tag = (titleEl?.tagName ?? '').toLowerCase();
  if (tag === 'h1' || tag === 'h2') return 2;
  if (tag === 'h3') return 3;
  if (tag === 'h4' || tag === 'h5' || tag === 'h6') return 4;
  const cls = titleEl?.getAttribute('class') ?? '';
  if (/elementor-size-(xxl|xl|large)/i.test(cls)) return 2;
  if (/elementor-size-small/i.test(cls)) return 4;
  return 3;
}

// Emit blocks for a chunk of standard HTML (text-editor content, accordion body).
function emitHtmlBlocks(container: HTMLElement, out: Block[]): void {
  for (const child of container.childNodes) {
    const el = child as HTMLElement;
    const tag = (el.tagName ?? '').toLowerCase();
    if (!tag) {
      const t = ((child as unknown as { text?: string }).text ?? '').trim();
      if (t) out.push({ kind: 'paragraph', html: t });
      continue;
    }
    if (tag === 'p') {
      const html = cleanInline(el);
      if (stripTags(html)) pushParagraphOrButton(out, html);
    } else if (tag === 'ul' || tag === 'ol') {
      const items = el.querySelectorAll('li').map((li) => cleanInline(li)).filter((x) => stripTags(x));
      if (items.length) out.push({ kind: 'list', ordered: tag === 'ol', items });
    } else if (tag === 'blockquote') {
      out.push({ kind: 'quote', html: cleanInline(el) });
    } else if (tag === 'table') {
      out.push({ kind: 'table', html: el.toString() });
    } else if (/^h[1-6]$/.test(tag)) {
      const lvl = headingLevel(el);
      if (lvl === 2) out.push({ kind: 'section-heading', text: stripTags(cleanInline(el)) });
      else out.push({ kind: 'heading', level: lvl, html: cleanInline(el) });
    } else if (tag === 'img') {
      const src = el.getAttribute('src') ?? el.getAttribute('data-src') ?? '';
      if (src) out.push({ kind: 'image', src, alt: el.getAttribute('alt') ?? '' });
    } else if (tag === 'hr') {
      out.push({ kind: 'divider' });
    } else {
      // div/span wrapper → recurse
      emitHtmlBlocks(el, out);
    }
  }
}

function pushParagraphOrButton(out: Block[], html: string): void {
  const text = stripTags(html);
  if (!text || isShortcodeText(text)) return;
  const m = /^<a href="([^"]*)"[^>]*>([\s\S]*?)<\/a>$/i.exec(html.trim());
  if (m && stripTags(m[2]) === text && wordCount(text) <= 6) {
    out.push({ kind: 'button', href: m[1], label: text, external: /^https?:\/\//i.test(m[1]) });
    return;
  }
  out.push({ kind: 'paragraph', html });
}

// --- HubSpot form embeds ----------------------------------------------------
// Detect either HubSpot embed style anywhere in an element:
//   new:  <div class="hs-form-frame" data-portal-id data-form-id data-region>
//   old:  <script>hbspt.forms.create({ portalId:"..", formId:"..", region:".." })</script>
// The raw <script>/frame would be stripped, so we surface it as an hsform block.
type HsEmbed = { portalId: string; formId: string; region: string };

function hsFromFrame(f: HTMLElement): HsEmbed | null {
  if (!(f.getAttribute('class') ?? '').split(/\s+/).includes('hs-form-frame')) return null;
  const portalId = f.getAttribute('data-portal-id') ?? '';
  const formId = f.getAttribute('data-form-id') ?? '';
  return portalId && formId
    ? { portalId, formId, region: f.getAttribute('data-region') ?? 'na1' }
    : null;
}

// Detect a HubSpot embed at THIS element only (itself, or a direct child) — never
// a deep descendant, so a big container that merely wraps a form (plus lots of
// prose) is not mistaken for the form and its copy is not dropped.
function hubspotEmbed(el: HTMLElement): HsEmbed | null {
  const self = hsFromFrame(el);
  if (self) return self;
  for (const c of el.childNodes) {
    const ce = c as HTMLElement;
    const tag = (ce.tagName ?? '').toLowerCase();
    if (!tag) continue;
    const frame = hsFromFrame(ce);
    if (frame) return frame;
    if (tag === 'script' && (ce.text ?? '').includes('hbspt.forms.create')) {
      const txt = ce.text ?? '';
      const get = (k: string) =>
        new RegExp(`${k}\\s*:\\s*["']([^"']+)`).exec(txt)?.[1] ?? '';
      const portalId = get('portalId');
      const formId = get('formId');
      if (portalId && formId) return { portalId, formId, region: get('region') || 'na1' };
    }
  }
  return null;
}

// --- Widget extractors ------------------------------------------------------

function extractWidget(el: HTMLElement, type: string, out: Block[]): void {
  switch (type) {
    case 'heading': {
      const title = el.querySelector('.elementor-heading-title') ?? el.querySelector('h1,h2,h3,h4,h5,h6');
      const html = title ? cleanInline(title) : cleanInline(el);
      if (!stripTags(html)) return;
      const lvl = headingLevel(title);
      if (lvl === 2) out.push({ kind: 'section-heading', text: stripTags(html) });
      else out.push({ kind: 'heading', level: lvl, html });
      return;
    }
    case 'text-editor':
    case 'theme-post-excerpt': {
      const c = el.querySelector('.elementor-widget-container') ?? el;
      emitHtmlBlocks(c, out);
      return;
    }
    case 'html': {
      // Custom-HTML widgets are usually a HubSpot form embed.
      const c = el.querySelector('.elementor-widget-container') ?? el;
      const hs = hubspotEmbed(c);
      if (hs) {
        out.push({ kind: 'hsform', ...hs });
        return;
      }
      emitHtmlBlocks(c, out);
      return;
    }
    case 'button': {
      const a = el.querySelector('a');
      const label = stripTags(a?.text ?? '').trim();
      let href = a?.getAttribute('href') ?? '#';
      if (WP_HOST && href.startsWith(WP_HOST)) href = href.slice(WP_HOST.length) || '/';
      if (label) out.push({ kind: 'button', href, label, external: /^https?:\/\//i.test(href) });
      return;
    }
    case 'image':
    case 'theme-post-featured-image': {
      const img = el.querySelector('img');
      const src = img?.getAttribute('src') ?? img?.getAttribute('data-src') ?? '';
      if (src) out.push({ kind: 'image', src, alt: img?.getAttribute('alt') ?? '' });
      return;
    }
    case 'icon-list': {
      const items = el.querySelectorAll('.elementor-icon-list-item').map((li) => ({
        icon: iconKey(li),
        label: stripTags(li.querySelector('.elementor-icon-list-text')?.text ?? li.text).trim(),
      })).filter((x) => x.label);
      if (items.length) out.push({ kind: 'icon-list', items });
      return;
    }
    case 'icon-box': {
      const title = stripTags(el.querySelector('.elementor-icon-box-title')?.text ?? '').trim();
      const desc = stripTags(el.querySelector('.elementor-icon-box-description')?.text ?? '').trim();
      const icon = iconKey(el.querySelector('.elementor-icon-box-icon') ?? el);
      if (title || desc) out.push({ kind: 'icon-cards', items: [{ icon, title, desc }] });
      return;
    }
    case 'n-accordion':
    case 'accordion': {
      const items = el.querySelectorAll('details, .elementor-accordion-item, .e-n-accordion-item').map((it) => {
        const summaryEl = it.querySelector('summary, .elementor-accordion-title, .elementor-tab-title');
        const title = stripTags(summaryEl?.text ?? '').trim();
        const bodyEl = it.querySelector('.elementor-tab-content, .e-n-accordion-item-content') ?? it;
        if (summaryEl && bodyEl === it) summaryEl.remove();
        const body: Block[] = [];
        emitHtmlBlocks(bodyEl, body);
        return { title, blocks: body };
      }).filter((x) => x.title);
      if (items.length) out.push({ kind: 'accordion', items });
      return;
    }
    case 'testimonial-carousel':
    case 'testimonial':
    case 'reviews': {
      // A slide wraps its testimonial, so selecting both reads every quote twice.
      const slides = el.querySelectorAll('.swiper-slide');
      const nodes = slides.length ? slides : el.querySelectorAll('.elementor-testimonial');
      const items = nodes.map((s) => ({
        quote: stripTags(s.querySelector('.elementor-testimonial__text, .elementor-testimonial-content')?.text ?? '').trim(),
        name: stripTags(s.querySelector('.elementor-testimonial__name, .elementor-testimonial-name')?.text ?? '').trim(),
        role: stripTags(s.querySelector('.elementor-testimonial__title, .elementor-testimonial-job')?.text ?? '').trim(),
      })).filter((x) => x.quote);
      if (items.length) out.push({ kind: 'testimonials', items });
      return;
    }
    case 'image-carousel': {
      const imgs = el.querySelectorAll('img').map((img) => ({
        src: img.getAttribute('src') ?? img.getAttribute('data-src') ?? '',
        alt: img.getAttribute('alt') ?? '',
      })).filter((x) => x.src);
      for (const im of imgs) out.push({ kind: 'image', src: im.src, alt: im.alt });
      return;
    }
    case 'divider':
      out.push({ kind: 'divider' });
      return;
    case 'shortcode':
    case 'html':
      // Gravity forms / raw shortcodes have no rendered content — skip.
      return;
    case 'nav-menu':
    case 'loop-grid':
    case 'post-info':
    case 'theme-post-title':
      // Site chrome / dynamic loops embedded in the page content — not body copy.
      return;
    default: {
      // Unknown widget: recurse to avoid losing content.
      const c = el.querySelector('.elementor-widget-container') ?? el;
      emitHtmlBlocks(c, out);
    }
  }
}

// --- Tree walk --------------------------------------------------------------

const KNOWN_WIDGETS = new Set([
  'heading', 'text-editor', 'theme-post-excerpt', 'button', 'image',
  'theme-post-featured-image', 'icon-list', 'icon-box', 'n-accordion',
  'accordion', 'testimonial-carousel', 'testimonial', 'reviews',
  'image-carousel', 'divider', 'html',
]);
// nav-menu etc. are site chrome. shortcode/html are NOT skipped — they often
// wrap real rendered content (only the literal [shortcode] text is dropped).
const SKIP_WIDGETS = new Set(['nav-menu', 'post-info', 'theme-post-title']);
const isShortcodeText = (t: string) => /^\s*\[\/?[a-z][^\]]*\]\s*$/i.test(t);
const LEAF_TAGS = new Set(['p', 'ul', 'ol', 'blockquote', 'table', 'img', 'hr', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']);
const IGNORE_TAGS = new Set(['script', 'style', 'noscript', 'svg', 'iframe', 'form', 'button', 'input']);

// Direct child elements of an Elementor container, looking through the
// `.e-con-inner` wrapper boxed containers add.
function containerChildren(el: HTMLElement): HTMLElement[] {
  const kids = el.childNodes.filter((n) => (n as HTMLElement).tagName) as HTMLElement[];
  if (kids.length === 1 && hasClass(kids[0], 'e-con-inner')) return containerChildren(kids[0]);
  return kids;
}

// A container holding exactly an icon widget, a heading and (optionally) a
// text block is one feature tile. The icon widget alone has no text, so without
// this the heading falls out as a loose display heading.
function iconFeature(el: HTMLElement): { icon: string; title: string; desc: string } | null {
  if (widgetType(el)) return null;
  const kids = containerChildren(el);
  if (kids.length < 2 || kids.length > 3) return null;
  const types = kids.map(widgetType);
  if (types[0] !== 'icon' || types[1] !== 'heading') return null;
  if (kids.length === 3 && types[2] !== 'text-editor') return null;
  const titleEl = kids[1].querySelector('.elementor-heading-title') ?? kids[1];
  const title = stripTags(cleanInline(titleEl));
  const desc = kids[2] ? stripTags(cleanInline(kids[2])) : '';
  return title ? { icon: iconKey(kids[0]), title, desc } : null;
}

// Single recursive walk that never drops content: known widgets are extracted
// (and not recursed), site chrome is skipped, leaf HTML is emitted, and any
// other element (containers, unknown widgets, wrappers) is recursed into.
function walkNode(node: HTMLElement, out: Block[]): void {
  for (const child of node.childNodes) {
    const el = child as HTMLElement;
    const tag = (el.tagName ?? '').toLowerCase();
    if (!tag) {
      const t = ((child as unknown as { text?: string }).text ?? '').trim();
      if (t && !isShortcodeText(t)) out.push({ kind: 'paragraph', html: t });
      continue;
    }
    if (IGNORE_TAGS.has(tag)) continue; // scripts/styles/schema/svg — never body copy
    if (hiddenOnDesktop(el)) continue;
    const feature = iconFeature(el);
    if (feature) { out.push({ kind: 'icon-cards', items: [feature] }); continue; }
    const wtype = widgetType(el);
    if (wtype && KNOWN_WIDGETS.has(wtype)) { extractWidget(el, wtype, out); continue; }
    if (wtype && SKIP_WIDGETS.has(wtype)) continue;
    if (LEAF_TAGS.has(tag)) { emitLeaf(el, tag, out); continue; }
    // A HubSpot form embedded in a plain container (not an html widget).
    const hs = hubspotEmbed(el);
    if (hs) { out.push({ kind: 'hsform', ...hs }); continue; }
    walkNode(el, out); // container / unknown widget / wrapper
  }
}

// Emit one standard leaf HTML element as a block.
function emitLeaf(el: HTMLElement, tag: string, out: Block[]): void {
  if (tag === 'p') {
    const html = cleanInline(el);
    if (stripTags(html)) pushParagraphOrButton(out, html);
  } else if (tag === 'ul' || tag === 'ol') {
    const items = el.querySelectorAll('li').map((li) => cleanInline(li)).filter((x) => stripTags(x));
    if (items.length) out.push({ kind: 'list', ordered: tag === 'ol', items });
  } else if (tag === 'blockquote') {
    out.push({ kind: 'quote', html: cleanInline(el) });
  } else if (tag === 'table') {
    out.push({ kind: 'table', html: el.toString() });
  } else if (/^h[1-6]$/.test(tag)) {
    const lvl = headingLevel(el);
    if (lvl === 2) out.push({ kind: 'section-heading', text: stripTags(cleanInline(el)) });
    else out.push({ kind: 'heading', level: lvl, html: cleanInline(el) });
  } else if (tag === 'img') {
    const src = el.getAttribute('src') ?? el.getAttribute('data-src') ?? '';
    if (src) out.push({ kind: 'image', src, alt: el.getAttribute('alt') ?? '' });
  } else if (tag === 'hr') {
    out.push({ kind: 'divider' });
  }
}

// --- Sidebar ----------------------------------------------------------------

/**
 * The Elementor "All Services" sidebar that WP keeps inside the page body. Its
 * nav menu is site chrome, so the walk skips it (see SKIP_WIDGETS) and the
 * heading above it is left labelling nothing — an empty section near the top of
 * ~40 pages. Lift the pair out so a page can render it as an actual sidebar.
 */
export type WpSidebar = {
  title: string;
  links: Array<{ href: string; label: string }>;
};

function siteRelative(href: string): string {
  return WP_HOST && href.startsWith(WP_HOST) ? href.slice(WP_HOST.length) || '/' : href;
}

// Every widget element in document order. Keeps descending after a match because
// some templates nest the menu (and its heading) inside another widget. Skips
// `.elementor-widget-container`, the wrapper Elementor puts inside every widget —
// it matches the widget class pattern but is not a widget itself.
function widgetsIn(container: HTMLElement): HTMLElement[] {
  const out: HTMLElement[] = [];
  const visit = (node: HTMLElement): void => {
    for (const child of node.childNodes) {
      const el = child as HTMLElement;
      if (!el.tagName) continue;
      const type = widgetType(el);
      if (type && type !== 'container') out.push(el);
      visit(el);
    }
  };
  visit(container);
  return out;
}

function contains(ancestor: HTMLElement, node: HTMLElement): boolean {
  for (let p = node.parentNode as HTMLElement | null; p; p = p.parentNode as HTMLElement | null) {
    if (p === ancestor) return true;
  }
  return false;
}

/**
 * Removes each menu and the heading directly above it — the pair that renders as
 * an orphan. Everything else stays put: one page keeps unrelated widgets in the
 * same container, so removing the whole container would drop real copy.
 *
 * Elementor prints the menu twice (main + mobile dropdown), hence the de-dupe.
 */
function extractSidebar(root: HTMLElement): WpSidebar | undefined {
  const widgets = widgetsIn(root);
  let sidebar: WpSidebar | undefined;

  widgets.forEach((widget, i) => {
    if (widgetType(widget) !== 'nav-menu') return;

    const seen = new Set<string>();
    const links: WpSidebar['links'] = [];
    for (const a of widget.querySelectorAll('a')) {
      const href = siteRelative(a.getAttribute('href') ?? '');
      const label = stripTags(a.text).trim();
      if (!href || !label || seen.has(href)) continue;
      seen.add(href);
      links.push({ href, label });
    }

    const prev = widgets[i - 1];
    const headingEl =
      prev && widgetType(prev) === 'heading' && !contains(prev, widget) ? prev : undefined;
    const titleEl = headingEl?.querySelector('.elementor-heading-title') ?? headingEl;
    const title = titleEl ? stripTags(cleanInline(titleEl)) : '';

    widget.remove();
    headingEl?.remove();

    if (links.length && !sidebar) sidebar = { title: title || 'All Services', links };
  });

  return sidebar;
}

export function parseWpDoc(html: string): { blocks: Block[]; sidebar?: WpSidebar } {
  if (!html) return { blocks: [] };
  const root = parse(html, { blockTextElements: { script: false, style: false } });
  const sidebar = extractSidebar(root);
  const out: Block[] = [];
  walkNode(root, out);
  return { blocks: postProcess(out), sidebar };
}

export function parseWp(html: string): Block[] {
  return parseWpDoc(html).blocks;
}

// --- Post-process: group consecutive items into grids/cards -----------------

function postProcess(blocks: Block[]): Block[] {
  let b = mergeIconCards(blocks);
  b = mergeShortLists(b);
  b = detectPricing(b);
  b = detectCards(b);
  b = detectProfiles(b);
  b = detectActionCards(b);
  b = detectMediaText(b);
  return b;
}

const isKicker = (t: string) => Boolean(t) && wordCount(t) <= 8 && t === t.toUpperCase();
const isPhoto = (src: string) => !/\/icon-|usa-states/.test(src);

// Photo → name heading → all-caps role ("FACULTY"): a presenter/bio tile.
function detectProfiles(blocks: Block[]): Block[] {
  const out: Block[] = [];
  for (let i = 0; i < blocks.length; i++) {
    const [img, name, role] = [blocks[i], blocks[i + 1], blocks[i + 2]];
    if (
      img.kind === 'image' && isPhoto(img.src) &&
      name?.kind === 'heading' && !isKicker(stripTags(name.html)) && wordCount(stripTags(name.html)) <= 8 &&
      role?.kind === 'heading' && isKicker(stripTags(role.html))
    ) {
      out.push({ kind: 'profile', image: { src: img.src, alt: img.alt }, nameHtml: name.html, role: stripTags(role.html) });
      i += 2;
      continue;
    }
    out.push(img);
  }
  return out;
}

// Two or more "heading → button" pairs in a row (dates, programmes, offers) are
// parallel options; stacked as display headings they read as one long list.
function detectActionCards(blocks: Block[]): Block[] {
  const out: Block[] = [];
  let i = 0;
  while (i < blocks.length) {
    const cards: Card[] = [];
    let j = i;
    for (;;) {
      const h = blocks[j];
      const btn = blocks[j + 1];
      if (h?.kind !== 'heading' || btn?.kind !== 'button') break;
      const text = stripTags(h.html);
      if (isKicker(text) || wordCount(text) > 14) break;
      cards.push({ heading: text, bodyHtml: '', button: { href: btn.href, label: btn.label, external: btn.external } });
      j += 2;
    }
    if (cards.length >= 2) { out.push({ kind: 'card-group', cards }); i = j; continue; }
    out.push(blocks[i]);
    i++;
  }
  return out;
}

// Photo → heading → short copy: pair the photo beside the copy. Stacked, a
// single photo spans the whole column and pushes its text a screen away. Long
// copy stays stacked; it would leave the photo stranded at the top of a tall row.
const MEDIA_TEXT_MAX_WORDS = 160;
function detectMediaText(blocks: Block[]): Block[] {
  const out: Block[] = [];
  let side: 'left' | 'right' = 'left';
  let i = 0;
  while (i < blocks.length) {
    const img = blocks[i];
    const head = blocks[i + 1];
    if (img.kind === 'image' && isPhoto(img.src) && head?.kind === 'heading' && !isKicker(stripTags(head.html))) {
      const body: Block[] = [head];
      let k = i + 2;
      while (k < blocks.length) {
        const b = blocks[k];
        if (b.kind === 'paragraph' || b.kind === 'list' || b.kind === 'button' || (b.kind === 'heading' && b.level === 4)) {
          body.push(b);
          k++;
        } else break;
      }
      const words = body.reduce(
        (n, b) => n + (b.kind === 'paragraph' ? wordCount(stripTags(b.html)) : b.kind === 'list' ? b.items.length * 6 : 0),
        0
      );
      if (body.some((b) => b.kind === 'paragraph') && words <= MEDIA_TEXT_MAX_WORDS) {
        out.push({ kind: 'media-text', image: { src: img.src, alt: img.alt }, side, blocks: body });
        side = side === 'left' ? 'right' : 'left';
        i = k;
        continue;
      }
    }
    out.push(img);
    i++;
  }
  return out;
}

function mergeIconCards(blocks: Block[]): Block[] {
  const out: Block[] = [];
  for (const blk of blocks) {
    const last = out[out.length - 1];
    if (blk.kind === 'icon-cards' && last && last.kind === 'icon-cards') {
      last.items.push(...blk.items);
    } else {
      out.push(blk.kind === 'icon-cards' ? { ...blk, items: [...blk.items] } : blk);
    }
  }
  return out;
}

function mergeShortLists(blocks: Block[]): Block[] {
  for (const b of blocks) {
    if (b.kind === 'list' && !b.ordered && b.items.length >= 6 && b.items.every((i) => wordCount(stripTags(i)) <= 4)) {
      b.chips = true;
    }
  }
  return blocks;
}

const PRICE_RE = /\$\s*[\d][\d,.]*/;
function detectPricing(blocks: Block[]): Block[] {
  const out: Block[] = [];
  let i = 0;
  while (i < blocks.length) {
    if (blocks[i].kind === 'heading') {
      const cards: Extract<Block, { kind: 'pricing' }>['cards'] = [];
      // Headings above the first card's own title/subtitle (e.g. "Tuition Fees:")
      // label the whole group, so they stay outside the cards.
      let lead: Block[] = [];
      let j = i;
      for (;;) {
        let k = j;
        while (k < blocks.length && blocks[k].kind === 'heading') k++;
        const run = blocks.slice(j, k) as Array<Extract<Block, { kind: 'heading' }>>;
        const headings = run.map((h) => stripTags(h.html));
        const priceIdx = headings.findIndex((h) => PRICE_RE.test(h));
        const btn = blocks[k];
        if (headings.length < 2 || priceIdx === -1 || !btn || btn.kind !== 'button') break;
        const start = Math.max(0, priceIdx - 2);
        if (start > 0 && cards.length) break;
        if (!cards.length) lead = run.slice(0, start);
        const own = [...headings.slice(start, priceIdx), ...headings.slice(priceIdx + 1)];
        const title = own.find((h) => h !== h.toUpperCase()) ?? own[0];
        const subtitle = own.filter((h) => h !== title).join(' ');
        const bb = btn as Extract<Block, { kind: 'button' }>;
        cards.push({ title, subtitle, price: headings[priceIdx], button: { href: bb.href, label: bb.label, external: bb.external } });
        j = k + 1;
      }
      if (cards.length >= 2) { out.push(...lead, { kind: 'pricing', cards }); i = j; continue; }
    }
    out.push(blocks[i]); i++;
  }
  return out;
}

function detectCards(blocks: Block[]): Block[] {
  const out: Block[] = [];
  let i = 0;
  while (i < blocks.length) {
    const cards: Card[] = [];
    let j = i;
    for (;;) {
      const img = blocks[j];
      const titleBlock = blocks[j + 1];
      if (!img || img.kind !== 'image' || !titleBlock) break;
      let heading = '';
      let k = j + 1;
      if (titleBlock.kind === 'heading') { heading = stripTags(titleBlock.html); k = j + 2; }
      else if (titleBlock.kind === 'paragraph' && wordCount(stripTags(titleBlock.html)) <= 8) { heading = stripTags(titleBlock.html); k = j + 2; }
      else break;
      const paras: string[] = [];
      while (k < blocks.length && blocks[k].kind === 'paragraph') { paras.push((blocks[k] as Extract<Block, { kind: 'paragraph' }>).html); k++; }
      let button: Card['button'];
      if (k < blocks.length && blocks[k].kind === 'button') { const bb = blocks[k] as Extract<Block, { kind: 'button' }>; button = { href: bb.href, label: bb.label, external: bb.external }; k++; }
      cards.push({ image: { src: (img as Extract<Block, { kind: 'image' }>).src, alt: (img as Extract<Block, { kind: 'image' }>).alt }, heading, bodyHtml: paras.join(''), button });
      j = k;
    }
    if (cards.length >= 2) { out.push({ kind: 'card-group', cards }); i = j; }
    else { out.push(blocks[i]); i++; }
  }
  return out;
}

/**
 * Some WP pages open with loose CTAs and a banner image before their first
 * heading, which renders as orphans stranded above the content with nothing to
 * anchor them. Pull that run off the front so a page can place it deliberately
 * — actions in the hero, art beside the section it illustrates.
 *
 * Opt-in: callers that ignore this keep the blocks inline, so no page loses
 * content by default. Returns the list untouched unless the run is genuinely
 * orphaned (contains at least one CTA and leaves real content behind).
 */
export type LeadSplit = {
  actions: Array<{ href: string; label: string; external: boolean }>;
  media?: { src: string; alt: string };
  rest: Block[];
};

export function splitLead(blocks: Block[]): LeadSplit {
  const actions: LeadSplit['actions'] = [];
  let media: LeadSplit['media'];
  let i = 0;

  while (i < blocks.length) {
    const b = blocks[i];
    if (b.kind === 'button') {
      actions.push({ href: b.href, label: b.label, external: b.external });
      i++;
      continue;
    }
    if (b.kind === 'image' && !media) {
      media = { src: b.src, alt: b.alt };
      i++;
      continue;
    }
    break;
  }

  if (!actions.length || i >= blocks.length) return { actions: [], rest: blocks };
  return { actions, media, rest: blocks.slice(i) };
}

// Split off the hero region (leading eyebrow/heading/intro that duplicates the
// hero) and return remaining blocks + derived hero fields.
export type MappedWp = {
  eyebrow: string;
  title: string;
  summary: string;
  blocks: Block[];
  sidebar?: WpSidebar;
};
export function mapWp(html: string, hero: { title?: string; summary?: string } = {}): MappedWp {
  const parsed = parseWpDoc(html);
  const sidebar = parsed.sidebar;
  let blocks = parsed.blocks;
  const norm = (s: string) => s.replace(/[^a-z0-9 ]/gi, ' ').replace(/\s+/g, ' ').trim().toLowerCase();

  // A banner/logo image ahead of the page title still leaves that title
  // duplicating the hero; drop the title and keep the image.
  const second = blocks[1];
  if (blocks[0]?.kind === 'image' && hero.title && (second?.kind === 'section-heading' || second?.kind === 'heading')) {
    const t = norm(second.kind === 'section-heading' ? second.text : stripTags(second.html));
    const ht = norm(hero.title);
    if (t && (ht.includes(t) || t.includes(ht))) blocks = [blocks[0], ...blocks.slice(2)];
  }

  // A leading short all-caps line is an eyebrow/kicker, whether the editor
  // marked it up as a paragraph or as a heading.
  const eyebrowText = (b: Block | undefined): string => {
    if (!b || (b.kind !== 'paragraph' && b.kind !== 'heading')) return '';
    const t = stripTags(b.html);
    return t && wordCount(t) <= 8 && t === t.toUpperCase() ? t : '';
  };

  let i = 0;
  let eyebrow = '';
  let dTitle = '';
  const dSummary = '';
  // derive
  const derivedEyebrow = eyebrowText(blocks[i]);
  if (derivedEyebrow) { eyebrow = derivedEyebrow; i++; }
  if (blocks[i]?.kind === 'section-heading') dTitle = (blocks[i] as Extract<Block, { kind: 'section-heading' }>).text;
  else if (blocks[i]?.kind === 'heading') dTitle = stripTags((blocks[i] as Extract<Block, { kind: 'heading' }>).html);
  // strip
  let j = 0;
  if (eyebrowText(blocks[j])) j++;
  const heroTitleN = norm(hero.title || dTitle);
  if (blocks[j] && (blocks[j].kind === 'section-heading' || blocks[j].kind === 'heading')) {
    const ht = blocks[j].kind === 'section-heading'
      ? (blocks[j] as Extract<Block, { kind: 'section-heading' }>).text
      : stripTags((blocks[j] as Extract<Block, { kind: 'heading' }>).html);
    const hn = norm(ht);
    if (hn && heroTitleN && (heroTitleN.includes(hn) || hn.includes(heroTitleN))) j++;
  }
  const heroSummaryN = norm(hero.summary || dSummary);
  while (blocks[j]?.kind === 'paragraph') {
    const pn = norm(stripTags((blocks[j] as Extract<Block, { kind: 'paragraph' }>).html));
    if (pn && heroSummaryN && heroSummaryN.includes(pn)) j++;
    else break;
  }
  return {
    eyebrow,
    title: hero.title || dTitle,
    summary: hero.summary || dSummary,
    blocks: filterSuppressedBlocks(blocks.slice(j)),
    sidebar,
  };
}
