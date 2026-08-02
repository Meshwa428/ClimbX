# ClimbX Digital — React Bits Component Registry

Premium interaction components sourced from **React Bits**. This is the single source of truth for *which* component goes *where*, how to install it, and how to tune it to the brand. Components come from three places, in this priority: **shadcn/ui first → React Bits (this file) → custom in-repo** (only when neither fits). See `RULES.md §1`.

## Install pattern
```bash
npx shadcn@latest add https://reactbits.dev/r/<Component>-<LANG>-<STYLE>
```
- Use the **JS + CSS** variant as provided (e.g. `OptionWheel-JS-CSS`). Verify exact slug/casing on reactbits.dev before running.
- Land React Bits files in `components/reactbits/`. Keep their `.css` next to them and import it in the component.
- They're leaf components — JS files are fine inside our TS app. Do **not** rewrite to TS/Tailwind unless a real need appears (ponytail).
- **Every one is motion-heavy → every one needs a `prefers-reduced-motion` fallback** (static render / no rAF). Non-negotiable (`RULES.md §4, §6`).

---

## 1. Threads (strands background) — Hero background
- **Where:** Hero section background layer.
- **Treatment:** placed **behind a blur layer** (+ dark overlay) so it reads soft, not sharp, and keeps text contrast (AA). Brand-warm tint (orange/amber).
- **Why:** ambient premium texture under the hero headline + option-wheel nav.
- **Deps:** none extra (WebGL/canvas). Lazy-mount, pause when offscreen.
- ⚠️ **Confirm:** user labeled this "strands animation" but pasted the OptionWheel source. Assumed = React Bits **Threads** (animated line strands). Verify the exact component with the client before install.
- **Note:** ShaderGradient (client-provided) moved to the **Intro/Preloader**, not the hero.

## 2. OptionWheel + StaggeredMenu (combined) — full-screen EXPANDED menu
- **Primary nav is NOT this** — primary nav is a **floating pill** matching the `/lab` switcher (spec in `Design.md §6`, built in-repo). This combined component is the **expanded / full-screen menu** opened from a toggle on/beside the pill (and the mobile menu).
- **Where:** slides in from the **right** when toggled.
- **Combination:** StaggeredMenu shell (toggle, staggered underlay layers, socials, item numbering) **+** OptionWheel's curved, tick-sounding list as the item presentation. Wheel curves around the right edge (`side="right"`).
- **Sound:** tick on selection — asset at `public/sounds/click-soft.mp3` (`soundUrl="/sounds/click-soft.mp3"`, `soundVolume≈0.5`). Respect autoplay policies (component already swallows failures); mute under reduced-motion / user preference.
- **Brand props:**
  - OptionWheel: `side="right"`, `textColor` = muted (`--soft-black`/`#a6a6a6` on light, muted-white on dark), `activeColor` = `--brand-orange #F5A623` (or white on dark), `fontSize`/`spacing`/`tilt` tuned to brand type scale, `draggable`, `soundUrl` as above.
  - StaggeredMenu: `position="right"`, `colors` = brand layers (e.g. `['#FFC84A','#F5A623','#C97100']` or `['#F5A623','#1A1A1A']`), `accentColor="#F5A623"`, `logoUrl` = white ClimbX logo, `changeMenuColorOnOpen`, `displaySocials` (Instagram etc.), `displayItemNumbering` (rungs — fits the climb concept).
  - `items` / `socialItems`: **TODO(content)** — nav destinations + socials from `content/site.ts`.
- **Deps:** gsap (already in stack).
- **Replaces:** the earlier shadcn `sheet` mobile-menu plan. This is the menu now (with a mobile-friendly full-width panel via its own `@media` rules).

## 3. FlowingMenu — mid-page cross-page navigation
- **Where:** a band somewhere mid-page; hover-marquee links pointing to **other pages** (Services / Work / About / Contact — **TODO confirm routes**).
- **Implication:** site is landing page **+ secondary routes**, not pure single-page. See `Architecture.md`.
- **Brand props:** `bgColor="#1A1A1A"` (brand black), `textColor="#FFFFFF"`, `marqueeBgColor="#F5A623"` (brand orange), `marqueeTextColor="#1A1A1A"`, `borderColor="#E08A00"` (deep amber). `items` = `{ link, text, image }` per destination (`content/site.ts`).
- **Deps:** gsap (already in stack).
- **Note:** distinct from the infinite **services marquee strip** (that stays plain CSS, `RULES.md §3`).

## 4. TiltedCard — Client / Project showcase images
- **Where:** Work section — client/project image cards.
- **Brand props:** `rotateAmplitude≈12`, `scaleOnHover≈1.1`, `showTooltip` (caption = client name / result), `displayOverlayContent` for stat/label overlay, image radius → brand `--radius`. `showMobileWarning={false}` (we handle mobile with a static card).
- **Deps:** motion (already in stack).
- **Reconcile with cursor:** global custom cursor still runs (label "View"); TiltedCard owns the per-card 3D tilt. Don't double-bind tilt.

## 5. ScrollStack — optional stacked-steps section
- **Where (optional):** Process or Services — cards stack as you scroll. **Strong synergy with the climb concept** (stacked cards = steps/rungs upward). Use here if it beats a plain reveal.
- **Brand props:** small `rotationAmount`, small `blurAmount` for depth, `itemDistance`/`baseScale` tuned; brand-styled cards (dark surface, amber border, `--radius`).
- **Deps:** lenis (already in stack). ⚠️ **Scroll ownership:** ScrollStack spins up its **own Lenis instance**. We already run a global `LenisProvider`. Do **not** run two Lenis instances on the same scroller — either scope ScrollStack to an internal scroller (`useWindowScroll={false}`) or drive it from the global Lenis. Resolve before use (`Architecture.md §performance`).

---

## Dependency summary
| Component | New dep? | Asset needed |
|-----------|----------|--------------|
| Threads (hero bg) | none | — |
| OptionWheel + StaggeredMenu | gsap ✓ (have) | `public/sounds/click-soft.mp3` |
| FlowingMenu | gsap ✓ (have) | per-link images |
| TiltedCard | motion ✓ (have) | project images |
| ScrollStack | lenis ✓ (have) | — (watch double-Lenis) |

**No new npm dependencies.** Only new asset: the tick sound. Record any deviation in `Memory.md`.

## Open confirmations
- [ ] Hero "strands" bg = React Bits **Threads**? (paste was OptionWheel)
- [ ] Which pages does FlowingMenu link to? (defines secondary routes)
- [ ] OptionWheel/StaggeredMenu `items` = nav sections, services, or both?
- [ ] Source the `click-soft.mp3` tick asset.
