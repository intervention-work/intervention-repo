import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ContentPage } from '@/components/content-page';
import { fetchWpPage, fetchWpPost, mapWpContent } from '@/lib/wp';

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
  return { title: `${page.title} — Intervention.com` };
}

export default async function CatchAllWpPage(props: PageProps<'/[...slug]'>) {
  const { slug } = await props.params;
  const leaf = slug[slug.length - 1];
  const page = await loadEntry(leaf);
  if (!page) notFound();

  // Map the raw WP content into hero + body (removes the duplicated opening).
  const mapped = mapWpContent(page.body);
  const heroTitle = mapped.title || page.title || titleize(leaf);

  const crumbs = [
    { label: 'Home', href: '/' },
    ...slug.slice(0, -1).map((seg, i) => ({
      label: titleize(seg),
      href: '/' + slug.slice(0, i + 1).join('/'),
    })),
    { label: heroTitle },
  ];

  return (
    <ContentPage
      crumbs={crumbs}
      eyebrow={mapped.eyebrow || undefined}
      title={heroTitle}
      summary={mapped.summary || undefined}
      body={mapped.body}
    />
  );
}
