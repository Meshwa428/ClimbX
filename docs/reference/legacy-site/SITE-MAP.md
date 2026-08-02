# Legacy site audit — climbxdigital.in

Crawled 2026-07-29 from `https://www.climbxdigital.in/`. This is the **current live site** (Next.js,
dark theme). It is the content source of truth for the rebuild — copy the *copy*, not the design.
Our design comes from `Design.md` / `PRD.md`.

Offline copies in this folder:
- `html/*.html` — raw server HTML per route.
- `text/*.txt` — readable extraction (headings, links, images) per route.
- `text/*-full.txt` — collapsed accordion bodies pulled out of the RSC flight payload (FAQ + legal).
- `legacy-site.css` — their compiled stylesheet (palette/font reference only).
- `crawl.sh` / `extract.py` / `flight.py` — re-run to refresh: `bash crawl.sh && python3 extract.py`.

## How pages were found
No `robots.txt`, no `sitemap.xml` (both 404). BFS crawl over internal `href="/…"` plus escaped paths
in the RSC payload (`crawl.sh`), then a manual probe of ~14 common route names. `/blog` is **live but
unlinked** (not in nav or footer) — only found by probing.

## Route inventory (11 live routes)

| Route | Live title | In nav | In footer | Rebuild status |
|---|---|---|---|---|
| `/` | ClimbXDigital - Performance Digital Marketing Agency \| Nagpur | HOME | Home | **design now** |
| `/work` | (same generic title) | PORTFOLIO | Portfolio | dummy |
| `/services` | (same) | STUDIO | Studio | dummy |
| `/about` | (same) | CULTURE | — | dummy |
| `/careers` | (same) | CAREERS | Careers | dummy |
| `/contact` | (same) | CONNECT | Connect | dummy |
| `/faq` | FAQ \| ClimbX Digital | — | FAQ | dummy |
| `/privacy-policy` | Privacy Policy \| ClimbX Digital | — | Privacy Policy | dummy |
| `/terms-conditions` | Terms & Conditions \| ClimbX Digital | — | Terms & Conditions | dummy |
| `/refund-policy` | Cancellation & Refund Policy \| ClimbX Digital | — | Refund Policy | dummy |
| `/blog` | (same generic) | — | — | dummy (orphan on live site) |

**404 on the live site:** `/case-studies`, `/portfolio`, `/team`, `/pricing`, `/testimonials`,
`/process`, `/insights`, `/resources`, `/sitemap`, `/thank-you`, `/work/[id]`, `/services/[slug]`,
and **all three `/blog/[slug]` links** (`/blog/why-google-ads-roas-is-low`,
`/blog/2025-seo-playbook-indian-d2c`, `/blog/50000-leads-18-cpl`) — their blog index links to
nothing. Detail routes do not exist anywhere on the live site.

### Nav label vs. route (their naming is intentionally non-literal)
`HOME → /` · `PORTFOLIO → /work` · `STUDIO → /services` · `CULTURE → /about` · `CAREERS → /careers`
· `CONNECT → /contact`. Our `Memory.md` LOCKED list said `/services /work /about /contact` — add
`/careers` (nav) + `/faq /privacy-policy /terms-conditions /refund-policy` (footer) + `/blog`.

---

## Global chrome (every page)

**Header nav:** logo left, 6 uppercase links: HOME · PORTFOLIO · STUDIO · CULTURE · CAREERS · CONNECT.

**Footer:** logo + boilerplate line, then 3 columns + contact block.
- Blurb: *"We solve business challenges with smart thinking, big ideas, and incisive action. Our whole approach is based around making things simple."*
- **pages:** Home · Portfolio · Studio · Connect · Careers
- **useful links:** Terms & Conditions · Privacy Policy · Refund Policy · FAQ
- **follow us:** Instagram · Facebook · LinkedIn — all `href="#"` on the live site → `TODO(content)`: real social URLs.
- Phone `+91 87671 98554` · Email `climbxdigital@gmail.com` · Address `Nagpur, Maharashtra 440001`
- Legal line: `@CLIMBX DIGITAL All rights reserved - Owned by Climb X Digital.`
- Back-to-top `↑`.

