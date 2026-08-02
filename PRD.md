# ClimbX Digital — Product Requirement Document (PRD)

> Brand website for **ClimbX Digital**, a results-driven digital marketing agency in Nagpur.
> Tagline: *Your Partner in Digital Growth.*

---

## 1. What we are building

A premium, single-page marketing website (with room to grow into case-study sub-routes later) that positions ClimbX Digital as a serious, data-driven growth partner for early-stage startups. The site is the agency's first real digital storefront — it must feel more polished than a 4-post Instagram page and convert visitors into "DM us / book a call" leads.

The experience is scroll-driven and motion-rich: an intro animation, a shader-gradient hero, storytelling sections built from the founder's real narrative, an infinite services/trust marquee, a client & project showcase with cursor-follow previews, and a team section — all fully responsive and mobile-friendly.

**One-line goal:** Turn a curious startup founder into a qualified lead by the time they finish scrolling.

### Non-goals (v1)
- No CMS/blog backend. Content is typed data files (`content/*.ts`); a CMS can come later.
- No auth, no dashboard, no user accounts.
- No e-commerce / payments.
- Case-study detail pages (`/work/[slug]`) are **planned but deferred** — v1 ships the single page.

---

## 2. Target users

**Primary:** Founders of early-stage startups who want to scale up early and win more clients — technically literate, time-poor, skeptical of "likes over growth" agencies. They respond to clarity, proof (numbers), and a confident brand.

**Secondary:** Local Nagpur SMBs looking to grow online; potential hires/collaborators judging the agency's credibility.

**What they need from the site:**
- Instant clarity on *what ClimbX does* and *who it's for*.
- Proof it works (client results, real numbers, a real founder story).
- A low-friction way to start a conversation.
- A first impression that signals "this agency can make my brand look this good too."

---

## 3. Brand & positioning inputs

- **Services:** Social Media Marketing, Performance/Paid Ads, Branding & Strategy, Content Creation — grouped for the site as **Digital Marketing · Web Development · SEO · Market Reach**.
- **Voice:** Direct, confident, no fluff. "We don't guess, we execute with clarity." "Let's build something that actually grows."
- **CORE CONCEPT — the climb:** ClimbX means clients *climb* — scaling their startup **step by step**, one rung/stair at a time, from early stage to real growth. This is the site's spine: the whole scroll is an **ascent**. Content moves the visitor upward; the page tells the story of a startup climbing. Every section is a step. Design, motion, and copy must reinforce "you are climbing, step by step" — not a flat brochure. (See `Design.md §4` for how this drives scroll/motion.)
- **Brand metaphor (use it literally in the UI):**
  - **Ladder / stairs → step-by-step scaling** (the climb — core)
  - **Arrow → measurable results & direction (upward)**
  - **Circle → strategy & consistency**
- **Founder story (real, use it in Storytelling section):** Anupam Kamble. "In 2023, I had no roadmap. Just curiosity, a phone, and the hunger to figure things out." → small gigs → learning strategy → "Today, I'm not just freelancing anymore, I'm building something bigger." → ClimbX Digital. *"I didn't start with a plan. I started with curiosity."*
- **Location:** Nagpur, India.

---

## 4. Features

### 4.1 Premium interaction requirements (client-requested, must-have)
| # | Feature | Where it lives |
|---|---------|----------------|
| 1 | **Custom cursor + hover float** — smooth element floating under cursor over images / project demos | Work showcase, service cards |
| 2 | **Smooth menu animations** — animated open/close nav, staggered links | Global nav / mobile menu |
| 3 | **Infinite carousels** — continuous marquee (services/trust) + draggable project carousel | Marquee strip, Work section |
| 4 | **Storytelling sections** — founder-journey scroll narrative | Story section |
| 5 | **Premium scroll interactions** — Lenis smooth scroll, pinned/scroll-driven reveals, parallax | Global + section-level |
| 6 | **Small premium visual effects** — text reveals, magnetic buttons, number tickers, line-draw logo | Throughout |
| 7 | **Fully responsive + mobile-friendly** | Every section |
| 8 | **Intro animation** — preloader / logo reveal on first load | App entry |

### 4.2 Content sections (page composition, top → bottom)
1. **Intro / Preloader** — logo ladder line-draws in, curtain reveal into hero.
2. **Hero** — ShaderGradient background, headline ("Built for Growth" / "Climb with Purpose"), sub-line, primary CTA, scroll cue.
3. **Marquee** — infinite strip of services / trust words.
4. **Services** — Digital Marketing, Web Dev, SEO, Market Reach; cursor-hover cards.
5. **Storytelling** — founder journey (pinned scroll sequence).
6. **Process** — the Ladder / Arrow / Circle metaphor as a 3-step visual.
7. **Work / Client showcase** — project cards + cursor-follow preview + stat callouts ("From 0 to 10K in 90 days").
8. **Team** — founder + team cards.
9. **Testimonials** — editorial quote treatment.
10. **CTA / Contact** — "Let's build something that actually grows" + contact form / DM links.
11. **Footer** — logo, nav, socials, credits.

### 4.3 Functional requirements
- **Contact:** a working contact form (name, email, message) OR direct mailto/DM links for v1. Lead delivery via a serverless route + email (e.g. Resend) or a form service — decided in Architecture; simplest working path first.
- **Analytics:** lightweight (Vercel Analytics / Plausible) to measure scroll depth + CTA clicks.
- **SEO/Social:** proper metadata, Open Graph image, sitemap, semantic headings.

---

## 5. Success criteria
- Feels premium on a mid-range Android phone (target audience is mobile-first, Indian market).
- Lighthouse: Performance ≥ 85 mobile, Accessibility ≥ 95, SEO ≥ 95.
- LCP < 2.5s on 4G mid-tier mobile despite the 3D hero (hero shader lazy-loads; static fallback paints first).
- Every requested premium interaction present and degrading gracefully with `prefers-reduced-motion`.
- Clear single primary CTA reachable from any scroll position.

---

## 6. Constraints
- Brand colors and fonts are **fixed** by the brand guide (`assets/Brand fonts and colour.pdf`, encoded in `Design.md`). Do not invent new ones.
- Components come from **shadcn/ui** first; custom components only when genuinely required (see `RULES.md`).
- Content is real ClimbX copy where available; placeholders clearly marked `TODO(content)`.
