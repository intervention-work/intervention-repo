// Bulk IndexNow submission.
//
// Fetches the live sitemap, extracts every <loc>, and submits the full URL
// list to IndexNow in one call. Run this once after shipping the IndexNow
// wiring to seed Bing/Yandex/etc with every indexable URL on intervention.com;
// per-page revalidations handle incremental updates automatically from then on.
//
// Usage: npm run indexnow:bulk

import { pingIndexNow, INDEXNOW_HOST } from '../src/lib/indexnow';

const SITEMAP_URL = `https://${INDEXNOW_HOST}/sitemap.xml`;

async function main() {
  console.log(`[indexnow:bulk] fetching ${SITEMAP_URL}`);
  const res = await fetch(SITEMAP_URL, {
    headers: { 'User-Agent': 'intervention-indexnow-bulk/1.0' },
  });
  if (!res.ok) {
    throw new Error(`sitemap fetch failed: ${res.status} ${res.statusText}`);
  }
  const xml = await res.text();

  // Minimal <loc> extractor. Avoids pulling in an XML parser dep for a
  // flat sitemap. Next.js emits one <loc> per <url> entry.
  const locs = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g))
    .map((m) => m[1].trim())
    .filter((u) => u.startsWith(`https://${INDEXNOW_HOST}`));

  const unique = Array.from(new Set(locs));
  console.log(`[indexnow:bulk] parsed ${unique.length} unique URLs from sitemap`);

  if (!unique.length) {
    console.error('[indexnow:bulk] no URLs found; aborting');
    process.exit(1);
  }

  // IndexNow API allows up to 10,000 URLs per request. Our sitemap is
  // nowhere near that today, so one batch is fine.
  await pingIndexNow(unique);
  console.log('[indexnow:bulk] done');
}

main().catch((err) => {
  console.error('[indexnow:bulk] fatal', err);
  process.exit(1);
});
