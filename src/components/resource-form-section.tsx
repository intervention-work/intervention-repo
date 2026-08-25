'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowRight, Phone, Shield, Check } from 'lucide-react';
import { viewport } from '@/lib/motion';
import { HubSpotEmbed } from '@/components/hubspot-embed';
import { useSettings } from '@/lib/settings';

const CARD_BULLETS = [
  'We respond within the hour',
  'Free & fully confidential',
  'Certified specialists',
];

export function ResourceFormSection({
  eyebrow,
  heading,
  subheading,
  portalId,
  formId,
}: {
  eyebrow?: string;
  heading: string;
  subheading?: string;
  portalId: string;
  formId: string;
}) {
  const { phoneDisplay, phoneHref } = useSettings();

  return (
    <section className="border-t border-border bg-surface py-24 lg:py-32">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-14 px-6 lg:grid-cols-[1fr_360px] lg:gap-16">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {eyebrow && (
            <p className="font-sans text-sm tracking-[0.22em] uppercase text-sage-500">
              {eyebrow}
            </p>
          )}
          <h2
            className="mt-4 font-display text-3xl leading-tight text-ink md:text-4xl"
          >
            {heading}
          </h2>
          {subheading && (
            <p className="mt-5 font-sans text-lg leading-relaxed text-ink-muted">
              {subheading}
            </p>
          )}
          <div className="mt-10">
            <HubSpotEmbed portalId={portalId} formId={formId} />
          </div>
        </motion.div>

        <motion.aside
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
          className="lg:sticky lg:top-24 lg:self-start"
        >
          <div className="rounded-3xl border border-border bg-white p-7 md:p-8">
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 font-sans text-[11px] text-ink-muted">
              <Shield size={10} strokeWidth={1.75} className="text-sage-500" />
              Free · Confidential · No obligation
            </div>
            <p className="font-display text-xl leading-snug text-ink md:text-2xl">
              Prefer to talk to someone?
            </p>
            <p className="mt-3 font-sans text-sm leading-relaxed text-ink-muted">
              A certified specialist is available 24/7. No pressure, no script.
            </p>

            <ul className="mt-5 space-y-2.5">
              {CARD_BULLETS.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 font-sans text-sm text-ink-body"
                >
                  <Check
                    size={13}
                    strokeWidth={2.25}
                    className="shrink-0 text-sage-500"
                  />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-col gap-2.5">
              <Link
                href="/contact"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-sage-700 px-5 py-3.5 font-sans text-sm font-medium text-white transition-colors duration-300 hover:bg-sage-900"
              >
                Talk to a specialist
                <ArrowRight size={14} strokeWidth={1.75} />
              </Link>
              <a
                href={phoneHref}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-white px-5 py-3.5 font-sans text-sm text-ink transition-colors duration-200 hover:bg-surface"
              >
                <Phone size={13} strokeWidth={1.75} className="text-sage-500" />
                {phoneDisplay}
              </a>
            </div>

            <p className="mt-5 font-sans text-[12px] tracking-wide text-ink-muted">
              Available 24/7 · Fully confidential
            </p>
          </div>
        </motion.aside>
      </div>
    </section>
  );
}
