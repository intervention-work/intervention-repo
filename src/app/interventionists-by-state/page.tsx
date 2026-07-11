import type { Metadata } from 'next';
import { fetchDetail, fetchPageBody, mapWpContent } from '@/lib/wp';
import { PageHero } from '@/components/page-hero';
import { WpContent } from '@/components/wp-content';
import { CtaBanner } from '@/components/cta-banner';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const data = await fetchDetail('intervention', 'interventionists-by-state');
  if (!data) return { title: 'Interventionists By State — Intervention.com' };
  return {
    title: `${data.detail.label} — Intervention.com`,
    description: data.detail.summary,
  };
}

export default async function InterventionistsByStatePage() {
  const data = await fetchDetail('intervention', 'interventionists-by-state');
  const detail = data?.detail;
  const raw = await fetchPageBody(
    detail?.sourcePageSlug ?? 'interventionists-by-state'
  );
  const mapped = mapWpContent(raw, {
    title: detail?.title,
    summary: detail?.intro ?? detail?.summary,
  });
  const body = mapped.body;

  return (
    <>
      <PageHero
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Interventionists By State' }]}
        eyebrow={mapped.eyebrow || 'Find an Interventionist Near You'}
        title={detail?.title ?? mapped.title ?? 'Intervention Locator'}
        summary={detail?.intro ?? detail?.summary ?? mapped.summary}
      />

      {body && (
        <section className="mx-auto max-w-4xl px-5 pb-20 md:px-7 lg:px-9">
          <WpContent html={body} />
        </section>
      )}

      <CtaBanner />
    </>
  );
}
