# ClimbX Digital — Design System

Source of truth: `assets/Brand fonts and colour.pdf` + brand posts. **Do not deviate from these values.** All of this ships as CSS custom properties in `app/globals.css`; components reference tokens, never raw values.

---

## 0. Design philosophy

Reference for *how to think*, not what to draw: **cuberto.com**. Take the principles, never the
artefacts — their labels ("Featured work", "Tell us"), their outline-only button system and their
rotating contact badge belong to them. Likewise **never restyle toward the client's old site**
(climbxdigital.in) — it is a content source only (`docs/reference/legacy-site/`).

1. **Space is the material.** Sections breathe: `py-28`→`py-40`, huge gaps between rows. If in doubt, add air, remove elements.
2. **One idea per screen.** A section is a title, a thought, and the content. No stacked eyebrows, sub-headers and decoration competing for the same beat.
3. **Type carries the page.** Very large, tight-tracked (`-0.03em`) display headings; calm, small body. Weight and scale for hierarchy — not boxes, rules or colour.
4. **Colour is spent, not sprayed.** Monochrome base (ink / white / off-white). Brand orange is a micro-accent — an index number, a unit, a focus ring. Never a large surface, never a gradient.
5. **Content is the colour.** Work imagery supplies the vibrancy; the frame around it stays neutral.
6. **Rhythm over grid.** Columns advance at different rates. For us that stagger is *meaning* — the climb (`§4`) — so offsets always ascend, never scatter.
7. **Motion answers the pointer.** Subtle, continuous, reactive: custom cursor states, hover scale on media, reveals that rise. Nothing bounces or spins for attention.
8. **Soft geometry.** Large radii (`2rem`→`3rem`) on dark blocks and media; pills for buttons. No hairline boxes, no drop-shadow stacks.

---

## 1. Color

Dual-mode brand: **dark is primary** (black bg, orange + white), light is secondary (off-white bg for editorial/testimonial surfaces).

### Primary
| Token | Name | Hex | Use |
|-------|------|-----|-----|
| `--brand-orange` | Brand orange | `#F5A623` | Logo icon, CTAs, highlights, links |
| `--deep-amber` | Deep amber | `#E08A00` | Arrow/ladder accent, borders, dividers, underlines, graph bars |
| `--brand-black` | Brand black | `#1A1A1A` | Primary dark bg, "CLIMB" text |
| `--pure-white` | Pure white | `#FFFFFF` | Text on dark, "DIGITAL" text, light-bg text |

### Secondary / extended
| Token | Name | Hex | Use |
|-------|------|-----|-----|
| `--light-gold` | Light gold | `#FFC84A` | Hover states, gradient tops |
| `--burnt-orange` | Burnt orange | `#C97100` | Active/pressed states, gradient bottoms |
| `--soft-black` | Soft black | `#2C2C2C` | Body text on light bg, muted surfaces |
| `--off-white` | Off white | `#F5F5F5` | Light-mode page bg, card surfaces |

### Usage guide (from brand)
- **Brand orange** → buttons, CTAs, icons, highlights, key numbers, hover accents.
- **Brand black** → dark backgrounds, carousels, primary canvas.
- **White** → text on dark, logo lockup backgrounds, light-mode posts/sections.
- **Deep amber** → borders, dividers, secondary accents, underlines, graph/stat bars.

### Signature gradients
- **Orange CTA / accent gradient:** `--light-gold #FFC84A → --brand-orange #F5A623 → --burnt-orange #C97100`.
- **Intro shader (client-provided):** black base (`#000000`) with `color1 #ffd79e`, `color2 #760000`, `color3 #ff9214` — warm orange/deep-red water plane. Now the **Intro/Preloader** background (moved off the hero). Keep the exact `<ShaderGradient>` config from the brief; do not re-tune.
- **Hero background:** React Bits **Threads** (strands) tinted warm, behind a **blur + dark overlay** so it stays soft and text keeps AA contrast. Not sharp. (`Components.md §1`.)
- **React Bits component colors → brand tokens:** OptionWheel `activeColor` = `--brand-orange`, resting = muted; StaggeredMenu layers = amber ramp, `accentColor` = `--brand-orange`; FlowingMenu `bg` = `--brand-black`, marquee bg = `--brand-orange`, border = `--deep-amber`. Never pass raw hex — map to tokens (`Components.md`).

