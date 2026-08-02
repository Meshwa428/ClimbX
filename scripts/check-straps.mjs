// Runnable check: the page-transition straps polygons in app/globals.css must stay in sync
// with the intro loader's staircase (components/layout/preloader.tsx, N=6 steps).
// Run: node scripts/check-straps.mjs
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const N = 6;
const step = 100 / N;
const mid = [[0, 100]];
for (let i = 0; i < N; i++) {
  mid.push([(i + 1) * step, 100 - i * step]); // tread
  mid.push([(i + 1) * step, 100 - (i + 1) * step]); // riser
}
const fmt = (n) => `${Number(n.toPrecision(4))}%`;
// visible gap between the two ink panels offset ±k along y
const band = (k) =>
  `polygon(${[...mid.map(([x, y]) => [x, y - k]), ...[...mid].reverse().map(([x, y]) => [x, y + k])]
    .map(([x, y]) => `${fmt(x)} ${fmt(y)}`)
    .join(", ")})`;

const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
const open = band(115); // straps parked off-screen — page fully visible
const closed = band(0); // straps met on the staircase — page fully covered

assert.ok(css.includes(open), "straps OPEN polygon missing/stale in globals.css");
assert.ok(css.includes(closed), "straps CLOSED polygon missing/stale in globals.css");
assert.equal((css.match(/clip-path: polygon/g) ?? []).length, 4, "expected 4 clip-path keyframe stops");
console.log("straps geometry OK");
