'use client';

import { useEffect, useId, useRef } from 'react';

declare global {
  interface Window {
    hbspt?: { forms?: { create: (opts: Record<string, unknown>) => void } };
  }
}

const V2_SRC = 'https://js.hsforms.net/forms/embed/v2.js';

/**
 * Renders a HubSpot form (embedded in WordPress content) into a target div using
 * HubSpot's explicit `forms.create` API. This renders reliably on first load and
 * on client-side navigation, unlike the auto-scan embed which only runs once.
 * The injected form is styled to the design language via CSS (.hs-embed in
 * globals.css).
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
  const targetId = 'hsform-' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const done = useRef(false);

  useEffect(() => {
    done.current = false;

    const create = () => {
      if (done.current) return;
      const el = document.getElementById(targetId);
      if (!el || !window.hbspt?.forms) return;
      el.innerHTML = '';
      // css:'' disables HubSpot's own stylesheet so our .hs-embed CSS controls
      // the look (design-language match).
      window.hbspt.forms.create({ portalId, formId, region, target: `#${targetId}`, css: '' });
      done.current = true;
    };

    if (window.hbspt?.forms) {
      create();
      return;
    }

    let script = document.querySelector<HTMLScriptElement>(`script[src="${V2_SRC}"]`);
    if (!script) {
      script = document.createElement('script');
      script.src = V2_SRC;
      script.async = true;
      document.body.appendChild(script);
    }
    script.addEventListener('load', create);
    // Poll in case the script was already loading (its `load` won't fire again).
    const poll = setInterval(create, 250);
    const stop = setTimeout(() => clearInterval(poll), 10000);

    return () => {
      script?.removeEventListener('load', create);
      clearInterval(poll);
      clearTimeout(stop);
    };
  }, [portalId, formId, region, targetId]);

  return <div id={targetId} className="hs-embed my-2" />;
}
