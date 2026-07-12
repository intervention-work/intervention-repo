/**
 * Pure parser that turns sanitized WordPress body HTML into a structured block
 * model. Kept free of React so it can be unit-tested/verified in Node (tsx)
 * against every page's real content. <WpContent> renders these blocks.
 */

export type Card = {
  image?: { src: string; alt: string };
  heading: string;
  bodyHtml: string;
  button?: { href: string; label: string; external: boolean };
};

export type Block =
  | { kind: 'section-heading'; text: string }
  | { kind: 'heading'; level: 3 | 4; html: string }
  | { kind: 'paragraph'; html: string }
  | { kind: 'button'; href: string; label: string; external: boolean }
  | { kind: 'list'; ordered: boolean; items: string[]; chips?: boolean }
  | { kind: 'image'; src: string; alt: string }
  | { kind: 'quote'; html: string }
  | { kind: 'table'; html: string }
  | { kind: 'card-group'; cards: Card[] }
  | { kind: 'icon-list'; items: Array<{ icon: string; label: string }> }
  | { kind: 'divider' }
  | { kind: 'accordion'; items: Array<{ title: string; bodyHtml: string }> }
  | { kind: 'testimonials'; items: Array<{ quote: string; name: string; role: string }> };

export type Section = { heading?: string; blocks: Block[] };

export const stripTags = (h: string) =>
  h.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
export const wordCount = (s: string) => s.split(' ').filter(Boolean).length;

function isShortListBlock(b: Block): b is Extract<Block, { kind: 'list' }> {
  return (
    b.kind === 'list' &&
    !b.ordered &&
    b.items.length > 0 &&
    b.items.every((i) => wordCount(stripTags(i)) <= 4)
  );
}

// Remove unbalanced anchor tags. When an <a> wraps an <img> (image link), the
// block scanner matches the <img> separately and can strand the opening <a> in
// an adjacent loose chunk. A dangling <a> renders as invalid HTML the browser
// auto-closes, breaking React hydration — so drop any unmatched open/close.
function balanceAnchors(html: string): string {
  let out = html;
  let opens = (out.match(/<a\b[^>]*>/gi) || []).length;
  let closes = (out.match(/<\/a>/gi) || []).length;
  // Drop trailing unclosed opening anchors (last one first).
  while (opens > closes) {
    out = out.replace(/<a\b[^>]*>(?![\s\S]*<a\b)/i, '');
    opens--;
  }
  // Drop leading orphan closing anchors.
  while (closes > opens) {
    out = out.replace(/<\/a>/i, '');
    closes--;
  }
  return out;
}

