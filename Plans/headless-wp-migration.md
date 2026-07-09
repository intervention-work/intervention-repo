# Headless WordPress Migration Plan

## Goal

WordPress becomes the CMS (marketing edits content there). Next.js on Vercel renders everything using the existing design. New WP pages automatically inherit the design.

## Architecture

```
WordPress (interventiodev.wpenginepowered.com)
  — marketing edits content here
  — ACF fields hold structured data
         |
         | WP REST API
         v
Next.js on Vercel
  — renders all pages using existing design
  — ISR: pages regenerate every hour or on-demand webhook
         |
         | domain
         v
intervention.com
```

---

## What Moves to WordPress vs Stays Hardcoded

### Moves to WordPress (editorial content)

| Content | WP Structure |
|---|---|
| Intervention, Services, Resources sections | WP Pages + ACF field group `section_page` |
| Detail pages (intervention children x6, services x7) | `detail_page` CPT + ACF |
| Phone, email | ACF Options page `global_settings` |
| Nav menus, footer links | WP nav menus (medium priority) |
| FAQ, testimonials, how-it-works copy | WP Options or CPT (medium priority) |

### Stays Hardcoded in Next.js (UI/design constants)

| Content | Location | Reason |
|---|---|---|
| Hero stats (20+ Years, etc.) | `hero.tsx` | Tied to animation code |
| Hero CTA copy | `hero.tsx` | Core brand copy |
| HowItWorks steps | `how-it-works.tsx` | Infrequent change |
| Specialties tabs | `services.tsx` | Tied to crossfade/image UI |
| TrustedBy org list | `trusted-by.tsx` | Certifications rarely change |
| MediaStrip outlets | `media-strip.tsx` | Static brand asset |
| CtaBanner copy | `cta-banner.tsx` | Core brand copy |
| TypeScript types | `src/content/site.ts` | Rendering interfaces, not content |

---

## WordPress Plugins to Install (Phase 0)

Install on `interventiodev.wpenginepowered.com` in this order:

1. **ACF PRO** (paid) — required for Flexible Content fields and Options Pages. Free version will not work.
2. **Custom Post Type UI** — register the `detail_page` CPT without writing PHP.
3. **ACF to REST API** — exposes ACF fields on WP REST endpoints (`?acf_format=standard`).

---

## ACF Field Groups

### Group 1: `section_page`
Applied to: WP Pages with slugs `intervention`, `services`, `resources`

```
label             (text)
title             (text)
summary           (textarea)
intro             (textarea)
image             (image — return URL)
childrenEyebrow   (text)
childrenTitle     (text)
content_blocks    (flexible content)
  Layout: body_block       → heading (text), body (textarea)
  Layout: bullets_block    → heading (text), bullets (repeater: item)
  Layout: stats_block      → heading (text), stats (repeater: value, label)
  Layout: features_block   → heading (text), features (repeater: title, body)
  Layout: steps_block      → heading (text), steps (repeater: title, body)
faq               (repeater: q, a)
```

### Group 2: `detail_page`
Applied to: `detail_page` CPT items

Same fields as `section_page` plus:
```
slug              (text — used for URL)
parent_section    (select: intervention | services | resources)
```

### Group 3: `global_settings`
Applied to: ACF Options Page

```
phone_display     (text)    e.g. "(800) 789-1605"
phone_href        (text)    e.g. "tel:+18007891605"
email             (text)    e.g. "help@intervention.com"
```

---

## Migration Phases

### Phase 0 — WordPress Setup (1 day, no code changes)
1. Install ACF PRO, Custom Post Type UI, ACF to REST API
2. Register `detail_page` CPT via CPTUI (public: false, has REST API: true)
3. Create ACF field groups for `section_page`, `detail_page`, `global_settings`
4. Create ACF Options Page and fill in phone/email
5. Create WP Pages: `intervention`, `services`, `resources`
6. Enter `resources` section content into WP as a test
7. Verify REST shape: `GET /wp-json/wp/v2/pages?slug=resources&_fields=acf,title,slug`

### Phase 1 — WP Client + Wire `resources` Page (2-3 days)
1. Remove `output: 'export'` and `WP_EXPORT` branching from `next.config.ts`
2. Add env vars to Vercel: `NEXT_PUBLIC_WP_API_URL`, `NEXT_REVALIDATE_SECONDS`
3. Create `/src/lib/wp.ts`:
   - `fetchSection(slug)` — fetch WP page by slug, map ACF to `Section` type
   - `fetchDetail(parentSlug, detailSlug)` — fetch `detail_page` CPT item
   - `fetchGlobalSettings()` — fetch Options page ACF fields
   - `mapAcfToContentBlock()` — adapter for Flexible Content to `ContentBlock[]`
