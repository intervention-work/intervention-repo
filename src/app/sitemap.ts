import type { MetadataRoute } from 'next';
import { fetchAllPageMeta, fetchAllPosts, fetchSection } from '@/lib/wp';
import { isSuppressedServicePath } from '@/lib/suppressed-services';
import { BLOG_PER_PAGE } from '@/components/blog-list';

export const revalidate = 3600;

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://intervention.com';

// Paths that redirect (verified 308 on the live site) or duplicate a canonical
// page. Pages that return 200 with a self canonical (/free-resources) are NOT
// listed here, so they reach the sitemap.
const REDIRECT_PATHS = new Set([
  '/about-us',
  '/about-us/faq',
  '/resources-3',
  '/resources-3/on-set-care-unit',
  '/resources-3/podcast',
  // Real WP page at the root, but the state grid links it under
  // /interventionists-by-state/georgia, so that is the one URL we list.
  '/georgia',
  '/intervention-help',
  '/intervention-help/thank-you',
  // Both consolidated into /intervention/drug-alcohol-intervention via Rank Math.
  '/intervention/drug-intervention',
  '/intervention/alcohol-intervention',
]);

// WP pages whose own path is not the URL we want indexed.
const PATH_REMAP: Record<string, string> = {
  '/georgia': '/interventionists-by-state/georgia',
};

// Retired pages must never be listed, whatever WP still returns for them.
const RETIRED = /early-autism|care-unit-assessment|on-set-care-unit/;

// Utility pages not worth indexing.
const EXCLUDE_PREFIXES = ['/thank-you', '/bist-registration', '/sitemap'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE}/`,                           changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${SITE}/intervention`,               changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE}/services`,                   changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE}/interventionists-by-state`,  changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE}/intervention-blog`,          changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${SITE}/contact`,                    changeFrequency: 'yearly',  priority: 0.8 },
    { url: `${SITE}/about-us`,                   changeFrequency: 'yearly',  priority: 0.7 },
    { url: `${SITE}/resources`,                  changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE}/insurance`,                  changeFrequency: 'yearly',  priority: 0.7 },
    { url: `${SITE}/family-class`,               changeFrequency: 'yearly',  priority: 0.6 },
  ];

  const [iSection, sSection, allPosts, allPageMeta] = await Promise.all([
    fetchSection('intervention'),
    fetchSection('services'),
    fetchAllPosts(),
    fetchAllPageMeta(),
  ]);
  const allPagePaths = allPageMeta.map((p) => p.path);
  // Real last-edited time per WP page; the dedupe below keeps the first entry
  // for each URL, so dates are attached to whichever entry wins.
  const modifiedByPath = new Map(
    allPageMeta.filter((p) => p.modified).map((p) => [p.path, new Date(p.modified as string)])
  );

  const detailRoutes: MetadataRoute.Sitemap = [
    ...(iSection?.children ?? []).map((c) => ({
      url: `${SITE}${c.navHrefOverride ?? `/intervention/${c.slug}`}`,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...(sSection?.children ?? []).map((c) => ({
      url: `${SITE}${c.navHrefOverride ?? `/services/${c.slug}`}`,
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

  // Paginated blog listing pages (2..N). Page 1 is already in staticRoutes as
  // /intervention-blog. These let Googlebot discover posts 13+ even if it
  // does not re-crawl page 1 after the pagination refactor.
  const blogTotalPages = Math.max(1, Math.ceil(allPosts.length / BLOG_PER_PAGE));
  const blogPaginationRoutes: MetadataRoute.Sitemap = Array.from(
    { length: Math.max(0, blogTotalPages - 1) },
    (_, i) => ({
      url: `${SITE}/intervention-blog/page/${i + 2}`,
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    }),
  );

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
        !isSuppressedServicePath(p) &&
        !EXCLUDE_PREFIXES.some((ex) => p.startsWith(ex))
    )
    .map((p) => ({
      url: `${SITE}${p}`,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));

  // Georgia is the one WP page whose own path is not the URL we want indexed.
  for (const [from, to] of Object.entries(PATH_REMAP)) {
    if (allPagePaths.includes(from)) {
      catchAllRoutes.push({ url: `${SITE}${to}`, changeFrequency: 'monthly', priority: 0.6 });
    }
  }

  // One entry per URL (the first wins: static routes carry the best priority)
  // and nothing retired, so the sitemap never lists a duplicate or dead page.
  const seen = new Set<string>();
  return [
    ...staticRoutes,
    ...detailRoutes,
    ...postRoutes,
    ...blogPaginationRoutes,
    ...catchAllRoutes,
  ].filter((e) => {
    const path = new URL(e.url).pathname.replace(/\/+$/, '') || '/';
    if (RETIRED.test(path) || seen.has(path)) return false;
    seen.add(path);
    return true;
  }).map((e) => {
    if (e.lastModified) return e;
    const path = new URL(e.url).pathname.replace(/\/+$/, '') || '/';
    const lm = modifiedByPath.get(path) ?? modifiedByPath.get(path.replace('/interventionists-by-state/georgia', '/georgia'));
    return lm ? { ...e, lastModified: lm } : e;
  });
}
