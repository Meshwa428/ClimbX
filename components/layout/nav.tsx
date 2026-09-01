"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Menu, X } from "lucide-react";
import { NAV_EVENT } from "@/components/layout/page-transition";

// Primary nav — floating glassmorphism pill, centered top-middle (grid keeps it dead
// center; logo sits left). The active indicator is a duplicate of the list stacked on
// top: it carries the filled background + inverted text, and is clipped to the active
// pill. Animating that clip-path slides the indicator and inverts the label for free.
//
// Below lg the pill can't fit (6 labels ≈ 480px + the logo chip), so it's swapped for a
// toggle + a
// full-screen ink menu. ponytail: in-repo panel, not React Bits StaggeredMenu — that
// one is the Phase-1 *expanded* menu (gsap, tick sound, socials) and isn't installed
// yet; when it lands it replaces the panel body, not this toggle.
const links = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Work", href: "/work" },
  { label: "About", href: "/about" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/contact" },
];

const ITEM = "block rounded-full px-4 py-2.5 font-accent text-xs font-medium whitespace-nowrap";
// same glass recipe for the logo chip and the pill, so the nav stays legible over the
// ink blocks it floats across (a bare dark logo on an ink section disappears)
const GLASS =
  "rounded-full border border-white/70 bg-white/80 shadow-[0_8px_30px_rgba(26,26,26,0.12),inset_0_1px_0_rgba(255,255,255,0.75)] backdrop-blur-md backdrop-saturate-150";
const EASE_PANEL = [0.83, 0, 0.17, 1] as [number, number, number, number];

const indexOf = (path: string) =>
  Math.max(0, links.findIndex((l) => (l.href === "/" ? path === "/" : path.startsWith(l.href))));

