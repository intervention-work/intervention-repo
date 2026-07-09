'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';

export type Crumb = { label: string; href?: string };

type PageHeroProps = {
  crumbs: Crumb[];
  eyebrow?: string;
  title: string;
  summary?: string;
  image?: string;
};

export function PageHero({
  crumbs,
  eyebrow,
  title,
  summary,
  image,
}: PageHeroProps) {
  return (
    <section className="relative flex min-h-[58vh] w-full items-end overflow-hidden bg-ink pt-[72px]">
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

      <div className="relative z-10 mx-auto w-full max-w-[1200px] px-6 pb-14 md:pb-20">
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
            <p className="mb-4 font-sans text-[11px] tracking-[0.24em] uppercase text-white/60">
              {eyebrow}
            </p>
          )}
          <h1
            className="max-w-[840px] font-display leading-[1.06] text-white"
            style={{
              fontSize: 'clamp(2.1rem, 4vw, 3.75rem)',
              fontVariationSettings: '"opsz" 96, "SOFT" 65, "WONK" 0',
            }}
          >
            {title}
          </h1>
          {summary && (
            <p className="mt-5 max-w-[620px] font-sans text-base leading-relaxed text-white/75 md:text-lg">
              {summary}
            </p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
