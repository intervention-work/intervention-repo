import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ContentPage } from '@/components/content-page';
import { JsonLd } from '@/components/json-ld';
import { fetchWpPage, fetchWpPost, fetchLeafDetail } from '@/lib/wp';
import { buildMetadata, articleSchema, breadcrumbSchema, SITE } from '@/lib/seo';
import { heroForSection, HERO_DEFAULT } from '@/lib/hero-images';
import { mapWp } from '@/lib/wp-parse';

export const revalidate = 3600;
// Long-tail WP pages/posts render on first request and are then cached (ISR),
// so the build doesn't have to prerender 90+ pages in one rate-limited burst.
export const dynamicParams = true;

// Curated routes (/about, /intervention, /services, /intervention/[slug], the
// blog index, etc.) are matched by Next before this catch-all, so they always
// win — the catch-all only handles the remaining WP pages/posts.
//
// Prerender nothing at build time — every WP page/post is generated on first
// request and cached via ISR. This keeps builds fast and avoids hammering WP.
// New WP content appears automatically without a redeploy.
export function generateStaticParams() {
  return [];
}

function titleize(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// Try a WP page first, then a WP post (blog articles live under /intervention-blog).
async function loadEntry(leaf: string) {
  return (await fetchWpPage(leaf)) ?? (await fetchWpPost(leaf));
}

export async function generateMetadata(
  props: PageProps<'/[...slug]'>
): Promise<Metadata> {
  const { slug } = await props.params;
  const page = await loadEntry(slug[slug.length - 1]);
  if (!page) return {};
  const isPost = page.type === 'post';
  return buildMetadata({
    title: `${page.title} — Intervention.com`,
    description: page.excerpt || undefined,
    canonicalPath: `/${slug.join('/')}`,
    image: page.image,
    type: isPost ? 'article' : 'website',
    publishedTime: page.date,
    modifiedTime: page.modified,
    seo: page.seo,
  });
}

export default async function CatchAllWpPage(props: PageProps<'/[...slug]'>) {
  const { slug } = await props.params;
  const leaf = slug[slug.length - 1];
  // Fetch the WP page/post and the matching detail_page record (if this slug
  // belongs to a services/intervention detail page linked at root level via a
  // nav URL override). Both calls hit fetchSection which is deduplicated.
  const [page, leafDetail] = await Promise.all([
    loadEntry(leaf),
    fetchLeafDetail(leaf),
  ]);
  if (!page && !leafDetail) notFound();

  // Hero image: section image for detail pages, post featured image for blog
  // posts, neutral default for all other pages.
  const isPostType = page?.type === 'post';
  const heroImage = leafDetail
    ? heroForSection(leafDetail.section.slug)
    : isPostType ? page?.image ?? HERO_DEFAULT : HERO_DEFAULT;

  // For detail pages reached via nav URL override (e.g. /care-unit-assessment),
  // the ACF label/title/summary from the detail_page CPT is the authoritative
  // source of truth. The WP page title is often stale; the detail_page record
  // is what editors update via the WP Admin ACF panel.
  const detailLabel = leafDetail?.detail.label || leafDetail?.detail.title || undefined;
  const detailSummary = leafDetail?.detail.summary || leafDetail?.detail.intro || undefined;

  // Map the raw WP content into hero + body (removes the duplicated opening).
  // Pass ACF-driven title/summary so matching intro blocks are stripped and
  // the hero shows the correct up-to-date data.
  const mapped = mapWp(page?.body ?? '', {
    title: detailLabel || undefined,
    summary: detailSummary || page?.acfSummary || undefined,
  });
  const heroTitle = mapped.title || page?.title || titleize(leaf);

  const crumbs = [
    { label: 'Home', href: '/' },
    ...slug.slice(0, -1).map((seg, i) => ({
      label: titleize(seg),
      href: '/' + slug.slice(0, i + 1).join('/'),
    })),
    { label: heroTitle },
  ];

  const url = `${SITE}/${slug.join('/')}`;
  const schema: object[] = [
    breadcrumbSchema(crumbs.map((c) => ({ name: c.label, path: c.href }))),
  ];
  if (isPostType && page) {
    schema.push(
      articleSchema({
        title: page.title,
        description: page.excerpt,
        url,
        image: page.image,
        publishedTime: page.date,
        modifiedTime: page.modified,
        author: page.author,
      })
    );
  }

  return (
    <>
      <JsonLd data={schema} />
      <ContentPage
        crumbs={crumbs}
        eyebrow={mapped.eyebrow || undefined}
        title={heroTitle}
        summary={mapped.summary || undefined}
        image={heroImage}
        bodyBlocks={mapped.blocks}
        sidebar={mapped.sidebar}
      />
    </>
  );
}
