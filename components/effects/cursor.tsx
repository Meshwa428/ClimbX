"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";

// Global custom cursor. ONE fixed layer, a white disc on `mix-blend-difference`, so every
// state inverts whatever is under it — resting dot, button swell and the explore disc alike.
// There used to be a second, un-blended layer carrying the word "Explore"; that state was the
// only thing on the page that painted over the artwork instead of inverting it, which is
// exactly why it looked bolted on.
//
// The arrow is drawn *black* rather than knocked out: under `difference`, black is the
// identity, so those pixels show the photo underneath untouched while the disc around them
// flips. Same result as a mask, no mask.
//
// Blending is not the expensive part — Cuberto's own `.cb-cursor` is `mix-blend-mode:
// exclusion` in its resting state. What makes theirs cheap is `contain: layout style size`,
// and the absence of `will-change: transform`. Those two go together: `will-change` promotes
// the element to its own composited layer, and a *blended* layer has to be resolved against
// its backdrop every frame, so promoting it is the one thing you must not do. `contain` does
// the opposite — it tells the browser this subtree can not affect anything outside itself, so
// the blend stays a bounded region instead of an invalidation that walks up the page. Their
// element is 0×0 with everything overflowing out of it, which is what `contain: size` means;
// ours is the same shape, so it takes the same rule.
//
// Position is a bare rAF lerp — no springs, no React state, no per-frame allocation, and
// the loop parks itself once it catches up. It has to be JS: a CSS transition restarts from
// the current point on *every* pointer event, so short moves complete in one frame and the
// dot snaps instead of trailing. What jittered before was motion's spring + its render
// loop, not the idea of following in JS. Scale and the click pulse stay pure CSS.
//
// Opt in per element with data-cursor="explore" | "button" | "none"; plain <a>/<button>
// get the button state for free. The real cursor is never hidden.
const BASE = 96; // px — every state is a scale of this, so we only ever animate transform
const SCALE = { dot: 9 / BASE, button: 44 / BASE, explore: 72 / BASE };
// Fraction of the remaining gap closed per frame. 0.28 ≈ 90% caught up in ~7 frames
// (~115ms), which is the old CSS-transition speed — but as one continuous curve, so a small
// move eases in like a big one instead of completing in a single frame.
const LERP = 0.28;
const SETTLED = 0.05; // px — sub-pixel, so parking the loop here is invisible, not a snap
const STRETCH_AT = 260; // px of lag that would mean full deformation
const MAX_STRETCH = 0.34; // hard cap — past this the dot reads as a smear, not a cursor
// Click swell. A plain CSS transition, for two reasons: interrupting one mid-flight resumes
// from the current computed value (so a second click grows from the size the dot is at, not
// from 9px), and it only ever *approaches* the ceiling, so hammering the mouse can't stack
// swells into a dinner plate. Driving it from the rAF loop instead — which is what this was
// — makes it share a thread with the position lerp and Lenis, and it visibly stutters.
const PULSE_MAX = 2; // 9px dot → 18px at full swell
const SWELL_UP = "190ms";
const SWELL_DOWN = "480ms"; // out slower than in — a fast return reads as a twitch

type Mode = keyof typeof SCALE;

