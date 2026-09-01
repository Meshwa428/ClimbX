"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cubicBezier } from "@/lib/ease";
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
// The curtain's own speed. Trimmed, but not to the bone: putting a mark on the covered state
// means the covered state has to last long enough to read it, so the travel has to give that
// time back. Every value here is paid twice — once per stair, once per layer — so `STEP_LAG_MS`
// in particular is worth two of anything else.
const N = 6; // stairs across the width
const COVER_MS = 380;
const REVEAL_MS = 440;
const LAYER_LAG_MS = 120;
// The gap between one stair and the next. This is the knob that makes the staircase read: the
// steps are not a shape any more, they are the stagger. Raise it for a slower, more deliberate
// climb; at 0 the whole curtain is one flat sheet.
const STEP_LAG_MS = 60;
// A phase is not over until the last, most-delayed column has finished travelling.
const TAIL_MS = (N - 1) * STEP_LAG_MS;
// ponytail: if a navigation hangs, uncover anyway rather than leaving the reader staring at
// a curtain. Generous, because the only cost of being wrong is a slightly late reveal.
const SAFETY_MS = 2000;
// Nav listens for `climbx:navigate` and slides its pill to the new tab optimistically. It used
// to get a 220ms head start before the curtain moved, which was 220ms of a page doing nothing;
// the pill can perfectly well slide *while* the curtain climbs over it.
export const NAV_EVENT = "climbx:navigate";

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
// The mark is *printed on* the light curtain, not laid over it. Each column carries a
// viewport-wide copy of the logo, shifted left by that column's own offset and clipped to the
// column — so the six slices line up into one whole lockup exactly when the curtain is whole.
// A column that has not arrived yet simply has not brought its slice, which is what makes the
// logo assemble as the stairs climb and shear apart again as they leave. Overlaid, it just
// hovered in front of a half-built curtain.
//
// This is why the columns are exact `100/N%` with no overlap: the slices have to tile, and a
// 1px fudge per column would tear the logo by 5px across. Seams do not matter — the two layers
// sit at different stagger offsets, so each one's gaps are backed by the other.
// A floor on the covered state, measured from the moment the page is hidden. Not the empty
// hold this used to have — that one sat on a blank screen, which is exactly what made the
// transition feel long. Now there is a mark up there, and with the route prefetched the push
// can resolve in a frame, which would otherwise land and dismiss the logo in the same breath.
// Only ever a floor: a slow route waits as long as it needs and this costs nothing.
// Shorter than it was: the mark's own fade is now 180ms of dwell on its own, so the floor only
// has to cover the gap between the curtain landing and that fade starting.
const MIN_COVERED_MS = 160;
// The mark clears out before the curtain does, so the page is never uncovered underneath a
// logo that is still sitting there.
const MARK_OUT_MS = 180;

