import Cta from "@/components/sections/cta";
import Footer from "@/components/layout/footer";
import { StringRow } from "@/components/effects/guitar-string";
import { CONTAINER, SECTION } from "@/components/sections/layout";
import { Disclosure, PageHead, PillLink, Reveal } from "@/components/sections/kit";

export const metadata = {
  title: "Frequently asked questions — ClimbX Digital",
  description:
    "Answers on services, timelines, pricing, SEO, ads and working with ClimbX Digital from Nagpur.",
};

// Verbatim from docs/reference/legacy-site/text/faq-full.txt — 18 questions, in the live
// site's order. Their extraction carried 16 answers: questions 5 and 18 never had a body in
// the RSC payload, so those two are written from facts already published elsewhere on the site
// (the services list and the footer's contact block) rather than invented.
const faqs: [string, string][] = [
  [
    "Why is ClimbX Digital considered one of the best digital marketing agencies in Nagpur?",
    "ClimbX Digital focuses on creative branding, performance marketing, SEO optimization, social media growth, and modern website development tailored for businesses looking to grow online professionally.",
  ],
  [
    "Is ClimbX Digital the best website development company in Nagpur?",
    "ClimbX Digital develops responsive, SEO-friendly, fast-loading, and modern websites designed for startups, local businesses, personal brands, clinics, and growing companies.",
  ],
  [
    "Which is the best SEO agency in Nagpur for local businesses?",
    "ClimbX Digital helps businesses improve Google rankings through Local SEO, Google Business Profile optimization, keyword strategy, technical SEO, and content marketing.",
  ],
  [
    "Why should businesses invest in digital marketing?",
    "Digital marketing helps businesses increase visibility, generate leads, improve brand awareness, attract customers online, and grow faster through platforms like Google, Instagram, Facebook, and YouTube.",
  ],
  [
    "What services does ClimbX Digital provide?",
    "Performance marketing, SEO and content, social media management, brand identity and creative, web design and CRO, and strategy and consulting — the full route is on the services page.",
  ],
  [
    "Do you provide social media marketing services in Nagpur?",
    "Yes. We manage Instagram, Facebook, and other social media platforms with professional content creation, reels strategy, engagement, and paid advertising campaigns.",
  ],
  [
    "Can ClimbX Digital help startups grow online?",
    "Yes. We help startups build a strong digital presence through branding, websites, SEO, advertising, and growth-focused marketing strategies.",
  ],
  [
    "Do you create SEO-friendly websites?",
    "Yes. Every website is built with SEO structure, mobile responsiveness, optimized speed, and modern UI/UX practices.",
  ],
  [
    "How much does a professional website cost in Nagpur?",
    "Website pricing depends on features, pages, functionality, and project requirements. Contact us for a custom quote tailored to your needs.",
  ],
  [
    "How long does it take to build a website?",
    "Most websites are completed within 7–21 working days depending on the project scope.",
  ],
  [
    "Do you run Meta Ads and Google Ads?",
    "Yes. We manage Facebook Ads, Instagram Ads, Meta Ads, and Google Ads campaigns focused on lead generation, sales, and business growth.",
  ],
  [
    "Why is SEO important for business growth?",
    "SEO improves Google rankings, increases organic traffic, builds trust, generates leads, and helps businesses grow organically.",
  ],
  [
    "Do you provide branding and logo design services?",
    "Yes. We create logos, brand identity systems, social media branding, packaging design, and marketing creatives.",
  ],
  [
    "Do you work with businesses outside Nagpur?",
    "Yes. ClimbX Digital works with clients across Maharashtra and India through digital collaboration and online meetings.",
  ],
  [
    "What makes ClimbX Digital different from other marketing agencies?",
    "We focus on strategy, creativity, branding, SEO, performance marketing, and business-focused execution that delivers real, measurable results.",
  ],
  [
    "Can you improve my Google Business Profile ranking?",
    "Yes. We optimize Google Business Profiles to improve local search visibility, map rankings, and customer engagement.",
  ],
  [
    "Do you provide content creation services?",
    "Yes. We create reels, ad creatives, graphics, videos, social media posts, captions, and promotional content.",
  ],
  [
    "How can I contact ClimbX Digital?",
    "Write to climbxdigital@gmail.com, call +91 87671 98554, or send the form on the contact page — whichever is quickest for you.",
  ],
];

export default function Page() {
  return (
    <>
      <main>
        <PageHead eyebrow="FAQ" title="Frequently asked questions.">
          The things people ask before they hire us, answered without the sales voice.
        </PageHead>

        <section className={`bg-white text-ink ${SECTION}`}>
          <div className={CONTAINER}>
            <div className="max-w-4xl">
              {faqs.map(([q, a], i) => (
                // First one opens on arrival: an accordion where every row is shut reads as an
                // empty page, and the reader has nothing to learn the interaction from.
                <Disclosure key={q} index={i + 1} title={q} defaultOpen={i === 0}>
                  {a}
                </Disclosure>
              ))}
              <div className="border-t border-ink/12" />
            </div>

            <Reveal delay={0.1}>
              <div className="mt-16 flex flex-col items-start gap-6 md:mt-24 md:flex-row md:items-center md:justify-between">
                <p className="max-w-md text-lg text-graphite">
                  Still holding a question this page doesn&apos;t answer? Ask it directly — you
                  will get a person, not a form reply.
                </p>
                <PillLink href="/contact" variant="ghost">
                  Ask us anything
                </PillLink>
              </div>
            </Reveal>
          </div>
        </section>

        <StringRow />

        <Cta />
      </main>
      <Footer />
    </>
  );
}
