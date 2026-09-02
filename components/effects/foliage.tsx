"use client";

import { useEffect, useRef } from "react";
import { BOX, LEAVES, leafHeight } from "@/lib/foliage";

// Foliage — leaves flanking the mascot that scatter away from the pointer and drift back.
//
// No artwork: a leaf is a box with two opposite corners squared and two fully rounded, which
// gives a lens whose points sit on the box's diagonal. Elongated (aspect 0.56) it reads as a
// leaf; near-square it reads as a petal, which is what the first pass shipped.
//
// **Placement lives in `lib/foliage.js`: scattered from a seed, not placed by hand.** Six
// hand-authored positions came out as a mirrored pair of clusters that read as a laurel wreath —
// the eye finds that symmetry immediately. Positions are now rejection-sampled from a seeded
// PRNG, so the arrangement is irregular while the constraints hold by construction, and
// `node scripts/check-foliage.mjs` asserts them: no two leaves overlap, none sits under the
// mascot, and the scatter actually placed them all. Overlap is tested as circles of
// half-the-diagonal, because the leaves rotate and a 60° turn makes a 46×82 leaf 94px wide.
// Positions are *centres* with negative margins, so changing a leaf's size no longer moves it.
//
// Motion is split across two elements on purpose, the same way the mascot splits gaze from
// blink: the anchor takes the pointer repel (JS, transform) and the leaf inside takes the idle
// sway (CSS, transform). One element cannot hold two independent transforms, and split this way
// the idle never stops to let the repel happen — they compose.
//
// The repel loop follows the same rules as everything else here: one rAF for all six leaves, it
// parks the moment they have all settled, geometry is cached rather than measured per pointer
// move, and an IntersectionObserver stops it off-screen. Touch and reduced motion never start it.
const PUSH = 48; // px a leaf is shoved at the very centre of the pointer
const RADIUS = 240; // px of influence — outside this a leaf is left alone
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
    <div
      ref={root}
      aria-hidden
      className={`pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${className}`}
      style={{ width: BOX.w, height: BOX.h }}
    >
      {LEAVES.map(([cx, cy, w, rot, flip, secs, delay], i) => {
        const h = leafHeight(w);
        return (
          <span
            key={i}
            data-leaf
            className="leaf-anchor"
            // Centre, not corner: the negative margins put the leaf's middle on (cx, cy), so a
            // size change no longer drags it somewhere else.
            style={{ left: cx, top: cy, width: w, height: h, marginLeft: -w / 2, marginTop: -h / 2 }}
          >
            <span
              className="leaf"
              style={{
                ["--rot" as string]: `${rot}deg`,
                ["--flip" as string]: flip,
                animationDuration: `${secs}s`,
                animationDelay: `${delay}s`,
              }}
            />
          </span>
        );
      })}
    </div>
  );
}