export default function Nav() {
  const pathname = usePathname();
  // PageTransition fires NAV_EVENT on click and holds the straps back for a beat, so the
  // pill slides to its new home first — the real pathname lands a moment later.
  const [target, setTarget] = useState<string | null>(null);
  const active = indexOf(target ?? pathname);
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const onNav = (e: Event) => {
      setTarget((e as CustomEvent<string>).detail);
      setOpen(false); // a link inside the panel was taken — get out of the way of the straps
    };
    window.addEventListener(NAV_EVENT, onNav);
    return () => window.removeEventListener(NAV_EVENT, onNav);
  }, []);
  useEffect(() => setTarget(null), [pathname]); // route landed — hand control back

  // while the panel is up: no page scroll behind it, Escape closes, focus goes inside
  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const toggle = toggleRef.current;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    firstLinkRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      html.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      toggle?.focus();
    };
  }, [open]);

  const [ready, setReady] = useState(false); // no transition on the first measure
  const [clip, setClip] = useState("inset(0px 100% 0px 0px round 999px)");
  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

  const measure = useCallback(() => {
    const list = listRef.current;
    const item = itemRefs.current[active];
    if (!list || !item) return;
    const l = list.getBoundingClientRect();
    const r = item.getBoundingClientRect();
    if (!l.width) return; // pill is display:none below lg — nothing to place
    const left = r.left - l.left;
    const right = l.width - (left + r.width);
    setClip(`inset(0px ${Math.max(0, right)}px 0px ${Math.max(0, left)}px round 999px)`);
  }, [active]);

  useEffect(() => {
    measure();
    // enable the transition only after the indicator has been placed once
    const id = requestAnimationFrame(() => setReady(true));
    const list = listRef.current;
    const ro = new ResizeObserver(measure);
    if (list) ro.observe(list);
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure).catch(() => {}); // widths shift once fonts load
    return () => {
      cancelAnimationFrame(id);
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50">
        {/* same gutter + measure as SECTION/CONTAINER, so the logo sits on the exact
            left edge every headline on the site starts from */}
        {/* half the padding it had — the chip carries its own presence, the air above it was
            only making the page start late */}
        <div className="px-6 py-2 md:px-16 md:py-2.5">
          <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto] items-center gap-3 lg:grid-cols-[1fr_auto_1fr]">
            {/* logo — rides its own glass chip so it survives the dark sections */}
            <Link
              href="/"
              aria-label="ClimbX Digital — home"
              className={`flex items-center justify-self-start px-4 py-2.5 ${GLASS}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo/climbx-logo.png"
                alt="ClimbX Digital"
                width={114}
                height={32}
                className="h-6 w-auto shrink-0 sm:h-7"
              />
            </Link>

            {/* glassmorphism pill — centered, md and up only */}
            <nav className={`hidden justify-self-center p-1.5 lg:block ${GLASS}`}>
              <div className="relative">
                {/* base list — real, focusable links */}
                <ul ref={listRef} className="flex items-center gap-1">
                  {links.map((l, i) => (
                    <li
                      key={l.label}
                      ref={(el) => {
                        itemRefs.current[i] = el;
                      }}
                    >
                      <Link
                        href={l.href}
                        aria-current={i === active ? "page" : undefined}
                        className={`${ITEM} cursor-pointer text-ink/70 transition-colors duration-200 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30`}
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>

                {/* indicator — same list, filled + inverted text, clipped to the active pill */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
                  style={{
                    clipPath: clip,
                    transition: ready ? "clip-path 300ms cubic-bezier(0.65, 0, 0.35, 1)" : "none",
                    willChange: "clip-path",
                  }}
                >
                  <ul className="flex h-full items-center gap-1 bg-ink">
                    {links.map((l) => (
                      <li key={l.label}>
                        <span className={`${ITEM} text-white`}>{l.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </nav>

            {/* mobile toggle — 44px target, same glass chip */}
            <button
              ref={toggleRef}
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className={`flex h-11 w-11 cursor-pointer items-center justify-center justify-self-end text-ink transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 active:scale-[0.97] lg:hidden ${GLASS}`}
            >
              {open ? <X size={19} /> : <Menu size={19} />}
            </button>

            <span aria-hidden className="hidden lg:block lg:justify-self-end" />
          </div>
        </div>
      </header>

      {/* full-screen menu — the climb: rungs numbered from the bottom up */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="fixed inset-0 z-[60] flex flex-col bg-ink bg-graph text-white lg:hidden"
            initial={reduce ? { opacity: 0 } : { y: "-100%" }}
            animate={reduce ? { opacity: 1 } : { y: 0 }}
            exit={reduce ? { opacity: 0 } : { y: "-100%" }}
            transition={{ duration: reduce ? 0.001 : 0.42, ease: EASE_PANEL }}
          >
            <div className="flex items-center justify-between px-5 py-4 sm:px-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo/climbx-logo-white.png"
                alt="ClimbX Digital"
                width={455}
                height={584}
                className="h-9 w-auto"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/20 text-white transition-colors duration-200 hover:bg-white hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand active:scale-[0.97]"
              >
                <X size={19} />
              </button>
            </div>

            <nav className="flex flex-1 flex-col justify-center px-5 sm:px-6">
              <ul>
                {links.map((l, i) => (
                  <motion.li
                    key={l.label}
                    initial={reduce ? false : { opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.12 + i * 0.045 }}
                    style={{ paddingLeft: `${i * 0.5}rem` }}
                  >
                    <Link
                      ref={i === 0 ? firstLinkRef : undefined}
                      href={l.href}
                      aria-current={i === active ? "page" : undefined}
                      onClick={() => setOpen(false)}
                      className="flex items-baseline gap-4 py-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                    >
                      <span className="font-accent text-[11px] tabular-nums text-brand">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={`font-display text-[2rem] font-bold leading-none tracking-[-0.02em] transition-colors duration-200 sm:text-4xl ${
                          i === active ? "text-white" : "text-white/55"
                        }`}
                      >
                        {l.label}
                      </span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </nav>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/10 px-5 py-6 text-sm text-white/55 sm:px-6">
              <a
                href="mailto:climbxdigital@gmail.com"
                className="inline-flex min-h-11 items-center transition-colors duration-200 hover:text-white"
              >
                climbxdigital@gmail.com
              </a>
              <a
                href="tel:+918767198554"
                className="inline-flex min-h-11 items-center transition-colors duration-200 hover:text-white"
              >
                +91 87671 98554
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
