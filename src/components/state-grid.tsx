'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowRight, MapPin } from 'lucide-react';
import { viewport } from '@/lib/motion';

const STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
  'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
  'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
  'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
  'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
  'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
  'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
  'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
  'Washington DC', 'West Virginia', 'Wisconsin', 'Wyoming',
];

export function StateGrid() {
  return (
    <section className="bg-surface py-10 lg:py-[50px]">
      <div className="mx-auto max-w-[1200px] px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="font-sans text-sm tracking-[0.22em] uppercase text-sage-500">
            Nationwide coverage
          </p>
          <h2 className="mt-4 font-display text-3xl leading-[1.1] text-ink md:text-4xl lg:text-[2.75rem]">
            Find an Interventionist Near You
          </h2>
          <p className="mt-4 font-sans text-lg text-ink-muted md:text-xl">
            We serve families across all 50 states.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
          className="mt-12 flex flex-wrap justify-center gap-2"
        >
          {STATES.map((state) => (
            <Link
              key={state}
              href="/interventionists-by-state"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-4 py-2 font-sans text-sm text-ink-body transition-colors duration-200 hover:border-sage-400 hover:bg-sage-50 hover:text-sage-700"
            >
              <MapPin size={11} strokeWidth={1.75} className="text-sage-400" />
              {state}
            </Link>
          ))}
        </motion.div>

        <div className="mt-10 text-center">
          <Link
            href="/interventionists-by-state"
            className="inline-flex items-center gap-2 rounded-full bg-ink px-8 py-4 font-sans text-sm font-medium text-white transition-colors duration-300 hover:bg-ink-body"
          >
            View All Interventionists By State
            <ArrowRight size={15} strokeWidth={1.75} />
          </Link>
        </div>
      </div>
    </section>
  );
}
