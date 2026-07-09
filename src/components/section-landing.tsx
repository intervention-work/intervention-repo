'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { viewport } from '@/lib/motion';
import { PageHero } from '@/components/page-hero';
import { CtaBanner } from '@/components/cta-banner';
import { ContentBlocks } from '@/components/content-blocks';
import { FaqList } from '@/components/faq-list';
import type { Section } from '@/content/site';

export function SectionLanding({ section }: { section: Section }) {
  return (
    <main>
      <PageHero
        crumbs={[{ label: 'Home', href: '/' }, { label: section.label }]}
        eyebrow={section.label}
        title={section.title}
        summary={section.summary}
        image={section.image}
      />

      {/* Intro + rich content */}
      <section className="bg-white py-24 lg:py-32">
        <div className="mx-auto max-w-3xl px-6">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewport}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-2xl leading-[1.45] text-ink-body md:text-[1.6rem]"
            style={{ fontVariationSettings: '"opsz" 32, "SOFT" 40, "WONK" 0' }}
          >
            {section.intro}
          </motion.p>

          {section.blocks && section.blocks.length > 0 && (
            <div className="mt-14">
              <ContentBlocks blocks={section.blocks} />
            </div>
          )}

          {section.faq && section.faq.length > 0 && (
            <div className="mt-16 border-t border-border pt-14">
              <FaqList items={section.faq} />
            </div>
          )}
        </div>
      </section>

      {/* Child cards */}
      {section.children.length > 0 && (
      <section className="bg-surface py-24 lg:py-32">
        <div className="mx-auto max-w-[1200px] px-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewport}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto max-w-2xl text-center"
          >
            <p className="font-sans text-[13px] tracking-[0.22em] uppercase text-sage-500">
              {section.childrenEyebrow}
            </p>
            <h2
              className="mt-4 font-display text-3xl leading-[1.1] text-ink md:text-4xl lg:text-[2.75rem]"
              style={{ fontVariationSettings: '"opsz" 72, "SOFT" 60, "WONK" 0' }}
            >
              {section.childrenTitle}
            </h2>
          </motion.div>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {section.children.map((child, i) => (
              <motion.div
                key={child.slug}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewport}
                transition={{
                  duration: 0.6,
                  ease: [0.22, 1, 0.36, 1],
                  delay: (i % 3) * 0.06,
                }}
              >
                <Link
                  href={`/${section.slug}/${child.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-white transition-shadow duration-300 hover:shadow-[0_24px_60px_-32px_rgba(17,24,39,0.35)]"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden">
                    <Image
                      src={child.image ?? section.image}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
                      className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                    />
                    <div
                      aria-hidden
                      className="absolute inset-0"
                      style={{
                        background:
                          'linear-gradient(to top, rgba(17,24,39,0.35) 0%, transparent 55%)',
                      }}
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-7">
                    <h3
                      className="font-display text-xl leading-snug text-ink transition-colors duration-200 group-hover:text-sage-700 md:text-[1.35rem]"
                      style={{
                        fontVariationSettings: '"opsz" 48, "SOFT" 60, "WONK" 0',
                      }}
                    >
                      {child.label}
                    </h3>
                    <p className="mt-3 flex-1 font-sans text-sm leading-relaxed text-ink-muted">
                      {child.summary}
                    </p>
                    <span className="mt-5 inline-flex items-center gap-1.5 font-sans text-sm font-medium text-sage-500">
                      Learn more
                      <ArrowRight
                        size={14}
                        strokeWidth={1.75}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      )}

      <CtaBanner />
    </main>
  );
}
