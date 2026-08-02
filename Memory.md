# ClimbX Digital — Build Memory / Progress

> Living status file. **Update after every phase and whenever the active file changes.**
> Keep it short: what's done, what's in progress, what's next, plus decisions & TODOs.

_Last updated: 2026-07-29 — legacy site crawled + archived; routing shell + page transitions in._

---

## Status at a glance
- **Current phase:** Phase 0 done; hero + nav live at root `/`.
- **Hero** = `components/sections/hero.tsx` — light graph-paper, climbing GROW/CLIMB/SCALE, **Order & Chaos shuffle deck** (`components/effects/shuffle-deck.tsx` — **4-slot queue** BACK→SAT_A→CENTER→SAT_B→BACK: center focus + 2 blurred satellites orbiting circularly + 1 small card behind; new deck image enters at BACK (small, hidden) and grows forward; role changes ease on in-out cubic-bezier while orbit stays continuous; fully opaque; any-size deck), step indicator, services marquee. Picsum placeholders.
- **Nav** = `components/layout/nav.tsx` — **glassmorphism pill centered top-middle** (grid, logo left); `bg-white/55 backdrop-blur-xl backdrop-saturate-150` + 1px light border + inset top highlight + soft shadow; active ink-filled, muted-ink inactive, cursor/focus states (designed via /ui-ux-pro-max). **Logo image** left (`public/logo/climbx-logo.png` = trimmed `assets/white tp.png`, dark-on-transparent). Active-pill indicator = duplicate list clipped by an animated `clip-path` (slides + inverts label text), re-measured on resize/font-load. White logo for dark surfaces now exists (`climbx-logo-white.png`, made from `assets/Updated Plain Logo.png`). TODO: mobile menu (Phase 1 StaggeredMenu) — pill may be tight on <400px.
- **Intro loader** clean-geometry: corner-anchored staircase panels + backing ink fill (kills seam) + orange band offset uniformly with endpoints extended straight off-screen (no tilted stairs). Slower (~1.9s draw); on split the orange **vanishes instantly** (no retract outro) while panels expand apart on ease-in-out `[0.83,0,0.17,1]`.
- **Intro content:** white ClimbX logo (`public/logo/climbx-logo-white.png`) reveals with an upward mask wipe ("the climb") + tagline "Your Partner in Digital Growth" fades in below; ink panels carry the `bg-graph` graph-paper motif. Logo/tagline sit in the empty space above the staircase; both cut out fast (0.18s) at split.
- Hero **01/02/03 step indicator removed**.
- **Intro loader** = `components/layout/preloader.tsx` (mounted in `app/layout.tsx`) — thick staircase draws bottom-left→top-right, then screen splits along the teeth (clip-path polygons) to reveal. Once/session (sessionStorage `climbx-intro`), reduced-motion skips. Replay: `sessionStorage.removeItem('climbx-intro')`.
- **Removed:** A/B/C hero variants, `/lab` switcher, unused `strands-bg`.
- **Repo tidy (option B):** reference notes → `docs/reference/` (motion_vocab, practical_animation_tips, design_taste, magic_of_clip_path); deleted 5 unused Next default svgs from `public/`; deleted `AGENTS.md` after folding its Next-16-breaking-changes warning into `CLAUDE.md`; `README.md` rewritten as a real project readme + docs index. Planning docs stay at root. All cross-refs updated (RULES/Design/Memory/CLAUDE).
- **Legacy site archived** → `docs/reference/legacy-site/` (raw HTML + text per route + their CSS + `SITE-MAP.md` guide). 11 live routes found by BFS crawl (`crawl.sh`); no sitemap/robots. `/blog` is live but unlinked; all `/blog/[slug]` and any detail routes 404 on the live site. **`SITE-MAP.md` is the content source of truth for the rebuild** (home section order, all copy, contact details, founder = Anupam Kamble).
- **Routing shell in:** `Nav` + `PageTransition` moved to `app/layout.tsx`; nav links are real routes now (`/ /services /work /about /careers /contact`) with `usePathname` active state. Dummy pages for all 10 non-home routes via `components/layout/placeholder.tsx`.
- **Page transitions = native View Transitions, no dep.** `components/layout/page-transition.tsx` calls `document.startViewTransition()` on internal link clicks (resolves on pathname change, 2s safety timeout); straps keyframes live in `app/globals.css`. Ink staircase panels only — no logo, no orange band. Check: `node scripts/check-straps.mjs`.
- **Home page complete** (order per `SITE-MAP.md`): Hero → `expertise` (9 services, stepped list) → `work` (4 case studies, ink, staircase offsets) → `stats` (count-up, climbing blocks) → `cta` → `footer`. Shared `components/sections/kit.tsx` = `Reveal` (rise-in, reduced-motion aware) + `SectionHead` (lowercase headline + `/ subtitle`, the brand's typographic tic) + SECTION/CONTAINER classes.
- **Transition ordering:** click → `climbx:navigate` event → nav pill slides (300ms) → **340ms later** straps close. Nav holds an optimistic `target` path until `usePathname` catches up. Verified over CDP: nav moves at 50ms, straps start at 345ms.
- **Perf pass:** shuffle-deck no longer writes `filter`/`z-index` every frame (quarter-px blur quantization, only writes on change — transform stays per-frame); nav `backdrop-blur-xl` → `backdrop-blur-md` (also what `Design.md §6` specifies). Headless-Chrome frame timing at 4x CPU throttle showed 60fps in all configs, so GPU raster cost isn't reproducible there — **compare `npm start` (prod) vs `npm run dev` before chasing more**.
- **Design philosophy locked in `Design.md §0`** — principles distilled from cuberto.com (space as material, one idea per screen, type-led, colour spent not sprayed, ascending rhythm, pointer-reactive motion, soft geometry). **Principles only — never their artefacts** (labels, outline-only buttons, contact badge), and **never restyle toward the client's old site**. Buttons corrected: solid ink pill primary / outline secondary, **no gradient pills** (the gradient CTA read as the legacy site — old `Design.md §6` spec was the cause, now fixed).
- **Custom cursor** = `components/effects/cursor.tsx`, mounted in `app/layout.tsx`. Two cross-faded layers in one spring-followed wrapper: white disc on `mix-blend-difference` (dot 9px → 44px on buttons/links) and a solid white "Explore" disc (no blend) for `data-cursor="explore"` targets. Opt in via `data-cursor="explore|button|none"`. Real cursor never hidden; skipped when `(pointer: coarse)`; reduced-motion drops the spring. Verified over CDP.
- **Page surface is now light** (`body` = white, ink blocks inset with `2rem`/`3rem` radius). Blueprint graph paper used on **one** section only (stats), not everywhere.
- **Next up:** Phase 1 remainder — custom cursor, Lenis smooth scroll, StaggeredMenu/OptionWheel expanded menu; then Phase 2+ sections.
- **Dev server:** `npm run dev` → http://localhost:3002 (3000 was busy). Root redirects to `/lab`.

## Completed
- [x] **Phase 0** — Next 16 + React 19 + Tailwind v4 + TS scaffolded; brand fonts wired (`app/layout.tsx`); brand tokens in `app/globals.css`; `motion` + `lucide-react` installed.
- [x] **Hero lab** — 4 directions (`components/lab/hero-a…d.tsx`) + switcher `app/lab/page.tsx`; strands placeholder `components/effects/strands-bg.tsx`. Verified 200, no errors.
- [x] Read brand assets (`Brand fonts and colour.pdf`, logos, IG posts) + animation notes.
- [x] `PRD.md`, `Architecture.md`, `RULES.md`, `Phases.md`, `Design.md`, `Memory.md`, `CLAUDE.md` written.
- [x] `Components.md` — React Bits registry (install, placement, brand props, deps).

## Phase checklist (mirror of `Phases.md`)
- [ ] Phase 0 — Foundations & setup
- [ ] Phase 1 — Design system + shell (StaggeredMenu nav) + effect primitives
- [ ] Phase 2 — Intro (ShaderGradient) + Hero (Threads bg + OptionWheel)
- [ ] Phase 3 — Marquee + Services
- [ ] Phase 4 — Storytelling (founder journey)
- [ ] Phase 5 — Process (ScrollStack opt.) + Work (TiltedCard)
- [ ] Phase 6 — FlowingMenu + Team + Testimonials
- [ ] Phase 7 — CTA + Contact
- [ ] Phase 8 — Polish / a11y / SEO / perf / deploy
- [ ] Phase 9 — Secondary pages (FlowingMenu destinations)

## Key decisions (append as made)
- **CORE CONCEPT = the climb:** whole scroll is an ascent; clients climb step-by-step. Ladder/stairs scroll-progress rail, upward reveals, stepped layout, count-up stats. Drives design + motion (`PRD.md §3`, `Design.md §4`).
- **React Bits components** added for premium interactions → see `Components.md`: Threads (hero bg), OptionWheel + StaggeredMenu (right-side nav w/ tick sound), FlowingMenu (mid-page), TiltedCard (Work images), ScrollStack (optional steps). Install: `npx shadcn add https://reactbits.dev/r/<C>-JS-CSS`.
- **ShaderGradient moved Hero → Intro/Preloader.** Hero bg is now Threads (strands) behind a blur+overlay.
- **Site is now landing + secondary routes** (FlowingMenu points to other pages) — was single-page. Landing first; routes = Phase 9.
- **No new npm deps** — all React Bits deps (gsap/lenis/motion) already in stack. One new asset: `public/sounds/click-soft.mp3`.
- ScrollStack ships its own Lenis — must not double-run vs global LenisProvider.
- No brand font files in `assets/` — only the PDF naming them; all Google except Helvetica Now (→ Inter fallback).
- Dark-primary brand; tokens from `Design.md` only.
- Services marquee strip = CSS (no lib), distinct from FlowingMenu; cursor/magnetic/ticker/preloader = in-repo.

## Dependencies added (record every new dep + why)
- `motion`, `lucide-react` — hero animations + icons.
- **Deferred (ponytail):** `three`/`@react-three/fiber`/`three-stdlib`/`camera-controls`/`@shadergradient/react` (Phase 2 intro), `lenis` (Phase 1), `gsap` (Phase 4). Install when the phase needs them.
- Scaffold also created `AGENTS.md` + `README.md` (Next defaults) — harmless; our `CLAUDE.md` governs.

## LOCKED (2026-07-23)
- Hero strands bg = React Bits **Threads**.
- FlowingMenu / secondary routes = `/services`, `/work`, `/about`, `/contact`.

## LOCKED (2026-07-29)
- Route set = the legacy site's: nav `/ /services /work /about /careers /contact`; footer adds `/faq /privacy-policy /terms-conditions /refund-policy`; `/blog` exists as a shell (deferred). No detail routes.
- Page transition = **native View Transitions driven manually**, NOT React `<ViewTransition>` / `experimental.viewTransition` — naming an element removes it from the `root` snapshot and breaks the viewport-relative straps geometry (reasoning recorded in `next.config.ts` + `SITE-MAP.md`).
- Tailwind v4 has **no** view-transition utilities and can't have any: `::view-transition-*` are document-level pseudo-elements → all transition CSS is plain CSS in `globals.css`; only element naming would be a utility (`[view-transition-name:…]`).
- OptionWheel + StaggeredMenu items = **main nav** (Home, Services, Work, About, Contact).
- Tick sound = placeholder `public/sounds/click-soft.mp3` now; swap real asset later.
- **Hero = Direction D (Kinetic Steps), refined**, with Order & Chaos image cluster inside the hero. Cluster = **shuffle deck** (`components/effects/shuffle-deck.tsx`) — tight cycling stack, one sharp front card, back cards blurred+scaled; matches orderchaos.aiziza.com. Custom (no React Bits match).
- **Primary nav = floating pill, LIGHT theme** (white glass, ink text, active=ink; NOT yellow — client said yellow ≠ premium). StaggeredMenu/OptionWheel = **expanded full-screen menu** behind a toggle. Spec `Design.md §6`.
- **Hero bg = light graph-paper** (direction D). **Threads (strands) no longer used in hero** — `strands-bg` deleted; Threads available for a future dark section or drop it.
- Orbit cluster: no transparency, wide spread to match orderchaos reference; knobs in `orbit-cluster.tsx` (radiusX/Y, speed, cardW/H, scale range).
- **Rule (user):** never hand-author SVG — source from free libs (lucide/SVGRepo/Reshot). Keep scope tight; don't cram elements into a section (`RULES.md §9–10`).

## Open TODOs / questions for client
- [ ] Source the real `click-soft.mp3` tick asset (placeholder in use).
- [ ] Helvetica Now web license? (else ship Inter as body)
- [ ] Real content: project numbers, team, testimonials, socials.
- [ ] Real project/case-study assets + numbers for Work section (`content/work.ts`)
- [ ] Team member names/photos/roles (`content/team.ts`)
- [ ] Testimonial quotes + attributions (`content/testimonials.ts`)
- [ ] Contact delivery: Resend API key vs Formspree? Destination inbox?
- [ ] Founder photo(s) for Story/Team (have IG crops only)

## Notes
- Brand source of truth: `assets/`. Motion source of truth: `docs/reference/{motion_vocab,practical_animation_tips,design_taste}.md`.
