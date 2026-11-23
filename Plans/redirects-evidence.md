# Redirect evidence (404 cleanup, 2026-11-23)

Method: pulled every URL the Wayback Machine holds for intervention.com (601 archived HTML URLs, 545 after normalizing), curled each on the live site (297 return 404, 141 since 2017), then kept a redirect only where there is proof of the destination. Sources of proof: (A) a 301 the old site itself served, as captured by the Wayback Machine; (B) slug or menu succession in archived captures; (C) identical page content; (D) the same URL family the site owners already redirect in the Rank Math export (`/wp-json/intervention/v1/redirects`, 76 rules). Intuition alone was not accepted.

Body-text overlap with live pages was measured too, but it is not used as proof: the live pages were rewritten, so overlap is low (0.00 to 0.07) even for true successors.

## Added to `next.config.ts` (all 301, no chains, all destinations return 200)

| Source | Destination | Proof |
|---|---|---|
| `/intervention/eating-disorder-intervention` | `/intervention/eating-disorder` | A: old site served this 301 on 2023-06-01 |
| `/intervention/mental-health-crisis-intervention` | `/intervention/mental-health-crisis` | A: old site served this 301 on 2023-06-01 |
| `/intervention/complex-trauma-intervention` | `/intervention/complex-trauma` | B: last capture 2022-07-02, new slug first captured 2022-10-05, same menu slot |
| `/intervention/mental-illness-intervention` | `/intervention/mental-health-crisis` | B: the 2021 crisis page carries the identical title "Mental Illness Intervention Programs and Services"; this page's last capture is 2021-04 |
| `/intervention/substance-use-intervention` | `/intervention/drug-alcohol-intervention` | B and D: succeeded by `/intervention/substance-use` (2022-10-05), which the owners and the existing rule send to drug-alcohol |
| `/intervention/alcohol` | `/intervention/drug-alcohol-intervention` | A and D: 2023 capture shows `/intervention/alcohol-intervention` was a 301 to `/intervention/alcohol`; the owners redirect `alcohol-intervention` here |
| `/intervention/drug` | `/intervention/drug-alcohol-intervention` | B and D: archived page links both `/intervention/drug` and `/intervention/drug-intervention` as the same page; owners redirect `drug-intervention` here |
| `/intervention/spectrum-intervention` | `/intervention` | B: 2021 stub page (no body), replaced in the same menu slot by Early Autism in 2022; early autism already forwards to `/intervention` |
| `/intervention-2` | `/intervention` | C: 2024-07-13 capture has the same title, H1 and phone as live `/intervention` (duplicate slug) |
| `/drug-rehab`, `/addiction-treatment/drug-rehab` | `/intervention` | A: old site served 301 to `/intervention` on 2022-03-07 |
| `/about-us/our-team` | `/our-team` | C: same page ("Our Team"), older path |
| `/states` | `/interventionists-by-state` | B and D: 2021 to 2022 state chooser; owners already forward `/intervention/interventionists-by-state` |
| `/our-services` | `/services` | B: 2022 menu lists "Our Services" as the services hub (thin page, medium confidence) |
| `/bist-training` | `/trainings/breakfree-intervention-skills-training` | B and C: archived page links its child registration pages under that path; identical title; 0.43 text overlap |
| `/about-us/accreditations`, `/about-us/fair-care-promise`, `/about-us/jcaho-accreditation` | `/about-us` | D: owners send `/about-us/jcaho-` and `/who-we-are/memberships-accreditations` to `/about-us` |
| `/interventionists/adam-banks`, `anisha-cooper`, `arthur-westinghouse`, `jonathan-rauch`, `pat-brashears` | `/interventionists-by-state` | D: owners send 13 sibling `/interventionists/<name>` profiles to the directory |
| `/our-blog/page/:n` | `/intervention-blog` | A and D: `/our-blog/page/2` was served 200 through 2026-02-16; owners redirect `/our-blog` to `/intervention-blog` |
| `/news`, `/news/page/:n` | `/intervention-blog` | D: owners send removed `/news/...` posts to the blog |
| `/intervention-blog/page/5` | `/intervention-blog` | live blog has 4 pages; archived page 5 was a blog listing |
| `/intervention-blog/category/{drug-interventionists,eating-disorders,mental-health,teens}` | `/intervention-blog` | all 4 blog category archives 404 now; archived pages were post listings |
| 9 root blog posts (`/4-signs-heroin-addiction`, `/8-life-lessons-survivors-addiction-list`, `/9-ways-alcohol-abuse-damages-health`, `/anorexia-facts-and-statistics`, `/how-not-to-die-at-a-concert`, `/importance-family-support-recovery-addict`, `/physical-emotional-effects-alcoholism`, `/things-that-might-surprise-you-about-male-anorexia`, `/toxic-relationships-addiction-cycle`) | `/intervention-blog` | D: owners send their removed posts to the blog; archived pages are articles with no live equivalent (checked by title and text) |
| 6 numbered pages (`/alcohol-interventions-527258`, `/drug-interventionist-527259`, `/drug-intervention-california-527260`, `/drug-interventions-for-lgbtq-527257`, `/eating-disorder-intervention-527265`, `/trauma-intervention-program-527261`) | `/intervention-blog` | D: owners send siblings 527262, 527263, 527264 to the blog |

## Left as 404 on purpose (retired)

`/care-unit-assessment`, `/on-set-care-unit`, `/resources/on-set-care-unit`, `/careunit`, careunit.net traffic, CARE detail pages 43497 and 43498.

## Not redirected, no provable destination

| Paths | Reason |
|---|---|
| `/find-a-rehab/**` (about 25), `/listings/**`, `/regions/**`, `/alcohol-rehab/**`, `/drug-rehab/{addiction,options,programs}`, `/addiction-treatment/**` (children), `/christian-drug-rehab`, `/holistic-drug-rehabs`, `/luxury-rehabs`, `/teenage-drug-rehab`, `/drug-rehab-veterans`, `/30-day-rehab` | rehab directory removed; no live equivalent, and no archived 301 for the children |
| `/category/*`, `/tag/*`, `/author/admin` (root WP archives, 2019 to 2021) | no archived redirect or owner rule; low value; add later if the GA4 paths show traffic |
| `/mental-health`, `/books`, `/scopes-of-practice/**`, `/form-testing`, `/jet-popup/**` | no live equivalent or utility pages |
| `/bist-registration-form`, `/bist-training/bist-confirmation`, `/bist-training/bist-registration-step-2`, `/trainings/.../bist-registration-step-2` | 2020 to 2022 event pages; only Step 1 exists live and it is excluded from the sitemap |
| `/interventionists/**` other than the five above, `/intervention/early-autism/` variants | none found, or already handled |
| Pre-2017 archive (about 150 URLs such as `/AISMembers/**`, `/add/**`) | decades old, no traffic expected |

## Pre-existing, noticed, not changed

Rank Math sends `/colorado`, `/california` and ten other state slugs to `/intervention/interventionists-by-state/<state>/`. Those destinations answer 200 today, so nothing is broken, but they are not the canonical `/interventionists-by-state/<state>` form.
