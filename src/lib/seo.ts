/**
 * SEO helpers: shape a consistent Next.js Metadata object and build JSON-LD
 * structured data. Pure functions, no WordPress calls (those live in wp.ts).
 *
 * Rank Math overrides (title/description/canonical/OG set by editors in
 * WordPress) win when present; otherwise we fall back to the page's own
 * title/summary. This keeps editor-controlled SEO authoritative once the
 * WordPress SEO bridge endpoint is live, with a safe fallback until then.
 */
import type { Metadata } from 'next';
import type { WpSeo } from '@/lib/wp';
import { stripTags, type Block } from '@/lib/wp-content-parse';

export const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://intervention.com';
export const SITE_NAME = 'Intervention.com';
// One positioning sentence, shared by the home meta description and the
// Organization/WebSite JSON-LD so entity signals never disagree.
export const SITE_DESCRIPTION =
  'Nation’s leading interventionists since 2003. Free, confidential consultation for addiction, mental health, and eating disorders. Available 24/7 nationwide.';
export const DEFAULT_OG_IMAGE = `${SITE}/images/hero-v2-poster.jpg`;
export const LOGO_URL = `${SITE}/brand/intervention-mark.png`;

export type MetaInput = {
  title: string;
  description?: string;
  canonicalPath?: string;
  image?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  /** Rank Math overrides from WordPress; take precedence when set. */
  seo?: WpSeo;
};

function absolute(url?: string): string | undefined {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  return `${SITE}${url.startsWith('/') ? '' : '/'}${url}`;
}

// WordPress (Rank Math/Yoast) was appending a 38-char suffix to every page
// title (" – Intervention.com (Change Institute)"), so SERP titles ran 85–130
// chars and Ahrefs/Semrush flagged 77 pages for "Title too long". Strip that
// baked-in suffix so Next.js owns the brand suffix via its own ${title} | Site
// pattern. Keep this permissive: match en-dash, em-dash, pipe, and colon.
function stripBakedTitleSuffix(raw: string): string {
  let t = raw.trim();
  const patterns = [
    /\s*[\-–—|:]\s*Intervention\.com\s*\(Change Institute\)\s*$/i,
    /\s*[\-–—|:]\s*Intervention\.com\s*$/i,
    /\s*[\-–—|:]\s*A Change Institute Service\s*$/i,
  ];
  let changed = true;
  while (changed) {
    changed = false;
    for (const re of patterns) {
      if (re.test(t)) {
        t = t.replace(re, '').trim();
        changed = true;
      }
    }
  }
  return t || raw;
}

export function buildMetadata(input: MetaInput): Metadata {
  const seo = input.seo ?? {};

  const rawTitle = seo.title || input.title;
  const title = stripBakedTitleSuffix(rawTitle);
  const description = seo.description || input.description || undefined;
  const canonical =
    seo.canonical || (input.canonicalPath ? absolute(input.canonicalPath) : undefined);
  const image = absolute(seo.ogImage || input.image) || DEFAULT_OG_IMAGE;
  const type = input.type ?? 'website';

  return {
    title,
    description,
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      title: seo.ogTitle || title,
      description: seo.ogDescription || description,
      url: canonical,
      siteName: SITE_NAME,
      type,
      images: [{ url: image }],
      ...(type === 'article'
        ? {
            publishedTime: input.publishedTime,
            modifiedTime: input.modifiedTime,
          }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.ogTitle || title,
      description: seo.ogDescription || description,
      images: [absolute(seo.twitterImage) || image],
    },
  };
}

/* ---------------------------------------------------------------------------
 * JSON-LD builders
 * ------------------------------------------------------------------------- */

const ORG_ID = `${SITE}/#organization`;
const WEBSITE_ID = `${SITE}/#website`;

// Facts below are the ones already published on the site (footer, our-team
// page, home hero). Do not add awards, ratings or review counts here.
const ORG_ADDRESS = {
  '@type': 'PostalAddress',
  streetAddress: '2494 NW 66th Dr',
  addressLocality: 'Boca Raton',
  addressRegion: 'FL',
  postalCode: '33496',
  addressCountry: 'US',
};

