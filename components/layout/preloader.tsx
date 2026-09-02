"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";

// Intro loader:
//   1. Ink screen with the brand graph-paper motif.
//   2. The ClimbX logo reveals upward (mask wipe from the bottom = "the climb"),
//      tagline fades in beneath it.
//   3. A thick solid orange staircase wipes in bottom-left → top-right.
//   4. The screen splits along the staircase to reveal the page. Nothing retracts —
//      the staircase and logo just disappear as the split starts.
// Once per session; skipped under reduced-motion.
const EASE_DRAW = [0.65, 0, 0.35, 1] as [number, number, number, number];
const EASE_SPLIT = [0.83, 0, 0.17, 1] as [number, number, number, number];

const DRAW_MS = 1900;
const SPLIT_DELAY_MS = 2250;
const SPLIT_MS = 1000;
// The split is two staircases, not one: a dark pair leads, a lighter pair follows one beat
// behind, so the page is uncovered in two moves instead of one flat wipe. Same lag the page
// transition uses between its own two layers (`::view-transition` in globals.css).
const LAYER_LAG_MS = 160;
// The same middle value the page transition's curtain steps through (`--curtain-step` in
// globals.css). The split mechanic here is unchanged — staircase halves parting, not columns
// climbing — but the two curtains now share one ramp instead of the loader running its own
// near-black `graphite` against `ink`, which read as a single flat sheet.
const STEP = "var(--curtain-step)";
// The same cast the page transition's grey layer has. Expressed as a `drop-shadow` filter
// rather than a `box-shadow` because these panels are clipped — see the note at the wrapper.
const STEP_SHADOW = "drop-shadow(0 -10px 26px color-mix(in oklab, var(--color-ink) 45%, transparent))";
const GONE_MS = SPLIT_DELAY_MS + SPLIT_MS + LAYER_LAG_MS;

const N = 6; // steps
const step = 100 / N;
const A = 2.3; // ribbon half-thickness on X (%) — risers
const B = 4.6; // ribbon half-thickness on Y (%) — treads

// Centerline staircase (y-down %), tread-first, bottom-left (0,100) → top-right (100,0).
const mid: [number, number][] = [[0, 100]];
for (let i = 0; i < N; i++) {
  mid.push([(i + 1) * step, 100 - i * step]); // tread (right)
  mid.push([(i + 1) * step, 100 - (i + 1) * step]); // riser (up)
}
const asPct = (p: [number, number][]) => p.map(([x, y]) => `${x}% ${y}%`).join(", ");

// The two halves are cut from the *same* centreline, so their edges meet exactly — and two
// anti-aliased edges meeting exactly leave a sub-pixel gap that shows whatever is behind them.
// That was invisible while both layers were near-black; the moment the trailing layer became a
// mid grey, the gap started drawing a hairline staircase across the screen.
//
// So the top-left half is cut a hair past the line, which makes the two overlap instead of abut.
// It only has to hold while the panels are at rest — once they split they are travelling in
// opposite directions and there is no seam left to leak through.
const BLEED = 0.4; // % of the box
const midStr = asPct(mid);
const panelTopLeft = `polygon(0% 0%, ${asPct(mid.map(([x, y]) => [x, y + BLEED]))})`;
const panelBottomRight = `polygon(${midStr}, 100% 100%)`;

// Orange band = centerline offset by ±(A,B), with the first tread extended straight off
// the left edge and the last riser straight off the top → no tilted stairs at the ends.
const ribMid: [number, number][] = mid.map((p, i) =>
  i === 0 ? [-8, 100] : i === mid.length - 1 ? [100, -8] : p,
);
const upper = ribMid.map(([x, y]) => [x - A, y - B]) as [number, number][];
const lower = ribMid.map(([x, y]) => [x + A, y + B]) as [number, number][];
const ribbon = `polygon(${asPct([...upper, ...[...lower].reverse()])})`;

