import type { Metadata } from 'next';
import { PageHero } from '@/components/page-hero';
import { WpContent } from '@/components/wp-content';
import { CtaBanner } from '@/components/cta-banner';
import { ResourceFormSection } from '@/components/resource-form-section';
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
        <section className="bg-white py-24 lg:py-32">
          <div className="mx-auto max-w-3xl px-6">
            <WpContent blocks={blocks} />
          </div>
        </section>
      )}

      <ResourceFormSection
        eyebrow="Family Class"
        heading="Register for our next session."
        subheading="Fill out the form and a specialist will confirm your spot and answer any questions."
        portalId="46095144"
        formId="4fd83930-97c1-4d8a-a51b-3fd18583507e"
      />

      <CtaBanner />
    </main>
  );
}
