"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

// Route changes run through document.startViewTransition so the ink "straps" keyframes
// in globals.css (::view-transition-old/new(root)) can play: old page eaten by the
// staircase closing, ink fill, new page released as it opens.
// Driving the browser API directly (instead of React's <ViewTransition>) keeps the
// animation on the `root` snapshot, which is viewport-sized — the straps polygons are
// viewport percentages, so any other snapshot box would distort them.
// Browsers without the API just navigate normally.
const SAFETY_MS = 2000;
// Head start so the nav pill finishes sliding to the new tab *before* the straps close
// over it. Nav listens for `climbx:navigate` and moves optimistically.
export const NAV_EVENT = "climbx:navigate";
const NAV_LEAD_MS = 340;

export default function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const resolveRef = useRef<(() => void) | null>(null);

  // the new route has rendered → let the transition swap to the enter half
  useEffect(() => {
    resolveRef.current?.();
    resolveRef.current = null;
  }, [pathname]);

  useEffect(() => {
    if (typeof document.startViewTransition !== "function") return;

    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement | null)?.closest?.("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download") || a.hasAttribute("data-no-transition")) return;

      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname) return; // same page / hash link — leave it alone

      // Capture phase: next/link preventDefaults in its own handler, so by the bubble
      // phase every click looks already-handled. Stop it here so Link never navigates
      // twice — this listener owns the push.
      e.preventDefault();
      e.stopPropagation();

      const href = url.pathname + url.search + url.hash;
      window.dispatchEvent(new CustomEvent(NAV_EVENT, { detail: url.pathname }));
      router.prefetch(url.pathname);

      setTimeout(() => {
        document.startViewTransition(
          () =>
            new Promise<void>((resolve) => {
              // ponytail: timeout so a failed/slow navigation can't wedge the overlay open.
              const t = setTimeout(resolve, SAFETY_MS);
              resolveRef.current = () => {
                clearTimeout(t);
                resolve();
              };
              router.push(href);
            }),
        );
      }, NAV_LEAD_MS);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  return null;
}
