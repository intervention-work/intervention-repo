'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Shield } from 'lucide-react';
import { useSettings } from '@/lib/settings';

function FacebookIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M4 4l16 16M4 20 20 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M2 3h6.5L20 21h-6.5L2 3z" />
      <path d="M15 3l-4.5 5.5M9 21l4.5-5.5" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

const CERTIFICATIONS = [
  {
    src: '/brand/fair-care-promise.png',
    alt: 'Fair Care Promise — Delivering Care Since 1997',
    caption: 'Delivering Care Since 1997',
    href: 'https://www.naatp.org',
    width: 120,
    height: 120,
  },
  {
    src: '/brand/ais-logo.png',
    alt: 'Association of Intervention Specialists — Member / Board Member 2016–2025',
    caption: 'Member / Board Member 2016–2025',
    href: 'https://www.associationofinterventionspecialists.org',
    width: 160,
    height: 80,
  },
  {
    src: '/brand/cip-badge.png',
    alt: 'CIP — Certified Intervention Professional, Certified Since 2014',
    caption: 'Certified Since 2014',
    href: 'https://www.pacertboard.org',
    width: 120,
    height: 120,
  },
];

const SOCIALS = [
  { label: 'Facebook', href: 'https://www.facebook.com/BradLammInterventionist/', Icon: FacebookIcon },
  { label: 'X (Twitter)', href: 'https://twitter.com/interventionUS', Icon: TwitterIcon },
  { label: 'Instagram', href: 'https://www.instagram.com/interventionhelp', Icon: InstagramIcon },
];

type Col = { title: string; links: { label: string; href: string }[] };

const COLUMNS: Col[] = [
  {
    title: 'Interventions',
    links: [
      { label: 'Drug & Alcohol', href: '/intervention/drug-alcohol-intervention' },
      { label: 'Eating Disorder', href: '/intervention/eating-disorder' },
      { label: 'Mental Health', href: '/intervention/mental-health-crisis' },
      { label: 'Complex Trauma', href: '/intervention/complex-trauma' },
      { label: 'Early Autism', href: '/intervention/early-autism' },
      { label: 'By State', href: '/interventionists-by-state' },
    ],
  },
  {
    title: 'Additional Services',
    links: [
      { label: 'Concierge Assessment (CARE)', href: '/services/care-unit-assessment' },
      { label: 'Breakfree Journey', href: '/services/breakfree-journey' },
      { label: 'Recovery Coach Companion', href: '/services/recovery-coach-companion' },
      { label: 'Recovery Case Management', href: '/services/recovery-care-management' },
      { label: 'Senior Support Services', href: '/services/senior-support-services' },
      { label: 'Find an Interventionist', href: '/interventionists-by-state' },
    ],
  },
];

const LEGAL = [
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms and Conditions', href: '/terms-and-conditions' },
];

export function Footer() {
  const { phoneDisplay, phoneHref, email } = useSettings();
  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto max-w-[1200px] px-6 py-16">

        {/* Certification badges row */}
        <div className="mb-10 grid grid-cols-3 gap-6 border-b border-border pb-10">
          {CERTIFICATIONS.map((cert) => (
            <a
              key={cert.alt}
              href={cert.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 text-center transition-opacity hover:opacity-75"
            >
              <Image
                src={cert.src}
                alt={cert.alt}
                width={cert.width}
                height={cert.height}
                unoptimized
                className="h-20 w-auto object-contain"
              />
              <span className="font-sans text-xs text-ink-muted">{cert.caption}</span>
            </a>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-10 border-b border-border pb-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            {/* ?v= — public/ assets aren't content-hashed; bump it when the logo
                art changes so caches can't keep serving the previous one. */}
            <Image
              src="/brand/intervention.svg?v=2"
              alt="intervention.com — a Change Institute service"
              width={172}
              height={36}
              unoptimized
              className="h-9 w-auto"
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

            {/* Trust badges */}
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <a
                href="https://legitscript.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LegitScript Certified"
                className="transition-opacity hover:opacity-75"
              >
                <Image
                  src="/brand/legitscript.png"
                  alt="LegitScript Certified"
                  width={80}
                  height={80}
                  unoptimized
                  className="h-14 w-auto object-contain"
                />
              </a>
              <a
                href="https://www.securitymetrics.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="SecurityMetrics Credit Card Safe"
                className="transition-opacity hover:opacity-75"
              >
                <Image
                  src="/brand/security-metrics.png"
                  alt="SecurityMetrics Credit Card Safe"
                  width={80}
                  height={80}
                  unoptimized
                  className="h-14 w-auto object-contain"
                />
              </a>
            </div>
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

            {/* Social icons */}
            <div className="mt-6 flex items-center gap-2">
              {SOCIALS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-ink-muted transition-colors duration-200 hover:border-ink-muted hover:text-ink"
                >
                  <Icon />
                </a>
              ))}
            </div>
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
