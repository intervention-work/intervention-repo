# AI Search Visibility: How to Verify

Last updated: 2026-11-21

## What was shipped (code, pending commit)

- robots.txt: explicit allow groups for 16 AI crawlers (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, Claude-User, anthropic-ai, PerplexityBot, Perplexity-User, Google-Extended, Applebot-Extended, CCBot, Amazonbot, meta-externalagent, DuckAssistBot, MistralAI-User). Admin paths stay disallowed for every group.
- /llms.txt: curated index of key pages, with facts taken from the live site.
- JSON-LD: Organization + ProfessionalService (address, phone, email, 24/7 contact point, sameAs, founder, CEO), WebSite linked to the Organization, FAQPage on the home page (9 Q&As) and on every WP page with an accordion (for example /faq, 29 Q&As).
- Canonical fix: /our-team pointed its canonical at the homepage. Fixed; the layout no longer sets a canonical for every page.

## How to measure (tools)

| What | Tool | Notes |
|---|---|---|
| Brand and topic citations in AI answers | Ahrefs Brand Radar (project 10497727) | Weekly tracking of prompts and cited URLs. |
| AI visibility inside WordPress | Rank Math AI Visibility | Needs the OAuth connect (pending user action). |
| AI Overviews impressions | Google Search Console | AI Overviews are counted inside normal Web search results, no separate filter. |
| Did AI crawlers fetch the site | Amplify or CloudFront access logs | Filter user agents GPTBot, ClaudeBot, PerplexityBot, OAI-SearchBot. |
| Referral traffic from AI tools | GA4 | Referrers: chatgpt.com, perplexity.ai, gemini.google.com, copilot.microsoft.com, claude.ai. |

## 10 prompts to test monthly

Run each in ChatGPT (search on), Perplexity, Gemini, and Claude (search on). Log: is Intervention.com cited, which URL, and is the answer accurate.

1. Who is the best professional interventionist for a family with a loved one addicted to alcohol?
2. How much does a professional intervention cost?
3. Is a professional intervention covered by insurance?
4. How do I stage an intervention for someone who refuses help?
5. What is an invitational intervention and how is it different from a surprise intervention?
6. Eating disorder interventionist for an adult child, who can help?
7. Who can help with a mental health crisis intervention 24/7 in the United States?
8. What is Intervention.com (Change Institute) and who runs it?
9. Who is Brad Lamm and what is Breakfree Intervention Skills Training?
10. Best interventionists in New Jersey (repeat for Florida, Illinois, Wisconsin).

Baseline now, then compare monthly. Expect weeks, not days, for changes to show.

## Open items outside this change

- /intervention, /services and /resources have no meta description. /faq reuses the About Us description. Fix in WordPress (Rank Math) or in the section templates.
- Service pages exist at two URLs, /services/{slug} and /{slug}, both 200 with self canonicals. Pick one canonical and redirect or canonicalize the other.
- sitemap.ts sets lastModified to the build time for most URLs, which trains crawlers to ignore the signal.
- Add the America Recovers page to llms.txt and Organization sameAs once it is published.
