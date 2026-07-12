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
src/lib/wp-parse.ts           ← DOM parser: walks the Elementor widget tree
   (node-html-parser) and maps each elementor-widget-{type} → Block[].
   wp-content-parse.ts holds only the shared Block type + helpers.
        ▼
src/components/wp-content.tsx ← Block[] → design-system templates (server-parsed;
   pages pass Block[] so the HTML parser never ships to the client)
        ▼
Page shells (ContentPage / DetailPage) + routes → rendered UI
```

Every rendered page goes through **sanitize → parse → WpContent**. New page types
join the pipeline; they do not invent a parallel one.

---

## 2. Invariants — MUST NOT break

1. **No hardcoded or duplicated/parallel content.** Labels, copy, ordering, menus
   come from WP (ACF fields, `content.rendered`, the `/intervention/v1/nav` menu).
   Hardcoding was rejected twice. Nav order = WP `menu_order`; structure = WP menu.
   The WP `content.rendered` body is the source of truth — do NOT ALSO render a
   parallel ACF copy of the same content (e.g. the ACF `faq` field is only shown
   as a fallback when there's no body, else it duplicates the body's FAQ accordion).
2. **All WP HTML passes through `sanitizeWpHtml`.** Never `dangerouslySetInnerHTML`
   with raw WP HTML. Sanitize strips scripts/Elementor wrappers, self-closes void
   tags, keeps image `src` **absolute**, rewrites internal links **relative**, and
   **recovers Elementor heading widgets** (`elementor-heading-title` divs) as
   semantic `<h3>` — don't remove this or headings become plain body text.
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
9. **Content lifecycle must stay automatic.** New/edited/deleted/unpublished WP
   content must reach the site without a redeploy. Two mechanisms, both required:
   (a) catch-all + `[slug]` use `dynamicParams` so any new URL renders on first
   visit; (b) the plugin's revalidation hooks ping `/api/revalidate` on
   `save_post`, `transition_post_status`, `before_delete_post`, `acf/save_post`,
   and `wp_update_nav_menu`, covering pages, detail_pages, posts, their listing
   pages (`/intervention`, `/services`, `/intervention-blog`) and the layout/nav.
   Never make `generateStaticParams` enumerate the long tail, and never drop these
   hooks — doing either breaks add/delete propagation. Known accepted limits: a
   new detail/post does NOT auto-join the nav (nav = WP menu; add it there), and a
   slug change leaves the old URL cached until its ISR window.

---

## 3. Architecture reference (files & responsibility)

| File | Responsibility — change with care |
|---|---|
| `src/lib/wp.ts` | WP fetch (dedupe/semaphore/backoff), `sanitizeWpHtml`, all `fetch*`, `mapWpContent`, `fetchNav`, settings. |
| `src/lib/wp-parse.ts` | **DOM parser (primary)**: `parseWp(html)` walks the Elementor widget tree via node-html-parser and maps each `elementor-widget-{type}` to a Block; `mapWp(html, hero)` strips the hero region and returns `Block[]`. Widget→Block map + column/grid grouping (icon-cards, pricing, card-group, testimonials) live here. Add new widget handling in `extractWidget` + a Block kind. |
| `src/lib/wp-content-parse.ts` | Shared `Block`/`Card`/`Section` types + `stripTags`/`wordCount`/`groupSections` only (no parsing). |
| `scripts/screenshot-qa.py` | Full-page screenshots of pages for visual review (the real acceptance gate). |
| `src/components/wp-content.tsx` | Block → templates: `Card`/`CardGrid`/`Carousel`, `ChipGrid`/`StateChip` (clickable vs plain), prose, buttons, images, tables, quotes. |
| `src/components/heading.tsx` | Canonical `<Heading level={2\|3\|4}>` — the ONLY way headings render. Reused by `WpContent` (section/heading blocks) and `Card`. Keep all headings going through it. |
| `src/components/icon-list.tsx` | `IconList` — Elementor icon-list AND grouped icon-box widgets → icon-badge grid/rows (FA icon mapped to lucide). |
| `src/components/accordion.tsx` | `Accordion` — native `<details>`/`<summary>` (Elementor `n-accordion`), body via nested `WpContent`. No JS. |
| `src/components/carousel.tsx` | `Carousel` — reused by card groups (≥5), testimonials (≥3), and logo/image runs (≥5). |
| (in `wp-content.tsx`) `Testimonials` | Elementor testimonial/reviews carousel → quote cards in a `Carousel`. |
| `scripts/audit-widgets.ts` | Deep-dive: catalogs every Elementor widget type + structural pattern across all pages/posts. Run this FIRST when asked to componentize a new WP pattern. |
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

**Componentize a new WP/Elementor pattern (THE reusable-component workflow):**
1. Run `npx tsx scripts/audit-widgets.ts` to see which Elementor widgets/patterns
   exist and how many pages use them — prioritize by reach.
2. Inspect the real HTML of a representative page for that widget's structure/classes.
3. If the signal is a class/attribute or inline SVG that `sanitizeWpHtml` would
   strip, add a **sanitize pre-pass** that converts it to a durable sentinel
   (e.g. icon-list → `<li>[[icon:KEY]]Label</li>`; heading widget → `<h3>`).
4. Add a `Block` kind in `wp-content-parse.ts`; detect it in `parseBlocks`.
5. Build a reusable component and add a `BlockView` branch in `wp-content.tsx`.
6. Keep detection strict so it doesn't swallow unrelated content.
7. Re-run §5; coverage and risk must stay 0. Spot-render a page that uses it.

Patterns already componentized: heading (`elementor-heading-title`), icon-list
(`elementor-icon-list-items`), icon-box (`elementor-icon-box-title` → icon grid),
accordion (`n-accordion` → native `<details>`), testimonials/reviews (→ carousel),
image/logo carousel, pricing tables (repeating title+subtitle+$price+button →
`PricingCards`), card group (image+title+text+button), chip grid, buttons,
divider (`<hr>`), tables, quotes. All catalogued patterns are now covered.

KNOWN DATA LIMIT — two-column "photo beside text": on many Elementor pages the
side photo is a **CSS background image** defined in Elementor's generated
stylesheet (keyed by element ID), NOT an `<img>` in `content.rendered`. It is
therefore **absent from the REST payload and cannot be rendered** from the API.
Real `<img>` elements (bios, maps, content images) DO render. Don't waste effort
trying to reconstruct background-image columns — the data isn't there.

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
