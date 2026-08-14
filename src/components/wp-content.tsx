import type { ReactNode } from 'react';
import styles from './wp-prose.module.css';
import { Carousel } from './carousel';
import { Heading } from './heading';
import { IconList } from './icon-list';
import { Accordion } from './accordion';
import { HubSpotEmbed } from './hubspot-embed';
import { groupSections, stripTags, wordCount, type Block, type Card as CardData, type Section } from '@/lib/wp-content-parse';
import { parseWp } from '@/lib/wp-parse';
import {
  Users, User, Check, CircleDot, Smile, Heart, Star, HandHeart, ShieldCheck,
  GraduationCap, Handshake, Sparkles, type LucideIcon,
} from 'lucide-react';

/**
 * Renders the parsed WP block model through the new design system:
 *   headings → display font · CTA links → pill buttons · flat lists → chip grid
 *   (clickable vs plain distinguished) · images → rounded media · tables/quotes.
 */

/** Readable measure for running text; grids and media stay full-width. */
const MEASURE = 'max-w-[68ch]';

const BTN_PRIMARY =
  'inline-flex items-center justify-center gap-2 rounded-full bg-sage-700 px-6 py-3 font-sans text-sm font-medium text-white transition-[background-color,transform] duration-200 ease-expo-out hover:bg-sage-900 active:scale-[0.97]';

const BTN_SECONDARY =
  'group inline-flex items-center gap-1.5 font-sans text-sm font-medium text-sage-700 transition-colors duration-200 ease-expo-out hover:text-sage-900';

/**
 * WP marks every CTA up identically, so a page can end up with a dozen filled
 * pills competing for the same attention. Navigational "read more" actions read
 * as quiet links; pills stay reserved for calls that actually convert.
 */
const NAVIGATIONAL_CTA = /^(read|learn|view|see|explore|discover|more)\b/i;

function CtaLink({
  href,
  label,
  external,
  variant,
}: {
  href: string;
  label: string;
  external: boolean;
  variant?: 'primary' | 'secondary';
}) {
  const secondary = variant
    ? variant === 'secondary'
    : NAVIGATIONAL_CTA.test(label.trim());
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={secondary ? BTN_SECONDARY : BTN_PRIMARY}
    >
      {label}
      {secondary && (
        <span
          aria-hidden
          className="transition-transform duration-200 ease-expo-out group-hover:translate-x-0.5"
        >
          →
        </span>
      )}
    </a>
  );
}

/**
 * The coverage map is a flat single colour (#fe9206, the old brand orange) with
 * white borders — the only saturated thing on a sage/ink palette. hue-rotate +
 * saturate land it on sage-400 (#6BAF83) and leave the borders pure white,
 * since both matrices preserve white exactly.
 */
const MAP_TONE = { filter: 'hue-rotate(93deg) saturate(0.32)' } as const;

/**
 * The one coverage map asset is shared by the locator index and every state and
 * city page, so key the tone off the asset rather than the layout that happens to
 * be rendering it — otherwise it reads sage on one page and orange on the next.
 */
const isCoverageMap = (src: string) => /usa-states/.test(src);

/**
 * The service icons are two-tone (~70% orange, ~30% blue), so a hue rotation
 * that fixes the orange throws the blue to magenta. Mask them to a single sage
 * fill instead, matching the monochrome Lucide icons used elsewhere.
 */
const isLegacyIcon = (src: string) => /\/icon-/.test(src);

function LegacyIcon({ src }: { src: string }) {
  const mask = {
    maskImage: `url("${src}")`,
    WebkitMaskImage: `url("${src}")`,
    maskRepeat: 'no-repeat',
    WebkitMaskRepeat: 'no-repeat',
    maskPosition: 'center',
    WebkitMaskPosition: 'center',
    maskSize: 'contain',
    WebkitMaskSize: 'contain',
  } as const;
  return <span aria-hidden className="block h-11 w-11 bg-sage-700" style={mask} />;
}

