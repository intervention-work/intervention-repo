import type { Metadata } from 'next';
import { PageHero } from '@/components/page-hero';
import { WpContent } from '@/components/wp-content';
import { CtaBanner } from '@/components/cta-banner';
import { fetchSection, fetchPageBody, fetchSeo } from '@/lib/wp';
import { heroForSection } from '@/lib/hero-images';
import { buildMetadata } from '@/lib/seo';
import { mapWp } from '@/lib/wp-parse';

const SLUG = 'family-class';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const section = await fetchSection(SLUG);
  if (!section) return {};
  const seo = await fetchSeo('page', section.sourcePageSlug ?? SLUG);
  return buildMetadata({
    title: `${section.label} — Intervention.com`,
    description: section.summary,
    canonicalPath: `/${SLUG}`,
    image: section.image,
    seo,
  });
}

export default async function FamilyClassPage() {
  const section = await fetchSection(SLUG);
  if (!section) return null;
  const raw = await fetchPageBody(section.sourcePageSlug ?? SLUG);
  const { blocks } = mapWp(raw, {
    title: section.title,
    summary: section.intro || section.summary,
  });

  return (
    <main>
      <PageHero
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Resources', href: '/resources' }, { label: section.label }]}
        eyebrow={section.eyebrow || 'Resources'}
        title={section.title}
        summary={section.summary}
        image={section.image || heroForSection(SLUG)}
      />

      {blocks.length > 0 && (
        <section className="bg-white pt-14 pb-8 md:pt-24 md:pb-12 lg:pt-32 lg:pb-16">
          <div className="mx-auto max-w-[1200px] px-6">
            <WpContent blocks={blocks} />
          </div>
        </section>
      )}

      <CtaBanner />
    </main>
  );
}
