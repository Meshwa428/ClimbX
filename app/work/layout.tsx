// `page.tsx` is a client component (the filter is stateful), so its metadata lives here.
export const metadata = {
  title: "Work That Climbs. — ClimbX Digital",
  description:
    "Case studies from ClimbX Digital — paid media, SEO, social and brand work, with the numbers each climb moved.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
