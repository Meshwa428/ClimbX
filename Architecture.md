# ClimbX Digital — Architecture

## 1. Tech stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | **Next.js 15 (App Router, TypeScript)** | RSC, image/font optimization, easy Vercel deploy, route growth later |
| Styling | **Tailwind CSS** | Utility-first, tokens map cleanly to brand guide |
| Components | **shadcn/ui** (Radix primitives) | Accessible, unstyled-then-themed; **primary** component source |
| Premium components | **React Bits** (see `Components.md`) | OptionWheel, StaggeredMenu, FlowingMenu, TiltedCard, ScrollStack, Threads. Install: `npx shadcn@latest add https://reactbits.dev/r/<C>-JS-CSS` |
| Component motion | **Motion** (`motion`, ex-Framer Motion) | Variants, layout animations, page/menu transitions, springs |
| Scroll animation | **GSAP + ScrollTrigger** | Pinned sections, scroll-driven timelines, storytelling sequences |
| Smooth scroll | **Lenis** | Buttery scroll; drives ScrollTrigger. ⚠️ one global instance — ScrollStack ships its own; don't double-run |
| Intro background | **@shadergradient/react + @react-three/fiber + three + three-stdlib + camera-controls** | Client-provided shader — now in the **Intro/Preloader** (was hero) |
| Hero background | **React Bits Threads** (strands) behind a blur layer | Ambient soft strands under hero; confirm exact component (`Components.md §1`) |
| Carousel (interactive) | **Embla** (via shadcn `carousel`) | Drag/snap project carousel |
| Marquee (infinite) | **CSS keyframes / Motion** — no extra lib | Continuous loop is a few lines; don't add a dep |
| Icons | **lucide-react** (ships with shadcn) | Consistent icon set |
| Fonts | **next/font** (Google) + `next/font/local` for Helvetica Now | Self-hosted, zero layout shift |
| Custom cursor | Small in-repo hook + component | ~40 lines; no library needed |
| Contact/leads | Next Route Handler + **Resend** (or Formspree fallback) | Simplest working email delivery |
| Analytics | Vercel Analytics (or Plausible) | Scroll depth + CTA clicks |
| Deploy | **Vercel** | First-class Next support |

> Add libraries only when an installed dep + a few lines can't do it (see `RULES.md`). New deps require a one-line justification in `Memory.md`.

---

## 2. Website flow & architecture

Single-page, scroll-driven experience. One route (`/`) composes ordered sections. A global smooth-scroll + cursor + nav shell wraps everything.

```
First load
  └─ Preloader (intro: thick staircase draws bottom-left→top-right, then splits along the teeth to reveal)
        └─ Landing page (/)
             Floating pill nav (top-center) + StaggeredMenu/OptionWheel expanded menu ── Custom cursor ── Lenis
             ├─ Hero            (Threads strands bg behind blur + option-wheel nav)
             ├─ Marquee         (infinite CSS loop — not FlowingMenu)
             ├─ Services        (cursor-hover cards; ScrollStack optional)
             ├─ Story           (GSAP pinned founder journey)
             ├─ Process         (Ladder / Arrow / Circle; ScrollStack optional = stacking steps)
             ├─ FlowingMenu     (hover-marquee band → secondary pages)
             ├─ Work            (TiltedCard project images + Embla carousel + stat tickers)
             ├─ Team
             ├─ Testimonials    (editorial quotes)
             ├─ CTA / Contact   (form → route handler → email)
             └─ Footer
```

### Routes
Landing (`/`) is the main experience. **FlowingMenu introduces secondary pages** — the site is landing + a few routes, no longer pure single-page. Planned secondary routes (**confirm which**): `/services`, `/work`, `/about`, `/contact`. Build the landing first; add routes as their own phase. `/work/[slug]` case-study details still deferred. See `Components.md §3`.

### Rendering strategy
- Page shell + content = **Server Components** (static). Data comes from `content/*.ts` at build time.
- Interactive/animated pieces = **Client Components** (`"use client"`), kept as leaf nodes so most of the tree stays server-rendered.
- Hero shader = **`next/dynamic`, `ssr: false`**, lazy after first paint. A static gradient/image paints as LCP first.
- Contact form posts to a **Route Handler** (`app/api/contact/route.ts`).

### Providers (client) wrapping the app
- `LenisProvider` — smooth scroll + syncs GSAP ScrollTrigger.
- `CursorProvider` — custom cursor state (hover targets register via a hook).
- Reduced-motion: a `usePrefersReducedMotion` hook short-circuits heavy motion.

---

