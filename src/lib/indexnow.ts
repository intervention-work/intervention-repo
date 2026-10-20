// IndexNow submission helper.
//
// IndexNow notifies participating search engines (Bing, Yandex, Seznam,
// Naver, and by extension ChatGPT browse) when a URL is added or updated,
// so they can crawl within minutes instead of waiting for their next
// scheduled visit. See https://www.indexnow.org/documentation.
//
// The verification key is intentionally public (served at /<KEY>.txt),
// so storing it in source is safe and in fact required so the ping body
// matches the file name search engines will fetch.

export const INDEXNOW_KEY = 'd6925beeb11ccbd7c998d9032be1a0ce';
export const INDEXNOW_HOST = 'intervention.com';
export const INDEXNOW_KEY_LOCATION = `https://${INDEXNOW_HOST}/${INDEXNOW_KEY}.txt`;

const INDEXNOW_ENDPOINTS = [
  'https://api.indexnow.org/indexnow',
  'https://www.bing.com/indexnow',
] as const;

/**
 * Submits one or more URLs that have been added or updated to IndexNow.
 * Non-blocking contract: never throws, caps each request at 5 seconds,
 * and hits multiple endpoints so a single provider outage still lets
 * the rest through. Callers should fire and forget (or Promise.allSettled).
 */
export async function pingIndexNow(urls: string[]): Promise<void> {
  if (!urls.length) return;
  const trace = urls[0];
  const body = JSON.stringify({
    host: INDEXNOW_HOST,
    key: INDEXNOW_KEY,
    keyLocation: INDEXNOW_KEY_LOCATION,
    urlList: urls,
  });
  const results = await Promise.allSettled(
    INDEXNOW_ENDPOINTS.map((endpoint) =>
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body,
        signal: AbortSignal.timeout(5000),
      }).then(async (res) => {
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(`${endpoint} ${res.status} ${text.slice(0, 200)}`);
        }
        return endpoint;
      }),
    ),
  );
  for (const r of results) {
    if (r.status === 'fulfilled') {
      console.log(`[indexnow] ok ${r.value} (first=${trace}, count=${urls.length})`);
    } else {
      console.warn(`[indexnow] fail ${r.reason} (first=${trace}, count=${urls.length})`);
    }
  }
}