function StateChip({ html }: { html: string }) {
  const a = /<a\b[^>]*href\s*=\s*"([^"]*)"[^>]*>([\s\S]*?)<\/a>/i.exec(html);
  if (a) {
    const href = a[1];
    const label = stripTags(a[2]);
    return (
      <a
        href={href}
        className="group flex h-full items-center justify-between gap-2 rounded-xl border border-sage-200 bg-white px-4 py-3 font-sans text-sm font-medium text-ink transition-[color,background-color,border-color,transform] duration-200 ease-expo-out hover:border-sage-400 hover:bg-sage-50 hover:text-sage-700 active:scale-[0.98]"
      >
        {label}
        <span
          aria-hidden
          className="shrink-0 text-sage-400 transition-transform duration-200 ease-expo-out group-hover:translate-x-0.5"
        >
          →
        </span>
      </a>
    );
  }
  // States without a page yet stay in the list but drop the card treatment —
  // as bordered boxes they read as disabled inputs, i.e. as if the grid broke.
  return (
    <span className="flex h-full items-center px-4 py-3 font-sans text-sm text-ink-muted/75">
      {stripTags(html)}
    </span>
  );
}

function ChipGrid({ items }: { items: string[] }) {
  return (
    <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
      {items.map((item, i) => (
        <li key={i}>
          <StateChip html={item} />
        </li>
      ))}
    </ul>
  );
}

/**
 * Photo + blurb + CTA. WP emits these as three loose siblings, which renders as
 * a giant centred portrait with orphaned text under it — so pair them into a
 * horizontal row: photo left, copy and action right.
 */
type Person = {
  image: { src: string; alt: string };
  paragraphs: string[];
  button: { href: string; label: string; external: boolean };
};

function PersonCard({ person }: { person: Person }) {
  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-border bg-white p-5 transition-shadow duration-300 hover:shadow-[0_24px_60px_-24px_rgba(17,24,39,0.16)] sm:flex-row sm:gap-6 sm:p-6">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={person.image.src}
        alt={person.image.alt}
        loading="lazy"
        className="h-36 w-32 shrink-0 self-start rounded-xl bg-surface object-cover object-top sm:h-40 sm:w-36"
      />
      <div className="flex min-w-0 flex-1 flex-col items-start">
        <div
          className={`${styles.prose} text-[15px] leading-relaxed`}
          dangerouslySetInnerHTML={{
            __html: person.paragraphs.map((p) => `<p>${p}</p>`).join(''),
          }}
        />
        <div className="mt-5">
          <CtaLink
            href={person.button.href}
            label={person.button.label}
            external={person.button.external}
          />
        </div>
      </div>
    </div>
  );
}

// image → paragraph(s) → button, with a blurb short enough to sit beside a photo.
function collectPerson(
  blocks: Block[],
  start: number
): { person: Person; next: number } | null {
  const img = blocks[start];
  if (img?.kind !== 'image') return null;

  let k = start + 1;
  const paragraphs: string[] = [];
  while (blocks[k]?.kind === 'paragraph') {
    paragraphs.push((blocks[k] as Extract<Block, { kind: 'paragraph' }>).html);
    k++;
  }
  if (!paragraphs.length) return null;
  if (stripTags(paragraphs.join(' ')).length > 600) return null;

  const btn = blocks[k];
  if (btn?.kind !== 'button') return null;

  return {
    person: {
      image: { src: img.src, alt: img.alt },
      paragraphs,
      button: { href: btn.href, label: btn.label, external: btn.external },
    },
    next: k + 1,
  };
}

/**
 * Icon, heading, body, optional action. Laid out as a row while it owns the full
 * column width and as a stacked card once the group splits into columns — the
 * `flip` classes come from CardGroup so both switch at the same container width.
 */
