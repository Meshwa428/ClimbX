"use client";

import { useState } from "react";
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
  // Cuberto's `Ul` helper, verbatim: 70px of travel over 2s on expo.out, with the fade
  // finishing in half that. The long tail is the point — 18px in 600ms is over before the eye
  // registers it started, which is why the work images read as popping into place. Split
  // durations, because one 2s fade would leave the card ghosted for most of its travel.
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 70 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        y: { duration: 2, ease: EASE, delay },
        opacity: { duration: 1, delay },
      }}
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

// Disclosure — one row of an accordion (FAQ, legal pages). The open/shut animation is the
// same `grid-template-rows: 0fr → 1fr` idiom the home services stack uses, so disclosure
// feels identical everywhere on the site. A real <button> with aria-expanded, because this
// discloses copy in place and never navigates.
export function Disclosure({
  index,
  title,
  children,
  defaultOpen = false,
}: {
  index: number;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-ink/12">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        data-cursor="button"
        className="group/row flex w-full cursor-pointer items-start gap-6 py-7 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand md:gap-10 md:py-9"
      >
        <span className="mt-1 font-accent text-xs tabular-nums text-burnt md:mt-2">
          {String(index).padStart(2, "0")}
        </span>
        <span className="flex-1 font-display text-xl font-bold tracking-[-0.01em] transition-opacity duration-300 fine:group-hover/row:opacity-70 md:text-2xl">
          {title}
        </span>
        {/* Plus that becomes a minus: two rules, one of them rotating away. Cheaper and
            crisper at this size than an icon swap, and it never reflows. */}
        <span aria-hidden className="relative mt-2 h-4 w-4 shrink-0 md:mt-3">
          <span className="absolute left-0 top-1/2 h-px w-4 -translate-y-1/2 bg-ink" />
          <span
            className="absolute left-1/2 top-0 h-4 w-px -translate-x-1/2 bg-ink transition-transform duration-300"
            style={{
              transform: `translateX(-50%) rotate(${open ? 90 : 0}deg)`,
              transitionTimingFunction: "var(--ease-out)",
            }}
          />
        </span>
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-500"
        style={{
          gridTemplateRows: open ? "1fr" : "0fr",
          transitionTimingFunction: "var(--ease-out)",
        }}
      >
        <div className="overflow-hidden">
          <div
            className="max-w-2xl pb-8 pl-[3.25rem] text-base leading-relaxed text-graphite transition-opacity duration-300 md:pl-[4.5rem] md:text-lg"
            style={{ opacity: open ? 1 : 0 }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// Buttons. One shape for the whole site: solid ink pill is primary, outline is secondary,
// and the hover is Cuberto's `.cb-btn_cta` — the flood + text roll defined in `globals.css`.
// `onDark` is the only knob: it swaps `--pill-ink`/`--pill-bg`, and the flood, the border and
// the incoming label all follow from those two.
//
// No magnetic pull any more. It fought the flood — the box drifting under the pointer while
// ink climbed it read as two effects arguing, and the button that has to be chased is worse
// than the one that stays put.
type PillProps = {
  children: React.ReactNode;
  variant?: "solid" | "ghost";
  onDark?: boolean;
  className?: string;
};

const pillClass = ({ variant = "solid", onDark = false, className = "" }: PillProps) =>
  `pill ${variant === "solid" ? "-solid" : "-ghost"} ${onDark ? "-on-dark" : ""} cursor-pointer px-9 py-4 font-accent text-base font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${className}`;

// The label is rendered twice on purpose: the second copy is the one waiting below the clip,
// already the colour it needs to be once the flood has covered the button.
function PillBody({ children, variant = "solid" }: PillProps) {
  return (
    <>
      {variant === "ghost" && <span aria-hidden className="pill-border" />}
      <span aria-hidden className="pill-ripple">
        <span />
      </span>
      <span className="pill-label">
        <span>{children}</span>
        <span aria-hidden>{children}</span>
      </span>
    </>
  );
}

export function PillLink({ href, ...p }: PillProps & { href: string }) {
  return (
    <Link href={href} data-cursor="button" className={pillClass(p)}>
      <PillBody {...p} />
    </Link>
  );
}

export function PillButton({
  type = "button",
  onClick,
  ...p
}: PillProps & { type?: "button" | "submit"; onClick?: () => void }) {
  return (
    <button type={type} onClick={onClick} data-cursor="button" className={pillClass(p)}>
      <PillBody {...p} />
    </button>
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