**Founder:** Anupam Kamble. **Base:** Nagpur, Maharashtra.

---

## `/` — HOME (the one we design now)

Section order on the live site (`text/index.txt`):

1. **Preloader** — logo + "Loading…". *(We already have a better one: `components/layout/preloader.tsx`.)*
2. **Hero** — H1 `We build / digital / experiences` (3 lines). Sub: *"We solve business challenges
   with smart thinking, big ideas, and incisive action. Our whole approach is based around making
   things simple."* CTA: **START YOUR CLIMB** → `/contact`.
3. **Marquee strip** — `PERFORMANCE MARKETING ◆ SEO & CONTENT ◆ PAID MEDIA ◆ BRAND IDENTITY ◆ SOCIAL MEDIA ◆ WEB DESIGN ◆` (two rows). Matches our existing CSS marquee.
4. **our expertise** / `/ discover our services` — 9 items, each a short keyword + H3 title:
   `social` → social media marketing · `branding` → branding & creative design ·
   `development` → website development · `search` → seo services ·
   `growth` → performance marketing · `content` → content creation ·
   `production` → video production · `advertising` → advertising campaign management ·
   `strategy` → consulting & strategy services.
5. **results that speak** / `/ our case studies` — 4 cards, each links to `/work`:
   - RealEstate Co. — *3.8x ROAS in 45 days via Google Performance Max*
   - FashionForward — *200% organic traffic growth in 6 months*
   - HealthPlus Clinics — *Rs 2.4Cr revenue attributed to digital in Q1*
   - EduTech Startup — *50,000 leads generated at Rs 18 CPL*
6. **data-driven creativity** / `/ by the numbers` — 4 stats (count-up candidates, matches the
   "climb" concept in `PRD.md §3`):
   `Rs 15Cr+` Ad Spend Managed · `50+` Brands Grown · `4.2x` Average ROAS Delivered · `3 Yrs` Of Consistent Results.
7. **ready to climb?** — *"Let's build something worth talking about."* CTA **get in touch** → `/contact`.
8. Footer.

**Section-title pattern:** lowercase headline + a `/ subtitle` line. Worth keeping — it is the one
distinctive typographic tic of the brand.

**Content gaps to flag as `TODO(content)`:** no real client logos, no real case-study imagery, no
testimonials, no team photos, social links are `#`. Case-study numbers are the only proof points.

---

## Other pages (content captured, dummy shells for now)

**`/services`** — eyebrow `SERVICES`, H1 `What We Do`. 5 blocks, each: title, one-line promise,
3 bullets, `Get Started` → `/contact`.
Performance Marketing (media planning · ad creative testing · daily optimization) ·
SEO & Content Strategy (SEO audits · content strategy · on-page optimization) ·
Social Media Management (monthly content calendar · reels and static creatives · community management) ·
Brand Identity & Creative (brand strategy · visual identity · tone of voice) ·
Web Design & CRO (website design · landing pages · conversion audits).
Note: 5 here vs 9 on the home page — the home list is the superset.

**`/work`** — eyebrow `WORK`, H1 `Work That Climbs.` Filter chips: All · Paid Media · SEO · Social ·
Brand. Same 4 case studies as home, tagged: RealEstate Co. (Paid Media), FashionForward (SEO),
HealthPlus Clinics (Social), EduTech Startup (Paid Media). No detail pages exist.

**`/about`** — eyebrow `ABOUT CLIMBX DIGITAL`, H1 *"Results-driven digital marketing, built around
your brand."* Two intro paragraphs, "We specialize in" list (social media & content strategy ·
performance marketing & ads · website design · branding), "Our promise" line, then **Words From the
Founder** — 2 paragraphs signed *— Anupam Kamble, Founder, ClimbX Digital 🚀*. Full text in
`text/about.txt`. This is the storytelling source for Phase 4.

