import type { Metadata } from 'next';
import { PageHero } from '@/components/page-hero';
import { CtaBanner } from '@/components/cta-banner';
import { BlogList } from '@/components/blog-list';
import { fetchAllPosts } from '@/lib/wp';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Intervention Blog — Intervention.com',
  description:
    'Articles, guidance, and research on intervention, addiction, mental health, and family recovery.',
};

export default async function BlogIndexPage() {
  const posts = await fetchAllPosts();

  return (
    <main>
      <PageHero
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Intervention Blog' }]}
        eyebrow="Resources"
        title="Intervention Blog"
        summary="Guidance, research, and stories on intervention, addiction, mental health, and family recovery."
      />

      <section className="mx-auto max-w-[1200px] px-6 py-20 lg:py-24">
        <BlogList posts={posts} />
      </section>

      <CtaBanner />
    </main>
  );
}
