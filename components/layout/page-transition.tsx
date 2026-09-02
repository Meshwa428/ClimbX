"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
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
// **Everything moves on CSS transitions, not on a JS animation loop.** That is the difference
// between this reading as fluid and reading as jittery, and it is not a matter of taste. There
// are thirty animated boxes here (six stairs × two layers, plus a wrapper and a mark inside
// each of the six front ones). Driven from JS they all get their transforms written every
// frame on the main thread — the same thread as Lenis, the cursor's own rAF, React's render of
// the incoming route, and `router.push` — so any one hitch stutters all thirty at once. As CSS
// transitions on `transform` alone they hand off to the compositor and simply cannot be
// starved by main-thread work. React only ever renders three times per navigation: park, arm,
// leave.
//
// Two layers, and the **dark one is in front**. The point is the order of *values*, not which
// panel happens to be on top: a white page has nowhere to go but straight to near-black in one
// move, and one move is what reads as a slam. Two layers can only soften that if the first one
// to arrive is genuinely light — the previous pair were `#1a1a1a` and `#2c2c2c`, which is two
// near-blacks pretending to be a ramp.
//   • cover  — mid grey sweeps in first, ink lands on it. White → grey → ink.
//   • reveal — ink lifts, exposing the grey still standing, which lifts too. Ink → grey → page.
// So the page darkens in two steps and brightens back in two, and the curtain reads as
// something the page does rather than a sheet dropped on top of it.
//
// The mark rides the ink layer, because a white lockup needs the dark behind it.
// Defined once in globals.css, because the intro loader's curtain uses the same step — two
// copies of a ramp is how the two curtains end up not matching.
const TINT_STEP = "var(--curtain-step)";
// Cast off the grey layer's leading edge. Negative Y because the curtain only ever travels
// upward, so the shadow has to fall ahead of it, onto the page it is about to take. Only the
// grey gets one: the ink rides in front of it, so an ink shadow would land on a surface
// already covered and paint nothing.
const STEP_SHADOW = "0 -14px 34px color-mix(in oklab, var(--color-ink) 38%, transparent)";

const N = 6; // stairs across the width
const COVER_MS = 400;
const REVEAL_MS = 480;
// How far the two layers separate. Wide enough that the grey step is legible before the ink
// covers it — and it can afford to be, because with the light layer *leading* the ragged edge
// between the two combs is grey-over-page, which is the intended step. It was the other way
// round before: dark leading meant that edge was ink over a white page, and it read as chunks
// torn out of the screen.
const COVER_LAG_MS = 150;
const REVEAL_LAG_MS = 150;
// The gap between one stair and the next. This is the knob that makes the staircase read: the
// steps are not a shape, they are the stagger. Raise it for a slower, more deliberate climb;
// at 0 the whole curtain is one flat sheet.
const STEP_LAG_MS = 60;
// A phase is not over until the last, most-delayed column has finished travelling.
const TAIL_MS = (N - 1) * STEP_LAG_MS;
// ponytail: if a navigation hangs, uncover anyway rather than leaving the reader staring at
// a curtain. Generous, because the only cost of being wrong is a slightly late reveal.
const SAFETY_MS = 2000;
// Nav listens for `climbx:navigate` and slides its pill to the new tab optimistically, while
// the curtain climbs over it.
export const NAV_EVENT = "climbx:navigate";

// A quintic ease-out: quick off the mark, then a long even glide into place. The curtain used
// `cubic-bezier(0.83, 0, 0.17, 1)`, which is almost flat at both ends and near-vertical in the
// middle — every column sat still, whipped, and stopped dead. Correct for a wipe that wants to
// feel mechanical, and the single biggest reason this read as jerky rather than fluid.
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
// Accelerating, no landing — the mark is lifting away, not arriving somewhere.
const EASE_LIFT = "cubic-bezier(0.32, 0, 0.67, 0)";

// A floor on the covered state, measured from the moment the page is hidden. Not the empty hold
// this used to have — that one sat on a blank screen, which is what made the transition feel
// long. Now there is a mark up there, and with the route prefetched the push can resolve in a
// frame, which would otherwise land and dismiss the logo in the same breath. Only ever a floor:
// a slow route waits as long as it needs and this costs nothing.
const MIN_COVERED_MS = 280;
// The mark leaves *with* the curtain, not before it — the curtain gets a short head start
// behind it rather than waiting out the mark's whole exit, so the logo is already lifting by
// the time the stairs move.
const MARK_LEAD_MS = 180;
const MARK_RISE = -76; // px it travels on the way out
// Travel and fade run for exactly the same time so the rise never stops before the fade ends.
const MARK_EXIT_MS = 420;

// Rightmost column leads, leftmost trails, on an even beat.
const stepDelay = (i: number) => (N - 1 - i) * STEP_LAG_MS;

