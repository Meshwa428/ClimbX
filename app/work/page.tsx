"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Cta from "@/components/sections/cta";
import Footer from "@/components/layout/footer";
import { StringRow } from "@/components/effects/guitar-string";
import { CONTAINER, DARK_BLOCK, SECTION } from "@/components/sections/layout";
import { Magnetic, PageHead, Reveal, SectionTitle, TextRoll } from "@/components/sections/kit";

// Case studies + filter chips per docs/reference/legacy-site/SITE-MAP.md (`/work`). No detail
// routes exist on the live site and `/work/[slug]` is deferred (CLAUDE.md), so a card is the
// whole story: client, discipline, the number, and how it was moved.
// ponytail: Picsum stand-ins via plain <img>, same as the home Work section — swap for real
// stills + next/image when the assets land.
// TODO(content): real case-study imagery, client permission, and the "how" lines below.
const filters = ["All", "Paid Media", "SEO", "Social", "Brand"] as const;

const work = [
  {
    client: "RealEstate Co.",
    tag: "Paid Media",
    metric: "3.8x",
    unit: "ROAS in 45 days",
    line: "Performance Max rebuilt around qualified-lead signals instead of raw form fills.",
    seed: "cx-real",
  },
  {
    client: "FashionForward",
    tag: "SEO",
    metric: "200%",
    unit: "organic traffic in 6 months",
    line: "Technical debt cleared first, then a content system aimed at the terms that convert.",
    seed: "cx-fashion",
  },
  {
    client: "HealthPlus Clinics",
    tag: "Social",
    metric: "₹2.4Cr",
    unit: "revenue attributed in Q1",
    line: "A reels cadence the clinic could actually sustain, tied back to booked appointments.",
    seed: "cx-health",
  },
  {
    client: "EduTech Startup",
    tag: "Paid Media",
    metric: "50,000",
    unit: "leads at ₹18 CPL",
    line: "Creative testing loop that retired a losing ad within days, not quarters.",
    seed: "cx-edu",
  },
];

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

export default function Page() {
  const [active, setActive] = useState<(typeof filters)[number]>("All");
  const reduce = useReducedMotion();
  const shown = work.filter((w) => active === "All" || w.tag === active);

  return (
    <>
      <main>
        <PageHead eyebrow="Work" title="Work that climbs.">
          Four routes, four different mountains. Every one of them starts with a number that
          wasn&apos;t moving and ends with one that did.
        </PageHead>

        <section className={`bg-white text-ink ${SECTION}`}>
          <div className={CONTAINER}>
            {/* Filter chips. The active state is an ink fill, the same pill vocabulary as the
                nav — nothing new invented for a control the reader meets once. */}
            <Reveal>
              <div role="tablist" aria-label="Filter work by discipline" className="flex flex-wrap gap-3">
                {filters.map((f) => {
                  const on = f === active;
                  return (
                    <Magnetic key={f} pull={0.2}>
                      <button
                        type="button"
                        role="tab"
                        aria-selected={on}
                        onClick={() => setActive(f)}
                        data-cursor="button"
                        className={`inline-flex min-h-11 cursor-pointer items-center rounded-full border px-6 py-2.5 font-accent text-sm transition-colors duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                          on
                            ? "border-ink bg-ink text-white"
                            : "border-ink/20 text-ink/70 hover:border-ink/45 hover:text-ink"
                        }`}
                      >
                        {f}
                      </button>
                    </Magnetic>
                  );
                })}
              </div>
            </Reveal>

            {/* Cards walk the page at two different rates so the grid ascends, exactly like the
                home Work block. `layout` keeps the survivors sliding into their new slots when
                a filter removes one instead of the grid snapping. */}
            <motion.div layout className="mt-14 grid gap-x-14 gap-y-16 md:mt-20 md:grid-cols-2 md:gap-y-24">
              <AnimatePresence mode="popLayout">
                {shown.map((w, i) => (
                  <motion.article
                    key={w.client}
                    layout
                    initial={reduce ? false : { opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduce ? undefined : { opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.5, ease: EASE, delay: i * 0.05 }}
                    className={`group/card ${i % 2 ? "md:mt-20" : ""}`}
                  >
                    <div
                      className="overflow-hidden rounded-3xl bg-cloud"
                      data-cursor="explore"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`https://picsum.photos/seed/${w.seed}/900/1100`}
                        alt=""
                        loading="lazy"
                        className="aspect-[4/3] w-full object-cover transition-transform duration-700 ease-out fine:group-hover/card:scale-[1.04]"
                      />
                    </div>

                    <p className="mt-6 font-accent text-xs uppercase tracking-[0.25em] text-burnt">
                      {w.tag}
                    </p>
                    <TextRoll
                      as="h2"
                      className="mt-3 font-display text-3xl font-bold tracking-[-0.02em] md:text-4xl"
                    >
                      {w.client}
                    </TextRoll>
                    <p className="mt-4 flex items-baseline gap-3">
                      <span className="font-display text-4xl font-bold tabular-nums tracking-[-0.03em] md:text-5xl">
                        {w.metric}
                      </span>
                      <span className="text-base text-graphite">{w.unit}</span>
                    </p>
                    <p className="mt-4 max-w-md text-base leading-relaxed text-graphite">{w.line}</p>
                  </motion.article>
                ))}
              </AnimatePresence>
            </motion.div>

            {shown.length === 0 && (
              <p className="mt-16 text-lg text-graphite">Nothing under that discipline yet.</p>
            )}
          </div>
        </section>

        <StringRow />

        {/* One ink block per page keeps the vertical rhythm of the home page: light, dark,
            light. Here it carries the honest caveat about the numbers. */}
        <section className={DARK_BLOCK}>
          <div className={SECTION}>
            <div className={CONTAINER}>
              <SectionTitle className="text-white">How we count a win.</SectionTitle>
              <div className="mt-14 grid gap-10 md:mt-20 md:grid-cols-3 md:gap-12">
                {[
                  ["Attributed, not claimed", "Every figure traces back to the client's own analytics or ad account, not ours."],
                  ["Over a stated window", "45 days, six months, one quarter — the period is part of the number."],
                  ["Against a baseline", "We record where the account stood the week we took it on, before anything changed."],
                ].map(([h, p], i) => (
                  <Reveal key={h} delay={i * 0.07} className={i % 2 ? "md:mt-10" : ""}>
                    <h3 className="font-display text-2xl font-bold">{h}</h3>
                    <p className="mt-3 text-base leading-relaxed text-white/60">{p}</p>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        <Cta />
      </main>
      <Footer />
    </>
  );
}
