import { NextRequest, NextResponse } from 'next/server';
import { flagPrefix, scoreSubmission } from './spam';

/**
 * Contact form relay. The browser posts here instead of straight to HubSpot so
 * spam checks run server-side, and HubSpot receives the visitor's IP.
 * No secret is needed: the HubSpot integration submit endpoint is public.
 *
 * Genuine inquiries must never be lost, so:
 *  - overwhelming spam is dropped but answered with ok:true (no signal to bots)
 *  - borderline spam is delivered with an [Auto-flag] prefix on the message
 *  - the client falls back to a direct HubSpot submit if this route is down
 */
const PORTAL_ID = '46095144';
const FORM_ID = '4fd83930-97c1-4d8a-a51b-3fd18583507e';
const SUBMIT_URL = `https://api.hsforms.com/submissions/v3/integration/submit/${PORTAL_ID}/${FORM_ID}`;

const ALLOWED_FIELDS = new Set([
  'firstname',
  'lastname',
  'email',
  'mobilephone',
  'best_time_to_call_',
  'ok_to_leave_voicemail_',
  'address',
  'city',
  'state',
  'ilo_street',
  'ilo_city',
  'ilo_state',
  'your_timeframe_for_intervention',
  'insurance_type',
  'intervention_budget',
  'contact_form_message',
]);

const MAX_BODY_CHARS = 60_000;
const MAX_VALUE_CHARS = 5_000;

// Per-instance, best effort. Real households and offices share IPs, so the
// ceiling is generous for people and still stops scripted floods.
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string, now = Date.now()): boolean {
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5_000) {
    for (const [k, v] of hits) if (!v.some((t) => now - t < RATE_WINDOW_MS)) hits.delete(k);
  }
  return recent.length > RATE_MAX;
}

function originAllowed(req: NextRequest): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return true;
  try {
    const host = new URL(origin).hostname.toLowerCase();
    return (
      host === 'intervention.com' ||
      host === 'www.intervention.com' ||
      host === 'localhost' ||
      host.endsWith('.amplifyapp.com') ||
      host === req.nextUrl.hostname.toLowerCase()
    );
  } catch {
    return false;
  }
}

function clientIp(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for');
  const ip = (xff ? xff.split(',')[0] : req.headers.get('x-real-ip') ?? '').trim();
  return ip.slice(0, 64);
}

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.slice(0, max) : '');

export async function POST(req: NextRequest) {
  if (!originAllowed(req)) {
    return NextResponse.json({ ok: false, error: 'origin' }, { status: 403 });
  }

  let body: {
    payload?: {
      fields?: Array<{ name?: unknown; value?: unknown }>;
      context?: { hutk?: unknown; pageUri?: unknown; pageName?: unknown };
      legalConsentOptions?: unknown;
    };
    meta?: { hp?: unknown; elapsedMs?: unknown };
  };
  try {
    const raw = await req.text();
    if (raw.length > MAX_BODY_CHARS) {
      return NextResponse.json({ ok: false, error: 'size' }, { status: 413 });
    }
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false, error: 'bad-request' }, { status: 400 });
  }

  const rawFields = body?.payload?.fields;
  if (!Array.isArray(rawFields)) {
    return NextResponse.json({ ok: false, error: 'bad-request' }, { status: 400 });
  }

  const ip = clientIp(req);
  if (ip && rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: 'rate' }, { status: 429 });
  }

  // Only known fields, trimmed and length-capped, so nothing arbitrary reaches HubSpot.
  const fields: Record<string, string> = {};
  for (const f of rawFields) {
    const name = str(f?.name, 80);
    if (!ALLOWED_FIELDS.has(name)) continue;
    const value = str(f?.value, MAX_VALUE_CHARS).trim();
    if (value) fields[name] = value;
  }

  const elapsed = typeof body.meta?.elapsedMs === 'number' ? body.meta.elapsedMs : undefined;
  const verdict = scoreSubmission(fields, {
    honeypot: str(body.meta?.hp, 200),
    elapsedMs: elapsed,
  });

  if (verdict.action === 'drop') {
    console.warn('[contact] dropped', verdict.score, verdict.reasons.join('; '));
    return NextResponse.json({ ok: true });
  }
  if (verdict.action === 'flag') {
    console.warn('[contact] flagged', verdict.score, verdict.reasons.join('; '));
    fields.contact_form_message = flagPrefix(verdict) + (fields.contact_form_message ?? '');
  }

  const ctx = body.payload?.context ?? {};
  const outbound = {
    fields: [
      ...Object.entries(fields).map(([name, value]) => ({ objectTypeId: '0-1', name, value })),
      { objectTypeId: '0-1', name: 'hs_lead_status', value: 'NEW' },
    ],
    context: {
      hutk: str(ctx.hutk, 100) || undefined,
      pageUri: str(ctx.pageUri, 500) || undefined,
      pageName: str(ctx.pageName, 200) || undefined,
      ipAddress: ip || undefined,
    },
    legalConsentOptions:
      body.payload?.legalConsentOptions && typeof body.payload.legalConsentOptions === 'object'
        ? body.payload.legalConsentOptions
        : undefined,
  };

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8_000);
  try {
    const res = await fetch(SUBMIT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(outbound),
      signal: ctrl.signal,
    });
    if (res.ok) return NextResponse.json({ ok: true });
    console.error('[contact] HubSpot rejected', res.status);
    return NextResponse.json({ ok: false, error: 'upstream' }, { status: 502 });
  } catch (err) {
    console.error('[contact] HubSpot unreachable', err instanceof Error ? err.message : err);
    return NextResponse.json({ ok: false, error: 'upstream' }, { status: 502 });
  } finally {
    clearTimeout(timer);
  }
}