// Turn a chunk of inline HTML (a real <p> or loose text between blocks) into a
// button (if it's essentially one short link) or a paragraph.
function pushInline(blocks: Block[], rawInner: string): void {
  const inner = balanceAnchors(rawInner);
  const text = stripTags(inner);
  if (!text) return;
  const anchors = [
    ...inner.matchAll(/<a\b[^>]*href\s*=\s*"([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi),
  ];
  if (anchors.length === 1) {
    const linkText = stripTags(anchors[0][2]);
    if (linkText && text === linkText && wordCount(linkText) <= 6) {
      const href = anchors[0][1];
      blocks.push({
        kind: 'button',
        href,
        label: linkText,
        external: /^https?:\/\//i.test(href),
      });
      return;
    }
  }
  blocks.push({ kind: 'paragraph', html: inner.trim() });
}

export function parseBlocks(html: string): Block[] {
  const re =
    /<(h[2-6]|p|ul|ol|blockquote|table|details)\b[^>]*>([\s\S]*?)<\/\1>|<img\b[^>]*>|<hr\b[^>]*>/gi;
  const blocks: Block[] = [];
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = re.exec(html))) {
    // Loose text/inline content between recognised blocks (Elementor wraps a
    // lot of copy in divs/spans that sanitize unwraps into bare text).
    if (m.index > last) pushInline(blocks, html.slice(last, m.index));
    last = re.lastIndex;

    const raw = m[0];
    const tag = (m[1] ?? '').toLowerCase();
    const inner = m[2] ?? '';

    if (raw.startsWith('<hr')) {
      blocks.push({ kind: 'divider' });
      continue;
    }
    if (raw.startsWith('<img')) {
      const src = /src\s*=\s*"([^"]*)"/i.exec(raw)?.[1] ?? '';
      const alt = /alt\s*=\s*"([^"]*)"/i.exec(raw)?.[1] ?? '';
      if (src) blocks.push({ kind: 'image', src, alt });
      continue;
    }
    if (tag === 'h2') {
      const text = stripTags(inner);
      if (text) blocks.push({ kind: 'section-heading', text });
      continue;
    }
    if (tag === 'h3' || tag === 'h4' || tag === 'h5' || tag === 'h6') {
      blocks.push({ kind: 'heading', level: tag === 'h3' ? 3 : 4, html: inner });
      continue;
    }
    if (tag === 'blockquote') {
      blocks.push({ kind: 'quote', html: inner });
      continue;
    }
    if (tag === 'table') {
      blocks.push({ kind: 'table', html: raw });
      continue;
    }
    if (tag === 'details') {
      // Native accordion item. Group consecutive <details> into one accordion.
      const title = stripTags(
        /<summary\b[^>]*>([\s\S]*?)<\/summary>/i.exec(inner)?.[1] ?? ''
      );
      const bodyHtml = inner.replace(/<summary\b[^>]*>[\s\S]*?<\/summary>/i, '').trim();
      const prev = blocks[blocks.length - 1];
      if (prev && prev.kind === 'accordion') prev.items.push({ title, bodyHtml });
      else blocks.push({ kind: 'accordion', items: [{ title, bodyHtml }] });
      continue;
    }
    if (tag === 'ul' || tag === 'ol') {
      const items = [...inner.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)].map((x) =>
        x[1].trim()
      );
      if (!items.length) continue;
      // Icon list: sanitize marks Elementor icon-list items as [[icon:KEY]]Label.
      const iconItems = items.map((it) =>
        /^\s*\[\[icon:([a-z0-9-]+)\]\]([\s\S]*)$/i.exec(it)
      );
      if (tag === 'ul' && iconItems.every(Boolean)) {
        blocks.push({
          kind: 'icon-list',
          items: iconItems.map((mm) => ({
            icon: mm![1].toLowerCase(),
            label: stripTags(mm![2]).trim(),
          })),
        });
        continue;
      }
      blocks.push({ kind: 'list', ordered: tag === 'ol', items });
      continue;
    }
    if (tag === 'p') {
      pushInline(blocks, inner);
    }
  }

  // Trailing loose content after the last block.
  if (last < html.length) pushInline(blocks, html.slice(last));

  return detectCards(detectTestimonials(detectIconBoxes(postProcess(blocks))));
}

// Group [[quote]]/[[qname]]/[[qtitle]] sentinel paragraphs into a testimonials
// block (rendered as a carousel of quote cards).
function detectTestimonials(blocks: Block[]): Block[] {
  const out: Block[] = [];
  let i = 0;
  const tag = (b: Block, t: string) =>
    b.kind === 'paragraph' && new RegExp(`^\\s*\\[\\[${t}\\]\\]`, 'i').test(b.html);
  const strip = (b: Block, t: string) =>
    stripTags((b as Extract<Block, { kind: 'paragraph' }>).html.replace(new RegExp(`^\\s*\\[\\[${t}\\]\\]`, 'i'), '')).trim();

  while (i < blocks.length) {
    if (tag(blocks[i], 'quote')) {
      const items: Array<{ quote: string; name: string; role: string }> = [];
      while (i < blocks.length && tag(blocks[i], 'quote')) {
        const quote = strip(blocks[i], 'quote');
        i++;
        let name = '';
        let role = '';
        if (i < blocks.length && tag(blocks[i], 'qname')) { name = strip(blocks[i], 'qname'); i++; }
        if (i < blocks.length && tag(blocks[i], 'qtitle')) { role = strip(blocks[i], 'qtitle'); i++; }
        if (quote) items.push({ quote, name, role });
      }
      if (items.length) out.push({ kind: 'testimonials', items });
      continue;
    }
    out.push(blocks[i]);
    i++;
  }
  return out;
}

