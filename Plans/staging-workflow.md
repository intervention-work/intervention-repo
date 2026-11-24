# Staging and release flow

Two Amplify apps, two long-lived branches. Nothing reaches production without passing through staging.

| Branch | Amplify app | URL | Purpose |
|---|---|---|---|
| `staging` | `intervention-staging` | `https://staging.<app-id>.amplifyapp.com` (see Amplify console) | Review by PM / team lead |
| `main` | production app | https://intervention.com | Live site |

`staging` always exists. Never delete it. `main` only changes through a PR from `staging`.

## Day-to-day flow

1. Update your local staging: `git checkout staging && git pull`.
2. Make the change (or branch off staging for larger work and merge it back into `staging`).
3. Push to `staging`: `git push origin staging` (also `git push karooli staging`).
4. Amplify builds the staging app automatically. Open the staging URL and check the change.
5. Share the staging URL with the PM / team lead. Wait for the green signal.
6. Open a PR `staging` -> `main` (use the PR template, record who approved). Merge it.
7. Amplify builds production from `main`. Verify on https://intervention.com.
8. Sync back: `git checkout staging && git pull origin main` so the branches stay level.

Hotfix: still goes through staging (fast review is fine). Do not push directly to `main`.

## Rules

- Do not push to `main` directly. Protect it in GitHub (see `Plans/staging-setup-guide.md`).
- A GitHub Action (`.github/workflows/enforce-staging-flow.yml`) fails any PR to `main` whose source branch is not `staging`.
- Staging is not indexable: robots.txt disallows everything and every response carries `X-Robots-Tag: noindex, nofollow`. This is driven by `NEXT_PUBLIC_SITE_ENV=staging`, set on the staging app only. Never set it on production.
- Staging reads the same WordPress as production (`interventions.wpenginepowered.com`), so WordPress content edits show on both. Staging isolates code changes, not WP content.

## Staging app environment variables

| Var | Value |
|---|---|
| `NEXT_PUBLIC_WP_API_URL` | `https://interventions.wpenginepowered.com/wp-json` |
| `NEXT_PUBLIC_SITE_ENV` | `staging` |
| `NEXT_PUBLIC_SITE_URL` | the staging Amplify URL (no trailing slash) |
| `REVALIDATE_SECRET` | a different secret from production |
| `NEXT_REVALIDATE_SECONDS` | `3600` |
