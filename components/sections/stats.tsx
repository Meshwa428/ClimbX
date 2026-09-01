"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { CalendarClock, Layers, LineChart, Users, Wallet } from "lucide-react";
import { CONTAINER, LIGHT_BLOCK, SECTION } from "@/components/sections/layout";
import { Reveal, SectionTitle } from "@/components/sections/kit";

// The numbers, as Cuberto's `.cb-overview-tiles`: a 6-column grid of cards, icon pinned top,
// figure sitting on the floor (`justify-between`), 4rem of padding, 2rem radius.
//
// Their span rules are content-count rules, and that is where the asymmetry comes from —
// tiles are `span 2`, but `:last-child:nth-child(3n+1)` takes the full row. Four tiles hits
// exactly that case: three across, then one wide plate. A 2×2 is what you get by ignoring the
// rules, and it reads as a spreadsheet.
//
// `₹` is deliberately not in the figures. Google's `latin`/`latin-ext` subsets exclude U+20B9
// (`U+20A0-20AB, U+20AD-20C0` — it is skipped by name), so no font on this site has the glyph
// and it falls back to whatever the OS offers, mid-word, at 60px. It lives in the caption
// instead, where a fallback at 12px is invisible. Cuberto's counters carry no currency either.
// Five tiles, because five is what their rules are shaped for: three `span 2` across the top,
// then `:nth-last-child(2):nth-child(3n+1)` and `:last-child:nth-child(3n+2)` both fire and the
// last row is two `span 3`s. Four tiles can only ever produce three-across-then-one-slab.
//
// The fifth is the one figure here that needs no client sign-off: six is the length of the
// services list in `expertise.tsx`. A count of what the site already ships, not a claim about
// results. (It replaced "Six disciplines, one ascent" — copy lifted from the Expertise intro,
// which said nothing measurable and repeated a line already on the same page.)
// TODO(content): verify the other four figures before launch. Cuberto uses one of these slots
// for a credential ("Recognized by leading design awards"); if the client has a real award,
// certification or partner badge, it belongs in the wide tile — and the tint can then follow
// their semantic rule (`:has(strong)`) instead of position.
const stats = [
  { to: 15, decimals: 0, suffix: "Cr+", label: "Ad spend managed (₹)", Icon: Wallet },
  { to: 50, decimals: 0, suffix: "+", label: "Brands grown", Icon: Users },
  { to: 4.2, decimals: 1, suffix: "x", label: "Average ROAS", Icon: LineChart },
  { to: 3, decimals: 0, suffix: "yrs", label: "Of consistent results", Icon: CalendarClock },
  { to: 6, decimals: 0, suffix: "", label: "Disciplines, all in-house", Icon: Layers },
];

// Their span rules, resolved for five: 2/2/2 then 3/3.
const SPAN = ["sm:col-span-2", "sm:col-span-2", "sm:col-span-2", "sm:col-span-3", "sm:col-span-3"];

const DUR_MS = 1400;
// Light gold, not brand orange: orange mixed down to a tint in oklab lands on *pink*, because
// what survives the mix is its red. Gold has the same warmth with the red taken out, so it
// reads as cream. The neutral is the same move on ink, at a matching lightness, so the only
// thing changing between the two is temperature — their mint against blue-grey.
const TINT_WARM = "color-mix(in oklab, var(--color-gold) 9%, var(--pure-white))";
const TINT_COOL = "color-mix(in oklab, var(--color-ink) 4%, var(--pure-white))";
// Their pattern from the reference: the top row alternates, the bottom row is all neutral.
// Carrying the alternation into row 2 turns the grid into a chequerboard.
const TINT = [TINT_WARM, TINT_COOL, TINT_WARM, TINT_COOL, TINT_COOL];

function Ticker({ to, decimals, play }: { to: number; decimals: number; play: boolean }) {
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!play) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DUR_MS);
      setN(to * (1 - Math.pow(1 - t, 3))); // ease-out cubic — fast start, soft landing
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [play, to]);

  return <>{n.toFixed(decimals)}</>;
}

export default function Stats() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });
  const reduce = useReducedMotion();

  return (
    // White, not cloud: Design.md §1 puts off-white on *card surfaces*, so the tiles take it
    // and the page gives them something to sit on. Cards the same colour as their background
    // is what made the last pass read as nothing at all.
    <section className={LIGHT_BLOCK.replace("bg-cloud", "bg-white")}>
      <div className={`relative ${SECTION}`}>
        <div className={CONTAINER}>
          <SectionTitle>What the climb adds up to.</SectionTitle>

          <div ref={ref} className="mt-16 grid gap-4 sm:grid-cols-6 md:mt-24">
            {stats.map((s, i) => {
              return (
                <Reveal key={s.label} delay={i * 0.07} className={SPAN[i]}>
                  {/* Two tints, alternating — their `#e3f5f3` mint against `#f1f3fa` blue-grey,
                      which is what stops the row reading as one slab. Cuberto picks by content
                      (mint = the tile has a number); every tile of ours has one, so ours picks
                      by position, which is Design.md §6's rhythm rather than their semantics.
                      Both mixed off tokens, both ~5%: a tint you can name is already too loud. */}
                  {/* One height for every tile, theirs is a flat 22.5rem — the spans carry the
                      asymmetry, the heights must not also. */}
                  <div
                    className="flex h-full min-h-44 flex-col justify-between rounded-[2rem] p-7 sm:min-h-56 sm:p-8 md:min-h-64 md:p-10"
                    style={{ backgroundColor: TINT[i] }}
                  >
                    <s.Icon size={40} strokeWidth={1.75} className="text-ink" aria-hidden />
                    <div className="mt-10">
                      {/* Space Grotesk at medium — Design.md §2 assigns stat callouts to the
                          accent face, and Cuberto's own counters are regular weight at 6rem.
                          Bold display type at this size is a headline wearing a number's hat. */}
                      <p className="font-accent text-5xl font-medium tabular-nums leading-none tracking-[-0.03em] md:text-6xl">
                        {reduce ? s.to.toFixed(s.decimals) : <Ticker to={s.to} decimals={s.decimals} play={inView} />}
                        <span className="text-brand">{s.suffix}</span>
                      </p>
                      <p className="mt-4 font-accent text-[0.7rem] uppercase tracking-[0.16em] text-ink/55 md:text-xs">
                        {s.label}
                      </p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
