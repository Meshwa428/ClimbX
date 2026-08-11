// Page furniture that is only ever class strings — deliberately *not* in `kit.tsx`.
//
// kit.tsx is a client module, so anything exported from it crosses the RSC boundary as a
// client reference. For a component that's the point; for a plain string it's a trap: a
// server page importing `SECTION` from there interpolates a stub function's *source* into
// className and the section silently loses its gutter. Constants live here so both sides can
// read them as what they are.

// SECTION owns the page gutter + vertical rhythm, CONTAINER owns the measure. Always
// nested (section → SECTION, inner div → CONTAINER) so every headline on the site lands
// on the same left edge — putting both on one element makes the padding eat the max-width.
export const SECTION = "px-6 py-24 md:px-16 md:py-40";
export const CONTAINER = "mx-auto max-w-6xl";
// Blocks are full-bleed — they span the viewport and only the top corners round off, so a
// surface reads as the page changing colour, not as a card floating on it. A block that
// follows a different-coloured one is pulled up by its own radius so the corner notches
// reveal the block underneath; without that overlap the curve has nothing to curve against.
export const DARK_BLOCK =
  "relative -mt-8 rounded-t-[2rem] bg-ink text-white md:-mt-12 md:rounded-t-[3rem]";
export const LIGHT_BLOCK =
  "relative -mt-8 overflow-hidden rounded-t-[2rem] bg-cloud text-ink md:-mt-12 md:rounded-t-[3rem]";
