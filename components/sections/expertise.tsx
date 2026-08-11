"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useReducedMotion } from "motion/react";
import { CONTAINER, SECTION } from "@/components/sections/layout";
import { PillLink, Reveal, SplitReveal, SectionTitle } from "@/components/sections/kit";

// The route — a stack of cards that open as you climb them. A card cracks open as it comes
// up past the bottom of the screen, darkens, and stays open behind you; the ones still
// ahead sit shut and pale. The section reads as a route being walked, not a list.
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

// A card starts opening as its top crosses TRIGGER and is fully open RANGE px later — i.e.
// open by the time its top reaches (0.75 - 280/vh) ≈ 44% of the screen. Matched against the
// reference: their card sits ~62% down the screen at roughly 40% open.
const TRIGGER = 0.75;
const RANGE = 280;
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
    const cards = Array.from(
      list.current?.querySelectorAll<HTMLElement>("[data-card]") ?? [],
    );
    if (!cards.length) return;

    // Scrubbed, and one-way: a card opens as it rises past the trigger line and *stays*
    // open. Openness is a plain ramp on the card's own distance past that line, so the
    // section accumulates — by the bottom every card is open, which is the reference's
    // behaviour and the reason the stack reads as a route already walked.
    //
    // A card's own height never feeds back into its own progress (growing pushes the cards
    // *below* it down, not itself), so measuring each card directly is stable. And because
    // the trigger sits near the floor, the cards that do get shoved down are still off
    // screen — the shove is never visible.
    //
    // Read every top before writing anything: interleaving forces a fresh layout per card.
    let raf = 0;
    const frame = () => {
      raf = 0;
      const line = window.innerHeight * TRIGGER;
      const tops = cards.map((c) => c.getBoundingClientRect().top);
      cards.forEach((card, i) => {
        const s = Math.min(1, Math.max(0, (line - tops[i]) / RANGE));
        const p = s * s * (3 - 2 * s); // smoothstep — linear reads mechanical at the edges
        card.style.setProperty("--p", String(p));
        card.style.gridTemplateRows = `auto ${p}fr`;
      });
    };
    const onScroll = () => {
      raf ||= requestAnimationFrame(frame);
    };

    frame();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reduce, tap]);

  return (
    <section id="services" className={`bg-white text-ink ${SECTION}`}>
      <div className={CONTAINER}>
        <SectionTitle>Every climb needs a route.</SectionTitle>
        <SplitReveal className="mt-8 max-w-xl text-lg text-graphite md:text-xl">
          Six disciplines, one ascent. We plan the route, fix the footing, and keep moving until the
          numbers move with us.
        </SplitReveal>

        <div ref={list} className="mt-16 flex flex-col gap-3 md:mt-24">
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
                "relative grid w-full overflow-hidden rounded-3xl px-8 py-10 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand md:px-12 md:py-14",
              style: {
                gridTemplateRows: isOpen ? "auto 1fr" : "auto 0fr",
                ["--p" as string]: isOpen ? 1 : 0,
                // Only the tap path animates. On desktop `--p` is a new number every frame
                // and a transition would smear the scrub into lag.
                transition: tap
                  ? `grid-template-rows ${TAP_MS}ms var(--ease-out), --p ${TAP_MS}ms var(--ease-out)`
                  : undefined,
                backgroundColor:
                  "color-mix(in oklab, var(--color-void) calc(var(--p) * 100%), var(--color-cloud))",
                color: "color-mix(in oklab, #fff calc(var(--p) * 100%), var(--color-ink))",
              } as React.CSSProperties,
            };

            const body = (
              <>
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

                <div className="relative overflow-hidden">
                  {/* copy trails the card open — nothing legible until the box is half there */}
                  {/* the padding rides `--p` too — an open card wants a floor of air under the
                      copy, but a shut one has no copy to sit above */}
                  <p
                    className="mt-6 max-w-md md:mt-8"
                    style={{
                      opacity: "calc((var(--p) - 0.45) * 2.2)",
                      paddingBottom: "calc(var(--p) * 3.5rem)",
                    }}
                  >
                    {copy}
                  </p>
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

        <Reveal delay={0.1}>
          <div className="mt-20 flex justify-center md:mt-28">
            <PillLink href="/services" variant="ghost">
              See the full route
            </PillLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
