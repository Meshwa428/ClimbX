// Where the leaves sit around the mascot (components/effects/foliage.tsx).
//
// Plain .js on purpose: `scripts/check-foliage.mjs` imports this same file, so the overlap check
// exercises the shipped layout rather than a copy of it.
//
// **Scattered, not placed.** Hand-authoring six positions produced a mirrored pair of clusters
// that read as a laurel wreath — the eye finds that symmetry instantly and it looks designed
// rather than grown. Positions now come out of a seeded PRNG with rejection sampling: each
// candidate is thrown away unless it clears the mascot and every leaf already accepted. That
// gives an irregular scatter with no axis to spot, while every constraint still holds by
// construction.
//
// Seeded, so it is the same on the server and the client (a random layout would hydrate
// mismatched) and the same for the check script, which validates the exact bytes that ship.
// Change SEED to reroll the arrangement; the constraints hold for any seed that terminates.
//
// Coordinates are px inside BOX, and they are **centres**, not top-left corners — a leaf is
// centred on its point with negative margins, so changing a size no longer moves it.
export const BOX = { w: 520, h: 300 };
// The mascot's own footprint inside that box, centred. Leaves must clear its horizontal span.
export const MASCOT = { w: 128, h: 112 };
export const ASPECT = 0.56; // leaf width ÷ height

export const leafHeight = (w) => w / ASPECT;
// Half the diagonal — the radius no rotation of this leaf can escape. Conservative (a leaf is a
// thin lens, not a disc) but it is the only bound that survives rotation: a 60° turn makes a
// 46×82 leaf 94px wide, so testing unrotated boxes would accept layouts that visibly collide.
export const leafRadius = (w) => Math.hypot(w, leafHeight(w)) / 2;

const SEED = 0x5eed;
export const COUNT = 7;
const CLEAR = 8; // px a leaf must keep from the mascot's span
const GAP = 6; // px of daylight between two leaves

// mulberry32 — small, fast, and good enough for scattering seven leaves. Not for anything that
// needs real randomness.
function mulberry32(a) {
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function scatter() {
  const rnd = mulberry32(SEED);
  const mascotLeft = (BOX.w - MASCOT.w) / 2;
  const mascotRight = mascotLeft + MASCOT.w;
  const out = [];
  // Bounded so a seed that cannot place COUNT leaves fails loudly at build rather than hanging.
  for (let tries = 0; tries < 5000 && out.length < COUNT; tries++) {
    const w = Math.round((28 + rnd() * 24) * 10) / 10;
    const r = leafRadius(w);
    const cx = Math.round((r + rnd() * (BOX.w - 2 * r)) * 10) / 10;
    // Biased upward. The bottom of the box is where the headline starts, so a leaf sampled into
    // the last quarter reads as sitting on the type rather than around the mascot.
    const cy = Math.round(rnd() * BOX.h * 0.74 * 10) / 10;

    // Beside the mascot, never under it: a centre inside its span puts the leaf behind the face.
    if (cx > mascotLeft - CLEAR && cx < mascotRight + CLEAR) continue;
    if (out.some(([ox, oy, ow]) => Math.hypot(cx - ox, cy - oy) < r + leafRadius(ow) + GAP)) continue;

    out.push([
      cx,
      cy,
      w,
      Math.round(rnd() * 360), // free rotation — no mirrored pairs, no shared angle
      rnd() < 0.5 ? 1 : -1, // flip, so the lens does not lean the same way everywhere
      Math.round((8 + rnd() * 5) * 10) / 10, // sway seconds
      Math.round(rnd() * 4 * 10) / 10, // sway delay
    ]);
  }
  return out;
}

// [cx, cy, width, rotation°, flip, sway seconds, sway delay]
export const LEAVES = scatter();
