# ClimbX Digital — Development Phases

Small, shippable phases. Finish and verify one before starting the next. **Update `Memory.md` after every phase.** Each phase lists a Definition of Done (DoD).

---

## Phase 0 — Foundations & setup
- `create-next-app` (TS, App Router, Tailwind, ESLint), `src`-less `app/` layout.
- `shadcn` init (`components.json`); confirm `cn()` in `lib/utils.ts`.
- Install stack: motion, gsap, lenis, @shadergradient/react @react-three/fiber three three-stdlib camera-controls (+ `-D @types/three`), lucide-react.
- Create folder structure from `Architecture.md` (empty stubs OK).
- Wire `next/font`: Raleway, Space Grotesk, Bebas Neue, Dancing Script, Cormorant Garamond (Google) + Helvetica Now via `next/font/local` (fallback Inter if unlicensed).
- Drop brand tokens (colors, type, spacing, easings, durations) into `globals.css` per `Design.md`.
- **DoD:** app runs, fonts load, a token test page renders brand colors/type correctly.

## Phase 1 — Design system + global shell + effect primitives
- Providers: `LenisProvider` (smooth scroll + GSAP ScrollTrigger sync), `CursorProvider`.
- `usePrefersReducedMotion`, `useMediaQuery` hooks; `lib/motion.ts` shared easings/variants.
- Global **custom cursor** (`effects/custom-cursor.tsx`) + `magnetic.tsx`.
- Reusable effects: `scroll-reveal.tsx`, `text-reveal.tsx`, `number-ticker.tsx`.
- **Primary nav = floating pill** (in-repo, matches the `/lab` switcher exactly — `Design.md §6`): fixed top-center, dark glass, segmented links, active = orange. Promote the switcher styling into `layout/nav.tsx`.
- **Expanded menu = React Bits StaggeredMenu + OptionWheel** (`position="right"`, slides in, tick sound), opened from a toggle on the pill; brand-themed, numbering, socials (`Components.md §2`). Reduced-motion + mobile verified.
- **Footer**.
- **DoD:** shell renders on all breakpoints; cursor + magnetic + reveals work and degrade with reduced-motion; StaggeredMenu opens/closes smoothly, keyboard-accessible.

## Phase 2 — Intro animation + Hero
- **Preloader** (`layout/preloader.tsx`) ✅ built: a **solid thick orange staircase** (filled `clip-path` ribbon) wipes in bottom-left → top-right in ladder steps, then the screen **splits along the staircase** (two ink `clip-path` halves slide up / down) to reveal the page. Once per session (`sessionStorage`), skipped under reduced-motion. Mounted in `app/layout.tsx`. ShaderGradient intro backdrop = optional later.
- **Hero** (`sections/hero.tsx`):
  - Background = **React Bits Threads** (strands) behind a **blur + dark overlay** layer (soft, AA text contrast); lazy-mount, pause offscreen. Confirm component (`Components.md §1`).
  - Right-side **OptionWheel** (curved list, tick sound `/sounds/click-soft.mp3`) integrated with the StaggeredMenu nav from Phase 1 (`Components.md §2`).
  - Headline/sub/CTA with text-reveal; scroll cue.
- Static poster paints as LCP before Threads/shader mount.
- **DoD:** intro plays (shader) then reveals hero; strands read soft behind blur; option-wheel scrolls/drags with tick + settles; no LCP block; responsive; reduced-motion + WebGL-off fallbacks verified.

## Phase 3 — Marquee + Services
- **Marquee** (`sections/marquee.tsx`): infinite CSS loop of services/trust words, seamless, pauses on `prefers-reduced-motion`.
- **Services** (`sections/services.tsx`): Digital Marketing / Web Dev / SEO / Market Reach cards (shadcn `card`) with cursor-hover float effect.
- Content in `content/services.ts`.
- **DoD:** marquee loops seamlessly both directions; service cards respond to cursor; fully responsive.

## Phase 4 — Storytelling (founder journey)
- **Story** (`sections/story.tsx`): GSAP pinned, scroll-driven sequence using the real Anupam Kamble narrative (2023 → gigs → strategy → ClimbX). Line/word reveals synced to scroll.
- ScrollTriggers cleaned up on unmount; reduced-motion → plain stacked reveal.
- **DoD:** narrative reads clearly while pinned; no jank; graceful on mobile + reduced-motion.

## Phase 5 — Process + Work showcase
- **Process** (`sections/process.tsx`): Ladder → scaling, Arrow → results, Circle → strategy (3-step visual, scroll reveal). Optional **ScrollStack** (stacking cards = steps/rungs, fits the climb) — watch the double-Lenis rule (`Components.md §5`).
- **Work** (`sections/work.tsx`): project images via **React Bits TiltedCard** (3D tilt, caption = client/result, overlay stat); **Embla** draggable carousel; stat callouts with `number-ticker` ("From 0 to 10K in 90 days"). Global cursor label still runs; don't double-bind tilt. Content in `content/work.ts`.
- **DoD:** TiltedCards tilt smoothly + degrade to static on mobile; carousel drags/snaps; tickers count on view; responsive; reduced-motion respected.

## Phase 6 — FlowingMenu + Team + Testimonials
- **FlowingMenu** (`sections/flowing-menu.tsx`): mid-page hover-marquee band linking to secondary pages, brand-themed (`Components.md §3`). Links may point to routes built in Phase 9 (or anchors until then).
- **Team** (`sections/team.tsx`): founder + team cards, hover treatment, `content/team.ts`.
- **Testimonials** (`sections/testimonials.tsx`): editorial Cormorant quote treatment, Dancing Script attribution, `content/testimonials.ts`.
- **DoD:** FlowingMenu marquee runs smoothly on hover + reduced-motion fallback; both sections match design language; responsive; images optimized.

## Phase 7 — CTA + Contact
- **CTA** (`sections/cta.tsx`): "Let's build something that actually grows" + form (shadcn `form` + `input` + zod).
- **Route handler** `app/api/contact/route.ts`: validate, send via Resend (fallback mailto/Formspree); loading/success/error states.
- **DoD:** form validates client + server, sends a test lead, handles failure gracefully.

## Phase 8 — Polish, a11y, SEO, performance, deploy
- Full responsive audit (360px → ultrawide); reduced-motion pass on every animation.
- A11y pass (landmarks, focus, contrast, alt, labels).
- Metadata + `opengraph-image` + `sitemap` + `robots`; analytics.
- Performance: verify LCP/poster, lazy three chunk, image sizes, Lighthouse targets (`RULES.md`).
- Deploy to Vercel; smoke test on a real mid-range Android.
- **DoD:** meets success criteria in `PRD.md §5`; live URL; `Memory.md` marked complete.

---

## Phase 9 — Secondary pages (FlowingMenu destinations)
- Build the routes FlowingMenu points to (**confirm set**: `/services`, `/work`, `/about`, `/contact`). Reuse shell, tokens, effects, and sections from the landing.
- Wire page transitions (Motion) consistent with the landing's motion house style.
- **DoD:** each route renders, is linked from FlowingMenu + StaggeredMenu, responsive, a11y + reduced-motion clean.

### Later (not v1, don't build until asked)
- `/work/[slug]` case-study detail pages.
- CMS migration for content.
- Blog / SEO content hub.
