/**
 * Generate the detail_page records on a WordPress site by reading THAT SAME
 * site's own data (its nav menu + service pages). Nothing is copied between
 * environments; the site is its own source of truth.
 *
 * What it does:
 *   1. Reads the site's WordPress menu (/intervention/v1/nav).
 *   2. Takes the children under the "Intervention" and "Services" items as the
 *      canonical list of services (label, order, and section come from the menu).
 *   3. For each, reads the linked page for its title + summary + featured image.
 *   4. Creates (or updates) one detail_page record per service via the REST API.
 *
 * Usage:
 *   # Preview only (no writes, no credentials needed):
 *   npx tsx scripts/seed-detail-pages.ts --dry-run
 *
 *   # Real run (writes to WordPress; needs an Application Password):
 *   WP_URL=https://intervention.com/wp-json \
 *   WP_USER='your-wp-username' \
 *   WP_APP_PASSWORD='abcd EFGH ijkl MNOP qrst UVWX' \
 *   npx tsx scripts/seed-detail-pages.ts
 *
 * Safe to re-run: it matches existing records by slug and updates them in place
 * instead of creating duplicates.
 */

export {}; // treat this file as a module so its top-level names stay local

const WP_URL = process.env.WP_URL ?? 'https://intervention.com/wp-json';
const WP_USER = process.env.WP_USER ?? '';
const WP_APP_PASSWORD = (process.env.WP_APP_PASSWORD ?? '').replace(/\s+/g, '');
const DRY_RUN = process.argv.includes('--dry-run');
const CHECK = process.argv.includes('--check');
const PROBE = process.argv.includes('--probe-write');
const PROBE_DETAIL = process.argv.includes('--probe-detail');
const PROBE_FIELDS = process.argv.includes('--probe-fields');
const UA = { 'User-Agent': 'intervention-seed/1.0' };

// Isolate exactly which part of the write body triggers the 401: menu_order,
// acf, or both. Creates a throwaway draft for each variant and cleans up.
async function probeFields() {
  if (!WP_USER || !WP_APP_PASSWORD) {
    console.error('Set WP_USER and WP_APP_PASSWORD to run --probe-fields.');
    process.exit(1);
  }
  const auth = Buffer.from(`${WP_USER}:${WP_APP_PASSWORD}`).toString('base64');
  const headers = { ...UA, 'Content-Type': 'application/json', Authorization: `Basic ${auth}` };
  const variants: Array<[string, object]> = [
    ['menu_order only', { title: 't', status: 'draft', menu_order: 3 }],
    ['acf only', { title: 't', status: 'draft', acf: { label: 'x', parent_section: 'services' } }],
    ['acf + menu_order', { title: 't', status: 'draft', menu_order: 3, acf: { label: 'x', parent_section: 'services' } }],
  ];
  for (const [name, body] of variants) {
    const res = await fetch(`${WP_URL}/wp/v2/detail_page`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    let extra = '';
    if (res.ok) {
      const p = (await res.json()) as { id: number };
      await fetch(`${WP_URL}/wp/v2/detail_page/${p.id}?force=true`, { method: 'DELETE', headers });
    } else {
      const t = await res.text();
      const m = t.match(/"code":"([^"]+)"/);
      extra = m ? `  code=${m[1]}` : `  ${t.slice(0, 80)}`;
    }
    console.log(`  ${name.padEnd(18)} -> HTTP ${res.status}${extra}`);
  }
}

// Try creating a MINIMAL detail_page (title only, no acf/menu_order) to tell a
// post-type capability problem apart from a field-write problem.
async function probeDetail() {
  if (!WP_USER || !WP_APP_PASSWORD) {
    console.error('Set WP_USER and WP_APP_PASSWORD to run --probe-detail.');
    process.exit(1);
  }
  const auth = Buffer.from(`${WP_USER}:${WP_APP_PASSWORD}`).toString('base64');
  const headers = { ...UA, 'Content-Type': 'application/json', Authorization: `Basic ${auth}` };
  const res = await fetch(`${WP_URL}/wp/v2/detail_page`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ title: 'ihs-cpt-test (safe to delete)', status: 'draft' }),
  });
  console.log(`POST /wp/v2/detail_page (title only) -> HTTP ${res.status}`);
  if (res.ok) {
    const p = (await res.json()) as { id: number };
    console.log(`  Minimal detail_page create WORKS (#${p.id}). Cleaning up...`);
    await fetch(`${WP_URL}/wp/v2/detail_page/${p.id}?force=true`, { method: 'DELETE', headers });
    console.log('\n=> CPT caps are fine. The 401 came from the acf/menu_order body; I will adjust.');
  } else {
    console.log(`  Body: ${(await res.text()).slice(0, 200)}`);
    console.log('\n=> The detail_page post type itself rejects creation. Plugin capability fix needed.');
  }
}

