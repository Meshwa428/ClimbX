# The Magic of Clip Path

`clip-path` is often used for trimming a DOM node into specific shapes, like triangles. But it's also great for animations.

This post explores several practical uses of `clip-path` for building smooth, performant animations and interactions.

## The Basics

The `clip-path` property clips an element into a specific shape. It creates a clipping region — content outside the region is hidden, content inside stays visible. This is how you can turn a rectangle into a circle, for example:

```css
.circle {
  clip-path: circle(50% at 50% 50%);
}
```

`clip-path` has no effect on layout — an element with `clip-path` occupies the same space as one without it, just like `transform`.

Circles are positioned using a coordinate system starting at the top-left corner (0, 0). `circle(50% at 50% 50%)` means the circle has a radius of 50% and is centered at 50% from the top and 50% from the left — the center of the element.

Other values include `ellipse`, `polygon`, and `url()` (for using a custom SVG as the clipping path), but this post focuses on `inset`, since that's what's used for all the animations below.

`inset` values define the top, right, bottom, and left offsets of a rectangle:

- `inset(100%)` — hides the whole element
- `inset(0 50% 0 0)` — hides the right half of the element

Since `clip-path` can "hide" parts of an element, this opens up a lot of animation possibilities.

## Comparison Sliders

Before/after sliders are usually built with two `div`s using `overflow: hidden` and animated widths, but a more performant approach uses `clip-path`.

Overlay two images on top of each other, then apply `clip-path: inset(0 50% 0 0)` to the top image to hide its right half, adjusting the inset value based on drag position. This avoids the extra wrapper element the `overflow: hidden` approach requires, and runs on the compositor thread since `clip-path` is hardware-accelerated.

The same idea works for text-mask effects: overlay two text elements, hide the bottom half of one with `clip-path: inset(0 0 50% 0)` and the top half of the other with `clip-path: inset(50% 0 0 0)`, then adjust both based on mouse position. This is really just a vertical comparison slider that doesn't look like one — the flexibility comes down to creativity in how the layers are styled (e.g. a dashed stroke on one layer, a solid fill on the other).

## Animating Images (Reveal Effect)

`clip-path` also works well for image reveal effects. Start with a `clip-path` that fully covers the image, then animate it open:

```css
.image-reveal {
  clip-path: inset(0 0 100% 0);
  animation: reveal 1s forwards cubic-bezier(0.77, 0, 0.175, 1);
}

@keyframes reveal {
  to {
    clip-path: inset(0 0 0 0);
  }
}
```

This could also be done by animating `height`, but `clip-path` has two advantages: it's hardware-accelerated (more performant than animating height), and it avoids layout shift since the image is already in place, just clipped.

## Triggering on Scroll

An image reveal needs to trigger when the image enters the viewport, otherwise the animation is never seen. Framer Motion's `useInView` hook returns whether an element is in the viewport, which can drive the animation:

```jsx
"use client";

import { useInView } from "framer-motion";
import { useRef } from "react";

export default function ImageRevealInner() {
  const ref = useRef(null);
  // Trigger once, when at least 100px of the image is in view
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  if (isInView && ref.current) {
    ref.current.animate(
      [{ clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0 0)" }],
      {
        duration: 1000,
        fill: "forwards",
        easing: "cubic-bezier(0.77, 0, 0.175, 1)",
      },
    );
  }

  return (
    <img
      className="image-reveal"
      src="/your-image.jpg"
      alt=""
      height={430}
      width={644}
      ref={ref}
    />
  );
}
```

WAAPI (Web Animations API) is used here instead of CSS `@keyframes` to keep all animation logic in one place. The `once` option ensures the animation fires only once; `margin` controls how far into the viewport the element needs to be before triggering.

If you're not already using Framer Motion in a project, the native [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) is a lighter-weight alternative for this same trigger logic.

## Scroll-Linked Progress

Another scroll interaction: a vertical line that grows as you scroll. It can look like an SVG path being drawn, but it's actually just a clipped `div` being gradually revealed.

Using Framer Motion's `useScroll` hook to track scroll progress of a container:

```js
const { scrollYProgress } = useScroll({
  target: containerRef,
  offset: ["start end", "end end"],
});

const clipPathY = useTransform(scrollYProgress, [0, 1], ["100%", "0%"]);
```

The `offset` option means measurement starts when the top of the element reaches the bottom of the viewport, and ends when the bottom of the element reaches the bottom of the viewport — so the animation doesn't reverse once the user scrolls past it.

