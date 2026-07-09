'use client';

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react';

type SoundCtx = {
  enabled: boolean;
  toggle: () => void;
  /** Pass to a <video> or <audio> ref. The provider takes over mute control. */
  registerMedia: (el: HTMLMediaElement | null) => void;
};

const SoundContext = createContext<SoundCtx | null>(null);

const TARGET_VOLUME = 0.55;
const FADE_IN_MS = 1200;
const FADE_OUT_MS = 700;

function fadeVolume(
  el: HTMLMediaElement,
  to: number,
  ms: number,
  onDone?: () => void,
) {
  const from = el.volume;
  const start = performance.now();
  let raf = 0;
  const step = (now: number) => {
    const t = Math.min((now - start) / ms, 1);
    // easeInOutQuad
    const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    el.volume = from + (to - from) * eased;
    if (t < 1) raf = requestAnimationFrame(step);
    else onDone?.();
  };
  raf = requestAnimationFrame(step);
  return () => cancelAnimationFrame(raf);
}

export function SoundProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const enabledRef = useRef(false);
  const mediaRef = useRef<HTMLMediaElement | null>(null);
  const cancelFadeRef = useRef<(() => void) | null>(null);

  const apply = useCallback((on: boolean) => {
    const el = mediaRef.current;
    if (!el) return;
    cancelFadeRef.current?.();
    if (on) {
      el.muted = false;
      el.volume = 0;
      el.play().catch(() => {
        /* autoplay blocked — toggle still updates UI */
      });
      cancelFadeRef.current = fadeVolume(el, TARGET_VOLUME, FADE_IN_MS);
    } else {
      cancelFadeRef.current = fadeVolume(el, 0, FADE_OUT_MS, () => {
        if (mediaRef.current === el) el.muted = true;
      });
    }
  }, []);

  const registerMedia = useCallback((el: HTMLMediaElement | null) => {
    mediaRef.current = el;
    if (!el) return;
    // Sync newly mounted media to current sound state. Crucial when the
    // hero video remounts on V1<->V2 navigation while sound is on.
    if (enabledRef.current) {
      el.muted = false;
      el.volume = TARGET_VOLUME;
      el.play().catch(() => {});
    } else {
      el.muted = true;
    }
  }, []);

  const toggle = useCallback(() => {
    const next = !enabledRef.current;
    enabledRef.current = next;
    setEnabled(next);
    apply(next);
  }, [apply]);

  return (
    <SoundContext.Provider value={{ enabled, toggle, registerMedia }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error('useSound must be used within <SoundProvider>');
  return ctx;
}
