// The stagger curve behind the page-transition curtain (components/layout/page-transition.tsx).
// Run: node scripts/check-sweep.mjs
//
// The columns' delays are distributed along a bezier instead of an even beat. Two things have
// to hold, and neither is obvious by eye in a 700ms animation:
//   • it must be MONOTONIC — a curve that dips would hand a later column an earlier delay, and
//     the sweep would visibly go backwards mid-flight
//   • its slope must be STEEP AT BOTH ENDS and FLAT IN THE MIDDLE, because the gap between two
//     columns *is* that slope. This is the inverse of the usual ease-in-out, and reaching for
//     the familiar S-curve here gives precisely the wrong result (fast, slow, fast).
import assert from "node:assert/strict";
import { cubicBezier } from "../lib/ease.js";

const N = 6;
const SWEEP = cubicBezier(0.35, 0.85, 0.65, 0.15); // keep in sync with page-transition.tsx
const delays = Array.from({ length: N }, (_, i) => SWEEP(i / (N - 1)));

assert.equal(delays[0], 0, "the leading column must fire immediately");
assert.equal(delays[N - 1], 1, "the trailing column must fire at the end of the tail");

const gaps = delays.slice(1).map((d, i) => d - delays[i]);
gaps.forEach((g, i) => assert.ok(g > 0, `gap ${i} is ${g} — the sweep runs backwards here`));

const mid = Math.floor(gaps.length / 2);
assert.ok(
  gaps[0] > gaps[mid] && gaps[gaps.length - 1] > gaps[mid],
  `ends must be slower than the middle, got ${gaps.map((g) => g.toFixed(3)).join(", ")}`,
);

console.log("gaps:", gaps.map((g) => g.toFixed(3)).join("  "));
console.log("ok — monotonic, slow at both ends, fast through the middle");
