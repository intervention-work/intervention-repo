/**
 * Indexability audit for intervention.com. Run: `npm run index:audit`
 * (or `npx tsx scripts/index-audit.ts [--out=report.md] [--limit=N]`).
 *
 * Checks every URL in the live sitemap for the signals Google uses to decide
 * whether a page can be indexed: redirect hops, final status, noindex (header
 * and meta), canonical, robots.txt, duplicate titles, orphan pages, and internal
 * links that point at pages missing from the sitemap or at redirects.
 *
 * It can NOT tell you what Google has actually indexed. Only Search Console can.
 * If GSC_SERVICE_ACCOUNT_JSON (a file path or the raw JSON) is set and that
 * service account was added as a user on the property, it also calls the URL
 * Inspection API (GSC_SITE_URL, default "sc-domain:intervention.com").
 *
 * Only intervention.com is fetched, never the WordPress host. Max 4 requests in
 * flight with a short pause between them.
 */
import { createSign } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname } from 'node:path';
import { parse } from 'node-html-parser';

const SITE = 'https://intervention.com';
const HOST = new URL(SITE).hostname;
const UA = 'intervention-index-audit/1.0';
const CONCURRENCY = 4;
const PAUSE_MS = 150;
const MAX_HOPS = 5;

// Retired URLs that must keep redirecting (never 404) and stay out of the sitemap.
const EXPECTED_REDIRECTS: Array<{ from: string; to: string }> = [
  { from: '/intervention/early-autism', to: '/intervention' },
  { from: '/eyewitness', to: '/eyewitness-information' },
  { from: '/iteam', to: '/iteam-information' },
];

const arg = (name: string) =>
  process.argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
const OUT = arg('out');
const LIMIT = Number(arg('limit') ?? '0');

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const norm = (u: string) => u.replace(/[?#].*$/, '').replace(/\/+$/, '') || '/';

async function pool<T, R>(items: T[], worker: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await worker(items[i]);
        await sleep(PAUSE_MS);
      }
    })
  );
  return out;
}

type Hop = { url: string; status: number; location?: string };

async function fetchFollow(url: string): Promise<{
  hops: Hop[];
  finalUrl: string;
  status: number;
  headers: Headers | null;
  html: string;
  error?: string;
}> {
  const hops: Hop[] = [];
  let current = url;
  for (let i = 0; i <= MAX_HOPS; i++) {
    if (new URL(current).hostname !== HOST) {
      return { hops, finalUrl: current, status: 0, headers: null, html: '', error: 'left-host' };
    }
    let res: Response;
    try {
      res = await fetch(current, {
        redirect: 'manual',
        headers: { 'user-agent': UA, accept: 'text/html' },
        signal: AbortSignal.timeout(25000),
      });
    } catch (e) {
      return { hops, finalUrl: current, status: 0, headers: null, html: '', error: String(e).slice(0, 80) };
    }
    const loc = res.headers.get('location') ?? undefined;
    if (res.status >= 300 && res.status < 400 && loc) {
      hops.push({ url: current, status: res.status, location: loc });
      await res.arrayBuffer().catch(() => undefined);
      current = new URL(loc, current).toString();
      continue;
    }
    const ct = res.headers.get('content-type') ?? '';
    const html = ct.includes('html') ? await res.text() : (await res.arrayBuffer(), '');
    return { hops, finalUrl: current, status: res.status, headers: res.headers, html };
  }
  return { hops, finalUrl: current, status: 0, headers: null, html: '', error: 'too-many-redirects' };
}

// robots.txt (group for "*" only): longest matching rule wins, Allow wins ties.
function robotsMatcher(txt: string) {
  const rules: Array<{ allow: boolean; re: RegExp; len: number }> = [];
  let inStar = false;
  for (const raw of txt.split(/\r?\n/)) {
    const line = raw.replace(/#.*/, '').trim();
    const m = /^([a-z-]+)\s*:\s*(.*)$/i.exec(line);
    if (!m) continue;
    const k = m[1].toLowerCase();
    if (k === 'user-agent') inStar = m[2].trim() === '*';
    else if (inStar && (k === 'allow' || k === 'disallow') && m[2].trim()) {
      const p = m[2].trim();
      const re = new RegExp(
        '^' + p.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\\\$$/, '$')
      );
      rules.push({ allow: k === 'allow', re, len: p.length });
    }
  }
  return (path: string) => {
    let best: { allow: boolean; len: number } | null = null;
    for (const r of rules) {
      if (r.re.test(path) && (!best || r.len > best.len || (r.len === best.len && r.allow))) best = r;
    }
    return best ? best.allow : true;
  };
}

