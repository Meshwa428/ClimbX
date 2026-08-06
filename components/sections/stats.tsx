"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { CONTAINER, LIGHT_BLOCK, Reveal, SECTION, SectionTitle } from "@/components/sections/kit";

// The numbers — four figures, nothing else. They count up once, on a thin rule, with the
// unit in orange as the only colour on the section.
// TODO(content): verify these figures before launch.
const stats = [
  { prefix: "₹", to: 15, decimals: 0, suffix: "Cr+", label: "Ad spend managed" },
  { prefix: "", to: 50, decimals: 0, suffix: "+", label: "Brands grown" },
  { prefix: "", to: 4.2, decimals: 1, suffix: "x", label: "Average ROAS" },
  { prefix: "", to: 3, decimals: 0, suffix: " yrs", label: "Of consistent results" },
];

// each figure sits a step higher than the last — the section climbs left→right
const CLIMB = ["md:mt-12", "md:mt-8", "md:mt-4", "md:mt-0"];
const DUR_MS = 1400;

function Ticker({ to, decimals, play }: { to: number; decimals: number; play: boolean }) {
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!play) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DUR_MS);
      setN(to * (1 - Math.pow(1 - t, 3))); // ease-out cubic — fast start, soft landing
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [play, to]);

  return <>{n.toFixed(decimals)}</>;
}

export default function Stats() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });
  const reduce = useReducedMotion();

  return (
    // the one surface that carries the blueprint grid — "data-driven", used once, not everywhere
    <section className={LIGHT_BLOCK}>
      <div className="absolute inset-0 bg-graph-dark" />
      <div className={`relative ${SECTION}`}>
        <div className={CONTAINER}>
          <SectionTitle>What the climb adds up to.</SectionTitle>

          <div
            ref={ref}
            className="mt-20 grid gap-x-10 gap-y-14 sm:grid-cols-2 md:mt-28 md:grid-cols-4 md:items-end"
          >
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.07} className={CLIMB[i]}>
                <p className="font-display text-5xl font-bold tabular-nums tracking-[-0.03em] md:text-6xl">
                  {s.prefix}
                  {reduce ? s.to.toFixed(s.decimals) : <Ticker to={s.to} decimals={s.decimals} play={inView} />}
                  <span className="text-brand">{s.suffix}</span>
                </p>
                <p className="mt-5 border-t border-ink/15 pt-5 text-sm text-graphite">{s.label}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
