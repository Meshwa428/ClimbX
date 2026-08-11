import type { Metadata } from "next";
import {
  Raleway,
  Space_Grotesk,
  Bebas_Neue,
  Dancing_Script,
  Cormorant_Garamond,
  Inter,
} from "next/font/google";
import "./globals.css";
import Preloader from "@/components/layout/preloader";
import Nav from "@/components/layout/nav";
import PageTransition from "@/components/layout/page-transition";
import Cursor from "@/components/effects/cursor";
import SmoothScroll from "@/components/layout/smooth-scroll";
import Strings from "@/components/effects/strings";

// Brand type system (Design.md §2). Helvetica Now (body) → Inter substitute until licensed.
const raleway = Raleway({ variable: "--font-raleway", subsets: ["latin"] });
const grotesk = Space_Grotesk({ variable: "--font-grotesk", subsets: ["latin"] });
const bebas = Bebas_Neue({ variable: "--font-bebas", subsets: ["latin"], weight: "400" });
const dancing = Dancing_Script({ variable: "--font-dancing", subsets: ["latin"] });
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ClimbX Digital — Your Partner in Digital Growth",
  description:
    "A results-driven digital marketing agency helping startups climb — step by step. Data-driven marketing, clear strategy, real results.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${raleway.variable} ${grotesk.variable} ${bebas.variable} ${dancing.variable} ${cormorant.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <Preloader />
        <SmoothScroll />
        <PageTransition />
        <Cursor />
        <Nav />
        <Strings />
        {children}
      </body>
    </html>
  );
}
