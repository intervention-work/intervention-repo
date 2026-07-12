import {
  Users,
  User,
  Check,
  CircleDot,
  Smile,
  Heart,
  Star,
  HandHeart,
  ShieldCheck,
  Phone,
  type LucideIcon,
} from 'lucide-react';

/**
 * Reusable icon list — renders Elementor icon-list items (icon + label) as a
 * responsive grid of circular icon badges with labels, matching the new design.
 * The specific FontAwesome icon is mapped to a lucide equivalent; unknown icons
 * fall back to a neutral dot.
 */
const ICON_MAP: Record<string, LucideIcon> = {
  'user-friends': Users,
  users: Users,
  user: User,
  'user-circle': User,
  check: Check,
  'check-circle': Check,
  'circle-check': Check,
  smile: Smile,
  heart: Heart,
  'hand-holding-heart': HandHeart,
  'heart-circle-check': HandHeart,
  star: Star,
  'shield-alt': ShieldCheck,
  shield: ShieldCheck,
  phone: Phone,
};

function iconFor(key: string): LucideIcon {
  return ICON_MAP[key] ?? CircleDot;
}

export function IconList({ items }: { items: Array<{ icon: string; label: string }> }) {
  // Short labels → centered badge grid (like the old "A parent / Your child").
  // Longer labels → left-aligned rows with an inline badge.
  const short = items.every((i) => i.label.split(' ').filter(Boolean).length <= 3);

  if (short) {
    return (
      <ul className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5">
        {items.map((item, i) => {
          const Icon = iconFor(item.icon);
          return (
            <li key={i} className="flex flex-col items-center gap-2 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-sage-50 text-sage-700">
                <Icon size={22} strokeWidth={1.75} />
              </span>
              <span className="font-sans text-sm font-medium text-ink">{item.label}</span>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item, i) => {
        const Icon = iconFor(item.icon);
        return (
          <li key={i} className="flex items-start gap-3">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sage-50 text-sage-700">
              <Icon size={16} strokeWidth={1.9} />
            </span>
            <span className="font-sans text-[15px] leading-relaxed text-ink-body">{item.label}</span>
          </li>
        );
      })}
    </ul>
  );
}
