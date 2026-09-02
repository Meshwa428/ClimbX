// Leaf placement around the mascot (lib/foliage.js).
// Run: node scripts/check-foliage.mjs
//
// Placement was hand-tuned twice and looked wrong both times, so the two rules it has to obey
// are asserted rather than eyeballed:
//   1. no two leaves overlap
//   2. no leaf sits under the mascot — they flank it
import assert from "node:assert/strict";
import { BOX, MASCOT, LEAVES, COUNT, leafHeight, leafRadius } from "../lib/foliage.js";

// The scatter is rejection-sampled with a bounded try count, so a seed that cannot place them
// all fails here rather than silently shipping four leaves.
assert.equal(LEAVES.length, COUNT, `scatter placed ${LEAVES.length} leaves, wanted ${COUNT}`);

const mascotLeft = (BOX.w - MASCOT.w) / 2;
const mascotRight = mascotLeft + MASCOT.w;

// 1. Overlap, as circles of half-the-diagonal. Conservative, but the only test that survives
//    rotation: a 60° turn makes a 46×82 leaf 94px wide, so unrotated boxes would pass layouts
//    that visibly collide.
for (let i = 0; i < LEAVES.length; i++) {
  for (let j = i + 1; j < LEAVES.length; j++) {
    const [ax, ay, aw] = LEAVES[i];
    const [bx, by, bw] = LEAVES[j];
    const gap = Math.hypot(ax - bx, ay - by);
    const need = leafRadius(aw) + leafRadius(bw);
    assert.ok(
      gap >= need,
      `leaves ${i} and ${j} overlap: centres are ${gap.toFixed(1)}px apart, need ${need.toFixed(1)}`,
    );
  }
}

// 2. Beside the mascot, never under it. A centre inside its horizontal span would put the leaf
//    behind the face, which is the thing that looked wrong.
LEAVES.forEach(([cx], i) => {
  assert.ok(
    cx < mascotLeft || cx > mascotRight,
    `leaf ${i} sits under the mascot (cx ${cx} is inside ${mascotLeft}–${mascotRight})`,
  );
});

// 3. Both sides get some, or it reads as a lopsided accident rather than a setting.
const left = LEAVES.filter(([cx]) => cx < BOX.w / 2).length;
assert.ok(left > 0 && left < LEAVES.length, `all ${LEAVES.length} leaves are on one side`);

const tallest = Math.max(...LEAVES.map(([, , w]) => leafHeight(w)));
console.log(`${LEAVES.length} leaves, ${left} left / ${LEAVES.length - left} right`);
console.log(`tallest ${tallest.toFixed(0)}px in a ${BOX.w}×${BOX.h} box`);
console.log("ok — none overlap, none under the mascot");
