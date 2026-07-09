import type { Metadata } from 'next';
import { SectionLanding } from '@/components/section-landing';
import { getSection } from '@/content/site';

const section = getSection('intervention')!;

export const metadata: Metadata = {
  title: `${section.label} — Intervention.com`,
  description: section.summary,
};

export default function InterventionPage() {
  return <SectionLanding section={section} />;
}
