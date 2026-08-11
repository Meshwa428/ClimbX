import Footer from "@/components/layout/footer";
import ContactForm from "@/components/sections/contact-form";
import { CONTAINER, SECTION } from "@/components/sections/layout";
import { PageHead, Reveal } from "@/components/sections/kit";

export const metadata = { title: "Get in touch — ClimbX Digital" };

// Details from docs/reference/legacy-site/SITE-MAP.md (footer block).
// TODO(content): real social URLs — the live site still points them at "#".
const details = [
  ["Email", "climbxdigital@gmail.com", "mailto:climbxdigital@gmail.com"],
  ["Phone", "+91 87671 98554", "tel:+918767198554"],
];

export default function Page() {
  return (
    <>
      <main>
        <PageHead eyebrow="Connect" title="Get in touch.">
          Take the first step. Tell us the number that isn&apos;t moving and we&apos;ll come back
          with a route — usually within two working days.
        </PageHead>

        <section className={`bg-white text-ink ${SECTION}`}>
          <div className={`${CONTAINER} grid gap-16 md:grid-cols-[1.4fr_1fr] md:gap-20`}>
            <Reveal>
              <ContactForm />
            </Reveal>

            <Reveal delay={0.08} className="flex flex-col gap-10">
              {details.map(([label, value, href]) => (
                <div key={label}>
                  <p className="font-accent text-xs uppercase tracking-[0.2em] text-ink/45">
                    {label}
                  </p>
                  <a
                    href={href}
                    data-cursor="button"
                    className="mt-2 inline-flex min-h-11 items-center text-lg underline decoration-ink/20 decoration-1 underline-offset-4 transition-colors hover:decoration-brand"
                  >
                    {value}
                  </a>
                </div>
              ))}

              <div>
                <p className="font-accent text-xs uppercase tracking-[0.2em] text-ink/45">Office</p>
                <p className="mt-2 text-lg leading-relaxed">
                  Nagpur,
                  <br />
                  Maharashtra 440001
                </p>
              </div>

              <div>
                <p className="font-accent text-xs uppercase tracking-[0.2em] text-ink/45">Hours</p>
                <p className="mt-2 text-lg leading-relaxed">Mon–Sat, 10:00–19:00 IST</p>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
