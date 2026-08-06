// Range math for ScrollWords (components/sections/kit.tsx). Run: node scripts/check-scrollwords.mjs
// Guards the two things that make the reveal read as a wave instead of a stutter:
// every word finishes inside the block's scroll progress, and neighbours overlap.
import assert from "node:assert/strict";

const ranges = (n) =>
  Array.from({ length: n }, (_, i) => {
    const step = 1 / n;
    return [i * step, Math.min(1, i * step + step * 2)];
  });

for (const n of [1, 2, 5, 12, 40]) {
  const r = ranges(n);
  assert.equal(r[0][0], 0, `${n}: first word must start at progress 0`);
  for (const [a, b] of r) {
    assert.ok(a >= 0 && b <= 1, `${n}: range [${a}, ${b}] escapes 0..1`);
    assert.ok(b > a, `${n}: zero-length range at [${a}, ${b}] — word would pop`);
  }
  // last word must be fully lit by the time the block clears
  assert.equal(r.at(-1)[1], 1, `${n}: last word never reaches full opacity`);
  // neighbours overlap → wave, not one-at-a-time
  for (let i = 1; i < n; i++) {
    assert.ok(r[i][0] < r[i - 1][1], `${n}: gap between word ${i - 1} and ${i}`);
  }
}

console.log("✅ ScrollWords ranges: in-bounds, overlapping, last word completes");
