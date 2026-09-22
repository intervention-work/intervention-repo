'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { viewport } from '@/lib/motion';

type Specialty = {
  id: string;
  tab: string;
  eyebrow: string;
  title: string;
  desc: string;
  image: string;
  alt: string;
};

const SPECIALTIES: Specialty[] = [
  {
    id: 'substance',
    tab: 'Addiction & Recovery',
    eyebrow: 'Addiction & Recovery',
    title: 'For when nothing else has worked.',
    desc: 'Love alone doesn\'t always create change. We replace high-stakes ambushes with a transparent approach. By reducing defensiveness, we help families move from active crisis into sustainable recovery.',
    image:
      'https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?w=1600&q=85',
    alt: 'Soft morning light across a mountain valley',
  },
  {
    id: 'mental-health',
    tab: 'Behavioral Health',
    eyebrow: 'Behavioral Health',
    title: 'Breaking learned patterns for lasting outcomes.',
    desc: 'Ingrained coping strategies can reinforce harmful cycles. We interrupt these destructive patterns by creating safe environments to shift behaviors, establish boundaries, and drive sustained improvements.',
    image:
      'https://images.unsplash.com/photo-1500964757637-c85e8a162699?w=1600&q=85',
    alt: 'Still water reflecting an open sky',
  },
  {
    id: 'eating-disorders',
    tab: 'Eating Disorder Care',
    eyebrow: 'Eating Disorder Care',
    title: 'Rebuilding healthy routines for lasting recovery.',
    desc: 'These conditions demand collaborative diagnosis of complex symptom sets. We guide individuals in breaking compulsive cycles and rebuilding a healthy relationship with food to provide a roadmap for healing.',
    image:
      'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=1600&q=85',
    alt: 'Light streaming through a quiet forest',
  },
  {
    id: 'youth',
    tab: 'Young Adult Support',
    eyebrow: 'Young Adult Support',
    title: 'Empowering young adults to realize their potential.',
    desc: 'Whether navigating a crisis or needing support to unlock their potential, young adults need respect. We foster motivation, helping them build communication tools and trust for enduring growth.',
    image:
      'https://images.unsplash.com/photo-1490604001847-b712b0c2f967?w=1600&q=85',
    alt: 'Sunlit hillside at the close of the day',
  },
];

export function Specialties() {
  const [active, setActive] = useState(SPECIALTIES[0].id);

  return (
    <section id="specialties" className="bg-white py-10 lg:py-[50px]">
      <div className="mx-auto max-w-[1200px] px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="font-sans text-sm tracking-[0.22em] uppercase text-sage-500">
            What we do
          </p>
          <h2
            className="mt-4 font-display text-3xl leading-[1.1] text-ink md:text-4xl lg:text-[2.75rem]"
          >
            Built for every family.
          </h2>
          <p className="mt-4 font-sans text-lg text-ink-muted md:text-xl">
            One method. Four areas of deep specialty.
          </p>
        </motion.div>

        {/* Showcase — all images stacked, crossfaded by opacity. */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
          className="relative mt-12 overflow-hidden rounded-3xl bg-surface"
        >
          <div className="relative aspect-[16/10] w-full md:aspect-[16/8]">
            {SPECIALTIES.map((s, i) => {
              const isActive = s.id === active;
              return (
                <motion.div
                  key={s.id}
                  initial={false}
                  animate={{ opacity: isActive ? 1 : 0 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0"
                >
                  <Image
                    src={s.image}
                    alt={s.alt}
                    fill
                    sizes="(max-width: 1280px) 100vw, 1200px"
                    className="object-cover"
                    priority={i === 0}
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        'linear-gradient(to top, rgba(12,17,28,0.95) 0%, rgba(12,17,28,0.72) 45%, rgba(12,17,28,0.25) 80%, transparent 100%)',
                    }}
                  />
                </motion.div>
              );
            })}

            {/* Caption layer — all captions in one grid cell, opacity-faded. */}
            <div className="pointer-events-none absolute inset-0 flex items-end p-6 md:p-10 lg:p-12">
              <div className="grid w-full max-w-md">
                {SPECIALTIES.map((s) => {
                  const isActive = s.id === active;
                  return (
                    <motion.div
                      key={s.id + '-text'}
                      initial={false}
                      animate={{
                        opacity: isActive ? 1 : 0,
                        y: isActive ? 0 : 6,
                      }}
                      transition={{
                        duration: 0.55,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      aria-hidden={!isActive}
                      className="col-start-1 row-start-1 will-change-[opacity,transform]"
                    >
                      <p className="font-sans text-[10px] tracking-[0.22em] uppercase text-white/90">
                        {s.eyebrow}
                      </p>
                      <h3
                        className="mt-2 font-display text-xl leading-tight text-white md:text-2xl"
                      >
                        {s.title}
                      </h3>
                      <p className="mt-3 font-sans text-base leading-relaxed text-white/90">
                        {s.desc}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs — below showcase. Active pill slides between buttons via layoutId. */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {SPECIALTIES.map((s) => {
            const isActive = s.id === active;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActive(s.id)}
                aria-pressed={isActive}
                className="relative rounded-full px-4 py-2 font-sans text-sm transition-colors duration-200"
              >
                {isActive && (
                  <motion.span
                    layoutId="specialties-pill"
                    aria-hidden
                    className="absolute inset-0 rounded-full bg-ink"
                    transition={{
                      type: 'spring',
                      stiffness: 420,
                      damping: 34,
                      mass: 0.7,
                    }}
                  />
                )}
                <span
                  className={
                    'relative z-10 transition-colors duration-200 ' +
                    (isActive ? 'text-white' : 'text-ink-body hover:text-ink')
                  }
                >
                  {s.tab}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
