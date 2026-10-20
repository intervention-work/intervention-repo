# Weekly Development Log

Running ledger of what shipped each week on intervention.com. Two tracks per week: Website Development and SEO. Weeks run Monday to Sunday, newest at top. Dates in ISO (YYYY-MM-DD).

Sources: git log (code commits), WordPress REST actions taken in session (WP data writes), and manual operations in GSC/HubSpot/GA4 that were part of a shipped change.

---

## Week of 2026-10-19  (Oct 19 to Oct 25)

### Website Development
- 2026-10-20: IndexNow helper `src/lib/indexnow.ts` added; `/api/revalidate` now fires IndexNow in the background on every revalidation (fire and forget, 5s timeout per endpoint).
- 2026-10-20: `scripts/indexnow-submit-sitemap.ts` added with `npm run indexnow:bulk` to bulk-submit all sitemap URLs on demand.
- 2026-10-20: Footer gets a `Learn More` row (About, Interventions, Services, Resources, Family Class, Blog) and `Breakfree Training` added to the Additional Services column, giving sitewide links to pages Ahrefs flagged as under-linked.

### SEO
- 2026-10-20: IndexNow wired for sub-minute Bing / Yandex / ChatGPT-browse indexing on every WP save. Verification key `d6925beeb11ccbd7c998d9032be1a0ce` hosted at `/d6925beeb11ccbd7c998d9032be1a0ce.txt`.
- 2026-10-20: Code-level sweep for Ahrefs-flagged issues. No mixed-content internal links in `src/` or `next.config.ts` (only hit was the SVG XML namespace in `globals.css`, not a link). No hard-coded hrefs in `src/` pointing to any `next.config.ts` redirect source. Remaining redirect-chain links (114 pages flagged) are inside WordPress-fetched content and already auto-rewritten by `INTERNAL_LINK_REWRITES` in `src/lib/wp.ts` for brad-lamm, jacob-hardt, substance-use. Canonicals checked across `src/app/`, all one-per-page and matching their route.
- 2026-10-20: Footer link additions above restore internal-link coverage to foundational routes Ahrefs flagged under the "only one dofollow incoming internal link" issue (68 pages).

---

## Week of 2026-10-12  (Oct 12 to Oct 18)

### Website Development
- 2026-10-12: `f29fa77`, `c6460b1` Breakfree page restored per client feedback (layout, spacing, how-it-works, section-landing, page-hero, globals). Author: Vaibhav.
- 2026-10-12: `e87c301` training CTA callout component added, headless setup plugin bumped to v2.5.0 (adds `rest_url` filter fixing CORS 400 on admin REST writes).
- 2026-10-12: `d4f2839` Elementor-regenerated hero images (bist badge, Brad Lamm portrait) suppressed via sanitizer on training page.
- 2026-10-12: `6bc7f5e` moved image suppression to Block layer in `filterSuppressedBlocks` after discovering sanitizer path missed Elementor img widgets.
- 2026-10-12: `4a93fd0` empty commit to trigger Amplify rebuild and flush stale CloudFront edge cache.
- 2026-10-13: `d69d177` HubSpot tracking plus chat widget script added to `src/app/layout.tsx` (portal 46095144, loads `js.hs-scripts.com/46095144.js`).
- 2026-10-16: WP draft page 43563 (Breakfree and Assess native page) and detail_page CPT 43564 created via REST.
- 2026-10-16: Breakfree Journey Elementor `_elementor_data` cloned to draft 43563 with Breakfree and Assess copy (hero, services bar shortcode, three heading plus text sections, team shortcode).
- 2026-10-17: HubSpot CAPTCHA removed from Contact Us Form 2025 (manager action in HubSpot UI, unblocks native-form submissions).
- 2026-10-17: HubSpot Chatflow confirmed Live on intervention.com (Connie virtual assistant pops up in incognito test).

### SEO
- 2026-10-12: `e87c301` robots.txt tightened: disallow `/wp-admin`, `/wp-login.php`, `/wp-includes/`, `/wp-content/plugins|themes|mu-plugins/`, `/index.php`, `/xmlrpc.php`; explicit allow `/wp-content/uploads/`.
- 2026-10-12: GSC "Blocked by robots.txt" count expected to drop from the asset-proxy chain (down to 1 URL).
- 2026-10-17: 9 state-page titles shortened via `post_title` update: new-jersey (87 to 48), wisconsin (87 to 47), chicago (84 to 49), maine (82 to 43), kansas (77 to 44), connecticut (75 to 43), washington-dc (73 to 52), minnesota (71 to 47), iowa (64 to 42). Side effect: editorial H1 shortened too (Rank Math meta path returned 200 but did not persist).
- 2026-10-17: ISR revalidation hit for all 9 state slugs.

