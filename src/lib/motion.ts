import type { Variants } from 'motion/react';

/**
 * reveal — fade up with optional staggered delay via `custom={i}`.
 * Used for word-by-word hero animation, manifesto blocks, list items.
 */
export const reveal: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

/** Container — orchestrates staggered children. */
export const stagger: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

/** Subtle scale-in — used for section labels and small accents. */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

/** Slow rise — for whole-section enters. */
export const sectionRise: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1, ease: [0.22, 1, 0.36, 1] },
  },
};

/** Standard viewport options used across the site. */
export const viewport = { once: true, margin: '-100px' } as const;
