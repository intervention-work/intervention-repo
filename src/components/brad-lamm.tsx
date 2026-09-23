'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { viewport } from '@/lib/motion';

const BADGES = [
  'PACERT Certified Since 2014',
  'AIS Board Member 2016–2025',
  '1,000+ Interventions',
];

export function BradLamm() {
  return (
    <section className="bg-surface py-10 lg:py-[50px]">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewport}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="font-sans text-sm tracking-[0.22em] uppercase text-sage-500">
              Our Founder
            </p>
            <h2 className="mt-4 font-display text-3xl leading-[1.1] text-ink md:text-4xl lg:text-[2.75rem]">
              Brad Lamm, CIP
            </h2>
            <p className="mt-2 font-sans text-base text-ink-muted">
              Certified Intervention Professional · Founder, Change Institute
            </p>

            <p className="mt-6 font-sans text-lg leading-relaxed text-ink-body">
              Brad Lamm is an author, teacher, and widely recognized interventionist known for
              helping people make transformational change, including appearances with Oprah Winfrey,
              Good Morning America, and The Today Show. He has trained thousands of clinicians
              worldwide in the evidence-based invitational intervention model, focused on engaging
              reluctant individuals to accept help.
            </p>
            <p className="mt-4 font-sans text-lg leading-relaxed text-ink-body">
              Founder of Breathe Life Healing Center in 2013, he has supported over 4,000 patients
              and expanded access through significant scholarship care. With more than 1,400
              successful interventions, Brad is also a serial entrepreneur, podcast host, and author
              of multiple books on recovery, behavior change, and family systems.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {BADGES.map((badge) => (
                <span
                  key={badge}
                  className="inline-block rounded-full border border-border bg-white px-3 py-1 font-sans text-xs text-ink-muted"
                >
                  {badge}
                </span>
              ))}
            </div>

            <Link
              href="/contact"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-sage-700 px-7 py-3.5 font-sans text-sm font-medium text-white transition-colors duration-300 hover:bg-sage-900"
            >
              Talk to Brad's team
              <ArrowRight size={15} strokeWidth={1.75} />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewport}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="flex items-center justify-center"
          >
            <div className="relative aspect-[3/4] w-full max-w-sm overflow-hidden rounded-2xl">
              <Image
                src="/images/brad-lamm.jpg"
                alt="Brad Lamm, Founder and Lead Interventionist"
                fill
                className="object-cover object-top"
                sizes="(max-width: 1024px) 100vw, 480px"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
