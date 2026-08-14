/**
 * Shared content model + helpers for WP-derived content.
 *
 * The DOM-based parser lives in `wp-parse.ts` (walks the Elementor widget tree
 * and produces these Blocks). This file holds only the types and small pure
 * helpers so both the parser and the renderer share one contract.
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
  | { kind: 'accordion'; items: Array<{ title: string; blocks: Block[] }> }
  | { kind: 'testimonials'; items: Array<{ quote: string; name: string; role: string }> }
  | {
      kind: 'pricing';
      cards: Array<{
        title: string;
        subtitle: string;
        price: string;
        button?: { href: string; label: string; external: boolean };
      }>;
    }
  | { kind: 'icon-cards'; items: Array<{ icon: string; title: string; desc: string }> }
  | { kind: 'media-text'; image: { src: string; alt: string }; side: 'left' | 'right'; blocks: Block[] }
  | { kind: 'hsform'; portalId: string; formId: string; region: string };

export type Section = { heading?: string; blocks: Block[] };

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00a0',
  ndash: '–', mdash: '—', hellip: '…', rsquo: '’', lsquo: '‘',
  rdquo: '”', ldquo: '“', middot: '·', bull: '•',
  trade: '™', reg: '®', copy: '©', deg: '°',
};

/**
 * WP stores entity-encoded text. Anything rendered as React children (rather
 * than via innerHTML) must be decoded first or `&amp;` shows up verbatim.
 */
export const decodeEntities = (s: string) =>
  s.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]*);/g, (m, g: string) => {
    if (g[0] === '#') {
      const cp =
        g[1] === 'x' || g[1] === 'X'
          ? parseInt(g.slice(2), 16)
          : parseInt(g.slice(1), 10);
      return Number.isFinite(cp) && cp > 0 ? String.fromCodePoint(cp) : m;
    }
    return NAMED_ENTITIES[g.toLowerCase()] ?? m;
  });

export const stripTags = (h: string) =>
  decodeEntities(h.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
export const wordCount = (s: string) => s.split(' ').filter(Boolean).length;

// Group a flat block list into sections split on section-heading (H2).
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
