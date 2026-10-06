import type { Metadata } from 'next';
import { fetchDetail, fetchPageBody, fetchSectionHeroImage, fetchDetailSeo } from '@/lib/wp';
import { buildMetadata } from '@/lib/seo';
import { mapWp, splitLead } from '@/lib/wp-parse';
import { PageHero } from '@/components/page-hero';
import { WpContent } from '@/components/wp-content';
import { CtaBanner } from '@/components/cta-banner';
import { HelpRail } from '@/components/help-rail';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const data = await fetchDetail('intervention', 'interventionists-by-state');
  if (!data) return { title: 'Interventionists By State | Intervention.com' };
  const seo = await fetchDetailSeo(data.detail.sourcePageSlug ?? 'interventionists-by-state');
  return buildMetadata({
    title: `${data.detail.label} | Intervention.com`,
    description: data.detail.summary,
    canonicalPath: '/interventionists-by-state',
    image: data.detail.image,
    seo,
  });
}

export default async function InterventionistsByStatePage() {
  // This page is an intervention detail page (routed at its own URL via a nav
  // override), so it shares the uniform intervention hero background.
  const [data, heroImage] = await Promise.all([
    fetchDetail('intervention', 'interventionists-by-state'),
    fetchSectionHeroImage('intervention'),
  ]);
  const detail = data?.detail;
  const raw = await fetchPageBody(
    detail?.sourcePageSlug ?? 'interventionists-by-state'
  );
  const mapped = mapWp(raw, {
    title: detail?.title,
    summary: detail?.intro ?? detail?.summary,
  });
  // WP opens this page with two loose CTAs wrapped around the coverage map,
  // before any heading. Give them a home instead of leaving them stranded.
  const lead = splitLead(mapped.blocks);

  return (
    <>
      <PageHero
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Interventionists By State' }]}
        eyebrow={mapped.eyebrow || 'Find an Interventionist Near You'}
        title={detail?.title ?? mapped.title ?? 'Intervention Locator'}
        summary={detail?.intro ?? detail?.summary ?? mapped.summary}
        image={heroImage}
        actions={lead.actions}
      />

      {lead.rest.length > 0 && (
        <section className="mx-auto max-w-[1200px] px-6 py-20 lg:py-28">
          <WpContent
            blocks={lead.rest}
            leadMedia={lead.media}
            rail={<HelpRail />}
            editorial
          />
        </section>
      )}

      <CtaBanner />
    </>
  );
}

