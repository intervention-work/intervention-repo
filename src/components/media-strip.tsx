'use client';

import { motion } from 'motion/react';
import { viewport } from '@/lib/motion';

const OUTLETS = [
  'The New York Times',
  'ABC News',
  'USA Today',
  'Forbes',
  'People',
  'NBC',
  'CNN',
  'Today',
  'Good Morning America',
  'The Washington Post',
];

function Row() {
  return (
    <ul
      aria-hidden
      className="flex shrink-0 items-center gap-14 pr-14 font-display text-base text-ink-muted/70 md:text-lg"
    >
      {OUTLETS.map((outlet, i) => (
        <li
          key={`${outlet}-${i}`}
          style={{ fontVariationSettings: '"opsz" 24, "SOFT" 40, "WONK" 0' }}
        >
          {outlet}
        </li>
      ))}
    </ul>
  );
}

export function MediaStrip() {
  return (
    <section
      aria-label="National media"
      className="border-y border-border bg-white py-10"
    >
      <div className="mx-auto max-w-[1200px] px-6">
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6 text-center font-sans text-xs tracking-[0.22em] uppercase text-ink-muted"
        >
          Featured in national media
        </motion.p>
      </div>

      {/* Edge-to-edge marquee, masked at left/right */}
      <div
        className="relative overflow-hidden"
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
