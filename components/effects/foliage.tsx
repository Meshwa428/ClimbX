"use client";

// Foliage — a small cluster of leaves for the mascot to sit in.
//
// Built the same way the mascot is, and for the same reason: a leaf is a square with
// `border-radius: 0 100% 0 100%`, so there is no artwork to hand-author (RULES.md §10), nothing
// to download and nothing to ship. Six divs and a keyframe.
//
// The sway is `transform` only, with `transform-origin` at the stem so each leaf pivots where it
// would actually be attached rather than around its own middle. That keeps it composited — the
// whole cluster is one paint and then nothing but the GPU moving boxes, which is what makes it
// safe to leave running on a low-end phone. Off entirely under reduced motion (globals.css).
//
// Deliberately behind and *under* the mascot, at a value barely off the block it sits on. This
// is texture, not a second subject: Design.md §2 says one idea per screen, and the idea here is
// the mascot, not the garden.
//
// [left%, top%, size% of the box, base rotation, sway delay in seconds]
const LEAVES: [number, number, number, number, number][] = [
  [2, 46, 26, -28, 0],
  [14, 18, 20, -8, 1.3],
  [30, 62, 16, -50, 2.6],
  [70, 58, 18, 34, 0.7],
  [82, 22, 23, 14, 1.9],
  [92, 52, 15, 48, 3.2],
];

export default function Foliage({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 ${className}`}>
      {LEAVES.map(([left, top, size, rot, delay], i) => (
        <span
          key={i}
          className="leaf"
          style={{
            left: `${left}%`,
            top: `${top}%`,
            width: `${size}%`,
            aspectRatio: "1",
            ["--rot" as string]: `${rot}deg`,
            animationDelay: `${delay}s`,
          }}
        />
      ))}
    </div>
  );
}
