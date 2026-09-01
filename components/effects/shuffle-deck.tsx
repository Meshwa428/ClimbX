"use client";

import { useEffect, useRef } from "react";

// Shuffle deck: a 4-slot queue that cycles BACK → SAT_A → CENTER → SAT_B → BACK.
//   • CENTER  — focused card (sharp, largest, on top)
//   • SAT_A/B — two blurred satellites (upper-left / lower-right) orbiting circularly
//   • BACK    — a small card behind the others; the NEXT deck image enters here and
//               grows forward, so images arrive from the back instead of swapping in
//               place. Recycling happens only at BACK (hidden). Orbit is continuous;
//               each role change eases on an in-out cubic-bezier (slow → fast → slow).
// Fully opaque. Any-size deck cycles through 4 slots.
export type ShuffleItem = { src: string; alt?: string };
const SLOTS = 4;

type S = { x: number; y: number; s: number; b: number };

// Cubic-bezier easing: easing(x) → y for control points (x1,y1,x2,y2).
function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const dX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (x: number) => {
    let t = x;
    for (let i = 0; i < 6; i++) {
      const d = sampleX(t) - x;
      const slope = dX(t);
      if (Math.abs(slope) < 1e-6) break;
      t -= d / slope;
    }
    return sampleY(Math.min(1, Math.max(0, t)));
  };
}

