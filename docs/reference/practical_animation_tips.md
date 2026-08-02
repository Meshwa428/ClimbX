# 7 Practical Animation Tips

Good animation often gets treated as an innate sense — something you either have or you don't. In reality, most of the improvement comes from a handful of repeatable tricks, not raw intuition. Here are seven of them.

## 1. Scale buttons on press

An interface should feel responsive to every action — a form submission gets a loading state, a "copy" action gets a success state, and so on. One of the cheapest wins here is giving buttons a subtle press-down effect: scale to around `0.97` on `:active`. It's a tiny detail, but it makes the whole UI feel like it's reacting to touch.

## 2. Never animate in from `scale(0)`

Elements entering from `scale(0)` read as unnatural, because it looks like the element is materializing out of nothing. Starting from a higher initial scale (0.9 or above) feels far more natural — think of a deflated balloon: even collapsed, it still has a recognizable shape. It never fully disappears, and neither should your entering elements.

## 3. Don't re-delay tooltips that are already "warmed up"

A delay before a tooltip appears is good — it prevents tooltips firing on every accidental hover. But once one tooltip in a group is already open, moving to a sibling trigger should open the next tooltip instantly, with no delay and no animation. This preserves the point of the original delay while making rapid exploration feel snappy.

Both Radix and Base UI implement this out of the box. Base UI goes a step further and lets you skip the *animation* too, via a `data-instant` attribute:

```css
.tooltip {
  transition:
    transform 0.125s ease-out,
    opacity 0.125s ease-out;
  transform-origin: var(--transform-origin);

  &[data-starting-style],
  &[data-ending-style] {
    opacity: 0;
    transform: scale(0.97);
  }

  /* Disables the transition for subsequent, already-warm tooltips */
  &[data-instant] {
    transition-duration: 0ms;
  }
}
```

## 4. Get the easing right

Easing — the rate of change over time — arguably matters more than any other part of an animation. The same duration can feel fast or sluggish purely based on the curve.

- For anything **entering or exiting the screen**, use `ease-out`. It accelerates immediately, which reads as responsive.
- Avoid `ease-in` for UI motion — it starts slow and only speeds up at the very end, the opposite of what feels good for interface transitions. Even at identical durations (e.g. `300ms`), an `ease-in` dropdown will feel noticeably slower than an `ease-out` one.
- Built-in CSS easing curves (like the default `ease-in-out`) are usually too weak/subtle for UI work. Custom cubic-bezier curves tend to feel more energetic and intentional. [easings.co](https://easings.co/) is a good source for stronger custom variants of standard easings.

## 5. Make popovers origin-aware

Popovers and dropdowns should visually scale out from the element that triggered them, not from a generic center point. This means setting `transform-origin` correctly — CSS's default (`center`) is wrong for most trigger-based UI.

This especially matters when a popover can appear in different positions relative to its trigger (e.g. top-right vs. bottom-left) — a mismatched origin becomes obvious once both the horizontal and vertical anchor points are off.

Radix UI and Base UI both expose the correct origin as a CSS variable, so you can just wire it up:

```css
.radix {
  transform-origin: var(--radix-dropdown-menu-content-transform-origin);
}

.baseui {
  transform-origin: var(--transform-origin);
}
```

It's a subtle detail — you might not consciously register it either way — but small correctness details like this compound across an interface. Individually invisible, collectively they're what separates something that "feels right" from something that doesn't.

## 6. Keep animations short

Perceived performance often matters more than actual performance: a faster-spinning loading indicator makes an app feel quicker even when the real load time hasn't changed. The same logic applies to transitions — a `180ms` select animation feels snappier than a `400ms` one at otherwise equal fidelity.

As a rule of thumb, most UI animations should stay under `300ms`. And for anything triggered very frequently (hover states, list interactions used dozens of times a day), consider removing the animation entirely — at high repetition, motion stops delighting and starts feeling like friction.

## 7. Reach for blur when nothing else fixes it

If you've tried different easings and durations and a transition still feels slightly off, adding a small amount of `filter: blur()` during the transition can smooth over whatever's bothering you. A plain crossfade between two states can look mechanical; adding a couple of pixels of blur (combined with a press-scale like tip #1) bridges the visual gap between the states so the eye reads it as one continuous motion instead of two distinct objects swapping places.

---

**The throughline:** almost none of this is about talent or "having an eye" for design — it's a set of concrete, checkable defaults (press scale, entry scale, easing direction, transform-origin, duration, and blur as a last resort) that you can apply to nearly any UI animation.
