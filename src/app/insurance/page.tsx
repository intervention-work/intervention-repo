import type { Metadata } from 'next';
import { ContentPage } from '@/components/content-page';
import { fetchSection, fetchPageBody, mapWpContent } from '@/lib/wp';

const SLUG = 'insurance';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const section = await fetchSection(SLUG);
  if (!section) return {};
  return {
    title: `${section.label} — Intervention.com`,
    description: section.summary,
  };
}

export default async function InsurancePage() {
  const section = await fetchSection(SLUG);
  if (!section) return null;
  const raw = await fetchPageBody(section.sourcePageSlug ?? SLUG);
  const { body } = mapWpContent(raw, {
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
      body={body}
    />
  );
}
