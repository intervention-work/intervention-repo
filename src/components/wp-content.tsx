import type { ReactNode } from 'react';
import styles from './wp-prose.module.css';
import { Carousel } from './carousel';
import { Heading } from './heading';
import { IconList } from './icon-list';
import { Accordion } from './accordion';
import {
  parseBlocks,
  groupSections,
  stripTags,
  type Block,
  type Card as CardData,
} from '@/lib/wp-content-parse';

/**
 * Renders the parsed WP block model through the new design system:
 *   headings → display font · CTA links → pill buttons · flat lists → chip grid
 *   (clickable vs plain distinguished) · images → rounded media · tables/quotes.
 */

function StateChip({ html }: { html: string }) {
  const a = /<a\b[^>]*href\s*=\s*"([^"]*)"[^>]*>([\s\S]*?)<\/a>/i.exec(html);
  if (a) {
    const href = a[1];
    const label = stripTags(a[2]);
    return (
      <a
        href={href}
        className="group flex items-center justify-between gap-2 rounded-xl border border-sage-200 bg-white px-4 py-3 font-sans text-sm font-medium text-ink transition-colors hover:border-sage-400 hover:bg-sage-50 hover:text-sage-700"
      >
        {label}
        <span className="text-sage-400 transition-transform group-hover:translate-x-0.5">→</span>
      </a>
    );
  }
  return (
    <span className="flex items-center rounded-xl border border-border bg-surface px-4 py-3 font-sans text-sm text-ink-muted">
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

// Reusable content card: icon/photo, heading, body, optional button.
function Card({ card }: { card: CardData }) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-white p-7 transition-shadow duration-300 hover:shadow-[0_24px_60px_-24px_rgba(17,24,39,0.22)]">
      {card.image?.src && (
        <div className="mb-5 flex h-16 items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={card.image.src} alt={card.image.alt} loading="lazy" className="h-16 w-auto object-contain" />
        </div>
      )}
      <Heading level={3}>{card.heading}</Heading>
      {card.bodyHtml && (
        <div
          className={`${styles.prose} mt-3 flex-1 text-[15px]`}
          dangerouslySetInnerHTML={{ __html: card.bodyHtml }}
        />
      )}
      {card.button && (
        <a
          href={card.button.href}
          {...(card.button.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          className="mt-5 inline-flex w-fit items-center justify-center gap-2 rounded-full bg-sage-700 px-5 py-2.5 font-sans text-sm font-medium text-white transition-colors duration-300 hover:bg-sage-900"
        >
          {card.button.label}
        </a>
      )}
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
  const cols = cards.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3';
  return (
    <div className={`grid grid-cols-1 gap-6 ${cols}`}>
      {cards.map((c, i) => (
        <Card key={i} card={c} />
      ))}
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
        style={{ fontVariationSettings: '"opsz" 28, "SOFT" 50, "WONK" 0' }}
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

function BlockView({ block }: { block: Block }) {
  switch (block.kind) {
    case 'heading':
      return <Heading level={block.level} html={block.html} />;
    case 'paragraph':
      return (
        <div className={styles.prose} dangerouslySetInnerHTML={{ __html: `<p>${block.html}</p>` }} />
      );
    case 'quote':
      return <blockquote className={styles.quote} dangerouslySetInnerHTML={{ __html: block.html }} />;
    case 'table':
      return (
        <div className={styles.prose} dangerouslySetInnerHTML={{ __html: block.html }} />
      );
    case 'button':
      return (
        <a
          href={block.href}
          {...(block.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-sage-700 px-6 py-3 font-sans text-sm font-medium text-white transition-colors duration-300 hover:bg-sage-900"
        >
          {block.label}
        </a>
      );
    case 'image':
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={block.src} alt={block.alt} loading="lazy" className="mx-auto max-w-full rounded-2xl" />;
    case 'list': {
      if (block.chips) return <ChipGrid items={block.items} />;
      return (
        <div className={styles.prose}>
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
    if (b.kind === 'image') {
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

export function WpContent({ html }: { html: string }) {
  if (!html) return null;
  const sections = groupSections(parseBlocks(html));
  if (!sections.length) return null;

  return (
    <div className="space-y-10">
      {sections.map((section, idx) => (
        <section key={idx} className="space-y-5">
          {section.heading && <Heading level={2}>{section.heading}</Heading>}
          {renderBlocks(section.blocks)}
        </section>
      ))}
    </div>
  );
}
