import type { Metadata } from 'next';
import { PageHero } from '@/components/page-hero';
import { CtaBanner } from '@/components/cta-banner';
import { BlogList, BLOG_PER_PAGE } from '@/components/blog-list';
import { fetchAllPosts } from '@/lib/wp';
import { buildMetadata } from '@/lib/seo';

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: 'Intervention Blog | Intervention.com',
  description:
    'Articles, guidance, and research on intervention, addiction, mental health, and family recovery.',
  canonicalPath: '/intervention-blog',
});

export default async function BlogIndexPage() {
  const allPosts = await fetchAllPosts();
  const totalPages = Math.max(1, Math.ceil(allPosts.length / BLOG_PER_PAGE));
  const posts = allPosts.slice(0, BLOG_PER_PAGE);

  return (
    <main>
      <PageHero
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Intervention Blog' }]}
        eyebrow="Resources"
        title="Intervention Blog"
        summary="Guidance, research, and stories on intervention, addiction, mental health, and family recovery."
      />

      <section className="mx-auto max-w-[1200px] px-6 py-20 lg:py-24">
        <BlogList posts={posts} page={1} totalPages={totalPages} />
      </section>

      <CtaBanner />
    </main>
  );
}
