# ClimbX Digital — RULES

Standing rules for anyone (human or AI) building this site. When in doubt, prefer **less code, fewer deps, shadcn-first, tokens-only**.

---

## 1. Components — what to use

**Priority order: shadcn/ui → React Bits (`Components.md`) → custom in-repo.**

- **shadcn/ui first** for standard UI: button, card, form, input, carousel, navigation-menu, accordion, dialog, etc. Install with the shadcn CLI; theme via tokens.
- **React Bits** for the requested premium interactions (OptionWheel, StaggeredMenu, FlowingMenu, TiltedCard, ScrollStack, Threads). Install: `npx shadcn@latest add https://reactbits.dev/r/<Component>-JS-CSS`; land in `components/reactbits/`; keep the `.css` next to it. **Every React Bits component needs a `prefers-reduced-motion` fallback** and cleanup (kill rAF/GSAP on unmount). Full per-component spec + brand props in `Components.md`.
- **Do NOT hand-build a custom component** when a shadcn or React Bits one covers it. Custom is allowed only when:
  1. No shadcn/Radix primitive and no React Bits component covers it (e.g. custom cursor, CSS marquee, preloader, number ticker), **or**
  2. A section's visual needs genuinely can't be reached by composing/styling those.
  Mark such files with a top comment saying why.
- Don't rewrite React Bits JS→TS or CSS→Tailwind unless a real need appears (ponytail). They're leaf components; JS in a TS app is fine.
- **When designing or refining any UI component, use the `/ui-ux-pro-max` and `/emil-design-eng` skills.** They encode the taste bar for layout, spacing, and motion.
- Compose, don't fork: style shadcn parts with Tailwind + tokens instead of rewriting them.

## 2. Design tokens — what to use

- **Only brand tokens** from `Design.md` (CSS vars in `globals.css`). Never hardcode a hex or a raw font name in a component.
- Colors, type scale, spacing, radii, easings, durations all come from tokens.
- Do not introduce a new color/font/shadow without adding it to `Design.md` first.

## 3. Libraries — what to add / avoid

**Approved (already in the stack):** Next, Tailwind, shadcn/ui, Motion, GSAP + ScrollTrigger, Lenis, @shadergradient/react + R3F + three, Embla (via shadcn), lucide-react, next/font, Resend (or Formspree).

**Ladder before adding anything new:**
1. Does it need to exist? Speculative → skip.
2. Can the platform / CSS do it? (CSS marquee, `<details>`, native form validation) → use that.
3. Can an installed dep do it? → use that.
4. Is it a few lines? → write the few lines (custom cursor, magnetic, ticker).
5. Only then add a dep — and record the one-line justification in `Memory.md`.

**Avoid:** a second animation library, a marquee lib, a carousel lib beyond Embla, a state manager (React state + context is enough), a UI kit competing with shadcn, jQuery, moment.js, CSS-in-JS runtimes.

## 4. Motion — house style (source: `docs/reference/motion_vocab.md`, `docs/reference/practical_animation_tips.md`, `docs/reference/design_taste.md`)

- **Easing:** entering/exiting → `ease-out`; on-screen A→B → `ease-in-out`; hover → `ease`; constant (marquee/spinner) → `linear`. Prefer strong custom cubic-beziers over weak defaults.
- **Duration:** micro-interactions 100–150ms, standard UI 150–250ms, modals/drawers 200–300ms. **Keep UI motion < 300ms.** Larger/farther = slightly slower. Exit ~20% faster than entrance.
- **Never animate in from `scale(0)`** — start at `0.9`+.
- **Press feedback:** `scale(0.97)` on `:active` for buttons/interactive cards.
- **Origin-aware** popovers/menus: set `transform-origin` to the trigger (Radix exposes the CSS var).
- **Frequent interactions** (hover, list items) → shorter/subtler, or none.
- **Blur (< 20px)** is the last-resort fix when a transition still feels off.
- Section reveals: subtle fade + short slide, staggered; not everything at once.
- Animate **transform/opacity only**. Never animate width/height/top/left (layout thrash).
- **Always respect `prefers-reduced-motion`** — one hook, checked in every animated component; provide a static/instant path.

## 5. Performance boundaries

- Hero shader: `next/dynamic` `ssr:false`, mounted post-paint; static poster is LCP.
- three.js must stay in the hero chunk — never import it into shared bundles.
- `next/image` for all images; lazy below the fold; real `width`/`height`.
- `will-change` on animated layers; **kill GSAP ScrollTriggers on unmount** (memory leak otherwise).
- Debounce/rAF cursor + scroll handlers.
- Budget: mobile Lighthouse Perf ≥ 85, LCP < 2.5s on mid-tier 4G.

## 6. Accessibility (never skip)

- Semantic landmarks + one `<h1>`, logical heading order.
- Keyboard reachable nav + focus-visible styles; custom cursor never removes real focus/hover affordances.
- Alt text on meaningful images; decorative → `alt=""`.
- Color contrast ≥ WCAG AA (orange-on-black and text-on-orange both checked).
- Forms: real `<label>`s, error text, `aria-invalid`.
- Reduced-motion path for every animation.

## 7. Error handling & robustness

- Contact route: validate input (zod), never trust the client, return typed errors; form shows loading / success / error states.
- Wrap the shader hero in an error boundary + static fallback (WebGL can fail / be disabled).
- Guard `window`/`document`/WebGL access behind client checks (`typeof window`, `useEffect`).
- No secrets in client code; env vars server-side only (`RESEND_API_KEY`, etc.).

## 8. Content & data

- Copy lives in `content/*.ts`, typed. No hardcoded strings in components.
- Real ClimbX copy where available; placeholders marked `TODO(content)` — never ship lorem ipsum silently.

## 9. Boundaries for AI (Claude Code)

- **Ponytail:** ship the smallest thing that works; question over-building in the same reply. Don't scaffold `/work/[slug]`, a CMS, or theming layers until asked.
- **One phase at a time.** Don't jump ahead in `Phases.md`. Update `Memory.md` after each phase (done / in-progress / next).
- **Don't invent brand assets.** Colors/fonts/logo come from `Design.md` + `assets/`. If something's missing, mark `TODO` and ask — don't guess a hex.
- **Don't add a dependency** without justification recorded in `Memory.md`.
- Leave one runnable check behind for non-trivial logic (the contact route validator, the ticker math). No test frameworks unless asked.
- Match surrounding code style; keep diffs minimal; delete over add.
- **Build only what's asked. Keep sections/components scoped** — don't merge a separate element into another (e.g. don't drop the nav/OptionWheel into the hero). Hero = hero.

## 10. Assets & SVG

- **Do NOT hand-author SVG path data** for icons, illustrations, or decorative motifs (arrows, squiggles, underlines, doodles). Source from free, license-clear providers:
  - Icons → **lucide-react** (installed) / Iconify / Tabler.
  - Decorative / hand-drawn (arrows, underlines, blobs) → **SVGRepo**, unDraw, Reshot, Humbleicons — confirm CC0/MIT, download into `public/`.
- Only hand-write a trivial primitive (a single `<line>`/`<circle>`) when no asset fits, and say why in a comment.
- Placeholder imagery for mockups → free stock (Unsplash/Picsum) via `next/image` remotePatterns; swap for client assets later.
