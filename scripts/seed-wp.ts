/**
 * Seed WordPress from src/content/site.ts
 *
 * One-time (idempotent) importer that pushes the intervention + services
 * sections and all their detail pages into WordPress via the REST API,
 * populating every ACF field. Safe to re-run: it upserts by slug.
 *
 * Usage:
 *   WP_URL=https://interventiodev.wpenginepowered.com \
 *   WP_USER='your-wp-username' \
 *   WP_APP_PASSWORD='xxxx xxxx xxxx xxxx xxxx xxxx' \
 *   npx tsx scripts/seed-wp.ts [--sections=intervention,services] [--dry-run]
 *
 * WP_APP_PASSWORD is a WordPress Application Password
 * (WP Admin > Users > your profile > Application Passwords).
 */

import { SECTIONS, type Section, type DetailContent, type ContentBlock } from '../src/content/site';

const WP_URL = (process.env.WP_URL ?? '').replace(/\/$/, '');
const WP_USER = process.env.WP_USER ?? '';
const WP_APP_PASSWORD = process.env.WP_APP_PASSWORD ?? '';
const DRY_RUN = process.argv.includes('--dry-run');

const sectionsArg = process.argv.find((a) => a.startsWith('--sections='));
const ONLY_SECTIONS = sectionsArg
  ? sectionsArg.split('=')[1].split(',').map((s) => s.trim())
  : ['intervention', 'services'];

if (!WP_URL || !WP_USER || !WP_APP_PASSWORD) {
  console.error('Missing env: WP_URL, WP_USER, WP_APP_PASSWORD are all required.');
  process.exit(1);
}

const AUTH = 'Basic ' + Buffer.from(`${WP_USER}:${WP_APP_PASSWORD}`).toString('base64');
const API = `${WP_URL}/wp-json/wp/v2`;

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: AUTH,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${init?.method ?? 'GET'} ${path} -> ${res.status}: ${text.slice(0, 400)}`);
  }
  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Image sideloading (dedupe by source URL)
// ---------------------------------------------------------------------------
const imageCache = new Map<string, number>();

async function sideloadImage(url: string): Promise<number | undefined> {
  if (!url) return undefined;
  if (imageCache.has(url)) return imageCache.get(url);
  if (DRY_RUN) {
    console.log(`  [dry-run] would sideload image ${url}`);
    imageCache.set(url, 0);
    return 0;
  }
  const imgRes = await fetch(url);
  if (!imgRes.ok) {
    console.warn(`  ! failed to download image ${url} (${imgRes.status})`);
    return undefined;
  }
  const buf = Buffer.from(await imgRes.arrayBuffer());
  const contentType = imgRes.headers.get('content-type') ?? 'image/jpeg';
  const ext = contentType.includes('png') ? 'png' : 'jpg';
  const filename = `seed-${imageCache.size + 1}-${Date.now()}.${ext}`;

  const res = await fetch(`${API}/media`, {
    method: 'POST',
    headers: {
      Authorization: AUTH,
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
    body: buf,
  });
  if (!res.ok) {
    console.warn(`  ! media upload failed for ${url}: ${res.status}`);
    return undefined;
  }
  const media = (await res.json()) as { id: number };
  imageCache.set(url, media.id);
  console.log(`  uploaded image -> media #${media.id}`);
  return media.id;
}

// ---------------------------------------------------------------------------
// ContentBlock -> ACF flexible content row
// ---------------------------------------------------------------------------
function bodyToString(body?: string | string[]): string {
  if (!body) return '';
  return Array.isArray(body) ? body.join('\n') : body;
}

function blockToLayout(block: ContentBlock): Record<string, unknown> {
  const base = {
    heading: block.heading ?? '',
    body: bodyToString(block.body),
  };
  if (block.steps?.length) {
    return { acf_fc_layout: 'steps_block', ...base, steps: block.steps.map((s) => ({ title: s.title, body: s.body })) };
  }
  if (block.stats?.length) {
    return { acf_fc_layout: 'stats_block', ...base, stats: block.stats.map((s) => ({ value: s.value, label: s.label })) };
  }
  if (block.features?.length) {
    return { acf_fc_layout: 'features_block', ...base, features: block.features.map((f) => ({ title: f.title, body: f.body })) };
  }
  if (block.bullets?.length) {
    return { acf_fc_layout: 'bullets_block', ...base, bullets: block.bullets.map((item) => ({ item })) };
  }
  return { acf_fc_layout: 'body_block', ...base };
}

