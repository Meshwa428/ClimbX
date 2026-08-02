"use client";

import { CONTAINER, DARK_BLOCK, PillLink, Reveal } from "@/components/sections/kit";

// Closing CTA — one dark block, one enormous line, one outline pill. Nothing else.
export default function Cta() {
  return (
    <section className={DARK_BLOCK}>
      <div className={`flex flex-col items-center px-6 py-32 text-center md:px-16 md:py-48 ${CONTAINER}`}>
        <Reveal>
          <h2 className="font-display text-5xl font-bold leading-[0.95] tracking-[-0.03em] sm:text-7xl md:text-8xl">
            Let&apos;s find
            <br />
            your route.
          </h2>
        </Reveal>
        <Reveal delay={0.12}>
          <PillLink href="/contact" onDark className="mt-14 px-12 py-5 text-lg md:mt-20">
            Book a call
          </PillLink>
        </Reveal>
      </div>
    </section>
  );
}