// Each column travels its own height: below the fold → covering → off the top. The mark's
// wrapper runs the exact inverse, which is what pins it to the viewport (see below).
const HIDDEN = 100;
const COVERED = 0;
const GONE = -100;

type Phase = "idle" | "cover" | "reveal";

export default function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  // A CSS transition needs the element to have been painted at its starting value first, so the
  // first render parks the curtain below the fold with no transition and the next one arms it.
  const [armed, setArmed] = useState(false);
  const reduce = useReducedMotion();
  const resolveRef = useRef<(() => void) | null>(null);

  // the new route has rendered → the curtain can start climbing off
  useEffect(() => {
    resolveRef.current?.();
    resolveRef.current = null;
  }, [pathname]);

  const run = useCallback(
    async (href: string, target: string) => {
      // Reduced motion: no curtain at all. A 2s cover-and-uncover with the durations zeroed is
      // just a flash, which is the thing the setting exists to avoid.
      if (reduce) {
        window.dispatchEvent(new CustomEvent(NAV_EVENT, { detail: target }));
        router.push(href);
        return;
      }
      window.dispatchEvent(new CustomEvent(NAV_EVENT, { detail: target }));
      setPhase("cover");
      // Two frames: one for React to paint the parked curtain, one to be sure the browser has
      // taken that as the transition's start. One is enough in practice and two costs 16ms.
      await new Promise(requestAnimationFrame);
      await new Promise(requestAnimationFrame);
      setArmed(true);

      // Push the moment the page is *hidden*, which is when the leading layer's last column
      // lands — not when the whole phase ends. The trailing layer is still settling onto an
      // already-covered screen, so the navigation gets that layer lag for free.
      await new Promise((r) => setTimeout(r, COVER_MS + TAIL_MS + COVER_LAG_MS));
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
      await new Promise((r) => setTimeout(r, MARK_LEAD_MS + REVEAL_MS + TAIL_MS + REVEAL_LAG_MS));
      setArmed(false);
      setPhase("idle");
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
  const ms = cover ? COVER_MS : REVEAL_MS;
  const lag = cover ? COVER_LAG_MS : REVEAL_LAG_MS;
  // Parked until armed, so the browser has a start value to transition away from.
  const y = !armed ? HIDDEN : cover ? COVERED : GONE;
  // On the way out the whole curtain gives the mark a head start before it moves.
  const colDelay = (i: number, extra: number) =>
    (cover ? 0 : MARK_LEAD_MS) + extra + stepDelay(i);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[95] overflow-hidden">
      {[
        // back — the grey step: first in, last out
        { tint: TINT_STEP, shadow: STEP_SHADOW, extra: cover ? 0 : lag, mark: false },
        // front — the ink the covered state settles on, and what carries the mark
        { tint: "var(--color-ink)", shadow: "none", extra: cover ? lag : 0, mark: true },
      ].map(({ tint, shadow, extra, mark }) =>
        Array.from({ length: N }, (_, i) => {
          const move = armed ? `transform ${ms}ms ${EASE} ${colDelay(i, extra)}ms` : "none";
          return (
            <div
              key={`${tint}-${i}`}
              className="absolute top-0 h-full overflow-hidden"
              style={{
                backgroundColor: tint,
                boxShadow: shadow,
                left: `${(i * 100) / N}%`,
                width: `${100 / N}%`,
                transform: `translate3d(0, ${y}%, 0)`,
                transition: move,
                willChange: "transform",
              }}
            >
              {mark && (
                // One viewport-wide copy of the lockup per column, pulled back by this column's
                // own offset and clipped to the column, so the six slices tile into one whole
                // logo exactly when the curtain is whole.
                //
                // Its transform is the *inverse* of its column's, which is the trick: the column
                // slides and its copy slides the opposite way by the same amount, so the mark
                // stays pinned to the centre of the viewport while the column travels over it.
                // The curtain then only ever *uncovers* it, strip by strip. Letting the copies
                // ride with their columns tears the lockup into six pieces at six heights.
                <div
                  className="absolute inset-y-0 flex items-center justify-center"
                  style={{
                    left: `-${i * 100}%`,
                    width: `${N * 100}%`,
                    transform: `translate3d(0, ${-y}%, 0)`,
                    transition: move,
                    willChange: "transform",
                  }}
                >
                  {/* The exit is its own layer, because the wrapper above is already busy
                      cancelling the column's travel. Ignores the stagger — six columns, one
                      mark, one exit. */}
                  <div
                    style={{
                      transform: `translate3d(0, ${cover ? 0 : MARK_RISE}px, 0)`,
                      opacity: cover ? 1 : 0,
                      transition: armed
                        ? `transform ${MARK_EXIT_MS}ms ${EASE_LIFT}, opacity ${MARK_EXIT_MS}ms linear`
                        : "none",
                      willChange: "transform, opacity",
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
                  </div>
                </div>
              )}
            </div>
          );
        }),
      )}
    </div>
  );
}
