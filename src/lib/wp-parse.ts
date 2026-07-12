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
      const items = el.querySelectorAll('.elementor-testimonial, .swiper-slide').map((s) => ({
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
  'image-carousel', 'divider',
]);
// nav-menu etc. are site chrome. shortcode/html are NOT skipped — they often
// wrap real rendered content (only the literal [shortcode] text is dropped).
const SKIP_WIDGETS = new Set(['nav-menu', 'post-info', 'theme-post-title']);
const isShortcodeText = (t: string) => /^\s*\[\/?[a-z][^\]]*\]\s*$/i.test(t);
const LEAF_TAGS = new Set(['p', 'ul', 'ol', 'blockquote', 'table', 'img', 'hr', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']);
const IGNORE_TAGS = new Set(['script', 'style', 'noscript', 'svg', 'iframe', 'form', 'button', 'input']);

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
    const wtype = widgetType(el);
    if (wtype && KNOWN_WIDGETS.has(wtype)) { extractWidget(el, wtype, out); continue; }
    if (wtype && SKIP_WIDGETS.has(wtype)) continue;
    if (LEAF_TAGS.has(tag)) { emitLeaf(el, tag, out); continue; }
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

export function parseWp(html: string): Block[] {
  if (!html) return [];
  const root = parse(html, { blockTextElements: { script: false, style: false } });
  const out: Block[] = [];
  walkNode(root, out);
  return postProcess(out);
}

// --- Post-process: group consecutive items into grids/cards -----------------

function postProcess(blocks: Block[]): Block[] {
  let b = mergeIconCards(blocks);
  b = mergeShortLists(b);
  b = detectPricing(b);
  b = detectCards(b);
  return b;
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
      let j = i;
      for (;;) {
        const headings: string[] = [];
        let k = j;
        while (k < blocks.length && blocks[k].kind === 'heading') {
          headings.push(stripTags((blocks[k] as Extract<Block, { kind: 'heading' }>).html));
          k++;
        }
        const priceIdx = headings.findIndex((h) => PRICE_RE.test(h));
        const btn = blocks[k];
        if (headings.length < 2 || priceIdx === -1 || !btn || btn.kind !== 'button') break;
        const price = headings[priceIdx];
        const title = headings.find((_, idx) => idx !== priceIdx) ?? '';
        const subtitle = headings.filter((h, idx) => idx !== priceIdx && h !== title).join(' ');
        const bb = btn as Extract<Block, { kind: 'button' }>;
        cards.push({ title, subtitle, price, button: { href: bb.href, label: bb.label, external: bb.external } });
        j = k + 1;
      }
      if (cards.length >= 2) { out.push({ kind: 'pricing', cards }); i = j; continue; }
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

// Split off the hero region (leading eyebrow/heading/intro that duplicates the
// hero) and return remaining blocks + derived hero fields.
export type MappedWp = { eyebrow: string; title: string; summary: string; blocks: Block[] };
export function mapWp(html: string, hero: { title?: string; summary?: string } = {}): MappedWp {
  const blocks = parseWp(html);
  const norm = (s: string) => s.replace(/[^a-z0-9 ]/gi, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
  let i = 0;
  let eyebrow = '';
  let dTitle = '';
  let dSummary = '';
  // derive
  if (blocks[i]?.kind === 'paragraph') {
    const t = stripTags((blocks[i] as Extract<Block, { kind: 'paragraph' }>).html);
    if (wordCount(t) <= 8 && t && t === t.toUpperCase()) { eyebrow = t; i++; }
  }
  if (blocks[i]?.kind === 'section-heading') dTitle = (blocks[i] as Extract<Block, { kind: 'section-heading' }>).text;
  else if (blocks[i]?.kind === 'heading') dTitle = stripTags((blocks[i] as Extract<Block, { kind: 'heading' }>).html);
  // strip
  let j = 0;
  if (blocks[j]?.kind === 'paragraph') {
    const t = stripTags((blocks[j] as Extract<Block, { kind: 'paragraph' }>).html);
    if (wordCount(t) <= 8 && t && t === t.toUpperCase()) j++;
  }
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
  return { eyebrow, title: hero.title || dTitle, summary: hero.summary || dSummary, blocks: blocks.slice(j) };
}
