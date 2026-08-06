import Link from "next/link";

// Footer — white, roomy. Contact details are outline pills (the site's one button shape),
// navigation sits as two quiet columns on the right.
// TODO(content): real social URLs — the current site still points them at "#".
const left = [
  ["Services", "/services"],
  ["Work", "/work"],
  ["Company", "/about"],
];
const right = [
  ["Careers", "/careers"],
  ["Contact", "/contact"],
  ["FAQ", "/faq"],
];
const legal = [
  ["Privacy Policy", "/privacy-policy"],
  ["Terms & Conditions", "/terms-conditions"],
  ["Refund Policy", "/refund-policy"],
];
const social = [
  ["Instagram", "#"],
  ["Facebook", "#"],
  ["LinkedIn", "#"],
];

const PILL =
  "inline-flex items-center rounded-full border border-ink/25 px-6 py-3.5 text-base transition-colors duration-300 ease-out hover:bg-ink hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand";
const NAV =
  "inline-flex min-h-11 items-center text-lg text-ink/60 transition-colors duration-200 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-sm md:justify-end";

export default function Footer() {
  return (
    // follows the dark CTA — pulled up by its own radius so the corners curve against it
    <footer className="relative -mt-8 rounded-t-[2rem] bg-white px-6 pb-12 pt-24 text-ink md:-mt-12 md:rounded-t-[3rem] md:px-16 md:pb-14 md:pt-40">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-14 md:grid-cols-[1fr_auto]">
          <div className="flex flex-wrap items-start gap-4">
            <a href="mailto:climbxdigital@gmail.com" data-cursor="button" className={PILL}>
              climbxdigital@gmail.com
            </a>
            <a href="tel:+918767198554" data-cursor="button" className={PILL}>
              +91 87671 98554
            </a>
            <p className="mt-6 basis-full text-sm leading-relaxed text-graphite">
              <span className="block text-xs uppercase tracking-[0.2em] text-ink/40">Office</span>
              Nagpur, Maharashtra 440001
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-10 gap-y-1 md:gap-x-14 md:text-right">
            {left.map(([label, href], i) => (
              <span key={label} className="contents">
                <Link href={href} className={NAV}>
                  {label}
                </Link>
                <Link href={right[i][1]} className={NAV}>
                  {right[i][0]}
                </Link>
              </span>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-ink/10 pt-6 md:mt-24 md:pt-8">
          <div className="flex flex-wrap items-center gap-x-6 text-sm text-ink/45">
            {legal.map(([label, href]) => (
              <Link
                key={label}
                href={href}
                className="inline-flex min-h-11 items-center transition-colors hover:text-ink"
              >
                {label}
              </Link>
            ))}
            <span className="inline-flex min-h-11 items-center">© {new Date().getFullYear()}, ClimbX Digital</span>
          </div>
          <div className="flex gap-3">
            {social.map(([label, href]) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                data-cursor="button"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/20 font-accent text-[11px] uppercase transition-colors duration-300 hover:bg-ink hover:text-white"
              >
                {label.slice(0, 2)}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
