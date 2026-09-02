"use client";

import { motion } from "motion/react";
import { MoveUpRight } from "lucide-react";
import ShuffleDeck, { type ShuffleItem } from "@/components/effects/shuffle-deck";
import { PillLink } from "@/components/sections/kit";

// Hero — "Kinetic Steps": light graph-paper, climbing GROW/CLIMB/SCALE headline,
// and an "Order & Chaos" image cluster orbiting in 3D on the right. SVGs sourced
// (lucide), never hand-authored (RULES.md §10).
// ponytail: Picsum placeholders via plain <img> (sharp install blocked) — swap for
// real client work via next/image later. TODO: source a doodle-arrow SVG (SVGRepo).
const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];
const steps = ["GROW.", "CLIMB.", "SCALE."];
const marquee = ["Digital Marketing", "Web Development", "SEO", "Market Reach"];
const shots: ShuffleItem[] = [
  "cx-grow",
  "cx-climb",
  "cx-scale",
  "cx-brand",
  "cx-team",
  "cx-ads",
].map((seed) => ({ src: `https://picsum.photos/seed/${seed}/260/320` }));

export default function Hero() {
  return (
    <section className="relative flex min-h-svh w-full flex-col overflow-hidden bg-cloud text-ink">
      {/* headline */}
      {/* `items-center` centres the column in the whole section, but the fixed nav eats the
          top ~90px of that box, so true centre reads as sitting high with a hole under the
          button. The top padding pays the nav back: with `items-center` it shifts the column
          down by half of itself. */}
      <div className="relative z-10 flex flex-1 items-center px-6 pt-24 md:px-16 xl:pt-14">
        <div className="mx-auto w-full max-w-6xl">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="font-accent text-xs uppercase tracking-[0.3em] text-burnt"
          >
            Your partner in digital growth
          </motion.p>

          <div className="mt-5">
            {steps.map((s, i) => (
              <motion.h1
                key={s}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.12 + i * 0.12 }}
                style={{ marginLeft: `${i * 1.75}rem` }}
                className="font-impact text-6xl leading-[0.85] tracking-tight sm:text-7xl md:text-8xl"
              >
                {s.slice(0, -1)}
                <span className="text-brand">{s.slice(-1)}</span>
              </motion.h1>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.5 }}
            className="mt-7 max-w-md text-graphite md:text-lg"
          >
            Startups don&apos;t grow by luck. We build the ladder — data-driven marketing, clear
            strategy, real results.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.6 }}
            className="mt-8"
          >
            <PillLink href="/contact" className="px-7 text-sm font-semibold">
              <span className="inline-flex items-center gap-2">
                Book a call
                <MoveUpRight size={17} />
              </span>
            </PillLink>
          </motion.div>
        </div>
      </div>

      {/* Order & Chaos cluster — in flow under the copy up to lg, then absolute and
          bleeding off the right edge. It only goes side-by-side at xl: below that the
          cluster's left satellite lands on top of the paragraph. One instance either
          way — the whole cluster is scaled by a CSS var, so no second rAF loop. */}
      {/* `right-[6vw]` rather than pinned to the edge: the cluster orbits, so its widest
          satellite swings past the container's own bounds and was getting clipped by the
          viewport. The inset is the orbit's overhang, not padding. */}
      <div className="pointer-events-none relative z-0 h-[30svh] w-full shrink-0 [--deck-scale:0.42] md:ml-auto md:h-[32svh] md:w-[62%] md:[--deck-scale:0.55] xl:absolute xl:right-[6vw] xl:ml-0 xl:w-[38vw] xl:top-1/2 xl:h-[86svh] xl:-translate-y-1/2 xl:[--deck-scale:1] 2xl:[--deck-scale:1.2]">
        <div className="absolute inset-0" style={{ transform: "scale(var(--deck-scale))" }}>
          <ShuffleDeck items={shots} className="h-full w-full" />
        </div>
      </div>

      {/* services marquee */}
      <div className="relative z-10 shrink-0 overflow-hidden border-t border-ink/10 bg-ink py-3 text-white">
        <div className="flex w-max animate-[marquee_22s_linear_infinite] items-center gap-8 whitespace-nowrap font-accent text-sm uppercase tracking-widest">
          {Array.from({ length: 4 })
            .flatMap(() => marquee)
            .map((x, i) => (
              <span key={i} className="flex items-center gap-8">
                {x}
                <span className="text-brand">↗</span>
              </span>
            ))}
        </div>
      </div>
    </section>
  );
}
