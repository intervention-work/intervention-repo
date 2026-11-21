'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import * as Accordion from '@radix-ui/react-accordion';
import { Plus } from 'lucide-react';
import { viewport } from '@/lib/motion';
import { HOME_FAQ_CATEGORIES } from '@/lib/home-faq';

const CATEGORIES = HOME_FAQ_CATEGORIES;

export function Faq() {
  const [activeCat, setActiveCat] = useState(CATEGORIES[0].id);
  const current =
    CATEGORIES.find((c) => c.id === activeCat) ?? CATEGORIES[0];

  return (
    <section id="faq" className="bg-white py-10 lg:py-[50px]">
      <div className="mx-auto max-w-3xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <p className="font-sans text-sm tracking-[0.22em] uppercase text-sage-500">
            FAQ
          </p>
          <h2
            className="mt-4 font-display text-3xl leading-[1.1] text-ink md:text-4xl lg:text-[2.75rem]"
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
                  <Accordion.Trigger className="group flex w-full items-center justify-between gap-4 py-5 text-left font-sans text-xl text-ink transition-colors duration-200 hover:text-sage-500">
                    <span>{faq.q}</span>
                    <Plus
                      size={16}
                      strokeWidth={1.6}
                      className="shrink-0 text-ink-muted transition-transform duration-200 group-data-[state=open]:rotate-45 group-data-[state=open]:text-sage-500"
                    />
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="overflow-hidden font-sans text-lg leading-relaxed text-ink-body data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
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
