"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useReducedMotion } from "motion/react";
import { CONTAINER, SECTION } from "@/components/sections/layout";
import { PillLink, Reveal, SplitReveal, SectionTitle } from "@/components/sections/kit";

// The route — a stack of cards that open as you climb them. A card cracks open as it comes up
// past the bottom of the screen and darkens; the ones still ahead sit shut and pale. The
// section reads as a route being walked, not a list. Scrolling back up closes them again
// (Cuberto's scrub reverses too) — the open state is a function of where you are, not of how
// far you have ever been.
const services = [
  ["Performance marketing", "Conversion-focused paid campaigns engineered for efficient scale — the spend, the creative and the measurement run as one loop."],
  ["SEO & content", "Full-funnel organic growth through technical SEO and content systems that keep compounding after the campaign stops."],
  ["Social media", "Content engines that turn attention into revenue: a format that fits the platform, a cadence that survives contact with a real week."],
  ["Brand identity", "Visual and messaging systems that make a brand impossible to confuse — typography, colour and voice built to work as one set."],
  ["Web design & CRO", "Fast, premium sites built to convert qualified traffic, then tested against the numbers until they do it better."],
  ["Strategy & consulting", "The plan behind the spend — where to play, what to ignore, and how to know within a quarter whether it's working."],
];

// Each open card gets its own motif on the right. CSS gradients, not artwork — nothing to
// hand-author (RULES.md §10) and nothing to download.
//
// Hard stops, not soft ones. The reference's shapes read as flat grey *plates* stepping
// from near-black up to mid-grey; feathering the stops turns the same geometry into haze,
// which is what the first pass got wrong. The step ramp does the work, so each motif is one
// gradient with banded stops and no repetition.
const G = (a: number) => `rgba(255,255,255,${a})`;
const ART = [
  // 01 — columns, the reference's own opener
  `linear-gradient(90deg, ${G(0.02)} 0 16%, ${G(0.05)} 16% 32%, ${G(0.1)} 32% 48%, ${G(0.16)} 48% 64%, ${G(0.24)} 64% 82%, ${G(0.32)} 82% 100%)`,
  // 02 — arches rising off the bottom edge
  `radial-gradient(circle at 52% 116%, ${G(0.34)} 0 14%, ${G(0.25)} 14% 27%, ${G(0.18)} 27% 41%, ${G(0.12)} 41% 56%, ${G(0.06)} 56% 73%, ${G(0.02)} 73% 100%)`,
  // 03 — a raked stack of diagonal plates
  `linear-gradient(128deg, ${G(0.02)} 0 18%, ${G(0.06)} 18% 34%, ${G(0.11)} 34% 50%, ${G(0.17)} 50% 66%, ${G(0.25)} 66% 83%, ${G(0.33)} 83% 100%)`,
  "none", // 04 — nested peaks, built from clipped shapes instead (see PEAKS below)
  // 05 — terraces, the climb read sideways
  `linear-gradient(180deg, ${G(0.02)} 0 17%, ${G(0.06)} 17% 33%, ${G(0.11)} 33% 50%, ${G(0.17)} 50% 67%, ${G(0.25)} 67% 84%, ${G(0.33)} 84% 100%)`,
  // 06 — a fan of wedges opening upward off the bottom edge. `from 315deg` with the origin
  // *on* the edge is what aims it into the card: the box only occupies roughly ±45° around
  // vertical, so stops outside that arc paint nothing at all.
  `conic-gradient(from 315deg at 50% 100%, ${G(0.33)} 0 15deg, ${G(0.25)} 15deg 30deg, ${G(0.18)} 30deg 45deg, ${G(0.12)} 45deg 60deg, ${G(0.06)} 60deg 75deg, ${G(0.02)} 75deg 360deg)`,
];

// 04 is the one motif no gradient can express: triangles nested on a shared baseline with
// their apexes stepping up. Mirrored ramps blended with `darken` come close but tile into
// diamonds — the minimum of two full-box ramps criss-crosses instead of nesting. So it is
// five clipped shapes, [width/height %, alpha], outermost and darkest first.
const PEAKS = 3; // index of the card that gets them
const PEAK_STEPS: [number, number][] = [
  [100, 0.05],
  [80, 0.1],
  [60, 0.16],
  [41, 0.23],
  [22, 0.31],
];
const TRIANGLE = "polygon(50% 0%, 100% 100%, 0% 100%)";

