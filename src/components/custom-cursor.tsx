'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'motion/react';

type CursorMode = 'default' | 'hover' | 'text';

/**
 * CustomCursor — a bespoke pointer.
 *  - default: 10px sage-500 dot, spring-followed
 *  - hover  : 48px ring, 30% opacity, soft blur (over a/button/[role=button])
 *  - text   : 2x18 thin sage caret (over inputs/textareas/[contenteditable])
 *
 * Hidden on touch devices. Hidden until first mouse move.
 */
export function CustomCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const xSpring = useSpring(cursorX, { damping: 22, stiffness: 900, mass: 0.18 });
  const ySpring = useSpring(cursorY, { damping: 22, stiffness: 900, mass: 0.18 });

  const [mode, setMode] = useState<CursorMode>('default');
  const [visible, setVisible] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.matchMedia('(pointer: fine)').matches) return;
    setEnabled(true);

    const onMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!visible) setVisible(true);
    };

    const onOver = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (!target) return;
      if (target.closest('input, textarea, [contenteditable="true"]')) {
        setMode('text');
      } else if (target.closest('a, button, [role="button"], [data-cursor="hover"]')) {
        setMode('hover');
      } else {
        setMode('default');
      }
    };

    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseover', onOver, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);

    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
    };
  }, [cursorX, cursorY, visible]);

  if (!enabled) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          aria-hidden
          className="pointer-events-none fixed top-0 left-0 z-[99999]"
          style={{ x: xSpring, y: ySpring }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="rounded-full bg-sage-400 shadow-[0_0_0_1px_rgba(255,255,255,0.25)]"
            initial={false}
            animate={
              mode === 'hover'
                ? {
                    width: 48,
                    height: 48,
                    x: -24,
                    y: -24,
                    opacity: 0.35,
                    filter: 'blur(2px)',
                    borderRadius: 9999,
                  }
                : mode === 'text'
                ? {
                    width: 2,
                    height: 18,
                    x: -1,
                    y: -9,
                    opacity: 0.95,
                    filter: 'blur(0px)',
                    borderRadius: 1,
                  }
                : {
                    width: 10,
                    height: 10,
                    x: -5,
                    y: -5,
                    opacity: 1,
                    filter: 'blur(0px)',
                    borderRadius: 9999,
                  }
            }
            transition={{ type: 'spring', damping: 22, stiffness: 260, mass: 0.5 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
