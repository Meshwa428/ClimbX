import Cta from "@/components/sections/cta";
import Footer from "@/components/layout/footer";
import { CONTAINER, SECTION } from "@/components/sections/layout";
import { PageHead, Reveal, SectionTitle } from "@/components/sections/kit";

export const metadata = { title: "Join the climb — ClimbX Digital" };

// Roles from docs/reference/legacy-site/SITE-MAP.md (`/careers`). No ATS, no form: every
// "apply" is a mailto with the subject pre-filled, which is what the inbox on the other end
// actually is today.
// ponytail: swap for a real application form when there's a backend to receive it.
// TODO(content): real role specs (location, experience, comp band) — the live site has none.
const MAIL = "climbxdigital@gmail.com";
const roles = [
  {
    title: "Performance marketer",
    line: "Own paid accounts end to end — plan, build, read the numbers, kill what doesn't work.",
    tags: ["Nagpur", "Full-time"],
  },
  {
    title: "SEO specialist",
    line: "Technical audits, content briefs, and the patience to let compounding do its job.",
    tags: ["Nagpur", "Full-time"],
  },
  {
    title: "Creative designer",
    line: "Brand systems and ad creative that survive being tested against a conversion number.",
    tags: ["Nagpur", "Full-time"],
  },
];

const why = [
  ["Small rope team", "Six people, no layers. Your work ships to a client, not into a deck."],
  ["Numbers in the open", "Every account's performance is visible to everyone. So is the learning."],
  ["Room to climb", "Nobody stays in the lane they were hired into for long."],
];

const APPLY =
  "inline-flex items-center rounded-full border border-ink/25 px-7 py-3.5 font-accent text-sm transition-colors duration-300 ease-out hover:bg-ink hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand";

export default function Page() {
  return (
    <>
      <main>
        <PageHead eyebrow="Careers" title="Join the climb.">
          We hire people who would rather own a number than a job title. If that reads like you,
          there is a rope here.
        </PageHead>

        <section className={`bg-white text-ink ${SECTION}`}>
          <div className={CONTAINER}>
            <SectionTitle>Open roles.</SectionTitle>

            <div className="mt-16 md:mt-24">
              {roles.map((r, i) => (
                <Reveal key={r.title}>
                  <div
                    className="flex flex-col gap-6 border-t border-ink/10 py-10 md:flex-row md:items-center md:justify-between md:py-14"
                    style={{ paddingLeft: `${i * 0.5}rem` }}
                  >
                    <div>
                      <h3 className="font-display text-3xl font-bold tracking-[-0.02em] md:text-4xl">
                        {r.title}
                      </h3>
                      <p className="mt-3 max-w-lg text-lg text-graphite">{r.line}</p>
                      <p className="mt-4 flex flex-wrap gap-x-4 font-accent text-xs uppercase tracking-[0.2em] text-ink/45">
                        {r.tags.map((t) => (
                          <span key={t}>{t}</span>
                        ))}
                      </p>
                    </div>
                    <a
                      href={`mailto:${MAIL}?subject=${encodeURIComponent(`Application — ${r.title}`)}`}
                      data-cursor="button"
                      className={`${APPLY} shrink-0`}
                    >
                      Apply now
                    </a>
                  </div>
                </Reveal>
              ))}
              <div className="border-t border-ink/10" />
            </div>
          </div>
        </section>

        <section className={`bg-cloud text-ink ${SECTION}`}>
          <div className={CONTAINER}>
            <SectionTitle>What it&apos;s like.</SectionTitle>
            <div className="mt-16 grid gap-10 md:mt-24 md:grid-cols-3 md:gap-12">
              {why.map(([name, copy], i) => (
                <Reveal key={name} delay={i * 0.06} className={i % 2 ? "md:mt-10" : ""}>
                  <h3 className="font-display text-2xl font-bold">{name}</h3>
                  <p className="mt-3 text-base leading-relaxed text-graphite">{copy}</p>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.1}>
              <div className="mt-20 rounded-3xl border border-ink/12 p-10 md:mt-28 md:p-14">
                <h3 className="font-display text-3xl font-bold md:text-4xl">
                  Don&apos;t see your role?
                </h3>
                <p className="mt-4 max-w-lg text-lg text-graphite">
                  Send the work you are proudest of and what you want to be doing in a year. We read
                  every one.
                </p>
                <a
                  href={`mailto:${MAIL}?subject=${encodeURIComponent("Open application — CV")}`}
                  data-cursor="button"
                  className={`${APPLY} mt-8`}
                >
                  Drop your CV
                </a>
              </div>
            </Reveal>
          </div>
        </section>

        <Cta />
      </main>
      <Footer />
    </>
  );
}
