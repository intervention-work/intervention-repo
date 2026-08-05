import type { NextConfig } from 'next';

type Redirect = { source: string; destination: string; permanent: boolean };

// Redirects marketing manages in WordPress (Rank Math Redirections) are pulled
// in at build time from the headless plugin's export endpoint and merged with
// the hand-authored ones below. If the endpoint is missing (plugin not yet
// updated) or unreachable, we fail safe and just use the manual list, so the
// build never breaks. WordPress redirect changes apply on the next deploy.
async function wordpressRedirects(): Promise<Redirect[]> {
  const base =
    process.env.NEXT_PUBLIC_WP_API_URL ??
    'https://interventiodev.wpenginepowered.com/wp-json';
  try {
    const res = await fetch(`${base}/intervention/v1/redirects`, {
      headers: { 'User-Agent': 'intervention-nextjs-build' },
    });
    if (!res.ok) return [];
    const rows = (await res.json()) as Array<{ from: string; to: string; code: number }>;
    return rows
      .filter((r) => r.from && r.to && r.from !== r.to)
      .map((r) => ({
        source: r.from,
        destination: r.to,
        permanent: r.code !== 302,
      }));
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'api.dicebear.com' },
      { protocol: 'https', hostname: 'interventiodev.wpenginepowered.com' },
    ],
  },

  transpilePackages: [
    '@radix-ui/react-navigation-menu',
    '@radix-ui/react-accordion',
    '@radix-ui/react-dialog',
    'lenis',
    'motion',
  ],

  redirects: async () => {
    const manual: Redirect[] = [
      { source: '/v2', destination: '/', permanent: true },
      { source: '/resources/trainings', destination: '/resources', permanent: true },
      { source: '/resources/blog', destination: '/resources', permanent: true },
      // Duplicate pages -> canonical URLs
      { source: '/about-us', destination: '/about', permanent: true },
      { source: '/about-us/:path*', destination: '/about', permanent: true },
      { source: '/resources-3', destination: '/resources', permanent: true },
      // On Set Care Unit is a real service the menu links under /resources-3;
      // send it to its canonical service detail (keep this before the catch-all
      // /resources-3 rule below, which would otherwise swallow it into /resources).
      { source: '/resources-3/on-set-care-unit', destination: '/services/on-set-care-unit', permanent: true },
      { source: '/resources-3/:path*', destination: '/resources', permanent: true },
      { source: '/georgia', destination: '/interventionists-by-state/georgia', permanent: true },
      { source: '/intervention-help', destination: '/intervention', permanent: true },
      { source: '/intervention-help/:path*', destination: '/intervention', permanent: true },
      { source: '/free-resources', destination: '/resources', permanent: true },
    ];
    // Manual rules win on conflict (they are the deliberate, tested ones).
    const manualSources = new Set(manual.map((r) => r.source));
    const fromWp = (await wordpressRedirects()).filter(
      (r) => !manualSources.has(r.source)
    );
    return [...manual, ...fromWp];
  },
};

export default nextConfig;
