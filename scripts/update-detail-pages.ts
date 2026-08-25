/**
 * Apply targeted edits to the detail_page records + section pages on WordPress
 * (ordering, card/nav labels, and section titles). Reads nothing from another
 * environment; it just PUTs the specific changes below.
 *
 * Usage:
 *   npx tsx scripts/update-detail-pages.ts --dry-run          (preview)
 *   WP_URL=https://intervention.com/wp-json \
 *   WP_USER='your-wp-username' WP_APP_PASSWORD='xxxx ...' \
 *   npx tsx scripts/update-detail-pages.ts                    (apply)
 *
 * Safe to re-run.
 */
export {};

const WP_URL = process.env.WP_URL ?? 'https://intervention.com/wp-json';
const WP_USER = process.env.WP_USER ?? '';
const WP_APP_PASSWORD = (process.env.WP_APP_PASSWORD ?? '').replace(/\s+/g, '');
const DRY_RUN = process.argv.includes('--dry-run');
const UA = { 'User-Agent': 'intervention-update/1.0' };

// Changes to detail_page records, keyed by their acf.slug.
type DetailChange = {
  slug: string;
  menu_order?: number;
  label?: string;
  title?: string;
  navHrefOverride?: string;
  parentSection?: string;
};
const DETAIL_CHANGES: DetailChange[] = [
  // Services: new ordering + two renames.
  { slug: 'care-unit-assessment', menu_order: 1, label: 'Concierge Assessment (CARE)', title: 'Concierge Assessment (CARE)' },
  { slug: 'breakfree-journey', menu_order: 2 },
  { slug: 'recovery-coach-companion', menu_order: 4 },
  { slug: 'recovery-care-management', menu_order: 5, label: 'Recovery Case Management', title: 'Recovery Case Management' },
  { slug: 'on-set-care-unit', menu_order: 6 },
  { slug: 'senior-support-services', menu_order: 7 },
  // Intervention: rename state-locator; override nav href to root level (catch-all resolves it).
  { slug: 'interventionists-by-state', label: 'Find an Interventionist', navHrefOverride: '/interventionists-by-state' },
  // Intervention: merge drug + alcohol into one nav item. The drug record becomes the combined entry.
  // navHrefOverride will be '/drug-alcohol-intervention/' once that WP page is created by the client.
  // Until then it links to the existing /intervention/drug-intervention page.
  {
    slug: 'drug-intervention',
    menu_order: 3,
    label: 'Drug or Alcohol Intervention Services',
    title: 'Drug or Alcohol Intervention Services',
  },
  // Remove alcohol-intervention from the nav/cards by clearing its parent_section.
  { slug: 'alcohol-intervention', parentSection: '' },
];

// Changes to section landing pages, keyed by page slug.
type SectionChange = { slug: string; title: string; label: string };
const SECTION_CHANGES: SectionChange[] = [
  { slug: 'services', title: 'Additional Services', label: 'Additional Services' },
];

const auth = () => Buffer.from(`${WP_USER}:${WP_APP_PASSWORD}`).toString('base64');
const authHeaders = () => ({ ...UA, 'Content-Type': 'application/json', Authorization: `Basic ${auth()}` });

async function getJson<T>(path: string): Promise<T> {
  const r = await fetch(`${WP_URL}${path}`, { headers: UA });
  if (!r.ok) throw new Error(`GET ${path} -> ${r.status}`);
  return (await r.json()) as T;
}

async function main() {
  console.log(`WordPress: ${WP_URL}`);
  console.log(DRY_RUN ? 'Mode: DRY RUN (no writes)\n' : 'Mode: LIVE WRITE\n');

  // Map detail_page slugs -> record ids.
  const details = await getJson<Array<{ id: number; acf?: { slug?: string; label?: string } }>>(
    '/wp/v2/detail_page?per_page=100&acf_format=standard&_fields=id,acf'
  );
  const idBySlug = new Map<string, number>();
  for (const d of details) if (d.acf?.slug) idBySlug.set(d.acf.slug, d.id);

  console.log('Detail-page changes:');
  for (const c of DETAIL_CHANGES) {
    const id = idBySlug.get(c.slug);
    const parts = [
      c.menu_order !== undefined ? `order=${c.menu_order}` : '',
      c.label ? `label="${c.label}"` : '',
      c.title ? `title="${c.title}"` : '',
      c.navHrefOverride !== undefined ? `navHref="${c.navHrefOverride}"` : '',
      c.parentSection !== undefined ? `parentSection="${c.parentSection}"` : '',
    ].filter(Boolean).join('  ');
    if (!id) { console.log(`  MISSING  ${c.slug}`); continue; }
    console.log(`  ${c.slug.padEnd(28)} ${parts}`);
    if (DRY_RUN) continue;
    const acf: Record<string, string> = {};
    if (c.label) acf.label = c.label;
    if (c.title) acf.title = c.title;
    if (c.navHrefOverride !== undefined) acf.nav_href_override = c.navHrefOverride;
    if (c.parentSection !== undefined) acf.parent_section = c.parentSection;
    const body: Record<string, unknown> = {};
    if (c.menu_order !== undefined) body.menu_order = c.menu_order;
    if (Object.keys(acf).length) body.acf = acf;
    const r = await fetch(`${WP_URL}/wp/v2/detail_page/${id}`, {
      method: 'POST', headers: authHeaders(), body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error(`update ${c.slug} -> ${r.status} ${await r.text()}`);
  }

  console.log('\nSection-page changes:');
  for (const s of SECTION_CHANGES) {
    const pages = await getJson<Array<{ id: number; slug: string }>>(
      `/wp/v2/pages?slug=${encodeURIComponent(s.slug)}&_fields=id,slug`
    );
    const id = pages[0]?.id;
    console.log(`  ${s.slug.padEnd(12)} title="${s.title}"` + (id ? '' : '  MISSING'));
    if (!id || DRY_RUN) continue;
    const r = await fetch(`${WP_URL}/wp/v2/pages/${id}`, {
      method: 'POST', headers: authHeaders(),
      body: JSON.stringify({ acf: { title: s.title, label: s.label } }),
    });
    if (!r.ok) throw new Error(`update section ${s.slug} -> ${r.status} ${await r.text()}`);
  }

  if (DRY_RUN) { console.log('\nDry run complete. No changes written.'); return; }
  if (!WP_USER || !WP_APP_PASSWORD) { console.error('\nMissing WP_USER / WP_APP_PASSWORD.'); process.exit(1); }
  console.log('\nDone.');
}

main().catch((e) => { console.error('\nFailed:', e.message); process.exit(1); });
