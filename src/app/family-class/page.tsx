import type { Metadata } from 'next';
import { ContentPage } from '@/components/content-page';
import { HubSpotEmbed } from '@/components/hubspot-embed';
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
  const { blocks, sidebar } = mapWp(raw, {
    title: section.title,
    summary: section.intro || section.summary,
  });
  return (
    <>
      <ContentPage
        crumbs={[{ label: 'Home', href: '/' }, { label: section.label }]}
        eyebrow={section.eyebrow}
        title={section.title}
        summary={section.summary}
        image={section.image || heroForSection(SLUG)}
        intro={section.intro}
        blocks={section.blocks}
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
