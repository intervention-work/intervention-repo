import type { Metadata } from 'next';
import { SectionLanding } from '@/components/section-landing';
import { StateGrid } from '@/components/state-grid';
import { fetchSection, fetchPageBody, fetchSeo } from '@/lib/wp';
import { mapWp, splitLead } from '@/lib/wp-parse';
import { buildMetadata } from '@/lib/seo';
import { heroForSection } from '@/lib/hero-images';

export const revalidate = 3600;

// Used only when neither Rank Math nor the WP section summary has a value.
const FALLBACK_DESCRIPTION =
  'Professional intervention for drug and alcohol use, eating disorders, mental health crises and complex trauma, available to families in all 50 states.';

export async function generateMetadata(): Promise<Metadata> {
  const section = await fetchSection('intervention');
  if (!section) return {};
  const seo = await fetchSeo('page', section.sourcePageSlug ?? 'intervention');
  return buildMetadata({
    title: `${section.label} — Intervention.com`,
    description: section.summary || FALLBACK_DESCRIPTION,
    seo: { description: seo?.description, ogDescription: seo?.ogDescription },
    canonicalPath: '/intervention',
    image: section.image,
  });
}

export default async function InterventionPage() {
  const section = await fetchSection('intervention');
  if (!section) return null;
  const raw = await fetchPageBody(section.sourcePageSlug ?? 'intervention');
  const { blocks } = mapWp(raw, { title: section.title, summary: section.summary });
  const lead = splitLead(blocks);
  const { actions, rest } = lead.media ? { actions: [], rest: blocks } : lead;
  return (
    <SectionLanding
      section={section}
      bodyBlocks={rest}
      heroActions={actions}
      heroImage={heroForSection('intervention')}
      cardsFirst
      cardExclude={['interventionists-by-state']}
      afterCards={<StateGrid />}
    />
  );
}
