"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";

// Global custom cursor. Two stacked layers inside one spring-followed wrapper:
//   • blend layer — white disc on `mix-blend-difference`, so it inverts whatever is under
//     it. This is the resting dot, and it's what grows on buttons.
//   • label layer — solid white disc with "Explore", NO blend, for image/card targets.
// Cross-fading two layers (instead of toggling blend-mode on one) keeps the dot → Explore
// morph smooth; a live mix-blend-mode switch pops.
// Opt in per element with data-cursor="explore" | "button" | "none"; plain <a>/<button>
// get the button state for free. The real cursor is never hidden.
const BASE = 96; // px — every state is a scale of this, so we only ever animate transform
const SCALE = { dot: 9 / BASE, button: 44 / BASE, explore: 1 };

type Mode = keyof typeof SCALE;

export default function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState<Mode>("dot");
  const reduce = useReducedMotion();

  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  // the lag: soft spring, no mass wobble. Reduced motion → snap straight to the pointer.
  const sx = useSpring(x, { stiffness: 550, damping: 45, mass: 0.55 });
  const sy = useSpring(y, { stiffness: 550, damping: 45, mass: 0.55 });
  const px = reduce ? x : sx;
  const py = reduce ? y : sy;

  useEffect(() => {
    // Skip only when the primary pointer is genuinely coarse (touch). Gating on
    // `(pointer: fine)` instead would also drop environments that report neither.
    if (window.matchMedia("(pointer: coarse)").matches) return;
    setEnabled(true);

    const onMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    // pointerover fires on every target change, so it doubles as "what am I on now?"
    const onOver = (e: PointerEvent) => {
      const el = (e.target as HTMLElement | null)?.closest?.("[data-cursor],a,button");
      const flag = el?.getAttribute("data-cursor");
      const next: Mode =
        flag === "explore"
          ? "explore"
          : flag === "none" || !el
            ? "dot"
            : flag === "button" || el.tagName === "A" || el.tagName === "BUTTON"
              ? "button"
              : "dot";
      setMode((m) => (m === next ? m : next));
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
    };
  }, [x, y]);

  if (!enabled) return null;

  const spring = reduce
    ? { duration: 0 }
    : ({ type: "spring", stiffness: 320, damping: 30, mass: 0.5 } as const);

  // Two independent fixed layers, not one wrapper with two children: mix-blend-mode only
  // blends within the nearest stacking context, and the follower's transform creates one.
  // Nesting the disc inside would blend it against its own (empty) parent — plain white.
  const box = { width: BASE, height: BASE, marginLeft: -BASE / 2, marginTop: -BASE / 2 } as const;

  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9999] rounded-full bg-white mix-blend-difference"
        style={{ x: px, y: py, ...box }}
        animate={{ scale: mode === "explore" ? 0 : SCALE[mode] }}
        transition={spring}
      />
      {/* scale is the only thing that moves — no opacity fade. One disc shrinks to nothing
          as the other grows out of nothing, so the handover reads as a single morph. */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9999] flex items-center justify-center rounded-full bg-white font-accent text-sm text-ink"
        style={{ x: px, y: py, ...box }}
        initial={false}
        animate={{ scale: mode === "explore" ? 1 : 0 }}
        transition={spring}
      >
        Explore
      </motion.div>
    </>
  );
}
