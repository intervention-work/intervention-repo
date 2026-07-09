'use client';

import { motion } from 'motion/react';
import { useSound } from '@/lib/sound';

type Props = {
  /** Render with white text/bars over a dark background (hero). */
  light?: boolean;
};

/**
 * SoundToggle — Clair-style labeled pill with animated EQ bars.
 * Controls the hero <video>'s audio via SoundProvider. No external file.
 */
export function SoundToggle({ light = false }: Props) {
  const { enabled, toggle } = useSound();

  // Bar peak heights (out of 12px) for active state
  const BARS = [0.45, 1.0, 0.65, 0.85];
  const PEAK_H = 12;
  const RESTING_H = 3;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={enabled ? 'Mute hero sound' : 'Unmute hero sound'}
      aria-pressed={enabled}
      className={
        'inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-sans text-[10px] tracking-[0.16em] uppercase backdrop-blur-md transition-colors duration-300 ' +
        (light
          ? 'border border-white/25 bg-ink/30 text-white hover:bg-ink/45'
          : 'border border-border bg-white text-ink hover:border-sage-200')
      }
    >
      <span className="flex h-3 items-end gap-[2px]" aria-hidden>
        {BARS.map((peak, i) => {
          const barColor = enabled
            ? light
              ? 'bg-sage-400'
              : 'bg-sage-500'
            : light
              ? 'bg-white'
              : 'bg-ink-body';
          return (
            <motion.span
              key={i}
              className={'w-[2px] rounded-full ' + barColor}
              style={{ height: RESTING_H }}
              animate={
                enabled
                  ? {
                      height: [
                        RESTING_H,
                        Math.round(PEAK_H * peak),
                        Math.round(PEAK_H * peak * 0.4),
                        Math.round(PEAK_H * peak),
                        RESTING_H,
                      ],
                    }
                  : { height: RESTING_H }
              }
              transition={
                enabled
                  ? {
                      duration: 0.95 + i * 0.12,
                      ease: 'easeInOut',
                      repeat: Infinity,
                      delay: i * 0.08,
                    }
                  : { duration: 0.25, ease: 'easeOut' }
              }
            />
          );
        })}
      </span>
      <span>{enabled ? 'Sound on' : 'Sound off'}</span>
    </button>
  );
}
