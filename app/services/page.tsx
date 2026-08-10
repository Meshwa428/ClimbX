import ServicesHero from "@/components/sections/services-hero";
import ServicesList from "@/components/sections/services-list";
import ServicesProcess from "@/components/sections/services-process";
import Cta from "@/components/sections/cta";
import Footer from "@/components/layout/footer";
import GuitarString from "@/components/effects/guitar-string";

export const metadata = {
  title: "What We Do — ClimbX Digital",
  description:
    "Performance marketing, SEO, social media, branding, web design and strategic consulting — six disciplines, one ascent.",
};

export default function Page() {
  return (
    <>
      <main>
        <ServicesHero />

        {/* Guitar string — hero → service cards */}
        <div className="bg-white px-6 md:px-16">
          <div className="mx-auto max-w-6xl">
            <GuitarString height={70} strokeWidth={1.5} color="rgba(26,26,26,0.16)" />
          </div>
        </div>

        <ServicesList />

        {/* Guitar string — service cards → process */}
        <div className="bg-white px-6 md:px-16">
          <div className="mx-auto max-w-6xl">
            <GuitarString height={70} strokeWidth={1.5} color="rgba(26,26,26,0.12)" />
          </div>
        </div>

        <ServicesProcess />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
