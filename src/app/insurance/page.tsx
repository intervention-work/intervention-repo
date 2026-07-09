import type { Metadata } from 'next';
import { ContentPage } from '@/components/content-page';

const IMAGE =
  'https://images.unsplash.com/photo-1500964757637-c85e8a162699?w=1600&q=85';

export const metadata: Metadata = {
  title: 'Cost & Insurance — Intervention.com',
  description:
    'Intervention is a fee-for-service offering starting at $500. Insurance does not cover the intervention itself, but most policies cover the mental health and addiction treatment that follows — and we help you verify it.',
};

export default function InsurancePage() {
  return (
    <ContentPage
      crumbs={[{ label: 'Home', href: '/' }, { label: 'Cost & Insurance' }]}
      eyebrow="Cost & coverage"
      title="Straightforward about cost."
      summary="Intervention is a fee-for-service offering starting at $500. The initial consultation is always free — and we help you verify coverage for the treatment that follows."
      image={IMAGE}
      intro="We believe families deserve clarity from the very first call. Here is how cost and coverage actually work, in plain terms, so you can make decisions with complete information."
      blocks={[
        {
          heading: 'How intervention is priced',
          body: 'Intervention is not funded by city, state, or national organizations. It is a fee-for-service offering starting at $500, and we discuss cost openly on the first call — before any commitment.',
        },
        {
          heading: 'What insurance does and doesn’t cover',
          body: 'Insurance does not cover intervention services. However, most insurance policies offer coverage for the treatment of mental health and substance use — the care your loved one enters after the intervention.',
        },
        {
          heading: 'We help you verify treatment coverage',
          body: 'Share your insurance details with a specialist and we’ll help you understand your benefits for treatment placement, so cost is never the reason a family delays getting help.',
        },
      ]}
    />
  );
}
