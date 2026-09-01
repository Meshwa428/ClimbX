"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { usePathname, useRouter } from "next/navigation";

// Page transition — a stepped curtain that only ever travels **upward**.
//
//   1. cover   : it rises out of the bottom edge and climbs until the page is gone
//   2. swap    : the route changes while it is covered (nothing to see, so nothing to time)
//   3. reveal  : it keeps climbing off the top, uncovering the new page from the bottom up
//
// One continuous sweep in one direction, rather than the old pair of straps closing in from
// both edges. Reads as the same climb the brand is about, and it means the leading edge is a
// staircase on the way in *and* on the way out — the same shape doing both jobs.
//
// This used to run on `document.startViewTransition`, and that is why it is DOM now: the
// view-transition pseudo-elements are strictly nested (`::view-transition` › `-group` ›
// `-image-pair` › the snapshots), so a second curtain layer can only live on an *ancestor* of
// the page — and clipping an ancestor clips the page with it. Two independent layers are
// impossible there. Here they are two siblings, which is all this ever needed to be.
//
// Layers, and there are two only on the reveal (the cover is deliberately one flat move):
//   • front — the lighter one. Leads, and is the only layer the outro shows.
//   • back  — the darker one. Trails by LAYER_LAG_MS on the reveal, so the light curtain
//             peels up to expose a dark one still standing, which then peels to the page.
const COVER_MS = 620;
const REVEAL_MS = 720;
const LAYER_LAG_MS = 150;
const HOLD_MS = 120; // beat on the covered state, so the swap doesn't read as a stutter
// ponytail: if a navigation hangs, uncover anyway rather than leaving the reader staring at
// a curtain. Generous, because the only cost of being wrong is a slightly late reveal.
const SAFETY_MS = 2000;
// Head start so the nav pill finishes sliding to the new tab *before* the curtain covers it.
// Nav listens for `climbx:navigate` and moves optimistically.
export const NAV_EVENT = "climbx:navigate";
const NAV_LEAD_MS = 220;

const EASE = [0.83, 0, 0.17, 1] as [number, number, number, number];

// The staircase. N treads climbing left → right across the full width, cut into the top and
// bottom edges of one tall panel so the same profile leads on the way in and on the way out.
// Coordinates are % of the panel, which is 200vh tall — so AMP (10%) is 20vh of step depth.
const N = 6;
const AMP = 10;
const stair = (from: number) => {
  const pts: string[] = [];
  for (let i = 0; i <= N; i++) {
    const x = (i * 100) / N;
    const y = from - (i * AMP) / N;
    if (i > 0) pts.push(`${x}% ${y + AMP / N}%`); // tread
    pts.push(`${x}% ${y}%`); // riser
  }
  return pts;
};
// top edge climbs from AMP to 0, bottom edge climbs from 100 to 100-AMP; right side joins them
const CLIP = `polygon(${[...stair(AMP), ...stair(100).reverse()].join(", ")})`;

// Panel travel, in vh. Its top edge sits at Y, its solid middle spans Y+20vh → Y+180vh.
const HIDDEN = 100; // wholly below the fold
const COVERED = -50; // solid middle straddles the viewport
const GONE = -200; // wholly above the fold

type Phase = "idle" | "cover" | "reveal";

export default function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  const reduce = useReducedMotion();
  const resolveRef = useRef<(() => void) | null>(null);

  // the new route has rendered → the curtain can start climbing off
  useEffect(() => {
    resolveRef.current?.();
    resolveRef.current = null;
  }, [pathname]);

  const run = useCallback(
    async (href: string, target: string) => {
      // Reduced motion: no curtain at all. A 1.4s cover-and-uncover with the durations zeroed
      // is just a flash, which is the thing the setting exists to avoid.
      if (reduce) {
        window.dispatchEvent(new CustomEvent(NAV_EVENT, { detail: target }));
        router.push(href);
        return;
      }
      setPhase("cover");
      window.dispatchEvent(new CustomEvent(NAV_EVENT, { detail: target }));
      router.prefetch(target);

      await new Promise((r) => setTimeout(r, NAV_LEAD_MS + COVER_MS));
      await new Promise<void>((resolve) => {
        const t = setTimeout(resolve, SAFETY_MS);
        resolveRef.current = () => {
          clearTimeout(t);
          resolve();
        };
        router.push(href);
      });
      await new Promise((r) => setTimeout(r, HOLD_MS));

      setPhase("reveal");
      await new Promise((r) => setTimeout(r, REVEAL_MS + LAYER_LAG_MS));
      setPhase("idle"); // snaps back below the fold, off-screen, with no animation
    },
    [router, reduce],
  );

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement | null)?.closest?.("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download") || a.hasAttribute("data-no-transition")) return;

      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname) return; // same page / hash link — leave it alone

      // Capture phase: next/link preventDefaults in its own handler, so by the bubble phase
      // every click looks already-handled. Stop it here so Link never navigates twice — this
      // listener owns the push.
      e.preventDefault();
      e.stopPropagation();
      void run(url.pathname + url.search + url.hash, url.pathname);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [run]);

  if (phase === "idle") return null;

  const y = phase === "cover" ? COVERED : GONE;
  // Only the reveal is staggered. On the cover both panels ride together, so the darker one
  // stays hidden behind the lighter and the outro reads as a single sheet.
  const lag = phase === "reveal" ? LAYER_LAG_MS / 1000 : 0;
  const ms = phase === "cover" ? COVER_MS : REVEAL_MS;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[95] h-screen overflow-hidden">
      {[
        { tint: "bg-ink", delay: lag }, // back — darker, trails on the reveal
        { tint: "bg-graphite", delay: 0 }, // front — lighter, leads and carries the outro alone
      ].map(({ tint, delay }) => (
        <motion.div
          key={tint}
          className={`absolute inset-x-0 top-0 ${tint}`}
          style={{ height: "200vh", clipPath: CLIP, WebkitClipPath: CLIP, willChange: "transform" }}
          initial={{ y: `${HIDDEN}vh` }}
          animate={{ y: `${y}vh` }}
          transition={{ duration: ms / 1000, ease: EASE, delay }}
        />
      ))}
    </div>
  );
}
