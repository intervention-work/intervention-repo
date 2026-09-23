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

export default function Home() {
  return (
    <main>
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