// Test whether AUTHENTICATED WRITES work at all, by creating a throwaway draft
// standard post and deleting it. Separates "POST auth is stripped" (write of a
// normal post also 401s) from a detail_page-specific problem.
async function probeWrite() {
  if (!WP_USER || !WP_APP_PASSWORD) {
    console.error('Set WP_USER and WP_APP_PASSWORD to run --probe-write.');
    process.exit(1);
  }
  const auth = Buffer.from(`${WP_USER}:${WP_APP_PASSWORD}`).toString('base64');
  const headers = { ...UA, 'Content-Type': 'application/json', Authorization: `Basic ${auth}` };
  const res = await fetch(`${WP_URL}/wp/v2/posts`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ title: 'ihs-auth-test (safe to delete)', status: 'draft' }),
  });
  console.log(`POST /wp/v2/posts (draft) -> HTTP ${res.status}`);
  if (res.ok) {
    const p = (await res.json()) as { id: number };
    console.log(`  Write auth WORKS (created draft post #${p.id}). Cleaning up...`);
    const del = await fetch(`${WP_URL}/wp/v2/posts/${p.id}?force=true`, { method: 'DELETE', headers });
    console.log(`  Deleted test post: HTTP ${del.status}`);
    console.log('\n=> Writes work. The detail_page 401 is CPT-specific (I will fix the plugin).');
  } else {
    console.log(`  Body: ${(await res.text()).slice(0, 200)}`);
    console.log('\n=> Even a normal post write is blocked. The host is stripping the');
    console.log('   Authorization header on writes (WP Engine). Needs a server-side fix.');
  }
}

// Verify the Application Password actually authenticates (uses the exact same
// auth path the writes use). Prints who WordPress thinks you are + your caps.
async function checkAuth() {
  if (!WP_USER || !WP_APP_PASSWORD) {
    console.error('Set WP_USER and WP_APP_PASSWORD to run --check.');
    process.exit(1);
  }
  const auth = Buffer.from(`${WP_USER}:${WP_APP_PASSWORD}`).toString('base64');
  const res = await fetch(`${WP_URL}/wp/v2/users/me?context=edit`, {
    headers: { ...UA, Authorization: `Basic ${auth}` },
  });
  console.log(`GET /users/me -> HTTP ${res.status}`);
  const bodyText = await res.text();
  if (res.ok) {
    const me = JSON.parse(bodyText) as { name?: string; slug?: string; roles?: string[]; capabilities?: Record<string, boolean> };
    console.log(`  Authenticated as: ${me.name} (${me.slug})`);
    console.log(`  Roles: ${(me.roles ?? []).join(', ') || '(none)'}`);
    console.log(`  can publish_posts: ${me.capabilities?.publish_posts ? 'yes' : 'NO'}`);
    console.log('\nAuth works. If writes still 401, it is a capability/CPT issue.');
  } else {
    console.log(`  Body: ${bodyText.slice(0, 200)}`);
    console.log('\nAuth FAILED. Either the username/app-password is wrong, or the host');
    console.log('is stripping the Authorization header (common on WP Engine).');
  }
}

type NavNode = { label: string; url: string; children?: NavNode[] };

type DetailRecord = {
  section: 'intervention' | 'services';
  label: string;
  order: number;
  slug: string;
  navHrefOverride: string;
  title: string;
  summary: string;
  image: number; // attachment id, 0 = none
};