const ORG_SAME_AS = [
  'https://www.facebook.com/BradLammInterventionist/',
  'https://twitter.com/interventionUS',
  'https://www.instagram.com/interventionhelp',
];

export function organizationSchema(contact?: { phone?: string; email?: string }) {
  const telephone = contact?.phone?.replace(/^tel:/i, '') || undefined;
  const email = contact?.email || undefined;
  return {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'ProfessionalService'],
    '@id': ORG_ID,
    name: SITE_NAME,
    alternateName: 'Change Institute',
    url: SITE,
    logo: { '@type': 'ImageObject', url: LOGO_URL },
    image: DEFAULT_OG_IMAGE,
    description: SITE_DESCRIPTION,
    foundingDate: '2003',
    slogan: 'Certified Family Interventions Since 2003',
    telephone,
    email,
    address: ORG_ADDRESS,
    areaServed: { '@type': 'Country', name: 'United States' },
    knowsAbout: [
      'Professional intervention',
      'Drug and alcohol intervention',
      'Eating disorder intervention',
      'Mental health crisis intervention',
      'Complex trauma',
      'Recovery coaching',
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        telephone,
        email,
        availableLanguage: 'English',
        hoursAvailable: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday',
          ],
          opens: '00:00',
          closes: '23:59',
        },
      },
    ],
    founder: {
      '@type': 'Person',
      name: 'Brad Lamm',
      jobTitle: 'Founder and Lead Interventionist',
      url: `${SITE}/our-team`,
    },
    employee: {
      '@type': 'Person',
      name: 'Shoaib Haroon',
      jobTitle: 'Chief Executive Officer',
      url: `${SITE}/our-team`,
    },
    sameAs: ORG_SAME_AS,
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: SITE_NAME,
    url: SITE,
    description: SITE_DESCRIPTION,
    inLanguage: 'en-US',
    publisher: { '@id': ORG_ID },
  };
}

export type FaqItem = { q: string; a: string };

/** FAQPage markup. Pass the same items the page renders so they cannot drift. */
export function faqSchema(items: FaqItem[]) {
  const clean = items
    .map((i) => ({ q: i.q.trim(), a: i.a.trim() }))
    .filter((i) => i.q && i.a);
  if (!clean.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: clean.map((i) => ({
      '@type': 'Question',
      name: i.q,
      acceptedAnswer: { '@type': 'Answer', text: i.a },
    })),
  };
}

/**
 * Turns WordPress accordion blocks (already parsed by the pipeline) into FAQ
 * items, so FAQPage markup always mirrors the visible accordion. Items with no
 * answer text are skipped.
 */
export function faqItemsFromBlocks(blocks: Block[]): FaqItem[] {
  const answerText = (inner: Block[]): string =>
    inner
      .map((b) => {
        if (b.kind === 'paragraph') return stripTags(b.html);
        if (b.kind === 'list') return b.items.map(stripTags).join('. ');
        return '';
      })
      .filter(Boolean)
      .join(' ')
      .trim();

  const out: FaqItem[] = [];
  for (const b of blocks) {
    if (b.kind !== 'accordion') continue;
    for (const item of b.items) {
      const a = answerText(item.blocks);
      if (item.title && a) out.push({ q: item.title.trim(), a });
    }
  }
  return out;
}

export function articleSchema(input: {
  title: string;
  description?: string;
  url: string;
  image?: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.title,
    description: input.description || undefined,
    mainEntityOfPage: { '@type': 'WebPage', '@id': input.url },
    image: input.image ? [absolute(input.image)] : undefined,
    datePublished: input.publishedTime || undefined,
    dateModified: input.modifiedTime || input.publishedTime || undefined,
    author: input.author
      ? { '@type': 'Person', name: input.author }
      : { '@type': 'Organization', name: SITE_NAME },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: LOGO_URL },
    },
  };
}

export function breadcrumbSchema(crumbs: Array<{ name: string; path?: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: c.path ? absolute(c.path) : undefined,
    })),
  };
}
