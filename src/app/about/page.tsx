import type { Metadata } from 'next';
import { ContentPage } from '@/components/content-page';

const IMAGE =
  'https://images.unsplash.com/photo-1490604001847-b712b0c2f967?w=1600&q=85';

export const metadata: Metadata = {
  title: 'About Us — Intervention.com',
  description:
    'Founded by Brad Lamm and a service of Change Institute — the team that has trained the majority of the nation’s leading interventionists.',
};

export default function AboutPage() {
  return (
    <ContentPage
      crumbs={[{ label: 'Home', href: '/' }, { label: 'About' }]}
      eyebrow="About us"
      title="The nation’s best — beside families since 2003."
      summary="A service of Change Institute, founded by Brad Lamm — the team that has trained the majority of the country’s leading interventionists."
      image={IMAGE}
      intro="Intervention.com exists on a simple belief: that families are the most powerful force in a loved one’s recovery. We bring structure, compassion, and clinical judgment to the moments families dread most — and a clear path toward help."
      blocks={[
        {
          heading: 'Meet Brad Lamm, our founder',
          body: 'Brad began his own recovery journey in 2003 from drugs, bulimia, nicotine, and alcohol. What looked like an impossible challenge became proof that even the most difficult cases can not only recover, but thrive. Through his clinical intervention training events, Brad has trained the majority of the nation’s leading interventionists, served on the board of the Association of Intervention Specialists, and worked at the state level to bring treatment options to communities.',
        },
        {
          heading: 'The BreakFree method',
          body: 'We favor our proprietary method, BreakFree Intervention — a family-focused approach designed around the people in the room rather than a fixed script. We also draw on Kathleen Murphy’s action-method approach, which uses role play to prepare families for the conversation ahead.',
        },
        {
          heading: 'A service of Change Institute',
          body: 'Intervention.com is a Change Institute service. We answer every call within the hour, 24 hours a day, and stay with families long after the meeting ends — mapping next steps, coordinating treatment, and supporting recovery for the long road.',
        },
      ]}
    />
  );
}
