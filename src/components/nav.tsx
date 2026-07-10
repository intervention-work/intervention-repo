'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Menu, X, Phone } from 'lucide-react';
import { SoundToggle } from './sound-toggle';
import { useSettings } from '@/lib/settings';
import type { NavSection } from '@/lib/wp';

type MenuItem = { label: string; href: string; external?: boolean };
type TopLink = { label: string; href: string; items?: MenuItem[] };

function buildLinks(sections: NavSection[]): TopLink[] {
  const items = (slug: string): MenuItem[] => {
    const section = sections.find((s) => s.slug === slug);
    return (section?.children ?? []).map((c) => ({
      label: c.label,
      href: `/${slug}/${c.slug}`,
    }));
  };

  return [
    { label: 'About', href: '/about' },
    { label: 'Intervention', href: '/intervention', items: items('intervention') },
    { label: 'Services', href: '/services', items: items('services') },
    {
      label: 'Resources',
      href: '/resources',
      items: [
        { label: 'Find an Interventionist', href: '/services' },
        { label: 'Research & Outcomes', href: '/resources' },
        { label: 'Podcast', href: 'https://americarecovers.com/', external: true },
      ],
    },
    { label: 'Family Class', href: '/family-class' },
    { label: 'Contact', href: '/contact' },
  ];
}

export function Nav({ sections = [] }: { sections?: NavSection[] }) {
  const { phoneDisplay, phoneHref } = useSettings();
  const LINKS = buildLinks(sections);
  const pathname = usePathname() ?? '/';
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const light = !scrolled && !mobileOpen;
  const linkColor = light ? 'rgba(255,255,255,0.82)' : 'rgba(55,65,81,0.9)';

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <div className="flex h-[72px] items-center justify-between gap-3 px-5 md:px-7 lg:px-9">
        {/* LEFT — logo lockup */}
        <Link href="/" aria-label="intervention.com — home" className="pointer-events-auto">
          <Image
            src={light ? '/brand/intervention-nav-rev.svg' : '/brand/intervention-nav.svg'}
            alt="intervention.com"
            width={196}
            height={38}
            priority
            unoptimized
            className="h-9 w-auto"
          />
        </Link>

        {/* CENTER — pill nav (desktop) */}
        <nav
          aria-label="Primary"
          className="pointer-events-auto absolute left-1/2 hidden -translate-x-1/2 items-center gap-0.5 rounded-full border px-2 py-1.5 backdrop-blur-md transition-colors duration-300 lg:flex"
          style={{
            background: light ? 'rgba(17,24,39,0.42)' : 'rgba(255,255,255,0.92)',
            borderColor: light ? 'rgba(255,255,255,0.16)' : 'rgba(229,237,232,1)',
            boxShadow: light
              ? '0 6px 20px -16px rgba(0,0,0,0.4)'
              : '0 6px 24px -12px rgba(17,24,39,0.18)',
          }}
        >
          {LINKS.map((link) => {
            const active = isActive(link.href);
            if (!link.items) {
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className="rounded-full px-3 py-1.5 font-sans text-sm transition-colors duration-200 hover:bg-black/5"
                  style={{ color: active ? '#6BAF83' : linkColor }}
                >
                  {link.label}
                </Link>
              );
            }
            return (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() => setOpenMenu(link.label)}
                onMouseLeave={() => setOpenMenu(null)}
              >
                <Link
                  href={link.href}
                  className="flex items-center gap-1 rounded-full px-3 py-1.5 font-sans text-sm transition-colors duration-200 hover:bg-black/5"
                  style={{ color: active ? '#6BAF83' : linkColor }}
                  aria-expanded={openMenu === link.label}
                >
                  {link.label}
                  <ChevronDown
                    size={13}
                    strokeWidth={1.75}
                    className={
                      'transition-transform duration-200 ' +
                      (openMenu === link.label ? 'rotate-180' : '')
                    }
                  />
                </Link>

                {openMenu === link.label && (
                  <div className="absolute left-1/2 top-full w-64 -translate-x-1/2 pt-2.5">
                    <div className="rounded-2xl border border-border bg-white p-2 shadow-[0_24px_60px_-24px_rgba(17,24,39,0.35)]">
                      {link.items.map((item) =>
                        item.external ? (
                          <a
                            key={item.label}
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block rounded-xl px-3.5 py-2.5 font-sans text-sm text-ink-body transition-colors duration-150 hover:bg-surface hover:text-ink"
                          >
                            {item.label}
                          </a>
                        ) : (
                          <Link
                            key={item.label}
                            href={item.href}
                            className="block rounded-xl px-3.5 py-2.5 font-sans text-sm text-ink-body transition-colors duration-150 hover:bg-surface hover:text-ink"
                          >
                            {item.label}
                          </Link>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* RIGHT — sound, CTA, hamburger */}
        <div className="pointer-events-auto flex items-center gap-2">
          <SoundToggle light={light} />
          <Link
            href="/contact"
            className={
              'hidden items-center rounded-full px-4 py-2 font-sans text-sm font-medium transition-colors duration-300 lg:inline-flex ' +
              (light
                ? 'bg-white text-ink hover:bg-sage-50'
                : 'bg-ink text-white hover:bg-ink-body')
            }
          >
            Get help now
          </Link>
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
            className={
              'inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors duration-300 lg:hidden ' +
              (light
                ? 'border-white/25 text-white'
                : 'border-border bg-white text-ink')
            }
          >
            <Menu size={18} strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="pointer-events-auto fixed inset-0 z-50 flex flex-col bg-white lg:hidden">
          <div className="flex h-[72px] shrink-0 items-center justify-between px-5 md:px-7">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              aria-label="intervention.com — home"
            >
              <Image
                src="/brand/intervention-nav.svg"
                alt="intervention.com"
                width={196}
                height={38}
                unoptimized
                className="h-9 w-auto"
              />
            </Link>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-ink"
            >
              <X size={18} strokeWidth={1.75} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 pb-10 md:px-7">
            <ul className="divide-y divide-border">
              {LINKS.map((link) => (
                <li key={link.label} className="py-1">
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block py-3 font-display text-2xl text-ink"
                    style={{
                      fontVariationSettings: '"opsz" 48, "SOFT" 55, "WONK" 0',
                    }}
                  >
                    {link.label}
                  </Link>
                  {link.items && (
                    <ul className="mb-3 space-y-0.5 pl-1">
                      {link.items.map((item) =>
                        item.external ? (
                          <li key={item.label}>
                            <a
                              href={item.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => setMobileOpen(false)}
                              className="block py-1.5 font-sans text-[15px] text-ink-muted"
                            >
                              {item.label}
                            </a>
                          </li>
                        ) : (
                          <li key={item.label}>
                            <Link
                              href={item.href}
                              onClick={() => setMobileOpen(false)}
                              className="block py-1.5 font-sans text-[15px] text-ink-muted"
                            >
                              {item.label}
                            </Link>
                          </li>
                        )
                      )}
                    </ul>
                  )}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-3">
              <Link
                href="/contact"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center justify-center rounded-full bg-sage-700 px-6 py-3.5 font-sans text-base font-medium text-white"
              >
                Get help now
              </Link>
              <a
                href={phoneHref}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-6 py-3.5 font-sans text-base text-ink"
              >
                <Phone size={15} strokeWidth={1.75} className="text-sage-500" />
                {phoneDisplay}
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
