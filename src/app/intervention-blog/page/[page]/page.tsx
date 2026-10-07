import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageHero } from '@/components/page-hero';
import { CtaBanner } from '@/components/cta-banner';
import { BlogList, BLOG_PER_PAGE } from '@/components/blog-list';
import { fetchAllPosts } from '@/lib/wp';
import { buildMetadata } from '@/lib/seo';

export const revalidate = 3600;

// Prerender one static page per existing paginated slice. Page 1 keeps its
// canonical home at /intervention-blog (handled by the sibling page.tsx), so
// generateStaticParams returns pages 2..N only. Falls through to a 404 for
// any page number past the current post count to prevent thin-index pages.
export async function generateStaticParams() {
  const posts = await fetchAllPosts();
  const totalPages = Math.max(1, Math.ceil(posts.length / BLOG_PER_PAGE));
  return Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => ({
    page: String(i + 2),
  }));
}

export const dynamicParams = false;

type Props = { params: Promise<{ page: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { page: pageParam } = await params;
  const page = Number(pageParam);
  // Each paginated page self-canonicals (per Google's post-rel=prev/next
  // guidance). Canonicalling pages 2+ back to page 1 would de-index the
  // deeper posts, re-creating the orphan problem we fixed.
  return buildMetadata({
    title: `Intervention Blog | Page ${page} | Intervention.com`,
    description:
      'Articles, guidance, and research on intervention, addiction, mental health, and family recovery.',
    canonicalPath: `/intervention-blog/page/${page}`,
  });
}

export default async function BlogPaginatedPage({ params }: Props) {
  const { page: pageParam } = await params;
  const page = Number(pageParam);
  if (!Number.isInteger(page) || page < 2) notFound();

  const allPosts = await fetchAllPosts();
  const totalPages = Math.max(1, Math.ceil(allPosts.length / BLOG_PER_PAGE));
  if (page > totalPages) notFound();

  const start = (page - 1) * BLOG_PER_PAGE;
  const posts = allPosts.slice(start, start + BLOG_PER_PAGE);

  return (
    <main>
      <PageHero
        crumbs={[
          { label: 'Home', href: '/' },
          { label: 'Intervention Blog', href: '/intervention-blog' },
          { label: `Page ${page}` },
        ]}
        eyebrow="Resources"
        title="Intervention Blog"
        summary={`Page ${page} of ${totalPages}.`}
      />

      <section className="mx-auto max-w-[1200px] px-6 py-20 lg:py-24">
        <BlogList posts={posts} page={page} totalPages={totalPages} />
      </section>

      <CtaBanner />
    </main>
  );
}
