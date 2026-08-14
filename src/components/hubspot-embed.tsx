'use client';

import { useEffect } from 'react';

/**
 * Renders a HubSpot form that was embedded in WordPress content (an Elementor
 * "custom HTML" widget). The per-portal embed script scans the page for
 * `.hs-form-frame` elements and injects the form into them, so we render the
 * frame and load the script once.
 */
export function HubSpotEmbed({
  portalId,
  formId,
  region = 'na1',
}: {
  portalId: string;
  formId: string;
  region?: string;
}) {
  useEffect(() => {
    const src = `https://js.hsforms.net/forms/embed/${portalId}.js`;
    if (document.querySelector(`script[src="${src}"]`)) return; // already loaded
    const s = document.createElement('script');
    s.src = src;
    s.defer = true;
    document.body.appendChild(s);
  }, [portalId]);

  return (
    <div
      className="hs-form-frame my-4"
      data-region={region}
      data-portal-id={portalId}
      data-form-id={formId}
    />
  );
}
