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
  | { kind: 'profile'; image: { src: string; alt: string }; nameHtml: string; role: string }
  | { kind: 'hsform'; portalId: string; formId: string; region: string }
  | { kind: 'embed'; items: Array<{ provider: 'youtube' | 'spotify'; src: string; title: string }> };

export type Section = { heading?: string; blocks: Block[] };

// Legacy or retired editor-authored paths, rewritten to where they now live so
// body-copy links skip the redirect hop (and chains) entirely.
const INTERNAL_LINK_REWRITES: Record<string, string> = {
  '/interventionists/brad-lamm': '/our-team',
  '/interventionists/jacob-hardt': '/our-team',
  '/intervention-blog/interventionists/brad-lamm': '/our-team',
  '/intervention-blog/interventionists/jacob-hardt': '/our-team',
  '/intervention/substance-use': '/intervention/drug-alcohol-intervention',
  '/intervention/drug-intervention': '/intervention/drug-alcohol-intervention',
  '/intervention/alcohol-intervention': '/intervention/drug-alcohol-intervention',
  '/intervention/early-autism': '/intervention',
};

/**
 * Site-relative links only: apply the rewrites above and drop the trailing
 * slash (the site's canonical form; a slashed link costs a 308 hop). Query and
 * hash are preserved. Absolute, mailto, tel and hash-only hrefs pass through.
 */
export function rewriteInternalHref(href: string): string {
  if (!href || !href.startsWith('/') || href.startsWith('//')) return href;
  const m = /^([^?#]*)([?#][\s\S]*)?$/.exec(href);
  const path = (m?.[1] ?? href).replace(/\/+$/, '') || '/';
  return (INTERNAL_LINK_REWRITES[path] ?? path) + (m?.[2] ?? '');
}

/**
 * Only YouTube and Spotify embeds are allowed through; anything else is dropped.
 * Returns a canonical src (no autoplay or tracking params) or null.
 */
export function safeEmbedSrc(
  raw: string
): { provider: 'youtube' | 'spotify'; src: string } | null {
  let u: URL;
  try {
    u = new URL(raw.trim());
  } catch {
    return null;
  }
  if (u.protocol !== 'https:') return null;
  const host = u.hostname.toLowerCase();
  if (
    (host === 'www.youtube.com' || host === 'www.youtube-nocookie.com') &&
    /^\/embed\/[\w-]{6,}$/.test(u.pathname)
  ) {
    return { provider: 'youtube', src: `https://www.youtube-nocookie.com${u.pathname}?rel=0` };
  }
  if (
    host === 'open.spotify.com' &&
    /^\/embed\/(episode|show|track|playlist|album)\/[A-Za-z0-9]+$/.test(u.pathname)
  ) {
    return { provider: 'spotify', src: `https://open.spotify.com${u.pathname}` };
  }
  return null;
}

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
