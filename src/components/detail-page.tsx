'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowRight, Phone, Shield, Check } from 'lucide-react';
import { viewport } from '@/lib/motion';
import { PageHero } from '@/components/page-hero';
import { CtaBanner } from '@/components/cta-banner';
import { ContentBlocks } from '@/components/content-blocks';
import { WpContent } from '@/components/wp-content';
import { FaqList } from '@/components/faq-list';
import type { Section, DetailContent } from '@/content/types';
import type { Block } from '@/lib/wp-content-parse';
import { useSettings } from '@/lib/settings';

const CARD_BULLETS = [
  'We respond within the hour',
  'Free & fully confidential',
  'Certified specialists',
];

export function DetailPage({
  section,
  detail,
  bodyBlocks,
}: {
  section: Section;
  detail: DetailContent;
  /** Server-parsed WP body blocks (real editorial content). */
  bodyBlocks?: Block[];
}) {
  const body = bodyBlocks && bodyBlocks.length > 0;
  const { phoneDisplay, phoneHref } = useSettings();
  const related = section.children.filter((c) => c.slug !== detail.slug);

  return (
    <main>
      <PageHero
        crumbs={[
          { label: 'Home', href: '/' },
          { label: section.label, href: `/${section.slug}` },
          { label: detail.label },
        ]}
        eyebrow={section.label}
        title={detail.title}
        summary={detail.summary}
        image={detail.image ?? section.image}
      />

      <section className="bg-white py-24 lg:py-32">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-14 px-6 lg:grid-cols-[1fr_360px] lg:gap-16">
          {/* Main content */}
          <div>
            {detail.intro && (
              <motion.p
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewport}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="font-display text-2xl leading-[1.4] text-ink md:text-[1.7rem]"
                style={{
                  fontVariationSettings: '"opsz" 32, "SOFT" 50, "WONK" 0',
                }}
              >
                {detail.intro}
              </motion.p>
            )}

            <div className="mt-12">
              {body ? (
                <WpContent blocks={bodyBlocks} />
              ) : (
                <ContentBlocks blocks={detail.blocks} />
              )}
            </div>

            {/* Only render the ACF faq when there's no WP body — the body is the
                source of truth and already carries the FAQ (as an accordion), so
                rendering both duplicates it. */}
            {!body && detail.faq && detail.faq.length > 0 && (
              <div className="mt-16 border-t border-border pt-14">
                <FaqList items={detail.faq} />
              </div>
            )}
          </div>

          {/* Sticky consultation sidebar */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-border bg-surface p-7 md:p-8">
              <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-2.5 py-1 font-sans text-[11px] text-ink-muted">
                <Shield size={10} strokeWidth={1.75} className="text-sage-500" />
                Free · Confidential · No obligation
              </div>
              <p
                className="font-display text-xl leading-snug text-ink md:text-2xl"
                style={{ fontVariationSettings: '"opsz" 32, "SOFT" 60, "WONK" 0' }}
              >
                Talk to a specialist today.
              </p>
              <p className="mt-3 font-sans text-sm leading-relaxed text-ink-muted">
                A certified specialist answers in under an hour, 24/7. There is
                no script and no pressure.
              </p>

              <ul className="mt-5 space-y-2.5">
                {CARD_BULLETS.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 font-sans text-sm text-ink-body"
                  >
                    <Check
                      size={13}
                      strokeWidth={2.25}
                      className="shrink-0 text-sage-500"
                    />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex flex-col gap-2.5">
                <Link
                  href="/contact"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-sage-700 px-5 py-3.5 font-sans text-sm font-medium text-white transition-colors duration-300 hover:bg-sage-900"
                >
                  Talk to a specialist
                  <ArrowRight size={14} strokeWidth={1.75} />
                </Link>
                <a
                  href={phoneHref}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-white px-5 py-3.5 font-sans text-sm text-ink transition-colors duration-200 hover:bg-surface"
                >
                  <Phone size={13} strokeWidth={1.75} className="text-sage-500" />
                  {phoneDisplay}
                </a>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Related links */}
      {related.length > 0 && (
        <section className="border-t border-border bg-surface py-20 lg:py-24">
          <div className="mx-auto max-w-[1200px] px-6">
            <p className="font-sans text-[13px] tracking-[0.22em] uppercase text-sage-500">
              More in {section.label}
            </p>
            <div className="mt-8 grid grid-cols-1 gap-x-10 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <Link
                  key={item.slug}
                  href={`/${section.slug}/${item.slug}`}
                  className="group flex items-center justify-between gap-4 border-b border-border py-4 transition-colors duration-200 hover:border-sage-400"
                >
                  <span className="font-display text-lg text-ink transition-colors duration-200 group-hover:text-sage-700">
                    {item.label}
                  </span>
                  <ArrowRight
                    size={15}
                    strokeWidth={1.75}
                    className="shrink-0 text-ink-muted transition-transform duration-300 group-hover:translate-x-1 group-hover:text-sage-500"
                  />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaBanner />
    </main>
  );
}
