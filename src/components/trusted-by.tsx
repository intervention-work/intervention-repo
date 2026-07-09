'use client';

import { motion } from 'motion/react';
import { viewport } from '@/lib/motion';

const ORGS = [
  'Association of Intervention Specialists',
  'NAATP',
  'ASAM',
  'NAMI',
  'The Joint Commission',
  'LegitScript',
  'NAADAC',
  'CARF International',
];

function Row() {
  return (
    <ul
      aria-hidden
      className="flex shrink-0 items-center gap-14 pr-14 font-sans text-sm tracking-wide text-ink-muted/70 md:text-base"
    >
      {ORGS.map((org, i) => (
        <li key={`${org}-${i}`}>{org}</li>
      ))}
    </ul>
  );
}

export function TrustedBy() {
  return (
    <section
      aria-label="Trusted by professional organizations"
      className="bg-white py-20 lg:py-24"
    >
      <div className="mx-auto max-w-[1200px] px-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-xl text-center"
        >
          <p className="font-sans text-[13px] tracking-[0.22em] uppercase text-sage-500">
            Trusted by the field
          </p>
          <h2
            className="mt-4 font-display text-3xl leading-[1.1] text-ink md:text-4xl lg:text-[2.75rem]"
            style={{ fontVariationSettings: '"opsz" 72, "SOFT" 60, "WONK" 0' }}
          >
            Twenty years. Ten thousand families.
          </h2>
          <p className="mt-4 font-sans text-base text-ink-muted md:text-lg">
            Certified by the professional bodies that set the standard.
          </p>
        </motion.div>
      </div>

      <div
        className="relative mt-10 overflow-hidden"
        style={{
          maskImage:
            'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
          WebkitMaskImage:
            'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
        }}
      >
        <div className="flex w-max animate-marquee">
          <Row />
          <Row />
        </div>
      </div>
    </section>
  );
}
