import type { NextConfig } from 'next';

// Single source of truth for the WordPress backend. Switching from the dev CMS
// to production (or any future host) is just this one env var, no code change.
const WP_API_URL =
  process.env.NEXT_PUBLIC_WP_API_URL ??
  'https://interventiodev.wpenginepowered.com/wp-json';
const WP_HOST = (() => {
  try {
    return new URL(WP_API_URL).hostname;
  } catch {
    return 'interventiodev.wpenginepowered.com';
  }
})();

type Redirect = { source: string; destination: string; permanent: boolean };

// Redirects marketing manages in WordPress (Rank Math Redirections) are pulled
// in at build time from the headless plugin's export endpoint and merged with
// the hand-authored ones below. If the endpoint is missing (plugin not yet
// updated) or unreachable, we fail safe and just use the manual list, so the
// build never breaks. WordPress redirect changes apply on the next deploy.
async function wordpressRedirects(): Promise<Redirect[]> {
  const base = WP_API_URL;
  const wpOrigin = (() => {
    try {
      return new URL(base).origin;
    } catch {
      return '';
    }
  })();

  // Next.js redirect `source` must be a literal path that path-to-regexp can
  // parse. Rank Math can store query-string sources (/?page_id=35068), regex,
  // and absolute URLs, which break the build, so we keep only clean literal
  // paths. Destinations that point back at the WordPress host are rewritten to
  // site-relative paths so visitors stay on the new site, not the WP backend.
  const SAFE_SOURCE = /^\/[A-Za-z0-9\-._~%\/]*$/;
  const stripTrailing = (p: string) => (p.length > 1 ? p.replace(/\/+$/, '') : p);
  const toRelative = (url: string) => {
    let u = (url || '').trim();
    if (wpOrigin && u.startsWith(wpOrigin)) u = u.slice(wpOrigin.length) || '/';
    return u.startsWith('/') ? stripTrailing(u) : u;
  };

  try {
    const res = await fetch(`${base}/intervention/v1/redirects`, {
      headers: { 'User-Agent': 'intervention-nextjs-build' },
    });
    if (!res.ok) return [];
    const rows = (await res.json()) as Array<{ from: string; to: string; code: number }>;
    const seen = new Set<string>();
    const out: Redirect[] = [];
    for (const r of rows) {
      const source = stripTrailing((r.from || '').trim());
      const destination = toRelative(r.to);
      if (
        !source ||
        !destination ||
        source === '/' || // never redirect the homepage
        !SAFE_SOURCE.test(source) || // skip query-string / regex / non-path sources
        source === destination || // skip no-ops and loops
        seen.has(source)
      ) {
        continue;
      }
      seen.add(source);
      out.push({ source, destination, permanent: r.code !== 302 });
    }
    return out;
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'api.dicebear.com' },
      // The active WordPress media host (from NEXT_PUBLIC_WP_API_URL) plus the
      // dev host, so images keep loading during the dev -> production switch.
      ...[...new Set([WP_HOST, 'interventiodev.wpenginepowered.com'])].map(
        (hostname) => ({ protocol: 'https' as const, hostname })
      ),
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
    // Only universally-safe aliases live here. The production About page is
    // /about-us, so /about redirects to it. The WordPress Resources menu points
    // at /resources-3 (no such page), so send it to the real /resources. Every
    // other redirect comes from production's own Rank Math export below; we do
    // NOT hard-redirect real pages like /georgia, /intervention-help, etc.
    const manual: Redirect[] = [
      { source: '/v2', destination: '/', permanent: true },
      { source: '/about', destination: '/about-us', permanent: true },
      { source: '/resources-3', destination: '/resources', permanent: true },
      { source: '/resources-3/:path*', destination: '/resources', permanent: true },
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
