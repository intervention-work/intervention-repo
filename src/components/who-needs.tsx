'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { viewport } from '@/lib/motion';

const CATEGORIES = [
  {
    label: 'Parent',
    desc: 'A parent struggling with addiction, mental health, or behavioral crisis.',
  },
  {
    label: 'Teen / Adolescent',
    desc: 'A young person whose family needs structured, compassionate support.',
  },
  {
    label: 'Sibling',
    desc: 'A brother or sister whose behavior is affecting the whole family.',
  },
  {
    label: 'Employee',
    desc: 'A colleague whose performance and safety is at risk.',
  },
  {
    label: 'Friend',
    desc: 'Someone close to you who has stopped accepting help on their own.',
  },
  {
    label: 'Spouse / Partner',
    desc: 'A relationship under strain from addiction or mental health challenges.',
  },
];

export function WhoNeeds() {
  return (
    <section className="bg-white py-10 lg:py-[50px]">
      <div className="mx-auto max-w-[1200px] px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="font-sans text-sm tracking-[0.22em] uppercase text-sage-500">
            Who Needs an Intervention?
          </p>
          <h2 className="mt-4 font-display text-3xl leading-[1.1] text-ink md:text-4xl lg:text-[2.75rem]">
            Intervention is for anyone whose life is in crisis.
          </h2>
          <p className="mt-4 font-sans text-lg text-ink-muted">
            We work with families across every relationship, not just parents of adult children.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
          className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.label}
              href="/contact"
              className="group flex flex-col justify-between rounded-2xl border border-border bg-white p-6 transition-shadow duration-200 hover:shadow-[0_8px_24px_-12px_rgba(17,24,39,0.15)]"
            >
              <div>
                <h3 className="font-display text-lg text-ink">{cat.label}</h3>
                <p className="mt-2 font-sans text-sm leading-relaxed text-ink-muted">{cat.desc}</p>
              </div>
              <div className="mt-5 flex items-center gap-1.5 font-sans text-sm font-medium text-sage-700 transition-colors duration-200 group-hover:text-sage-900">
                Get help
                <ArrowRight size={14} strokeWidth={1.75} />
              </div>
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
