"use client";

import Link from "next/link";
import { CONTAINER, SECTION, Reveal, SplitReveal, PillLink } from "@/components/sections/kit";
import GuitarString from "@/components/effects/guitar-string";

// Content from docs/reference/legacy-site/text/services.txt + PRD §4.2.
// Service #6 (Strategy & consulting) is from the home Expertise section — it
// isn't on the legacy site but belongs in the full catalogue.
const services: {
  title: string;
  description: string;
  deliverables: string[];
}[] = [
  {
    title: "Performance Marketing",
    description:
      "Conversion-focused paid campaigns engineered for efficient scale — the spend, the creative and the measurement run as one loop.",
    deliverables: ["Media planning", "Ad creative testing", "Daily optimization"],
  },
  {
    title: "SEO & Content Strategy",
    description:
      "Full-funnel organic growth through technical SEO and content systems that keep compounding after the campaign stops.",
    deliverables: ["SEO audits", "Content strategy", "On-page optimization"],
  },
  {
    title: "Social Media Management",
    description:
      "Content engines that turn attention into revenue: a format that fits the platform, a cadence that survives contact with a real week.",
    deliverables: ["Monthly content calendar", "Reels and static creatives", "Community management"],
  },
  {
    title: "Brand Identity & Creative",
    description:
      "Visual and messaging systems that make a brand impossible to confuse — typography, colour and voice built to work as one set.",
    deliverables: ["Brand strategy", "Visual identity", "Tone of voice"],
  },
  {
    title: "Web Design & CRO",
    description:
      "Fast, premium sites built to convert qualified traffic, then tested against the numbers until they do it better.",
    deliverables: ["Website design", "Landing pages", "Conversion audits"],
  },
  {
    title: "Strategy & Consulting",
    description:
      "The plan behind the spend — where to play, what to ignore, and how to know within a quarter whether it's working.",
    deliverables: ["Market analysis", "Growth roadmap", "Quarterly reviews"],
  },
];

// CSS-gradient motifs — reused from expertise.tsx for visual consistency across
// the Expertise cards and the full service blocks. Each renders as subtle grey
// shapes with hard-stop bands (columns, arches, diagonals, terraces, fans).
const G = (a: number) => `rgba(255,255,255,${a})`;
const ART = [
  `linear-gradient(90deg, ${G(0.02)} 0 16%, ${G(0.05)} 16% 32%, ${G(0.1)} 32% 48%, ${G(0.16)} 48% 64%, ${G(0.24)} 64% 82%, ${G(0.32)} 82% 100%)`,
  `radial-gradient(circle at 52% 116%, ${G(0.34)} 0 14%, ${G(0.25)} 14% 27%, ${G(0.18)} 27% 41%, ${G(0.12)} 41% 56%, ${G(0.06)} 56% 73%, ${G(0.02)} 73% 100%)`,
  `linear-gradient(128deg, ${G(0.02)} 0 18%, ${G(0.06)} 18% 34%, ${G(0.11)} 34% 50%, ${G(0.17)} 50% 66%, ${G(0.25)} 66% 83%, ${G(0.33)} 83% 100%)`,
  `linear-gradient(45deg, ${G(0.02)} 0 20%, ${G(0.07)} 20% 38%, ${G(0.13)} 38% 54%, ${G(0.2)} 54% 72%, ${G(0.28)} 72% 88%, ${G(0.35)} 88% 100%)`,
  `linear-gradient(180deg, ${G(0.02)} 0 17%, ${G(0.06)} 17% 33%, ${G(0.11)} 33% 50%, ${G(0.17)} 50% 67%, ${G(0.25)} 67% 84%, ${G(0.33)} 84% 100%)`,
  `conic-gradient(from 315deg at 50% 100%, ${G(0.33)} 0 15deg, ${G(0.25)} 15deg 30deg, ${G(0.18)} 30deg 45deg, ${G(0.12)} 45deg 60deg, ${G(0.06)} 60deg 75deg, ${G(0.02)} 75deg 360deg)`,
];

