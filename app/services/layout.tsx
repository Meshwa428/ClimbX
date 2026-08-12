import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "What We Do — ClimbX Digital",
  description:
    "Six disciplines, one ascent. Performance marketing, SEO, social media, brand identity, web design, and strategy consulting.",
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
