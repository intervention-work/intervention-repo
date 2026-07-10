'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowRight, Phone, Shield, Check } from 'lucide-react';
import { useSound } from '@/lib/sound';

const STATS = [
  { n: '20+', label: 'Years' },
  { n: '10,000+', label: 'Families' },
  { n: 'All 50', label: 'States' },
];

const CARD_BULLETS = [
  'We respond within the hour',
  'No pressure, no obligation',
  'ARISE & AIS certified team',
];

export function Hero() {
  const { registerMedia } = useSound();

  return (
    <section
      id="top"
      className="relative h-screen min-h-[720px] w-full overflow-hidden bg-ink"
    >
      {/* VIDEO BG — the water-droplet hero clip. Its ref registers with
       * SoundProvider so the Sound toggle unmutes this element. */}
      <video
        ref={registerMedia}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 h-full w-full object-cover"
        poster="/images/hero-v2-poster.jpg"
      >
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>

      {/* Gradient overlay */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0.10) 38%, rgba(0,0,0,0.78) 100%)',
        }}
      />

      {/* BOTTOM-LEFT — headline block, flush to viewport edge */}
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.95,
          ease: [0.22, 1, 0.36, 1],
          delay: 0.18,
        }}
        className="absolute bottom-10 left-6 z-10 w-[calc(100%-3rem)] max-w-[720px] md:bottom-14 md:left-12 md:w-[60%] lg:bottom-20 lg:left-16"
      >
        <p className="mb-5 font-sans text-[11px] tracking-[0.24em] uppercase text-white/60">
          Nation&apos;s leading interventionists · Since 2003
        </p>

        <h1
          className="font-display leading-[1.05] text-white"
          style={{
            fontSize: 'clamp(2.5rem, 4.8vw, 4.5rem)',
            fontVariationSettings: '"opsz" 96, "SOFT" 65, "WONK" 0',
          }}
        >
          When nothing else worked,{' '}
          <em
            className="not-italic"
            style={{
              color: '#A2C8B0',
              fontVariationSettings: '"opsz" 96, "SOFT" 90, "WONK" 1',
            }}
          >
            an intervention can change everything.
          </em>
        </h1>

        <p className="mt-6 max-w-[540px] font-sans text-base leading-relaxed text-white/75 md:text-lg">
          Compassionate, certified interventions for addiction, mental health,
          and eating disorders. Free consultation. Nationwide.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full bg-sage-500 px-7 py-4 font-sans text-base font-medium text-white shadow-[0_10px_30px_-10px_rgba(74,124,95,0.7)] transition-colors duration-300 hover:bg-sage-700"
          >
            Talk to a specialist
            <ArrowRight size={16} strokeWidth={1.75} />
          </Link>
          <a
            href="tel:+18007891605"
            className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 py-4 font-sans text-base text-white backdrop-blur-sm transition-colors duration-300 hover:bg-white/20"
          >
            <Phone size={14} strokeWidth={1.75} />
            (800) 789-1605
          </a>
        </div>

        <div className="mt-9 flex items-center gap-12">
          {STATS.map((s) => (
            <div key={s.label}>
              <p
                className="font-display text-2xl leading-none text-white"
                style={{
                  fontVariationSettings: '"opsz" 32, "SOFT" 20, "WONK" 0',
                  fontFeatureSettings: '"tnum"',
                }}
              >
                {s.n}
              </p>
              <p className="mt-1.5 font-sans text-[11px] tracking-[0.18em] uppercase text-white/55">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* BOTTOM-RIGHT — frosted glass conversion card, flush to viewport edge */}
      <motion.aside
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.95,
          ease: [0.22, 1, 0.36, 1],
          delay: 0.35,
        }}
        className="absolute right-6 bottom-10 z-10 hidden w-[400px] md:bottom-14 md:right-12 lg:bottom-20 lg:right-16 lg:block"
        aria-label="Free consultation"
      >
        <div className="rounded-2xl border border-white/15 bg-white/[0.08] p-6 text-white backdrop-blur-md md:p-7">
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 font-sans text-[10px] text-white/75">
            <Shield size={9} strokeWidth={1.75} />
            Free · Confidential · No obligation
          </div>

          <p className="mb-1 font-sans text-[10px] tracking-[0.22em] uppercase text-white/55">
            Speak with a specialist
          </p>
          <p
            className="mb-4 font-display text-lg leading-snug text-white md:text-xl"
            style={{
              fontVariationSettings: '"opsz" 32, "SOFT" 60, "WONK" 0',
            }}
          >
            Talk to a specialist today.
          </p>

          <ul className="mb-5 space-y-2">
            {CARD_BULLETS.map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 font-sans text-[13px] text-white/80"
              >
                <Check
                  size={11}
                  strokeWidth={2.25}
                  className="shrink-0 text-sage-400"
                />
                {item}
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-2">
            <input
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="Your phone number"
              className="w-full rounded-xl border border-white/15 bg-white/10 px-3.5 py-2.5 font-sans text-[13px] text-white outline-none transition-colors placeholder:text-white/35 focus:border-white/50"
            />
            <a
              href="tel:+18007891605"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-sage-500 py-2.5 font-sans text-[13px] font-medium text-white transition-colors duration-300 hover:bg-sage-700"
            >
              <Phone size={12} strokeWidth={1.75} />
              Call now — it&apos;s free
            </a>
          </div>

          <p className="mt-3 text-center font-sans text-[10px] text-white/35">
            Available 24 hours a day, 7 days a week
          </p>
        </div>
      </motion.aside>
    </section>
  );
}
