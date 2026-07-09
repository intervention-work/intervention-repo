import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DetailPage } from '@/components/detail-page';
import { fetchSection, fetchDetail } from '@/lib/wp';

const SECTION_SLUG = 'intervention';

export const revalidate = 3600;

export async function generateStaticParams() {
  const section = await fetchSection(SECTION_SLUG);
  return (section?.children ?? []).map((c) => ({ slug: c.slug }));
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
  if (!found) notFound();
  return <DetailPage section={found.section} detail={found.detail} />;
}