**`/careers`** — H1 `join the climb` / `/ careers`. 3 roles (performance marketer · seo specialist ·
creative designer), each with a one-liner + `apply now`. Closing block: **don't see your role?** →
`drop your cv`.

**`/contact`** — H1 `get in touch`, sub *"take the first step and get in touch with us today"*, form
with `submit`, office block **nagpur / Maharashtra** + phone/email/address, social IG/FB/IN, image
`/office.png`. Form fields aren't in the SSR HTML → design our own (Resend per `Architecture.md`).

**`/blog`** — eyebrow `THE PLAYBOOK`, H1 `The Playbook`, sub *"Insights from the climb."* 3 posts
(category · title · dek · date · read time), all links 404. Keep deferred per `CLAUDE.md`.

**`/faq`** — H1 `frequently asked questions`, 18 numbered accordion items. Q+A text in
`text/faq-full.txt` (heavily local-SEO-worded: "best digital marketing agency in Nagpur" etc.).

**`/privacy-policy`** (12 sections), **`/terms-conditions`** (15 sections), **`/refund-policy`**
(10 sections) — all `Effective Date: May 17, 2026`, numbered accordions. Section titles in
`text/<page>.txt`, bodies in `text/<page>-full.txt`. Legal copy carries over verbatim.

---

## Their visual tokens (reference only — do NOT adopt; `Design.md` wins)
Palette: `#0A0A0A` bg, `#FFFFFF`, `#F5A623` (amber accent), `#FF6B00` (orange), `#1A1A1A`, `#D4831A`.
Fonts: Inter, Raleway, Great Vibes (script accent).
Our build is light graph-paper + ink + brand orange per `Design.md` — the legacy site is
dark-on-dark. Only the **copy** transfers.

---

## Rebuild plan

### Now
1. **Design `/` only**, using the section order above, our tokens, our motion house style.
2. **Dummy routes** for everything in nav + footer so links never 404 and page transitions are
   testable: `/work /services /about /careers /contact /faq /privacy-policy /terms-conditions
   /refund-policy /blog`. One shared placeholder shell — title + "coming soon", no layout work.

### Page transitions (decided)
Native View Transitions, no library.

- **Tailwind v4 has no view-transition utilities.** `::view-transition-*` are *document-level*
  pseudo-elements — they cannot be expressed as utility classes at all. All transition CSS lives in
  `app/globals.css` as plain CSS. The only Tailwind part is naming an element:
  `className="[view-transition-name:site-header]"` (arbitrary property).
- **We do NOT use `experimental.viewTransition` / React's `<ViewTransition>`.** React only starts a
  transition when a `<ViewTransition>` owns a named element — and naming an element pulls it *out*
  of the `root` snapshot, so the page content would no longer be what the straps clip. Worse, the
  clip-path percentages would then resolve against that element's box (full document height), not
  the viewport. So `components/layout/page-transition.tsx` calls `document.startViewTransition()`
  directly on internal link clicks and resolves it when `usePathname()` changes (2s safety
  timeout). Browsers without the API navigate normally.
- **Effect:** reuse the preloader's ink panels — **no logo, no orange band**. The visible region of
  each root snapshot is the *gap* between the two staircase panels offset ±k on y:
  `k = 115%` → whole viewport visible, `k = 0` → fully covered. `straps-close` animates the outgoing
  snapshot 115→0, `straps-open` animates the incoming one 0→115 after it. Ink + graph paper on
  `::view-transition` shows through in between. No overlay DOM.
- Geometry mirrors the preloader (N=6 steps). `node scripts/check-straps.mjs` fails if the polygons
  in `globals.css` drift out of sync with that staircase.
- `@media (prefers-reduced-motion: reduce)` zeroes all view-transition durations/delays (`*` does
  not match view-transition pseudo-elements, so they need their own rule).
- Known gap: browser back/forward (popstate) does not animate — only in-app link clicks do.

### Deferred (do not build until asked)
`/work/[slug]` and `/blog/[slug]` detail pages, CMS, real form backend, testimonials/team sections.
