import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ContentPage } from '@/components/content-page';
import { HubSpotEmbed } from '@/components/hubspot-embed';
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

  const { blocks, sidebar } = mapWp(page.body, {
    title: page.title,
    summary: page.acfSummary || page.excerpt || undefined,
  });

  const crumbs = [
    { label: 'Home', href: '/' },
    { label: 'Trainings', href: '/trainings' },
    { label: page.title },
  ];

  return (
    <>
      <ContentPage
        crumbs={crumbs}
        title={page.title}
        summary={page.acfSummary || page.excerpt || undefined}
        image={page.image}
        bodyBlocks={blocks}
        sidebar={sidebar}
      />
      <section className="bg-white py-20 lg:py-28">
        <div className="mx-auto max-w-[680px] px-6">
          <h2 className="font-display text-3xl text-ink mb-8">Get in touch</h2>
          <HubSpotEmbed portalId="46095144" formId="4fd83930-97c1-4d8a-a51b-3fd18583507e" region="na1" />
        </div>
      </section>
    </>
  );
}
