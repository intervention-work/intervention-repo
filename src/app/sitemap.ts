import type { MetadataRoute } from 'next';
import { fetchAllPagePaths, fetchAllPosts, fetchSection } from '@/lib/wp';

export const revalidate = 3600;

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://intervention.com';

// Duplicate paths that redirect to canonical URLs — omit from sitemap.
const REDIRECT_PATHS = new Set([
  '/about-us',
  '/about-us/faq',
  '/resources-3',
  '/resources-3/on-set-care-unit',
  '/resources-3/podcast',
  '/georgia',
  '/intervention-help',
  '/intervention-help/thank-you',
  '/free-resources',
]);

// Utility pages not worth indexing.
const EXCLUDE_PREFIXES = ['/thank-you', '/bist-registration', '/sitemap'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE}/`,                           lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${SITE}/intervention`,               lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE}/services`,                   lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE}/interventionists-by-state`,  lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE}/intervention-blog`,          lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${SITE}/contact`,                    lastModified: now, changeFrequency: 'yearly',  priority: 0.8 },
    { url: `${SITE}/about`,                      lastModified: now, changeFrequency: 'yearly',  priority: 0.7 },
    { url: `${SITE}/resources`,                  lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE}/insurance`,                  lastModified: now, changeFrequency: 'yearly',  priority: 0.7 },
    { url: `${SITE}/family-class`,               lastModified: now, changeFrequency: 'yearly',  priority: 0.6 },
  ];

  const [iSection, sSection, allPosts, allPagePaths] = await Promise.all([
    fetchSection('intervention'),
    fetchSection('services'),
    fetchAllPosts(),
    fetchAllPagePaths(),
  ]);

  const detailRoutes: MetadataRoute.Sitemap = [
    ...(iSection?.children ?? []).map((c) => ({
      url: `${SITE}${c.navHrefOverride ?? `/intervention/${c.slug}`}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...(sSection?.children ?? []).map((c) => ({
      url: `${SITE}${c.navHrefOverride ?? `/services/${c.slug}`}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];

  const postRoutes: MetadataRoute.Sitemap = allPosts.map((p) => ({
    url: `${SITE}${p.path}`,
    lastModified: new Date(p.date),
    changeFrequency: 'yearly' as const,
    priority: 0.6,
  }));

  // Collect paths already covered so catch-all doesn't duplicate them.
  const covered = new Set([
    ...staticRoutes.map((r) => new URL(r.url).pathname),
    ...detailRoutes.map((r) => new URL(r.url).pathname),
    ...postRoutes.map((r) => new URL(r.url).pathname),
  ]);

  const catchAllRoutes: MetadataRoute.Sitemap = allPagePaths
    .filter(
      (p) =>
        !covered.has(p) &&
        !REDIRECT_PATHS.has(p) &&
        !EXCLUDE_PREFIXES.some((ex) => p.startsWith(ex))
    )
    .map((p) => ({
      url: `${SITE}${p}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));

  return [...staticRoutes, ...detailRoutes, ...postRoutes, ...catchAllRoutes];
}
