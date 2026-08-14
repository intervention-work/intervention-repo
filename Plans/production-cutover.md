# Production Cutover: point intervention.com at the Next.js site

Right now:

- **intervention.com** = the old WordPress site (frontend + admin + REST API), on WP Engine.
- **intervention-repo-khaki.vercel.app** = the new Next.js site, reading content from WordPress.

Goal: make **intervention.com** serve the Next.js site, while WordPress keeps running as the headless backend at its own URL.

## The one idea you must understand

WordPress's images and internal links use its "Home URL," which today is `intervention.com`. So you cannot just move the domain to Vercel, WordPress first has to move to a **new permanent URL**, otherwise every image (`intervention.com/wp-content/...`) breaks the moment the domain points to Vercel.

Pick the WordPress backend URL (either works, the code doesn't care, it is one env var):

- **Option A (simplest):** the WP Engine install URL, e.g. `https://<install>.wpenginepowered.com` (already exists, no setup).
- **Option B (cleaner):** a subdomain like `https://cms.intervention.com` (needs a domain + SSL added in WP Engine).

Below, `CMS_URL` = whichever you pick.

## The code is already ready

No code changes are needed. The site reads the WordPress host from one env var (`NEXT_PUBLIC_WP_API_URL`); image domains and links follow it automatically. `intervention.com` is already the canonical front-end URL in metadata/sitemap.

---

## Prep (do anytime, zero user impact)

1. **Get `CMS_URL`.** WP Engine dashboard, your site, copy the `*.wpenginepowered.com` URL (Option A). For Option B, add `cms.intervention.com` in WP Engine (Domains) and let its SSL issue.
2. **Add the domain in Vercel.** Vercel, project, Settings, Domains, add `intervention.com` and `www.intervention.com`. Vercel shows the DNS records it wants. **Note them, don't change DNS yet.**
3. **Lower DNS TTL.** At your DNS provider, set the TTL on intervention.com's records to 300s (5 min), a day before cutover, so the switch propagates fast.

---

## Cutover (one short coordinated window)

Do these in order.

1. **Move WordPress to `CMS_URL`.**
   - In WP Engine, set the site's **primary domain** to `CMS_URL` (or in WP Admin, Settings, General, set both "WordPress Address" and "Site Address" to `CMS_URL`).
   - Run a database search-replace `intervention.com` -> `CMS_URL` so existing media/links update (WP Engine support can do this, or the "Better Search Replace" plugin). Skip the `/wp-json` REST paths, they're relative.
   - Verify: `CMS_URL/wp-admin` loads, `CMS_URL/wp-json/wp/v2/pages` returns data.

2. **Point the Next.js site at the new WordPress URL.**
   - Vercel, Settings, Environment Variables: set `NEXT_PUBLIC_WP_API_URL = https://CMS_URL/wp-json` (Production).
   - Redeploy (Vercel, Deployments, redeploy latest) so the build picks up the new host and image domains.
   - Verify on the **Vercel URL** that pages still render and images load (they now come from `CMS_URL`).

3. **Switch the domain DNS to Vercel.**
   - At your DNS provider, change `intervention.com` (and `www`) from WP Engine's records to the Vercel records from Prep step 2.
   - Wait for propagation + Vercel SSL (minutes, up to ~1 hour).

4. **Verify the switch.**
   - `intervention.com` now serves the Next.js site (check `intervention.com/insurance`, `/trainings/...`).
   - `intervention.com/wp-admin` no longer exists, WordPress admin is now `CMS_URL/wp-admin`.

---

## Post-cutover

1. **Fix revalidation.** WP Admin (`CMS_URL/wp-admin`), Global Settings, set **Revalidation URL** = `https://intervention.com` (the new front end). Secret unchanged. This keeps "edit in WP, see it live in ~1 min" working.
2. **Tell the WP team the new admin URL** (`CMS_URL/wp-admin`) and update the team guides (`Plans/wp-team-guides/`), find-and-replace the admin URL, re-export PDFs.
3. **Search Console.** Submit `https://intervention.com/sitemap.xml`, confirm the old WordPress URLs 301 to their new equivalents.
4. **Keep `NEXT_PUBLIC_SITE_URL`** unset or `https://intervention.com` (it already defaults there), canonicals/OG stay correct.

## Rollback (if anything breaks)

1. Revert `intervention.com` DNS back to WP Engine, WordPress serves the old site again within the TTL.
2. Revert `NEXT_PUBLIC_WP_API_URL` on Vercel.
3. Set WordPress primary domain back to `intervention.com`.

Because DNS is the last step, a rollback is just "point DNS back", low risk.

## Who does what

- **You / DNS admin:** DNS records, TTL (Prep 3, Cutover 3).
- **WP Engine / WP admin:** WordPress URL move + search-replace (Cutover 1), revalidation setting (Post 1).
- **Vercel admin:** add domain, set env var, redeploy (Prep 2, Cutover 2).
- **Code:** nothing, already env-driven.
