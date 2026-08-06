"use client";

import { motion } from "motion/react";
import { MoveUpRight } from "lucide-react";
import ShuffleDeck, { type ShuffleItem } from "@/components/effects/shuffle-deck";

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
      <div className="absolute inset-0 bg-graph-dark" />

      {/* headline */}
      <div className="relative z-10 flex flex-1 items-center px-6 pt-24 md:px-16 xl:pt-0">
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
            <a
              href="/contact"
              data-cursor="button"
              className="group inline-flex items-center gap-2 rounded-full bg-ink px-7 py-4 font-accent text-sm font-semibold text-white transition-colors duration-300 ease-out hover:bg-graphite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand active:scale-[0.97]"
            >
              Book a call
              <MoveUpRight
                size={17}
                className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </a>
          </motion.div>
        </div>
      </div>

      {/* Order & Chaos cluster — in flow under the copy up to lg, then absolute and
          bleeding off the right edge. It only goes side-by-side at xl: below that the
          cluster's left satellite lands on top of the paragraph. One instance either
          way — the whole cluster is scaled by a CSS var, so no second rAF loop. */}
      <div className="pointer-events-none relative z-0 h-[30svh] w-full shrink-0 [--deck-scale:0.42] md:ml-auto md:h-[32svh] md:w-[62%] md:[--deck-scale:0.55] xl:absolute xl:right-0 xl:ml-0 xl:w-[38vw] xl:top-1/2 xl:h-[86svh] xl:-translate-y-1/2 xl:[--deck-scale:1] 2xl:[--deck-scale:1.2]">
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
