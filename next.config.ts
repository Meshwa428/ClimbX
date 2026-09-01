import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // NB: experimental.viewTransition (React's <ViewTransition>) is deliberately OFF, and so is
  // the View Transitions API generally — components/layout/page-transition.tsx runs the page
  // curtain as plain DOM instead. The pseudo-element tree is strictly nested, so a second
  // curtain layer could only live on an ancestor of the page, and clipping an ancestor clips
  // the page with it.
};

export default nextConfig;
