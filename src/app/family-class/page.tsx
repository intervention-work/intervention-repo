import type { Metadata } from 'next';
import { ContentPage } from '@/components/content-page';

const IMAGE =
  'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=1600&q=85';

export const metadata: Metadata = {
  title: 'Family Class — Intervention.com',
  description:
    'A guided class that helps families understand addiction and mental health, and learn how to support recovery without losing themselves.',
};

export default function FamilyClassPage() {
  return (
    <ContentPage
      crumbs={[{ label: 'Home', href: '/' }, { label: 'Family Class' }]}
      eyebrow="For families"
      title="Family Class"
      summary="Recovery is a family project. Our guided class helps you understand what your loved one is facing — and how to support them without losing yourself."
      image={IMAGE}
      intro="When one person struggles, the whole family carries it. Family Class gives you the language, tools, and community to move from reacting in crisis to responding with clarity and confidence."
      blocks={[
        {
          heading: 'What you’ll learn',
          body: 'The dynamics of addiction and mental illness, how to set boundaries with love, how to communicate without escalating, and how to take care of your own wellbeing through the process.',
        },
        {
          heading: 'How it works',
          body: 'Sessions are led by experienced clinicians and interventionists, in a supportive group setting. You’ll leave each class with practical steps you can use immediately.',
        },
        {
          heading: 'Who it’s for',
          body: 'Parents, partners, siblings, and anyone who loves someone in crisis — whether or not an intervention is part of your path.',
        },
      ]}
    />
  );
}
