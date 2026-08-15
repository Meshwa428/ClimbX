import Cta from "@/components/sections/cta";
import Footer from "@/components/layout/footer";
import { StringRow } from "@/components/effects/guitar-string";
import { CONTAINER, DARK_BLOCK, SECTION } from "@/components/sections/layout";
import { PageHead, Reveal, SectionTitle, SplitReveal } from "@/components/sections/kit";

export const metadata = {
  title: "Built around your brand. — ClimbX Digital",
  description:
    "ClimbX Digital is a results-driven digital marketing agency in Nagpur — strategic thinking, creative execution, and numbers you can check.",
};

// Copy from docs/reference/legacy-site/text/about.txt, verbatim where it earns its place.
// The founder's letter is the page's centrepiece — it is the only first-person voice on the
// whole site, so it gets the ink block to itself.
const specialties = [
  ["Social media & content", "The cadence, the formats, and the calendar that survives a real week."],
  ["Performance marketing", "Paid media planned, built and read against one number that matters."],
  ["Website design", "Fast, premium builds that turn qualified traffic into enquiries."],
  ["Branding", "Identity systems that make a brand impossible to confuse with the next one."],
];

const letter = [
  "ClimbX Digital was built from a simple belief — every brand has potential, but not every brand gets the right direction online. Over time, working with different businesses helped me understand something important: growth is not just about following trends, it's about building trust.",
  "Every project we take on is approached with responsibility because behind every brand is someone's vision. We don't see our clients as just accounts. We see them as partners we grow alongside.",
];

export default function Page() {
  return (
    <>
      <main>
        <PageHead eyebrow="About ClimbX Digital" title="Built around your brand.">
          A results-driven digital marketing agency for brands that want to scale and stand out —
          strategic thinking on one side, creative execution on the other.
        </PageHead>

        <section className={`bg-white text-ink ${SECTION}`}>
          <div className={CONTAINER}>
            {/* Two paragraphs, set large. One idea per screen (Design.md §0) — the page earns
                the right to a list only after it has said what it is. */}
            <div className="max-w-3xl">
              <SplitReveal className="font-display text-2xl font-medium leading-snug tracking-[-0.01em] md:text-4xl">
                Whether you are a startup or an established business, we deliver data-backed work
                designed for ROI and long-term growth.
              </SplitReveal>
              <Reveal delay={0.1}>
                <p className="mt-10 text-lg leading-relaxed text-graphite md:text-xl">
                  Customised strategy, creative storytelling and measurable performance — delivered
                  with responsibility. That last word is the one we are strictest about: behind
                  every brand is somebody&apos;s vision, and it is not ours to experiment with.
                </p>
              </Reveal>
            </div>

            {/* The specialities climb: each row indents one step further than the last. */}
            <div className="mt-20 md:mt-32">
              <SectionTitle>What we specialise in.</SectionTitle>
              <div className="mt-14 md:mt-20">
                {specialties.map(([title, copy], i) => (
                  <Reveal key={title} delay={i * 0.06}>
                    <div
                      className="flex flex-col gap-3 border-t border-ink/12 py-9 md:flex-row md:items-baseline md:gap-12 md:py-11"
                      style={{ paddingLeft: `${i * 0.5}rem` }}
                    >
                      <span className="font-accent text-xs tabular-nums text-burnt md:w-10">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="font-display text-2xl font-bold tracking-[-0.01em] md:w-80 md:text-3xl">
                        {title}
                      </h3>
                      <p className="max-w-md text-base leading-relaxed text-graphite md:text-lg">
                        {copy}
                      </p>
                    </div>
                  </Reveal>
                ))}
                <div className="border-t border-ink/12" />
              </div>
            </div>
          </div>
        </section>

        <StringRow />

        {/* Words from the founder — ink, generous, signed in the brand's script face. The
            only place the script font appears on the site, which is what makes it read as a
            signature rather than decoration. */}
        <section className={DARK_BLOCK}>
          <div className={SECTION}>
            <div className={CONTAINER}>
              <p className="font-accent text-xs uppercase tracking-[0.3em] text-brand">
                Words from the founder
              </p>
              <div className="mt-10 max-w-3xl md:mt-14">
                {letter.map((p, i) => (
                  <Reveal key={i} delay={i * 0.08}>
                    <p className="mt-8 text-xl leading-relaxed text-white/80 first:mt-0 md:text-2xl">
                      {p}
                    </p>
                  </Reveal>
                ))}
                <Reveal delay={0.2}>
                  <div className="mt-12 md:mt-16">
                    <p className="font-script text-4xl text-brand md:text-5xl">Anupam Kamble</p>
                    <p className="mt-3 font-accent text-xs uppercase tracking-[0.25em] text-white/45">
                      Founder, ClimbX Digital
                    </p>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        <Cta />
      </main>
      <Footer />
    </>
  );
}
