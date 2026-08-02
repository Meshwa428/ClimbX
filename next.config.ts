import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // NB: experimental.viewTransition (React's <ViewTransition>) is deliberately OFF —
  // it names the wrapped element, which pulls page content out of the `root` snapshot
  // and breaks the viewport-relative straps geometry. We drive document.startViewTransition
  // ourselves in components/layout/page-transition.tsx.
};

export default nextConfig;
