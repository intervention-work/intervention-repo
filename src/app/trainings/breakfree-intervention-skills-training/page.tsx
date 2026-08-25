import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageHero } from '@/components/page-hero';
import { WpContent } from '@/components/wp-content';
import { CtaBanner } from '@/components/cta-banner';
import { ResourceFormSection } from '@/components/resource-form-section';
import { fetchWpPage } from '@/lib/wp';
import { buildMetadata } from '@/lib/seo';
import { mapWp } from '@/lib/wp-parse';

const SLUG = 'breakfree-intervention-skills-training';
const CANONICAL_PATH = `/trainings/${SLUG}`;

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchWpPage(SLUG);
  if (!page) return {};
  return buildMetadata({
    title: `${page.title} — Intervention.com`,
    description: page.excerpt || undefined,
    canonicalPath: CANONICAL_PATH,
    image: page.image,
    seo: page.seo,
  });
}

export default async function BreakfreeTrainingPage() {
  const page = await fetchWpPage(SLUG);
  if (!page) notFound();

  const { blocks } = mapWp(page.body, {
    title: page.title,
    summary: page.acfSummary || page.excerpt || undefined,
  });

  return (
    <main>
      <PageHero
        crumbs={[
          { label: 'Home', href: '/' },
          { label: 'Resources', href: '/resources' },
          { label: page.title },
        ]}
        eyebrow="Breakfree Training"
        title={page.title}
        summary={page.acfSummary || page.excerpt || undefined}
        image={page.image}
      />

      {blocks.length > 0 && (
        <section className="bg-white py-24 lg:py-32">
          <div className="mx-auto max-w-3xl px-6">
            <WpContent blocks={blocks} />
          </div>
        </section>
      )}

      <ResourceFormSection
        eyebrow="Enroll today"
        heading="Sign up for Breakfree Training."
        subheading="Submit the form and our team will reach out to get you enrolled and answer any questions."
        portalId="46095144"
        formId="4fd83930-97c1-4d8a-a51b-3fd18583507e"
      />

      <CtaBanner />
    </main>
  );
}
