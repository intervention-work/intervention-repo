'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import * as Accordion from '@radix-ui/react-accordion';
import { Plus } from 'lucide-react';
import { viewport } from '@/lib/motion';

type Faq = { q: string; a: string };
type Category = { id: string; label: string; items: Faq[] };

const CATEGORIES: Category[] = [
  {
    id: 'process',
    label: 'Process',
    items: [
      {
        q: 'What is a professional intervention?',
        a: 'A carefully planned, compassionate conversation guided by a certified interventionist. It is not confrontational — it is structured, loving, and evidence-based. Most meetings last about ninety minutes.',
      },
      {
        q: 'How quickly can you help?',
        a: 'We respond within one hour, 24 hours a day. For urgent situations, call directly and someone will answer immediately.',
      },
      {
        q: 'What if my loved one refuses to cooperate?',
        a: 'This is the most common concern families have. A professionally guided intervention dramatically increases the likelihood of acceptance — even when previous conversations have failed. Our specialists are trained specifically for resistance.',
      },
    ],
  },
  {
    id: 'cost',
    label: 'Cost & insurance',
    items: [
      {
        q: 'How much does an intervention cost?',
        a: 'Intervention is a fee-for-service offering starting at $500. We discuss cost openly on the first call, and the initial consultation is always free.',
      },
      {
        q: 'Is intervention covered by insurance?',
        a: 'Insurance does not cover intervention services. However, most insurance policies do cover the treatment of mental health and substance use — the care your loved one enters after the intervention — and we help you verify that coverage.',
      },
      {
        q: 'Is intervention funded by any public programs?',
        a: 'No. Intervention is not funded by city, state, or national organizations. It is a private, fee-for-service offering.',
      },
    ],
  },
  {
    id: 'after',
    label: 'After the meeting',
    items: [
      {
        q: 'What happens immediately after the intervention?',
        a: 'In most cases, treatment placement is in motion the same day. We coordinate transportation, admissions, and handoff to the treatment team.',
      },
      {
        q: 'Do you support the family during treatment?',
        a: 'Yes. Family coaching continues for as long as you need. We coordinate with the treatment team and meet quarterly with the family.',
      },
      {
        q: 'What if there is a relapse?',
        a: 'Relapse is part of many recoveries — not a failure. We have an established re-engagement protocol and we stay with you through it.',
      },
    ],
  },
];

export function Faq() {
  const [activeCat, setActiveCat] = useState(CATEGORIES[0].id);
  const current =
    CATEGORIES.find((c) => c.id === activeCat) ?? CATEGORIES[0];

  return (
    <section id="faq" className="bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-3xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <p className="font-sans text-[13px] tracking-[0.22em] uppercase text-sage-500">
            FAQ
          </p>
          <h2
            className="mt-4 font-display text-3xl leading-[1.1] text-ink md:text-4xl lg:text-[2.75rem]"
            style={{ fontVariationSettings: '"opsz" 72, "SOFT" 60, "WONK" 0' }}
          >
            Frequently asked questions.
          </h2>
        </motion.div>

        {/* Pill tabs — active pill slides between buttons via layoutId */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
          {CATEGORIES.map((c) => {
            const isActive = c.id === activeCat;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveCat(c.id)}
                aria-pressed={isActive}
                className="relative rounded-full px-4 py-2 font-sans text-sm"
              >
                {isActive && (
                  <motion.span
                    layoutId="faq-pill"
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
                  {c.label}
                </span>
              </button>
            );
          })}
        </div>

        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8"
        >
          <Accordion.Root
            type="single"
            collapsible
            defaultValue={`${current.id}-0`}
            className="border-t border-border"
          >
            {current.items.map((faq, i) => (
              <Accordion.Item
                key={faq.q}
                value={`${current.id}-${i}`}
                className="border-b border-border"
              >
                <Accordion.Header>
                  <Accordion.Trigger className="group flex w-full items-center justify-between gap-4 py-5 text-left font-sans text-lg text-ink transition-colors duration-200 hover:text-sage-500">
                    <span>{faq.q}</span>
                    <Plus
                      size={16}
                      strokeWidth={1.6}
                      className="shrink-0 text-ink-muted transition-transform duration-200 group-data-[state=open]:rotate-45 group-data-[state=open]:text-sage-500"
                    />
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="overflow-hidden font-sans text-base leading-relaxed text-ink-body data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                  <p className="pr-8 pb-5">{faq.a}</p>
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </motion.div>
      </div>
    </section>
  );
}
