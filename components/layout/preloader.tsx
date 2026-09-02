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
// The same cast the page transition's grey layer has — same property, same offset, same blur,
// same colour, the numbers read from `globals.css` so the two curtains cannot drift apart.
const STEP_SHADOW =
  "0 var(--curtain-shadow-y) var(--curtain-shadow-blur) var(--curtain-shadow-color)";
const N = 6; // steps, and columns — one per step
const step = 100 / N;
// The gap between one column and the next, matching the page transition's own stagger. This is
// what turns the curtain from one shape into a set of plates.
const STEP_LAG_MS = 60;
const TAIL_MS = (N - 1) * STEP_LAG_MS;
// The loader is not gone until the last, most-delayed column of the trailing layer has left.
const GONE_MS = SPLIT_DELAY_MS + SPLIT_MS + TAIL_MS + LAYER_LAG_MS;

const A = 2.3; // ribbon half-thickness on X (%) — risers
const B = 4.6; // ribbon half-thickness on Y (%) — treads

// Centerline staircase (y-down %), tread-first, bottom-left (0,100) → top-right (100,0).
const mid: [number, number][] = [[0, 100]];
for (let i = 0; i < N; i++) {
  mid.push([(i + 1) * step, 100 - i * step]); // tread (right)
  mid.push([(i + 1) * step, 100 - (i + 1) * step]); // riser (up)
}
const asPct = (p: [number, number][]) => p.map(([x, y]) => `${x}% ${y}%`).join(", ");

// The curtain is **columns**, not a clipped staircase, and that is the whole difference between
// this reading as separate plates and reading as one flat sheet.
//
// It used to be two `clip-path` polygons cut from the shared centreline. That makes the
// staircase a single connected shape: one silhouette, so there are no plate edges *inside* it to
// separate, and a shadow can only ever outline the whole thing. The page transition's curtain is
// six independent columns each sitting at its own offset, which is where its depth comes from —
// every column casts onto the one behind it.
//
// So each column is cut in two at its own step height and the halves part vertically, which
// keeps the reveal exactly as it was: a staircase opening from the middle outward. The stagger
// then does what it does in the page transition — the columns arrive on different beats, so the
// edge steps in time as well as in space.
//
// Two things fall out of this for free. `box-shadow` works again (these are rectangles, so
// nothing is clipping the shadow away) which means the loader can use the *same property* as the
// page transition rather than a `drop-shadow` on a wrapper. And the sub-pixel seam is gone with
// the shared centreline that caused it — the halves overlap by SEAM instead.
const SEAM = 0.6; // % — the two halves of a column overlap rather than abut
// Where column i parts, as a % from the top. Descends left → right, the same staircase the
// orange ribbon draws.
const splitAt = (i: number) => 100 * (1 - (i + 0.5) / N);
// Rightmost column leads, leftmost trails — same direction as the page transition's climb.
const stepDelay = (i: number) => (N - 1 - i) * STEP_LAG_MS;

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

      {/* Two layers of columns. The lighter one is rendered first so it sits *behind* and leaves
          last: the ink plates pull away to reveal grey plates still standing, and those pull
          away to reveal the page. Only the grey gets the shadow — the ink rides in front of it,
          so an ink shadow would fall on a surface already covered and paint nothing. */}
      {[
        { tint: STEP, lag: LAYER_LAG_MS, shadow: STEP_SHADOW }, // layer 2 — grey, trails
        { tint: "var(--color-ink)", lag: 0, shadow: "none" }, // layer 1 — ink, leads
      ].map(({ tint, lag, shadow }) =>
        Array.from({ length: N }, (_, i) => {
          const cut = splitAt(i);
          const delay = split ? (lag + stepDelay(i)) / 1000 : 0;
          const box = {
            left: `${(i * 100) / N}%`,
            width: `${100 / N}%`,
            backgroundColor: tint,
            boxShadow: shadow,
            willChange: "transform",
          } as const;
          const move = {
            duration: SPLIT_MS / 1000,
            ease: EASE_SPLIT,
            delay,
          };
          // Each column parts at its own step height, the halves overlapping by SEAM so their
          // anti-aliased edges cannot leave a hairline of the page showing between them.
          return (
            <div key={`${tint}-${i}`} aria-hidden>
              <motion.div
                className="absolute top-0"
                style={{ ...box, height: `${cut + SEAM}%` }}
                animate={{ y: split ? "-110%" : 0 }}
                transition={move}
              />
              <motion.div
                className="absolute bottom-0"
                style={{ ...box, height: `${100 - cut}%` }}
                animate={{ y: split ? "110%" : 0 }}
                transition={move}
              />
            </div>
          );
        }),
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
