// Types for the untyped React Bits source next door. `from`/`to` are GSAP vars, so they
// stay open — inferring them from the JS defaults types them as `{opacity, y}` and rejects
// every other GSAP property (yPercent, scale, …).
declare const SplitText: (props: {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: string;
  splitType?: "chars" | "words" | "lines" | "words, chars";
  from?: Record<string, string | number>;
  to?: Record<string, string | number>;
  threshold?: number;
  rootMargin?: string;
  textAlign?: "left" | "center" | "right";
  tag?: "h1" | "h2" | "h3" | "p" | "span";
  mask?: "chars" | "words" | "lines";
  onLetterAnimationComplete?: () => void;
}) => React.ReactElement;

export default SplitText;
