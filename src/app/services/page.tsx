import type { Metadata } from 'next';
import { SectionLanding } from '@/components/section-landing';
import { fetchSection, fetchPageBody } from '@/lib/wp';
import { mapWp } from '@/lib/wp-parse';
import { buildMetadata } from '@/lib/seo';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const section = await fetchSection('services');
  if (!section) return {};
  return buildMetadata({
    title: `${section.label} — Intervention.com`,
    description: section.summary,
    canonicalPath: '/services',
    image: section.image,
  });
}

export default async function ServicesPage() {
  const section = await fetchSection('services');
  if (!section) return null;
  const raw = await fetchPageBody(section.sourcePageSlug ?? 'services');
  const { blocks } = mapWp(raw, { title: section.title, summary: section.summary });
  return <SectionLanding section={section} bodyBlocks={blocks} />;
}
