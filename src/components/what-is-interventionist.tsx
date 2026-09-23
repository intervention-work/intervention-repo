'use client';

import { motion } from 'motion/react';
import { viewport } from '@/lib/motion';

const STATS = [
  { n: '1,000+', label: 'Families helped' },
  { n: '20+', label: 'Years of experience' },
  { n: 'All 50', label: 'States served' },
];

export function WhatIsInterventionist() {
  return (
    <section className="bg-surface py-10 lg:py-[50px]">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewport}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="font-sans text-sm tracking-[0.22em] uppercase text-sage-500">
              What Is an Interventionist?
            </p>
            <h2 className="mt-4 font-display text-3xl leading-[1.1] text-ink md:text-4xl lg:text-[2.75rem]">
              A certified guide to help your family through crisis.
            </h2>
            <p className="mt-6 font-sans text-lg leading-relaxed text-ink-body">
              An interventionist is a professionally certified specialist who guides families through
              a carefully structured approach to recovery. Rather than confrontation, we create a
              nurturing, safe, and constructive environment, one that gives your loved one the best
              chance of accepting help.
            </p>
            <p className="mt-4 font-sans text-lg leading-relaxed text-ink-body">
              Our team is led by Brad Lamm, CIP, one of the most recognized names in the field,
              who has personally guided over 1,000 families toward recovery since 2003.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewport}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-1"
          >
            {STATS.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-border bg-white p-6 lg:p-8"
              >
                <p
                  className="font-display text-4xl leading-none text-ink lg:text-5xl"
                  style={{ fontFeatureSettings: '"tnum"' }}
                >
                  {s.n}
                </p>
                <p className="mt-2 font-sans text-sm tracking-[0.14em] uppercase text-ink-muted">
                  {s.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