// The stairs do not fire on an even beat. Their delays are distributed along a curve that is
// steep at both ends and flat through the middle, so the gap between the first two columns is
// wide (the sweep starts slow), the middle columns fire almost together (it runs fast), and the
// last gap widens again (it lands slow). A linear ramp crosses the screen at one flat rate.
// Steep-ends/flat-middle is the *inverse* of an ease-in-out — the gap between columns is this
// curve's slope, so the familiar S-curve would give exactly the wrong answer (fast, slow, fast).
const SWEEP = cubicBezier(0.35, 0.85, 0.65, 0.15);
// Rightmost column leads at t=0; leftmost trails at t=1.
const stepDelay = (i: number) => SWEEP((N - 1 - i) / (N - 1)) * TAIL_MS;

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

      // Push the moment the page is *hidden*, which is when the leading layer's last column
      // lands — not when the whole phase ends. The trailing layer is still settling onto an
      // already-covered screen, so the navigation gets those LAYER_LAG_MS for free.
      await new Promise((r) => setTimeout(r, COVER_MS + TAIL_MS));
      const coveredAt = performance.now();
      await new Promise<void>((resolve) => {
        const t = setTimeout(resolve, SAFETY_MS);
        resolveRef.current = () => {
          clearTimeout(t);
          resolve();
        };
        router.push(href);
      });
      const left = MIN_COVERED_MS - (performance.now() - coveredAt);
      if (left > 0) await new Promise((r) => setTimeout(r, left));
      setPhase("reveal"); // the instant the route has rendered — no beat on the dark
      await new Promise((r) => setTimeout(r, MARK_OUT_MS + REVEAL_MS + TAIL_MS + LAYER_LAG_MS));
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

    // Warm the route on hover instead of on click. Prefetching at click time meant the payload
    // only started loading once the curtain was already climbing, so the fetch landed inside
    // the covered window — which is the beat that reads as "nothing is happening". By the time
    // a pointer has crossed a link and pressed it, the route is usually already in cache and
    // the push resolves in a frame or two.
    const warmed = new Set<string>();
    const onOver = (e: PointerEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.("a");
      if (!a?.href) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      if (warmed.has(url.pathname)) return;
      warmed.add(url.pathname);
      router.prefetch(url.pathname);
    };

    document.addEventListener("click", onClick, true);
    document.addEventListener("pointerover", onOver, { passive: true });
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("pointerover", onOver);
    };
  }, [run, router]);

  if (phase === "idle") return null;

  const cover = phase === "cover";
  const y = cover ? COVERED : GONE;
  const ms = cover ? COVER_MS : REVEAL_MS;
  // Whichever layer is late is the one you watch arrive, so the delay swaps between phases.
  const lag = LAYER_LAG_MS / 1000;
  // On the way out the whole curtain waits for the mark to fade before it moves.
  const colDelay = (i: number, extra: number) =>
    (cover ? 0 : MARK_OUT_MS / 1000) + extra + stepDelay(i) / 1000;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[95] overflow-hidden">
      {[
        { tint: "bg-ink", extra: cover ? 0 : lag, mark: false }, // back — dark: leads in, follows out
        { tint: "bg-graphite", extra: cover ? lag : 0, mark: true }, // front — light: follows in, leads out
      ].map(({ tint, extra, mark }) =>
        Array.from({ length: N }, (_, i) => (
          <motion.div
            key={`${tint}-${i}`}
            className={`absolute top-0 h-full overflow-hidden ${tint}`}
            style={{
              left: `${(i * 100) / N}%`,
              width: `${100 / N}%`,
              willChange: "transform",
            }}
            initial={{ y: HIDDEN }}
            animate={{ y }}
            transition={{ duration: ms / 1000, ease: EASE, delay: colDelay(i, extra) }}
          >
            {mark && (
              // One viewport-wide copy per column, pulled back by this column's own offset, so
              // the clip leaves exactly this column's slice of it.
              //
              // The vertical animation is the *inverse* of its column's, which is the whole
              // trick: the column slides and its copy slides the opposite way by the same
              // amount, so the logo stays pinned to the centre of the viewport while the column
              // travels over it. The curtain then only ever *uncovers* the mark, strip by strip.
              // Letting the copies ride with their columns — which is what the last pass did —
              // tears the lockup into six pieces at six different heights.
              <motion.div
                className="absolute inset-y-0 flex items-center justify-center"
                style={{ left: `-${i * 100}%`, width: `${N * 100}%` }}
                initial={{ y: "-100%", opacity: 1 }}
                animate={cover ? { y: "0%", opacity: 1 } : { y: "100%", opacity: 0 }}
                transition={{
                  y: { duration: ms / 1000, ease: EASE, delay: colDelay(i, extra) },
                  // The fade leads everything and ignores the stagger — one mark, one exit.
                  opacity: { duration: MARK_OUT_MS / 1000, ease: "linear" },
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo/climbx-logo-white.png"
                  alt=""
                  width={186}
                  height={52}
                  className="h-16 w-auto max-w-[72vw] object-contain md:h-24"
                />
              </motion.div>
            )}
          </motion.div>
        )),
      )}

    </div>
  );
}