### Semantic mapping (tokens → shadcn theme)
- `--background` = `--brand-black` (dark) / `--off-white` (light sections)
- `--foreground` = `--pure-white` (dark) / `--soft-black` (light)
- `--primary` = `--brand-orange`; `--primary-foreground` = `--brand-black`
- `--accent` = `--deep-amber`; `--muted` = `--soft-black`; `--card` = `#111` (dark) / `--off-white` (light)
- `--border` = deep-amber @ low opacity; `--ring` = `--brand-orange`

> Contrast: orange `#F5A623` on black passes AA for large text; for body-size text on black prefer white. Black text on orange passes AA. Verify every pairing.

---

## 2. Typography

Six-face brand system (all Canva-free / Google except Helvetica Now). Load via `next/font/google` (+ `next/font/local` for Helvetica Now). Assign each a CSS var and a Tailwind family.

| Role | Font | Var | When |
|------|------|-----|------|
| **Display / Headings** | **Raleway** (700–800) | `--font-raleway` | Section headlines, carousel/card titles. Strong geometric character. |
| **Body / UI** | **Helvetica Now** *(fallback Inter)* | `--font-body` | Body copy, captions, UI, forms. Clean, neutral, legible. |
| **Accent / Sub-headings** | **Space Grotesk** (500–700) | `--font-grotesk` | Stat callouts, service labels, sub-heads, eyebrows. Pairs with Raleway. |
| **Impact / Bold display** | **Bebas Neue** (all-caps) | `--font-bebas` | Big statements, stat posters ("10X GROWTH"), section openers. **ALL CAPS only.** |
| **Cursive / Signature** | **Dancing Script** | `--font-script` | Founder signature, quote overlays, "— and how to fix them" accents. **Never body.** Sparingly. |
| **Elegant editorial** | **Cormorant Garamond** | `--font-editorial` | Testimonials, case-study headers, premium quotes. |

### Proven pairings (from brand guide — reuse these)
- **Impact combo:** Bebas Neue headline · Dancing Script accent · body(Helvetica/Inter).
- **Result combo:** Raleway headline · Space Grotesk sub-text · body.
- **Testimonial combo:** Cormorant Garamond quote · Dancing Script attribution.

> **Web loading note:** Helvetica Now is not free — self-host via `next/font/local` only if licensed; otherwise use **Inter** as the `--font-body` substitute (documented, not silent). All others are Google fonts.

### Type scale (fluid, `clamp()`)
| Token | Size (clamp) | Font | Use |
|-------|--------------|------|-----|
| `--fs-hero` | `clamp(3rem, 9vw, 8rem)` | Bebas / Raleway | Hero |
| `--fs-h1` | `clamp(2.5rem, 6vw, 5rem)` | Raleway 800 | Section titles |
| `--fs-h2` | `clamp(2rem, 4vw, 3.5rem)` | Raleway 700 | Sub-sections |
| `--fs-h3` | `clamp(1.5rem, 2.5vw, 2.25rem)` | Raleway 700 | Card titles |
| `--fs-eyebrow` | `0.875rem` | Space Grotesk 600 | Labels/eyebrows (uppercase, tracked) |
| `--fs-body` | `clamp(1rem, 1.1vw, 1.125rem)` | Body | Paragraphs |
| `--fs-small` | `0.875rem` | Body | Captions, meta |

### Typography rules (house style, from `docs/reference/design_taste.md`)
- Body line length ~`65ch` max.
- `tabular-nums` on all stat/number tickers.
- Loosen `letter-spacing` on uppercase labels (Bebas / eyebrows) — tight caps read cramped.
- Underlines reserved for links; emphasize other text with weight/color.
- Bold for UI emphasis; italic only for editorial/citations (Cormorant).
- Use `…` char, not `...`.
- Declare fallback stacks matching x-height to avoid layout shift.

---

## 3. Spacing, radius, elevation

- **Spacing scale** (Tailwind defaults, 4px base). Section vertical rhythm: `clamp(5rem, 12vh, 10rem)` top/bottom.
- **Container:** max `1280px`, gutters `clamp(1rem, 5vw, 4rem)`.
- **Radius:** `--radius: 0.75rem` (cards, inputs); pills for CTAs (`9999px`); logo circle stays circular.
- **Elevation:** dark UI relies on subtle borders (deep-amber low-opacity) + soft glows over drop shadows. Optional orange glow on primary CTA hover (`0 0 40px rgba(245,166,35,.35)`).

---

## 4. Motif language (visual identity cues)

