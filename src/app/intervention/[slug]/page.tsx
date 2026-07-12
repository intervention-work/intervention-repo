import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DetailPage } from '@/components/detail-page';
import { ContentPage } from '@/components/content-page';
import {
  fetchSection,
  fetchDetail,
  fetchPageBody,
  fetchWpPage,
  fetchWpPost,
} from '@/lib/wp';
import { mapWp } from '@/lib/wp-parse';

const SECTION_SLUG = 'intervention';

export const revalidate = 3600;
// Slugs not in the CPT set (e.g. the WP menu links /intervention/eating-disorder)
// still render on-demand via the WP-page fallback below.
export const dynamicParams = true;

export async function generateStaticParams() {
  const section = await fetchSection(SECTION_SLUG);
  // Skip children with a nav URL override — they render at their own route
  // (e.g. /interventionists-by-state), not under /intervention/[slug].
  return (section?.children ?? [])
    .filter((c) => !c.navHrefOverride)
    .map((c) => ({ slug: c.slug }));
}

export async function generateMetadata(
  props: PageProps<'/intervention/[slug]'>
): Promise<Metadata> {
  const { slug } = await props.params;
  const found = await fetchDetail(SECTION_SLUG, slug);
  if (!found) return {};
  return {
    title: `${found.detail.title} — Intervention.com`,
    description: found.detail.summary,
  };
}

export default async function InterventionDetailPage(
  props: PageProps<'/intervention/[slug]'>
) {
  const { slug } = await props.params;
  const found = await fetchDetail(SECTION_SLUG, slug);

  // Curated CPT detail page (rich DetailPage layout).
  if (found) {
    const raw = await fetchPageBody(found.detail.sourcePageSlug ?? found.detail.slug);
    const { blocks } = mapWp(raw, {
      title: found.detail.title,
      summary: found.detail.intro || found.detail.summary,
    });
    return <DetailPage section={found.section} detail={found.detail} bodyBlocks={blocks} />;
  }

  // Fallback: a plain WP page/post at this path (e.g. /intervention/eating-disorder
  // that the WP menu links to). Render its real content in the new design.
  const entry = (await fetchWpPage(slug)) ?? (await fetchWpPost(slug));
  if (!entry) notFound();
  const mapped = mapWp(entry.body);
  return (
    <ContentPage
      crumbs={[
        { label: 'Home', href: '/' },
        { label: 'Intervention', href: '/intervention' },
        { label: mapped.title || entry.title },
      ]}
      eyebrow={mapped.eyebrow || 'Intervention'}
      title={mapped.title || entry.title}
      summary={mapped.summary || undefined}
      bodyBlocks={mapped.blocks}
    />
  );
}