const stripTags = (h: string) =>
  h.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const decode = (s: string) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&#0?38;/g, '&')
    .replace(/&#8217;/g, '’')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
const clean = (s: string) => decode(stripTags(s)).replace(/\s+/g, ' ').trim();
const normalizePath = (u: string) => {
  const p = u.replace(/^https?:\/\/[^/]+/, '').replace(/\/+$/, '');
  return p.startsWith('/') ? p : `/${p}`;
};
const leafOf = (u: string) => {
  const parts = normalizePath(u).split('/').filter(Boolean);
  return parts[parts.length - 1] ?? '';
};

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${WP_URL}${path}`, { headers: UA });
  if (!res.ok) throw new Error(`GET ${path} -> ${res.status}`);
  return (await res.json()) as T;
}

async function buildRecords(): Promise<DetailRecord[]> {
  const nav = await getJson<NavNode[]>('/intervention/v1/nav');
  const out: DetailRecord[] = [];

  for (const section of ['intervention', 'services'] as const) {
    const top = nav.find(
      (n) => n.label.trim().toLowerCase() === section
    );
    const children = (top?.children ?? []).filter(
      (c) => c.url && !/^https?:\/\//i.test(c.url) && c.url !== '#'
    );

    let order = 0;
    for (const child of children) {
      order += 1;
      const path = normalizePath(child.url);
      const slug = leafOf(path);
      if (!slug) continue;

      // Read the linked page for its real title, summary, and featured image.
      let title = clean(child.label);
      let summary = '';
      let image = 0;
      try {
        const pages = await getJson<
          Array<{
            title: { rendered: string };
            excerpt: { rendered: string };
            featured_media: number;
          }>
        >(
          `/wp/v2/pages?slug=${encodeURIComponent(slug)}&_fields=title,excerpt,featured_media`
        );
        if (pages[0]) {
          title = clean(pages[0].title?.rendered ?? '') || title;
          summary = clean(pages[0].excerpt?.rendered ?? '');
          image = pages[0].featured_media || 0;
        }
      } catch {
        /* fall back to menu label */
      }
      // Prefer the editor-set Rank Math description for the hero summary.
      try {
        const seo = await getJson<{ description?: string }>(
          `/intervention/v1/seo?type=page&slug=${encodeURIComponent(slug)}`
        );
        if (seo?.description) summary = clean(seo.description);
      } catch {
        /* keep excerpt */
      }

      const canonical = `/${section}/${slug}`;
      out.push({
        section,
        label: clean(child.label),
        order,
        slug,
        navHrefOverride: path !== canonical ? path : '',
        title,
        summary: summary.slice(0, 260),
        image,
      });
    }
  }
  return out;
}

async function existingBySlug(): Promise<Map<string, number>> {
  const rows = await getJson<Array<{ id: number; acf?: { slug?: string } }>>(
    '/wp/v2/detail_page?per_page=100&acf_format=standard&_fields=id,acf'
  );
  const map = new Map<string, number>();
  for (const r of rows) if (r.acf?.slug) map.set(r.acf.slug, r.id);
  return map;
}

async function write(rec: DetailRecord, existingId: number | undefined) {
  const body = {
    title: rec.label,
    status: 'publish',
    menu_order: rec.order,
    acf: {
      label: rec.label,
      title: rec.title,
      summary: rec.summary,
      slug: rec.slug,
      parent_section: rec.section,
      source_page_slug: rec.slug,
      nav_href_override: rec.navHrefOverride,
      ...(rec.image ? { image: rec.image } : {}),
    },
  };
  const path = existingId ? `/wp/v2/detail_page/${existingId}` : '/wp/v2/detail_page';
  const auth = Buffer.from(`${WP_USER}:${WP_APP_PASSWORD}`).toString('base64');
  const res = await fetch(`${WP_URL}${path}`, {
    method: 'POST',
    headers: {
      ...UA,
      'Content-Type': 'application/json',
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`${existingId ? 'update' : 'create'} ${rec.slug} -> ${res.status} ${await res.text()}`);
  }
}

async function main() {
  console.log(`WordPress: ${WP_URL}`);
  if (CHECK) {
    await checkAuth();
    return;
  }
  if (PROBE) {
    await probeWrite();
    return;
  }
  if (PROBE_DETAIL) {
    await probeDetail();
    return;
  }
  if (PROBE_FIELDS) {
    await probeFields();
    return;
  }
  console.log(DRY_RUN ? 'Mode: DRY RUN (no writes)\n' : 'Mode: LIVE WRITE\n');

  const records = await buildRecords();
  console.log(`Built ${records.length} detail-page records from the menu:\n`);
  for (const r of records) {
    console.log(
      `  [${r.section}] #${r.order} ${r.slug}` +
        (r.navHrefOverride ? `  (nav -> ${r.navHrefOverride})` : '')
    );
    console.log(`      label:   ${r.label}`);
    console.log(`      title:   ${r.title}`);
    console.log(`      summary: ${r.summary.slice(0, 100)}${r.summary.length > 100 ? '...' : ''}`);
    console.log(`      image:   ${r.image ? `attachment #${r.image}` : '(none)'}`);
  }

  if (DRY_RUN) {
    console.log('\nDry run complete. No changes written.');
    return;
  }
  if (!WP_USER || !WP_APP_PASSWORD) {
    console.error('\nMissing WP_USER / WP_APP_PASSWORD. Set them to write, or use --dry-run.');
    process.exit(1);
  }

  const existing = await existingBySlug();
  console.log('\nWriting to WordPress...');
  let created = 0;
  let updated = 0;
  for (const r of records) {
    const id = existing.get(r.slug);
    await write(r, id);
    if (id) updated += 1;
    else created += 1;
    console.log(`  ${id ? 'updated' : 'created'}  ${r.section}/${r.slug}`);
  }
  console.log(`\nDone. Created ${created}, updated ${updated}.`);
}

main().catch((e) => {
  console.error('\nFailed:', e.message);
  process.exit(1);
});
