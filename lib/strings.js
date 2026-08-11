// Physics for the guitar-string easter egg (components/effects/strings.tsx).
//
// A string is one number: how far its middle is shoved off its rest line, in px. The pointer
// *repels* — a string above the cursor is pushed further up, one below is pushed further down,
// so the cursor parts them like a hand pushed through a set of strings. It never drags them
// along with it: that reads as sticky, and a real string can't follow anything.
//
// Rest is restored by a spring that is deliberately under-damped, because the overshoot *is*
// the effect: the string crosses its rest line a few times before settling. That is a twang.
//
// Plain .js on purpose: `scripts/check-strings.mjs` imports this file, so the check exercises
// the shipped numbers, not a copy of them.

export const REACH = 170; // px of vertical reach the pointer has over a string
export const PUSH = 38; // px a string is shoved at point-blank range
export const STIFF = 0.16; // pull back toward rest, per frame
export const DAMP = 0.9; // velocity kept per frame — under 1 or it never settles

// Where the pointer wants this string to sit. Squared falloff so a string only really moves
// once the cursor is close, and the far ones stay quiet instead of the whole set breathing.
export function repelTarget(y, pointerY, reach = REACH, push = PUSH) {
  const dy = y - pointerY;
  const dist = Math.abs(dy);
  if (dist >= reach) return 0;
  const falloff = 1 - dist / reach;
  return Math.sign(dy) * push * falloff * falloff; // sign = away from the pointer
}

// One frame of spring. `dt` is in frames (1 = 60fps), so a dropped frame advances the same
// distance instead of slowing the twang down.
export function stepString(s, target, dt = 1) {
  s.v += (target - s.d) * STIFF * dt;
  s.v *= Math.pow(DAMP, dt);
  s.d += s.v * dt;
  return s;
}
