import type { Metadata } from 'next';
import { Fraunces, DM_Sans } from 'next/font/google';
import './globals.css';

import { CustomCursor } from '@/components/custom-cursor';
import { DevServiceWorkerCleanup } from '@/components/dev-sw-cleanup';
import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';
import { SoundProvider } from '@/lib/sound';
import { SettingsProvider } from '@/lib/settings';
import { fetchGlobalSettings, fetchNavSections, fetchNav } from '@/lib/wp';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  axes: ['opsz', 'SOFT', 'WONK'],
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title:
    'Intervention — Compassionate, certified interventions for families | A Change Institute Brand',
  description:
    'Nation’s leading interventionists since 2003. Free, confidential consultation for addiction, mental health, and eating disorders. Available 24/7 nationwide.',
  openGraph: {
    title: 'Intervention — Help families find their way forward',
    description:
      'Compassionate, structured interventions for substance use, mental health, and behavioral challenges. Free consultation. Nationwide.',
    type: 'website',
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
      className={`${fraunces.variable} ${dmSans.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-white font-sans text-ink">
        <DevServiceWorkerCleanup />
        <SettingsProvider value={settings}>
          <SoundProvider>
            <CustomCursor />
            <Nav sections={navSections} menu={navMenu} />
            {children}
            <Footer />
          </SoundProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
