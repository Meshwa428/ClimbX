"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import SplitText from "@/components/reactbits/SplitText";

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
  as?: "h2" | "h3" | "p";
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

// SECTION owns the page gutter + vertical rhythm, CONTAINER owns the measure. Always
// nested (section → SECTION, inner div → CONTAINER) so every headline on the site lands
// on the same left edge — putting both on one element makes the padding eat the max-width.
export const SECTION = "px-6 py-24 md:px-16 md:py-40";
export const CONTAINER = "mx-auto max-w-6xl";
// Blocks are full-bleed — they span the viewport and only the top corners round off, so a
// surface reads as the page changing colour, not as a card floating on it. A block that
// follows a different-coloured one is pulled up by its own radius so the corner notches
// reveal the block underneath; without that overlap the curve has nothing to curve against.
export const DARK_BLOCK =
  "relative -mt-8 rounded-t-[2rem] bg-ink text-white md:-mt-12 md:rounded-t-[3rem]";
export const LIGHT_BLOCK =
  "relative -mt-8 overflow-hidden rounded-t-[2rem] bg-cloud text-ink md:-mt-12 md:rounded-t-[3rem]";
