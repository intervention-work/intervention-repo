import Link from 'next/link';
import type { PostCard } from '@/lib/wp';

// Posts per paginated page. Shared with /intervention-blog and /intervention-blog/page/[page].
export const BLOG_PER_PAGE = 12;

function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// Page 1 lives at /intervention-blog (no suffix) so existing backlinks and
// Google's cached canonical stay intact. Pages 2+ live at /intervention-blog/page/N
// with real server-rendered <Link> navigation (replacing the previous client-only
// pagination that left posts 13+ orphaned from crawlers).
function pageHref(page: number): string {
  return page === 1 ? '/intervention-blog' : `/intervention-blog/page/${page}`;
}

export function BlogList({
  posts,
  page,
  totalPages,
}: {
  posts: PostCard[];
  page: number;
  totalPages: number;
}) {
  return (
    <>
      <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
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
              <h2 className="font-display text-xl leading-snug text-ink">
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
          {page > 1 ? (
            <Link
              href={pageHref(page - 1)}
              rel="prev"
              className="rounded-full border border-border px-4 py-2 font-sans text-sm text-ink transition-colors hover:bg-surface"
            >
              Prev
            </Link>
          ) : (
            <span className="rounded-full border border-border px-4 py-2 font-sans text-sm text-ink opacity-40">
              Prev
            </span>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) =>
            p === page ? (
              <span
                key={p}
                aria-current="page"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-sage-700 font-sans text-sm text-white"
              >
                {p}
              </span>
            ) : (
              <Link
                key={p}
                href={pageHref(p)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border font-sans text-sm text-ink transition-colors hover:bg-surface"
              >
                {p}
              </Link>
            ),
          )}
          {page < totalPages ? (
            <Link
              href={pageHref(page + 1)}
              rel="next"
              className="rounded-full border border-border px-4 py-2 font-sans text-sm text-ink transition-colors hover:bg-surface"
            >
              Next
            </Link>
          ) : (
            <span className="rounded-full border border-border px-4 py-2 font-sans text-sm text-ink opacity-40">
              Next
            </span>
          )}
        </nav>
      )}
    </>
  );
}
