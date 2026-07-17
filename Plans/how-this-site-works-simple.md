# How This Site Works (In Plain English)

A simple explanation of what we built, why we built it, and how the pieces talk to each other.

## The one-line version

WordPress is still where all the words and pictures live. The new Next.js site is a brand new "skin" that fetches those words and pictures and shows them in a much better looking, much faster website.

## Why we did this

The old intervention.com was built entirely in WordPress with a page builder (Elementor). That setup had problems:

- The site looked dated, and restyling 130+ pages by hand in a page builder is slow and error prone.
- WordPress sites built this way load slowly, which hurts Google rankings and frustrates visitors.
- Every page could drift into its own look, so nothing stayed consistent.

At the same time, the team already knows how to write and edit content in WordPress, and there are 130+ pages of valuable content (state pages, city pages, blog posts, service pages) that we did not want to rebuild by hand.

So we chose a "headless" setup, which means:

- **Keep WordPress as the filing cabinet.** Editors keep writing and editing content there, exactly like before. Nothing changes for them.
- **Replace the storefront.** Visitors never see WordPress anymore. They see a new, modern, fast site built with Next.js (a website framework) hosted on Vercel (a hosting service).

Think of it like a restaurant that kept its kitchen (WordPress, where content is cooked) but completely rebuilt the dining room (the Next.js site, where visitors actually sit).

## How the content gets from WordPress to the site

This is the "pipeline". It runs automatically, no human involved:

1. **WordPress stores the content.** Every page, blog post, and service description lives in WordPress, the same as always.
2. **WordPress exposes a data feed.** WordPress has a built-in way to hand out its content as raw data (called the REST API). Our WordPress install is at `interventiodev.wpenginepowered.com` and the new site reads from it.
3. **The new site fetches and cleans it.** One file in our code (`src/lib/wp.ts`) is the only door to WordPress. It fetches the content, strips out all the old Elementor page-builder clutter, and keeps just the actual words, headings, images, and links.
4. **The content gets sorted into building blocks.** A parser reads the cleaned content and recognizes patterns: "this part is a heading", "this is a list with icons", "this is an FAQ accordion", "these are testimonial cards". Each piece becomes a labeled block.
5. **Blocks get poured into the new design.** One shared component (`WpContent`) takes those blocks and renders each one with the new design: new fonts, new colors, new cards, new spacing. Because every page flows through this same component, all 130+ pages automatically share one consistent look.

So an editor writes plain content in WordPress, and it comes out the other end wearing the new design. Nobody manually restyled 130 pages; the pipeline restyles all of them at once.

## Only about 5 layouts for 130+ pages

The 130+ pages are not 130 different designs. Every page uses one of a handful of templates:

1. **Home page** (the one with the video).
2. **Hub page** (like /intervention or /services, a landing page with cards linking to its children).
3. **Service detail page** (one specific service, like Drug Intervention).
4. **Content page** (the generic template, used by the bulk: state pages, city pages, "does my loved one need help" pages, legal pages).
5. **Blog** (the article list plus each article).

Change a template once, and every page using it updates. That is the whole point.

## How new or edited content shows up

- When an editor **saves a change in WordPress**, WordPress pings the new site ("hey, this page changed") and the site refreshes that page. No developer, no redeploy.
- When an editor **creates a brand new page**, the first visitor to that new address triggers the site to fetch and render it on the spot. It then stays cached for the next visitors.
- The **navigation menu** also comes from WordPress (Appearance > Menus), so reordering the menu there reorders it on the live site.

## What is deliberately NOT in the code

No page text, no menu items, no phone numbers are typed into the website code. Everything comes from WordPress. This is a strict rule, because the moment content is copy-pasted into code, WordPress edits stop showing up and the two fall out of sync.

The couple of exceptions are things WordPress never owned: the home page's marketing sections (hero video, FAQ, testimonials) and the contact form, which sends its submissions to HubSpot (the company's customer database) so the sales/care team sees leads in the same place as before.

## The current link, in one picture

```
Editors write here                     Visitors look here
      |                                       |
      v                                       v
WordPress (WP Engine)  --data feed-->  Next.js site (Vercel)
  pages, posts,          fetch, clean,    new design, fast,
  menus, phone number    sort into        5 shared templates
                         blocks
```

Both halves stay connected all the time. WordPress is the single source of truth for content; the Next.js site is the single source of truth for how it looks.
