---
name: wp-nextjs-pipeline
description: >-
  Read BEFORE any architectural, routing, data-fetching, or UI/design change to
  intervention.com (headless WordPress → Next.js). Defines the WP→UI pipeline,
  the invariants that must not break, safe change recipes, required verification,
  and abort criteria. Invoke when editing src/lib/wp.ts, wp-content-parse.ts,
  components that render WP content, app routes, the ACF/CPT plugin, nav, or ISR.
---

# WP → Next.js Pipeline (guardrails for architecture & design changes)

intervention.com is **headless WordPress** (content authored in WP) rendered by
**Next.js on Vercel** in a new design. The hard requirement, learned the painful
way: **whatever is in WordPress must flow to the site automatically, in the new
design, with nothing hardcoded and nothing dropped.** This skill protects that
pipeline. Follow it, or abort the change (see the last section).

---

## 1. The pipeline (do not reroute this)

```
WordPress (interventiodev.wpenginepowered.com)
  · Pages + Posts (native content.rendered = the real editorial copy)
  · detail_page CPT + ACF (hero: label/title/summary/image, menu_order)
  · ACF options (phone/email) + custom REST: /intervention/v1/{settings,nav}
        │  WP REST API
        ▼
src/lib/wp.ts                 ← the ONLY WP data-access layer
  · wpFetch: concurrency cap + dedupe + retry/backoff (429/5xx)
  · sanitizeWpHtml: strip Elementor chrome → safe semantic HTML
  · fetchSection / fetchDetail / fetchPageBody / fetchWpPage / fetchWpPost
  · mapWpContent: split off the duplicated hero region
  · fetchNav / fetchGlobalSettings
        ▼
src/lib/wp-content-parse.ts   ← pure parser (sanitized HTML → Block[])
        ▼
src/components/wp-content.tsx ← Block[] → design-system templates
        ▼
Page shells (ContentPage / DetailPage) + routes → rendered UI
```

Every rendered page goes through **sanitize → parse → WpContent**. New page types
join the pipeline; they do not invent a parallel one.

---

## 2. Invariants — MUST NOT break

1. **No hardcoded content or nav.** Labels, copy, ordering, menus come from WP
   (ACF fields, `content.rendered`, the `/intervention/v1/nav` menu). Hardcoding
   was rejected twice by the user. Nav order = WP `menu_order`; nav structure =
   WP menu.
2. **All WP HTML passes through `sanitizeWpHtml`.** Never `dangerouslySetInnerHTML`
   with raw WP HTML. Sanitize strips scripts/Elementor wrappers, self-closes void
   tags, keeps image `src` **absolute**, rewrites internal links **relative**.
3. **No hydration-hostile HTML.** Two classes cause React #418 and are checked by
   the verifier: (a) **unbalanced `<a>`** (fixed via `balanceAnchors`), (b) any
   **block-level tag inside an inline fragment** that gets wrapped in `<p>`/heading/
   card-body. Never emit either.
4. **Hero de-duplication stays.** `mapWpContent` removes the leading eyebrow +
   heading + intro from the body so the hero shows them once. Removing it brings
   back the duplicated-hero bug.
5. **Catch-all stays ISR on-demand.** `src/app/[...slug]/page.tsx` must keep
   `generateStaticParams → []` + `dynamicParams = true`. Prerendering the ~120-page
   long tail at build re-triggers WP Engine rate-limit build failures.
6. **One data layer.** All WP access goes through `src/lib/wp.ts` (keeps caching,
   retry, sanitize consistent). Do not `fetch()` WP elsewhere.
7. **Reuse `WpContent`; don't fork renderers.** New content shapes get a new Block
   kind + template inside the shared component, applied to all pages at once.
8. **ISR + revalidation, not static export.** `revalidate = 3600`; WP save pings
   `/api/revalidate`. Do not reintroduce `output: 'export'`.

---

## 3. Architecture reference (files & responsibility)

