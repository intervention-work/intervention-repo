import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SectionLanding } from '@/components/section-landing';
import { PageHero } from '@/components/page-hero';
import { CtaBanner } from '@/components/cta-banner';
import { fetchSection, fetchPageBody } from '@/lib/wp';
import { mapWp } from '@/lib/wp-parse';
import { buildMetadata } from '@/lib/seo';
import { heroForSection } from '@/lib/hero-images';

const STATIC_SERVICES = [
  { label: 'Concierge Assessment (CARE)', href: '/services/care-unit-assessment', summary: 'A comprehensive assessment to identify the right care path for your loved one.' },
  { label: 'Breakfree Journey', href: '/services/breakfree-journey', summary: 'A structured program combining intervention with long-term family recovery support.' },
  { label: 'Recovery Coach Companion', href: '/services/recovery-coach-companion', summary: 'One-on-one coaching for individuals in active recovery.' },
  { label: 'Recovery Case Management', href: '/services/recovery-care-management', summary: 'Coordinated care management for sustained, long-term recovery.' },
  { label: 'Senior Support Services', href: '/services/senior-support-services', summary: 'Specialized support for older adults and their families navigating addiction or mental health challenges.' },
  { label: 'On Set Care Unit', href: '/services/on-set-care-unit', summary: 'Dedicated support services for entertainment industry professionals.' },
];

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

function StaticServicesFallback() {
  return (
    <main>
      <PageHero
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Additional Services' }]}
        eyebrow="Additional Services"
        title="Comprehensive support for every stage of recovery."
        summary="Beyond intervention, we offer a range of specialized services to support individuals and families through recovery and beyond."
        image={heroForSection('services')}
      />
      <section className="bg-surface py-24 lg:py-32">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {STATIC_SERVICES.map((svc) => (
              <Link
                key={svc.href}
                href={svc.href}
                className="group flex flex-col rounded-2xl border border-border bg-white p-6 transition-shadow duration-300 hover:shadow-[0_24px_60px_-32px_rgba(17,24,39,0.25)]"
              >
                <h3 className="font-display text-xl leading-snug text-ink transition-colors duration-200 group-hover:text-sage-700">
                  {svc.label}
                </h3>
                <p className="mt-3 flex-1 font-sans text-sm leading-relaxed text-ink-muted">
                  {svc.summary}
                </p>
                <span className="mt-5 inline-flex items-center gap-1.5 font-sans text-sm font-medium text-sage-500">
                  Learn more
                  <ArrowRight size={14} strokeWidth={1.75} className="transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <CtaBanner />
    </main>
  );
}

export default async function ServicesPage() {
  const section = await fetchSection('services');
  if (!section || section.children.length === 0) return <StaticServicesFallback />;
  const raw = await fetchPageBody(section.sourcePageSlug ?? 'services');
  const { blocks } = mapWp(raw, { title: section.title, summary: section.summary });
  return <SectionLanding section={section} bodyBlocks={blocks} heroImage={heroForSection('services')} />;
}
