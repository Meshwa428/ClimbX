"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { usePathname, useRouter } from "next/navigation";

// Page transition — a stepped curtain that only ever travels **upward**.
//
//   1. cover   : it rises out of the bottom edge and climbs until the page is gone
//   2. swap    : the route changes while it is covered (nothing to see, so nothing to time)
//   3. reveal  : it keeps climbing off the top, uncovering the new page from the bottom up
//
// One continuous sweep in one direction, rather than the old pair of straps closing in from
// both edges. Reads as the same climb the brand is about, and it means the leading edge is a
// staircase on the way in *and* on the way out — the same shape doing both jobs.
//
// This used to run on `document.startViewTransition`, and that is why it is DOM now: the
// view-transition pseudo-elements are strictly nested (`::view-transition` › `-group` ›
// `-image-pair` › the snapshots), so a second curtain layer can only live on an *ancestor* of
// the page — and clipping an ancestor clips the page with it. Two independent layers are
// impossible there. Here they are two siblings, which is all this ever needed to be.
//
// Two layers, and both are visible in both directions. The lighter one is in front, so which
// one you see is decided purely by which one is *late*:
//   • cover  — dark goes first and the light follows onto it. Page → dark → light.
//   • reveal — light goes first, uncovering the dark still standing, which then goes too.
//             Light → dark → page.
// Same order read forwards and backwards, so the transition folds in on itself: the last thing
// you see before the swap is the first thing to leave after it.
const N = 6; // stairs across the width
const COVER_MS = 460;
const REVEAL_MS = 560;
const LAYER_LAG_MS = 150;
// The gap between one stair and the next. This is the knob that makes the staircase read: the
// steps are not a shape any more, they are the stagger. Raise it for a slower, more deliberate
// climb; at 0 the whole curtain is one flat sheet.
const STEP_LAG_MS = 85;
const HOLD_MS = 120; // beat on the covered state, so the swap doesn't read as a stutter
// A phase is not over until the last, most-delayed column has finished travelling.
const TAIL_MS = (N - 1) * STEP_LAG_MS;
// ponytail: if a navigation hangs, uncover anyway rather than leaving the reader staring at
// a curtain. Generous, because the only cost of being wrong is a slightly late reveal.
const SAFETY_MS = 2000;
// Head start so the nav pill finishes sliding to the new tab *before* the curtain covers it.
// Nav listens for `climbx:navigate` and moves optimistically.
export const NAV_EVENT = "climbx:navigate";
const NAV_LEAD_MS = 220;

const EASE = [0.83, 0, 0.17, 1] as [number, number, number, number];

// The staircase is built out of *time*, not out of a polygon. The curtain is N full-height
// columns and each one starts a beat after the one to its right, so the leading edge steps as
// it climbs — and the step depth is however far a column travels in STEP_LAG_MS, which is what
// makes it visible at speed. The previous pass cut the stairs into a clip-path and translated
// the whole thing rigidly; the shape was correct and completely unreadable, because a rigid
// edge crossing the viewport in half a second has no steps to see, only a slope.
//
// Right-hand column leads, so the edge rides up to the right — the same direction as the climb
// the brand is named for, and the same one the intro loader's staircase runs.
//
// Each column travels its own height: below the fold → covering → off the top.
const HIDDEN = "100%";
const COVERED = "0%";
const GONE = "-100%";

type Phase = "idle" | "cover" | "reveal";

export default function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  const reduce = useReducedMotion();
  const resolveRef = useRef<(() => void) | null>(null);

  // the new route has rendered → the curtain can start climbing off
  useEffect(() => {
    resolveRef.current?.();
    resolveRef.current = null;
  }, [pathname]);

  const run = useCallback(
    async (href: string, target: string) => {
      // Reduced motion: no curtain at all. A 1.4s cover-and-uncover with the durations zeroed
      // is just a flash, which is the thing the setting exists to avoid.
      if (reduce) {
        window.dispatchEvent(new CustomEvent(NAV_EVENT, { detail: target }));
        router.push(href);
        return;
      }
      setPhase("cover");
      window.dispatchEvent(new CustomEvent(NAV_EVENT, { detail: target }));
      router.prefetch(target);

      await new Promise((r) => setTimeout(r, NAV_LEAD_MS + COVER_MS + TAIL_MS + LAYER_LAG_MS));
      await new Promise<void>((resolve) => {
        const t = setTimeout(resolve, SAFETY_MS);
        resolveRef.current = () => {
          clearTimeout(t);
          resolve();
        };
        router.push(href);
      });
      await new Promise((r) => setTimeout(r, HOLD_MS));

      setPhase("reveal");
      await new Promise((r) => setTimeout(r, REVEAL_MS + TAIL_MS + LAYER_LAG_MS));
      setPhase("idle"); // snaps back below the fold, off-screen, with no animation
    },
    [router, reduce],
  );

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement | null)?.closest?.("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download") || a.hasAttribute("data-no-transition")) return;

      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname) return; // same page / hash link — leave it alone

      // Capture phase: next/link preventDefaults in its own handler, so by the bubble phase
      // every click looks already-handled. Stop it here so Link never navigates twice — this
      // listener owns the push.
      e.preventDefault();
      e.stopPropagation();
      void run(url.pathname + url.search + url.hash, url.pathname);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [run]);

  if (phase === "idle") return null;

  const cover = phase === "cover";
  const y = cover ? COVERED : GONE;
  const ms = cover ? COVER_MS : REVEAL_MS;
  // Whichever layer is late is the one you watch arrive, so the delay swaps between phases.
  const lag = LAYER_LAG_MS / 1000;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[95] overflow-hidden">
      {[
        { tint: "bg-ink", extra: cover ? 0 : lag }, // back — dark: leads in, follows out
        { tint: "bg-graphite", extra: cover ? lag : 0 }, // front — light: follows in, leads out
      ].map(({ tint, extra }) =>
        Array.from({ length: N }, (_, i) => (
          <motion.div
            key={`${tint}-${i}`}
            className={`absolute top-0 h-full ${tint}`}
            style={{
              // +1px so neighbouring columns overlap; at fractional viewport widths an exact
              // split leaves hairline seams of page showing through the curtain.
              left: `${(i * 100) / N}%`,
              width: `calc(${100 / N}% + 1px)`,
              willChange: "transform",
            }}
            initial={{ y: HIDDEN }}
            animate={{ y }}
            transition={{
              duration: ms / 1000,
              ease: EASE,
              delay: extra + ((N - 1 - i) * STEP_LAG_MS) / 1000,
            }}
          />
        )),
      )}
    </div>
  );
}
