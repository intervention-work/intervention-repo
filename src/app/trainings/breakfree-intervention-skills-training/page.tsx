import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageHero } from '@/components/page-hero';
import { TrainingCtaCallout } from '@/components/training-cta-callout';
import { WpContent } from '@/components/wp-content';
import { CtaBanner } from '@/components/cta-banner';
import { fetchWpPage } from '@/lib/wp';
import { buildMetadata } from '@/lib/seo';
import { mapWp, splitLead } from '@/lib/wp-parse';

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

  // The auto-generated excerpt of an Elementor page is its widget text run
  // together ("… Register Now About the Training: …"), cut at 200 characters.
  const summary = page.acfSummary || page.seo?.description || undefined;

  const { blocks } = mapWp(page.body, { title: page.title, summary });
  const { actions, rest } = splitLead(blocks);

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
        summary={summary}
        image={page.image}
        actions={actions}
      />

      <TrainingCtaCallout action={actions[0]} />

      {rest.length > 0 && (
        <section className="bg-white pt-14 pb-8 md:pt-24 md:pb-12 lg:pt-32 lg:pb-16">
          <div className="mx-auto max-w-[1200px] px-6">
            <WpContent blocks={rest} />
          </div>
        </section>
      )}

      <CtaBanner />
    </main>
  );
}
