# Page and Route Inventory (WordPress -> Next.js)

Generated 2026-07-17 from the WordPress REST API (interventiodev.wpenginepowered.com).

## Where the "131 pages" come from

The site does not have 131 hand-built pages. The number is the WordPress long tail:

| Source | Count | Route on the Next.js site |
|---|---|---|
| WP Pages (native) | 75 | Mirrored path, rendered by the catch-all or a dedicated shell |
| WP Posts (blog) | 47 | /intervention-blog/[slug] via the catch-all |
| detail_page CPT (service cards) | 13 | /intervention/[slug] or /services/[slug] |
| **Total WP entries** | **135** | |

Every entry flows automatically through the WP -> sanitize -> parse -> WpContent pipeline
(nothing is hardcoded), so "migrating" a page means its template renders it, not that anyone rebuilt it.
The crawl that found ~131 URLs is this same set minus a few unlinked utility pages.

## The 5 templates (already in place, reused across all pages)

| # | Template | Component | Used by |
|---|---|---|---|
| 1 | Home | src/app/page.tsx (Hero, HowItWorks, Testimonials, FAQ, CTA) | / only |
| 2 | Section landing (hub) | SectionLanding | /intervention, /services, /resources |
| 3 | Service detail | DetailPage | 13 detail_page CPTs under /intervention/* and /services/* |
| 4 | Content page (generic WP page) | ContentPage + WpContent blocks | The bulk: state/city SEO pages, does-my-X pages, about, insurance, family-class, legal |
| 5 | Blog | BlogList index + ContentPage prose for posts | /intervention-blog + 47 posts |

Contact is a one-off shell (ContactView) with the HubSpot form embed.

## Full inventory

### Core pages (template 1, 2, 4, one-off contact)
| Route | Title | Notes |
|---|---|---|
| / | Find an Interventionist & Help Your Loved One Get Better |  |
| /about-us/ | About Us: Our Mission and Values | Older duplicate of /about. Redirect to /about. |
| /about-us/faq/ | FAQ |  |
| /about/ | About |  |
| /breakfree-journey/ | Breakfree Journey | Also exists as a detail_page service card. Keep one canonical page. |
| /care-unit-assessment/ | CARE Unit Assessment | Also exists as a detail_page service card. |
| /contact/ | Contact |  |
| /does-my-child-need-a-drug-intervention/ | Does My Child Need a Drug Intervention? |  |
| /does-my-employee-need-a-drug-intervention/ | Does My Employee Need a Drug Intervention? |  |
| /does-my-friend-need-a-drug-intervention/ | Does My Friend Need a Drug Intervention? |  |
| /does-my-loved-one-need-a-drug-intervention/ | Does My Loved One Need A Drug Intervention? |  |
| /does-my-parent-need-a-drug-intervention/ | Does My Parent Need a Drug Intervention? |  |
| /does-my-sibling-need-a-drug-intervention/ | Does My Sibling Need a Drug Intervention? |  |
| /eyewitness-information/ | Eyewitness Information |  |
| /family-class/ | Family Class |  |
| /free-resources/ | Free Resources | Overlaps /resources. Consolidate. |
| /georgia/ | Addiction Intervention in Georgia | Stray duplicate of /interventionists-by-state/georgia. Redirect. |
| /insurance/ | Insurance |  |
| /intervention-blog/ | Intervention Blog |  |
| /intervention-help/ | Intervention Specialists | Legacy landing overlapping /intervention. Review, likely redirect. |
| /intervention-help/thank-you/ | Thank You |  |
| /intervention/ | Comprehensive Intervention Services: Your Path to Recovery |  |
| /iteam-information/ | iTeam Information |  |
| /recovery-care-management/ | Recovery Care  Management | Also exists as a detail_page service card. |
| /recovery-coach-companion/ | Recovery Coach Companion | Also exists as a detail_page service card. |
| /resources-3/ | Resources for Families and Individuals | Elementor duplicate of /resources ("resources-3" slug). Redirect to /resources. |
| /resources-3/on-set-care-unit/ | On Set Care Unit |  |
| /resources-3/podcast/ | Podcast |  |
| /resources/ | Resources |  |
| /senior-support-services/ | Senior Support Services | Also exists as a detail_page service card. |
| /services/ | Services |  |
| /trainings/ | Trainings |  |
| /trainings/breakfree-addiction-intervention-skills-training/ | BreakFree Intervention Skills Training |  |
| /trainings/breakfree-intervention-skills-training/ | Breakfree Intervention Skills Training |  |

### Interventionists by state tree (25 pages, template 4)

State pages and city pages. High SEO value, identical structure, all render via the catch-all with ContentPage.

| Route | Title | Notes |
|---|---|---|
| /interventionists-by-state/ | Interventionists by State |  |
| /interventionists-by-state/california/ | Drug Intervention Services in California |  |
| /interventionists-by-state/california/los-angeles/ | Professional Intervention Services in Los Angeles, CA |  |
| /interventionists-by-state/colorado/ | Addiction Intervention in Colorado |  |
| /interventionists-by-state/connecticut/ | Finding a Professional Interventionist in Connecticut: A Guide for Families |  |
| /interventionists-by-state/florida/ | Addiction Intervention in Florida |  |
| /interventionists-by-state/illinois/ | Addiction Intervention in Illinois |  |
| /interventionists-by-state/illinois/chicago/ | Navigating Recovery in the Windy City: Professional Intervention Services in Chicago |  |
| /interventionists-by-state/iowa/ | A New Perspective on Recovery: Professional Intervention in Iowa |  |
| /interventionists-by-state/kansas/ | Navigating the Path to Recovery: Professional Intervention Services in Kansas |  |
| /interventionists-by-state/maine/ | Restoring Hope in the Pine Tree State: Professional Intervention Services in Maine |  |
| /interventionists-by-state/massachusetts/ | Addiction Intervention in Massachusetts |  |
| /interventionists-by-state/michigan/ | Addiction Intervention in Michigan |  |
| /interventionists-by-state/minnesota/ | Finding a Path Forward: Professional Intervention Services in Minnesota |  |
| /interventionists-by-state/missouri/ | Addiction Intervention in Missouri |  |
| /interventionists-by-state/new-jersey/ | Restoring Balance in the Garden State: Professional Intervention Services in New Jersey |  |
| /interventionists-by-state/new-jersey/newark/ | Professional Intervention Services in Newark, New Jersey |  |
| /interventionists-by-state/new-york/ | Addiction Intervention in New York |  |
| /interventionists-by-state/new-york/new-york-city/ | Professional Intervention Services in New York City |  |
| /interventionists-by-state/pennsylvania/ | Addiction Intervention in Pennsylvania |  |
| /interventionists-by-state/tennessee/ | Addiction Intervention in Tennessee |  |
| /interventionists-by-state/washington-dc/ | A New Perspective on Recovery: Professional Intervention in Washington DC |  |
| /interventionists-by-state/washington/ | Addiction Intervention in Washington |  |
| /interventionists-by-state/wisconsin/ | Restoring Wellness in the Badger State: Professional Intervention Services in Wisconsin |  |

### /intervention children (7 pages, template 4 with DetailPage fallback)

| Route | Title | Notes |
|---|---|---|
| /intervention/alcohol-intervention/ | Alcohol Interventions: Professional Help from a Licensed Interventionist |  |
| /intervention/complex-trauma/ | Trauma Intervention Programs for Complex Trauma |  |
| /intervention/drug-alcohol-intervention/ | Drug or Alcohol Intervention Services |  |
| /intervention/drug-intervention/ | Comprehensive Guide to Drug Interventions |  |
| /intervention/early-autism/ | Early Autism Intervention |  |
| /intervention/eating-disorder/ | Eating Disorder Intervention Services |  |
| /intervention/mental-health-crisis/ | Mental Health Interventionist: Licensed Intervention Specialists |  |

### Service cards, detail_page CPT (13 entries, template 3)

| Title | menu_order |
|---|---|
| Interventionists By State | 1 |
| Senior Support Services | 1 |
| On-Set CARE Unit | 2 |
| Alcohol Intervention | 2 |
| CARE Unit Assessment | 3 |
| Drug Intervention | 3 |
| Recovery Care Management | 4 |
| Eating Disorder Intervention | 4 |
| Recovery Coach Companion | 5 |
| Mental Health Crisis Intervention | 5 |
| Early Autism Intervention | 6 |
| BreakFree Journey | 7 |
| Complex Trauma Intervention | 7 |

### Legal (template 4)

| Route | Title | Notes |
|---|---|---|
| /privacy-policy/ | Privacy Policy: Your Information Matters |  |
| /terms-and-conditions/ | Terms And Conditions |  |

### Blog posts (47, template 5)

| Route | Title |
|---|---|
| /intervention-blog/10-relatable-recovery-memes/ | The Top 10 Most Hilarious and Relatable Recovery Memes for Anyone with Addiction or Mental Illness |
| /intervention-blog/5-alarming-xanax-facts/ | 5 Alarming Xanax Facts |
| /intervention-blog/alcohol-interventions-step-by-step-guidance/ | Alcohol Interventions: Step-by-Step Guidance for Helping a Loved One |
| /intervention-blog/alcohol-interventions-support-loved-ones-breaking-free-from-addiction/ | Alcohol Interventions: How to Support Loved Ones in Breaking Free from Addiction |
| /intervention-blog/best-interventionist-in-the-united-states-finding-compassionate-and-effective-help/ | Best Interventionist in the United States: Finding Compassionate and Effective Help |
| /intervention-blog/better-intervention-help-someone-you-love/ | A Better Intervention: Helping Someone You Love |
| /intervention-blog/comprehensive-guide-to-drug-intervention-california-services/ | Comprehensive Guide to Drug Intervention California Services |
| /intervention-blog/defusing-the-tasty-timebomb/ | Defusing the Tasty Timebomb & Loving the Lungs You’re With |
| /intervention-blog/differences-bulimia-anorexia/ | Differences between Bulimia and Anorexia |
| /intervention-blog/different-types-of-addiction-intervention/ | What Are the Different Types of Addiction Intervention |
| /intervention-blog/drug-intervention-california-finding-effective-solutions-for-your-loved-one/ | Drug Intervention California: Finding Effective Solutions for Your Loved One |
| /intervention-blog/drug-interventions-lgbtqia-tailored-support-inclusive-addiction-recovery/ | Drug Interventions for LGBTQIA+: Tailored Support for Inclusive Addiction Recovery |
| /intervention-blog/eating-disorder-intervention-essential-steps-to-help-save-lives/ | Eating Disorder Intervention: Essential Steps to Help Save Lives |
| /intervention-blog/familys-guide-alcohol-interventions/ | A Family’s Guide to Alcohol Interventions: Preparing for Success |
| /intervention-blog/how-alcohol-robs-most-valuable-commodity/ | How Alcohol Robs Us of Our Most Valuable Commodity: Time |
| /intervention-blog/how-to-choose-the-right-drug-interventionist/ | How to Choose the Right Drug Interventionist for Your Family’s Needs |
| /intervention-blog/how-to-fix-eating-habits/ | How to Fix Eating Habits |
| /intervention-blog/how-to-hire-an-interventionist/ | How to Hire an Interventionist? |
| /intervention-blog/how-to-stop-an-eating-addiction/ | How to Stop an Eating Addiction |
| /intervention-blog/invitational-interventions/ | Beyond the Ambush: Why Invitational Interventions are the Future of Recovery |
| /intervention-blog/key-qualities-of-effective-drug-interventionist/ | Key Qualities of an Effective Drug Interventionist: What to Look For |
| /intervention-blog/lgbtqia-drug-interventions/ | LGBTQIA+ Drug Interventions |
| /intervention-blog/mental-health-interventionist-vs-addiction-interventionist/ | Mental Health Interventionist vs. Addiction Interventionist: What’s the Difference? |
| /intervention-blog/natural-ways-nicotine-withdrawal-symptoms/ | Natural Ways to Cope with Nicotine Withdrawal Symptoms |
| /intervention-blog/planning-a-successful-drug-intervention-with-a-qualified-drug-interventionist/ | Planning a Successful Drug Intervention with a Qualified Drug Interventionist |
| /intervention-blog/powerful-self-soothing-techniques-anxiety-mental-illness/ | 4 Powerful Self-Soothing Techniques for Anxiety & Mental Illness |
| /intervention-blog/queer-autistic-eight-topics-to-explore-and-questions-to-ask-when-seeking-real-help/ | QUEER & AUTISTIC: EIGHT TOPICS TO EXPLORE (AND QUESTIONS TO ASK) WHEN SEEKING REAL HELP |
| /intervention-blog/role-of-addiction-interventionist-in-reducing-relapse-risk/ | The Role of an Addiction Interventionist in Reducing Relapse Risk |
| /intervention-blog/role-of-family-support-in-drug-interventions-lgbtqia-community/ | The Role of Family Support in Drug Interventions for the LGBTQIA+ Community |
| /intervention-blog/safe-spaces-drug-interventions-lgbtqia-individual/ | Creating Safe Spaces: Drug Interventions for LGBTQIA+ Individuals |
| /intervention-blog/struggling-with-a-drug-addiction/ | How To Support Someone Struggling With a Drug Addiction |
| /intervention-blog/the-high-cost-of-keeping-secrets/ | The High Cost of Keeping Secrets: How Family Get it Terribly Wrong |
| /intervention-blog/the-importance-of-a-trauma-intervention-program-in-addiction-recovery/ | The Importance of a Trauma Intervention Program in Addiction Recovery |
| /intervention-blog/top-10-addictive-things/ | The Top 10 Most Addictive things on the Planet! [List] |
| /intervention-blog/trauma-intervention-programs/ | How Trauma Intervention Programs Address the Root Causes of Addiction |
| /intervention-blog/uncharted-space-elon-musks-intervention/ | Uncharted Space: Elon Musk’s Intervention |
| /intervention-blog/what-are-brief-interventions-for-alcohol/ | What Are Brief Interventions for Alcohol? |
| /intervention-blog/what-are-the-5-ds-of-intervention/ | What Are the 5 Ds of Intervention? |
| /intervention-blog/what-are-the-three-types-of-drug-prevention-interventions/ | What Are the Three Types of Drug Prevention Interventions? |
| /intervention-blog/what-is-an-intervention-for-autism/ | What Is an Intervention for Autism? |
| /intervention-blog/what-is-the-act-intervention-for-mental-health/ | What is the ACT Intervention for Mental Health? |
| /intervention-blog/what-is-the-early-intervention-method/ | What is Early Intervention? |
| /intervention-blog/what-to-do-after-a-heavy-meal/ | What to Do After a Heavy Meal? |
| /intervention-blog/what-to-expect-from-a-substance-abuse-interventionist-a-guide-for-families/ | What to Expect from a Substance Abuse Interventionist: A Guide for Families |
| /intervention-blog/who-qualifies-for-an-intervention-anyway/ | Who Qualifies for an Intervention Anyway? |
| /intervention-blog/worst-alcohol-withdrawal-symptoms/ | The 8 Worst Alcohol Withdrawal Symptoms |
| /intervention-blog/your-suffering-teen-the-7-most-important-truths/ | Your Suffering Teen: The 7 Most Important Truths |

### Utility / low-value pages (8, likely not worth improving)

Form thank-you screens, registration steps, and the HTML sitemap. They only need to exist, not to be polished.

| Route | Title | Notes |
|---|---|---|
| /bist-registration-step-1/ | BIST Registration Step 1 |  |
| /sitemap/ | Sitemap |  |
| /thank-you-bist-registration/ | Thank You (BIST Registration) |  |
| /thank-you-contact-us/ | Thank You (Contact Us) |  |
| /thank-you-ebook/ | Thank You (E-Book) |  |
| /thank-you-eyewitness/ | Thank You (Eyewitness) |  |
| /thank-you-insurance/ | Thank You (Insurance) |  |
| /thank-you-iteam/ | Thank You (iTeam) |  |

## Consolidation recommendations

- Keep exactly the 5 templates above. No page needs a bespoke design.
- Redirect duplicates in WordPress (or drop them): /about-us -> /about, /resources-3 -> /resources, /georgia -> /interventionists-by-state/georgia, /intervention-help -> /intervention, /free-resources -> /resources.
- The 5 root-level service pages (breakfree-journey, recovery-coach-companion, recovery-care-management, care-unit-assessment, senior-support-services) duplicate detail_page CPT entries. Pick one canonical URL per service and redirect the other.
- Thank-you pages (6) + sitemap + bist-registration: leave as-is via the catch-all; zero design investment.
- The ~24 state/city pages and 47 blog posts are the long tail worth keeping for SEO; they already share one template each.
