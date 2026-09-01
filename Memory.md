# ClimbX Digital — Build Memory / Progress

> Living status file. **Update after every phase and whenever the active file changes.**
> Keep it short: what's done, what's in progress, what's next, plus decisions & TODOs.

_Last updated: 2026-08-25 — SEO audit + AI-tell inventory written to `docs/`._

---

## Status at a glance
- **Current phase:** Phase 0 done; hero + nav live at root `/`.
- **Hero** = `components/sections/hero.tsx` — light graph-paper, climbing GROW/CLIMB/SCALE, **Order & Chaos shuffle deck** (`components/effects/shuffle-deck.tsx` — **4-slot queue** BACK→SAT_A→CENTER→SAT_B→BACK: center focus + 2 blurred satellites orbiting circularly + 1 small card behind; new deck image enters at BACK (small, hidden) and grows forward; role changes ease on in-out cubic-bezier while orbit stays continuous; fully opaque; any-size deck), step indicator, services marquee. Picsum placeholders.
- **Responsive pass (2026-08-05, verified over Playwright at 360/390/414/768/1024/1280/1440/1920):** no horizontal scroll anywhere; `npm run build` clean.
  - **Mobile/tablet menu** (`nav.tsx`, `<lg`): pill swapped for a 44px toggle + full-screen ink panel (graph paper, rung numbers, ascending indent, contact row). Scroll-locked, Escape-closes, focus in/out, `aria-expanded`/`aria-modal`, reduced-motion = instant fade. **ponytail: in-repo, not React Bits StaggeredMenu** — that stays the Phase-1 *expanded* menu (needs gsap + tick sound + socials content); when it lands it replaces this panel's body, not the toggle.
  - Desktop pill now starts at **`lg`**, not `md`: at 768 the `1fr auto 1fr` grid crushed the logo chip.
  - **Logo rides its own glass chip** (same recipe as the pill, `bg-white/80`) — the dark logo used to vanish over the ink Work/CTA blocks, and `white/55` glass was under-contrast in light mode.
  - **Hero deck shows on phones**: one `ShuffleDeck` instance, in flow under the CTA up to `lg` and absolute/bleeding right from `xl` (below xl its left satellite landed on the paragraph). Size is a CSS var (`--deck-scale` 0.42 / 0.55 / 1 / 1.2 at 2xl) so there's no second rAF loop. Hero is `min-h-svh` + flex column; the marquee is in flow, not absolute. 60fps at 4x CPU throttle on a 390px viewport.
  - **One gutter for the whole site:** `SECTION` (px) and `CONTAINER` (max-w) are always *nested* — work/stats/cta had both on one element, so their headlines sat 64px right of everyone else's. Header uses the same wrapper, so the logo starts on the headline's left edge at every width.
  - Touch targets ≥44px (footer nav/legal links, logo chip, toggle); mobile section rhythm tightened (`py-24`, smaller row gaps); footer office block gets its own line; placeholder pages `min-h-svh`.
  - Intro loader lockup moves to the top-left corner on phones — centred it sat straight on the orange staircase.
