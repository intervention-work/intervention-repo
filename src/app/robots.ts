import type { MetadataRoute } from 'next';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://intervention.com';

// The /wp-admin, /wp-login.php, /wp-content/*, /wp-includes/*, /index.php and
// /xmlrpc.php paths are proxied by next.config.ts to the WordPress origin
// (interventions.wpenginepowered.com), whose own robots.txt is `Disallow: /`
// (WP Engine's production default). Google crawls these intervention.com URLs
// from legacy backlinks or old sitemap entries, follows the 307, hits the
// wpengine Disallow, and buckets them under "Blocked by robots.txt". After
// the Oct 6-7 asset-proxy deploy we jumped from ~100 to 177 not-indexed URLs
// for exactly this reason.
//
// Disallow those admin/technical paths at intervention.com directly so Google
// stops at this host, categorizes them as intentionally excluded, and does
// not count them as a crawl issue. /wp-content/uploads/* stays allowed so
// legitimately embedded image URLs still get crawled by Googlebot-Image.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        disallow: [
          '/wp-admin/',
          '/wp-login.php',
          '/wp-includes/',
          '/wp-content/plugins/',
          '/wp-content/themes/',
          '/wp-content/mu-plugins/',
          '/index.php',
          '/xmlrpc.php',
        ],
        allow: ['/wp-content/uploads/', '/'],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
  };
}
