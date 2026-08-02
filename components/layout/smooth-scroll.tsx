"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { usePathname } from "next/navigation";

// One Lenis instance for the whole app (Architecture.md — never run a second one; any
// component that ships its own must be told to reuse this). Mounted in the root layout,
// so every route gets it.
export default function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return; // native scroll

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => 1 - Math.pow(1 - t, 3), // ease-out cubic — matches the house curve
      smoothWheel: true,
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
