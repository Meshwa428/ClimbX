"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import Cta from "@/components/sections/cta";
import GuitarString from "@/components/effects/guitar-string";
import Footer from "@/components/layout/footer";
import { CONTAINER, SECTION } from "@/components/sections/layout";
import { PageHead, Reveal, SectionTitle, TextRoll } from "@/components/sections/kit";

// The full route: the same six disciplines the home page teases, each opened up into what it
// actually buys you. Copy from docs/reference/legacy-site/SITE-MAP.md (`/services`, five
// blocks) plus strategy from the home list.
// TODO(content): the strategy bullets are ours — the legacy site never published that block.
const services = [
  {
    title: "Performance marketing",
    promise: "Paid media that scales because the maths works, not because the budget grew.",
    bullets: ["Media planning & channel mix", "Ad creative testing", "Daily optimisation"],
  },
  {
    title: "SEO & content",
    promise: "Organic growth that keeps compounding after the campaign stops.",
    bullets: ["Technical SEO audits", "Content strategy", "On-page optimisation"],
  },
  {
    title: "Social media",
    promise: "A cadence that survives contact with a real week.",
    bullets: ["Monthly content calendar", "Reels & static creative", "Community management"],
  },
  {
    title: "Brand identity",
    promise: "Typography, colour and voice built to work as one set.",
    bullets: ["Brand strategy", "Visual identity", "Tone of voice"],
  },
  {
    title: "Web design & CRO",
    promise: "Fast, premium sites tested against the numbers until they convert better.",
    bullets: ["Website design", "Landing pages", "Conversion audits"],
  },
  {
    title: "Strategy & consulting",
    promise: "Where to play, what to ignore, and how to know within a quarter.",
    bullets: ["Quarterly roadmap", "Budget & channel mix", "Measurement plan"],
  },
];

// How the work actually runs, four beats. Numbered because the brand idea is a climb.
const process = [
  ["Basecamp", "We audit what you have — spend, site, search, social — and agree what winning looks like in numbers."],
  ["Route", "A plan with a shape: the channels we bet on, the ones we skip, and the checkpoint dates."],
  ["Climb", "Build, launch, read the data, cut what doesn't move. Weekly, not quarterly."],
  ["Summit", "One report you can act on, and the next route already drawn."],
];

// House easing — matches Design.md §5 / kit.tsx
const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

export default function Page() {
  const reduce = useReducedMotion();

  return (
    <>
      <main>
        <PageHead eyebrow="Services" title="What we do.">
          Six disciplines, one ascent. Take the whole route or the pitch you are stuck on — the
          engagement is the same either way: a plan, a number to beat, and someone on the rope.
        </PageHead>

        {/* Showreel video — Cuberto-style full-width preview right under the header */}
        <section className={`bg-white px-6 md:px-16 pt-8 pb-8 md:pt-12 md:pb-16`}>
          <div className="mx-auto max-w-7xl">
            <Reveal>
              <div className="relative aspect-video w-full overflow-hidden rounded-3xl bg-graphite md:rounded-[2.5rem]">
                <video
                  src="/videos/services/brand-identity.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="h-full w-full object-cover"
                />
              </div>
            </Reveal>
          </div>
        </section>

        {/* Each service is a row that indents as you descend — the ascending rhythm from
            Design.md §4, read top-down. The rules between them are the elastic guitar strings
            (components/effects/guitar-string.tsx): the cursor shoves them aside on the way
            down the page and they ring back.

            Cuberto-style additions:
            - Staggered scroll reveals per row (progressive delay)
            - Title text-roll on hover (Cuberto's signature translateY trick)
            - Subtle row-level scale + opacity shift on hover
            - Independent index counter animation
            All hover effects are pointer:fine gated. */}
        <section className={`bg-white text-ink ${SECTION}`}>
          <div className={CONTAINER}>
            {services.map((s, i) => (
              <div key={s.title}>
                {i > 0 && <GuitarString height={84} strokeWidth={1.5} />}

                {/* Row wrapper — staggered reveal + hover micro-interactions. */}
                <motion.div
                  initial={reduce ? false : { opacity: 0, y: 36 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.7, ease: EASE, delay: i * 0.08 }}
                  className="group/row"
                >
                  <div
                    className="grid gap-6 py-12 transition-transform duration-500 md:grid-cols-[auto_1fr_auto] md:gap-12 md:py-16 fine:group-hover/row:scale-[0.99]"
                    style={{
                      paddingLeft: `${i * 0.5}rem`,
                      transitionTimingFunction: "var(--ease-out)",
                    }}
                  >
                    {/* Index — arrives slightly after the row body */}
                    <motion.span
                      className="font-accent text-sm tabular-nums text-burnt md:pt-3"
                      initial={reduce ? false : { opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-60px" }}
                      transition={{
                        duration: 0.5,
                        ease: EASE,
                        delay: i * 0.08 + 0.15,
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </motion.span>

                    {/* Title + promise */}
                    <div>
                      <TextRoll
                        as="h2"
                        className="font-display text-3xl font-bold tracking-[-0.02em] md:text-5xl"
                      >
                        {s.title}
                      </TextRoll>
                      <p className="mt-4 max-w-md text-lg text-graphite transition-opacity duration-500 fine:group-hover/row:opacity-80">
                        {s.promise}
                      </p>
                    </div>

                    {/* Bullet list — subtle lift on row hover */}
                    <ul className="flex flex-col gap-2 text-base text-ink/70 transition-opacity duration-500 fine:group-hover/row:text-ink/90 md:w-64 md:pt-3">
                      {s.bullets.map((b) => (
                        <li key={b} className="border-b border-ink/10 pb-2 last:border-0">
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </section>

        <section className={`bg-cloud text-ink ${SECTION}`}>
          <div className={CONTAINER}>
            <SectionTitle>How the climb runs.</SectionTitle>
            <div className="mt-16 grid gap-10 md:mt-24 md:grid-cols-4 md:gap-8">
              {process.map(([name, copy], i) => (
                <Reveal key={name} delay={i * 0.06} className={i % 2 ? "md:mt-10" : ""}>
                  <p className="font-accent text-xs uppercase tracking-[0.3em] text-burnt">
                    Step {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-3 font-display text-2xl font-bold">{name}</h3>
                  <p className="mt-3 text-base leading-relaxed text-graphite">{copy}</p>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.1}>
              <p className="mt-20 text-lg text-graphite md:mt-28">
                Not sure which pitch you are on?{" "}
                <Link
                  href="/contact"
                  className="underline decoration-brand decoration-2 underline-offset-4 hover:text-ink"
                >
                  Tell us the problem
                </Link>{" "}
                and we&apos;ll tell you the route.
              </p>
            </Reveal>
          </div>
        </section>

        <Cta />
      </main>
      <Footer />
    </>
  );
}
