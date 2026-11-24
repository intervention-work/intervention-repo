'use client';

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export type TestimonialItem = {
  quote: string;
  quoteHtml?: string;
  name: string;
  role: string;
  image?: { src: string; alt: string };
};

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// The component adds its own typographic quotes, so drop any the source carries.
function quoteBody(t: TestimonialItem): string {
  const html = t.quoteHtml?.trim() || escapeHtml(t.quote);
  return html.replace(/^[“"]\s*/, '').replace(/\s*[”"]$/, '');
}

// Slides visible at once: 1 on mobile, 2 on tablet, 3 on desktop.
function usePerView(): number {
  const [perView, setPerView] = useState(1);
  useEffect(() => {
    const md = window.matchMedia('(min-width: 640px)');
    const lg = window.matchMedia('(min-width: 1024px)');
    const update = () => setPerView(lg.matches ? 3 : md.matches ? 2 : 1);
    update();
    md.addEventListener('change', update);
    lg.addEventListener('change', update);
    return () => {
      md.removeEventListener('change', update);
      lg.removeEventListener('change', update);
    };
  }, []);
  return perView;
}

/**
 * Quote cards on a dark panel: large photo with name + role on top, quote
 * underneath, side arrows and dots. Snap-scrolling track, so touch swipe and trackpad work.
 */
export function TestimonialCarousel({ items }: { items: TestimonialItem[] }) {
  const perView = usePerView();
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const pages = Math.max(1, items.length - perView + 1);
  const scrollable = pages > 1;

  const slideWidth = () => {
    const el = trackRef.current;
    const first = el?.firstElementChild as HTMLElement | null;
    return first?.offsetWidth ?? 0;
  };

  const goTo = useCallback((index: number) => {
    const el = trackRef.current;
    if (!el) return;
    const clamped = Math.min(Math.max(index, 0), pages - 1);
    el.scrollTo({ left: clamped * slideWidth(), behavior: 'smooth' });
  }, [pages]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onScroll = () => {
      const w = slideWidth();
      if (w) setActive(Math.min(pages - 1, Math.round(el.scrollLeft / w)));
    };
    onScroll();
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [pages, perView]);

  // One card per view: size the track to the visible card, so a short quote
  // doesn't sit above the empty space of the longest one.
  const [trackHeight, setTrackHeight] = useState<number>();
  useEffect(() => {
    const slide = trackRef.current?.children[active] as HTMLElement | undefined;
    setTrackHeight(perView === 1 && slide ? slide.offsetHeight : undefined);
  }, [active, perView]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(active + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(active - 1); }
  };

  const arrow =
    'absolute top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 text-sage-200 transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-200 disabled:cursor-not-allowed disabled:opacity-30 sm:flex';

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Testimonials"
      className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-sage-700 to-sage-900 px-4 py-10 sm:px-16 md:py-12 lg:px-20"
    >
      {scrollable && (
        <>
          <button
            type="button"
            aria-label="Previous testimonial"
            onClick={() => goTo(active - 1)}
            disabled={active <= 0}
            className={`${arrow} left-3`}
          >
            <ChevronLeft size={20} strokeWidth={1.75} />
          </button>
          <button
            type="button"
            aria-label="Next testimonial"
            onClick={() => goTo(active + 1)}
            disabled={active >= pages - 1}
            className={`${arrow} right-3`}
          >
            <ChevronRight size={20} strokeWidth={1.75} />
          </button>
        </>
      )}

      <div
        ref={trackRef}
        tabIndex={scrollable ? 0 : -1}
        onKeyDown={onKeyDown}
        style={trackHeight ? { height: trackHeight } : undefined}
        className={`flex items-start transition-[height] duration-300 ease-out snap-x snap-mandatory overflow-x-auto sm:items-stretch scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sage-200 ${
          scrollable ? '' : 'justify-center'
        }`}
      >
        {items.map((t, i) => (
          <div
            key={i}
            className={`flex shrink-0 snap-start px-2 sm:px-2.5 ${
              scrollable
                ? 'basis-full sm:basis-1/2 lg:basis-1/3'
                : items.length === 1
                  ? 'basis-full max-w-xl'
                  : 'basis-full sm:basis-1/2'
            }`}
          >
            <figure className="flex w-full flex-col overflow-hidden rounded-2xl bg-white/[0.07] ring-1 ring-white/15">
              {t.image?.src ? (
                // The face is why the quote carries weight, so it leads the card.
                <figcaption className="relative aspect-[4/3] w-full bg-sage-900 font-sans">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={t.image.src}
                    alt={t.image.alt || t.name}
                    loading="eager"
                    className="absolute inset-0 h-full w-full object-cover object-[50%_25%]"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-6 pt-14 pb-4 md:px-7">
                    {t.name && <p className="text-lg font-semibold text-white">{t.name}</p>}
                    {t.role && <p className="mt-0.5 text-xs leading-snug text-white/80">{t.role}</p>}
                  </div>
                </figcaption>
              ) : (
                <figcaption className="px-6 pt-6 font-sans md:px-7">
                  {t.name && <p className="text-[15px] font-semibold text-white">{t.name}</p>}
                  {t.role && <p className="mt-0.5 text-xs leading-snug text-sage-200/90">{t.role}</p>}
                </figcaption>
              )}
              <div className="flex flex-1 gap-3 p-6 md:p-7">
                <span aria-hidden className="-mt-1 font-display text-4xl leading-none text-sage-200/80">
                  &ldquo;
                </span>
                <blockquote
                  className="font-sans text-[15px] leading-relaxed text-white/90 [&_b]:font-semibold [&_b]:text-white [&_strong]:font-semibold [&_strong]:text-white"
                  dangerouslySetInnerHTML={{ __html: `${quoteBody(t)}&rdquo;` }}
                />
              </div>
            </figure>
          </div>
        ))}
      </div>

      {scrollable && (
        <div className="mt-8 flex justify-center gap-2" role="group" aria-label="Choose testimonial">
          {Array.from({ length: pages }, (_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to testimonial ${i + 1}`}
              aria-current={i === active ? 'true' : undefined}
              onClick={() => goTo(i)}
              className="flex h-6 w-6 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sage-200"
            >
              <span
                className={`block h-2 w-2 rounded-full transition-colors ${
                  i === active ? 'bg-sage-200' : 'bg-white/45'
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
