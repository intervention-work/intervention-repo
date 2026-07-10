import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

/**
 * On-demand ISR revalidation endpoint.
 *
 * WordPress pings this on content save so edits appear immediately instead of
 * waiting for the 1-hour ISR window.
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

  return NextResponse.json({
    revalidated: true,
    paths,
    layout: revalidateLayout,
    now: Date.now(),
  });
}
