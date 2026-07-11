'use client';

import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { viewport } from '@/lib/motion';
import { PageHero, type Crumb } from '@/components/page-hero';
import { CtaBanner } from '@/components/cta-banner';
import { ContentBlocks } from '@/components/content-blocks';
import { WpContent } from '@/components/wp-content';
import type { ContentBlock } from '@/content/types';

type ContentPageProps = {
  crumbs: Crumb[];
  eyebrow?: string;
  title: string;
  summary?: string;
  image?: string;
  intro?: string;
  blocks?: ContentBlock[];
  /** Sanitized WP page body HTML (real editorial content). */
  body?: string;
  children?: ReactNode;
};

export function ContentPage({
  crumbs,
  eyebrow,
  title,
  summary,
  image,
  intro,
  blocks = [],
  body = '',
  children,
}: ContentPageProps) {
  return (
    <main>
      <PageHero
        crumbs={crumbs}
        eyebrow={eyebrow}
        title={title}
        summary={summary}
        image={image}
      />

      <section className="bg-white py-24 lg:py-32">
        <div className="mx-auto max-w-3xl px-6">
          {intro && (
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewport}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-2xl leading-[1.4] text-ink md:text-[1.7rem]"
              style={{ fontVariationSettings: '"opsz" 32, "SOFT" 50, "WONK" 0' }}
            >
              {intro}
            </motion.p>
          )}

          {body ? (
            <div className="mt-12">
              <WpContent html={body} />
            </div>
          ) : (
            blocks.length > 0 && (
              <div className="mt-12">
                <ContentBlocks blocks={blocks} />
              </div>
            )
          )}

          {children}
        </div>
      </section>

      <CtaBanner />
    </main>
  );
}
