import { Hero } from '@/components/hero';
import { MediaStrip } from '@/components/media-strip';
import { Specialties } from '@/components/services';
import { HowItWorks } from '@/components/how-it-works';
import { TrustedBy } from '@/components/trusted-by';
import { Testimonials } from '@/components/testimonials';
import { Faq } from '@/components/faq';
import { CtaBanner } from '@/components/cta-banner';

export default function Home() {
  return (
    <main>
      <Hero />
      <MediaStrip />
      <Specialties />
      <HowItWorks />
      <TrustedBy />
      <Testimonials />
      <Faq />
      <CtaBanner />
    </main>
  );
}
