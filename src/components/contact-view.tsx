'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Phone, Mail, Clock, Check } from 'lucide-react';
import { PageHero } from '@/components/page-hero';
import { useSettings } from '@/lib/settings';

const IMAGE =
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=85';

export function ContactView() {
  const { phoneDisplay, phoneHref, email } = useSettings();
  const [sent, setSent] = useState(false);

  return (
    <main>
      <PageHero
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Contact' }]}
        eyebrow="We’re here 24/7"
        title="Reach a certified specialist now."
        summary="Free, confidential, and available around the clock, nationwide. A specialist answers in under an hour."
        image={IMAGE}
      />

      <section className="bg-white py-24 lg:py-32">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-14 px-6 lg:grid-cols-[1fr_380px] lg:gap-16">
          {/* Form */}
          <div>
            <h2
              className="font-display text-3xl leading-tight text-ink md:text-4xl"
              style={{ fontVariationSettings: '"opsz" 72, "SOFT" 60, "WONK" 0' }}
            >
              Send us a message.
            </h2>
            <p className="mt-4 font-sans text-base text-ink-muted md:text-lg">
              Tell us a little about what’s happening. A specialist will reach
              out — usually within the hour.
            </p>

            {sent ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="mt-10 flex items-start gap-4 rounded-3xl border border-sage-200 bg-sage-50 p-8"
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sage-500 text-white">
                  <Check size={18} strokeWidth={2.25} />
                </span>
                <div>
                  <p
                    className="font-display text-xl text-ink"
                    style={{
                      fontVariationSettings: '"opsz" 32, "SOFT" 60, "WONK" 0',
                    }}
                  >
                    Thank you — your message is on its way.
                  </p>
                  <p className="mt-2 font-sans text-sm leading-relaxed text-ink-body">
                    A specialist will be in touch shortly. If this is urgent,
                    please call{' '}
                    <a
                      href={phoneHref}
                      className="font-medium text-sage-700 underline underline-offset-2"
                    >
                      {phoneDisplay}
                    </a>{' '}
                    any time.
                  </p>
                </div>
              </motion.div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSent(true);
                }}
                className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2"
              >
                <Field label="Your name" htmlFor="name">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    autoComplete="name"
                    className={inputClass}
                  />
                </Field>
                <Field label="Phone" htmlFor="phone">
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    inputMode="tel"
                    autoComplete="tel"
                    className={inputClass}
                  />
                </Field>
                <Field label="Email" htmlFor="email" full>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    className={inputClass}
                  />
                </Field>
                <Field label="How can we help?" htmlFor="message" full>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    className={`${inputClass} resize-none`}
                  />
                </Field>
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-full bg-sage-700 px-8 py-4 font-sans text-base font-medium text-white transition-colors duration-300 hover:bg-sage-900"
                  >
                    Send message
                  </button>
                  <p className="mt-4 font-sans text-xs text-ink-muted">
                    Your information is confidential and will only be used to
                    reach you about your inquiry.
                  </p>
                </div>
              </form>
            )}
          </div>

          {/* Contact details */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-border bg-surface p-8">
              <p
                className="font-display text-xl text-ink md:text-2xl"
                style={{ fontVariationSettings: '"opsz" 32, "SOFT" 60, "WONK" 0' }}
              >
                Prefer to talk now?
              </p>
              <p className="mt-3 font-sans text-sm leading-relaxed text-ink-muted">
                Calling is often the fastest way to reach us. We’re here any
                hour of the day or night.
              </p>

              <ul className="mt-6 space-y-5">
                <ContactRow icon={<Phone size={16} strokeWidth={1.75} />} label="Call">
                  <a
                    href={phoneHref}
                    className="font-sans text-base font-medium text-ink transition-colors hover:text-sage-700"
                  >
                    {phoneDisplay}
                  </a>
                </ContactRow>
                <ContactRow icon={<Mail size={16} strokeWidth={1.75} />} label="Email">
                  <a
                    href={`mailto:${email}`}
                    className="font-sans text-base font-medium text-ink transition-colors hover:text-sage-700"
                  >
                    {email}
                  </a>
                </ContactRow>
                <ContactRow icon={<Clock size={16} strokeWidth={1.75} />} label="Hours">
                  <span className="font-sans text-base text-ink">
                    24 hours · 7 days a week
                  </span>
                </ContactRow>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

const inputClass =
  'w-full rounded-xl border border-border bg-white px-4 py-3 font-sans text-sm text-ink outline-none transition-colors placeholder:text-ink-muted/60 focus:border-sage-400';

function Field({
  label,
  htmlFor,
  full,
  children,
}: {
  label: string;
  htmlFor: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className={full ? 'sm:col-span-2' : undefined}>
      <span className="mb-2 block font-sans text-[13px] font-medium text-ink-body">
        {label}
      </span>
      {children}
    </label>
  );
}

function ContactRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-sage-500 shadow-[0_1px_3px_rgba(17,24,39,0.06)]">
        {icon}
      </span>
      <span className="flex flex-col">
        <span className="font-sans text-[11px] tracking-[0.18em] uppercase text-ink-muted">
          {label}
        </span>
        {children}
      </span>
    </li>
  );
}
