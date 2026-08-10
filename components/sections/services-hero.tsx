"use client";

import { CONTAINER, SECTION, SplitReveal, Reveal } from "@/components/sections/kit";

// Services hero — clean typography, no shader. The headline carries the page;
// the graph-paper texture grounds it on the blueprint motif (Design.md §4).
export default function ServicesHero() {
  return (
    <section className={`bg-cloud text-ink ${SECTION}`}>
      <div className="absolute inset-0 bg-graph-dark" />
      <div className={`relative ${CONTAINER}`}>
        <Reveal>
          <p className="font-accent text-[11px] uppercase tracking-[0.3em] text-burnt">
            Services
          </p>
        </Reveal>

        <SplitReveal
          as="h2"
          className="mt-6 max-w-4xl font-display text-6xl font-bold leading-[0.92] tracking-[-0.03em] sm:text-7xl md:text-8xl lg:text-9xl"
        >
          What We Do
        </SplitReveal>

        <SplitReveal className="mt-8 max-w-xl text-lg leading-relaxed text-graphite md:mt-10 md:text-xl">
          Six disciplines. One ascent. We plan the route, fix the footing, and
          keep moving until the numbers move with us.
        </SplitReveal>
      </div>
    </section>
  );
}
