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
    <section className="relative h-svh w-full overflow-hidden bg-cloud text-ink">
      <div className="absolute inset-0 bg-graph-dark" />

      {/* Order & Chaos cluster — orbits in 3D, bleeds off the right edge */}
      <div className="pointer-events-none absolute right-0 top-1/2 hidden h-[86svh] w-[56vw] -translate-y-1/2 md:block">
        <ShuffleDeck items={shots} className="h-full w-full" />
      </div>

      {/* headline */}
      <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col justify-center px-6 md:px-16">
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
          <a className="group inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 font-accent text-sm font-semibold text-white transition active:scale-[0.97]">
            Book a call
            <MoveUpRight
              size={17}
              className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </a>
        </motion.div>
      </div>

      {/* services marquee */}
      <div className="absolute inset-x-0 bottom-0 z-10 overflow-hidden border-t border-ink/10 bg-ink py-3 text-white">
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
