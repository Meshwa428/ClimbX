"use client";

import { Target, TrendingUp, BarChart3 } from "lucide-react";
import { CONTAINER, DARK_BLOCK, Reveal, SplitReveal } from "@/components/sections/kit";

// The 3-step process strip — mirrors the PRD §4.2 "Process" section and the
// Ladder / Arrow / Circle brand metaphors from Design.md §4.
// lucide-react icons: Target (circle → strategy), TrendingUp (arrow → execute),
// BarChart3 (ladder/stairs → measure). All already installed (RULES.md §10).
const steps = [
  {
    Icon: Target,
    title: "Strategy",
    metaphor: "Circle",
    copy: "We study the market, define objectives, and build a plan that tells you exactly where the money goes — and why.",
  },
  {
    Icon: TrendingUp,
    title: "Execute",
    metaphor: "Arrow",
    copy: "Campaigns launch, content ships, ads run. Every week we optimise against the numbers, not the gut.",
  },
  {
    Icon: BarChart3,
    title: "Measure",
    metaphor: "Ladder",
    copy: "Results are reported, learnings are captured, and the next sprint climbs higher than the last.",
  },
];

export default function ServicesProcess() {
  return (
    <section className={DARK_BLOCK}>
      <div className="px-6 py-28 md:px-16 md:py-40">
        <div className={CONTAINER}>
          <Reveal>
            <p className="font-accent text-[11px] uppercase tracking-[0.3em] text-brand">
              The process
            </p>
          </Reveal>

          <SplitReveal
            as="h2"
            className="mt-6 max-w-3xl font-display text-5xl font-bold leading-[0.95] tracking-[-0.03em] text-white sm:text-6xl md:text-7xl"
          >
            How we climb.
          </SplitReveal>

          <SplitReveal className="mt-8 max-w-xl text-lg leading-relaxed text-white/60 md:text-xl">
            Three beats. Every engagement follows the same loop — plan, ship,
            learn — so nothing runs on assumptions for long.
          </SplitReveal>

          <div className="mt-16 grid gap-8 md:mt-24 md:grid-cols-3 md:gap-6 lg:gap-10">
            {steps.map((step, i) => (
              <Reveal key={step.title} delay={i * 0.1}>
                <div className="group rounded-2xl border border-white/8 bg-white/[0.03] p-8 transition-colors duration-300 hover:border-white/15 hover:bg-white/[0.06] md:p-10">
                  {/* Icon + step number */}
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-brand/30 text-brand">
                      <step.Icon size={22} strokeWidth={1.5} />
                    </div>
                    <span className="font-accent text-sm tabular-nums text-white/30">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="mt-6 font-display text-2xl font-bold tracking-[-0.02em] text-white md:text-3xl">
                    {step.title}
                  </h3>

                  {/* Metaphor label */}
                  <p className="mt-2 font-accent text-xs uppercase tracking-[0.2em] text-brand/70">
                    {step.metaphor}
                  </p>

                  {/* Copy */}
                  <p className="mt-4 text-sm leading-relaxed text-white/50 md:text-base">
                    {step.copy}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
