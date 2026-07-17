'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowRight, Phone } from 'lucide-react';
import { viewport } from '@/lib/motion';

export function CtaBanner() {
  return (
    <section
      aria-label="Talk to a specialist"
      className="bg-white py-28 lg:py-36"
    >
      <div className="mx-auto max-w-3xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="font-sans text-sm tracking-[0.22em] uppercase text-sage-500">
            Free consultation
          </p>
          <h2
            className="mt-4 font-display text-4xl leading-[1.05] text-ink md:text-5xl lg:text-[3.5rem]"
          >
            The hardest part is
            <br />
            picking up the phone.
          </h2>
          <p className="mt-5 font-sans text-lg text-ink-muted md:text-xl">
            We make everything else possible. No pressure, no obligation.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-sage-700 px-8 py-4 font-sans text-base font-medium text-white shadow-[0_12px_32px_-12px_rgba(45,90,61,0.65)] transition-colors duration-300 hover:bg-sage-900"
            >
              Talk to a specialist
              <ArrowRight size={16} strokeWidth={1.75} />
            </Link>
            <a
              href="tel:+18007891605"
              className="inline-flex items-center gap-2 rounded-full border border-border px-7 py-4 font-sans text-base text-ink transition-colors duration-200 hover:bg-surface"
            >
              <Phone size={15} strokeWidth={1.75} className="text-sage-500" />
              (800) 789-1605
            </a>
          </div>

          <p className="mt-6 font-sans text-[13px] tracking-wide text-ink-muted">
            Available 24/7 · Fully confidential
          </p>
        </motion.div>
      </div>
    </section>
  );
}