| File | Responsibility — change with care |
|---|---|
| `src/lib/wp.ts` | WP fetch (dedupe/semaphore/backoff), `sanitizeWpHtml`, all `fetch*`, `mapWpContent`, `fetchNav`, settings. |
| `src/lib/wp-content-parse.ts` | Pure parser: `parseBlocks` (loose-text capture, `balanceAnchors`, button detect), `postProcess` (merge short lists → chips), `detectCards` (image+title+text+button → `card-group`), `groupSections` (split on H2). |
| `src/components/wp-content.tsx` | Block → templates: `Card`/`CardGrid`/`Carousel`, `ChipGrid`/`StateChip` (clickable vs plain), prose, buttons, images, tables, quotes. |
| `src/components/wp-prose.module.css` | Typography tokens for prose + headings + quotes. |
| `src/components/carousel.tsx` | Client carousel (≥5 cards). |
| `src/components/content-page.tsx` / `detail-page.tsx` | Page shells; render hero + `WpContent`. |
| `src/app/[...slug]/page.tsx` | Catch-all: any WP page/post by path, ISR on-demand. |
| `src/app/intervention|services/[slug]/page.tsx` | CPT detail, else WP-page fallback (prevents 404 on WP-menu links). |
| `src/app/intervention-blog/page.tsx` + `components/blog-list.tsx` | Blog index + client pagination. |
| `src/app/layout.tsx` | Fetches nav + settings once; wraps app. |
| `src/app/api/revalidate/route.ts` | On-demand ISR endpoint (secret-protected). |
| `scripts/intervention-headless-setup.php` | WP plugin: CPT, ACF groups, `/settings` + `/nav` endpoints, revalidation hooks. Bump the `ihs_field_groups_vNNN_imported` flag when field groups change; rebuild the zip. |
| `scripts/verify-content.ts` | Verification (see §5). |

---

## 4. Safe change recipes

**Restyle existing content (fonts/colors/spacing):** edit `wp-prose.module.css`
or the template classes in `wp-content.tsx`. Do not touch the parser. Re-run §5.

**Support a new content pattern (e.g. accordions, stat rows):**
1. Add a `Block` kind in `wp-content-parse.ts`; detect it in `parseBlocks`/post-process.
2. Add a template branch in `wp-content.tsx` (`BlockView`).
3. Keep detection strict so it doesn't swallow unrelated content.
4. Re-run §5; coverage and risk must stay 0.

**Add a new page/route:** prefer letting the catch-all handle it. If it needs a
bespoke shell, fetch via `src/lib/wp.ts`, run body through `mapWpContent` +
`WpContent`, and render hero from ACF/derived fields. Never hand-enter content.

**Change nav:** edit the WP menu (Appearance → Menus) — it flows via `fetchNav`.
Do not hardcode nav items in `nav.tsx`.

**Change WP fields/CPT:** edit the plugin, bump the import-flag version, rebuild
`scripts/intervention-headless-setup.zip`, and tell the user to re-upload it.

---

## 5. Required verification (before declaring done)

Run the pure-logic verifier — no server, no WP hammering:

```
npx tsx scripts/verify-content.ts
```

Must report **0 entries flagged** (checks: content coverage ≥ every page, sections
present, unbalanced anchors, block-in-inline). Then `npx tsc --noEmit` and a
production build (`npm run build`) must pass.

For spot render checks use `scripts/render-check.py` on a ~16-page sample via a
prod server (`next start`). **Do NOT** live-crawl all ~120 pages
(`render-check-all.py`): WP Engine rate-limits the burst and returns false HTTP
500s. Verify render-safety statically (the verifier) instead; confirm a suspect
page in isolation if needed.

---

## 6. Abort criteria — stop and explain, don't ship

Abort the change (and tell the user plainly why) if it would:

- **Hardcode** page content, labels, ordering, or nav that WP should own.
- **Bypass `sanitizeWpHtml`** or render raw WP HTML directly.
- Introduce **unbalanced anchors** or **block-in-inline** HTML (breaks hydration);
  the verifier flags this — a non-zero flag count is a hard stop.
- **Prerender the long tail** at build (removes catch-all `generateStaticParams → []`
  / `dynamicParams`), re-introducing rate-limited build failures.
- **Fork a second renderer** instead of extending `WpContent`, causing design drift.
- Make WP content **stop flowing** (e.g. reading a stale local copy, dropping the
  catch-all, or removing ISR/revalidation).
- Reintroduce `output: 'export'` or otherwise disable ISR.

When aborting: state which invariant (§2) it violates, what breaks downstream
(duplicated heroes / 404s / hydration errors / dropped content / rate-limited
builds), and the compliant alternative from §4.
