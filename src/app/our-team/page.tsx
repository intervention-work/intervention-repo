import type { Metadata } from 'next';
import { OurTeamContent } from './team-client';

export const metadata: Metadata = {
  title: 'Our Team — Intervention.com',
  description: "Meet the team behind America's leading intervention organization.",
};

export default function OurTeamPage() {
  return <OurTeamContent />;
}
