import styles from './wp-prose.module.css';

/**
 * Renders sanitized WordPress page content (from `fetchPageBody`) restyled with
 * the new design's typography and color tokens. The HTML is trusted — it comes
 * from our own WP install and is stripped of scripts/attributes in wp.ts.
 */
export function WpProse({ html }: { html: string }) {
  if (!html) return null;
  return (
    <div
      className={styles.prose}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
