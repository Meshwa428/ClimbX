"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { cubicBezier } from "@/lib/ease";

// The page scrolls on the same curve every other transition on the site uses
// (`--ease-out`, Design.md §5). Check: `node scripts/check-ease.mjs`.
const EASE = cubicBezier(0.16, 1, 0.3, 1);

// One Lenis instance for the whole app (Architecture.md — never run a second one; any
// component that ships its own must be told to reuse this). Mounted in the root layout,
// so every route gets it.
export default function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return; // native scroll

    const lenis = new Lenis({
      // Duration + easing rather than `lerp`: lerp chases a moving target at a fixed rate,
      // so one wheel notch decays exponentially and never reads as a deliberate movement.
      // With a duration each notch is its own eased run, which is what a single scroll
      // should feel like — a fast departure and a long settle.
      duration: 1.25,
      easing: EASE, // the literal `--ease-out` token, not an approximation of it
      smoothWheel: true,
      wheelMultiplier: 0.9, // slightly shorter throw; the longer easing covers the distance
      touchMultiplier: 1.6, // touch keeps native inertia; this only tunes drag distance
    });

    let raf = 0;
    const frame = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  // route change → start the new page at the top, without a smooth scroll-back
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
