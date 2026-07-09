'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { viewport } from '@/lib/motion';

type Step = {
  id: string;
  num: string;
  tab: string;
  title: string;
  desc: string;
  detail: string;
};

const STEPS: Step[] = [
  {
    id: 'call',
    num: '01',
    tab: 'Call us',
    title: 'A free, confidential conversation.',
    desc: 'We answer in under an hour, 24 hours a day. There is no script. We listen first.',
    detail:
      'Most families call us mid-crisis. The first call is not a sales pitch — it is a structured intake that captures what is happening, who is involved, and the immediate risks. By the time we hang up, you have a senior interventionist assigned and a tentative plan.',
  },
  {
    id: 'plan',
    num: '02',
    tab: 'We build the plan',
    title: 'A tailored approach for your family.',
    desc: 'Your interventionist designs the meeting around the people in the room — not a template.',
    detail:
      'No two interventions look alike. We map the family system, identify the right model (Johnson, ARISE, SMART, or a hybrid), choose participants, write the letters, and prepare every contingency — including the most common pushback patterns.',
  },
  {
    id: 'meeting',
    num: '03',
    tab: 'The meeting',
    title: 'A structured, loving conversation.',
    desc: 'We are in the room. We open the door to help. Every moment is guided.',
    detail:
      'The meeting itself usually lasts ninety minutes. Your interventionist runs it. We carry the weight so the family can hold the love. By the end, a treatment placement is in motion — often the same day.',
  },
  {
    id: 'aftercare',
    num: '04',
    tab: 'Aftercare',
    title: 'Ongoing support for the long road.',
    desc: 'Recovery is a family project. We stay with you through the first year and beyond.',
    detail:
      'Family coaching continues for as long as you need it. We coordinate with treatment teams, help navigate setbacks, and meet quarterly to check in. Most families stay in contact for years.',
  },
];

export function HowItWorks() {
  const [active, setActive] = useState(STEPS[0].id);

  return (
    <section id="how-it-works" className="bg-surface py-24 lg:py-32">
      <div className="mx-auto max-w-[1200px] px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="font-sans text-[13px] tracking-[0.22em] uppercase text-sage-500">
            How it works
          </p>
          <h2
            className="mt-4 font-display text-3xl leading-[1.1] text-ink md:text-4xl lg:text-[2.75rem]"
            style={{ fontVariationSettings: '"opsz" 72, "SOFT" 60, "WONK" 0' }}
          >
            A clear path forward.
          </h2>
          <p className="mt-4 font-sans text-base text-ink-muted md:text-lg">
            Four steps, one continuous relationship.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
          className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr] lg:gap-10"
        >
          {/* Tab list — active highlight slides between rows via layoutId */}
          <ul
            role="tablist"
            aria-orientation="vertical"
            className="flex flex-row gap-2 overflow-x-auto lg:flex-col lg:overflow-visible"
          >
            {STEPS.map((step) => {
              const isActive = step.id === active;
              return (
                <li key={step.id} className="shrink-0 lg:shrink">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActive(step.id)}
                    className="group relative flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left"
                  >
                    {isActive && (
                      <motion.span
                        layoutId="process-pill"
                        aria-hidden
                        className="absolute inset-0 rounded-2xl bg-white shadow-[0_2px_8px_-6px_rgba(17,24,39,0.18)]"
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
                        'relative z-10 font-display text-base tabular-nums transition-colors duration-200 ' +
                        (isActive ? 'text-sage-500' : 'text-ink-muted')
                      }
                      style={{
                        fontVariationSettings:
                          '"opsz" 48, "SOFT" 30, "WONK" 0',
                      }}
                    >
                      {step.num}
                    </span>
                    <span
                      className={
                        'relative z-10 font-sans text-sm transition-colors duration-200 ' +
                        (isActive ? 'text-ink' : 'text-ink-body')
                      }
                    >
                      {step.tab}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {/*
           * Content — all panels live in a single grid cell so they overlap
           * cleanly. Only opacity + a tiny y offset animate. Grid sizes the
           * cell to the tallest panel so the container never jumps height.
           */}
          <div className="rounded-3xl bg-white p-8 md:p-10 lg:p-12">
            <div className="grid">
              {STEPS.map((step) => {
                const isActive = step.id === active;
                return (
                  <motion.div
                    key={step.id}
                    initial={false}
                    animate={{
                      opacity: isActive ? 1 : 0,
                      y: isActive ? 0 : 6,
                    }}
                    transition={{
                      duration: 0.5,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    aria-hidden={!isActive}
                    className={
                      'col-start-1 row-start-1 will-change-[opacity,transform] ' +
                      (isActive ? '' : 'pointer-events-none')
                    }
                  >
                    <span
                      className="font-display text-5xl leading-none text-border"
                      style={{
                        fontVariationSettings:
                          '"opsz" 96, "SOFT" 20, "WONK" 0',
                        fontFeatureSettings: '"tnum"',
                      }}
                    >
                      {step.num}
                    </span>
                    <h3
                      className="mt-6 font-display text-xl leading-snug text-ink md:text-2xl"
                      style={{
                        fontVariationSettings:
                          '"opsz" 48, "SOFT" 60, "WONK" 0',
                      }}
                    >
                      {step.title}
                    </h3>
                    <p className="mt-3 max-w-xl font-sans text-base leading-relaxed text-ink-body">
                      {step.desc}
                    </p>
                    <p className="mt-4 max-w-xl font-sans text-sm leading-relaxed text-ink-muted">
                      {step.detail}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
