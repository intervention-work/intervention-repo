import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { pingIndexNow } from '@/lib/indexnow';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://intervention.com';

/**
 * On-demand ISR revalidation endpoint.
 *
 * WordPress pings this on content save so edits appear immediately instead of
 * waiting for the 1-hour ISR window. Each revalidated path is also submitted
 * to IndexNow so Bing and other participating engines can reindex within
 * minutes rather than days.
 *
 *   POST /api/revalidate?secret=TOKEN&path=/intervention/alcohol-intervention
 *   POST /api/revalidate?secret=TOKEN&path=/about,/services   (comma-separated)
 *   POST /api/revalidate?secret=TOKEN&layout=1                (nav/footer/global)
 *
 * `secret` must match the REVALIDATE_SECRET env var.
 */
export async function POST(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const secret = params.get('secret');

  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json(
      { revalidated: false, message: 'Invalid or missing secret.' },
      { status: 401 }
    );
  }

  const pathParam = params.get('path');
  const paths = (pathParam ?? '')
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);

  for (const p of paths) {
    revalidatePath(p);
  }

  // Global chrome (nav/footer/phone/email) lives in the root layout.
  const revalidateLayout = params.get('layout') === '1';
  if (revalidateLayout) {
    revalidatePath('/', 'layout');
  }

  // Fire IndexNow in the background. Fire and forget so the response to
  // WordPress is not delayed by third-party endpoint latency.
  if (paths.length) {
    const fullUrls = paths.map((p) => {
      const path = p.startsWith('/') ? p : `/${p}`;
      return `${SITE}${path}`;
    });
    pingIndexNow(fullUrls).catch((err) => {
      console.warn('[indexnow] unexpected error', err);
    });
  }

  return NextResponse.json({
    revalidated: true,
    paths,
    layout: revalidateLayout,
    now: Date.now(),
  });
}
