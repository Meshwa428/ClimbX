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

    // We want the string to feel highly reactive and repulsive.
    // - reach = height * 0.7 ensures the string starts reacting the moment the cursor enters
    //   the container bounds, eliminating any dead zones at the edges.
    // - push = height * 0.38 allows for a more tactile, deep bend.
    // - LIMIT = push * 1.8 allows the string to bow further before snapping and releasing.
    const reach = height * 0.7;
    const push = height * 0.38;
    // The bow maxes out at `push * 2` (the control point sits at twice the apex), so a limit
    // of 1.8 leaves a 10% window — the cursor had to land within ~2px of the line or the
    // string never let go at all, it just stayed glued to the pointer. 1.25 releases once the
    // cursor is inside ~13px, which is a pluck you can actually perform.
    const LIMIT = push * 1.25;
    // While it is ringing the cursor is not holding it any more, so tracking is off. That is
    // the whole trick: track → snap → ring → track again. The flag is cleared from the ring's
    // `onComplete` — the instant the string stops moving it can be grabbed again, with no
    // timer to guess at. (It must not be cleared from `onUpdate` by reading the tween: that
    // reference runs before the variable is assigned and the string stays dead for good.)
    let ringing = false;

    // Twang: overshoot rest and ring around it. `elastic.out(amplitude, period)` — a short
    // period is what makes it read as a string rather than a rubber band.
    //
    // `elastic.out(1.3, 0.22)` is a pronounced vibration, and its tail is inaudibly small long
    // before the tween's 0.95s is up. So the lock is not a timer and not the tween's length:
    // it lifts the frame the string has actually **stopped moving** — sitting on its rest line
    // and barely travelling between frames. Both tests are needed; at a zero crossing it is on
    // the rest line at full speed, which is the opposite of settled.
    const twang = () => {
      ringing = true;
      let prev = point.current.y;
      gsap.to(point.current, {
        y: defaultY,
        duration: 0.95,
        ease: "elastic.out(1.3, 0.22)",
        overwrite: "auto",
        onUpdate: () => {
          draw();
          const y = point.current.y;
          if (Math.abs(y - defaultY) < 0.5 && Math.abs(y - prev) < 0.15) ringing = false;
          prev = y;
        },
        onComplete: () => {
          ringing = false; // backstop, in case the tween is cut short before it settles
        },
      });
    };

    const onMove = (e: MouseEvent) => {
      if (ringing) return; // still swinging — a chase here would cut the note short
      const rect = container.getBoundingClientRect();
      point.current.x = e.clientX - rect.left;
      // A quadratic's midpoint is only a quarter of the way to its control point, so the
      // control sits at 2x the displacement we actually want to see.
      const target = defaultY + repelTarget(defaultY, e.clientY - rect.top, reach, push) * 2;

      if (Math.abs(target - defaultY) >= LIMIT) return twang(); // stretched too far — released

      // Tracking the cursor is a chase, not a spring: an elastic tween restarted on every
      // mousemove would fight itself and read as jitter.
      // Reduced duration to 0.1s and sharpened ease to power3.out to make it feel super reactive.
      gsap.to(point.current, {
        y: target,
        duration: 0.1,
        ease: "power3.out",
        onUpdate: draw,
        overwrite: "auto",
      });
    };

    const onEnter = () => {
      hovered.current = true;
    };

    const onLeave = () => {
      hovered.current = false;
      twang(); // walked away with it still bent — same release
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
