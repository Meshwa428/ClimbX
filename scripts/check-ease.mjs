// Bezier solver used by the smooth-scroll easing (lib/ease.js).
// Run: node scripts/check-ease.mjs
import assert from "node:assert/strict";
import { cubicBezier } from "../lib/ease.js";

const near = (a, b, tol, msg) =>
  assert.ok(Math.abs(a - b) < tol, `${msg}: expected ~${b}, got ${a}`);

// linear is the identity, and is the one curve Newton can't solve (constant slope)
const linear = cubicBezier(0, 0, 1, 1);
for (const x of [0, 0.25, 0.5, 0.75, 1]) near(linear(x), x, 1e-9, `linear(${x})`);

const curves = {
  "house ease-out": [0.16, 1, 0.3, 1],
  "house standard": [0.4, 0, 0.2, 1],
  easeOutCubic: [0.33, 1, 0.68, 1],
  easeInOut: [0.42, 0, 0.58, 1],
};

for (const [name, pts] of Object.entries(curves)) {
  const f = cubicBezier(...pts);

  assert.equal(f(0), 0, `${name}: must start at 0`);
  assert.equal(f(1), 1, `${name}: must end at 1`);
  assert.equal(f(-0.5), 0, `${name}: clamps below 0`);
  assert.equal(f(2), 1, `${name}: clamps above 1`);

  // monotonic: easing that goes backwards would make the page scroll the wrong way mid-flight
  let prev = -Infinity;
  for (let x = 0; x <= 1; x += 0.005) {
    const y = f(x);
    assert.ok(y >= prev - 1e-9, `${name}: not monotonic at x=${x.toFixed(3)}`);
    assert.ok(y >= -1e-9 && y <= 1 + 1e-9, `${name}: y=${y} escaped [0,1] at x=${x.toFixed(3)}`);
    prev = y;
  }

  // solved correctly? y(x) must invert back through the parametric form
  const [x1, y1, x2, y2] = pts;
  const bez = (t, a, b) => 3 * (1 - t) ** 2 * t * a + 3 * (1 - t) * t ** 2 * b + t ** 3;
  for (const t of [0.15, 0.4, 0.62, 0.85]) {
    near(f(bez(t, x1, x2)), bez(t, y1, y2), 1e-4, `${name}: x(t)->y(t) at t=${t}`);
  }
}

// the ease-out curves must front-load: most of the distance covered in the first third
const out = cubicBezier(0.16, 1, 0.3, 1);
assert.ok(out(0.33) > 0.75, `house ease-out should be past 75% at a third of the way, got ${out(0.33)}`);

console.log("✅ cubicBezier: endpoints, clamping, monotonic, matches the parametric form");
