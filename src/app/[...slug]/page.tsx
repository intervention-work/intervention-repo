import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ContentPage } from '@/components/content-page';
import { JsonLd } from '@/components/json-ld';
import { fetchWpPage, fetchWpPost, fetchHeroForLeaf } from '@/lib/wp';
import { buildMetadata, articleSchema, breadcrumbSchema, SITE } from '@/lib/seo';
import { HERO_DEFAULT } from '@/lib/hero-images';
import { mapWp } from '@/lib/wp-parse';

export const revalidate = 3600;
// Long-tail WP pages/posts render on first request and are then cached (ISR),
// so the build doesn't have to prerender 90+ pages in one rate-limited burst.
export const dynamicParams = true;

// Curated routes (/about, /intervention, /services, /intervention/[slug], the
// blog index, etc.) are matched by Next before this catch-all, so they always
// win — the catch-all only handles the remaining WP pages/posts.
//
// Prerender nothing at build time — every WP page/post is generated on first
// request and cached via ISR. This keeps builds fast and avoids hammering WP.
// New WP content appears automatically without a redeploy.
export function generateStaticParams() {
  return [];
}

function titleize(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// Try a WP page first, then a WP post (blog articles live under /intervention-blog).
async function loadEntry(leaf: string) {
  return (await fetchWpPage(leaf)) ?? (await fetchWpPost(leaf));
}

export async function generateMetadata(
  props: PageProps<'/[...slug]'>
): Promise<Metadata> {
  const { slug } = await props.params;
  const page = await loadEntry(slug[slug.length - 1]);
  if (!page) return {};
  const isPost = page.type === 'post';
  return buildMetadata({
    title: `${page.title} — Intervention.com`,
    description: page.excerpt || undefined,
    canonicalPath: `/${slug.join('/')}`,
    image: page.image,
    type: isPost ? 'article' : 'website',
    publishedTime: page.date,
    modifiedTime: page.modified,
    seo: page.seo,
  });
}

export default async function CatchAllWpPage(props: PageProps<'/[...slug]'>) {
  const { slug } = await props.params;
  const leaf = slug[slug.length - 1];
  // Some detail pages are linked at their root permalink by the WP menu and land
  // here; give them the same uniform section hero as their /section/[slug] twin.
  const [page, heroImage] = await Promise.all([
    loadEntry(leaf),
    fetchHeroForLeaf(leaf),
  ]);
  if (!page) notFound();

  // Map the raw WP content into hero + body (removes the duplicated opening).
  // Pass the ACF summary so the hero subtitle is populated even when the
  // Elementor body doesn't contain a matching intro paragraph.
  const mapped = mapWp(page.body, { summary: page.acfSummary || undefined });
  const heroTitle = mapped.title || page.title || titleize(leaf);

  const crumbs = [
    { label: 'Home', href: '/' },
    ...slug.slice(0, -1).map((seg, i) => ({
      label: titleize(seg),
      href: '/' + slug.slice(0, i + 1).join('/'),
    })),
    { label: heroTitle },
  ];

  const isPost = page.type === 'post';
  const url = `${SITE}/${slug.join('/')}`;
  const schema: object[] = [
    breadcrumbSchema(crumbs.map((c) => ({ name: c.label, path: c.href }))),
  ];
  if (isPost) {
    schema.push(
      articleSchema({
        title: page.title,
        description: page.excerpt,
        url,
        image: page.image,
        publishedTime: page.date,
        modifiedTime: page.modified,
        author: page.author,
      })
    );
  }

  return (
    <>
      <JsonLd data={schema} />
      <ContentPage
        crumbs={crumbs}
        eyebrow={mapped.eyebrow || undefined}
        title={heroTitle}
        summary={mapped.summary || undefined}
        // Service/intervention pages get their section hero; blog posts show
        // their featured image; everything else gets the neutral default.
        image={heroImage ?? (isPost ? page.image ?? HERO_DEFAULT : HERO_DEFAULT)}
        bodyBlocks={mapped.blocks}
        sidebar={mapped.sidebar}
      />
    </>
  );
}
