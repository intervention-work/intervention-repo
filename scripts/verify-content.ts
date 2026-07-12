/**
 * Verifies <WpContent> parsing across EVERY WP page + post.
 *
 * For each entry it sanitizes the real content, runs the exact parser the site
 * uses, and checks that the parsed blocks cover essentially all of the visible
 * text (i.e. nothing is silently dropped) and flags anything that renders empty.
 *
 * Run:  npx tsx scripts/verify-content.ts
 */
import { sanitizeWpHtml } from '../src/lib/wp';
import { parseBlocks, groupSections, stripTags } from '../src/lib/wp-content-parse';

const BASE = 'https://interventiodev.wpenginepowered.com/wp-json';
const UA = { 'User-Agent': 'Mozilla/5.0 Chrome/120' };

async function getAll(type: 'pages' | 'posts') {
  const out: Array<{ slug: string; link: string; content: string }> = [];
  for (let page = 1; page <= 10; page++) {
    const res = await fetch(
      `${BASE}/wp/v2/${type}?per_page=100&page=${page}&status=publish&_fields=slug,link,content`,
      { headers: UA }
    );
    if (!res.ok) break;
    const data = (await res.json()) as Array<{ slug: string; link: string; content: { rendered: string } }>;
    if (!data.length) break;
    for (const d of data) out.push({ slug: d.slug, link: d.link, content: d.content?.rendered ?? '' });
    if (data.length < 100) break;
  }
  return out;
}

function blockText(b: ReturnType<typeof parseBlocks>[number]): string {
  switch (b.kind) {
    case 'section-heading': return b.text;
    case 'heading': return stripTags(b.html);
    case 'paragraph': return stripTags(b.html);
    case 'quote': return stripTags(b.html);
    case 'table': return stripTags(b.html);
    case 'button': return b.label;
    case 'list': return b.items.map(stripTags).join(' ');
    case 'image': return '';
    case 'card-group':
      return b.cards
        .map((c) => `${c.heading} ${stripTags(c.bodyHtml)} ${c.button?.label ?? ''}`)
        .join(' ');
    case 'icon-list':
      return b.items.map((i) => i.label).join(' ');
    case 'divider':
      return '';
    case 'accordion':
      return b.items.map((i) => `${i.title} ${stripTags(i.bodyHtml)}`).join(' ');
    case 'testimonials':
      return b.items.map((i) => `${i.quote} ${i.name} ${i.role}`).join(' ');
  }
}

async function main() {
  const [pages, posts] = await Promise.all([getAll('pages'), getAll('posts')]);
  const all = [
    ...pages.map((p) => ({ ...p, type: 'page' })),
    ...posts.map((p) => ({ ...p, type: 'post' })),
  ];
  console.log(`Checking ${all.length} entries (${pages.length} pages + ${posts.length} posts)\n`);

  const problems: string[] = [];
  let chipPages = 0;

  // Structural safety: HTML that would break React hydration when rendered.
  const unbalancedAnchors = (h: string) =>
    (h.match(/<a\b[^>]*>/gi) || []).length !== (h.match(/<\/a>/gi) || []).length;
  const hasBlockLevel = (h: string) =>
    /<(?:div|p|ul|ol|h[1-6]|table|section|figure)\b/i.test(h);

  for (const entry of all) {
    const sanitized = sanitizeWpHtml(entry.content);
    const inputText = stripTags(sanitized).replace(/[^a-z0-9 ]/gi, ' ').replace(/\s+/g, ' ').trim();
    const blocks = parseBlocks(sanitized);
    const sections = groupSections(blocks);
    const parsedText = blocks.map(blockText).join(' ').replace(/[^a-z0-9 ]/gi, ' ').replace(/\s+/g, ' ').trim();

    // Check every HTML fragment that gets wrapped in <p>/<div>/heading on render.
    const risky: string[] = [];
    for (const b of blocks) {
      if (b.kind === 'paragraph' || b.kind === 'heading') {
        if (unbalancedAnchors(b.html)) risky.push('unbalanced-anchor');
        if (hasBlockLevel(b.html)) risky.push('block-in-inline');
      }
      if (b.kind === 'card-group') {
        for (const c of b.cards) {
          if (unbalancedAnchors(c.bodyHtml)) risky.push('card-unbalanced-anchor');
          if (hasBlockLevel(c.bodyHtml)) risky.push('card-block-in-inline');
        }
      }
    }

    const inLen = inputText.length;
    const outLen = parsedText.length;
    const coverage = inLen === 0 ? 1 : outLen / inLen;
    const hasChips = blocks.some((b) => b.kind === 'list' && b.chips);
    if (hasChips) chipPages++;

    const flag: string[] = [];
    if (inLen > 200 && coverage < 0.85) flag.push(`coverage=${(coverage * 100).toFixed(0)}%`);
    if (inLen > 100 && sections.length === 0) flag.push('NO SECTIONS');
    if (risky.length) flag.push(`RISKY:${[...new Set(risky)].join(',')}`);

    if (flag.length) {
      problems.push(
        `[${entry.type}] ${entry.slug}  (in=${inLen} out=${outLen})  ${flag.join('  ')}`
      );
    }
  }

  console.log(`Pages using chip grid: ${chipPages}`);
  console.log(`\n${problems.length} entries flagged:\n`);
  problems.forEach((p) => console.log('  ' + p));
  if (!problems.length) console.log('  none — all content covered.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
