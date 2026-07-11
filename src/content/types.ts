/**
 * Content rendering interfaces.
 *
 * These are the shape contracts the components render against. Content itself
 * now lives in WordPress and is fetched via `@/lib/wp`; these types describe
 * the mapped result.
 */

export type Feature = { title: string; body: string };
export type Stat = { value: string; label: string };
export type FaqItem = { q: string; a: string };

export type ContentBlock = {
  /** Optional section heading (h2) */
  heading?: string;
  /** One or more body paragraphs */
  body?: string | string[];
  /** Checklist-style bullet points */
  bullets?: string[];
  /** Highlighted statistics */
  stats?: Stat[];
  /** Two-column sub-topic cards (h3 + body) */
  features?: Feature[];
  /** Numbered, timeline-style steps */
  steps?: Feature[];
};

export type DetailContent = {
  slug: string;
  /** Nav + card label */
  label: string;
  /** Page H1 */
  title: string;
  /** Hero subtitle + meta description */
  summary: string;
  /** Optional lead paragraph shown above the content blocks */
  intro?: string;
  /** Body sections */
  blocks: ContentBlock[];
  /** Optional page-specific FAQ */
  faq?: FaqItem[];
  /** Hero background image; falls back to the parent section image */
  image?: string;
  /** When set, the nav link uses this URL instead of the auto-generated /{parent}/{slug} */
  navHrefOverride?: string;
  /** WP page slug whose native content renders as the page body. Defaults to slug. */
  sourcePageSlug?: string;
};

export type Section = {
  slug: string;
  /** Nav label */
  label: string;
  /** Optional hero kicker shown above the title (standalone content pages) */
  eyebrow?: string;
  /** Landing H1 */
  title: string;
  /** Landing subtitle + meta description */
  summary: string;
  /** Landing lead paragraph */
  intro: string;
  /** Optional rich content blocks rendered on the landing page */
  blocks?: ContentBlock[];
  /** Optional landing FAQ */
  faq?: FaqItem[];
  /** Kicker over the child grid */
  childrenEyebrow: string;
  childrenTitle: string;
  /** Hero background image; optional when sourced from WP without an image set */
  image?: string;
  /** WP page slug whose native content renders as the page body. Defaults to slug. */
  sourcePageSlug?: string;
  children: DetailContent[];
};
