'use client';

import { motion } from 'motion/react';
import { viewport } from '@/lib/motion';

export function Testimonials() {
  return (
    <section
      aria-label="A family's words"
      className="bg-surface py-24 lg:py-32"
    >
      <div className="mx-auto max-w-3xl px-6 text-center">
        <motion.figure
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="font-sans text-[13px] tracking-[0.22em] uppercase text-sage-500">
            In a family&apos;s words
          </p>

          <blockquote
            className="mt-6 font-display text-[1.75rem] leading-snug text-ink md:text-4xl"
            style={{ fontVariationSettings: '"opsz" 96, "SOFT" 70, "WONK" 0' }}
          >
            &ldquo;I had been holding my breath for nine years. The morning
            after the intervention, I exhaled for the first time. My son is two
            years sober.&rdquo;
          </blockquote>

          <figcaption className="mt-8 font-sans text-sm text-ink-muted">
            <span className="text-ink-body">Maria</span>
            <span className="mx-2 text-border">·</span>
            <span>mother of three, Phoenix</span>
          </figcaption>
        </motion.figure>
      </div>
    </section>
  );
}
