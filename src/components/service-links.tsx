import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { WpSidebar } from '@/lib/wp-parse';

/**
 * The WP "All Services" menu, rendered as a sidebar nav instead of being flattened
 * into the article body (where its heading ended up labelling nothing).
 */
export function ServiceLinks({ sidebar }: { sidebar: WpSidebar }) {
  return (
    <nav
      aria-label={sidebar.title}
      className="rounded-2xl border border-border bg-white p-6"
    >
      <p className="font-sans text-xs font-semibold tracking-[0.22em] uppercase text-sage-500">
        {sidebar.title}
      </p>
      <ul className="mt-3">
        {sidebar.links.map((link) => (
          <li key={link.href} className="border-b border-border last:border-b-0">
            <Link
              href={link.href}
              className="group flex items-start justify-between gap-3 py-3 font-sans text-[15px] leading-snug text-ink transition-colors duration-200 hover:text-sage-700"
            >
              <span className="text-pretty">{link.label}</span>
              <ArrowRight
                size={14}
                strokeWidth={1.75}
                aria-hidden
                className="mt-0.5 shrink-0 text-ink-muted transition-transform duration-200 ease-expo-out group-hover:translate-x-0.5 group-hover:text-sage-500"
              />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
