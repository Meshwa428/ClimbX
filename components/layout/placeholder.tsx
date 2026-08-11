import Link from "next/link";
import GuitarString from "@/components/effects/guitar-string";

// ponytail: one shell for every route we haven't designed yet. Exists so the nav/footer
// never 404 and page transitions are testable. Replace per-page as each phase lands.
export default function Placeholder({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center bg-cloud px-6 py-28 text-center text-ink">
      <div className="absolute inset-0 bg-graph-dark" />
      <p className="relative font-accent text-[10px] uppercase tracking-[0.3em] text-burnt">{eyebrow}</p>
      <h1 className="relative mt-4 font-display text-4xl font-semibold sm:text-6xl">{title}</h1>
      <p className="relative mt-4 max-w-md text-sm text-graphite">
        {/* TODO(content): real page — copy captured in docs/reference/legacy-site/ */}
        This page is next on the climb.
      </p>

      {/* Elastic guitar-string divider */}
      <div className="relative mt-10 w-full max-w-xl">
        <GuitarString height={76} strokeWidth={1.2} />
      </div>

      <Link
        href="/"
        className="relative mt-2 inline-flex min-h-11 items-center rounded-full border border-ink/20 px-6 py-2.5 font-accent text-xs text-ink/80 transition-colors duration-200 hover:border-ink/40 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
      >
        Back home
      </Link>
    </main>
  );
}

