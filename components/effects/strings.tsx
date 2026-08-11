"use client";

import { useEffect, useRef, useState } from "react";
import { REACH, repelTarget, stepString } from "@/lib/strings";

// Easter egg — type "climb" anywhere on the site and six guitar strings drop across the
// viewport. The pointer pushes them apart and they twang back. Escape (or typing the word
// again) puts them away.
//
// ponytail: 2D canvas, one rAF, no dep and no sound. Physics lives in `lib/strings.js` so
// `node scripts/check-strings.mjs` can run it.
const CODE = "climb";
const COUNT = 6;
// Real strings run thin-to-thick; drawing them all at one weight reads as a barcode.
const GAUGE = [1.1, 1.4, 1.8, 2.3, 2.9, 3.6];

export default function Strings() {
  const [on, setOn] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null);

  // The trigger. Never fires while the reader is typing into the contact form, and never on
  // a device with no keyboard to type it with.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let typed = "";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return setOn(false);
      const el = e.target as HTMLElement | null;
      if (el?.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el?.tagName ?? "")) return;
      if (e.metaKey || e.ctrlKey || e.altKey || e.key.length !== 1) return;
      typed = (typed + e.key.toLowerCase()).slice(-CODE.length);
      if (typed === CODE) {
        typed = "";
        setOn((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const el = canvas.current;
    if (!on || !el) return;
    const ctx = el.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      el.width = w * dpr;
      el.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();

    // d = current offset from rest, v = velocity, cx = where along the string the bend sits
    const strings = Array.from({ length: COUNT }, () => ({ d: 0, v: 0, cx: w / 2 }));
    // Off-screen until the pointer moves, so nothing is bent on arrival.
    const pointer = { x: -9999, y: -9999 };
    const onMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
    };
    // `pointerleave` on the root element, not `pointerout` on window: pointerout bubbles from
    // every element the pointer crosses, so it would fire constantly mid-page and mute the
    // strings. This one only fires when the pointer actually leaves the document.
    const onLeave = () => {
      pointer.y = -9999; // out of reach → every target falls to 0 → they all ring out
    };

    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(3, (now - last) / 16.667); // frames, clamped over a tab switch
      last = now;
      ctx.clearRect(0, 0, w, h);
      // Solid white on `difference`: opaque over the white sections *and* the ink blocks,
      // without a per-section colour or any transparency to wash them out.
      ctx.strokeStyle = "#fff";
      ctx.lineCap = "round";

      const gap = h / (COUNT + 1);
      strings.forEach((s, i) => {
        const y = gap * (i + 1);
        stepString(s, repelTarget(y, pointer.y), dt);
        // The bend chases the cursor's x only while the cursor is near this string —
        // otherwise it stays where it was plucked, which is where it should ring out.
        if (Math.abs(y - pointer.y) < REACH) s.cx += (pointer.x - s.cx) * 0.2 * dt;

        ctx.beginPath();
        ctx.lineWidth = GAUGE[i];
        ctx.moveTo(0, y);
        // A quadratic's midpoint is a quarter of the way to its control point, so the
        // control sits at 2× the displacement to make the curve peak at exactly `d`.
        ctx.quadraticCurveTo(s.cx, y + s.d * 2, w, y);
        ctx.stroke();
      });
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", size);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", size);
    };
  }, [on]);

  if (!on) return null;
  return (
    // The blended canvas and the label are siblings, not nested: a wrapper with a z-index is
    // its own stacking context, and `mix-blend-mode` inside one blends against *it* (nothing)
    // instead of against the page — the strings came out white on a white page.
    <div aria-hidden className="contents">
      <canvas
        ref={canvas}
        className="pointer-events-none fixed inset-0 z-[70] h-full w-full mix-blend-difference"
      />
      <span className="pointer-events-none fixed bottom-6 right-6 z-[70] rounded-full bg-ink/80 px-4 py-2 font-accent text-[10px] uppercase tracking-[0.3em] text-white">
        esc
      </span>
    </div>
  );
}
