'use client';

import { motion } from 'motion/react';
import { viewport } from '@/lib/motion';
import type { FaqItem } from '@/content/types';

export function FaqList({
  items,
  title = 'Frequently asked questions',
}: {
  items: FaqItem[];
  title?: string;
}) {
  if (items.length === 0) return null;

  return (
    <div>
      <h2
        className="font-display text-2xl leading-tight text-ink md:text-3xl"
        style={{ fontVariationSettings: '"opsz" 64, "SOFT" 60, "WONK" 0' }}
      >
        {title}
      </h2>
      <dl className="mt-8 divide-y divide-border border-t border-border">
        {items.map((item, i) => (
          <motion.div
            key={item.q}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewport}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: i * 0.04 }}
            className="py-6"
          >
            <dt
              className="font-display text-lg text-ink md:text-xl"
              style={{ fontVariationSettings: '"opsz" 32, "SOFT" 60, "WONK" 0' }}
            >
              {item.q}
            </dt>
            <dd className="mt-3 font-sans text-base leading-relaxed text-ink-body">
              {item.a}
            </dd>
          </motion.div>
        ))}
      </dl>
    </div>
  );
}
