import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Phone } from 'lucide-react';
import { PageHero } from '@/components/page-hero';
import { WpContent } from '@/components/wp-content';
import { CtaBanner } from '@/components/cta-banner';
import { fetchSection, fetchPageBody, fetchSeo } from '@/lib/wp';
import { heroForSection } from '@/lib/hero-images';
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
  const { blocks } = mapWp(raw, {
    title: section.title,
    summary: section.intro || section.summary,
  });

  return (
    <main>
      <PageHero
        crumbs={[
          { label: 'Home', href: '/' },
          { label: 'Resources', href: '/resources' },
          { label: section.label },
        ]}
        eyebrow={section.eyebrow || 'Resources'}
        title={section.title}
        summary={section.summary}
        image={section.image || heroForSection(SLUG)}
      />

      <section className="mx-auto max-w-[1200px] px-6 py-20 lg:py-28">
        <WpContent
          blocks={blocks}
          rail={<InsuranceRail />}
          editorial
        />
      </section>

      <CtaBanner />
    </main>
  );
}

function InsuranceRail() {
  return (
    <div className="rounded-2xl border border-border bg-white p-6">
      <p className="font-sans text-xs font-semibold tracking-[0.22em] uppercase text-sage-500">
        Free consultation
      </p>
      <p className="mt-3 font-display text-xl leading-snug text-ink">
        Questions about coverage?
      </p>
      <p className="mt-3 font-sans text-sm leading-relaxed text-ink-muted">
        Our specialists can walk you through your options. No pressure, no obligation.
      </p>
      <a
        href="tel:+18007891605"
        className="mt-4 flex items-center gap-2 font-sans text-base font-medium text-ink transition-colors duration-200 hover:text-sage-700"
      >
        <Phone size={15} strokeWidth={1.75} className="shrink-0 text-sage-500" />
        (800) 789-1605
      </a>
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
