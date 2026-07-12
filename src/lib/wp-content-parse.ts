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
  | { kind: 'media-text'; image: { src: string; alt: string }; side: 'left' | 'right'; blocks: Block[] };

export type Section = { heading?: string; blocks: Block[] };

export const stripTags = (h: string) =>
  h.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
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
