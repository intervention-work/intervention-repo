import type { Metadata } from 'next';
import { ContactView } from '@/components/contact-view';

export const metadata: Metadata = {
  title: 'Contact Us — Intervention.com',
  description:
    'Reach a certified specialist now. Free, confidential, and available 24/7 nationwide.',
};

export default function ContactPage() {
  return <ContactView />;
}
