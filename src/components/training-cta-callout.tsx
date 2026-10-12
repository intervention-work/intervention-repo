import Link from 'next/link';
import { ArrowRight, Mail } from 'lucide-react';
import type { HeroAction } from '@/components/page-hero';

// A prominent sign-up callout for training pages. Replaces the small pill
// buttons that get lost in the hero on mobile. Shown directly under the
// hero as a full-width card with a large primary CTA and short rationale.
// Falls back silently if there's no action to surface.
export function TrainingCtaCallout({
  action,
  pretitle = 'Reserve your seat',
  title = 'Our next Breakfree Intervention training opens soon.',
  subtitle = 'Spots are limited. Register your interest and we will reach out with the next dates and details.',
}: {
  action?: HeroAction;
  pretitle?: string;
  title?: string;
  subtitle?: string;
}) {
  if (!action) return null;

  const external = action.external || /^https?:\/\//i.test(action.href);
  const primaryCtaClass =
    'inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 font-sans text-base font-semibold text-sage-900 shadow-sm transition-[background-color,transform] duration-200 ease-expo-out hover:bg-sage-50 active:scale-[0.98]';

  const primaryCta = external ? (
    <a
      href={action.href}
      target="_blank"
      rel="noopener noreferrer"
      className={primaryCtaClass}
    >
      {action.label}
      <ArrowRight size={18} strokeWidth={2} />
    </a>
  ) : (
    <Link href={action.href} className={primaryCtaClass}>
      {action.label}
      <ArrowRight size={18} strokeWidth={2} />
    </Link>
  );

  return (
    <section className="bg-surface">
      <div className="mx-auto max-w-[1200px] px-6 pt-10 pb-6 md:pt-14 md:pb-10">
        <div className="rounded-2xl bg-sage-700 px-6 py-8 text-white md:px-10 md:py-10 lg:flex lg:items-center lg:justify-between lg:gap-10">
          <div className="flex-1">
            <p className="font-sans text-xs font-medium tracking-[0.22em] uppercase text-sage-100">
              {pretitle}
            </p>
            <h2 className="mt-3 text-balance font-display text-2xl leading-tight md:text-3xl lg:text-[2.25rem]">
              {title}
            </h2>
            <p className="mt-4 max-w-[52ch] font-sans text-base leading-relaxed text-white/85 md:text-lg">
              {subtitle}
            </p>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center lg:mt-0 lg:flex-col lg:items-stretch">
            {primaryCta}
            <a
              href="mailto:help@intervention.com?subject=Breakfree%20Intervention%20Training"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 px-6 py-4 font-sans text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              <Mail size={15} strokeWidth={1.75} />
              Email questions
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