4. Update `resources/page.tsx`: replace `getSection('resources')` with `await fetchSection('resources')` + `export const revalidate = 3600`
5. Deploy to Vercel preview, verify identical rendering

### Phase 2 — Wire `intervention` Section + Detail Pages (2-3 days)
1. Enter all 6 intervention children into WP as `detail_page` CPT items
2. Update `intervention/page.tsx` to async-fetch from WP
3. Update `intervention/[slug]/page.tsx`:
   - `generateStaticParams` fetches slugs from WP
   - `getDetail` replaced with `await fetchDetail('intervention', slug)`
   - Add `export const revalidate = 3600`
4. Smoke-test all 6 detail pages

### Phase 3 — Wire `services` Section + Detail Pages (2 days)
Same pattern as Phase 2 for the 7 services children.

### Phase 4 — Nav + Global Settings (1 day)
1. Update `nav.tsx` to fetch phone/email from `fetchGlobalSettings()`
2. Update `footer.tsx`, `detail-page.tsx`, `contact-view.tsx` for the same
3. Move nav dropdown items to fetch from WP so marketing can edit nav structure

### Phase 5 — Standalone Content Pages (1-2 days)
Pull `about/page.tsx`, `family-class/page.tsx`, `insurance/page.tsx` into WP as regular Pages.
Each gets the same `section_page` field group. Replace JSX-inlined `ContentPage` props with async fetches.

### Phase 6 — Cleanup (1 day)
1. Delete `/src/content/site.ts`
2. Remove all imports of `site.ts`
3. Remove `build:wp`, `deploy:wp` scripts from `package.json`
4. Delete `src/lib/asset.ts`

---

## next.config.ts After Migration

Remove the `isWpExport` branch entirely. Final config:

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'api.dicebear.com' },
      { protocol: 'https', hostname: 'interventiodev.wpenginepowered.com' },
    ],
  },
  transpilePackages: [
    '@radix-ui/react-navigation-menu',
    '@radix-ui/react-accordion',
    '@radix-ui/react-dialog',
    'lenis',
    'motion',
  ],
  redirects: async () => [
    { source: '/v2', destination: '/', permanent: true },
    { source: '/resources/trainings', destination: '/resources', permanent: true },
    { source: '/resources/blog', destination: '/resources', permanent: true },
  ],
};

export default nextConfig;
```

## Vercel Environment Variables

| Variable | Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_WP_API_URL` | `https://interventiodev.wpenginepowered.com/wp-json` | WP REST base URL |
| `NEXT_REVALIDATE_SECONDS` | `3600` | ISR: 1 hour revalidation |
| `WP_EXPORT` | remove | No longer needed |
| `NEXT_PUBLIC_BASE_PATH` | remove | No longer needed |

## On-Demand Revalidation (optional but recommended before go-live)

Install a WP plugin (or add a code snippet) that fires a POST to Vercel's revalidation endpoint on post-save:

```
POST https://your-vercel-domain.vercel.app/api/revalidate
  ?secret=YOUR_SECRET_TOKEN
  &path=/intervention/alcohol-intervention
```

This makes WP edits appear instantly instead of waiting up to 1 hour.

---

## Key Files to Change

| File | Change |
|---|---|
| `next.config.ts` | Remove export branch, add WP Engine to remotePatterns |
| `src/lib/wp.ts` | Create — typed WP REST client |
| `src/app/intervention/page.tsx` | Async fetch from WP |
| `src/app/intervention/[slug]/page.tsx` | Async fetch + dynamic generateStaticParams |
| `src/app/services/page.tsx` | Async fetch from WP |
| `src/app/services/[slug]/page.tsx` | Async fetch + dynamic generateStaticParams |
| `src/app/resources/page.tsx` | Async fetch from WP |
| `src/components/nav.tsx` | Fetch phone/email from WP Options |
| `src/components/footer.tsx` | Fetch phone/email from WP Options |
| `src/components/detail-page.tsx` | Fetch phone/email from WP Options |
| `src/content/site.ts` | Delete in Phase 6 |
| `src/lib/asset.ts` | Delete in Phase 6 |
| `package.json` | Remove build:wp, deploy:wp scripts |

No component redesign required. All components already accept typed props — only the data source changes.

---

## Risk: ContentBlock Multi-Paragraph Body

The `ContentBlock.body` type is `string | string[]`. ACF textarea returns a plain string. Convention for multi-paragraph content: use newline (`\n`) as a delimiter in the WP textarea, then split in the adapter:

```ts
body: rawBody.includes('\n') ? rawBody.split('\n').filter(Boolean) : rawBody
```

Document this convention for the marketing team.