### Guiding concept: THE CLIMB (step by step)
The site is an **ascent**, not a flat page. Clients climb — scaling their startup one rung/stair at a time. Every section is a step upward. Make this felt, not stated:
- **Scroll = climbing.** A fixed **ladder/stairs progress rail** (with the logo's ascending arrow) fills as you scroll — visual proof of upward progress. Section count reads like rungs (01 → 02 → 03…).
- **Direction is up.** Reveals rise into place (slide up + fade), accents point upward, the arrow motif recurs. Avoid downward/sideways drift as the primary motion.
- **Steps, not a slope.** Story + Process advance in discrete beats (rungs), each a small "level up," echoing "step-by-step scaling."
- **Stepped layout.** Where natural, offset/stagger blocks in a rising staircase pattern; numbers/stats "climb" (number tickers count up).
- Keep it subtle and premium — a felt undercurrent, not a literal cartoon staircase.

### Cues to pull from the brand posts (subtly):
- **Graph-paper grid** — faint blueprint grid background on light sections / cards (`--off-white` with low-opacity lines). Signals "data-driven / planned."
- **Ladder + upward arrow** — the Process section and scroll-progress indicator; the logo's ladder line-draws in the preloader.
- **Hand-drawn dashed curved arrows** — accent connectors between story beats / pointing at CTAs (SVG line-draw on scroll). **Source these SVGs from free libraries (SVGRepo/Reshot, CC0/MIT) into `public/` — never hand-author path data** (`RULES.md §10`).
- **Underline swoosh** (deep amber / red) beneath key phrases ("Real results").
- **Circle** — strategy/consistency badge shapes, avatar frames.

---

## 5. Motion tokens (from `docs/reference/practical_animation_tips.md`, `docs/reference/motion_vocab.md`)

```
--ease-out:      cubic-bezier(0.16, 1, 0.3, 1)     /* enter/exit, strong */
--ease-in-out:   cubic-bezier(0.65, 0, 0.35, 1)    /* on-screen A→B */
--ease-standard: cubic-bezier(0.4, 0, 0.2, 1)      /* hover */
--dur-micro:  120ms   /* micro-interactions */
--dur-ui:     200ms   /* standard UI */
--dur-panel:  280ms   /* menus, drawers */
```
- Enter/exit → `--ease-out`; hover → `--ease-standard`; marquee/spinner → `linear`.
- UI motion < 300ms; entries start ≥ `scale(0.9)`; press → `scale(0.97)`.
- Full rules in `RULES.md §4`. Every animation needs a `prefers-reduced-motion` path.

---

## 6. Components

- **Source: shadcn/ui**, themed with the tokens above. Do not build custom versions (see `RULES.md §1`).
- Design/refine components with the **`/ui-ux-pro-max`** and **`/emil-design-eng`** skills.
- **Buttons:** primary = **solid ink pill**, white text, press-scale (on dark surfaces: solid white pill, ink text). Secondary = **outline pill** (ink/25 border, fills with ink on hover). **No gradient buttons** — orange is a micro-accent, never a surface; a gradient pill reads as the client's old site.
- **Cards:** dark `#111` surface, subtle amber border, optional grid texture, orange accent on hover; cursor-float on interactive/work cards.
- **Custom-only components** (no shadcn equivalent): shader hero bg, custom cursor, magnetic wrapper, marquee, preloader, scroll/text reveals, number ticker.

### Primary nav — floating pill (recolored for the light hero)
Segmented-pill form (from the lab switcher) but themed to the page — **not a yellow bar** (client feedback: yellow ≠ premium). Built in `components/layout/nav.tsx`.
- **Logo** left: `CLIMBX` (X in `--brand-orange`) + `DIGITAL` micro-label.
- **Pill:** `rounded-full border border-ink/10 bg-white/70 p-1.5 shadow-[soft] backdrop-blur-md`.
- **Items:** `rounded-full px-4 py-2 font-accent text-xs`; **active** = `bg-ink text-white` (matches the black CTA); **inactive** = `text-ink/55 hover:text-ink`. Orange reserved for micro-accents only.
- Over dark sections later, invert (ink glass + white text). A "menu" affordance opens the **StaggeredMenu** full-screen menu + OptionWheel (`Components.md §2`).

---

## 7. Custom cursor spec
- Default: small dot (white) + trailing ring (blends via `mix-blend-mode: difference` on dark).
- Over interactive/work targets: ring scales up + label ("View" / "Drag"); target image floats/tilts under cursor.
- Hidden on touch devices; never removes real focus/hover affordances; disabled under reduced-motion (native cursor).
