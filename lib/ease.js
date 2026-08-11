// cubic-bezier(x1, y1, x2, y2) as a JS function, so JS-driven motion can use the exact same
// curves as the CSS tokens in Design.md §5 instead of an approximation that drifts from them.
//
// A CSS easing curve is a parametric bezier: both x (time) and y (progress) are functions of
// some parameter t, and t is *not* the time. So evaluating it means first solving x(t) = time
// for t, then reading y(t). Newton-Raphson does that in a handful of steps for any curve whose
// control points sit in [0, 1], which every easing curve's do.
//
// Plain .js on purpose: `scripts/check-ease.mjs` imports this same file, so the check exercises
// the shipped code rather than a copy of it.
const A = (a, b) => 1 - 3 * b + 3 * a;
const B = (a, b) => 3 * b - 6 * a;
const C = (a) => 3 * a;

// value of the bezier polynomial at t, for one axis
const calc = (t, a, b) => ((A(a, b) * t + B(a, b)) * t + C(a)) * t;
// its derivative, i.e. how fast that axis moves at t
const slope = (t, a, b) => 3 * A(a, b) * t * t + 2 * B(a, b) * t + C(a);

export function cubicBezier(x1, y1, x2, y2) {
  // a linear curve needs no solving, and its slope is constant so Newton would stall
  if (x1 === y1 && x2 === y2) return (x) => x;

  return (x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;

    let t = x; // time is a good first guess for the parameter
    for (let i = 0; i < 8; i++) {
      const d = slope(t, x1, x2);
      if (Math.abs(d) < 1e-6) break; // flat here — Newton would overshoot wildly
      t -= (calc(t, x1, x2) - x) / d;
      t = t < 0 ? 0 : t > 1 ? 1 : t; // the parameter can only live in [0, 1]
    }
    return calc(t, y1, y2);
  };
}
