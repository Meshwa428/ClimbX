"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

// Elastic guitar-string section divider. An SVG quadratic Bezier the cursor drags and shoves,
// which rings back down when the pointer leaves. Custom component: no shadcn/React Bits
// equivalent (RULES.md §1). Respects prefers-reduced-motion (renders as a static line).
//
// Cuberto's `.cb-divider` (cuberto.com/assets/js/bundle.js + their inlined CSS), geometry and
// all — and the geometry is the part we had wrong. Their numbers:
//
//   .cb-divider        height: 1px                       ← the line itself
//   .cb-divider:before top:-1rem; height:2rem            ← the hit band: 20px, pointer:fine only
//   .cb-divider svg    top:-99px; height:200px           ← the drawing box, overflowing both ways
//   path               M0,100 Q x,y w,100                ← rest at y=100, no viewBox (units are px)
//   y = 2*cursorY - 100 ± 50                             ← gain 2 + a side offset
//
// The band is 20px tall, so `2*cursorY - 100` only ever moves ±20 — the bow is essentially the
// constant ±50 offset, gently modulated. Ours ran the same formula over a 104px band, so the
// control point swung ±104 and the string whipped after the cursor across the whole row in
// 0.2s. That is the "too fast, not fluid": the formula was right and the box was wrong. The
// tall SVG is not a hit area, it is only room for the 2s elastic ring to overshoot into.
const BOX = 200; // svg height in px = its user units; rest line sits at BOX/2
const REST = BOX / 2;
const REACH = 20; // the pointer band, centred on the line — everything else is spillover room
const SIDE = 50; // constant shove, signed by which half you entered from

interface GuitarStringProps {
  className?: string;
  /** Line stroke color — solid by default; a divider is a string, not a hairline rule */
  color?: string;
  strokeWidth?: number;
  /** Row height in px — layout air around the line, not the hit area (see REACH) */
  height?: number;
}

// A string between two sections, on the page gutter and the shared measure. Every page needs
// the same wrapper, so it lives next to the string instead of being retyped per page.
export function StringRow({ height = 104 }: { height?: number }) {
  return (
    <div className="bg-white px-6 md:px-16">
      <div className="mx-auto max-w-6xl">
        <GuitarString height={height} strokeWidth={1.5} />
      </div>
    </div>
  );
}

export default function GuitarString({
  className = "",
  color = "var(--color-ink)",
  strokeWidth = 2,
  height = 100,
}: GuitarStringProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hitRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const hit = hitRef.current;
    const path = pathRef.current;
    if (!container || !hit || !path) return;

    const point = { x: container.clientWidth / 2, y: REST };
    const draw = () => {
      path.setAttribute("d", `M 0 ${REST} Q ${point.x} ${point.y} ${container.clientWidth} ${REST}`);
    };
    draw();

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return; // static line

    // Which way the string gets shoved is decided once, by the half you crossed into — not
    // re-derived per move, or it would flip sign as you pass the rest line.
    let side = 0;

    const onMove = (e: MouseEvent) => {
      // Measured against the *drawing box*, not the band: the formula's `100` is the rest
      // line in svg units, so the cursor has to be in those units too.
      const rect = hit.getBoundingClientRect();
      const my = REST + (e.clientY - rect.top - REACH / 2);
      if (!side) side = my < REST ? SIDE : -SIDE;
      point.x = e.clientX - rect.left;
      gsap.to(point, {
        y: 2 * my - REST + side,
        duration: 0.2,
        ease: "power2.out",
        onUpdate: draw,
        overwrite: true,
      });
    };

    // Twang: overshoot rest and ring around it, x recentring on the same curve so the bow
    // unwinds sideways as well as vertically. Long on purpose — the slow ring is what reads
    // as a string rather than a snap.
    const onLeave = () => {
      side = 0;
      gsap.to(point, {
        x: container.clientWidth / 2,
        y: REST,
        duration: 2,
        ease: "elastic.out(1, 0.2)",
        onUpdate: draw,
        overwrite: true,
      });
    };

    const onResize = () => {
      if (!gsap.isTweening(point)) {
        point.x = container.clientWidth / 2;
        point.y = REST;
      }
      draw();
    };

    hit.addEventListener("mousemove", onMove);
    hit.addEventListener("mouseleave", onLeave);
    window.addEventListener("resize", onResize);

    return () => {
      gsap.killTweensOf(point); // a tween still running would draw into a dead path
      hit.removeEventListener("mousemove", onMove);
      hit.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("resize", onResize);
    };
  }, [height]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full select-none ${className}`}
      style={{ height: `${height}px` }}
      aria-hidden="true"
    >
      {/* The band. Narrow, centred, and the only thing that hears the pointer — the svg is
          three times taller purely so the ring has somewhere to overshoot. */}
      <div
        ref={hitRef}
        className="absolute inset-x-0 top-1/2 -translate-y-1/2"
        style={{ height: `${REACH}px` }}
      />
      <svg
        className="pointer-events-none absolute inset-x-0 top-1/2 overflow-visible"
        style={{ height: `${BOX}px`, marginTop: `${-REST}px` }}
      >
        <path
          ref={pathRef}
          d={`M 0 ${REST} Q 500 ${REST} 1000 ${REST}`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
        />
      </svg>
    </div>
  );
}
