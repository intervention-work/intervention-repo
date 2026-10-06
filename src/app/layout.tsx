import type { Metadata } from 'next';
import { DM_Serif_Display, DM_Sans } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

import { DevServiceWorkerCleanup } from '@/components/dev-sw-cleanup';
import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';
import { JsonLd } from '@/components/json-ld';
import { SettingsProvider } from '@/lib/settings';
import { fetchGlobalSettings, fetchNavSections, fetchNav } from '@/lib/wp';
import { organizationSchema, websiteSchema } from '@/lib/seo';

const dmSerifDisplay = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-serif-display',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://intervention.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: "Intervention: Compassionate, Certified Interventions for Families | A Change Institute Service",
  description: "Nation’s leading interventionists since 2003. Free, confidential consultation for addiction, mental health, and eating disorders. Available 24/7 nationwide.",
  alternates: { canonical: '/' },
  openGraph: {
    title: "Intervention: Help Families Find Their Way Forward",
    description: "Compassionate, structured interventions for substance use, mental health, and behavioral challenges. Free consultation. Nationwide.",
    type: 'website',
    siteName: 'Intervention.com',
    images: [{ url: `${SITE}/images/hero-v2-poster.jpg` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Intervention: Help Families Find Their Way Forward",
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
      className={`${dmSerifDisplay.variable} ${dmSans.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-white font-sans text-ink">
        {/* Google Tag Manager */}
        <Script id="gtm-init" strategy="afterInteractive">{`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-NN4ZB8QP');
        `}</Script>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-NN4ZB8QP"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>

        {/* GA4 (property 326681126) + Google Ads */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-185595BY9R"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-185595BY9R');
          gtag('config', 'AW-11482468131');
        `}</Script>

        {/* CallTrackingMetrics */}
        <Script
          src="https://420748.tctm.co/t.js"
          strategy="afterInteractive"
        />
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
