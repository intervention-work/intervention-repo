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
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-12"
        >
          <div className="lg:col-span-5">
            <p className="font-sans text-sm tracking-[0.22em] uppercase text-sage-500">
              What Is an Interventionist?
            </p>
            <h2 className="mt-4 font-display text-3xl leading-[1.1] text-balance text-ink md:text-4xl lg:text-[2.75rem]">
              A certified guide to help your family through crisis.
            </h2>
          </div>
          <div className="lg:col-span-6 lg:col-start-7 lg:pt-10">
            <p className="font-sans text-lg leading-relaxed text-ink-body">
              An interventionist is a professionally certified specialist who guides families through
              a carefully structured approach to recovery. Rather than confrontation, we create a
              nurturing, safe, and constructive environment, one that gives your loved one the best
              chance of accepting help.
            </p>
            <p className="mt-4 font-sans text-lg leading-relaxed text-ink-body">
              Our team is led by Brad Lamm, CIP, one of the most recognized names in the field,
              who has personally guided over 1,000 families toward recovery since 2003.
            </p>
          </div>
        </motion.div>

        <motion.dl
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="mt-12 grid grid-cols-1 divide-y divide-border rounded-2xl border border-border bg-white sm:grid-cols-3 sm:divide-x sm:divide-y-0 lg:mt-16"
        >
          {STATS.map((s) => (
            <div key={s.label} className="flex flex-row-reverse items-baseline justify-between gap-4 px-6 py-5 sm:flex-col-reverse sm:items-start sm:justify-start sm:gap-2 sm:py-7 lg:px-10 lg:py-9">
              <dt className="text-right font-sans text-xs tracking-[0.14em] uppercase text-ink-muted sm:text-left sm:text-sm">
                {s.label}
              </dt>
              <dd
                className="font-display text-4xl leading-none text-ink lg:text-5xl"
                style={{ fontFeatureSettings: '"tnum"' }}
              >
                {s.n}
              </dd>
            </div>
          ))}
        </motion.dl>
      </div>
    </section>
  );
}