- **Nav** = `components/layout/nav.tsx` — **glassmorphism pill centered top-middle** (grid, logo left); `bg-white/55 backdrop-blur-xl backdrop-saturate-150` + 1px light border + inset top highlight + soft shadow; active ink-filled, muted-ink inactive, cursor/focus states (designed via /ui-ux-pro-max). Desktop-only (`lg+`). **Logo image** left (`public/logo/climbx-logo.png` = trimmed `assets/white tp.png`, dark-on-transparent). Active-pill indicator = duplicate list clipped by an animated `clip-path` (slides + inverts label text), re-measured on resize/font-load. White logo for dark surfaces now exists (`climbx-logo-white.png`, made from `assets/Updated Plain Logo.png`).
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
- **Three inner pages built (2026-08-12):** `/services` (six disciplines as rule-separated rows + a 4-beat "how the climb runs" + `Cta`), `/careers` (3 roles, each `apply now` = a `mailto` with the subject pre-filled, "what it's like", open-application block), `/contact` (`components/sections/contact-form.tsx` + details column). All open with the new `PageHead` in `kit.tsx` (eyebrow + h1 + sub on the hero's graph paper). Copy from `SITE-MAP.md`; `TODO(content)` on the strategy bullets, role specs and social URLs.
- **`components/sections/layout.ts` is new and matters:** `kit.tsx` is `"use client"`, so `SECTION`/`CONTAINER`/`DARK_BLOCK`/`LIGHT_BLOCK` exported from it reached a *server* page as client-reference stubs — the class string became a stub function's source and `/contact` silently lost its gutter. The four class constants now live in a plain module both sides can read; `kit.tsx` imports `CONTAINER` from it like everyone else. **Class strings never go in a client module.**
- **`PageHead` wraps each `SplitReveal` in its own `<div>`:** React Bits `SplitText` sets `display:inline-block` as an inline style (no class can beat it), so an h1 and the paragraph after it shared a line box.
- **Contact form has no backend** — it composes a `mailto:` and hands off to the reader's mail client (Resend key doesn't exist; "real form backend" is deferred in `SITE-MAP.md`). Swap `onSubmit` for a POST when the key lands; markup/validation/states don't change.
- **Guitar-string dividers now repel and ring (`components/effects/guitar-string.tsx`, hitayush's component):** the control point used to tween straight onto the cursor, so the string read as stuck to the pointer and dragged around. It now uses the same `repelTarget` from `lib/strings.js` as the easter egg — pushed away, never followed — and the line is **solid `var(--color-ink)` at `strokeWidth` 2 by default** (every call site's `rgba(26,26,26,0.1x)` override deleted; a divider is a string, not a hairline rule). **Track → snap → ring → track:** it chases the cursor (0.1s, `power3.out`) until the control point is `push * 1.8` off rest, then the grip breaks — `elastic.out(1.3, 0.22)` over 0.95s, with tracking off **only while it is genuinely still moving**: the ring's `onUpdate` lifts the lock the frame the control point sits on the rest line *and* has barely travelled since the last frame (both tests, or a zero crossing — on the line at full speed — would unlock it mid-swing). No timer, and `onComplete` is just a backstop. Tuning scales dynamically off the box height (`reach = height * 0.7` to ensure immediate engagement upon container entry, and `push = height * 0.38` for tactile bending depth) instead of capping/clipping, eliminating any edge dead zones. Hit areas: 84 services, 104 home, 64 footer, 76 placeholder. **Never clear the lock by reading the tween from inside its own `onUpdate`** — that reference runs before the variable is assigned, it throws, and the string stays dead after one pluck (shipped that way for one commit). Reading `point.current` from there is fine.
- **`/services` = Cuberto-style animated service rows (2026-08-12).** hitayush's original `services-hero/list/process` components were deleted; the page is now a `"use client"` component at `app/services/page.tsx` with `metadata` in `app/services/layout.tsx`. Three Cuberto-inspired animation layers: **(1) staggered scroll reveals** — each row slides up (`y:36 → 0`) with a progressive `delay={i * 0.08}`, so rows cascade in; the index number has its own reveal with +150ms extra delay. **(2) TextRoll hover on titles** — `TextRoll` in `kit.tsx`, Cuberto's signature: the text slides `translateY(-110%)` and an identical duplicate enters from below, pure CSS transition on `--ease-out`, `pointer:fine` gated via CSS in `globals.css`. **(3) Row-level hover micro-interactions** — the row scales to `0.99` on hover, promise text drops to `opacity-80`, bullet list lifts to `ink/90`, all gated behind `fine:` Tailwind variant. Guitar strings between rows unchanged.
  - **`fine:` Tailwind v4 custom variant** registered in `globals.css` via `@custom-variant fine (@media (pointer: fine))` — gates all hover-only effects; touch devices never see stuck `:hover` states. Used as `fine:group-hover/row:scale-[0.99]` etc.
