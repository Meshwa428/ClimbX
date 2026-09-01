"use client";

import Link from "next/link";
import { CONTAINER, DARK_BLOCK, SECTION } from "@/components/sections/layout";
import { PillLink, Reveal, SectionTitle } from "@/components/sections/kit";

// Climbs we've led — ink block, two columns walking the page at different rates so the
// grid ascends. The image is the whole target: hover swaps the cursor to the Explore disc.
// ponytail: Picsum stand-ins via plain <img> (sharp install blocked) — swap for real
// client stills + next/image when the assets land.
// TODO(content): real case-study imagery, names and figures.
const work = [
  { client: "RealEstate Co.", line: "3.8x ROAS in 45 days on Performance Max", seed: "cx-real", ratio: "aspect-[4/5]" },
  { client: "FashionForward", line: "200% organic traffic growth in six months", seed: "cx-fashion", ratio: "aspect-[4/3]" },
  { client: "HealthPlus Clinics", line: "₹2.4Cr revenue attributed to digital in Q1", seed: "cx-health", ratio: "aspect-[4/3]" },
  { client: "EduTech Startup", line: "50,000 leads at ₹18 cost per lead", seed: "cx-edu", ratio: "aspect-[4/5]" },
];

export default function Work() {
  return (
    <section id="work" className={DARK_BLOCK}>
      <div className={SECTION}>
        <div className={CONTAINER}>
          <SectionTitle className="text-white">Climbs we&apos;ve led.</SectionTitle>

          {/* Columns, not a grid: grid rows align, so a 4:3 card beside a 4:5 one leaves a
              hole under the short one that no gap value can close. `columns-2` lets each
              column flow at its own height, and on mobile it collapses to one in DOM order. */}
          <div className="mt-16 md:mt-24 md:columns-2 md:gap-14">
            {work.map((w, i) => (
              <Reveal
                key={w.client}
                delay={(i % 2) * 0.1} // their batch stagger — per column, not per card
                className={`mb-14 break-inside-avoid md:mb-20 ${i === 2 ? "md:mt-20" : ""}`}
              >
                <Link href="/work" className="group block" data-cursor="explore">
                  <div className={`overflow-hidden rounded-2xl bg-white/5 ${w.ratio}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://picsum.photos/seed/${w.seed}/700/875`}
                      alt=""
                      loading="lazy"
                      // The reveal animates the *card*; a lazily-decoded image can still land
                      // inside a finished one and pop. Fade it in on its own decode.
                      onLoad={(e) => e.currentTarget.classList.remove("opacity-0")}
                      className="h-full w-full object-cover opacity-0 transition-[opacity,transform] duration-700 ease-out group-hover:scale-[1.03]"
                    />
                  </div>
                  <p className="mt-6 max-w-md text-lg leading-snug">
                    <span className="font-semibold">{w.client}</span>
                    <span className="text-white/60"> — {w.line}</span>
                  </p>
                </Link>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.1}>
            <div className="mt-14 flex justify-center md:mt-20">
              <PillLink href="/work" variant="ghost" onDark>
                Every climb so far
              </PillLink>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
