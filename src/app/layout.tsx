import type { Metadata } from 'next';
import { Source_Serif_4, DM_Sans } from 'next/font/google';
import './globals.css';

import { DevServiceWorkerCleanup } from '@/components/dev-sw-cleanup';
import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';
import { JsonLd } from '@/components/json-ld';
import { SettingsProvider } from '@/lib/settings';
import { fetchGlobalSettings, fetchNavSections, fetchNav } from '@/lib/wp';
import { organizationSchema, websiteSchema } from '@/lib/seo';

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-serif-display',
  display: 'swap',
  axes: ['opsz'],
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://intervention.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: "Intervention — Compassionate, certified interventions for families | A Change Institute Brand",
  description: "Nation’s leading interventionists since 2003. Free, confidential consultation for addiction, mental health, and eating disorders. Available 24/7 nationwide.",
  alternates: { canonical: '/' },
  openGraph: {
    title: "Intervention — Help families find their way forward",
    description: "Compassionate, structured interventions for substance use, mental health, and behavioral challenges. Free consultation. Nationwide.",
    type: 'website',
    siteName: 'Intervention.com',
    images: [{ url: `${SITE}/images/hero-v2-poster.jpg` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Intervention — Help families find their way forward",
    description: "Compassionate, structured interventions for substance use, mental health, and behavioral challenges. Free consultation. Nationwide.",
    images: [`${SITE}/images/hero-v2-poster.jpg`],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [settings, navSections, navMenu] = await Promise.all([
    fetchGlobalSettings(),
    fetchNavSections(['intervention', 'services']),
    fetchNav(),
  ]);

  return (
    <html
      lang="en"
      className={`${sourceSerif.variable} ${dmSans.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-white font-sans text-ink">
        <JsonLd data={[organizationSchema(), websiteSchema()]} />
        <DevServiceWorkerCleanup />
        <SettingsProvider value={settings}>
          <Nav sections={navSections} menu={navMenu} />
          {children}
          <Footer />
        </SettingsProvider>
      </body>
    </html>
  );
}
