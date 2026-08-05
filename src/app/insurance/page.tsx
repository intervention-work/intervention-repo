import type { Metadata } from 'next';
import { ContentPage } from '@/components/content-page';
import { fetchSection, fetchPageBody, fetchSeo } from '@/lib/wp';
import { buildMetadata } from '@/lib/seo';
import { mapWp } from '@/lib/wp-parse';

const SLUG = 'insurance';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const section = await fetchSection(SLUG);
  if (!section) return {};
  const seo = await fetchSeo('page', section.sourcePageSlug ?? SLUG);
  return buildMetadata({
    title: `${section.label} — Intervention.com`,
    description: section.summary,
    canonicalPath: `/${SLUG}`,
    image: section.image,
    seo,
  });
}

export default async function InsurancePage() {
  const section = await fetchSection(SLUG);
  if (!section) return null;
  const raw = await fetchPageBody(section.sourcePageSlug ?? SLUG);
  const { blocks, sidebar } = mapWp(raw, {
    title: section.title,
    summary: section.intro || section.summary,
  });
  return (
    <ContentPage
      crumbs={[{ label: 'Home', href: '/' }, { label: section.label }]}
      eyebrow={section.eyebrow}
      title={section.title}
      summary={section.summary}
      image={section.image}
      intro={section.intro}
      blocks={section.blocks}
      bodyBlocks={blocks}
      sidebar={sidebar}
    />
  );
}
