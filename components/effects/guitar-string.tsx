"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

// Elastic guitar-string section divider (Cuberto-inspired). An SVG Quadratic
// Bézier line that follows the cursor when hovered and snaps back with a
// damped spring oscillation when the pointer leaves — like plucking a guitar
// string. Custom component: no shadcn/React Bits equivalent (RULES.md §1).
// Respects prefers-reduced-motion (renders as a static line).
interface GuitarStringProps {
  className?: string;
  /** Line stroke color — defaults to subtle ink border */
  color?: string;
  strokeWidth?: number;
  /** Total hit-area height in px */
  height?: number;
}

export default function GuitarString({
  className = "",
  color = "rgba(26, 26, 26, 0.15)",
  strokeWidth = 1,
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

    const onMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      point.current.x = e.clientX - rect.left;

      gsap.to(point.current, {
        y: e.clientY - rect.top,
        duration: 0.15,
        ease: "power1.out",
        onUpdate: draw,
        overwrite: "auto",
      });
    };

    const onEnter = () => {
      hovered.current = true;
    };

    const onLeave = () => {
      hovered.current = false;

      // Pluck — damped harmonic oscillation back to rest
      gsap.to(point.current, {
        y: defaultY,
        duration: 1.4,
        ease: "elastic.out(1.2, 0.18)",
        onUpdate: draw,
      });
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

    return () => {
      container.removeEventListener("mousemove", onMove);
      container.removeEventListener("mouseenter", onEnter);
      container.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("resize", onResize);
    };
  }, [defaultY]);

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
