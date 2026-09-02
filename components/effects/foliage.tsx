"use client";

import { useEffect, useRef } from "react";

// Foliage — a cluster of leaves the mascot sits in, that scatter away from the pointer and
// drift back.
//
// Still no artwork: a leaf is a box with two opposite corners squared and two fully rounded,
// which gives a lens whose points sit on the box's diagonal. Three things make that read as a
// leaf rather than the blob it was:
//   • it is *elongated* (a near-square lens is a petal, or nothing)
//   • it has a midrib, drawn as a hairline gradient along the same diagonal the points are on,
//     so no rotation maths is needed to line it up with the shape
//   • it is small enough to be foliage rather than scenery
//
// Motion is split across two elements on purpose, the same way the mascot splits gaze from
// blink: the anchor takes the pointer repel (JS, transform) and the leaf inside takes the idle
// sway (CSS, transform). One element cannot hold two independent transforms, and this way the
// idle never stops to let the repel happen — they compose.
//
// The repel loop follows the same rules as everything else here: one rAF for all six leaves, it
// parks the moment they have all settled, geometry is cached rather than measured per move, and
// an IntersectionObserver stops it off-screen. Touch and reduced motion never start it.

// [left%, top%, width% of the box, base rotation, sway seconds, sway delay]
const LEAVES: [number, number, number, number, number, number][] = [
  [4, 40, 15, -34, 9, 0],
  [17, 12, 12, -12, 11, 1.3],
  [28, 66, 10, -56, 8, 2.6],
  [66, 60, 11, 128, 10.5, 0.7],
  [78, 16, 14, 160, 9.5, 1.9],
  [90, 46, 9, 112, 12, 3.2],
];

const PUSH = 34; // px a leaf is shoved at the very centre of the pointer
const RADIUS = 190; // px of influence — outside this a leaf is left alone
const SPRING = 0.1; // per-frame approach, used both ways: shove out and drift back
const SETTLED = 0.15; // px; below this the loop parks

export default function Foliage({ className = "" }: { className?: string }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce), (pointer: coarse)").matches) return;

    const anchors = Array.from(el.querySelectorAll<HTMLElement>("[data-leaf]"));
    if (!anchors.length) return;

    let px = -1e5;
    let py = -1e5;
    let raf = 0;
    let onScreen = false;
    let stale = true;
    // Where each leaf sits, and how far it is currently displaced.
    let centres: { x: number; y: number }[] = [];
    const off = anchors.map(() => ({ x: 0, y: 0 }));

    const loop = () => {
      if (stale) {
        centres = anchors.map((a, i) => {
          const r = a.getBoundingClientRect();
          // The rect includes the current displacement, so back it out — otherwise a leaf that
          // has been pushed measures its own shoved position as home and never comes back.
          return { x: r.left + r.width / 2 - off[i].x, y: r.top + r.height / 2 - off[i].y };
        });
        stale = false;
      }

      let moving = false;
      for (let i = 0; i < anchors.length; i++) {
        const c = centres[i];
        const dx = c.x - px;
        const dy = c.y - py;
        const dist = Math.hypot(dx, dy) || 1;
        // Falls off with distance and points *away* from the pointer.
        const force = dist < RADIUS ? ((RADIUS - dist) / RADIUS) * PUSH : 0;
        const tx = (dx / dist) * force;
        const ty = (dy / dist) * force;

        const o = off[i];
        o.x += (tx - o.x) * SPRING;
        o.y += (ty - o.y) * SPRING;
        anchors[i].style.transform = `translate3d(${o.x.toFixed(2)}px, ${o.y.toFixed(2)}px, 0)`;
        if (Math.abs(tx - o.x) > SETTLED || Math.abs(ty - o.y) > SETTLED) moving = true;
      }

      // Keep running while anything is still travelling — the drift home is half the effect, so
      // the loop must outlive the pointer leaving rather than stopping with it.
      raf = moving ? requestAnimationFrame(loop) : 0;
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
        if (onScreen) invalidate();
        else if (raf) {
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
    <div ref={root} aria-hidden className={`pointer-events-none absolute inset-0 ${className}`}>
      {LEAVES.map(([left, top, width, rot, secs, delay], i) => (
        <span
          key={i}
          data-leaf
          className="leaf-anchor"
          style={{ left: `${left}%`, top: `${top}%`, width: `${width}%` }}
        >
          <span
            className="leaf"
            style={{
              ["--rot" as string]: `${rot}deg`,
              animationDuration: `${secs}s`,
              animationDelay: `${delay}s`,
            }}
          />
        </span>
      ))}
    </div>
  );
}
