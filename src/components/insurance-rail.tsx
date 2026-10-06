'use client';

import Link from 'next/link';
import { ArrowRight, Phone } from 'lucide-react';
import { useSettings } from '@/lib/settings';

export function InsuranceRail() {
  const { phoneDisplay, phoneHref } = useSettings();
  return (
    <div className="rounded-2xl border border-border bg-white p-6">
      <p className="font-sans text-xs font-semibold tracking-[0.22em] uppercase text-sage-500">
        Free consultation
      </p>
      <p className="mt-3 font-display text-xl leading-snug text-ink">
        Questions about coverage?
      </p>
      <p className="mt-3 font-sans text-sm leading-relaxed text-ink-muted">
        Our specialists can walk you through your options. No pressure, no obligation.
      </p>
      <a
        href={phoneHref}
        className="mt-4 flex items-center gap-2 font-sans text-base font-medium text-ink transition-colors duration-200 hover:text-sage-700"
      >
        <Phone size={15} strokeWidth={1.75} className="shrink-0 text-sage-500" />
        {phoneDisplay}
      </a>
      <Link
        href="/contact"
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-sage-700 px-5 py-3 font-sans text-sm font-medium text-white transition-[background-color,transform] duration-200 ease-expo-out hover:bg-sage-900 active:scale-[0.97]"
      >
        Talk to a Specialist
        <ArrowRight size={15} strokeWidth={1.75} />
      </Link>
      <p className="mt-4 font-sans text-[13px] tracking-wide text-ink-muted">
        Available 24/7 · Fully confidential
      </p>
    </div>
  );
}