function Card({ card, flip = '' }: { card: CardData; flip?: string }) {
  return (
    <div
      className={`flex h-full flex-col gap-5 rounded-2xl border border-border bg-white p-6 transition-shadow duration-300 hover:shadow-[0_24px_60px_-24px_rgba(17,24,39,0.22)] sm:p-7 ${flip}`}
    >
      {card.image?.src && (
        <div className="flex shrink-0 items-start">
          {isLegacyIcon(card.image.src) ? (
            <LegacyIcon src={card.image.src} />
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={card.image.src}
              alt={card.image.alt}
              loading="lazy"
              className="h-11 w-auto object-contain"
            />
          )}
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <Heading level={3}>{card.heading}</Heading>
        {card.bodyHtml && (
          <div
            className={`${styles.prose} mt-3 flex-1`}
            dangerouslySetInnerHTML={{ __html: card.bodyHtml }}
          />
        )}
        {card.button && (
          <div className="mt-5">
            <CtaLink
              href={card.button.href}
              label={card.button.label}
              external={card.button.external}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function CardGroup({ cards }: { cards: CardData[] }) {
  // Many cards → carousel; a few → responsive grid.
  if (cards.length >= 5) {
    return (
      <Carousel>
        {cards.map((c, i) => (
          <Card key={i} card={c} />
        ))}
      </Carousel>
    );
  }
  // Container queries, not viewport ones: beside a sidebar these cards sit in a
  // ~700px column, where three columns leaves a 20-character measure even though
  // the viewport is wide enough for `lg:`. Below the split they stack as rows,
  // which also avoids an orphan card on a second row.
  // Cards stack vertically on a phone, become rows once there is width for a
  // sensible measure beside the icon, then return to stacked when the group
  // splits into columns.
  const { cols, flip } =
    cards.length === 2
      ? { cols: '@2xl:grid-cols-2', flip: '@sm:flex-row @2xl:flex-col' }
      : cards.length === 3
        ? { cols: '@5xl:grid-cols-3', flip: '@sm:flex-row @5xl:flex-col' }
        : cards.length >= 4
          ? { cols: '@2xl:grid-cols-2 @6xl:grid-cols-4', flip: '@sm:flex-row @2xl:flex-col' }
          : { cols: '', flip: '@sm:flex-row' };

  return (
    <div className="@container">
      <div className={`grid grid-cols-1 gap-6 ${cols}`}>
        {cards.map((c, i) => (
          <Card key={i} card={c} flip={flip} />
        ))}
      </div>
    </div>
  );
}

function Testimonials({ items }: { items: Array<{ quote: string; name: string; role: string }> }) {
  const cards = items.map((t, i) => (
    <figure
      key={i}
      className="flex h-full flex-col rounded-2xl border border-border bg-white p-7"
    >
      <blockquote
        className="flex-1 font-display text-lg leading-relaxed text-ink"
      >
        “{t.quote}”
      </blockquote>
      {(t.name || t.role) && (
        <figcaption className="mt-5 border-t border-border pt-4 font-sans">
          {t.name && <span className="block text-sm font-semibold text-ink">{t.name}</span>}
          {t.role && <span className="block text-sm text-ink-muted">{t.role}</span>}
        </figcaption>
      )}
    </figure>
  ));
  // Many → carousel; one/two → grid.
  if (items.length >= 3) return <Carousel>{cards}</Carousel>;
  return (
    <div className={`grid grid-cols-1 gap-6 ${items.length === 2 ? 'sm:grid-cols-2' : ''}`}>
      {cards}
    </div>
  );
}

function PricingCards({
  cards,
}: {
  cards: Array<{
    title: string;
    subtitle: string;
    price: string;
    button?: { href: string; label: string; external: boolean };
  }>;
}) {
  const cols = cards.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3';
  return (
    <div className={`grid grid-cols-1 gap-6 ${cols}`}>
      {cards.map((c, i) => (
        <div
          key={i}
          className="flex flex-col items-center rounded-2xl border border-border bg-white p-8 text-center transition-shadow duration-300 hover:shadow-[0_24px_60px_-24px_rgba(17,24,39,0.22)]"
        >
          <p className="font-sans text-lg font-semibold text-sage-700">{c.title}</p>
          {c.subtitle && (
            <p className="mt-2 font-sans text-xs uppercase tracking-[0.15em] text-ink-muted">
              {c.subtitle}
            </p>
          )}
          <p
            className="my-5 font-display text-5xl text-ink"
          >
            {c.price}
          </p>
          {c.button && (
            <a
              href={c.button.href}
              {...(c.button.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className="mt-auto inline-flex items-center justify-center rounded-full bg-sage-700 px-6 py-3 font-sans text-sm font-medium text-white transition-colors duration-300 hover:bg-sage-900"
            >
              {c.button.label}
            </a>
          )}
        </div>
      ))}
    </div>
  );
}

const ICON_MAP: Record<string, LucideIcon> = {
  'user-friends': Users, users: Users, user: User, 'user-circle': User,
  check: Check, 'check-circle': Check, 'circle-check': Check, smile: Smile,
  heart: Heart, 'hand-holding-heart': HandHeart, star: Star,
  shield: ShieldCheck, 'shield-alt': ShieldCheck, 'graduation-cap': GraduationCap,
  handshake: Handshake, certificate: Sparkles, award: Sparkles,
};
const iconFor = (k: string): LucideIcon => ICON_MAP[k] ?? CircleDot;

function IconCards({ items }: { items: Array<{ icon: string; title: string; desc: string }> }) {
  const cols = items.length <= 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3';
  return (
    <div className={`grid grid-cols-1 gap-8 ${cols}`}>
      {items.map((it, i) => {
        const Icon = iconFor(it.icon);
        return (
          <div key={i} className="flex flex-col items-center text-center">
            <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sage-50 text-sage-700">
              <Icon size={28} strokeWidth={1.75} />
            </span>
            {it.title && <p className="font-sans text-base font-semibold text-ink">{it.title}</p>}
            {it.desc && <p className="mt-2 font-sans text-sm leading-relaxed text-ink-body">{it.desc}</p>}
          </div>
        );
      })}
    </div>
  );
}

function MediaText({
  image, side, blocks,
}: {
  image: { src: string; alt: string };
  side: 'left' | 'right';
  blocks: Block[];
}) {
  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={image.src} alt={image.alt} loading="lazy" className="h-full w-full rounded-2xl object-cover" />
  );
  return (
    <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
      {side === 'left' && <div className="min-h-[280px]">{img}</div>}
      <div className="space-y-5">{renderBlocks(blocks)}</div>
      {side === 'right' && <div className="min-h-[280px]">{img}</div>}
    </div>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.kind) {
    case 'heading': {
      const text = stripTags(block.html);
      const words = wordCount(text);
      // A short all-caps line is a kicker, not a display heading.
      if (text && words <= 8 && text === text.toUpperCase()) {
        return (
          <p className="font-sans text-xs font-semibold tracking-[0.22em] uppercase text-sage-700">
            {text}
          </p>
        );
      }
      // A "heading" that is really a full sentence should read as a lead.
      if (words >= 14) {
        return (
          <p
            className="max-w-[48ch] text-pretty font-display text-xl leading-snug text-ink md:text-[1.45rem]"
            dangerouslySetInnerHTML={{ __html: block.html }}
          />
        );
      }
      return (
        <Heading level={block.level} html={block.html} className="text-balance" />
      );
    }
    case 'paragraph':
      return (
        <div
          className={`${styles.prose} ${MEASURE} text-pretty`}
          dangerouslySetInnerHTML={{ __html: `<p>${block.html}</p>` }}
        />
      );
    case 'quote':
      return (
        <blockquote
          className={`${styles.quote} ${MEASURE}`}
          dangerouslySetInnerHTML={{ __html: block.html }}
        />
      );
    case 'table':
      // Comparison tables need more width than a phone has; let the table scroll
      // on its own rather than widening the page.
      return (
        <div
          className={`${styles.prose} overflow-x-auto`}
          dangerouslySetInnerHTML={{ __html: block.html }}
        />
      );
    case 'button':
      return (
        <CtaLink href={block.href} label={block.label} external={block.external} />
      );
    case 'hsform':
      return (
        <HubSpotEmbed
          portalId={block.portalId}
          formId={block.formId}
          region={block.region}
        />
      );
    case 'image': {
      // Render at the image's natural size (never stretched to full width), so
      // portraits and logos don't balloon. Wide coverage maps stay full width.
      const isMap = isCoverageMap(block.src);
      return (
        <figure
          className={`mx-auto overflow-hidden rounded-2xl border border-border bg-surface ${
            isMap ? 'w-full max-w-[820px]' : 'w-fit max-w-[min(100%,34rem)]'
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={block.src}
            alt={block.alt}
            loading="lazy"
            style={isMap ? MAP_TONE : undefined}
            className={`mx-auto block h-auto ${isMap ? 'w-full' : 'max-w-full'}`}
          />
        </figure>
      );
    }
    case 'list': {
      if (block.chips) return <ChipGrid items={block.items} />;
      return (
        <div className={`${styles.prose} ${MEASURE}`}>
          {block.ordered ? (
            <ol>
              {block.items.map((it, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: it }} />
              ))}
            </ol>
          ) : (
            <ul>
              {block.items.map((it, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: it }} />
              ))}
            </ul>
          )}
        </div>
      );
    }
    case 'card-group':
      return <CardGroup cards={block.cards} />;
    case 'icon-list':
      return <IconList items={block.items} />;
    case 'divider':
      return <hr className="border-0 border-t border-border" />;
    case 'accordion':
      return <Accordion items={block.items} />;
    case 'testimonials':
      return <Testimonials items={block.items} />;
    case 'pricing':
      return <PricingCards cards={block.cards} />;
    case 'icon-cards':
      return <IconCards items={block.items} />;
    case 'media-text':
      return <MediaText image={block.image} side={block.side} blocks={block.blocks} />;
    case 'section-heading':
      return null;
  }
}

// Group consecutive buttons / images for nicer layout.
function renderBlocks(blocks: Block[]): ReactNode[] {
  const out: ReactNode[] = [];
  let i = 0;
  while (i < blocks.length) {
    const b = blocks[i];
    if (b.kind === 'button') {
      const group: Block[] = [];
      while (i < blocks.length && blocks[i].kind === 'button') group.push(blocks[i++]);
      out.push(
        <div key={`btn-${i}`} className="flex flex-wrap gap-3 py-1">
          {group.map((g, k) => (
            <BlockView key={k} block={g} />
          ))}
        </div>
      );
      continue;
    }
    // WP splits the state list across several <ul>s, which renders as separate
    // grids with ragged final rows. One grid keeps the columns even.
    if (b.kind === 'list' && b.chips) {
      const items: string[] = [];
      while (i < blocks.length) {
        const n = blocks[i];
        if (n.kind !== 'list' || !n.chips) break;
        items.push(...n.items);
        i++;
      }
      out.push(<ChipGrid key={`chips-${i}`} items={items} />);
      continue;
    }
    if (b.kind === 'image') {
      // photo + blurb + CTA runs become horizontal person rows
      const people: Person[] = [];
      let pk = i;
      for (;;) {
        const got = collectPerson(blocks, pk);
        if (!got) break;
        people.push(got.person);
        pk = got.next;
      }
      if (people.length > 0) {
        // Full-width rows: side by side in a content column these collapse to a
        // ~180px text measure that wraps every three words.
        out.push(
          <div key={`people-${i}`} className="space-y-4">
            {people.map((p, k) => (
              <PersonCard key={k} person={p} />
            ))}
          </div>
        );
        i = pk;
        continue;
      }

      const group: Block[] = [];
      while (i < blocks.length && blocks[i].kind === 'image') group.push(blocks[i++]);
      if (group.length >= 5) {
        // Logo/image carousel.
        out.push(
          <Carousel key={`img-${i}`}>
            {group.map((g, k) => (
              <BlockView key={k} block={g} />
            ))}
          </Carousel>
        );
      } else if (group.length > 1) {
        out.push(
          <div key={`img-${i}`} className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {group.map((g, k) => (
              <BlockView key={k} block={g} />
            ))}
          </div>
        );
      } else {
        out.push(<BlockView key={`img-${i}`} block={group[0]} />);
      }
      continue;
    }
    out.push(<BlockView key={i} block={b} />);
    i++;
  }
  return out;
}

/**
 * A run of "heading + blurb + read more" clusters is a list of links, not prose.
 * Stacked as paragraphs they read as several identical sections; as an index
 * they gain a scannable rhythm and use the full column width.
 */
type Topic = {
  title: string;
  body: string;
  cta: Extract<Block, { kind: 'button' }>;
};

function asTopic(group: Block[]): Topic | null {
  if (group.length < 3) return null;
  const [head, ...rest] = group;
  if (head.kind !== 'heading') return null;

  const title = stripTags(head.html);
  if (!title || wordCount(title) > 8 || title === title.toUpperCase()) return null;

  const cta = rest[rest.length - 1];
  if (cta.kind !== 'button' || !NAVIGATIONAL_CTA.test(cta.label.trim())) return null;

  const body = rest.slice(0, -1);
  if (!body.length || !body.every((b) => b.kind === 'paragraph')) return null;

  return {
    title: head.html,
    body: body.map((b) => `<p>${(b as Extract<Block, { kind: 'paragraph' }>).html}</p>`).join(''),
    cta,
  };
}

function TopicList({ items }: { items: Topic[] }) {
  return (
    <ul className="border-t border-border">
      {items.map((t, i) => (
        <li key={i} className="border-b border-border">
          <div className="grid gap-x-10 gap-y-2 py-7 sm:grid-cols-[minmax(0,12rem)_minmax(0,1fr)]">
            <h3
              className="font-display text-lg leading-snug text-balance text-ink"
              dangerouslySetInnerHTML={{ __html: t.title }}
            />
            <div>
              <div
                className={`${styles.prose} text-[15px]`}
                dangerouslySetInnerHTML={{ __html: t.body }}
              />
              <div className="mt-3">
                <CtaLink
                  href={t.cta.href}
                  label={t.cta.label}
                  external={t.cta.external}
                  variant="secondary"
                />
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

/**
 * Cluster each heading with the copy that follows it. WP emits a flat list, so
 * evenly spacing every sibling leaves headings floating between topics instead
 * of belonging to the text underneath them.
 */
function BlockFlow({ blocks }: { blocks: Block[] }) {
  const groups: Block[][] = [];
  for (const b of blocks) {
    const cur = groups[groups.length - 1];
    // A heading opens a new cluster, but runs of headings (kicker + title,
    // title + standfirst) belong to the same one.
    const startNew =
      !cur || (b.kind === 'heading' && cur.some((x) => x.kind !== 'heading'));
    if (startNew) groups.push([b]);
    else cur.push(b);
  }

  const out: ReactNode[] = [];
  let i = 0;
  while (i < groups.length) {
    const run: Topic[] = [];
    let k = i;
    for (;;) {
      const t = groups[k] ? asTopic(groups[k]) : null;
      if (!t) break;
      run.push(t);
      k++;
    }
    if (run.length >= 2) {
      out.push(<TopicList key={`topics-${i}`} items={run} />);
      i = k;
      continue;
    }
    out.push(
      <div key={i} className="space-y-5">
        {renderBlocks(groups[i])}
      </div>
    );
    i++;
  }

  return <div className="space-y-12">{out}</div>;
}

type Media = { src: string; alt: string };

const PANEL =
  'rounded-3xl border border-border bg-surface p-6 md:p-8 lg:p-10';

const hasChips = (s: Section) => s.blocks.some((b) => b.kind === 'list' && b.chips);

/**
 * A section that is really a tool (a locator grid, a set of service cards)
 * reads better as an inset panel; running prose stays on the page surface. The
 * alternation is what stops a long page from looking like one unbroken column.
 */
const isPanel = (s: Section) =>
  s.blocks.some((b) => (b.kind === 'list' && b.chips) || b.kind === 'card-group');

function SectionHeading({ text }: { text: string }) {
  return (
    <Heading level={2} className="mb-7 text-balance">
      {text}
    </Heading>
  );
}

/**
 * Heading + intro beside the coverage map, with the state grid below it, so the
 * map illustrates the tool it belongs to instead of floating above the page.
 */
function LocatorPanel({ section, media }: { section: Section; media?: Media }) {
  const isChips = (b: Block) => b.kind === 'list' && !!b.chips;

  // Keep source order: copy above the grid, the grid, then whatever follows it
  // (here, the interventionist cards). Splitting on "chips vs not" alone would
  // hoist those cards into the intro column.
  const start = section.blocks.findIndex(isChips);
  let end = start;
  while (end < section.blocks.length && isChips(section.blocks[end])) end++;

  const intro = start === -1 ? section.blocks : section.blocks.slice(0, start);
  const chips =
    start === -1
      ? []
      : section.blocks
          .slice(start, end)
          .flatMap((b) => (b.kind === 'list' ? b.items : []));
  const after = start === -1 ? [] : section.blocks.slice(end);

  return (
    <section className={PANEL}>
      <div
        className={
          media
            ? 'grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] lg:gap-12'
            : ''
        }
      >
        <div>
          {section.heading && <SectionHeading text={section.heading} />}
          <BlockFlow blocks={intro} />
        </div>
        {media && (
          <figure className="lg:justify-self-end">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={media.src}
              alt={media.alt}
              loading="lazy"
              style={isCoverageMap(media.src) ? MAP_TONE : undefined}
              className="mx-auto block h-auto w-full max-w-[420px]"
            />
          </figure>
        )}
      </div>
      {chips.length > 0 && (
        <div className="mt-10 border-t border-border pt-10">
          <ChipGrid items={chips} />
        </div>
      )}
      {after.length > 0 && (
        <div className="mt-12">
          <BlockFlow blocks={after} />
        </div>
      )}
    </section>
  );
}

function SectionView({
  section,
  media,
  panels,
}: {
  section: Section;
  media?: Media;
  panels: boolean;
}) {
  if (panels && hasChips(section)) {
    return <LocatorPanel section={section} media={media} />;
  }
  return (
    <section className={panels && isPanel(section) ? PANEL : undefined}>
      {section.heading && <SectionHeading text={section.heading} />}
      {media && <BlockView block={{ kind: 'image', ...media }} />}
      <BlockFlow blocks={section.blocks} />
    </section>
  );
}

export function WpContent({
  html,
  blocks,
  leadMedia,
  rail,
  railMobile = false,
  editorial = false,
}: {
  html?: string;
  blocks?: Block[];
  /** Hoisted banner image, rendered beside the section it illustrates. */
  leadMedia?: Media;
  /** Sticky companion column; also opts the body into the two-column grid. */
  rail?: ReactNode;
  /**
   * Keep the rail on small screens. Off by default: a rail that restates the
   * closing CTA would just repeat what sits directly below it once stacked.
   */
  railMobile?: boolean;
  /** Inset panels for tool-like sections. Off by default so existing pages are unchanged. */
  editorial?: boolean;
}) {
  const parsed = blocks ?? (html ? parseWp(html) : []);
  if (!parsed.length) return null;
  const sections = groupSections(parsed);
  if (!sections.length) return null;

  // The locator grid claims the map. Without one, fall back to rendering it in
  // the first section so a hoisted image is never silently dropped.
  const chipIdx = sections.findIndex(hasChips);
  const mediaIdx = leadMedia ? (chipIdx === -1 ? 0 : chipIdx) : -1;

  const body = (
    <div className="space-y-16 md:space-y-24">
      {sections.map((section, idx) => (
        <SectionView
          key={idx}
          section={section}
          media={idx === mediaIdx ? leadMedia : undefined}
          panels={editorial}
        />
      ))}
    </div>
  );

  if (!rail) return body;

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-14">
      <div className="min-w-0">{body}</div>
      <aside
        className={`${railMobile ? '' : 'hidden '}lg:sticky lg:top-28 lg:block lg:self-start`}
      >
        {rail}
      </aside>
    </div>
  );
}