export default function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState<Mode>("dot");
  const [away, setAway] = useState(false); // pointer has left the window
  const blend = useRef<HTMLDivElement>(null);
  const blendSkew = useRef<HTMLDivElement>(null);
  const disc = useRef<HTMLDivElement>(null);
  // The deform loop runs outside React, so it needs the mode as a ref, not as state.
  const modeRef = useRef<Mode>("dot");

  useEffect(() => {
    // Skip only when the primary pointer is genuinely coarse (touch). Gating on
    // `(pointer: fine)` instead would also drop environments that report neither.
    if (window.matchMedia("(pointer: coarse)").matches) return;
    setEnabled(true);

    let tx = -200;
    let ty = -200;
    let cx = -200;
    let cy = -200;
    let raf = 0;
    let running = false;

    // Cuberto's tell (their `mouse-follower`): the dot doesn't just trail, it deforms —
    // stretched along the direction of travel and pinched across it, snapping back to a
    // circle the moment it catches up. The gap the lerp hasn't closed yet *is* the
    // velocity, so it drives the deformation for free.
    // Position and deformation go on *different* elements. The wrapper only translates —
    // its transform-origin is irrelevant. The skew element is the sized, margin-centred box,
    // so its origin is exactly the pointer; rotating the wrapper instead swings the disc
    // away from the cursor by half its box, and the further it turns the worse it gets.
    const write = (stretch = 0, angle = 0) => {
      const move = `translate3d(${cx}px, ${cy}px, 0)`;
      if (blend.current) blend.current.style.transform = move;
      // Only the dot deforms. `rotate()` is invisible on a bare circle but would spin the
      // arrow with every flick of the mouse, so the explore state stays perfectly round.
      const deform =
        modeRef.current === "explore"
          ? "none"
          : `rotate(${angle}rad) scale(${1 + stretch}, ${1 - stretch})`;
      if (blendSkew.current) blendSkew.current.style.transform = deform;
    };
    const loop = () => {
      const dx = tx - cx;
      const dy = ty - cy;
      cx += dx * LERP;
      cy += dy * LERP;
      if (Math.abs(dx) < SETTLED && Math.abs(dy) < SETTLED) {
        cx = tx;
        cy = ty;
        write(); // back to a perfect circle
        running = false; // caught up — stop burning frames until the pointer moves
        return;
      }
      write(Math.min(Math.hypot(dx, dy) / STRETCH_AT, MAX_STRETCH), Math.atan2(dy, dx));
      raf = requestAnimationFrame(loop);
    };
    const wake = () => {
      if (!running) {
        running = true;
        raf = requestAnimationFrame(loop);
      }
    };
    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      // any movement means the pointer is inside — `mouseover` alone misses a re-entry that
      // lands on the element the pointer left from, and the disc would stay shrunk away
      setAway((a) => (a ? false : a));
      wake();
    };
    // pointerover fires on every target change, so it doubles as "what am I on now?"
    const onOver = (e: PointerEvent) => {
      const el = (e.target as HTMLElement | null)?.closest?.("[data-cursor],a,button");
      const flag = el?.getAttribute("data-cursor");
      const next: Mode =
        flag === "explore"
          ? "explore"
          : flag === "none" || !el
            ? "dot"
            : flag === "button" || el.tagName === "A" || el.tagName === "BUTTON"
              ? "button"
              : "dot";
      modeRef.current = next;
      setMode((m) => (m === next ? m : next));
    };
    // Click on nothing in particular → the dot swells and falls back. Only on empty space:
    // over a target the dot is already the button/Explore disc and a swell reads as a glitch.
    const onDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement | null)?.closest?.("a,button,input,textarea,select,[data-cursor]"))
        return;
      const el = disc.current;
      if (!el) return;
      el.style.transitionDuration = SWELL_UP;
      el.style.transform = `scale(${PULSE_MAX})`;
    };


    // Pointer off the window → the disc shrinks away instead of being abandoned mid-page.
    // `mouseout` with no `relatedTarget` is the leave-the-document signal; `mouseleave` on
    // document doesn't fire in every browser, and pointerout also fires on plain hovers.
    const onOut = (e: MouseEvent) => {
      if (!e.relatedTarget) setAway(true);
    };
    const onIn = () => setAway(false);
    const onBlur = () => setAway(true);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("mouseout", onOut, { passive: true });
    document.addEventListener("mouseover", onIn, { passive: true });
    window.addEventListener("blur", onBlur, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("mouseout", onOut);
      document.removeEventListener("mouseover", onIn);
    };
  }, []);

  // The swell falls back the moment it lands. Re-setting the same value starts no
  // transition, so the end of the *fall* fires this once more and then goes quiet.
  const onSwelled = () => {
    const el = disc.current;
    if (!el || el.style.transform === "scale(1)") return;
    el.style.transitionDuration = SWELL_DOWN;
    el.style.transform = "scale(1)";
  };

  if (!enabled) return null;

  // The sized box lives on the *scaling* element, never on its child: a child that pulls
  // itself off-centre with negative margins leaves the parent a different size, and the
  // parent's transform-origin (its own centre) then sits somewhere other than the pointer.
  const box = { width: BASE, height: BASE, marginLeft: -BASE / 2, marginTop: -BASE / 2 } as const;
  // scale is the only thing that moves between states — no opacity fade. One disc shrinks
  // to nothing as the other grows out of nothing, so the handover reads as a single morph.
  // Same speed both ways. easeOutCubic rather than the house expo curve: expo spends almost
  // all its travel in the first few frames, which is right for a 44px button state but reads
  // as a pop on a disc going 9px → 96px.
  const morph = "transition-transform duration-300 ease-[cubic-bezier(0.33,1,0.68,1)]";

  return (
    <div
      aria-hidden
      ref={blend}
      className="pointer-events-none fixed left-0 top-0 z-[9999] mix-blend-difference"
      style={{ transform: "translate3d(-200px, -200px, 0)", contain: "layout style size" }}
    >
      <div ref={blendSkew} style={box}>
        <div
          className={`relative h-full w-full ${morph}`}
          style={{ transform: `scale(${away ? 0 : SCALE[mode]})` }}
        >
          <div
            ref={disc}
            onTransitionEnd={onSwelled}
            className="h-full w-full rounded-full bg-white transition-transform ease-[cubic-bezier(0.16,1,0.3,1)]"
          />
          {/* Black, so `difference` leaves these pixels as they were — the arrow reads as a
              hole cut in the disc onto whatever is behind it. No fade in or out: it appears
              with the disc it belongs to, and the disc is already doing the animating. */}
          <div
            className="absolute inset-0 flex items-center justify-center text-black"
            style={{ opacity: mode === "explore" ? 1 : 0 }}
          >
            <ArrowUpRight size={34} strokeWidth={2.25} />
          </div>
        </div>
      </div>
    </div>
  );
}