// One mask for all six: dissolve into the card from the left, and hold the top dark so the
// title and copy always sit on near-black. `intersect` multiplies the two ramps together.
const ART_MASK = {
  maskImage: "linear-gradient(90deg, transparent, #000 62%), linear-gradient(180deg, transparent 4%, #000 78%)",
  WebkitMaskImage: "linear-gradient(90deg, transparent, #000 62%), linear-gradient(180deg, transparent 4%, #000 78%)",
  maskComposite: "intersect",
  WebkitMaskComposite: "source-in",
} as const;

// Cuberto's `.cb-feature` (cuberto.com/assets/js/bundle.js) does two things ours didn't, and
// they are exactly the two complaints:
//
// 1. A **fakes layer**. `.cb-feature-fakes` is a grid of fixed-height spacer divs that owns the
//    section's height and the scroll track; `.cb-feature-items` is `position:absolute; top:0`
//    laid over it. So a card opening never changes the document height. Ours grew in normal
//    flow, which shoved every card below it *down* by exactly as much as the scroll was moving
//    them *up* — the two cancel, and the shut cards read as pinned to one spot fighting the
//    page. That is the "overshoot / stuck on a single point" feel, and it is layout, not easing.
// 2. A **scrubbed, not scroll-locked, playhead**. Their ScrollTrigger runs `scrub: 1`, which
//    lerps the timeline toward the scroll position over ~1s instead of snapping to it. Ours
//    mapped scroll straight onto `--p`, so the animation's velocity *was* the wheel's velocity,
//    notches and all. Smoothstep can't fix that — it reshapes the ramp, not its timing.
//    We get the same lag with one lerp in the rAF loop rather than dragging ScrollTrigger in
//    and wiring it to Lenis (RULES.md §3).
//
// Their trigger window, kept verbatim: the card's own fake, `top center+=20%` → `bottom
// center+=30%`. Both ends viewport-relative, and the range is the fake's height, not a
// constant — a taller card gets proportionally more scroll to open in.
const START = 0.7; // viewport fraction where the fake's top starts the open
const END = 0.8; // ...and where its bottom finishes it
const SCRUB = 0.075; // per-frame approach to the scroll target — Cuberto's `scrub: 1`, 1.5× faster
const OPEN_MS = 800; // the accordion's own trail *behind* the scrub — their 1.2s, 1.5× faster
const FAKE_GUESS = 380; // px, pre-measurement placeholder so first paint isn't a collapsed stack
const TAP_MS = 520; // phones: the open/shut animation, since there is no scroll to scrub it

