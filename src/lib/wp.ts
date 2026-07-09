import type { Section, DetailContent, ContentBlock } from '@/content/site';

const WP_API =
  process.env.NEXT_PUBLIC_WP_API_URL ??
  'https://interventiodev.wpenginepowered.com/wp-json';

const REVALIDATE = Number(process.env.NEXT_REVALIDATE_SECONDS ?? '3600');

async function wpFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${WP_API}${path}`, {
    next: { revalidate: REVALIDATE },
  });
  if (!res.ok) {
    throw new Error(`WP fetch ${res.status}: ${WP_API}${path}`);
  }
  return res.json() as Promise<T>;
}

// Raw ACF types from WP REST response

type AcfLayout = {
  acf_fc_layout: string;
  heading?: string;
  body?: string;
  bullets?: Array<{ item: string }>;
  stats?: Array<{ value: string; label: string }>;
  features?: Array<{ title: string; body: string }>;
  steps?: Array<{ title: string; body: string }>;
};

type AcfSectionFields = {
  label: string;
  title: string;
  summary: string;
  intro: string;
  image: string;
  childrenEyebrow: string;
  childrenTitle: string;
  content_blocks?: AcfLayout[];
  faq?: Array<{ q: string; a: string }>;
};

type AcfDetailFields = AcfSectionFields & {
  slug: string;
  parent_section: string;
};

// ACF flexible content layout -> ContentBlock
export function mapAcfToContentBlock(layout: AcfLayout): ContentBlock {
  const block: ContentBlock = {};
  if (layout.heading) block.heading = layout.heading;

  if (layout.acf_fc_layout === 'body_block' && layout.body) {
    block.body = layout.body.includes('\n')
      ? layout.body.split('\n').filter(Boolean)
      : layout.body;
  } else if (layout.acf_fc_layout === 'bullets_block') {
    if (layout.body) block.body = layout.body;
    if (layout.bullets?.length) block.bullets = layout.bullets.map((b) => b.item);
  } else if (layout.acf_fc_layout === 'stats_block' && layout.stats?.length) {
    block.stats = layout.stats;
  } else if (layout.acf_fc_layout === 'features_block' && layout.features?.length) {
    block.features = layout.features;
  } else if (layout.acf_fc_layout === 'steps_block' && layout.steps?.length) {
    block.steps = layout.steps;
  }

  return block;
}

function toSection(
  slug: string,
  acf: AcfSectionFields,
  children: DetailContent[] = []
): Section {
  return {
    slug,
    label: acf.label,
    title: acf.title,
    summary: acf.summary,
    intro: acf.intro,
    image: acf.image,
    childrenEyebrow: acf.childrenEyebrow,
    childrenTitle: acf.childrenTitle,
    blocks: (acf.content_blocks ?? []).map(mapAcfToContentBlock),
    faq: acf.faq ?? [],
    children,
  };
}

function toDetailContent(slug: string, acf: AcfDetailFields): DetailContent {
  return {
    slug: acf.slug || slug,
    label: acf.label,
    title: acf.title,
    summary: acf.summary,
    intro: acf.intro,
    image: acf.image,
    blocks: (acf.content_blocks ?? []).map(mapAcfToContentBlock),
    faq: acf.faq ?? [],
  };
}

async function fetchDetailsByParent(parentSlug: string): Promise<DetailContent[]> {
  const posts = await wpFetch<Array<{ slug: string; acf: AcfDetailFields }>>(
    `/wp/v2/detail_page?_fields=slug,acf&per_page=100`
  );
  return posts
    .filter((p) => p.acf?.parent_section === parentSlug)
    .map((p) => toDetailContent(p.slug, p.acf));
}

export async function fetchSection(slug: string): Promise<Section | null> {
  const pages = await wpFetch<Array<{ slug: string; acf: AcfSectionFields }>>(
    `/wp/v2/pages?slug=${slug}&_fields=slug,acf`
  );
  if (!pages.length) return null;
  const children = await fetchDetailsByParent(slug);
  return toSection(slug, pages[0].acf, children);
}

// Returns { section, detail } for a single detail page.
// section.children is fully populated, so generateStaticParams can use fetchSection alone.
export async function fetchDetail(
  parentSlug: string,
  detailSlug: string
): Promise<{ section: Section; detail: DetailContent } | null> {
  const section = await fetchSection(parentSlug);
  if (!section) return null;
  const detail = section.children.find((d) => d.slug === detailSlug) ?? null;
  if (!detail) return null;
  return { section, detail };
}

export async function fetchGlobalSettings(): Promise<{
  phoneDisplay: string;
  phoneHref: string;
  email: string;
}> {
  const data = await wpFetch<{
    acf: { phone_display: string; phone_href: string; email: string };
  }>('/acf/v3/options/options');
  return {
    phoneDisplay: data.acf.phone_display,
    phoneHref: data.acf.phone_href,
    email: data.acf.email,
  };
}