---

## Week of 2026-10-05  (Oct 5 to Oct 11)

### Website Development
- 2026-10-06: `cf5f174` extracted `help-rail` and `insurance-rail` components; cleaned up insurance and interventionists-by-state pages.
- 2026-10-06: `aa4dcce` + `8e66506` layout.tsx tag manager and analytics scripts wiring.
- 2026-10-07: `4b08a1a` expose server env vars to Next.js runtime via `amplify.yml` (fixes missing env on prod build).
- 2026-10-07: `7722fdb` WordPress Team Handbook v2 PDF added to `Plans/`.
- 2026-10-07: `60994eb` headless setup plugin update; `src/lib/wp.ts` and sitemap tweaks.
- 2026-10-08: `c4cdd8b` blog list pagination added (new `page/[page]/page.tsx` route), state-grid and footer polish.
- 2026-10-08: `dd175f7` contact page, layout, sitemap and `src/lib/seo.ts` updates (adds `stripBakedTitleSuffix` to strip Rank Math suffix).
- 2026-10-11: `0be88e2` HubSpot embed fallback added to contact-view when native form is CAPTCHA-blocked; `wp.ts` `normalizeTelHref` for CTM.
- 2026-10-11: `6dfcc6a` `src/components/analytics-events.tsx` added, fires `click_to_call`, `click_to_contact`, `click_to_email`, `form_submit`, `generate_lead` directly to gtag (bypasses broken GTM triggers).

### SEO
- 2026-10-05: `ae588e0` corrected GA4 Measurement ID to `G-185595BY9R` for property 326681126.
- 2026-10-06: `4235e6a` `src/lib/suppressed-services.ts` created (suppresses Concierge Assessment / On-Set Care Unit from cards, nav, related grids, service title matches). Services and sitemap updated to filter.
- 2026-10-06: `372de95` 5 permanent 301s added in `next.config.ts` (brad-lamm, jacob-hardt, substance-use); hero and `wp.ts` touched.
- 2026-10-07: `1b96055` more redirects in `next.config.ts` (sibling sitemap and legacy paths).
- 2026-10-08: `1f2eac9` further `next.config.ts` redirects (incl. `/sitemap_index.xml` to `/sitemap.xml`).
- 2026-10-08: `dd175f7` `stripBakedTitleSuffix` strips Rank Math `– Intervention.com (Change Institute)` suffix at render.
- Oct 5 to 11: sitemap doubled-host bug fixed via `linkToPath` using `new URL(link).pathname`; `/about` canonical standardized to `/about-us` with legacy redirect.
- Oct 5 to 11: GSC and Bing sitemap resubmitted after sitemap and redirects landed.

---

## Week of 2026-09-28  (Sep 28 to Oct 4)

### Website Development
- 2026-09-29: `59d5107` typography and component polish across our-team, contact-view, content-page, detail-page, footer, hero, hubspot-form, resource-form-section, section-landing, services.
- 2026-10-02: `fd7fd46` `public/analytics.txt` verification file added.
- 2026-10-02: `2a2c8e4` prod component sweep (globals.css, layout, team-client, services, brad-lamm, certifications, contact-view, content-blocks, content-page, cta-banner, footer, hero, how-it-works, icon-list, media-strip, nav, section-landing, state-grid).
- 2026-10-02: `6b4d80a`, `8549fe7`, `c372406`, `5f9191a`, `bcbd5b4`, `38dbe40` redeploys from owner account (services component tweaks).
- 2026-10-03: `ad0dc60` Change Institute logo and icon assets added (`change-insititue-icon.{png,svg}`, `change-insititue-logo.{png,svg}`), footer updated to render them.
- 2026-10-04: `c43b6aa` prevent build-time pre-render on `/interventionists-by-state` (keeps WP Engine rate limit from failing CI).

### SEO
- 2026-10-04: `5b410be` em dashes removed from OG and page metadata titles (prevents SERP display issues from stray punctuation).

---

## How this log is maintained

Updated at the end of each session when something ships or lands. See CLAUDE.md "Weekly log maintenance" section for the rule.
