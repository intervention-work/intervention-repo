# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

---

## Commands

```bash
npm run dev          # dev server (next dev) — live WP data, no cache
npm run build        # production build (next build)
npm run start        # serve production build (next start)
npx tsc --noEmit     # type-check only (no build artifact)
npx tsx scripts/verify-content.ts   # parse-safety check across all WP pages/posts
python scripts/render-check.py http://localhost:3100   # 16-page spot render (needs Playwright + running server)
```

There is no `lint` script. TypeScript strict mode catches most issues.

---

## Architecture

### What this is

Headless WordPress + Next.js. WordPress (on WP Engine at `interventiodev.wpenginepowered.com`) is the content store only; editors write there. Next.js on Vercel is the frontend. The two are connected by the WP REST API. All 130+ pages share ~5 templates, so restyling means editing a template, not 130 files.

### The pipeline (must not be bypassed)

```
WordPress REST API
  -> src/lib/wp.ts          fetch + sanitize + dedupe/retry/rate-limit
  -> src/lib/wp-parse.ts    DOM walk: Elementor widget tree -> Block[]
  -> src/components/wp-content.tsx   Block[] -> design-system React
  -> ContentPage / DetailPage / SectionLanding (page shells)
```

**Hard rules:**
- `src/lib/wp.ts` is the ONLY file that talks to WordPress. Never `fetch()` WP elsewhere.
- All WP HTML must pass through `sanitizeWpHtml` before render. No raw `dangerouslySetInnerHTML`.
- `src/app/[...slug]/page.tsx` (catch-all) must keep `generateStaticParams -> []` and `dynamicParams = true`. Prerendering the long tail causes WP Engine rate-limit failures.
- New content shapes get a new `Block` kind in `wp-content-parse.ts` + a branch in `WpContent`. Never fork a second renderer.
- `revalidate = 3600`; on-demand ISR via `POST /api/revalidate` (WordPress pings this on save).

### Routes

| Route | Shell | Data source |
|---|---|---|
| `/` | `src/app/page.tsx` | Hand-authored home sections (hero, FAQ, etc.) |
| `/intervention`, `/services`, `/resources` | `SectionLanding` | `fetchSection()` |
| `/intervention/[slug]`, `/services/[slug]` | `DetailPage` | `fetchDetail()` or WP page fallback |
| `/intervention-blog` | `BlogList` | `fetchBlogIndex()` |
| `/contact` | `ContactView` + `HubSpotContactForm` | Static shell |
| `/[...slug]` (catch-all) | `ContentPage` | `fetchWpPage()` or `fetchWpPost()` |

### Key files

| File | Purpose |
|---|---|
| `src/lib/wp.ts` | WP fetch (semaphore, dedupe, backoff), `sanitizeWpHtml`, all `fetch*` helpers, `mapWpContent`, `fetchNav`, `fetchGlobalSettings` |
| `src/lib/wp-parse.ts` | DOM parser (node-html-parser). Walks Elementor widget tree, maps each `elementor-widget-{type}` to a `Block`. Add new widget handling here. |
| `src/lib/wp-content-parse.ts` | Shared `Block` / `Card` / `Section` types + pure helpers (`stripTags`, `wordCount`). No parsing logic here. |
| `src/components/wp-content.tsx` | Renders `Block[]` into design-system components. One-stop shop for how WP content looks on screen. |
| `src/components/heading.tsx` | Canonical `<Heading level={2|3|4}>` — every heading must go through this. |
| `src/components/hubspot-form.tsx` | Native contact form (16 fields) posting to HubSpot Forms API. See CAPTCHA note below. |
| `src/components/wp-prose.module.css` | Typography tokens for WP-rendered prose (shared across all content pages). |
| `src/content/types.ts` | TypeScript shape contracts for `Section`, `DetailContent`, `ContentBlock`. |
| `src/lib/settings.tsx` | `SettingsContext` — phone/email injected from WP ACF options, not hardcoded. |
| `scripts/verify-content.ts` | Run before declaring work done. Checks parse coverage and flags hydration-hostile patterns across every WP page/post. |

### Design tokens

Tailwind v4 CSS-first theme (no `tailwind.config`). All tokens live in `src/app/globals.css` under `@theme`. Key custom colors: `sage-{50..900}`, `ink`, `ink-body`, `ink-muted`, `surface`, `border`. Fonts: `--font-display` (Source Serif 4, variable `--font-serif-display`) and `--font-sans` (DM Sans, variable `--font-dm-sans`), both loaded via `next/font/google` in `layout.tsx`.

### HubSpot form (contact page)

Portal `46095144`, form `4fd83930-97c1-4d8a-a51b-3fd18583507e`. Submits JSON to `https://api.hsforms.com/submissions/v3/integration/submit/...`. **Blocker:** HubSpot rejects submissions while "CAPTCHA (spam prevention)" is enabled on the form (`FORM_HAS_RECAPTCHA_ENABLED`). Client must turn it off in HubSpot (Forms > this form > Options). Until then the form shows a call-us fallback.

### Environment variables

| Var | Default | Purpose |
|---|---|---|
| `NEXT_PUBLIC_WP_API_URL` | `https://interventiodev.wpenginepowered.com/wp-json` | WP REST API base |
| `REVALIDATE_SECRET` | (required in prod) | Protects `/api/revalidate` endpoint |
| `NEXT_REVALIDATE_SECONDS` | `3600` | ISR window |

### Verification before declaring done

1. `npx tsc --noEmit` must pass.
2. `npm run build` must pass.
3. `npx tsx scripts/verify-content.ts` must report 0 flagged entries.
4. For render spot-checks: `npm run start` then `python scripts/render-check.py http://localhost:3000`. Do NOT use `render-check-all.py` (hammers WP Engine rate limiter).
