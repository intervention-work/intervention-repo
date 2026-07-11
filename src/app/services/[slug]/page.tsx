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
  mapWpContent,
} from '@/lib/wp';

const SECTION_SLUG = 'services';

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const section = await fetchSection(SECTION_SLUG);
  return (section?.children ?? []).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata(
  props: PageProps<'/services/[slug]'>
): Promise<Metadata> {
  const { slug } = await props.params;
  const found = await fetchDetail(SECTION_SLUG, slug);
  if (!found) return {};
  return {
    title: `${found.detail.title} — Intervention.com`,
    description: found.detail.summary,
  };
}

export default async function ServicesDetailPage(
  props: PageProps<'/services/[slug]'>
) {
  const { slug } = await props.params;
  const found = await fetchDetail(SECTION_SLUG, slug);

  if (found) {
    const raw = await fetchPageBody(found.detail.sourcePageSlug ?? found.detail.slug);
    const { body } = mapWpContent(raw, {
      title: found.detail.title,
      summary: found.detail.intro || found.detail.summary,
    });
    return <DetailPage section={found.section} detail={found.detail} body={body} />;
  }

  const entry = (await fetchWpPage(slug)) ?? (await fetchWpPost(slug));
  if (!entry) notFound();
  const mapped = mapWpContent(entry.body);
  return (
    <ContentPage
      crumbs={[
        { label: 'Home', href: '/' },
        { label: 'Services', href: '/services' },
        { label: mapped.title || entry.title },
      ]}
      eyebrow={mapped.eyebrow || 'Services'}
      title={mapped.title || entry.title}
      summary={mapped.summary || undefined}
      body={mapped.body}
    />
  );
}
