# ClimbXDigital — Brand Website

Marketing site for **ClimbX Digital**, a results-driven digital marketing agency in Nagpur.
Tagline: *Your Partner in Digital Growth.*

Core concept: **the climb** — clients scale their startup step by step, so the whole scroll reads as an ascent.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000 (falls back to 3001/3002 if busy)
```

Other scripts: `npm run build`, `npm start`, `npm run lint`.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Motion · lucide-react

Planned per phase: shadcn/ui, React Bits, GSAP + ScrollTrigger, Lenis, ShaderGradient/R3F/three, Embla, Resend.

> Next.js 16 has breaking changes vs. older conventions — check `node_modules/next/dist/docs/` before writing Next-specific code.

## Structure

```
app/                    App Router entry (layout, page, globals.css)
components/
  layout/               nav.tsx (glass pill nav) · preloader.tsx (staircase intro)
  sections/             hero.tsx
  effects/              shuffle-deck.tsx (orbiting/shuffling image deck)
public/logo/            climbx-logo.png (trimmed from assets/)
assets/                 brand source — logos, brand fonts & colour PDF
docs/reference/         motion & design reference notes
```

## Project docs

Read these before contributing — they are authoritative.

| Doc | What it covers |
|---|---|
| [CLAUDE.md](CLAUDE.md) | Standing rules for working in this repo |
| [PRD.md](PRD.md) | What we're building, users, features |
| [Architecture.md](Architecture.md) | Stack, site flow, target folder structure |
| [RULES.md](RULES.md) | Do/don't — components, tokens, motion, a11y, assets |
| [Phases.md](Phases.md) | Development phases, in order |
| [Design.md](Design.md) | Brand tokens: colour, type, motion, nav spec |
| [Components.md](Components.md) | React Bits component registry |
| [Memory.md](Memory.md) | Live status — what's done, what's next |

## Conventions

- **Components:** shadcn/ui → React Bits → custom, in that order.
- **Tokens only** — no hardcoded hex or font names; use the CSS vars in `app/globals.css` (defined in `Design.md`).
- **Motion:** transform/opacity only; every animation needs a `prefers-reduced-motion` path.
- **No hand-authored SVG** — source icons/doodles from free libraries.
- Update `Memory.md` after each phase.