export default function ShuffleDeck({
  items,
  rx = 178,
  ry = 150,
  orbitSpeed = 0.5, // rad / sec (satellites circle)
  swapEvery = 2.6, // sec between role rotations
  swapDur = 0.85, // sec — length of the ease-in-out transition
  cardW = 232,
  cardH = 286,
  focusScale = 1.16,
  satScale = 0.72,
  backScale = 0.42,
  maxBlur = 8,
  className = "",
}: {
  items: ShuffleItem[];
  rx?: number;
  ry?: number;
  orbitSpeed?: number;
  swapEvery?: number;
  swapDur?: number;
  cardW?: number;
  cardH?: number;
  focusScale?: number;
  satScale?: number;
  backScale?: number;
  maxBlur?: number;
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);

  useEffect(() => {
    const n = items.length;
    if (!n) return;
    const ease = cubicBezier(0.76, 0, 0.24, 1); // slow → fast → slow

    // State for a given queue position (0 BACK, 1 SAT_A, 2 CENTER, 3 SAT_B).
    const slotState = (seq: number, orbit: number): S => {
      switch (seq) {
        case 2:
          return { x: 0, y: 0, s: focusScale, b: 0 }; // CENTER
        case 1: {
          const a = orbit + (5 * Math.PI) / 4; // SAT_A upper-left
          return { x: Math.cos(a) * rx, y: Math.sin(a) * ry, s: satScale, b: maxBlur };
        }
        case 3: {
          const a = orbit + Math.PI / 4; // SAT_B lower-right
          return { x: Math.cos(a) * rx, y: Math.sin(a) * ry, s: satScale, b: maxBlur };
        }
        default:
          return { x: 82, y: 22, s: backScale, b: 5 }; // BACK — small, behind
      }
    };
    const target = (i: number, tick: number, orbit: number) =>
      slotState((i + tick) % SLOTS, orbit);

    // Transform is composited and cheap per frame. `filter: blur()` and z-index are not —
    // each write re-rasterizes the card, so only touch them when the value actually moves.
    const lastBlur: number[] = Array(SLOTS).fill(NaN);
    const lastZ: number[] = Array(SLOTS).fill(NaN);
    const apply = (el: HTMLDivElement, c: S, i = -1) => {
      el.style.transform = `translate(-50%, -50%) translate(${c.x.toFixed(1)}px, ${c.y.toFixed(
        1,
      )}px) scale(${c.s.toFixed(3)})`;
      const blur = Math.round(c.b * 4) / 4; // quarter-pixel steps — invisible, ~4x fewer rasters
      const z = Math.round(c.s * 100); // biggest (focus) on top, BACK lowest
      if (i < 0 || lastBlur[i] !== blur) {
        el.style.filter = blur ? `blur(${blur}px)` : "none";
        if (i >= 0) lastBlur[i] = blur;
      }
      if (i < 0 || lastZ[i] !== z) {
        el.style.zIndex = String(z);
        if (i >= 0) lastZ[i] = z;
      }
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      for (let i = 0; i < SLOTS; i++) {
        const el = cardRefs.current[i];
        if (el) apply(el, target(i, 0, 0));
      }
      return;
    }

    let next = SLOTS % n;
    let prevTick = 0;
    let raf = 0;
    // Deferred recycle: swap the image only once the card has fully receded to BACK.
    let pending: { card: number; at: number } | null = null;
    const start = performance.now();
    let swapStartMs = start - swapDur * 1000; // begin settled (offset weight = 0)

    const frame = (now: number) => {
      const el0 = (now - start) / 1000;
      const orbit = el0 * orbitSpeed;
      const tick = Math.floor(el0 / swapEvery);

      if (tick !== prevTick) {
        prevTick = tick;
        swapStartMs = now;
        // Schedule the recycle for the card entering BACK (seq 0), to fire when it has
        // reached the back (small + hidden) — never while it's still a visible satellite.
        pending = { card: (SLOTS - (tick % SLOTS)) % SLOTS, at: now + swapDur * 1000 };
      }

      if (pending && now >= pending.at) {
        const im = imgRefs.current[pending.card];
        if (im) im.src = items[next % n].src;
        next++;
        pending = null;
      }

      const w = 1 - ease(Math.min(1, (now - swapStartMs) / (swapDur * 1000))); // 1 → 0
      for (let i = 0; i < SLOTS; i++) {
        const el = cardRefs.current[i];
        if (!el) continue;
        // Blend the card's *outgoing* role into its incoming one, with both sampled at the
        // live orbit angle. The previous pass froze the outgoing position at the moment the
        // swap began and decayed a fixed offset — so the instant a role change started, the
        // two cards involved stopped orbiting and slid down a straight line instead. Sampling
        // both ends every frame means a card recedes to BACK *along the arc it was already
        // travelling*, and the one coming forward keeps circling as it grows. The orbit never
        // pauses for the swap; it carries it.
        const to = target(i, tick, orbit);
        const from = w > 0 ? target(i, tick - 1, orbit) : to;
        apply(
          el,
          {
            x: to.x + (from.x - to.x) * w,
            y: to.y + (from.y - to.y) * w,
            s: to.s + (from.s - to.s) * w,
            b: to.b + (from.b - to.b) * w,
          },
          i,
        );
      }
      raf = requestAnimationFrame(frame);
    };

    // The deck is a hero ornament, but the loop it ran was global: four blurred, z-ordered
    // cards rewritten 60 times a second for the whole visit, including every screen where the
    // hero is a thousand pixels above the fold. Nothing else on the page was paying for
    // itself that way. Pause it off-screen — the orbit is a function of elapsed time, so it
    // resumes where it would have been rather than where it stopped.
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (!raf) raf = requestAnimationFrame(frame);
        } else if (raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      },
      { rootMargin: "200px" },
    );
    if (rootRef.current) io.observe(rootRef.current);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [items, rx, ry, orbitSpeed, swapEvery, swapDur, focusScale, satScale, backScale, maxBlur]);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      {Array.from({ length: SLOTS }).map((_, k) => (
        <div
          key={k}
          ref={(el) => {
            cardRefs.current[k] = el;
          }}
          className="absolute left-1/2 top-1/2 will-change-transform"
          style={{ width: cardW, height: cardH }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={(el) => {
              imgRefs.current[k] = el;
            }}
            src={items[k % items.length]?.src}
            alt=""
            width={cardW}
            height={cardH}
            className="h-full w-full rounded-2xl object-cover shadow-[0_25px_60px_rgba(26,26,26,0.28)]"
          />
        </div>
      ))}
    </div>
  );
}
