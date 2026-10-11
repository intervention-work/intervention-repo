'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';

declare global {
  interface Window {
    hbspt?: { forms?: { create: (opts: Record<string, unknown>) => void } };
  }
}

const V2_SRC = 'https://js.hsforms.net/forms/embed/v2.js';
const LOAD_TIMEOUT_MS = 10000;

/**
 * Renders a HubSpot form (embedded in WordPress content) into a target div using
 * HubSpot's explicit `forms.create` API. This renders reliably on first load and
 * on client-side navigation, unlike the auto-scan embed which only runs once.
 * The injected form is styled to the design language via CSS (.hs-embed in
 * globals.css).
 *
 * If HubSpot's script fails to load (ad blocker shields on js.hsforms.net, CSP
 * block, or network error), the `fallback` renders in-place so visitors still
 * see a conversion path (call-us block) instead of empty space. Without this,
 * ~10-15% of visitors with uBlock / Brave Shields / corporate proxies silently
 * see the page without any form at all — a drop that masquerades as "forms down."
 */
export function HubSpotEmbed({
  portalId,
  formId,
  region = 'na1',
  fallback,
}: {
  portalId: string;
  formId: string;
  region?: string;
  fallback?: ReactNode;
}) {
  const targetId = 'hsform-' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const done = useRef(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    done.current = false;
    setFailed(false);

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
    const onError = () => setFailed(true);
    script.addEventListener('load', create);
    script.addEventListener('error', onError);
    // Poll in case the script was already loading (its `load` won't fire again).
    const poll = setInterval(create, 250);
    const stop = setTimeout(() => {
      clearInterval(poll);
      if (!done.current) setFailed(true);
    }, LOAD_TIMEOUT_MS);

    return () => {
      script?.removeEventListener('load', create);
      script?.removeEventListener('error', onError);
      clearInterval(poll);
      clearTimeout(stop);
    };
  }, [portalId, formId, region, targetId]);

  if (failed && fallback) {
    return <div className="hs-embed my-2">{fallback}</div>;
  }

  return <div id={targetId} className="hs-embed my-2" />;
}
