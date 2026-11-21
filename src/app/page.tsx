import type { Metadata } from 'next';
import { Hero } from '@/components/hero';
import { MediaStrip } from '@/components/media-strip';
import { WhatIsInterventionist } from '@/components/what-is-interventionist';
import { WhoNeeds } from '@/components/who-needs';
import { Specialties } from '@/components/services';
import { BradLamm } from '@/components/brad-lamm';
import { HowItWorks } from '@/components/how-it-works';
import { TrustedBy } from '@/components/trusted-by';
import { Certifications } from '@/components/certifications';
import { Testimonials } from '@/components/testimonials';
import { Faq } from '@/components/faq';
import { CtaBanner } from '@/components/cta-banner';
import { JsonLd } from '@/components/json-ld';
import { HOME_FAQ_CATEGORIES } from '@/lib/home-faq';
import { faqSchema } from '@/lib/seo';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

export default function Home() {
  const faq = faqSchema(HOME_FAQ_CATEGORIES.flatMap((c) => c.items));
  return (
    <main>
      {faq && <JsonLd data={faq} />}
      <Hero />
      <MediaStrip />
      <WhatIsInterventionist />
      <WhoNeeds />
      <Specialties />
      <BradLamm />
      <HowItWorks />
      <TrustedBy />
      <Certifications />
      <Testimonials />
      <Faq />
      <CtaBanner tight />
    </main>
  );
}
