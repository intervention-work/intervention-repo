import type { Metadata } from 'next';
import { SectionLanding } from '@/components/section-landing';
import { fetchSection, fetchPageBody, fetchSeo } from '@/lib/wp';
import { mapWp, splitLead } from '@/lib/wp-parse';
import { buildMetadata } from '@/lib/seo';
import { heroForSection } from '@/lib/hero-images';

export const revalidate = 3600;

// Used only when neither Rank Math nor the WP section summary has a value.
const FALLBACK_DESCRIPTION =
  "Free resources for families: get Brad Lamm's ebook How to Help Someone You Love and read the research behind the invitational ARISE intervention model.";

export async function generateMetadata(): Promise<Metadata> {
  const section = await fetchSection('resources');
  if (!section) return {};
  const seo = await fetchSeo('page', section.sourcePageSlug ?? 'resources');
  return buildMetadata({
    title: `${section.label} — Intervention.com`,
    description: section.summary || FALLBACK_DESCRIPTION,
    seo: { description: seo?.description, ogDescription: seo?.ogDescription },
    canonicalPath: '/resources',
    image: section.image,
  });
}

export default async function ResourcesPage() {
  const section = await fetchSection('resources');
  if (!section) return null;
  const raw = await fetchPageBody(section.sourcePageSlug ?? 'resources');
  const { blocks } = mapWp(raw, { title: section.title, summary: section.summary });
  const lead = splitLead(blocks);
  const { actions, rest } = lead.media ? { actions: [], rest: blocks } : lead;
  return (
    <SectionLanding
      section={section}
      bodyBlocks={rest}
      heroActions={actions}
      heroImage={heroForSection('resources')}
    />
  );
}
