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
  // Rank Math stores destinations as absolute public URLs with a trailing
  // slash (https://intervention.com/x/). Left absolute they bounce through an
  // extra 308 to drop the slash, so reduce them to a slash-free relative path.
  const PUBLIC_ORIGINS = ['https://intervention.com', 'https://www.intervention.com'];
  const toRelative = (url: string) => {
    let u = (url || '').trim();
    if (wpOrigin && u.startsWith(wpOrigin)) u = u.slice(wpOrigin.length) || '/';
    else {
      const pub = PUBLIC_ORIGINS.find((o) => u === o || u.startsWith(`${o}/`));
      if (pub) u = u.slice(pub.length) || '/';
    }
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
    // WordPress backend lives on WP Engine; intervention.com now points to the
    // Next.js app. Send any wp-admin/wp-login/wp-json/xmlrpc/index.php traffic
    // to the WP Engine host so editors clicking "WP Admin" from WP Engine's
    // portal reach a real WordPress install, not a 404.
    const wpHost = (() => {
      try {
        return new URL(WP_API_URL).origin;
      } catch {
        return 'https://interventions.wpenginepowered.com';
      }
    })();

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
      // Ahrefs/Semrush flagged these as 404 targets (both bare and under
      // /intervention-blog/). Brad Lamm and Jacob Hardt bios live on /our-team,
      // and the "substance-use" service is now called drug-alcohol-intervention.
      // 301s so link equity transfers and the broken-link report clears.
      { source: '/interventionists/brad-lamm', destination: '/our-team', permanent: true },
      { source: '/interventionists/jacob-hardt', destination: '/our-team', permanent: true },
      { source: '/intervention-blog/interventionists/brad-lamm', destination: '/our-team', permanent: true },
      { source: '/intervention-blog/interventionists/jacob-hardt', destination: '/our-team', permanent: true },
      { source: '/intervention/substance-use', destination: '/intervention/drug-alcohol-intervention', permanent: true },
      // Early Autism page removed per manager request on 2026-10-23. Keep link
      // equity by sending the slug (and the WP source slug) to the parent
      // Intervention landing page.
      { source: '/intervention/early-autism', destination: '/intervention', permanent: true },
      { source: '/intervention/early-autism-intervention', destination: '/intervention', permanent: true },
      // Short vanity URLs the marketing team shares; the full landing pages
      // sit at the longer slugs. Destinations use the no-trailing-slash form
      // to avoid a 301 to 308 chain (Next.js strips the slash on its own).
      { source: '/eyewitness', destination: '/eyewitness-information', permanent: true },
      { source: '/iteam', destination: '/iteam-information', permanent: true },
      // Short link for the Family Class sign-up page (assumed slug, confirm with marketing).
      { source: '/familyclass', destination: '/family-class', permanent: true },
      // These four services answer at both /{slug} and /services/{slug} with the
      // same content. The root URL is canonical (it is the one in the sitemap),
      // so the duplicate permanently forwards to it.
      { source: '/services/breakfree-journey', destination: '/breakfree-journey', permanent: true },
      { source: '/services/recovery-coach-companion', destination: '/recovery-coach-companion', permanent: true },
      { source: '/services/recovery-care-management', destination: '/recovery-care-management', permanent: true },
      { source: '/services/senior-support-services', destination: '/senior-support-services', permanent: true },
      // Legacy WordPress sitemap entry that Google Search Console still has
      // on file (manager submitted it years ago). The Next.js app serves one
      // sitemap at /sitemap.xml; forward the old URL so GSC's existing
      // submission keeps resolving instead of failing with 404 "couldn't fetch".
      { source: '/sitemap_index.xml', destination: '/sitemap.xml', permanent: true },
      { source: '/post-sitemap.xml', destination: '/sitemap.xml', permanent: true },
      { source: '/page-sitemap.xml', destination: '/sitemap.xml', permanent: true },
      { source: '/interventionists-sitemap.xml', destination: '/sitemap.xml', permanent: true },
      // WordPress backend handoff (headless site keeps editing on WP Engine).
      { source: '/wp-admin', destination: `${wpHost}/wp-admin`, permanent: false },
      { source: '/wp-admin/:path*', destination: `${wpHost}/wp-admin/:path*`, permanent: false },
      { source: '/wp-login.php', destination: `${wpHost}/wp-login.php`, permanent: false },
      { source: '/wp-login.php/:path*', destination: `${wpHost}/wp-login.php/:path*`, permanent: false },
      { source: '/index.php', destination: `${wpHost}/index.php`, permanent: false },
      { source: '/xmlrpc.php', destination: `${wpHost}/xmlrpc.php`, permanent: false },
      // WP ships admin assets (dashicons CSS, admin JS, favicons, media uploads)
      // under /wp-content/ and /wp-includes/. Because WP's siteurl option is
      // https://intervention.com, every admin page requests these from the
      // Next.js app and gets a 404 - which is why admin icons disappeared and
      // older content with intervention.com image URLs would break. Forward
      // these subpaths to the WP Engine host so both admin and legacy image
      // references resolve.
      { source: '/wp-content/:path*', destination: `${wpHost}/wp-content/:path*`, permanent: false },
      { source: '/wp-includes/:path*', destination: `${wpHost}/wp-includes/:path*`, permanent: false },
    ];
    // Manual rules win on conflict (they are the deliberate, tested ones).
    const manualSources = new Set(manual.map((r) => r.source));
    const fromWp = (await wordpressRedirects()).filter(
      (r) => !manualSources.has(r.source)
    );
    const all = [...manual, ...fromWp];
    // Point every rule straight at its final destination so no redirect has to
    // hop through another one (A to B to C becomes A to C).
    const bySource = new Map(
      all.filter((r) => !/[:*]/.test(r.source)).map((r) => [r.source, r.destination])
    );
    const finalDestination = (dest: string) => {
      const seen = new Set<string>();
      let cur = dest;
      while (bySource.has(cur) && !seen.has(cur)) {
        seen.add(cur);
        cur = bySource.get(cur) as string;
      }
      return cur;
    };
    return all
      .map((r) => ({ ...r, destination: finalDestination(r.destination) }))
      .filter((r) => r.source !== r.destination);
  },
};

export default nextConfig;