- **Every route is now a real page** (2026-08-15) — `/work`, `/about`, `/faq`, `/privacy-policy`, `/terms-conditions`, `/refund-policy` built on the home page's vocabulary. `components/layout/placeholder.tsx` is now used by **`/blog` only**, which stays deferred per `CLAUDE.md` (unlinked on the live site too).
  - **`/work`** — filter chips (All/Paid Media/SEO/Social/Brand) over `motion` `layout` + `AnimatePresence`, so filtering slides the survivors into place instead of snapping; cards alternate `md:mt-20` to climb; metric set in display type; `data-cursor="explore"` on the image, `TextRoll` on the client name. Ink block at the end states how a win is counted. Client component → metadata in `app/work/layout.tsx`.
  - **`/about`** — lead statement in `SplitReveal`, four specialities as indenting rows, then the founder's letter on the ink block, signed in `font-script` — **the only place the script face appears on the site**, which is what makes it read as a signature.
  - **`/faq`** — 18 questions verbatim from the legacy site. Their payload only carried 16 answers; Q5 and Q18 are written from facts already published elsewhere on the site (services list, footer contact), not invented.
  - **Legal ×3** — one shell (`components/sections/legal.tsx`) + generated copy in `lib/legal-content.ts`. No CTA on a policy page.
- **The legal copy was recovered, not written.** `docs/reference/legacy-site/legal.py` pulls all 37 sections out of the archived RSC payloads: the SSR HTML only contains sections that were *open*, and everything past section five streams in as lazy `$L7`-style references resolved from later flight chunks (plus a nested-array case that hid the Terms introduction). Re-run: `python3 docs/reference/legacy-site/legal.py`. `text/*-full.txt` is superseded by it.
- **Two new shared primitives in `kit.tsx`** (both used site-wide, both reduced-motion aware):
  - **`Magnetic`** — buttons lean *into* the cursor while the guitar strings are shoved *away* by it, so the site's two pointer behaviours read as one physics. Wrapped inside `PillLink`, so every primary button gets it without a per-call-site decision. Mouse pointers only; `pull` above ~0.4 detaches the label from its box.
  - **`Disclosure`** — the numbered accordion row behind both the FAQ and all three legal pages. Same `grid-template-rows: 0fr → 1fr` idiom as the home services stack, so disclosure feels identical everywhere; plus-to-minus is one rule rotating, not an icon swap.
