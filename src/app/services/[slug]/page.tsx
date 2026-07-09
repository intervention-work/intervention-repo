import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DetailPage } from '@/components/detail-page';
import { getSection, getDetail } from '@/content/site';

const SECTION_SLUG = 'services';

export function generateStaticParams() {
  return (getSection(SECTION_SLUG)?.children ?? []).map((c) => ({
    slug: c.slug,
  }));
}

export async function generateMetadata(
  props: PageProps<'/services/[slug]'>
): Promise<Metadata> {
  const { slug } = await props.params;
  const found = getDetail(SECTION_SLUG, slug);
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
  const found = getDetail(SECTION_SLUG, slug);
  if (!found) notFound();
  return <DetailPage section={found.section} detail={found.detail} />;
}
