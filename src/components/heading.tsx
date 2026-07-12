import styles from './wp-prose.module.css';

/**
 * Canonical heading for all WP-rendered content. One component so every heading
 * across all pages is visually distinctive and consistent with the new design.
 *
 * level 2 = section heading (display, large)
 * level 3 = sub-section heading (display, medium)
 * level 4 = minor heading (sans, semibold)
 *
 * Accepts `html` (inline markup preserved, e.g. links/bold inside a WP heading)
 * or plain `children`.
 */
const LEVEL_CLASS: Record<2 | 3 | 4, string> = {
  2: styles.h2Section,
  3: styles.h3Standalone,
  4: styles.h4Standalone,
};

export function Heading({
  level,
  html,
  children,
  className = '',
}: {
  level: 2 | 3 | 4;
  html?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const cls = `${LEVEL_CLASS[level]}${className ? ` ${className}` : ''}`;
  const Tag = (`h${level}`) as 'h2' | 'h3' | 'h4';
  if (html !== undefined) {
    return <Tag className={cls} dangerouslySetInnerHTML={{ __html: html }} />;
  }
  return <Tag className={cls}>{children}</Tag>;
}
