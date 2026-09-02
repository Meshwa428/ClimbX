"use client";

import { useEffect, useRef } from "react";

// A small blob that watches the pointer. The idea is lifted from jeremy-prt/bloub; none of the
// machinery is — that project is a Vue app with a pose engine, fifteen states and montage
// playback, and what actually reads on screen is a rounded shape with two eyes that follow you.
//
// So: no SVG file, no canvas, no dependency. The body is a `<div>` with lopsided
// `border-radius` percentages, which is what makes an organic silhouette without an asset to
// hand-author (RULES.md §10) or download. Idle life is CSS keyframes on `transform` only, so it
// runs on the compositor and costs a low-end phone nothing even while it is on screen.
//
// The one thing that has to be JS is the gaze, and it is written to be the cheapest possible
// version of itself:
//   • one rAF, shared by both eyes, which parks itself the moment they catch up
//   • the loop writes two CSS custom properties on one element — the eyes read them, so the
//     number of style writes does not grow with the number of things that move
//   • no `getBoundingClientRect` in the pointer handler. That is a forced layout on every
//     mouse move; instead the rect is cached and re-read at most once per frame, and only
//     after a scroll or resize has actually invalidated it
//   • an IntersectionObserver stops the loop outright when the mascot is off screen
//
// Touch devices have no pointer to follow, so they get the idle animation alone, and reduced
// motion gets a still blob. Neither path starts the loop at all.
//
// TODO(content): this is a placeholder built from brand tokens, not a brand asset. A real
// mascot should be designed and signed off (CLAUDE.md — never invent brand assets); the
// component takes whatever shape and colours that lands on.
const MAX_GAZE = 14; // px an eye travels from centre at full deflection
// Shorter than it was, so full deflection arrives while the pointer is still near the mascot
// rather than only once it is most of a screen away. Doubling the travel alone would still have
// read as subtle, because most of the time the pointer never got far enough to earn it.
const GAZE_REACH = 190; // px of pointer distance that counts as "fully looking at you"
const LERP = 0.14; // per-frame catch-up — the eyes trail the pointer rather than snapping
const SETTLED = 0.05; // px; below this the loop parks instead of burning frames on nothing

export default function Mascot({ className = "" }: { className?: string }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    // No pointer to follow, or motion is unwelcome: the CSS idle keeps running (or doesn't,
    // under reduced motion — see globals.css) and none of this ever starts.
    if (window.matchMedia("(prefers-reduced-motion: reduce), (pointer: coarse)").matches) return;

    let px = -1e5; // last pointer position, in client coords
    let py = -1e5;
    let cx = 0; // where the eyes currently are
    let cy = 0;
    let raf = 0;
    let onScreen = false;
    // Cached geometry. Re-read only when something could have moved it.
    let box = el.getBoundingClientRect();
    let stale = false;

    const loop = () => {
      if (stale) {
        box = el.getBoundingClientRect();
        stale = false;
      }
      const dx = px - (box.left + box.width / 2);
      const dy = py - (box.top + box.height / 2);
      const dist = Math.hypot(dx, dy) || 1;
      // Look further the further away the pointer is, up to the full deflection. Close in, the
      // eyes barely move — otherwise they twitch wildly whenever the pointer is right on top.
      const pull = Math.min(1, dist / GAZE_REACH) * MAX_GAZE;
      const tx = (dx / dist) * pull;
      const ty = (dy / dist) * pull;

      cx += (tx - cx) * LERP;
      cy += (ty - cy) * LERP;
      el.style.setProperty("--gx", cx.toFixed(2));
      el.style.setProperty("--gy", cy.toFixed(2));

      if (Math.abs(tx - cx) < SETTLED && Math.abs(ty - cy) < SETTLED) {
        raf = 0; // caught up — nothing to do until the pointer moves again
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    const wake = () => {
      if (!raf && onScreen) raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      wake();
    };
    const invalidate = () => {
      stale = true;
      wake();
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        if (onScreen) {
          stale = true;
          wake();
        } else if (raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      },
      { rootMargin: "120px" },
    );
    io.observe(el);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", invalidate, { passive: true });
    window.addEventListener("resize", invalidate, { passive: true });
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", invalidate);
      window.removeEventListener("resize", invalidate);
    };
  }, []);

  return (
    <div ref={root} aria-hidden className={`mascot ${className}`}>
      {/* body — the bob lives here, on transform alone, so the silhouette below never repaints */}
      <div className="mascot-body">
        <div className="mascot-skin" />
        <div className="mascot-eyes">
          {/* the blink is a scaleY on the eye itself; the gaze is a translate on their shared
              parent, so the two never fight over one transform */}
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}