// Merge consecutive icon-box sentinel paragraphs ([[iconbox]]Title) into a
// single icon-list block rendered as an icon-badge grid.
function detectIconBoxes(blocks: Block[]): Block[] {
  const out: Block[] = [];
  let i = 0;
  const isIconBox = (b: Block) =>
    b.kind === 'paragraph' && /^\s*\[\[iconbox\]\]/i.test(b.html);
  while (i < blocks.length) {
    if (isIconBox(blocks[i])) {
      const items: Array<{ icon: string; label: string }> = [];
      while (i < blocks.length && isIconBox(blocks[i])) {
        const label = stripTags(
          (blocks[i] as Extract<Block, { kind: 'paragraph' }>).html.replace(/^\s*\[\[iconbox\]\]/i, '')
        ).trim();
        if (label) items.push({ icon: 'user-friends', label });
        i++;
      }
      if (items.length >= 2) out.push({ kind: 'icon-list', items });
      else if (items.length === 1) out.push({ kind: 'paragraph', html: items[0].label });
      continue;
    }
    out.push(blocks[i]);
    i++;
  }
  return out;
}

// Detect the repeating "icon/photo + heading + text + (button)" pattern used
// across the site (service tiles, interventionist bios) and fold each run of
// >= 2 such units into a single card-group block for grid/carousel rendering.
function detectCards(blocks: Block[]): Block[] {
  const out: Block[] = [];
  let i = 0;

  while (i < blocks.length) {
    // A card unit = image + title (a heading OR a short paragraph) + body
    // paragraph(s) + optional button. Elementor icon-boxes use either shape.
    const cards: Card[] = [];
    let j = i;
    for (;;) {
      const img = blocks[j];
      const titleBlock = blocks[j + 1];
      if (!img || img.kind !== 'image' || !titleBlock) break;

      let heading = '';
      let k = j + 1;
      if (titleBlock.kind === 'heading') {
        heading = stripTags(titleBlock.html);
        k = j + 2;
      } else if (
        titleBlock.kind === 'paragraph' &&
        wordCount(stripTags(titleBlock.html)) <= 8
      ) {
        heading = stripTags(titleBlock.html);
        k = j + 2;
      } else {
        break; // image not part of a card unit
      }

      const paras: string[] = [];
      while (k < blocks.length && blocks[k].kind === 'paragraph') {
        paras.push((blocks[k] as Extract<Block, { kind: 'paragraph' }>).html);
        k++;
      }
      let button: Card['button'];
      if (k < blocks.length && blocks[k].kind === 'button') {
        const b = blocks[k] as Extract<Block, { kind: 'button' }>;
        button = { href: b.href, label: b.label, external: b.external };
        k++;
      }
      cards.push({
        image: { src: (img as Extract<Block, { kind: 'image' }>).src, alt: (img as Extract<Block, { kind: 'image' }>).alt },
        heading,
        bodyHtml: paras.join(''),
        button,
      });
      j = k;
    }

    if (cards.length >= 2) {
      out.push({ kind: 'card-group', cards });
      i = j;
    } else {
      out.push(blocks[i]);
      i++;
    }
  }
  return out;
}

// Merge consecutive short unordered lists (Elementor splits long lists across
// columns) and flag chip-style lists.
function postProcess(blocks: Block[]): Block[] {
  const merged: Block[] = [];
  for (const b of blocks) {
    const last = merged[merged.length - 1];
    if (isShortListBlock(b) && last && isShortListBlock(last)) {
      last.items = last.items.concat(b.items);
    } else {
      merged.push(b.kind === 'list' ? { ...b, items: [...b.items] } : b);
    }
  }
  for (const b of merged) {
    if (b.kind === 'list' && isShortListBlock(b) && b.items.length >= 6) {
      b.chips = true;
    }
  }
  return merged;
}

export function groupSections(blocks: Block[]): Section[] {
  const sections: Section[] = [];
  let current: Section = { blocks: [] };
  for (const b of blocks) {
    if (b.kind === 'section-heading') {
      if (current.heading || current.blocks.length) sections.push(current);
      current = { heading: b.text, blocks: [] };
    } else {
      current.blocks.push(b);
    }
  }
  if (current.heading || current.blocks.length) sections.push(current);
  return sections;
}
