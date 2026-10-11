'use client';

import { useEffect } from 'react';

// Fires GA4 events directly via gtag — bypassing GTM entirely for the critical
// conversion signals. The intervention.com GTM container's triggers were
// configured for the old WordPress DOM and never updated for the Next.js
// rewrite, so every custom event in GA4 property 326681126 was silently
// returning zero data (verified live in GA4 Realtime: a phone-link click
// surfaced only page_view/scroll/session_start, no click_to_call event).
//
// This component mounts once in the root layout, attaches delegated document
// listeners, and fires the four conversion events the business cares about
// straight to GA4. Idempotent — re-mounts safely.
//
// After this ships, the following event names should start appearing with
// stream data in GA4 → Admin → Events (property 326681126):
//   click_to_call, click_to_contact, click_to_email, form_submit, generate_lead
//
// Mark each as a "Key event" in GA4 → Admin → Events to count as a conversion
// and expose it to Google Ads for conversion import.

type GtagFn = (
  command: 'event' | 'config' | 'js' | 'set',
  action: string,
  params?: Record<string, unknown>,
) => void;

declare global {
  interface Window {
    gtag?: GtagFn;
    dataLayer?: unknown[];
  }
}

function fire(event: string, params?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  // gtag() is defined by the <Script id="gtag-init"> block in layout.tsx; if it
  // somehow hasn't initialized yet, push onto dataLayer so GTM/GA4 pick it up
  // once ready.
  if (typeof window.gtag === 'function') {
    window.gtag('event', event, params);
    return;
  }
  (window.dataLayer ||= []).push(['event', event, params ?? {}]);
}

function pathOf(url: string): string {
  try {
    return new URL(url, window.location.origin).pathname;
  } catch {
    return url;
  }
}

export function AnalyticsEvents() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const a = target?.closest?.('a') as HTMLAnchorElement | null;
      if (!a) return;
      const rawHref = a.getAttribute('href') ?? '';
      if (!rawHref) return;

      if (/^tel:/i.test(rawHref)) {
        fire('click_to_call', {
          phone_number: rawHref.replace(/^tel:/i, ''),
          link_text: (a.textContent ?? '').trim().slice(0, 60),
          page_location: window.location.href,
          page_path: window.location.pathname,
        });
        return;
      }

      if (/^mailto:/i.test(rawHref)) {
        fire('click_to_email', {
          email: rawHref.replace(/^mailto:/i, '').split('?')[0],
          page_location: window.location.href,
          page_path: window.location.pathname,
        });
        return;
      }

      // Internal nav → /contact. Covers absolute and relative hrefs.
      const path = pathOf(rawHref);
      if (path === '/contact' || path.startsWith('/contact?') || path.startsWith('/contact#')) {
        fire('click_to_contact', {
          link_text: (a.textContent ?? '').trim().slice(0, 60),
          page_location: window.location.href,
          page_path: window.location.pathname,
        });
      }
    };

    // HubSpot embed submission signal. HubSpot's iframe posts a message of
    // shape { type: 'hsFormCallback', eventName: 'onFormSubmitted', id, data }
    // when a form is submitted successfully. Nothing in the Next app listens
    // for it today, which is why PPC_InterSpecialists_Form_Submission has
    // never had stream data.
    const onMessage = (e: MessageEvent) => {
      const d = e.data as { type?: string; eventName?: string; id?: string } | null;
      if (!d || typeof d !== 'object') return;
      if (d.type !== 'hsFormCallback') return;
      if (d.eventName !== 'onFormSubmitted') return;
      fire('form_submit', {
        form_id: d.id,
        page_location: window.location.href,
        page_path: window.location.pathname,
      });
      // Also fire GA4's standard lead event so it maps cleanly to Google Ads.
      fire('generate_lead', {
        form_id: d.id,
        page_location: window.location.href,
        page_path: window.location.pathname,
      });
    };

    document.addEventListener('click', onClick, true);
    window.addEventListener('message', onMessage);
    return () => {
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('message', onMessage);
    };
  }, []);

  return null;
}