## 3. Folder & file structure

```
climbx/
├─ app/
│  ├─ layout.tsx              # fonts, metadata, providers, cursor, Lenis
│  ├─ page.tsx                # composes sections in order
│  ├─ globals.css             # Tailwind + brand CSS vars (tokens) + base
│  ├─ opengraph-image.tsx     # OG image
│  ├─ sitemap.ts / robots.ts
│  └─ api/
│     └─ contact/route.ts     # POST → email (Resend/Formspree)
│
├─ components/
│  ├─ ui/                     # shadcn-generated (button, carousel, form, input, …)
│  ├─ reactbits/              # React Bits: OptionWheel, StaggeredMenu, FlowingMenu, TiltedCard, ScrollStack, Threads (+ their .css) — see Components.md
│  ├─ layout/
│  │  ├─ nav.tsx
│  │  ├─ mobile-menu.tsx      # smooth animated menu
│  │  ├─ preloader.tsx        # intro animation
│  │  └─ footer.tsx
│  ├─ sections/
│  │  ├─ hero.tsx
│  │  ├─ marquee.tsx
│  │  ├─ services.tsx
│  │  ├─ story.tsx
│  │  ├─ process.tsx
│  │  ├─ work.tsx
│  │  ├─ team.tsx
│  │  ├─ testimonials.tsx
│  │  └─ cta.tsx
│  └─ effects/
│     ├─ custom-cursor.tsx    # global cursor + float-under-cursor
│     ├─ magnetic.tsx         # magnetic hover wrapper
│     ├─ scroll-reveal.tsx    # in-view fade/slide (Motion)
│     ├─ text-reveal.tsx      # line/word reveal
│     ├─ number-ticker.tsx    # count-up stats (tabular-nums)
│     └─ shader-hero-bg.tsx   # dynamic ShaderGradient wrapper (ssr:false)
│
├─ lib/
│  ├─ utils.ts                # cn()
│  ├─ motion.ts               # shared easings + variants (house style)
│  └─ gsap.ts                 # ScrollTrigger + Lenis wiring
│
├─ hooks/
│  ├─ use-cursor.ts
│  ├─ use-media-query.ts
│  └─ use-prefers-reduced-motion.ts
│
├─ providers/
│  ├─ lenis-provider.tsx
│  └─ cursor-provider.tsx
│
├─ content/                   # typed data (single source of copy)
│  ├─ services.ts
│  ├─ work.ts
│  ├─ team.ts
│  ├─ testimonials.ts
│  └─ site.ts                 # nav links, socials, contact, meta
│
├─ public/
│  ├─ logo/                   # from assets/ (white tp.png, plain logo)
│  ├─ work/                   # project imagery
│  ├─ sounds/                 # click-soft.mp3 (option-wheel tick)
│  └─ og/
│
├─ assets/                    # source brand files (existing — not shipped)
├─ PRD.md · Architecture.md · RULES.md · Phases.md · Design.md · Memory.md · CLAUDE.md
├─ components.json            # shadcn config
├─ tailwind config / postcss
└─ next.config.ts
```

**Rule of thumb:** section files stay thin — they lay out and pull from `content/*.ts`. Reusable motion lives in `effects/` + `lib/motion.ts`, never copy-pasted.

---

## 4. Data flow

- **Content:** typed objects in `content/*.ts` → imported by server section components. Editing copy = editing one file.
- **Leads:** contact form (client) → `POST /api/contact` → Resend email to ClimbX inbox → success/error state back to form.
- **Motion state:** local per-component; global only for cursor + scroll (via providers).

---

## 5. Performance architecture (non-negotiable)
- Intro ShaderGradient: `ssr:false` dynamic import; three.js isolated to the intro chunk, never in shared bundles.
- Hero Threads (strands) bg: lazy-mount, pause the rAF/animation when offscreen; blur+overlay handled in CSS.
- **One Lenis instance.** Global `LenisProvider` owns smooth scroll + feeds GSAP ScrollTrigger. React Bits **ScrollStack ships its own Lenis** — if used, scope it to an internal scroller or drive it from the global instance; never run two on the same scroller.
- Animate **transform/opacity only**; `will-change` on animated layers; kill GSAP triggers + cancel rAF (OptionWheel, ScrollStack, Threads) on unmount.
- `next/image` for all imagery; project images lazy below the fold; TiltedCard degrades to a static card on mobile.
- Respect `prefers-reduced-motion` everywhere (one hook, checked in every animated component incl. all React Bits ones).

See `RULES.md` for enforcement and `Design.md` for tokens/motion values.
