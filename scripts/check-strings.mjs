// Guitar-string physics used by the easter egg (lib/strings.js).
// Run: node scripts/check-strings.mjs
import assert from "node:assert/strict";
import { PUSH, REACH, repelTarget, stepString } from "../lib/strings.js";

// Repel, not attract: the sign of the push must match the sign of (string - pointer).
assert.ok(repelTarget(400, 500) < 0, "string above the pointer must be pushed further up");
assert.ok(repelTarget(600, 500) > 0, "string below the pointer must be pushed further down");

// Falloff: strongest point-blank, nothing at all past the reach.
assert.ok(Math.abs(repelTarget(500 + 1, 500)) > PUSH * 0.9, "point-blank push should be near PUSH");
assert.equal(repelTarget(500 + REACH, 500), 0, "no push at exactly the reach");
assert.equal(repelTarget(500 + REACH * 3, 500), 0, "no push well beyond the reach");
let prev = Infinity;
for (let dist = 1; dist < REACH; dist += 5) {
  const t = repelTarget(500 + dist, 500);
  assert.ok(t <= prev + 1e-9, `push must decay with distance, grew at ${dist}px`);
  prev = t;
}

// Held against a pointer, a string settles at the target instead of running away.
const held = { d: 0, v: 0 };
const target = repelTarget(520, 500);
for (let i = 0; i < 400; i++) stepString(held, target, 1);
assert.ok(Math.abs(held.d - target) < 0.5, `should settle on the target, sat at ${held.d}`);

// Released, it rings out: crosses rest more than once (a twang, not a slump) and then stops.
const rung = { d: 30, v: 0 };
let crossings = 0;
let sign = Math.sign(rung.d);
let peak = 0;
for (let i = 0; i < 600; i++) {
  stepString(rung, 0, 1);
  if (Math.sign(rung.d) !== sign && rung.d !== 0) {
    crossings++;
    sign = Math.sign(rung.d);
  }
  peak = Math.max(peak, Math.abs(rung.d));
}
assert.ok(crossings >= 2, `a plucked string should oscillate, got ${crossings} crossings`);
assert.ok(peak <= 30 + 1e-9, `energy must not grow, peaked at ${peak}`);
assert.ok(Math.abs(rung.d) < 0.1, `should come to rest, sat at ${rung.d}`);

// A dropped frame (dt=2) must not out-run a stable frame — the same clamp the loop applies.
const slow = { d: 30, v: 0 };
for (let i = 0; i < 300; i++) stepString(slow, 0, 2);
assert.ok(Math.abs(slow.d) < 0.1, `dt=2 must stay stable, sat at ${slow.d}`);

console.log("✅ strings: repels (never attracts), decays with distance, settles, twangs, stable at dt=2");
