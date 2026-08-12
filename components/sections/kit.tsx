"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import SplitText from "@/components/reactbits/SplitText";
import { CONTAINER } from "@/components/sections/layout";

// Shared section furniture. House principles (Design.md §0): space is the main material —
// one idea per screen, type carries the page, colour is spent deliberately, and the layout
// steps upward because the brand idea is a climb, not because staggering looks nice.
const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

// Word reveal — React Bits `SplitText` (Components.md), words split and each one sliding
// up out of its own mask. No fade: a word is either behind the clip or fully solid.
// ponytail: words, not chars — at display sizes a per-letter stagger reads as a slot
// machine, and it multiplies the node count of every headline on the page by ~6.
export function SplitReveal({
  children,
  className = "",
  as = "p",
  align = "left",
}: {
  children: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p";
  align?: "left" | "center";
}) {
  return (
    <SplitText
      text={children}
      tag={as}
      className={className}
      splitType="words"
      mask="words"
      from={{ yPercent: 115 }}
      to={{ yPercent: 0 }}
      duration={1.1}
      delay={70}
      ease="expo.out"
      threshold={0.15}
      rootMargin="-80px"
      textAlign={align}
    />
  );
}

export function SectionTitle({ children, className = "" }: { children: string; className?: string }) {
  return (
    <SplitReveal
      as="h2"
      className={`max-w-3xl font-display text-5xl font-bold leading-[0.95] tracking-[-0.03em] sm:text-6xl md:text-7xl ${className}`}
    >
      {children}
    </SplitReveal>
  );
}

// Every inner page opens the same way: eyebrow, one enormous line, one paragraph, on the
// hero's own graph-paper surface. Same furniture as the home hero minus the deck, so a route
// change reads as the same building with a different room.
export function PageHead({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: string;
}) {
  return (
    <header className="relative overflow-hidden bg-cloud px-6 pb-24 pt-40 text-ink md:px-16 md:pb-32 md:pt-56">
      <div className="absolute inset-0 bg-graph-dark" />
      <div className={`relative ${CONTAINER}`}>
        <p className="font-accent text-xs uppercase tracking-[0.3em] text-burnt">{eyebrow}</p>
        {/* Each on its own block row: SplitText's root is `display:inline-block` (inline
            style, so no class can override it) and two of them in a row share a line box. */}
        <div>
          <SplitReveal
            as="h1"
            className="mt-5 max-w-4xl font-display text-5xl font-bold leading-[0.95] tracking-[-0.03em] sm:text-6xl md:text-8xl"
          >
            {title}
          </SplitReveal>
        </div>
        {children && (
          <div>
            <SplitReveal className="mt-8 max-w-xl text-lg text-graphite md:text-xl">
              {children}
            </SplitReveal>
          </div>
        )}
      </div>
    </header>
  );
}

// Buttons: solid ink pill is primary (same shape as the hero CTA), outline is secondary.
// No gradients — the brand orange stays a micro-accent, never a surface.
export function PillLink({
  href,
  children,
  variant = "solid",
  onDark = false,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "solid" | "ghost";
  onDark?: boolean;
  className?: string;
}) {
  const skin =
    variant === "solid"
      ? onDark
        ? "bg-white text-ink hover:bg-white/90"
        : "bg-ink text-white hover:bg-graphite"
      : onDark
        ? "border border-white/30 text-white hover:bg-white hover:text-ink"
        : "border border-ink/25 text-ink hover:bg-ink hover:text-white";
  return (
    <Link
      href={href}
      data-cursor="button"
      className={`inline-flex items-center justify-center rounded-full px-9 py-4 font-accent text-base font-medium transition-colors duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand active:scale-[0.98] ${skin} ${className}`}
    >
      {children}
    </Link>
  );
}

// Cuberto signature: the text "rolls" on hover — the visible copy slides up out of its
// clipped wrapper and an identical duplicate enters from below. Pure CSS transition on
// the house ease; `pointer: fine` gated so phones never see a stuck hover state.
export function TextRoll({
  children,
  className = "",
  as: Tag = "span",
}: {
  children: string;
  className?: string;
  as?: "span" | "h2" | "h3";
}) {
  return (
    <Tag className={`group/roll relative inline-block overflow-hidden ${className}`}>
      <span
        className="block transition-transform duration-500"
        style={{ transitionTimingFunction: "var(--ease-out)" }}
      >
        {children}
      </span>
      <span
        className="absolute left-0 top-full block transition-transform duration-500"
        style={{ transitionTimingFunction: "var(--ease-out)" }}
        aria-hidden="true"
      >
        {children}
      </span>
    </Tag>
  );
}

