// Centralized temporary suppression for Concierge Assessment (CARE) and
// On-Set Care Unit programs. Content stays in WordPress and the codebase so
// it can be restored by clearing these sets; the UI just skips entries that
// match. Keep this list exhaustive: slug lookups cover cards, nav, and
// related-item grids, while the title/path matchers catch hard-coded
// references in components.

export const SUPPRESSED_SERVICE_SLUGS: ReadonlySet<string> = new Set([
  'care-unit-assessment',
  'concierge-assessment',
  'concierge-assessment-care',
  'on-set-care-unit',
  'on-set-care',
]);

export const SUPPRESSED_SERVICE_PATHS: ReadonlySet<string> = new Set([
  '/services/care-unit-assessment',
  '/services/concierge-assessment',
  '/services/concierge-assessment-care',
  '/services/on-set-care-unit',
  '/services/on-set-care',
  '/care-unit-assessment',
  '/on-set-care-unit',
]);

const TITLE_NEEDLES = [
  'concierge assessment',
  'care unit assessment',
  'on-set care unit',
  'on set care unit',
  'on-set care',
];

export function isSuppressedServiceSlug(slug: string | undefined | null): boolean {
  if (!slug) return false;
  return SUPPRESSED_SERVICE_SLUGS.has(slug);
}

export function isSuppressedServicePath(path: string | undefined | null): boolean {
  if (!path) return false;
  return SUPPRESSED_SERVICE_PATHS.has(path.replace(/\/+$/, ''));
}

export function isSuppressedServiceTitle(title: string | undefined | null): boolean {
  if (!title) return false;
  const t = title.toLowerCase();
  return TITLE_NEEDLES.some((n) => t.includes(n));
}

export function isSuppressedService(input: {
  slug?: string | null;
  path?: string | null;
  title?: string | null;
}): boolean {
  return (
    isSuppressedServiceSlug(input.slug) ||
    isSuppressedServicePath(input.path) ||
    isSuppressedServiceTitle(input.title)
  );
}

type HeadingLike = { kind: 'heading' | 'section-heading'; html?: string; text?: string };

/**
 * Drop any WP body heading whose text matches a suppressed program, along with
 * every following block until the next heading of equal-or-higher importance.
 * This hides editor-authored sections like `<h3>Concierge Assessments</h3>`
 * plus their descriptive paragraphs without removing them from WordPress.
 */
export function filterSuppressedBlocks<B extends { kind: string }>(blocks: B[]): B[] {
  const isHeading = (b: B) => b.kind === 'heading' || b.kind === 'section-heading';
  const headingText = (b: B): string => {
    const h = b as unknown as HeadingLike;
    if (b.kind === 'section-heading') return h.text ?? '';
    const html = h.html ?? '';
    return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  };

  const out: B[] = [];
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (isHeading(b) && isSuppressedServiceTitle(headingText(b))) {
      // skip this heading and everything until the next heading
      let j = i + 1;
      while (j < blocks.length && !isHeading(blocks[j])) j++;
      i = j - 1;
      continue;
    }
    out.push(b);
  }
  return out;
}
