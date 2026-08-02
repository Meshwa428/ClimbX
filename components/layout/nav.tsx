"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_EVENT } from "@/components/layout/page-transition";

// Primary nav — floating glassmorphism pill, centered top-middle (grid keeps it dead
// center; logo sits left). The active indicator is a duplicate of the list stacked on
// top: it carries the filled background + inverted text, and is clipped to the active
// pill. Animating that clip-path slides the indicator and inverts the label for free.
const links = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Work", href: "/work" },
  { label: "About", href: "/about" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/contact" },
];

const ITEM = "block rounded-full px-4 py-2 font-accent text-xs font-medium whitespace-nowrap";

const indexOf = (path: string) =>
  Math.max(0, links.findIndex((l) => (l.href === "/" ? path === "/" : path.startsWith(l.href))));

export default function Nav() {
  const pathname = usePathname();
  // PageTransition fires NAV_EVENT on click and holds the straps back for a beat, so the
  // pill slides to its new home first — the real pathname lands a moment later.
  const [target, setTarget] = useState<string | null>(null);
  const active = indexOf(target ?? pathname);

  useEffect(() => {
    const onNav = (e: Event) => setTarget((e as CustomEvent<string>).detail);
    window.addEventListener(NAV_EVENT, onNav);
    return () => window.removeEventListener(NAV_EVENT, onNav);
  }, []);
  useEffect(() => setTarget(null), [pathname]); // route landed — hand control back
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
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-6 py-5">
        {/* logo */}
        <Link href="/" aria-label="ClimbX Digital — home" className="flex items-center justify-self-start">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo/climbx-logo.png"
            alt="ClimbX Digital"
            width={114}
            height={32}
            className="h-7 w-auto sm:h-8"
          />
        </Link>

        {/* glassmorphism pill — centered */}
        <nav className="justify-self-center rounded-full border border-white/70 bg-white/55 p-1.5 shadow-[0_8px_30px_rgba(26,26,26,0.12),inset_0_1px_0_rgba(255,255,255,0.75)] backdrop-blur-md backdrop-saturate-150">
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

        <span aria-hidden className="justify-self-end" />
      </div>
    </header>
  );
}
