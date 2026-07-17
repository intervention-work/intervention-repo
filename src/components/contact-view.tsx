'use client';

import { Phone, Mail, Clock } from 'lucide-react';
import { PageHero } from '@/components/page-hero';
import { HubSpotContactForm } from '@/components/hubspot-form';
import { useSettings } from '@/lib/settings';

const IMAGE =
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=85';

export function ContactView() {
  const { phoneDisplay, phoneHref, email } = useSettings();

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
            >
              Send us a message.
            </h2>
            <p className="mt-4 font-sans text-lg text-ink-muted md:text-xl">
              Tell us a little about what’s happening. A specialist will reach
              out — usually within the hour.
            </p>

            <div className="relative mt-10">
              <HubSpotContactForm
                phoneDisplay={phoneDisplay}
                phoneHref={phoneHref}
              />
              <p className="mt-4 font-sans text-xs text-ink-muted">
                Your information is confidential and will only be used to
                reach you about your inquiry.
              </p>
            </div>
          </div>

          {/* Contact details */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-border bg-surface p-8">
              <p
                className="font-display text-xl text-ink md:text-2xl"
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
