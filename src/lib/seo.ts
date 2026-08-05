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

export const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://intervention.com';
export const SITE_NAME = 'Intervention.com';
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

export function buildMetadata(input: MetaInput): Metadata {
  const seo = input.seo ?? {};

  const title = seo.title || input.title;
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

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE,
    logo: LOGO_URL,
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE,
  };
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
