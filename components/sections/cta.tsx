"use client";

import { CONTAINER, DARK_BLOCK } from "@/components/sections/layout";
import { PillLink, Reveal, SplitReveal } from "@/components/sections/kit";
import Mascot from "@/components/effects/mascot";
import Foliage from "@/components/effects/foliage";

// Closing CTA — one dark block, one enormous line, one outline pill, and the mascot.
//
// It lives here rather than in the hero because the hero already has the shuffle deck and a
// second thing orbiting would just be noise (RULES.md §9). This is the last screen before the
// footer, it is otherwise a lot of empty ink, and it is the one moment on the page where a bit
// of warmth is doing a job rather than decorating.
export default function Cta() {
  return (
    <section className={DARK_BLOCK}>
      <div className="px-6 py-28 text-center md:px-16 md:py-48">
        <div className={`${CONTAINER} flex flex-col items-center`}>
          <Reveal>
            {/* The foliage box is wider than the mascot so the leaves read as something it is
                sitting *in*, and it is behind on the z-order so nothing ever crosses the face. */}
            <div className="relative mb-10 h-20 w-24 md:mb-14 md:h-28 md:w-32">
              {/* Its own box, wider than the mascot on both sides and behind it, so the leaves
                  read as something it is sitting in and nothing ever crosses the face. */}
              <div className="absolute -inset-y-3 -left-[75%] -right-[75%] -z-10">
                <Foliage />
              </div>
              <Mascot className="relative h-full w-full" />
            </div>
          </Reveal>
          <SplitReveal
            as="h2"
            align="center"
            className="max-w-[9ch] font-display text-5xl font-bold leading-[0.95] tracking-[-0.03em] text-balance sm:text-7xl md:text-8xl"
          >
            Let&apos;s find your route.
          </SplitReveal>
          <Reveal delay={0.12}>
            {/* Ghost, not solid: on the ink block a solid button had to be *white*, so its
                flood ran the wrong way — white pill going black on hover. Ghost keeps the
                button reading as black (the block shows through, a white hairline holds the
                shape) and the flood arrives white, which is the direction that section wants. */}
            <PillLink
              href="/contact"
              variant="ghost"
              onDark
              className="mt-14 px-12 py-5 text-lg md:mt-20"
            >
              Book a call
            </PillLink>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
