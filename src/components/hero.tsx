'use client';

import { motion } from 'motion/react';
import { Phone, Check, MessageCircle } from 'lucide-react';
import { useSettings } from '@/lib/settings';

declare global {
  interface Window {
    HubSpotConversations?: { widget: { open: () => void } };
  }
}

const STATS = [
  { n: '20+', label: 'Years' },
  { n: '10,000+', label: 'Families' },
  { n: 'All 50', label: 'States' },
];

const TRUST_POINTS = [
  'Free & confidential',
  'We respond within the hour',
  'ARISE & AIS certified team',
];

export function Hero() {
  const { phoneDisplay, phoneHref } = useSettings();
  return (
    <section
      id="top"
      className="relative h-screen min-h-[720px] w-full overflow-hidden bg-ink"
    >
      {/* VIDEO BG, the water-droplet hero clip (no audio track). */}
      <video
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
            'linear-gradient(to bottom, rgba(0,0,0,0.32) 0%, rgba(0,0,0,0.12) 38%, rgba(0,0,0,0.78) 100%)',
        }}
      />

      {/* The top of the clip is pale beige; darken the text side so white and
          sage copy hold contrast without dimming the ripples on the right. */}
      <div
        aria-hidden
        className="absolute inset-0 hidden md:block"
        style={{
          background:
            'linear-gradient(to right, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.28) 40%, rgba(0,0,0,0) 72%)',
        }}
      />

      {/* Mobile-only black overlay for text legibility */}
      <div
        aria-hidden
        className="absolute inset-0 md:hidden"
        style={{ background: 'rgba(0,0,0,0.38)' }}
      />

      {/* BOTTOM — headline block left; on desktop the stats balance it on the
          right. mb-32 clears the buttons and trust row so the column ends level
          with the summary, above the chat launcher's greeting. */}
      <div className="absolute right-6 bottom-10 left-6 z-10 md:right-12 md:bottom-14 md:left-12 lg:right-16 lg:bottom-20 lg:left-16 xl:flex xl:items-end xl:justify-between xl:gap-16">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.95,
            ease: [0.22, 1, 0.36, 1],
            delay: 0.18,
          }}
          className="w-full max-w-[720px] md:w-[66%] xl:w-auto xl:max-w-[640px]"
        >
          <p className="mb-5 font-sans text-xs font-medium tracking-[0.24em] uppercase text-white [text-shadow:0_1px_18px_rgba(0,0,0,0.35)]">
            Nation&apos;s leading interventionists · Since 2003
          </p>

          <h1
            className="font-display leading-[1.05] text-white [text-shadow:0_1px_18px_rgba(0,0,0,0.35)]"
            style={{
              fontSize: 'clamp(2rem, 4.2vw, 3.75rem)',
            }}
          >
            When nothing else has worked,{' '}
            <em className="not-italic" style={{ color: '#A2C8B0' }}>
              an intervention changes everything.
            </em>
          </h1>

          <p className="mt-6 max-w-[540px] font-sans text-sm leading-relaxed text-white/85 [text-shadow:0_1px_18px_rgba(0,0,0,0.35)] md:text-lg">
            Compassionate, certified interventions for addiction, mental health,
            and eating disorders. Free consultation. Nationwide.
          </p>

          <div className="mt-8 flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
            <a
              href="/contact"
              onClick={(e) => {
                // Falls through to /contact if the HubSpot script hasn't loaded.
                const chat = window.HubSpotConversations?.widget;
                if (!chat) return;
                e.preventDefault();
                chat.open();
              }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-sage-500 px-7 py-4 font-sans text-base font-medium text-white shadow-[0_10px_30px_-10px_rgba(74,124,95,0.7)] transition-colors duration-300 hover:bg-sage-700 md:w-auto"
            >
              <MessageCircle size={16} strokeWidth={1.75} />
              Talk to a Specialist
            </a>
            <a
              href={phoneHref}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 py-4 font-sans text-base text-white backdrop-blur-sm transition-colors duration-300 hover:bg-white/20 md:w-auto"
            >
              <Phone size={14} strokeWidth={1.75} />
              {phoneDisplay}
            </a>
          </div>

          <ul className="mt-5 hidden flex-wrap items-center gap-x-5 gap-y-2 md:flex">
            {TRUST_POINTS.map((item) => (
              <li key={item} className="flex items-center gap-1.5 font-sans text-[13px] text-white/90">
                <Check size={12} strokeWidth={2.25} className="shrink-0 text-sage-400" />
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-9 flex items-center justify-center gap-8 md:justify-start md:gap-12 xl:hidden">
            {STATS.map((s) => (
              <div key={s.label}>
                <p
                  className="font-display text-2xl leading-none text-white"
                  style={{
                    fontFeatureSettings: '"tnum"',
                  }}
                >
                  {s.n}
                </p>
                <p className="mt-1.5 font-sans text-[11px] tracking-[0.18em] uppercase text-white/80">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.dl
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
          className="mb-32 hidden shrink-0 flex-col gap-5 border-l border-white/20 pl-8 xl:flex"
        >
          {STATS.map((s) => (
            <div key={s.label} className="flex flex-col-reverse gap-1.5">
              <dt className="font-sans text-[11px] tracking-[0.2em] uppercase text-white/80">
                {s.label}
              </dt>
              <dd
                className="font-display text-[2rem] leading-none text-white [text-shadow:0_1px_18px_rgba(0,0,0,0.35)]"
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
