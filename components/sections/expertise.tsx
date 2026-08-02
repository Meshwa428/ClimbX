"use client";

import Link from "next/link";
import { CONTAINER, PillLink, Reveal, SECTION, SectionTitle } from "@/components/sections/kit";

// The route — two columns, one discipline per cell, huge air between rows. No decoration:
// a rung number, a title, one line. The right column sits lower so the pair of columns
// reads as a staircase climbing the page (Design.md §4), not as a table.
const services = [
  ["Performance marketing", "Conversion-focused paid campaigns engineered for efficient scale."],
  ["SEO & content", "Full-funnel organic growth through technical SEO and content systems."],
  ["Social media", "Content engines that turn attention into revenue."],
  ["Brand identity", "Visual and messaging systems that make a brand impossible to confuse."],
  ["Web design & CRO", "Fast, premium sites built to convert qualified traffic."],
  ["Strategy & consulting", "The plan behind the spend — where to play and how to win."],
];

export default function Expertise() {
  return (
    <section id="services" className={`bg-white text-ink ${SECTION}`}>
      <div className={CONTAINER}>
        <SectionTitle>Every climb needs a route.</SectionTitle>
        <Reveal delay={0.06}>
          <p className="mt-8 max-w-xl text-lg text-graphite md:text-xl">
            Six disciplines, one ascent. We plan the route, fix the footing, and keep moving until
            the numbers move with us.
          </p>
        </Reveal>

        <div className="mt-24 grid gap-x-16 gap-y-20 md:mt-32 md:grid-cols-2 md:gap-y-32">
          {services.map(([title, copy], i) => (
            <Reveal key={title} className={i % 2 ? "md:mt-24" : ""}>
              <Link href="/services" className="group block">
                <span className="font-accent text-xs tabular-nums text-brand">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-5 font-display text-3xl font-bold tracking-[-0.02em] md:text-4xl">
                  {title}
                </h3>
                <p className="mt-4 max-w-sm text-graphite">{copy}</p>
                <span className="mt-6 block h-px w-full origin-left scale-x-0 bg-ink transition-transform duration-500 ease-out group-hover:scale-x-100" />
              </Link>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <div className="mt-24 flex justify-center md:mt-32">
            <PillLink href="/services" variant="ghost">
              See the full route
            </PillLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