// Mask: dissolve into the card from one side, hold the top dark so title text
// always sits on near-black. Matches the expertise card mask.
const ART_MASK = {
  maskImage:
    "linear-gradient(90deg, transparent, #000 62%), linear-gradient(180deg, transparent 4%, #000 78%)",
  WebkitMaskImage:
    "linear-gradient(90deg, transparent, #000 62%), linear-gradient(180deg, transparent 4%, #000 78%)",
  maskComposite: "intersect",
  WebkitMaskComposite: "source-in",
} as const;

// Flipped mask for even-indexed (text-right) cards
const ART_MASK_FLIPPED = {
  maskImage:
    "linear-gradient(270deg, transparent, #000 62%), linear-gradient(180deg, transparent 4%, #000 78%)",
  WebkitMaskImage:
    "linear-gradient(270deg, transparent, #000 62%), linear-gradient(180deg, transparent 4%, #000 78%)",
  maskComposite: "intersect",
  WebkitMaskComposite: "source-in",
} as const;

export default function ServicesList() {
  return (
    <section className={`bg-white text-ink ${SECTION}`}>
      <div className={CONTAINER}>
        {services.map((svc, i) => {
          const isEven = i % 2 === 1;
          return (
            <div key={svc.title}>
              {/* Guitar string between cards (not before the first) */}
              {i > 0 && (
                <div className="py-4 md:py-8">
                  <GuitarString
                    height={60}
                    strokeWidth={1}
                    color="rgba(26,26,26,0.1)"
                  />
                </div>
              )}

              <div
                className={`relative overflow-hidden rounded-3xl bg-void p-8 md:grid md:grid-cols-2 md:items-center md:gap-12 md:p-14 lg:p-16 ${
                  isEven ? "md:direction-rtl" : ""
                }`}
                style={{ direction: isEven ? undefined : undefined }}
              >
                {/* Gradient motif — sits behind the content on the motif side */}
                <span
                  aria-hidden
                  className={`pointer-events-none absolute inset-0 ${
                    isEven ? "md:left-0 md:right-1/2" : "md:left-1/2 md:right-0"
                  }`}
                  style={{
                    backgroundImage: ART[i],
                    ...(isEven ? ART_MASK_FLIPPED : ART_MASK),
                  }}
                />

                {/* Text block */}
                <div
                  className={`relative ${isEven ? "md:order-2 md:text-left" : ""}`}
                  style={{ direction: "ltr" }}
                >
                  <Reveal>
                    <span className="font-accent text-sm tabular-nums text-brand">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </Reveal>

                  <SplitReveal
                    as="h3"
                    className="mt-3 font-display text-3xl font-bold tracking-[-0.02em] text-white sm:text-4xl md:text-5xl"
                  >
                    {svc.title}
                  </SplitReveal>

                  <Reveal delay={0.08}>
                    <p className="mt-5 max-w-md text-base leading-relaxed text-white/70 md:text-lg">
                      {svc.description}
                    </p>
                  </Reveal>

                  <Reveal delay={0.14}>
                    <ul className="mt-6 flex flex-wrap gap-2">
                      {svc.deliverables.map((d) => (
                        <li
                          key={d}
                          className="rounded-full border border-white/15 px-4 py-1.5 font-accent text-xs text-white/60"
                        >
                          {d}
                        </li>
                      ))}
                    </ul>
                  </Reveal>

                  <Reveal delay={0.2}>
                    <div className="mt-8">
                      <PillLink href="/contact" onDark>
                        Get started
                      </PillLink>
                    </div>
                  </Reveal>
                </div>

                {/* Motif spacer — on mobile the motif is behind the text;
                    on desktop it gets its own column of pure visual weight */}
                <div
                  className={`relative hidden aspect-square md:block ${
                    isEven ? "md:order-1" : ""
                  }`}
                  aria-hidden
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