export default function Preloader() {
  const [split, setSplit] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || sessionStorage.getItem("climbx-intro")) {
      setGone(true);
      return;
    }
    const t1 = setTimeout(() => setSplit(true), SPLIT_DELAY_MS);
    const t2 = setTimeout(() => {
      sessionStorage.setItem("climbx-intro", "1");
      setGone(true);
    }, GONE_MS);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (gone) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[100]">
      {/* Back fill — hides the clip seam, gone the instant the split starts. It has to be the
          *same* value as the trailing pair below, since that seam is the only thing it shows
          through. No graph paper: a curtain with its own texture reads as a screen you are
          waiting on rather than one being pulled off the page. */}
      <motion.div
        aria-hidden
        className="absolute inset-0"
        style={{ backgroundColor: STEP }}
        animate={{ opacity: split ? 0 : 1 }}
        transition={{ duration: split ? 0 : 0.2 }}
      />

      {/* Two pairs of halves on the same staircase clip. The lighter pair is rendered first so
          it sits *behind* and leaves last: the dark stairs pull away to reveal lighter stairs
          still standing, and those pull away to reveal the page. Both seams land on the same
          geometry, so the back fill only ever shows through as the light pair's own colour. */}
      {[
        { tint: STEP, lag: LAYER_LAG_MS, shade: true }, // layer 2 — the mid-grey step, trails
        { tint: "var(--color-ink)", lag: 0, shade: false }, // layer 1 — ink, leads
      ].map(({ tint, lag, shade }) =>
        (
          [
            [panelTopLeft, "-110%"],
            [panelBottomRight, "110%"],
          ] as const
        ).map(([clip, exit]) => (
          // The shadow has to live on a *wrapper*, not on the panel. `clip-path` is applied
          // after `filter`, so a shadow set on the clipped element is generated from its full
          // rectangle and then clipped away to nothing. On an ancestor, `drop-shadow` traces the
          // alpha the clip already produced — which is the staircase, exactly the edge we want
          // it on. `box-shadow` cannot do this job at all here for the same reason.
          //
          // Only the grey pair gets one, matching the page transition: the ink rides in front,
          // so its shadow would fall on a surface already covered and paint nothing.
          <div
            key={`${tint}-${exit}`}
            aria-hidden
            className="absolute inset-0"
            style={shade ? { filter: STEP_SHADOW } : undefined}
          >
          <motion.div
            style={{
              clipPath: clip,
              WebkitClipPath: clip,
              backgroundColor: tint,
              willChange: "transform",
            }}
            className="absolute inset-0"
            animate={{ y: split ? exit : 0 }}
            transition={{
              duration: SPLIT_MS / 1000,
              ease: EASE_SPLIT,
              delay: split ? lag / 1000 : 0,
            }}
          />
          </div>
        )),
      )}

      {/* solid orange staircase — wipes in; on split it vanishes instantly (no retract) */}
      <motion.div
        aria-hidden
        className="absolute inset-0"
        initial={{ clipPath: "inset(0 100% 0 0)" }}
        animate={{ clipPath: "inset(0 0% 0 0)", opacity: split ? 0 : 1 }}
        transition={{ clipPath: { duration: DRAW_MS / 1000, ease: EASE_DRAW }, opacity: { duration: 0 } }}
      >
        <div className="absolute inset-0 bg-brand" style={{ clipPath: ribbon, WebkitClipPath: ribbon }} />
      </motion.div>

      {/* logo + tagline — sit in the empty space above the staircase */}
      <motion.div
        className="absolute left-6 top-[20%] flex -translate-y-1/2 flex-col items-start text-left md:left-[30%] md:top-[36%] md:-translate-x-1/2 md:items-center md:text-center"
        animate={{ opacity: split ? 0 : 1 }}
        transition={{ duration: split ? 0.18 : 0, ease: "easeOut" }}
      >
        <motion.div
          initial={{ clipPath: "inset(100% 0% 0% 0%)", y: 18 }}
          animate={{ clipPath: "inset(0% 0% 0% 0%)", y: 0 }}
          transition={{ duration: 0.9, ease: EASE_DRAW, delay: 0.25 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo/climbx-logo-white.png"
            alt="ClimbX Digital"
            width={455}
            height={584}
            className="w-28 sm:w-32 md:w-40"
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_DRAW, delay: 0.85 }}
          className="mt-5 max-w-[9rem] font-accent text-[10px] uppercase tracking-[0.3em] text-white/45 sm:text-xs md:max-w-none"
        >
          Your Partner in Digital Growth
        </motion.p>
      </motion.div>
    </div>
  );
}
