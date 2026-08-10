import Hero from "@/components/sections/hero";
import Expertise from "@/components/sections/expertise";
import Work from "@/components/sections/work";
import Stats from "@/components/sections/stats";
import Cta from "@/components/sections/cta";
import Footer from "@/components/layout/footer";
import GuitarString from "@/components/effects/guitar-string";

export default function Home() {
  return (
    <>
      <main>
        <Hero />

        {/* Elastic string divider — hero → expertise */}
        <div className="bg-white px-6 md:px-16">
          <div className="mx-auto max-w-6xl">
            <GuitarString height={80} strokeWidth={1.5} color="rgba(26,26,26,0.18)" />
          </div>
        </div>

        <Expertise />

        {/* Elastic string divider — expertise → work (dark) */}
        <div className="bg-white px-6 md:px-16">
          <div className="mx-auto max-w-6xl">
            <GuitarString height={80} strokeWidth={1.5} color="rgba(26,26,26,0.12)" />
          </div>
        </div>

        <Work />
        <Stats />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
