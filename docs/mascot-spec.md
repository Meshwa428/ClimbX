# Monkey mascot — Rive file spec

**Status: blocked on artwork.** No code is written yet, deliberately. A `.riv` is a binary
authored in the Rive editor; it cannot be generated from here, and `CLAUDE.md` forbids inventing
brand assets. This file is the contract so that whoever builds it produces something that drops
straight in without a second pass.

Hand this page to whoever makes the file (Rive editor is free at rive.app, and the format is
also what you get by remixing a rive.app/community file — check the licence on any you remix).

---

## Why Rive and not Lottie

The behaviour asked for is *reactive*, not a loop: the monkey's position is a function of scroll,
and it changes state (hanging → swinging → landed). Lottie plays a fixed timeline and can be
scrubbed, but it has no notion of state, so every transition would have to be faked in JS by
cross-fading clips. Rive's state machine does that natively and blends between states, which is
the whole reason it is worth the dependency.

**The dependency is not installed yet.** `@rive-app/react-canvas` (~150KB gzipped) goes in only
when there is a file for it to render — an unused runtime is dead weight. Justification line for
`Memory.md` is written and waiting.

---

## Artboard

| | |
|---|---|
| Name | `monkey` (exact — the runtime looks it up by name) |
| Size | `600 × 1400` portrait. Tall, because the vine and the drop happen in one artboard. |
| Fit | rendered with `fit: "contain"`, `alignment: "top-right"` |
| Origin | vine anchor at the **top edge**, monkey hangs below it |

The artboard is pinned to the right edge of the viewport and is roughly one-and-a-bit viewports
tall, so the vine reads as coming from off-screen above.

## Palette

Monochrome, per `Design.md §1/§4`: the monkey and the vine are **`#1A1A1A`** (`--brand-black`) on
the light pages. Colour is spent, not sprayed — if the mascot needs one accent, it is
**`#F5A623`** (`--brand-orange`) and it is *one* thing (an eye glint, a collar, the tip of the
tail), never a fill.

A second all-white variant of the same artboard is needed for the dark blocks (Work, CTA), or
the monkey vanishes against them. Same rig, inverted fills.

## State machine

Name: `mascot` (exact).

| State | What it is |
|---|---|
| `descend` | entry. Monkey drops in from above on the vine, overshoots, settles. Plays once on page load. |
| `hang` | idle loop. Slow sway, occasional blink/scratch. This is where it lives most of the time. |
| `swing` | the traverse: monkey releases, swings, catches the next vine. Loops while `traversing` is true. |
| `shrink` | monkey scales down and tucks up toward the top edge — for sections where it must get out of the way. |

## Inputs

The runtime writes these; nothing else. Names are exact.

| Input | Type | Driven by |
|---|---|---|
| `scroll` | Number `0–100` | page scroll progress. Drives the traverse position and the hang height. |
| `traversing` | Boolean | true while the monkey should be swinging rather than hanging |
| `compact` | Boolean | true when the section underneath needs it small (→ `shrink`) |
| `side` | Number `0–100` | horizontal position, `0` = right edge, `100` = left edge. The traverse is right → left. |
| `hover` | Boolean | pointer is near the monkey — a reaction of your choosing, keep it small |

Everything is a *state*, not a command: if the reader scrolls back up, every input runs backwards
and the monkey must behave sensibly in reverse. No one-way triggers except `descend`.

## Foliage

Separate from the monkey and **not** in the Rive file — it is static decoration, so it ships as
plain SVG in `public/mascot/` and costs nothing to render. Sourced, not hand-authored
(`RULES.md §10`); CC0 vine and leaf silhouettes exist on SVGRepo.

- runs along the **top edge** of the viewport, full width, hanging down
- same `#1A1A1A`, and it is a silhouette — no outlines, no detail
- the vine the monkey hangs from has to line up with the artboard's anchor, which is why this
  is worth building *after* the `.riv` exists rather than guessing the anchor twice

## Accessibility & performance — non-negotiable

- `prefers-reduced-motion` → render the monkey at rest in its `hang` pose, no state machine.
- `aria-hidden`; it is decoration and must never be announced.
- Canvas pauses when scrolled out of view — same `IntersectionObserver` treatment
  `ShuffleDeck` already gets, and for the same reason.
- Hidden entirely below `md`. A phone viewport has no spare right-hand gutter, and the hero
  already carries the shuffle deck there.

---

## TODO(content)

- [ ] `public/mascot/climbx-monkey.riv` — artboard `monkey`, state machine `mascot`, inputs above
- [ ] white variant for the dark blocks
- [ ] confirm licence if remixed from rive.app/community
