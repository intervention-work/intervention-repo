import { ChevronDown } from 'lucide-react';
import { WpContent } from './wp-content';

/**
 * Reusable accordion built on native <details>/<summary> (no JS needed).
 * Body content is rendered through the shared WpContent pipeline so it gets the
 * same design-system templates as the rest of the page.
 */
export function Accordion({ items }: { items: Array<{ title: string; bodyHtml: string }> }) {
  return (
    <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border">
      {items.map((item, i) => (
        <details key={i} className="group bg-white [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 font-sans text-base font-medium text-ink transition-colors hover:bg-surface">
            {item.title}
            <ChevronDown
              size={18}
              strokeWidth={2}
              className="shrink-0 text-sage-500 transition-transform duration-200 group-open:rotate-180"
            />
          </summary>
          <div className="px-6 pb-6 pt-1">
            <WpContent html={item.bodyHtml} />
          </div>
        </details>
      ))}
    </div>
  );
}
