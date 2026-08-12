"use client";

import { useEffect, useRef, useCallback } from "react";

// Cuberto-style cursor-following circular video preview. A clipped circle (~320px on desktop)
// that appears on hover over a service row, follows the cursor with a spring-like lag, and
// auto-plays a muted looping video. Disappears on mouse leave with a scale-down.
//
// Custom component: no shadcn/React Bits equivalent (RULES.md §1). Skipped when
// `pointer: coarse` — touch devices have no cursor to follow.
//
// The position is tracked via mousemove on the parent row (not the circle itself, which is
// pointer-events-none). A bare rAF lerp is used for position, same approach as the custom
// cursor (Memory.md) — a CSS transition on transform restarts from the current value on
// every event and snaps short moves, while a lerp eases small and large moves alike.

interface CursorVideoProps {
  /** Path to the video file, e.g. "/videos/services/brand-identity.mp4" */
  src: string;
  /** Diameter of the circle in px */
  size?: number;
}

// Lerp factor — 0.15 gives ~110ms to catch up (faster than cursor dot's 0.28
// but slower than instant, so it trails pleasantly)
const LERP = 0.15;

export default function CursorVideo({ src, size = 320 }: CursorVideoProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  // Current rendered position (CSS pixels, relative to the row)
  const pos = useRef({ x: 0, y: 0 });
  // Target position (where the cursor actually is)
  const target = useRef({ x: 0, y: 0 });
  const active = useRef(false);
  const raf = useRef(0);

  const loop = useCallback(() => {
    raf.current = 0;
    const dx = target.current.x - pos.current.x;
    const dy = target.current.y - pos.current.y;
    // Settle when close enough — park the rAF so it's not running when idle
    if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5 && !active.current) {
      pos.current.x = target.current.x;
      pos.current.y = target.current.y;
      if (wrapRef.current) {
        wrapRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px) scale(0)`;
      }
      return;
    }
    pos.current.x += dx * LERP;
    pos.current.y += dy * LERP;
    if (wrapRef.current) {
      const s = active.current ? 1 : 0;
      wrapRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px) scale(${s})`;
    }
    raf.current = requestAnimationFrame(loop);
  }, []);

  const kick = useCallback(() => {
    if (!raf.current) raf.current = requestAnimationFrame(loop);
  }, [loop]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    // Find the parent row — the component is mounted inside the row's group/row div
    const row = wrap.closest("[data-service-row]") as HTMLElement | null;
    if (!row) return;

    // Skip entirely on touch devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const half = size / 2;

    const onMove = (e: MouseEvent) => {
      const rect = row.getBoundingClientRect();
      // Position relative to the row, centered on the cursor
      target.current.x = e.clientX - rect.left - half;
      target.current.y = e.clientY - rect.top - half;
      kick();
    };

    const onEnter = (e: MouseEvent) => {
      active.current = true;
      // Jump position to cursor immediately on enter so it doesn't lerp in from (0,0)
      const rect = row.getBoundingClientRect();
      pos.current.x = e.clientX - rect.left - half;
      pos.current.y = e.clientY - rect.top - half;
      target.current.x = pos.current.x;
      target.current.y = pos.current.y;
      // Play video
      videoRef.current?.play().catch(() => {});
      kick();
    };

    const onLeave = () => {
      active.current = false;
      // Pause video
      videoRef.current?.pause();
      kick();
    };

    row.addEventListener("mousemove", onMove, { passive: true });
    row.addEventListener("mouseenter", onEnter);
    row.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(raf.current);
      row.removeEventListener("mousemove", onMove);
      row.removeEventListener("mouseenter", onEnter);
      row.removeEventListener("mouseleave", onLeave);
    };
  }, [size, kick]);

  return (
    <div
      ref={wrapRef}
      className="pointer-events-none absolute left-0 top-0 z-10 overflow-hidden rounded-full"
      style={{
        width: size,
        height: size,
        transform: "translate(0px, 0px) scale(0)",
        transition: "transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)",
        willChange: "transform",
      }}
      aria-hidden="true"
    >
      <video
        ref={videoRef}
        src={src}
        muted
        loop
        playsInline
        preload="metadata"
        className="h-full w-full object-cover"
      />
    </div>
  );
}
