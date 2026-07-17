'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Shield } from 'lucide-react';
import { useSettings } from '@/lib/settings';

type Col = { title: string; links: { label: string; href: string }[] };

const COLUMNS: Col[] = [
  {
    title: 'Interventions',
    links: [
      { label: 'Alcohol', href: '/intervention/alcohol-intervention' },
      { label: 'Drug', href: '/intervention/drug-intervention' },
      { label: 'Eating Disorder', href: '/intervention/eating-disorder-intervention' },
      { label: 'Mental Health', href: '/intervention/mental-health-crisis' },
      { label: 'Complex Trauma', href: '/intervention/complex-trauma' },
      { label: 'Early Autism', href: '/intervention/early-autism' },
    ],
  },
  {
    title: 'Services',
    links: [
      { label: 'Find an Interventionist', href: '/services' },
      { label: 'Senior Support Services', href: '/services/senior-support-services' },
      { label: 'CARE Unit Assessment', href: '/services/care-unit-assessment' },
      { label: 'Recovery Care Management', href: '/services/recovery-care-management' },
      { label: 'BreakFree Journey', href: '/services/breakfree-journey' },
      { label: 'Family Class', href: '/family-class' },
    ],
  },
];

const LEGAL = [
  { label: 'Privacy', href: '#' },
  { label: 'HIPAA notice', href: '#' },
  { label: 'Terms', href: '#' },
];

export function Footer() {
  const { phoneDisplay, phoneHref, email } = useSettings();
  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto max-w-[1200px] px-6 py-16">
        <div className="grid grid-cols-1 gap-10 border-b border-border pb-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <Image
              src="/brand/intervention.png"
              alt="intervention.com — a Change Institute service"
              width={261}
              height={44}
              unoptimized
              className="h-11 w-auto"
            />
            <p className="mt-5 max-w-xs font-sans text-sm leading-relaxed text-ink-muted">
              Where families find the leading intervention and support to help
              someone they love. Nation’s best — we can help.
            </p>
            <a
              href="https://changeinstitute.com"
              className="mt-6 inline-flex items-center gap-2"
              aria-label="Change Institute — guiding families since 2003"
            >
              <Image
                src="/brand/ci-lockup.svg"
                alt="Change Institute"
                width={150}
                height={33}
                unoptimized
                className="h-7 w-auto opacity-85 transition-opacity hover:opacity-100"
              />
            </a>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="font-sans text-[11px] tracking-[0.2em] uppercase text-ink-muted">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="font-sans text-sm text-ink-body transition-colors duration-200 hover:text-sage-700"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Reach us */}
          <div>
            <h4 className="font-sans text-[11px] tracking-[0.2em] uppercase text-ink-muted">
              Reach us
            </h4>
            <ul className="mt-4 space-y-2.5">
              <li>
                <a
                  href={phoneHref}
                  className="font-sans text-sm text-ink-body transition-colors duration-200 hover:text-sage-700"
                >
                  {phoneDisplay}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${email}`}
                  className="font-sans text-sm text-ink-body transition-colors duration-200 hover:text-sage-700"
                >
                  {email}
                </a>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="font-sans text-sm text-ink-body transition-colors duration-200 hover:text-sage-700"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/insurance"
                  className="font-sans text-sm text-ink-body transition-colors duration-200 hover:text-sage-700"
                >
                  Verify Insurance
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <p className="mt-6 font-sans text-xs text-ink-muted/80">
          Intervention.com is not affiliated with the INTERVENTION television
          show.
        </p>

        {/* Bottom row */}
        <div className="mt-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <p className="font-sans text-xs text-ink-muted">
            © {new Date().getFullYear()} Intervention.com · Change Institute,
            2494 NW 66th Dr, Boca Raton, FL 33496
          </p>

          <div className="flex items-center gap-5">
            <ul className="flex items-center gap-5">
              {LEGAL.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="font-sans text-xs text-ink-muted transition-colors duration-200 hover:text-ink-body"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
            <p className="hidden items-center gap-1.5 font-sans text-xs text-ink-muted sm:flex">
              <Shield size={11} strokeWidth={1.6} className="text-sage-500" />
              HIPAA-aligned
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
