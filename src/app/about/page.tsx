import type { Metadata } from 'next';
import { ContentPage } from '@/components/content-page';
import { fetchSection } from '@/lib/wp';

const SLUG = 'about';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const section = await fetchSection(SLUG);
  if (!section) return {};
  return {
    title: `${section.label} — Intervention.com`,
    description: section.summary,
  };
}

export default async function AboutPage() {
  const section = await fetchSection(SLUG);
  if (!section) return null;
  return (
    <ContentPage
      crumbs={[{ label: 'Home', href: '/' }, { label: section.label }]}
      eyebrow={section.eyebrow}
      title={section.title}
      summary={section.summary}
      image={section.image}
      intro={section.intro}
      blocks={section.blocks}
    />
  );
}
