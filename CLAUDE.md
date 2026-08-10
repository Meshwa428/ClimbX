# CLAUDE.md — Standing instructions for this repo

ClimbX Digital brand website. Read this before working. Companion docs are authoritative:
`PRD.md` (what/why) · `Architecture.md` (stack/structure) · `RULES.md` (do/don't) · `Phases.md` (order of work) · `Design.md` (tokens) · `Components.md` (React Bits registry) · `Memory.md` (live status).

## Always
1. **Follow `Phases.md` in order.** One phase at a time. Don't scaffold future phases or deferred features (`/work/[slug]`, CMS, blog) until asked.
2. **Update `Memory.md`** after each phase and when the active file/decision changes — done / in-progress / next, decisions, new deps, TODOs.
3. **Component priority: shadcn/ui → React Bits → custom.** Don't hand-build what shadcn or React Bits provides. React Bits install: `npx shadcn@latest add https://reactbits.dev/r/<C>-JS-CSS` → `components/reactbits/`; brand props + placement in `Components.md`. Every React Bits component needs a reduced-motion fallback + rAF/GSAP cleanup on unmount. Custom only per `RULES.md §1` (cursor, CSS marquee, preloader, ticker) — comment why.
4. **Use `/ui-ux-pro-max` and `/emil-design-eng`** when designing or refining any UI component.
5. **Tokens only.** Never hardcode a hex or raw font name — use the CSS vars from `Design.md`. Don't invent colors/fonts.
6. **Motion house style** from `RULES.md §4` / `Design.md §5` (Emil Kowalski notes): strong ease-out for enter/exit, <300ms UI, start ≥scale(0.9), press scale(0.97), transform/opacity only. **Every animation needs a `prefers-reduced-motion` path.**
7. **Performance:** hero shader `ssr:false` + post-paint, static poster is LCP; three.js stays in the hero chunk; `next/image`; kill GSAP triggers on unmount.
8. **Accessibility is not optional** (`RULES.md §6`): semantics, keyboard, focus-visible, contrast, alt, labels

## Never
- Add a dependency without a one-line justification in `Memory.md`. Climb the ladder in `RULES.md §3` first (platform → installed dep → few lines → only then a dep).
- Invent brand assets or copy. Missing content → `TODO(content)` + flag in `Memory.md`, don't guess.
- Put secrets in client code. Env vars server-side only.
- Animate width/height/top/left. Over-build, over-abstract, or scaffold "for later."
- **Hand-author SVG** (arrows/doodles/icons) — source from free libs/SVGRepo into `public/` (`RULES.md §10`).
- **Cram extra elements into a section** (nav/wheel into the hero). Build only what's asked; keep scope tight (`RULES.md §9`).

## Working style (ponytail)
- Ship the smallest thing that works; if a request implies more, ship the lazy version and name what's deferred in the same reply.
- Fewest files, shortest working diff, delete over add. Boring over clever.
- Non-trivial logic (contact validator, ticker math) leaves one runnable check behind. No test frameworks unless asked.
- Match surrounding code style, comment density, and naming.

## Repo facts
- Not a git repo. App is scaffolded (Phase 0 done): `app/`, `components/{layout,sections,effects}/`, `public/logo/`.
- **Next.js 16 has breaking changes vs. older knowledge — read the relevant guide in `node_modules/next/dist/docs/` before writing Next-specific code.** Heed deprecation notices.
- Brand source: `assets/`. Motion source: `docs/reference/{motion_vocab,practical_animation_tips,design_taste}.md`.
- Stack: Next.js 16 + React 19 (App Router, TS) · Tailwind v4 · shadcn/ui · **React Bits** (`Components.md`) · Motion · GSAP+ScrollTrigger · Lenis (one instance) · ShaderGradient/R3F/three (intro) · Embla · Resend. Deploy: Vercel.