export default function Expertise() {
  const list = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  // Below `md` the section is a tap accordion instead: scroll-driven expansion assumes a
  // pointer and a tall viewport, and on a phone it just makes the page lurch while you are
  // trying to read it. Several cards can sit open at once — there is no "current" card when
  // the reader picks, only when the scroll picks for them.
  const [tap, setTap] = useState(false);
  const [opened, setOpened] = useState<number[]>([]);
  // Desktop + motion allowed: the fakes/absolute layout, driven by the scroll loop below.
  const scrub = !tap && !reduce;

  useEffect(() => {
    // Width *or* input device: a tablet, or a phone wide enough to clear the md breakpoint,
    // is still something you tap. Anything without a fine pointer gets the tap accordion.
    const mq = window.matchMedia("(max-width: 767px), (pointer: coarse)");
    const sync = () => setTap(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (reduce || tap) return; // reduced motion / phones: nothing to drive
    const root = list.current;
    if (!root) return;
    const cards = Array.from(root.querySelectorAll<HTMLElement>("[data-card]"));
    const fakes = Array.from(root.querySelectorAll<HTMLElement>("[data-fake]"));
    const accs = Array.from(root.querySelectorAll<HTMLElement>("[data-acc]"));
    if (!cards.length || cards.length !== fakes.length || accs.length !== cards.length) return;

    // `--p` is the only thing the loop writes (plus the grid row CSS can't express); every
    // visual on the card is a function of it.
    const cur = cards.map(() => 0);
    const paint = () => {
      cards.forEach((card, i) => {
        card.style.setProperty("--p", String(cur[i]));
        accs[i].style.gridTemplateRows = `${cur[i]}fr`;
      });
    };

    // Each fake is as tall as its own card is when open, so the absolute stack ends up filling
    // the track it scrolls through. Measured rather than guessed: the copy is variable-length
    // and a constant would leave a gap under the last card at some widths.
    const measure = () => {
      // The accordion carries its own transition, so it has to be suspended while each card
      // is posed open to be read — otherwise the measuring pose animates and the heights come
      // back mid-flight.
      accs.forEach((a) => (a.style.transition = "none"));
      cards.forEach((card, i) => {
        accs[i].style.gridTemplateRows = "1fr";
        card.style.setProperty("--p", "1");
        fakes[i].style.height = `${card.offsetHeight}px`;
      });
      paint(); // undo the measuring pose before the browser gets a chance to show it
      void root.offsetHeight; // flush it, or restoring the transition would animate the undo
      accs.forEach((a) => (a.style.transition = ""));
      readGeom();
    };

    // Cached fake geometry. Reading `getBoundingClientRect()` inside the loop forced a
    // synchronous layout on every frame *after* the previous frame had already dirtied the
    // grid rows — the single most expensive thing this section did. The fakes are spacers:
    // their document offsets only move on resize, so the loop can work off `scrollY` and
    // never touch layout at all.
    let geom: { top: number; height: number }[] = [];
    const readGeom = () => {
      const y = window.scrollY;
      geom = fakes.map((f) => {
        const r = f.getBoundingClientRect();
        return { top: r.top + y, height: r.height };
      });
    };

    let raf = 0;
    let last = 0;
    const frame = (t: number) => {
      const dt = last ? Math.min(4, (t - last) / 16.667) : 1;
      last = t;
      const h = window.innerHeight;
      const y = window.scrollY;
      let moving = false;
      geom.forEach((g, i) => {
        const top = g.top - y; // what the rect would have said, without asking for it
        // 0 when the fake's top sits on START, 1 when its bottom reaches END.
        const span = g.height - (END - START) * h;
        const target = span > 0 ? Math.min(1, Math.max(0, (START * h - top) / span)) : 0;
        const d = target - cur[i];
        if (Math.abs(d) < 0.0005) {
          cur[i] = target;
          return;
        }
        // Frame-rate corrected exponential approach — a raw `d * SCRUB` would scrub at half
        // speed on a 120Hz display.
        cur[i] += d * (1 - Math.pow(1 - SCRUB, dt));
        moving = true;
      });
      paint();
      // The lerp has to keep running after the wheel stops — that tail *is* the fluidity — so
      // the loop parks itself only once every card has actually caught up.
      raf = moving ? requestAnimationFrame(frame) : 0;
    };
    const kick = () => {
      last = 0;
      raf ||= requestAnimationFrame(frame);
    };
    const onResize = () => {
      measure();
      kick();
    };

    measure();
    kick();
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", onResize);
    };
  }, [reduce, tap]);

  return (
    <section id="services" className={`bg-white text-ink ${SECTION} md:pb-28`}>
      <div className={CONTAINER}>
        <SectionTitle>Every climb needs a route.</SectionTitle>
        <SplitReveal className="mt-8 max-w-xl text-lg text-graphite md:text-xl">
          Six disciplines, one ascent. We plan the route, fix the footing, and keep moving until the
          numbers move with us.
        </SplitReveal>

        {/* The fakes layer. Spacers hold the section's height open so the absolute card stack
            can grow into it without reflowing anything below — Cuberto's `.cb-feature-fakes`.
            Not rendered on the tap accordion or under reduced motion: there the cards are back
            in normal flow and a second stack would just be dead space. */}
        {/* Cuberto's feature section uses their `-lg` container — `padding: 0 24rem` against
            every other section's `12rem`, i.e. a double gutter that belongs to this section
            alone. That extra air is why their stack reads as a stack and ours read as a wall.
            On the inner wrapper, not on `list`: an absolutely-positioned child resolves
            `inset-x-0` against the padding box, so padding out here would do nothing. */}
        <div className="mt-16 md:mt-24 md:px-24">
        <div ref={list} className="relative">
          {scrub && (
            <div aria-hidden className="flex flex-col gap-3">
              {services.map((_, i) => (
                <div key={i} data-fake style={{ height: FAKE_GUESS }} />
              ))}
            </div>
          )}
          <div
            className={`flex flex-col gap-3 ${scrub ? "absolute inset-x-0 top-0" : ""}`}
          >
          {services.map(([title, copy], i) => {
            const isOpen = tap ? opened.includes(i) : !!reduce;
            // Every visual on the card is a function of `--p`, so the scroll handler only
            // ever writes that one number (plus the grid row it can't express in CSS).
            // ponytail: yes, the open row is a real layout animation (RULES.md §4 says
            // don't). Cuberto's card does the same thing and there's no transform that
            // reflows the stack underneath it. One property, one element, no per-frame JS
            // beyond the two writes above.
            const shell = {
              className:
                // `contain: paint` keeps a card's own relayout from invalidating the page
                // around it — six of these resize every frame while the stack scrubs.
                "relative block w-full overflow-hidden rounded-3xl bg-cloud px-8 py-10 text-left [contain:paint] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand md:px-12 md:py-14",
              style: {
                ["--p" as string]: isOpen ? 1 : 0,
                // `--p` is colour + motif only now; the box is the accordion's job. On desktop
                // the scrub loop writes a new number every frame, so it needs no transition.
                transition: tap ? `--p ${TAP_MS}ms var(--ease-out)` : undefined,
                color: "color-mix(in oklab, #fff calc(var(--p) * 100%), var(--color-ink))",
              } as React.CSSProperties,
            };

            const body = (
              <>
                {/* The dark. Cuberto's `.cb-feature-item-fill`: a layer that fades in over the
                    pale card, not a `background-color` interpolated on the card itself. That
                    matters for cost, not looks — a colour-mix per frame repaints all six
                    full-width cards every frame, while opacity on its own layer is composited
                    and costs nothing. This was most of the scroll lag in this section. */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-void"
                  style={{ opacity: "var(--p)" }}
                />
                {/* motif — rides `--p` straight, so it arrives with the dark */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 right-0 w-3/5"
                  style={{ opacity: "var(--p)", backgroundImage: ART[i], ...ART_MASK }}
                >
                  {i === PEAKS &&
                    PEAK_STEPS.map(([size, alpha]) => (
                      <span
                        key={size}
                        className="absolute bottom-0 left-1/2 -translate-x-1/2"
                        style={{
                          width: `${size}%`,
                          height: `${size}%`,
                          clipPath: TRIANGLE,
                          backgroundColor: `rgba(255,255,255,${alpha})`,
                        }}
                      />
                    ))}
                </span>

                <div className="relative flex items-start justify-between gap-8">
                  <h3 className="font-display text-3xl font-bold tracking-[-0.02em] md:text-4xl">
                    {title}
                  </h3>
                  <span className="font-accent text-lg tabular-nums opacity-40">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>

                {/* Cuberto's `.cb-feature-item-accordion`: a one-row grid with a 1.2s expo
                    transition that stays on *during* the scroll scrub. That trail is the half
                    we were missing. The scrub says where the card should be; the transition
                    takes its time getting there, so the shut cards below are pushed by
                    something soft instead of tracking the wheel notch for notch. Removing it
                    is what made the stack read as welded to one point. */}
                <div
                  data-acc
                  className="relative grid"
                  style={{
                    gridTemplateRows: isOpen ? "1fr" : "0fr",
                    transition: `grid-template-rows ${tap ? TAP_MS : OPEN_MS}ms var(--ease-out)`,
                  }}
                >
                  <div className="overflow-hidden">
                    {/* copy trails the card open — nothing legible until the box is half there */}
                    {/* the padding rides `--p` too — an open card wants a floor of air under the
                        copy, but a shut one has no copy to sit above */}
                    <p
                      className="mt-6 max-w-md md:mt-8"
                      style={{
                        opacity: "calc((var(--p) - 0.45) * 2.2)",
                        paddingBottom: "calc(var(--p) * 3.5rem)",
                        transition: "opacity 400ms var(--ease-out)",
                      }}
                    >
                      {copy}
                    </p>
                  </div>
                </div>
              </>
            );

            // A tap card discloses copy in place, so it is a button, not a link — an anchor
            // here would announce a navigation that never happens.
            return tap ? (
              <button
                key={title}
                type="button"
                aria-expanded={isOpen}
                onClick={() =>
                  setOpened((o) => (o.includes(i) ? o.filter((n) => n !== i) : [...o, i]))
                }
                {...shell}
              >
                {body}
              </button>
            ) : (
              <Link key={title} data-card href="/services" {...shell}>
                {body}
              </Link>
            );
          })}
          </div>
        </div>

        </div>

        <Reveal delay={0.1}>
          <div className="mt-14 flex justify-center md:mt-20">
            <PillLink href="/services" variant="ghost">
              See the full route
            </PillLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
