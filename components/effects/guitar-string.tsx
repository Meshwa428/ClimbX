"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { repelTarget } from "@/lib/strings";

// Elastic guitar-string section divider (Cuberto-inspired). An SVG quadratic Bézier line the
// cursor **pushes away** — a string above the pointer bows further up, one below bows further
// down — then snaps back with a damped elastic oscillation when the pointer leaves, like a
// plucked string. Custom component: no shadcn/React Bits equivalent (RULES.md §1).
// Respects prefers-reduced-motion (renders as a static line).
//
// It used to tween the control point straight onto the cursor, which read as the string being
// stuck to the pointer and dragged around. Repelling is the physical behaviour: a real string
// gets shoved out of the way, it never follows your hand. Shared with the easter egg overlay
// (components/effects/strings.tsx) via `lib/strings.js` — check: node scripts/check-strings.mjs.
interface GuitarStringProps {
  className?: string;
  /** Line stroke color — solid by default; a divider is a string, not a hairline rule */
  color?: string;
  strokeWidth?: number;
  /** Total hit-area height in px */
  height?: number;
}

export default function GuitarString({
  className = "",
  color = "var(--color-ink)",
  strokeWidth = 2,
  height = 100,
}: GuitarStringProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  // Resting Y sits at the vertical center of the hit area
  const defaultY = height / 2;
  const point = useRef({ x: 500, y: defaultY });
  const hovered = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    const path = pathRef.current;
    if (!container || !path) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const draw = () => {
      const w = container.clientWidth;
      path.setAttribute(
        "d",
        `M 0 ${defaultY} Q ${point.current.x} ${point.current.y} ${w} ${defaultY}`,
      );
    };

    // Initialise at center
    point.current.x = container.clientWidth / 2;
    draw();

    if (reduce) return; // static line, no interaction

    // How far the string bows at point-blank, and how far up/down the pointer is felt. Reach
    // is the whole hit area, not half of it, so a string is already bending before the cursor
    // is on top of it — the push then peaks right as they meet.
    const push = height * 0.55;
    const reach = height;
    // Which side of the string the cursor was on last frame. Crossing it *is* the pluck.
    let side = 0;

    // Twang: overshoot the target and ring around it. `elastic.out(amplitude, period)` —
    // a short period is what makes it read as a string rather than a rubber band.
    const twang = (y: number) =>
      gsap.to(point.current, {
        y,
        duration: 1.6,
        ease: "elastic.out(1, 0.16)",
        onUpdate: draw,
        overwrite: "auto",
      });

    const onMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      point.current.x = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      // A quadratic's midpoint is only a quarter of the way to its control point, so the
      // control sits at 2x the displacement we actually want to see.
      const target = defaultY + repelTarget(defaultY, py, reach, push) * 2;
      const now = Math.sign(py - defaultY) || side;

      if (side && now !== side) {
        side = now;
        return void twang(target); // pushed through — let it ring on the far side
      }
      side = now;

      // Tracking the cursor is a chase, not a spring: an elastic tween restarted on every
      // mousemove would fight itself and read as jitter.
      gsap.to(point.current, {
        y: target,
        duration: 0.18,
        ease: "power2.out",
        onUpdate: draw,
        overwrite: "auto",
      });
    };

    const onEnter = () => {
      hovered.current = true;
    };

    const onLeave = () => {
      hovered.current = false;
      side = 0;
      twang(defaultY); // released — ring back to rest
    };

    const onResize = () => {
      if (!hovered.current) {
        point.current.x = container.clientWidth / 2;
        point.current.y = defaultY;
      }
      draw();
    };

    container.addEventListener("mousemove", onMove);
    container.addEventListener("mouseenter", onEnter);
    container.addEventListener("mouseleave", onLeave);
    window.addEventListener("resize", onResize);

    const pt = point.current;
    return () => {
      gsap.killTweensOf(pt); // a tween still running would draw into a dead path
      container.removeEventListener("mousemove", onMove);
      container.removeEventListener("mouseenter", onEnter);
      container.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("resize", onResize);
    };
  }, [defaultY, height]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full select-none ${className}`}
      style={{ height: `${height}px` }}
      aria-hidden="true"
    >
      <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
        <path
          ref={pathRef}
          d={`M 0 ${defaultY} Q 500 ${defaultY} 1000 ${defaultY}`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
        />
      </svg>
    </div>
  );
}
