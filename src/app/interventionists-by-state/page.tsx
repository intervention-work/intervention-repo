import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/page-hero';
import { CtaBanner } from '@/components/cta-banner';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Interventionists By State — Intervention.com',
  description:
    'Find a certified interventionist near you. We work with intervention specialists across all states in the USA and Canada.',
};

const STATES = [
  { slug: 'california', label: 'California' },
  { slug: 'colorado', label: 'Colorado' },
  { slug: 'connecticut', label: 'Connecticut' },
  { slug: 'florida', label: 'Florida' },
  { slug: 'georgia', label: 'Georgia' },
  { slug: 'illinois', label: 'Illinois' },
  { slug: 'iowa', label: 'Iowa' },
  { slug: 'kansas', label: 'Kansas' },
  { slug: 'maine', label: 'Maine' },
  { slug: 'massachusetts', label: 'Massachusetts' },
  { slug: 'michigan', label: 'Michigan' },
  { slug: 'minnesota', label: 'Minnesota' },
  { slug: 'missouri', label: 'Missouri' },
  { slug: 'new-jersey', label: 'New Jersey' },
  { slug: 'new-york', label: 'New York' },
  { slug: 'pennsylvania', label: 'Pennsylvania' },
  { slug: 'tennessee', label: 'Tennessee' },
  { slug: 'washington', label: 'Washington' },
  { slug: 'washington-dc', label: 'Washington D.C.' },
  { slug: 'wisconsin', label: 'Wisconsin' },
];

export default function InterventionistsByStatePage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Interventionists By State' }]}
        eyebrow="Find an Interventionist Near You"
        title="Intervention Locator"
        summary="Are you looking to hire an interventionist? We work with interventionists across all states in the USA and Canada. Our team is dedicated to connecting you with experienced professionals who can assist your loved one in finding the help they need."
      />

      <section className="mx-auto max-w-5xl px-5 py-16 md:px-7 lg:px-9">
        <div className="mb-10">
          <p className="font-sans text-lg text-ink-body">
            Select your state below to find certified intervention specialists in your area.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {STATES.map((state) => (
            <Link
              key={state.slug}
              href={`/interventionists-by-state/${state.slug}`}
              className="rounded-xl border border-border bg-white px-4 py-3.5 font-sans text-sm text-ink transition-colors duration-150 hover:border-sage-300 hover:bg-sage-50 hover:text-sage-700"
            >
              {state.label}
            </Link>
          ))}
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
