'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { PostCard } from '@/lib/wp';

const PER_PAGE = 12;

function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function BlogList({ posts }: { posts: PostCard[] }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(posts.length / PER_PAGE));
  const start = (page - 1) * PER_PAGE;
  const visible = posts.slice(start, start + PER_PAGE);

  const goto = (p: number) => {
    setPage(p);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((post) => (
          <Link
            key={post.slug}
            href={post.path}
            className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-white transition-shadow duration-300 hover:shadow-[0_24px_60px_-24px_rgba(17,24,39,0.25)]"
          >
            <div className="aspect-[16/10] overflow-hidden bg-surface">
              {post.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.image}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-sage-100 to-sage-200" />
              )}
            </div>
            <div className="flex flex-1 flex-col p-6">
              {post.date && (
                <p className="mb-2 font-sans text-xs tracking-wide text-ink-muted">
                  {formatDate(post.date)}
                </p>
              )}
              <h2
                className="font-display text-xl leading-snug text-ink"
              >
                {post.title}
              </h2>
              {post.excerpt && (
                <p className="mt-3 line-clamp-3 font-sans text-sm leading-relaxed text-ink-body">
                  {post.excerpt}
                </p>
              )}
              <span className="mt-4 font-sans text-sm font-medium text-sage-700">
                Read article →
              </span>
            </div>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <nav
          aria-label="Blog pagination"
          className="mt-16 flex flex-wrap items-center justify-center gap-2"
        >
          <button
            type="button"
            onClick={() => goto(Math.max(1, page - 1))}
            disabled={page === 1}
            className="rounded-full border border-border px-4 py-2 font-sans text-sm text-ink transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => goto(p)}
              aria-current={p === page ? 'page' : undefined}
              className={
                'h-10 w-10 rounded-full font-sans text-sm transition-colors ' +
                (p === page
                  ? 'bg-sage-700 text-white'
                  : 'border border-border text-ink hover:bg-surface')
              }
            >
              {p}
            </button>
          ))}
          <button
            type="button"
            onClick={() => goto(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="rounded-full border border-border px-4 py-2 font-sans text-sm text-ink transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </nav>
      )}
    </>
  );
}
