"use client";

import { CONTAINER, DARK_BLOCK } from "@/components/sections/layout";
import { PillLink, Reveal, SplitReveal } from "@/components/sections/kit";

// Closing CTA — one dark block, one enormous line, one outline pill. Nothing else.
export default function Cta() {
  return (
    <section className={DARK_BLOCK}>
      <div className="px-6 py-28 text-center md:px-16 md:py-48">
        <div className={`${CONTAINER} flex flex-col items-center`}>
          <SplitReveal
            as="h2"
            align="center"
            className="max-w-[9ch] font-display text-5xl font-bold leading-[0.95] tracking-[-0.03em] text-balance sm:text-7xl md:text-8xl"
          >
            Let&apos;s find your route.
          </SplitReveal>
          <Reveal delay={0.12}>
            <PillLink href="/contact" onDark className="mt-14 px-12 py-5 text-lg md:mt-20">
              Book a call
            </PillLink>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
