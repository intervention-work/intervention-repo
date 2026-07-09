'use client';

import { useEffect } from 'react';

/**
 * In dev, unregister any service workers that other localhost projects left
 * behind. Service workers are scoped per-origin (host + port), so a stale SW
 * from another app on `localhost:3000`/`3001` will intercept chunk fetches
 * for this app and cause Turbopack "module factory is not available" errors.
 *
 * Production: no-op. Real SWs (PWA) should be registered intentionally.
 */
export function DevServiceWorkerCleanup() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;

    navigator.serviceWorker
      .getRegistrations()
      .then((regs) => {
        if (regs.length === 0) return;
        for (const reg of regs) {
          reg.unregister().then((ok) => {
            console.warn(
              `[dev] Unregistered stale service worker (scope=${reg.scope}, ok=${ok}). Hard-reload once.`,
            );
          });
        }
      })
      .catch(() => {
        /* ignore */
      });

    if ('caches' in window) {
      caches.keys().then((keys) => {
        for (const key of keys) caches.delete(key);
      });
    }
  }, []);

  return null;
}