type Row = {
  url: string;
  flags: string[];
  status: number;
  finalUrl: string;
  hops: number;
  title: string;
  canonical: string;
  inbound: number;
  gsc?: string;
};

async function gscToken(creds: { client_email: string; private_key: string }): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const head = b64({ alg: 'RS256', typ: 'JWT' });
  const claims = b64({
    iss: creds.client_email,
    scope: 'https://www.googleapis.com/auth/webmasters.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  });
  const sig = createSign('RSA-SHA256').update(`${head}.${claims}`).sign(creds.private_key, 'base64url');
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${head}.${claims}.${sig}`,
    }),
  });
  const j = (await res.json()) as { access_token?: string; error_description?: string };
  if (!j.access_token) throw new Error(j.error_description ?? 'token request failed');
  return j.access_token;
}

async function inspectAll(rows: Row[]): Promise<string> {
  const src = process.env.GSC_SERVICE_ACCOUNT_JSON;
  if (!src) {
    return 'GSC URL Inspection skipped: GSC_SERVICE_ACCOUNT_JSON not set (see report footer).';
  }
  try {
    const raw = existsSync(src) ? readFileSync(src, 'utf8') : src;
    const token = await gscToken(JSON.parse(raw));
    const siteUrl = process.env.GSC_SITE_URL ?? 'sc-domain:intervention.com';
    // 600 requests/min and 2000/day per property; stay far below.
    for (const r of rows) {
      const res = await fetch('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', {
        method: 'POST',
        headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
        body: JSON.stringify({ inspectionUrl: r.url, siteUrl }),
      });
      if (!res.ok) {
        r.gsc = `error ${res.status}`;
        if (res.status === 403) return `GSC URL Inspection failed: 403, add the service account as a user on ${siteUrl}.`;
        if (res.status === 429) return 'GSC URL Inspection stopped: quota hit (429).';
      } else {
        const j = (await res.json()) as {
          inspectionResult?: { indexStatusResult?: { coverageState?: string; googleCanonical?: string } };
        };
        const s = j.inspectionResult?.indexStatusResult;
        r.gsc = s?.coverageState ?? 'unknown';
        if (s?.googleCanonical && norm(s.googleCanonical) !== norm(r.url)) {
          r.flags.push('GSC_CANONICAL_DIFFERS');
        }
        if (s?.coverageState && !/^(Submitted and indexed|Indexed)/i.test(s.coverageState)) {
          r.flags.push('GSC_NOT_INDEXED');
        }
      }
      await sleep(300);
    }
    return `GSC URL Inspection ran for ${rows.length} URLs on ${siteUrl}.`;
  } catch (e) {
    return `GSC URL Inspection failed: ${String(e).slice(0, 120)}`;
  }
}

async function main() {
  const started = Date.now();
  const sm = await fetch(`${SITE}/sitemap.xml`, { headers: { 'user-agent': UA } });
  if (!sm.ok) throw new Error(`sitemap.xml returned ${sm.status}`);
  const allLocs = [...(await sm.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  const unique = [...new Set(allLocs)];
  const urls = LIMIT ? unique.slice(0, LIMIT) : unique;
  const sitemapSet = new Set(unique.map(norm).map((p) => (p.startsWith('http') ? new URL(p).pathname : p)));

  const robotsTxt = await (await fetch(`${SITE}/robots.txt`, { headers: { 'user-agent': UA } })).text();
  const allowed = robotsMatcher(robotsTxt);

  const linked = new Map<string, Set<string>>(); // target path -> source paths
  const slashLinks = new Map<string, Set<string>>(); // hrefs with a trailing slash (each costs a 308 hop)
  const titles = new Map<string, string[]>();

  const rows = await pool(urls, async (url): Promise<Row> => {
    const flags: string[] = [];
    const path = new URL(url).pathname;
    if (new URL(url).hostname !== HOST) flags.push('SITEMAP_OFF_HOST');
    if (!allowed(path)) flags.push('ROBOTS_BLOCKED');
    const r = await fetchFollow(url);
    if (r.error) flags.push(`FETCH_${r.error.toUpperCase().replace(/[^A-Z]+/g, '_')}`);
    if (r.hops.length) {
      flags.push('REDIRECTS');
      if (r.hops.length > 1) flags.push('REDIRECT_CHAIN');
      if (r.hops.some((h) => h.location && norm(new URL(h.location, h.url).pathname) === norm(new URL(h.url).pathname))) {
        flags.push('SLASH_HOP');
      }
    }
    if (!r.error && r.status !== 200) flags.push(`STATUS_${r.status}`);
    if (new URL(r.finalUrl).hostname !== HOST) flags.push('FINAL_OFF_HOST');
    if (/noindex/i.test(r.headers?.get('x-robots-tag') ?? '')) flags.push('NOINDEX_HEADER');

    let title = '';
    let canonical = '';
    if (r.html) {
      const doc = parse(r.html);
      title = (doc.querySelector('title')?.text ?? '').trim();
      canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? '';
      const robots = doc
        .querySelectorAll('meta')
        .filter((m) => /^(robots|googlebot)$/i.test(m.getAttribute('name') ?? ''))
        .map((m) => m.getAttribute('content') ?? '')
        .join(',');
      if (/noindex/i.test(robots)) flags.push('NOINDEX_META');
      if (!title) flags.push('NO_TITLE');
      else titles.set(title.toLowerCase(), [...(titles.get(title.toLowerCase()) ?? []), url]);
      if (!canonical) flags.push('NO_CANONICAL');
      else {
        const c = new URL(canonical, r.finalUrl);
        if (c.hostname !== HOST || c.protocol !== 'https:') flags.push('CANONICAL_HOST');
        else if (norm(c.pathname) !== norm(new URL(r.finalUrl).pathname)) flags.push('CANONICAL_MISMATCH');
      }
      for (const a of doc.querySelectorAll('a')) {
        const href = a.getAttribute('href');
        if (!href || /^(mailto:|tel:|javascript:|#)/i.test(href)) continue;
        let u: URL;
        try { u = new URL(href, r.finalUrl); } catch { continue; }
        if (u.hostname !== HOST) continue;
        const p = norm(u.pathname);
        if (/^\/(api|_next|wp-content|wp-json|wp-admin)\b/.test(p) || /\.[a-z0-9]{2,5}$/i.test(p)) continue;
        if (!linked.has(p)) linked.set(p, new Set());
        linked.get(p)!.add(norm(path));
        if (u.pathname.length > 1 && u.pathname.endsWith('/')) {
          if (!slashLinks.has(p)) slashLinks.set(p, new Set());
          slashLinks.get(p)!.add(norm(path));
        }
      }
    }
    return { url, flags, status: r.status, finalUrl: r.finalUrl, hops: r.hops.length, title, canonical, inbound: 0 };
  });

  // Duplicate sitemap entries and duplicate titles.
  const dupLocs = allLocs.filter((u, i) => allLocs.indexOf(u) !== i);
  for (const row of rows) {
    if (dupLocs.includes(row.url)) row.flags.push('DUP_IN_SITEMAP');
    const same = titles.get(row.title.toLowerCase());
    if (row.title && same && same.length > 1) row.flags.push('DUP_TITLE');
    const p = norm(new URL(row.url).pathname);
    const inbound = [...(linked.get(p) ?? [])].filter((s) => s !== p).length;
    row.inbound = inbound;
    if (!inbound && p !== '/') row.flags.push('ORPHAN');
  }

  // Internal links to pages that are not in the sitemap.
  const candidates = [...linked.keys()].filter((p) => !sitemapSet.has(p) && p !== '/');
  const linkedOnly = await pool(candidates, async (p) => {
    const r = await fetchFollow(`${SITE}${p}`);
    return { path: p, status: r.hops[0]?.status ?? r.status, to: r.hops[0]?.location, from: linked.get(p)!.size };
  });

  const expected = await pool(EXPECTED_REDIRECTS, async (e) => {
    const r = await fetchFollow(`${SITE}${e.from}`);
    const ok = r.hops[0]?.status === 301 || r.hops[0]?.status === 308;
    const lands = norm(new URL(r.finalUrl).pathname) === norm(e.to) && r.status === 200;
    return { ...e, ok: ok && lands, got: `${r.hops.map((h) => h.status).join('>') || 'none'} then ${r.status}` };
  });
  const inSitemapButRetired = EXPECTED_REDIRECTS.filter((e) => sitemapSet.has(norm(e.from)));

  const gscNote = await inspectAll(rows);

  // Report.
  const counts = new Map<string, number>();
  for (const r of rows) for (const f of new Set(r.flags)) counts.set(f, (counts.get(f) ?? 0) + 1);
  const SEVERE = /^(STATUS_|NOINDEX|ROBOTS_BLOCKED|CANONICAL_MISMATCH|CANONICAL_HOST|NO_CANONICAL|FETCH_|FINAL_OFF_HOST|SITEMAP_OFF_HOST|GSC_NOT_INDEXED)/;
  const lines: string[] = [];
  const out = (s = '') => lines.push(s);
  out(`# Index audit ${new Date().toISOString().slice(0, 10)}`);
  out();
  out(`Sitemap: ${allLocs.length} entries, ${unique.length} unique, ${urls.length} checked in ${Math.round((Date.now() - started) / 1000)}s.`);
  out(`Clean (no flags): ${rows.filter((r) => !r.flags.length).length} of ${rows.length}.`);
  out();
  out('## Problems by type');
  if (!counts.size) out('None.');
  for (const [f, n] of [...counts].sort((a, b) => b[1] - a[1])) {
    const ex = rows.filter((r) => r.flags.includes(f)).slice(0, 6).map((r) => r.url.replace(SITE, ''));
    out(`- ${f}: ${n}${SEVERE.test(f) ? ' (severe)' : ''}  e.g. ${ex.join(', ')}`);
  }
  out();
  out('## Duplicate titles');
  const dupTitleGroups = [...titles.values()].filter((v) => v.length > 1);
  if (!dupTitleGroups.length) out('None.');
  for (const g of dupTitleGroups) out(`- ${g.map((u) => u.replace(SITE, '')).join(' | ')}`);
  out();
  out('## Internal links to pages not in the sitemap');
  if (!linkedOnly.length) out('None.');
  for (const l of linkedOnly.sort((a, b) => b.from - a.from)) {
    out(`- ${l.path}  status ${l.status}${l.to ? ` -> ${l.to}` : ''}  linked from ${l.from} page(s)`);
  }
  out();
  out('## Internal links written with a trailing slash (each is a 308 hop)');
  const slashTop = [...slashLinks].sort((a, b) => b[1].size - a[1].size);
  if (!slashTop.length) out('None.');
  else out(`${slashTop.length} distinct targets. Top: ${slashTop.slice(0, 8).map(([p, s]) => `${p}/ (${s.size} pages)`).join(', ')}`);
  out();
  out('## Retired URLs (must redirect, must not be in sitemap)');
  for (const e of expected) out(`- ${e.from} -> ${e.to}: ${e.ok ? 'OK' : 'PROBLEM'} (${e.got})`);
  if (inSitemapButRetired.length) out(`- STILL IN SITEMAP: ${inSitemapButRetired.map((e) => e.from).join(', ')}`);
  out();
  out('## Search Console');
  out(gscNote);
  out('The indexed set itself comes only from Search Console (Pages report or URL Inspection API).');
  out();
  out('## Per-URL detail (flagged only)');
  for (const r of rows.filter((x) => x.flags.length)) {
    out(`- ${r.url.replace(SITE, '') || '/'} [${r.flags.join(', ')}] status ${r.status}, hops ${r.hops}, inbound ${r.inbound}${r.gsc ? `, GSC: ${r.gsc}` : ''}`);
  }
  const report = lines.join('\n');
  console.log(report);
  if (OUT) {
    mkdirSync(dirname(OUT), { recursive: true });
    writeFileSync(OUT, report + '\n');
    console.log(`\nWrote ${OUT}`);
  }
  const bad =
    [...counts.keys()].some((f) => SEVERE.test(f)) || expected.some((e) => !e.ok) || inSitemapButRetired.length > 0;
  process.exit(bad ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
