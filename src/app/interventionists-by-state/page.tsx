import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Phone } from 'lucide-react';
import { fetchDetail, fetchPageBody, fetchSectionHeroImage } from '@/lib/wp';
import { mapWp, splitLead } from '@/lib/wp-parse';
import { PageHero } from '@/components/page-hero';
import { WpContent } from '@/components/wp-content';
import { CtaBanner } from '@/components/cta-banner';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const data = await fetchDetail('intervention', 'interventionists-by-state');
  if (!data) return { title: 'Interventionists By State — Intervention.com' };
  return {
    title: `${data.detail.label} — Intervention.com`,
    description: data.detail.summary,
  };
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

function HelpRail() {
  return (
    <div className="rounded-2xl border border-border bg-white p-6">
      <p className="font-sans text-xs font-semibold tracking-[0.22em] uppercase text-sage-500">
        Free consultation
      </p>
      <a
        href="tel:+18007891605"
        className="mt-3 flex items-center gap-2 font-display text-2xl leading-tight text-ink transition-colors duration-200 hover:text-sage-700"
      >
        <Phone size={16} strokeWidth={1.75} className="shrink-0 text-sage-500" />
        (800) 789-1605
      </a>
      <p className="mt-3 font-sans text-sm leading-relaxed text-ink-muted">
        No pressure, no obligation.
      </p>
      <Link
        href="/contact"
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-sage-700 px-5 py-3 font-sans text-sm font-medium text-white transition-[background-color,transform] duration-200 ease-expo-out hover:bg-sage-900 active:scale-[0.97]"
      >
        Talk to a specialist
        <ArrowRight size={15} strokeWidth={1.75} />
      </Link>
      <p className="mt-4 font-sans text-[13px] tracking-wide text-ink-muted">
        Available 24/7 · Fully confidential
      </p>
    </div>
  );
}