async function buildBlocks(blocks: ContentBlock[] = []) {
  return blocks.map(blockToLayout);
}

function faqRows(faq?: { q: string; a: string }[]) {
  return (faq ?? []).map((f) => ({ q: f.q, a: f.a }));
}

// ---------------------------------------------------------------------------
// Upsert a WP Page for a section
// ---------------------------------------------------------------------------
async function upsertSectionPage(section: Section) {
  console.log(`\n== Section: ${section.slug} ==`);
  const imageId = section.image ? await sideloadImage(section.image) : undefined;

  const acf: Record<string, unknown> = {
    label: section.label,
    title: section.title,
    summary: section.summary,
    intro: section.intro,
    childrenEyebrow: section.childrenEyebrow,
    childrenTitle: section.childrenTitle,
    content_blocks: await buildBlocks(section.blocks),
    faq: faqRows(section.faq),
  };
  if (imageId) acf.image = imageId;

  const existing = await api<Array<{ id: number; slug: string }>>(
    `/pages?slug=${section.slug}&_fields=id,slug&status=any`
  );

  if (DRY_RUN) {
    console.log(`  [dry-run] would ${existing.length ? 'update' : 'create'} page "${section.slug}" with ${(acf.content_blocks as unknown[]).length} blocks`);
    return;
  }

  let pageId: number;
  if (existing.length) {
    pageId = existing[0].id;
    await api(`/pages/${pageId}`, { method: 'POST', body: JSON.stringify({ acf }) });
    console.log(`  updated page #${pageId} (${section.slug})`);
  } else {
    const created = await api<{ id: number }>(`/pages`, {
      method: 'POST',
      body: JSON.stringify({ title: section.label, slug: section.slug, status: 'publish', acf }),
    });
    pageId = created.id;
    console.log(`  created page #${pageId} (${section.slug})`);
  }
}

// ---------------------------------------------------------------------------
// Upsert a detail_page CPT item for a child, matched by acf.slug
// ---------------------------------------------------------------------------
async function upsertDetailPage(parentSlug: string, detail: DetailContent) {
  const imageId = detail.image ? await sideloadImage(detail.image) : undefined;

  const acf: Record<string, unknown> = {
    slug: detail.slug,
    parent_section: parentSlug,
    label: detail.label,
    title: detail.title,
    summary: detail.summary,
    intro: detail.intro ?? '',
    content_blocks: await buildBlocks(detail.blocks),
    faq: faqRows(detail.faq),
  };
  if (imageId) acf.image = imageId;

  if (DRY_RUN) {
    console.log(`  [dry-run] would upsert detail "${detail.slug}" (${parentSlug}) with ${(acf.content_blocks as unknown[]).length} blocks`);
    return;
  }

  const all = await api<Array<{ id: number; acf: { slug?: string } }>>(
    `/detail_page?per_page=100&_fields=id,acf&status=any`
  );
  const match = all.find((p) => p.acf?.slug === detail.slug);

  if (match) {
    await api(`/detail_page/${match.id}`, { method: 'POST', body: JSON.stringify({ acf }) });
    console.log(`  updated detail #${match.id} (${detail.slug})`);
  } else {
    const created = await api<{ id: number }>(`/detail_page`, {
      method: 'POST',
      body: JSON.stringify({ title: detail.label, status: 'publish', acf }),
    });
    console.log(`  created detail #${created.id} (${detail.slug})`);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log(`Seeding ${WP_URL}`);
  console.log(`Sections: ${ONLY_SECTIONS.join(', ')}${DRY_RUN ? '  (DRY RUN)' : ''}`);

  for (const section of SECTIONS) {
    if (!ONLY_SECTIONS.includes(section.slug)) continue;
    await upsertSectionPage(section);
    for (const child of section.children) {
      await upsertDetailPage(section.slug, child);
    }
  }
  console.log('\nDone.');
}

main().catch((err) => {
  console.error('\nSeed failed:', err.message);
  process.exit(1);
});
