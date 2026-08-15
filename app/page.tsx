import Hero from "@/components/sections/hero";
import Expertise from "@/components/sections/expertise";
import Work from "@/components/sections/work";
import Stats from "@/components/sections/stats";
import Cta from "@/components/sections/cta";
import Footer from "@/components/layout/footer";
import { StringRow } from "@/components/effects/guitar-string";

export default function Home() {
  return (
    <>
      <main>
        <Hero />

        <StringRow />

        <Expertise />

        <StringRow />

        <Work />
        <Stats />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