- **`StringRow`** (exported from `guitar-string.tsx`) is the divider-with-gutter wrapper every page uses between blocks — the home page's two inline copies were replaced by it.
- **Easter egg — guitar strings** (`components/effects/strings.tsx`, mounted in `app/layout.tsx`): type `climb` anywhere (ignored inside inputs, skipped under reduced motion) and six strings drop over the viewport; Escape or typing it again puts them away. The pointer **repels** — a string above the cursor is pushed further up, one below further down, then springs back under-damped so it twangs. Solid white on `mix-blend-difference` (opaque over the white pages *and* the ink blocks — no transparency). Blend lives on the canvas itself: a z-indexed wrapper is its own stacking context and swallows the blend. Physics in `lib/strings.js`; check: `node scripts/check-strings.mjs`.
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
- **Below-hero headlines/lead copy = React Bits `SplitText`**, wrapped as `SplitReveal` in `components/sections/kit.tsx`; `SectionTitle` is built on it. Words split with `mask="words"` and slide up out of their own clip (`yPercent 115 → 0`). **No opacity in `from`/`to`** — client rejected the fade; a word is solid or hidden, never grey. Replaced the hand-rolled scroll-scrubbed `ScrollWords`. Props + rationale in `Components.md §6`.
- **Expertise = scroll accordion** (Cuberto `/what-we-do` reference), replaced the staggered two-column grid. Six full-width cards; an IntersectionObserver band across the middle of the viewport (`rootMargin: -45% 0px -45%`) opens whichever card crosses it. Open = ink card + copy + its own CSS-gradient motif; the *next* card sits at `bg-ink/15` so the stack reads as loading. Staging matters: size (motion `layout`) → colour (`delay-100 duration-700`) → copy (delay 0.28). A same-frame flip reads as a light switch, which is what the reference doesn't do. Motifs are CSS gradients with soft stops, never SVG.
- **Service cards open to `--color-void` (#000000), not `--color-ink` (#1a1a1a)** — client call, matching cuberto.com. Ink flattens the grey motifs; true black gives them something to be grey against. New token in `globals.css`, flagged there as a surface colour, not a brand colour.
- **Motifs use hard stops, never feathered ones.** The reference's shapes read as flat grey plates stepping from near-black to mid-grey; soft stops turn the same geometry into haze (first pass got this wrong). One banded gradient per card, no repetition, plus one shared two-axis mask (`maskComposite: intersect`) that dissolves it leftward into the card and holds the top dark so type always sits on near-black. Conic motifs need their origin *on* the box edge — a box only spans ~±45° around vertical, so stops outside that arc paint nothing.
- **Cursor: rAF lerp for position, CSS for everything else. No `motion`.** Position is a bare lerp (`LERP 0.28` ≈ 115ms to catch up) that parks itself when settled; state scale is an inline `scale()` + `transition-transform`; the click pulse is `@keyframes cursor-pulse` in `globals.css`. Two dead ends, both user-reported, don't reintroduce: a **motion spring** competed with Lenis' rAF and jittered; a **CSS `transition` on transform** restarts from the current point on every pointer event, so short moves finish in one frame and the dot *snaps*. Only a continuous lerp eases small and large moves alike.
- **Cursor squash/stretch (Cuberto `mouse-follower`):** the un-closed lerp gap is the velocity, so it drives `rotate(atan2) scale(1 + s, 1 - s)` on the position wrapper — stretched along travel, pinched across it, perfect circle the moment it catches up. Capped at 0.34 or it reads as a smear. Layers nest position → state scale → disc so the three transforms compose instead of overwriting.
- **Cursor click pulse:** clicking empty space (nothing matching `a,button,input,textarea,select,[data-cursor]`) swells the 9px dot to 14px (`scale(1.55)`) and back. Reduced motion is covered by the global `*` duration override — no JS branch needed.

- **Expertise: fakes layer + scrubbed playhead (read straight off cuberto.com/assets/js/bundle.js, `feature` component).** Two fixes for one user complaint ("cards look solid, fixed on a single point; the shut ones fight the scroll"). (1) **Fakes** — a `flex` column of spacer divs, each measured to its own card's *open* height, owns the section's height; the real card stack is `absolute inset-x-0 top-0` over it (their `.cb-feature-fakes` / `.cb-feature-items`). A card opening therefore never changes document height, so the cards below stop being shoved down at exactly the rate the scroll lifts them — that cancellation was the "stuck in place / overshoot" read, and it was layout, not easing. (2) **Scrub** — their ScrollTrigger uses `scrub: 1`; we lerp `--p` toward the scroll target at 0.12/frame (frame-rate corrected) instead of writing the raw scroll ramp, so the animation keeps moving after the wheel stops. Their trigger window kept verbatim: each card reads its *own* fake, `top center+=20%` → `bottom center+=30%` (START 0.7 / END 0.8), so the range scales with the card instead of a fixed 280px. Consequence: cards now **close on scroll-up** (their scrub reverses too) — the old one-way "stays open" behaviour is gone. No ScrollTrigger dep: one lerp beats wiring it to Lenis (RULES.md §3).
- **Guitar string is Cuberto's `divider`, verbatim maths.** Control point = `2 * cursorY - rest + side`, where `side` is a constant ±`height/4` fixed by the half of the box you entered from — that offset alone gives the "shoved aside" read, no falloff curve needed. Chase 0.2s `power2.out`; release **2s `elastic.out(1, 0.2)`** on `mouseleave` only, x recentring on the same tween. Dead ends removed, both user-reported as "too fast, not fluid": the squared-falloff **repel**, the **LIMIT** that cut the string loose mid-hover, and the **`ringing` lock** that made it untouchable while settling — it spent most of a hover unresponsive, and 0.95s of ring is over before you see it. `lib/strings.js` keeps the repel physics for the easter-egg overlay (`effects/strings.tsx`), which does want them; `scripts/check-strings.mjs` still covers it.

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

## SEO audit (2026-08-25) — diagnosis only, nothing fixed yet
- **`docs/seo-audit.md`** — full page-by-page audit of all 12 routes. Evidence = source + the
  prerendered HTML from `npm run build`. **Health Index 64/100 (Fair). No Critical findings.**
  Category scores: Crawlability 62.5 · Technical 78 · On-Page 42.5 · Content 67.5 · Authority 75.
- **`docs/content-voice.md`** — the em-dash / AI-tell inventory with line numbers and rewrites,
  plus the voice + SEO rules for the copy pass. **This is the working doc for the rewrite.**
- Biggest gaps (all absence, not error): no `sitemap.ts`, no `robots.ts`, no `metadataBase`, no
  canonical on any page, no OG/Twitter anywhere, no JSON-LD anywhere (incl. the 18-Q FAQ), 7 pages
  share the root meta description, home has **3 `<h1>`** (`GROW./CLIMB./SCALE.`), and no `<h1>`
  on the site carries a keyword.
- Launch gates (become Critical the day it ships): `/work` rupee figures beside Picsum stock
  (`E2`), and 16 hotlinked picsum images on the LCP route (`T2`).
- Confirmed good, keep it: 12/12 static prerender · FAQ answers are in the server HTML when the
  accordion is shut · every `<img>` has `width`/`height` · viewport + `lang` set.
- **Em-dash count: 22 in body copy, 14 in metadata, 23 in code comments (ignore those).** Legacy
  site = 3 dashes in 4,274 words; our home page = 9 in 377. The two FAQ answers ClimbX wrote
  (Q5, Q18) are the only 2 of 18 with an em dash.
- **Do not "fix" the founder's letter, the 16 verbatim FAQ answers, or the legal docs** — legacy
  human copy. En dashes in ranges (`7–21`, `Mon–Sat`) are correct, leave them.
- Next: keyword research → then rewrite `/` and `/services` against `docs/content-voice.md`.

## Motion fidelity pass (Cuberto, from source)
Read `cuberto.com/assets/js/bundle.js` + their inlined CSS directly rather than guessing.
- **Services cards** (`components/sections/expertise.tsx`): the missing half was
  `.cb-feature-item-accordion { transition: grid-template-rows 1.2s cubic-bezier(.16,1,.3,1) }`
  — a CSS trail that stays on *while* ScrollTrigger scrubs it. We had deliberately removed it
  on desktop ("a transition would smear the scrub into lag"); the lag is the effect. Restored
  as a real one-row accordion div (`auto Xfr` on the card was not reliably interpolatable), and
  `SCRUB` 0.12 → 0.05 so the lerp settles in ~1s like their `scrub: 1` instead of ~130ms.
- **Divider** (`components/effects/guitar-string.tsx`): the maths was already theirs, the *box*
  was not. `.cb-divider:before` is a **20px** hit band; the 200px SVG is only overshoot room and
  is `pointer-events:none`. We ran the same `2y - rest ± 50` over a 104px band, so the control
  point swung ±104 and whipped after the cursor. Now `REACH = 20` / `BOX = 200` verbatim.

### Second pass (buttons, cursor, spacing)
- **Buttons**: `.pill` in `globals.css` is Cuberto's `.cb-btn_cta` — a `currentColor` dome
  rising from below (`50% 50% 0 0` → `0`, .5s/.9s split) under a two-line text roll, plus their
  springy `scaleX(1.02) cubic-bezier(.34,5.56,.64,1)`. Colour is two vars, `--pill-ink` /
  `--pill-bg`, swapped by `.-on-dark`; the flood is always `currentColor` and the incoming
  label always the other one, so the button takes its palette from the surface it sits on.
  `PillLink` / `PillButton` in `kit.tsx`; hero, contact submit and the footer pills all moved
  onto it. **`Magnetic` deleted** — it fought the flood.
- **Cursor**: one `mix-blend-difference` layer now, no second un-blended "Explore" disc. The
  explore state is a 72px disc with a lucide `ArrowUpRight` drawn *black* — black is the
  identity under `difference`, so the arrow shows the artwork through the inverted disc.
- **Services gutter**: Cuberto's feature section uses their `-lg` container (`padding: 0 24rem`
  vs every other section's `12rem`). Matched with `md:px-24` on the card stack only — the
  heading stays on the site's own left edge.
- **Work grid** → `md:columns-2`. A 2-col grid aligns rows, so a 4:3 card beside a 4:5 one left
  a hole nothing could close. Columns flow independently; mobile collapses to DOM order.
  Watch: column balancing is by height, so a very lopsided set could split 3/1.
- Both homepage `<StringRow />`s removed (they sat at the two boundaries that read as voids).
  Still in use on /work, /about, /faq and the legal pages.

### Third pass (reveal + performance)
- **Reveal** now uses Cuberto's `Ul` helper verbatim: `y: 70 → 0` over **2s expo.out** with the
  fade finishing in 1s, batch stagger 0.1. Ours was 18px/600ms — over before the eye registers
  it began, which is why the work images read as popping in. Work images also fade on their own
  `onLoad`, since a lazily-decoded image could otherwise land inside a finished reveal.
- **Perf.** No new deps; deps are already light (gsap, lenis, motion, lucide — no three/R3F on
  this build). The lag was per-frame work, three causes, all now fixed:
  1. `expertise.tsx` called `getBoundingClientRect()` on six fakes *inside* the rAF loop, right
     after the previous frame had dirtied the grid rows → a forced synchronous layout every
     frame. The fakes are fixed-height spacers, so their offsets are cached on measure/resize
     and the loop runs off `scrollY`. Zero layout reads while scrolling.
  2. Card darkening was `background-color: color-mix(...)` on `--p` → a full repaint of six
     full-width cards *per frame*. Now Cuberto's `.cb-feature-item-fill` structure: a `bg-void`
     layer whose opacity rides `--p`, which is composited. Cards also get `contain: paint`.
  3. `ShuffleDeck` ran its four-card blur/z-index loop at 60fps for the whole visit, hero
     on-screen or not. Now paused by an IntersectionObserver (orbit is a function of elapsed
     time, so it resumes in the right place).
- **Blend/blur are NOT the problem** — checked against the source rather than assumed. Cuberto's
  `.cb-cursor` is `mix-blend-mode: exclusion` in its *resting* state and their `.cb-navbar-fill`
  is `backdrop-filter: blur(12px) saturate(300%)`. Both shipped, both smooth. The difference is
  `contain: layout style size` on the cursor root and **no `will-change: transform`** — those go
  together, because `will-change` promotes the element to its own composited layer and a blended
  layer must be resolved against its backdrop every frame, so promoting it is the one thing not
  to do. Ours now matches theirs. Nav chips left as they are; theirs blur harder.

### Fourth pass (stats tiles, grid removals)
- **Stats** rebuilt as Cuberto's `.cb-overview-tiles`: a 6-column grid of cards, icon pinned
  top, figure on the floor (`justify-between`), ~22rem tall, `2rem` radius, `4rem` padding.
  Four tiles → `span 3` each = a clean 2×2 (their span-2/span-3 juggling only exists to balance
  a five-tile last row). Their `:has(strong)` two-tone is dropped: it tints tiles that contain a
  number, and all four of ours do. Tiles are white on the section's cloud — their palette is two
  invented pastels and ours has to be tokens. Icons from lucide (RULES §10).
- **Both curtains are two-layered now.** A dark staircase leads, a lighter one follows 160ms
  behind, so the page is covered/uncovered in two moves instead of one flat wipe.
  - Page transition: **rewritten as DOM** on branch `feat/stair-curtain-transition`, and the
    View Transitions API is gone. Its pseudo-elements are strictly nested (`::view-transition` ›
    `-group` › `-image-pair` › the snapshots), so a second curtain layer can only live on an
    *ancestor* of the page — and clipping an ancestor clips the page with it. Two independent
    layers are impossible there. As siblings in the DOM it is trivial.
    Geometry changed too: the curtain travels **upward only** — out of the bottom edge to cover,
    then onward off the top to uncover from the bottom up. Replaces the old pair of straps
    closing in from both edges.
    **The staircase is made of time, not of a polygon.** The curtain is N full-height columns,
    each starting `STEP_LAG_MS` after the one to its right, so the leading edge steps as it
    climbs and the step depth is however far a column travels in that lag. Cutting the stairs
    into a `clip-path` and translating the whole thing rigidly (the first attempt) produced the
    correct shape and no visible steps at all — a rigid edge crossing the viewport in half a
    second reads as a slope, not a staircase. `STEP_LAG_MS` is now the knob for the whole
    effect; at 0 the curtain is one flat sheet. Columns overlap by 1px, or fractional viewport
    widths leave hairline seams of page showing through.
    Both layers show in both directions. The lighter panel is in front, so which one you watch
    is decided purely by which is *late*, and that swaps per phase: on the cover the dark goes
    first and the light follows onto it (page → dark → light); on the reveal the light goes
    first, uncovering the dark still standing, which then goes too (light → dark → page). The
    transition folds in on itself — the last thing seen before the swap is the first to leave
    after it. The cover wait has to include `LAYER_LAG_MS` now that the cover staggers too.
  - Preloader: a second pair of clipped halves rendered *first* (so it sits behind) and given
    the same 160ms exit delay. Both seams land on identical geometry, so the back fill only
    ever shows as the light pair's own colour. `GONE_MS` extended by the lag.
- Blueprint grid removed from **Stats**, the **page transition** (`::view-transition`, which
  also went from a hardcoded `#101010` to `var(--soft-black)`, matching the loader) and the
  **preloader** (a curtain with its own
  texture reads as a screen you're stuck on). Preloader also went from a hardcoded `#101010` to
  `graphite` — softer step down from the `cloud` hero, and a token instead of a hex.
- `bg-graph-dark` still in use on the hero and `PageHead`.

### Fifth pass (Stats, properly)
- **`₹` has never had a glyph on this site.** Google's `latin`/`latin-ext` subsets exclude
  U+20B9 by name (`U+20A0-20AB, U+20AD-20C0`), and every face here loads `subsets: ["latin"]`.
  It has been falling back to a system font mid-word. Removed from the 60px Stats figure (it
  lives in the caption now, where a fallback is invisible; Cuberto's counters carry no currency
  either). **Still large and still falling back at `app/work/page.tsx:137` — `₹2.4Cr` at
  text-4xl/5xl.** Body-size uses in `work.tsx` and `contact-form.tsx` are cosmetically fine.
- Stat figures were `font-display` (Raleway) bold. **Design.md §2 assigns stat callouts to Space
  Grotesk** — now `font-accent` at `font-medium`, matching Cuberto's regular-weight 6rem
  counters. Bold display type at that size is a headline wearing a number's hat.
- Layout: their span rules are *content-count* rules, and that is the whole source of the
  asymmetry. **Five** tiles is the count they are shaped for — three `span 2` across, then
  `:nth-last-child(2):nth-child(3n+1)` and `:last-child:nth-child(3n+2)` both fire and the last
  row is two `span 3`s. Four can only ever give three-across-then-one-slab; the earlier 2×2 came
  from ignoring the rules entirely. Uniform tile height (theirs is a flat 22.5rem) — the spans
  carry the asymmetry, the heights must not also.
- The fifth tile is `6 — Disciplines, all in-house`: the length of the services list in
  `expertise.tsx`, so it is a count of what the site already ships rather than a claim about
  results needing client sign-off. It first shipped as a statement tile reading "Six
  disciplines, one ascent" — copy lifted from the Expertise intro, which said nothing
  measurable and repeated a line already on the same page. TODO notes that Cuberto puts a
  *credential* in one of these slots; a real award or partner badge belongs in the wide tile.
- Tint hue: brand orange mixed down in oklab lands on **pink** — what survives the mix is its
  red. `--light-gold` has the same warmth without the red, so it reads as cream. Pattern is
  theirs from the reference: top row alternates, bottom row all neutral (carrying the
  alternation into row 2 turns the grid into a chequerboard).
- **CTA button** is `ghost` + `onDark`, not solid: on the ink block a solid button has to be
  *white*, so its flood ran backwards (white pill going black on hover). Ghost keeps it reading
  as black with a white hairline and floods white.
- **`SplitText` was clipping descenders.** Its root is `overflow: hidden` and our display
  headings run `leading-[0.95]` — a line box shorter than the type in it — so `y`/`g`/`p` tails
  fell outside and were cut. Fixed at the component with `padding-bottom: .18em` +
  `margin-bottom: -.18em` (em, so it scales; negative margin so nothing below shifts). This
  affected every `SplitReveal` on the site.
- Tiles are tinted on a **white** section — Design.md §1 puts off-white on card surfaces, so
  white-card-on-cloud was backwards. **Two** tints, alternating by position: `brand 7% + white`
  (warm) against `ink 4% + white` (cool neutral), same lightness, temperature the only
  difference — their `#e3f5f3` mint against `#f1f3fa` blue-grey. Cuberto picks by content
  ("mint = the tile has a number"); every tile of ours has one, so ours picks by position,
  which is Design.md §6 rhythm rather than their semantics. I shipped one flat tone first and
  the user was right that it killed the section.
- Icons 34px/1.5 at 35% opacity → 40px/1.75 at full ink, matching their solid black glyphs.

### Sixth pass (deck orbit)
- `ShuffleDeck` froze each card's outgoing position at the tick boundary and decayed a fixed
  offset toward the new role. So the moment a swap started, the two cards changing role stopped
  orbiting and slid down a straight line — the "orbit pauses to hand over" the user saw. Now
  both ends of the blend are sampled at the *live* orbit angle every frame, so a card recedes to
  BACK along the arc it was already on and the incoming one keeps circling as it grows. Costs
  two extra cos/sin per card per frame; the `delta` array is gone.

## Open TODOs / questions for client
- [ ] Source the real `click-soft.mp3` tick asset (placeholder in use).
- [ ] Helvetica Now web license? (else ship Inter as body)
- [ ] Real content: project numbers, team, testimonials, socials.
- [ ] 1–2 short *statement* claims for the Stats tiles (Cuberto mixes "300+ projects" tiles with
      "Recognized by leading design awards" ones — that mix is what earns the two-tone and the
      uneven spans). All four of ours are figures right now.
- [ ] Real project/case-study assets + numbers for Work section (`content/work.ts`)
- [ ] Team member names/photos/roles (`content/team.ts`)
- [ ] Testimonial quotes + attributions (`content/testimonials.ts`)
- [ ] Contact delivery: Resend API key vs Formspree? Destination inbox?
- [ ] Founder photo(s) for Story/Team (have IG crops only)
- [ ] Real social profile URLs (footer still `href="#"` — blocks `sameAs` schema)
- [ ] Full street address matching the Google Business Profile (blocks `LocalBusiness` schema)
- [ ] Target keyword list — blocks the H1/title/description rewrite

## Notes
- Brand source of truth: `assets/`. Motion source of truth: `docs/reference/{motion_vocab,practical_animation_tips,design_taste}.md`.
