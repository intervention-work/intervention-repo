'use client';

import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { viewport } from '@/lib/motion';
import type { ContentBlock } from '@/content/types';

function toParagraphs(body?: string | string[]): string[] {
  if (!body) return [];
  return Array.isArray(body) ? body : [body];
}

export function ContentBlocks({ blocks }: { blocks: ContentBlock[] }) {
  if (blocks.length === 0) return null;

  return (
    <div className="space-y-14">
      {blocks.map((block, i) => (
        <motion.div
          key={`${block.heading ?? 'block'}-${i}`}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {block.heading && (
            <h2
              className="font-display text-2xl leading-tight text-ink md:text-3xl"
            >
              {block.heading}
            </h2>
          )}

          {toParagraphs(block.body).map((para, j) => (
            <p
              key={j}
              className={
                'font-sans text-base leading-relaxed text-ink-body md:text-lg ' +
                (j === 0 && block.heading ? 'mt-4' : j === 0 ? '' : 'mt-4')
              }
            >
              {para}
            </p>
          ))}

          {block.bullets && block.bullets.length > 0 && (
            <ul className="mt-6 space-y-3">
              {block.bullets.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 font-sans text-base leading-relaxed text-ink-body md:text-lg"
                >
                  <Check
                    size={16}
                    strokeWidth={2.25}
                    className="mt-1.5 shrink-0 text-sage-500"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}

          {block.stats && block.stats.length > 0 && (
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {block.stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-border bg-surface p-6"
                >
                  <p
                    className="font-display text-3xl leading-none text-sage-700 md:text-4xl"
                  >
                    {stat.value}
                  </p>
                  <p className="mt-3 font-sans text-sm leading-relaxed text-ink-muted">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          )}

          {block.features && block.features.length > 0 && (
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {block.features.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-border bg-white p-6"
                >
                  <h3
                    className="font-display text-lg text-ink md:text-xl"
                  >
                    {feature.title}
                  </h3>
                  <p className="mt-2.5 font-sans text-[15px] leading-relaxed text-ink-muted">
                    {feature.body}
                  </p>
                </div>
              ))}
            </div>
          )}

          {block.steps && block.steps.length > 0 && (
            <ol className="mt-8 space-y-6">
              {block.steps.map((step, k) => (
                <li key={step.title} className="flex gap-5">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sage-700 font-sans text-sm font-medium text-white"
                    aria-hidden
                  >
                    {k + 1}
                  </span>
                  <div className="pt-1">
                    <h3
                      className="font-display text-lg text-ink md:text-xl"
                    >
                      {step.title}
                    </h3>
                    <p className="mt-1.5 font-sans text-[15px] leading-relaxed text-ink-body md:text-base">
                      {step.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </motion.div>
      ))}
    </div>
  );
}
