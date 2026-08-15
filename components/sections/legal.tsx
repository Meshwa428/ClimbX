import Footer from "@/components/layout/footer";
import { StringRow } from "@/components/effects/guitar-string";
import { CONTAINER, SECTION } from "@/components/sections/layout";
import { Disclosure, PageHead, Reveal } from "@/components/sections/kit";
import type { LegalDoc } from "@/lib/legal-content";

// One shell for all three legal routes — same numbered disclosure as the FAQ, so a reader who
// has met one accordion on this site has met them all. No CTA block here: a policy page is
// somewhere you go to check a clause, not a place to be sold to.
export default function Legal({ doc, eyebrow }: { doc: LegalDoc; eyebrow: string }) {
  return (
    <>
      <main>
        <PageHead eyebrow={eyebrow} title={`${doc.title}.`}>
          {doc.effective}
        </PageHead>

        <section className={`bg-white text-ink ${SECTION}`}>
          <div className={CONTAINER}>
            <div className="max-w-4xl">
              {doc.sections.map((s, i) => (
                <Disclosure key={s.title} index={i + 1} title={s.title} defaultOpen={i === 0}>
                  {/* A section is either one bullet list, or a lead paragraph with the rest as
                      bullets under it — exactly how the published policy is structured. */}
                  {s.kind === "ul" ? (
                    <ul className="list-disc space-y-2 pl-5">
                      {s.blocks.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  ) : (
                    <>
                      <p>{s.blocks[0]}</p>
                      {s.blocks.length > 1 && (
                        <ul className="mt-3 list-disc space-y-2 pl-5">
                          {s.blocks.slice(1).map((b) => (
                            <li key={b}>{b}</li>
                          ))}
                        </ul>
                      )}
                    </>
                  )}
                </Disclosure>
              ))}
              <div className="border-t border-ink/12" />
            </div>

            <Reveal delay={0.1}>
              <p className="mt-14 max-w-xl text-base text-graphite md:mt-20">
                Questions about anything on this page?{" "}
                <a
                  href="mailto:climbxdigital@gmail.com"
                  data-cursor="button"
                  className="cursor-pointer underline decoration-brand decoration-2 underline-offset-4 transition-colors hover:text-ink"
                >
                  climbxdigital@gmail.com
                </a>
              </p>
            </Reveal>
          </div>
        </section>

        <StringRow />
      </main>
      <Footer />
    </>
  );
}