`scrollYProgress` is a Framer Motion "motion value" — an internal reactive value that updates without re-rendering the component. To use it inside `clip-path`, wrap it with `useMotionTemplate`:

```js
const motionClipPath = useMotionTemplate`inset(0 0 ${clipPathY} 0)`;
```

```jsx
<motion.div
  ref={containerRef}
  style={{ clipPath: motionClipPath }} // updates automatically
>
  ...
</motion.div>
```

Keeping `scrollYProgress` as a motion value (rather than storing it in a plain `const`/state variable) is what allows the style to update automatically on scroll.

## Tabs Transition

A common tab-bar pattern: the active tab has a different text color than the inactive ones. The naive fix is a color transition on the text, which looks okay but not great.

A better approach: duplicate the tab list, style the duplicate to look "active" (e.g. blue background, white text), then use `clip-path` to reveal only the active tab from that duplicated list:

```css
clip-path: inset(0px 75% 0px 0% round 17px);
```

On click, animate the inset values to slide the reveal window over to the newly active tab. This produces a seamless transition without ever needing to time a color crossfade.

```jsx
"use client";

import { useEffect, useRef, useState } from "react";

export default function TabsClipPath() {
  const [activeTab, setActiveTab] = useState(TABS[0].name);
  const containerRef = useRef(null);
  const activeTabElementRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;

    if (activeTab && container) {
      const activeTabElement = activeTabElementRef.current;

      if (activeTabElement) {
        const { offsetLeft, offsetWidth } = activeTabElement;

        const clipLeft = offsetLeft;
        const clipRight = offsetLeft + offsetWidth;
        container.style.clipPath = `inset(0 ${Number(
          100 - (clipRight / container.offsetWidth) * 100
        ).toFixed()}% 0 ${Number(
          (clipLeft / container.offsetWidth) * 100
        ).toFixed()}% round 17px)`;
      }
    }
  }, [activeTab]);

  return (
    <div className="wrapper">
      <ul className="list">
        {TABS.map((tab) => (
          <li key={tab.name}>
            <button
              ref={activeTab === tab.name ? activeTabElementRef : null}
              onClick={() => setActiveTab(tab.name)}
              className="button"
            >
              {tab.name}
            </button>
          </li>
        ))}
      </ul>

      {/* Duplicated, styled-as-active list, clipped to only show the active tab */}
      <div aria-hidden className="clip-path-container" ref={containerRef}>
        <ul className="list list-overlay">
          {TABS.map((tab) => (
            <li key={tab.name}>
              <button
                onClick={() => setActiveTab(tab.name)}
                className="button-overlay button"
                tabIndex={-1}
              >
                {tab.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const TABS = [
  { name: "Payments" },
  { name: "Balances" },
  { name: "Customers" },
  { name: "Billing" },
];
```

> Note: this is simplified to focus on the `clip-path` logic. A production version would need more work for accessibility — e.g. building on top of [Radix's Tabs](https://www.radix-ui.com/primitives/docs/components/tabs) rather than raw buttons.

## Theme Switch Reveal

The same reveal technique can be used for a light/dark theme toggle: duplicate the whole page (or relevant section), style the duplicate with the *other* theme, then animate its `clip-path` open to reveal it — swapping the current theme state so the right version stays on top afterward.

```css
.clipPathReveal {
  clip-path: inset(0 0 100% 0);
  animation: revealClipPath 1s cubic-bezier(0.77, 0, 0.175, 1) forwards;
}

@keyframes revealClipPath {
  from {
    clip-path: inset(0 0 100% 0);
  }
  to {
    clip-path: inset(0 0 0 0);
  }
}
```

This approach is a bit hacky since it requires duplicating the element being animated. The [View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API) can achieve a similar effect natively, without the duplication.

## Summary

`clip-path` is hardware-accelerated and doesn't affect layout, which makes it a strong tool for animation beyond its more obvious use for clipping shapes:

- **Reveals** — clip from fully hidden to fully visible (images, lines, page sections)
- **Sliders / comparisons** — clip one layer based on drag or mouse position
- **Scroll-linked progress** — map scroll position to a clip inset
- **Seamless state transitions** — clip a duplicated, differently-styled element to fake a smooth crossfade (tabs, themes)

Once the basic mental model clicks — `inset()` defines a rectangle, animate the rectangle's edges — most of these patterns fall out naturally, and it becomes a property you start noticing everywhere on the web.
