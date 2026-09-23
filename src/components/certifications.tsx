'use client';

import { motion } from 'motion/react';
import { viewport } from '@/lib/motion';

const CERTS = [
  {
    name: 'PACERT',
    desc: 'Certified Professional Interventionist · Member since 2014',
  },
  {
    name: 'AIS',
    desc: 'Association of Intervention Specialists · Board Member 2016–2025',
  },
  {
    name: 'LegitScript',
    desc: 'LegitScript Verified · Highest certification for addiction treatment',
  },
  {
    name: 'CIP',
    desc: 'Certified Intervention Professional · Brad Lamm, lead interventionist',
  },
];

const SOCIALS = [
  { label: 'Facebook', href: 'https://www.facebook.com/BradLammInterventionist' },
  { label: 'X / Twitter', href: 'https://twitter.com/interventionUS' },
  { label: 'Instagram', href: 'https://www.instagram.com/interventionhelp' },
];

export function Certifications() {
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
            Credentials
          </p>
          <h2 className="mt-4 font-display text-3xl leading-[1.1] text-ink md:text-4xl lg:text-[2.75rem]">
            Certified by the field's top bodies.
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
          className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          {CERTS.map((cert) => (
            <div
              key={cert.name}
              className="rounded-2xl border border-border bg-white p-6"
            >
              <p className="font-display text-2xl text-ink">{cert.name}</p>
              <p className="mt-2 font-sans text-sm leading-relaxed text-ink-muted">{cert.desc}</p>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="mt-12 text-center"
        >
          <p className="font-sans text-sm tracking-[0.22em] uppercase text-ink-muted">
            Follow us
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-full border border-border px-5 py-2 font-sans text-sm text-ink-body transition-colors duration-200 hover:border-sage-400 hover:text-sage-700"
              >
                {s.label}
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
