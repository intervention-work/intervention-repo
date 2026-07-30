'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowRight, Phone } from 'lucide-react';

export type Crumb = { label: string; href?: string };

export type HeroAction = { href: string; label: string; external: boolean };

type PageHeroProps = {
  crumbs: Crumb[];
  eyebrow?: string;
  title: string;
  summary?: string;
  image?: string;
  actions?: HeroAction[];
};

export function PageHero({
  crumbs,
  eyebrow,
  title,
  summary,
  image,
  actions,
}: PageHeroProps) {
  return (
    <section className="relative flex min-h-[54vh] w-full items-end overflow-hidden bg-ink pt-[72px]">
      {image && (
        <Image
          src={image}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      )}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.30) 40%, rgba(0,0,0,0.82) 100%)',
        }}
      />
      {/* Without a photo the flat ink block reads dead — a faint sage bloom
          gives the dark hero some depth behind the copy. */}
      {!image && (
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(115% 85% at 88% 6%, rgba(74,124,95,0.30) 0%, rgba(74,124,95,0) 58%)',
          }}
        />
      )}

      <div className="relative z-10 mx-auto w-full max-w-[1200px] px-6 pb-16 md:pb-20 lg:pb-24">
        <motion.nav
          aria-label="Breadcrumb"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-5 flex flex-wrap items-center gap-2 font-sans text-[13px] text-white/60"
        >
          {crumbs.map((c, i) => (
            <span key={`${c.label}-${i}`} className="flex items-center gap-2">
              {c.href ? (
                <Link
                  href={c.href}
                  className="transition-colors duration-200 hover:text-white"
                >
                  {c.label}
                </Link>
              ) : (
                <span className="text-white/85">{c.label}</span>
              )}
              {i < crumbs.length - 1 && (
                <span aria-hidden className="text-white/30">
                  /
                </span>
              )}
            </span>
          ))}
        </motion.nav>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
        >
          {eyebrow && (
            <p className="mb-4 font-sans text-xs font-medium tracking-[0.24em] uppercase text-sage-200">
              {eyebrow}
            </p>
          )}
          <h1
            className="text-balance font-display leading-[1.06] text-white"
            style={{
              fontSize: 'clamp(2.1rem, 4vw, 3.75rem)',
            }}
          >
            {title}
          </h1>
        </motion.div>

        {/* Directly under the title, spanning the full container. Long lines
            need extra leading to keep the return sweep trackable, hence 1.75. */}
        {summary && (
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: 0.16 }}
            className="mt-6 text-pretty font-sans leading-[1.75] text-white/80"
            style={{ fontSize: 'clamp(1.0625rem, 1.25vw, 1.1875rem)' }}
          >
            {summary}
          </motion.p>
        )}

        {actions && actions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: 0.24 }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            {actions.map((a, i) => (
              <HeroCta key={`${a.href}-${i}`} action={a} primary={i === 0} />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}

function HeroCta({ action, primary }: { action: HeroAction; primary: boolean }) {
  const tel = action.href.startsWith('tel:');
  const className =
    'inline-flex items-center gap-2 rounded-full px-6 py-3 font-sans text-sm font-medium transition-[background-color,border-color,transform] duration-200 ease-expo-out active:scale-[0.97] ' +
    (primary
      ? 'bg-white text-ink hover:bg-sage-50'
      : 'border border-white/25 text-white hover:border-white/50 hover:bg-white/10');

  const inner = (
    <>
      {tel && <Phone size={15} strokeWidth={1.75} aria-hidden />}
      {action.label}
      {!tel && primary && <ArrowRight size={15} strokeWidth={1.75} aria-hidden />}
    </>
  );

  if (action.href.startsWith('/')) {
    return (
      <Link href={action.href} className={className}>
        {inner}
      </Link>
    );
  }
  return (
    <a
      href={action.href}
      {...(action.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={className}
    >
      {inner}
    </a>
  );
}
