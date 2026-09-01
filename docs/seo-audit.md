# SEO Audit — ClimbX Digital rebuild

**Audited:** 2026-08-25 · commit `55dd59b` · Next.js 16.2.11
**Method:** static analysis of `app/`, `components/`, `lib/` + parse of the 12 prerendered
HTML documents produced by `npm run build` (`.next/server/app/*.html`). Every finding below
traces to source or to rendered markup, not to best-practice assertion.
**Re-run the evidence:** `npm run build`, then the scan scripts noted per finding.

---

## Scope & assumptions (stated, not assumed silently)

| Question | Answer used |
|---|---|
| Site type | Local + national B2B service business (digital marketing agency) |
| Primary goal | Qualified enquiries (form / mail / phone), secondary brand visibility |
| Market & language | India — Nagpur local intent first, Maharashtra/India national second. `en` only |
| Scope of this audit | Full site, all 12 routes, technical + on-page + content. Mobile and desktop parity assumed (single responsive build) |
| Search Console access | **None.** No coverage, query, or CWV field data |
| Analytics access | **None.** No tracking script exists in the build at all |
| Deployment state | **Pre-launch.** The rebuild is not deployed; `climbxdigital.in` currently serves the legacy site (see `docs/reference/legacy-site/SITE-MAP.md`) |

**What this means:** this is a *launch-readiness* audit. Indexation coverage, real Core Web
Vitals, backlink profile, and Google Business Profile health are **unassessed** — they need
GSC/GA/GBP access and a live deployment. Deductions for those areas are made only where the
code itself is the evidence (e.g. no sitemap route exists), never inferred from ranking data
I do not have.

---

## Executive summary

The rebuild is technically clean where it was built — 12/12 routes prerender as static HTML,
headings are real semantic elements, the FAQ answers are in the server HTML even when the
accordion is closed, and every image carries `width`/`height`. That is a better foundation
than the legacy site.

What is missing is **everything a search engine uses to place, verify, and trust the site**.
There is no sitemap, no robots file, no canonical URL on any page, no Open Graph or Twitter
tag on any page, and no structured data anywhere — including on an 18-question FAQ page that
is a textbook `FAQPage` candidate and explicitly targets "best digital marketing agency in
Nagpur". Seven of twelve pages ship the same inherited meta description. The home page has
three `<h1>` elements, none of which contains a commercial keyword.

The commercial pages are also thin: `/services` covers six disciplines in 341 rendered words
(~50 words per service, with no destination page per service), and `/blog` ships as a
39-word placeholder that is indexable and linked from nowhere — reproducing the exact orphan
defect documented on the legacy site.

Separately, the newly-authored copy carries a strong machine-written signature (em-dash
density, negative-parallel constructions, rule-of-three lists) — quantified in
`docs/content-voice.md`, which is the working document for the rewrite.

---

## SEO Health Index

* **Overall Score: 64 / 100**
* **Health Status: Fair** — meaningful issues limiting growth.

### Category breakdown

| Category | Score | Weight | Weighted |
|---|---|---|---|
| Crawlability & Indexation | 62.5 | 30 | 18.75 |
| Technical Foundations | 78 | 25 | 19.50 |
| On-Page Optimization | 42.5 | 20 | 8.50 |
| Content Quality & E-E-A-T | 67.5 | 15 | 10.13 |
| Authority & Trust Signals | 75 | 10 | 7.50 |
| **Total** | | **100** | **64.4 → 64** |

### What is holding the score down

On-Page is the weakest category by a wide margin (42.5) and it is also the cheapest to fix —
it is almost entirely missing metadata, not wrong metadata. Crawlability is second-weakest
and is likewise absence, not error: two files (`app/sitemap.ts`, `app/robots.ts`) plus a
`metadataBase` recover most of it.

**No Critical-severity findings exist**, so the score is valid rather than flattered. The
ceiling on this site is not a broken foundation; it is that the foundation was never
finished. The score cannot exceed roughly 80 without new *content*, not new *code* — thin
commercial pages and the absence of any proof (real case studies, real social profiles, a
complete address) are content problems.

---

## Findings

Ordered by score impact within each category.

### Crawlability & Indexation — 62.5 / 100 (weight 30)

---

**C1 · No XML sitemap**
* **Category:** Crawlability & Indexation
* **Evidence:** `ls app | grep sitemap` returns nothing. No `app/sitemap.ts`, no
  `public/sitemap.xml`. The build output lists 12 static routes with no sitemap emitted.
  The legacy site has the same gap (`SITE-MAP.md`: "No `robots.txt`, no `sitemap.xml` (both 404)").
* **Severity:** High · **Confidence:** High
* **Why it matters:** Twelve routes with shallow internal linking and one orphan means
  discovery relies entirely on crawl of the nav and footer. A sitemap also gives Google a
  `lastmod` signal it can use to prioritise recrawl after the relaunch.
* **Score impact:** −10 (Crawlability)
* **Recommendation:** Add `app/sitemap.ts` covering all indexable routes; exclude `/blog`
  until it has content.

---

**C2 · No canonical URL on any page**
* **Category:** Crawlability & Indexation
* **Evidence:** `grep -c 'rel="canonical"' .next/server/app/*.html` → 0 on all 12
  documents. `metadataBase` is unset in `app/layout.tsx:30-34`, so Next cannot emit absolute
  canonical or OG URLs even if `alternates.canonical` were added.
* **Severity:** High · **Confidence:** High
* **Why it matters:** Vercel serves the same content on the deployment URL, any preview URL,
  the apex and the `www` host. With no self-referencing canonical, all of those are
  independently indexable duplicates of every page. This also matters at relaunch, when the
  legacy site's indexed URLs are being reconciled with the new ones.
* **Score impact:** −10 (Crawlability)
* **Recommendation:** Set `metadataBase` once in the root layout and a self-referencing
  `alternates.canonical` per route.

---

**C3 · `/blog` is indexable, orphaned, and empty**
* **Category:** Crawlability & Indexation
* **Evidence:** `app/blog/page.tsx` renders `<Placeholder>` — 39 rendered words, body text
  "This page is next on the climb." A link scan across all 12 built documents
  (`grep -o '<a [^>]*href="[^"]*"'`) finds **zero** inbound links to `/blog`; every other
  route is linked 10–31 times. The route is nonetheless statically generated and crawlable.
  `SITE-MAP.md` records the identical defect on the live site ("`/blog` is **live but
  unlinked**").
* **Severity:** High · **Confidence:** High
* **Why it matters:** An indexable page with no content and no internal links is a pure
  liability — it dilutes site-quality signals and can be surfaced for brand queries.
* **Score impact:** −10 (Crawlability)
* **Recommendation:** Either `noindex` the route until the blog ships, or remove it and
  restore it when there is a first post.

---

**C4 · No robots.txt**
* **Category:** Crawlability & Indexation
* **Evidence:** No `app/robots.ts`, no `public/robots.txt`.
* **Severity:** Medium · **Confidence:** High
* **Why it matters:** Crawling defaults to allowed, so this does not block anything — but
  there is no sitemap reference for discovery, and no rule to keep Vercel preview
  deployments out of the index.
* **Score impact:** −5 (Crawlability)
* **Recommendation:** Add `app/robots.ts` with the sitemap reference; disallow all on
  non-production `VERCEL_ENV`.

---

**C5 · No relaunch redirect/parity plan recorded**
* **Category:** Crawlability & Indexation
* **Evidence:** The route inventory in `SITE-MAP.md` maps 1:1 to the rebuild's 12 routes,
  which is good. But the legacy blog index links to three `/blog/[slug]` URLs that already
  404, and no redirect map or 404-handling decision is documented anywhere in the repo.
* **Severity:** Medium · **Confidence:** Medium (partial — I can see the repo, not the live
  server's indexed URL set)
* **Why it matters:** Route parity means the relaunch should be low-risk, but unverified
  parity is how migrations lose traffic.
* **Score impact:** −2.5 (Medium × 50% confidence)
* **Recommendation:** Before launch, export the indexed URL list from Search Console and
  diff it against the 12 routes. Decide 410 vs redirect for the three dead blog slugs.

> Raw: 100 − 10 − 10 − 10 − 5 − 2.5 = **62.5** → weighted **18.75**

---

### Technical Foundations — 78 / 100 (weight 25)

Positives, recorded so the score is legible: all 12 routes are `○ (Static)` — no runtime
render cost. `<meta name="viewport" content="width=device-width, initial-scale=1"/>` is
present. `<html lang="en">` is set. Every `<img>` carries explicit `width`/`height`, so
layout shift from images is already controlled. Fonts go through `next/font`, so there is no
render-blocking font stylesheet.

---

**T1 · The preloader owns the first ~3.25 seconds of every first session**
* **Category:** Technical Foundations
* **Evidence:** `components/layout/preloader.tsx:18-21` — `SPLIT_DELAY_MS = 2250`,
  `SPLIT_MS = 1000`, `GONE_MS = 3250`. The overlay is `fixed inset-0 z-[100]` with opaque
  `bg-[#101010]` panels (line 10, 14, 23, 30) and is present in the initial server HTML. The
  largest element painted during that window is the 180 KB `climb-logo-white.png`, served
  through a plain `<img>`.
* **Severity:** High · **Confidence:** Medium (timing constants and overlay geometry are
  directly observed; the resulting LCP figure is not measured — no field data available)
* **Why it matters:** LCP is measured against what the user actually sees. A full-viewport
  opaque overlay for 2.25s before the split even begins puts first-visit LCP at or beyond
  the 2.5s threshold regardless of how fast the real content is. It is correctly skipped
  under `prefers-reduced-motion` and after the first visit (`sessionStorage`), so this is a
  first-impression cost, which is exactly the visit that matters for a new visitor from search.
* **Score impact:** −5 (High × 50% confidence)
* **Recommendation:** Measure it first (PageSpeed Insights on the deployed URL, mobile).
  If LCP lands over 2.5s, shorten the hold or let the hero paint underneath sooner. Do not
  change it on my say-so without the number.

---

**T2 · All content imagery is hotlinked from `picsum.photos` through plain `<img>`**
* **Category:** Technical Foundations
* **Evidence:** 16 `picsum.photos` requests in the built `/` document, 4 in `/work`.
  `components/sections/hero.tsx:16-23`, `components/sections/work.tsx:32`,
  `app/work/page.tsx:119`. `next/image` is used nowhere in the codebase
  (`grep -r "next/image" app components` → no matches).
* **Severity:** Medium · **Confidence:** High
* **Why it matters:** Sixteen third-party requests on the LCP-critical route, none of them
  cached, resized, or served as AVIF/WebP, and all of them dependent on a service with no
  uptime guarantee. Flagged in-code as a known placeholder (`ponytail:` comments), so this is
  tracked debt rather than an oversight — it just must not ship.
* **Score impact:** −5 (Technical)
* **Recommendation:** Replace with real client stills through `next/image` before launch.

---

**T3 · 2.1 MB autoplay video with no poster on `/services`**
* **Category:** Technical Foundations
* **Evidence:** `app/services/page.tsx:81-88` — `<video src="/videos/services/brand-identity.mp4"
  autoPlay muted loop playsInline>` with no `poster` and no `preload` attribute.
  `du -h public/videos/services/brand-identity.mp4` → 2.1M.
* **Severity:** Medium · **Confidence:** High
* **Why it matters:** It sits directly under the page header, so on mobile it competes for
  bandwidth with the LCP paint and burns 2.1 MB of a metered connection before the visitor
  has scrolled. With no poster there is nothing to show while it buffers.
* **Score impact:** −5 (Technical)
* **Recommendation:** Add a `poster` frame, `preload="none"`, and either compress the file
  or gate playback on intersection.

---

**T4 · Brand logos are unoptimized PNGs served raw**
* **Category:** Technical Foundations
* **Evidence:** `public/logo/climbx-logo.png` 416 KB, `climbx-logo-white.png` 180 KB. Both
  loaded via plain `<img>` (`components/layout/nav.tsx:124,211`,
  `components/layout/preloader.tsx:120`). The nav renders the 416 KB file at 114×32 CSS px.
* **Severity:** Medium · **Confidence:** High
* **Why it matters:** ~600 KB of logo on a site whose entire text payload is under 5 KB, and
  the white logo is the likely LCP element during the preloader (see T1).
* **Score impact:** −5 (Technical)
* **Recommendation:** Convert to SVG or WebP at display size; route through `next/image`.

---

**T5 · No web app manifest, no icon set beyond `favicon.ico`**
* **Category:** Technical Foundations
* **Evidence:** `app/` contains `favicon.ico` only — no `icon.png`, `apple-icon.png`,
  `manifest.ts`, or `opengraph-image`.
* **Severity:** Low · **Confidence:** High
* **Why it matters:** Cosmetic for ranking; affects how the brand renders when saved to a
  home screen or shown in a mobile SERP favicon slot.
* **Score impact:** −2 (Technical)
* **Recommendation:** Add `app/icon.png` and `app/apple-icon.png` at minimum.

> Raw: 100 − 5 − 5 − 5 − 5 − 2 = **78** → weighted **19.50**

---

### On-Page Optimization — 42.5 / 100 (weight 20)

This is the weakest category and the cheapest to repair.

---

**O1 · The home page has three `<h1>` elements, none containing a keyword**
* **Category:** On-Page Optimization
* **Evidence:** `.next/server/app/index.html` contains `<h1>GROW.</h1>`, `<h1>CLIMB.</h1>`,
  `<h1>SCALE.</h1>` — source at `components/sections/hero.tsx`, `steps.map()` renders each
  line as its own `motion.h1`. Every other page has exactly one `<h1>`.
* **Severity:** High · **Confidence:** High
* **Why it matters:** The single most weighted on-page element on the site's most important
  page is split three ways and says nothing about what the business sells or where it
  operates. Three verbs is a design decision, not a heading.
* **Score impact:** −10 (On-Page)
* **Recommendation:** One `<h1>` wrapping all three lines (each line a `<span>`), and give
  it a subject — the visual treatment does not have to change at all.

---

**O2 · No `<h1>` on the site contains a commercial or geographic keyword**
* **Category:** On-Page Optimization
* **Evidence:** Full H1 inventory from the built HTML: `GROW.` / `CLIMB.` / `SCALE.` (/),
  `What we do.` (/services), `Work that climbs.` (/work), `Built around your brand.`
  (/about), `Get in touch.` (/contact), `Join the climb.` (/careers),
  `Frequently asked questions.` (/faq), `Insights from the climb.` (/blog). Meanwhile the
  FAQ body explicitly targets "best digital marketing agencies in Nagpur", "best website
  development company in Nagpur", "best SEO agency in Nagpur" (`app/faq/page.tsx:14-30`).
* **Severity:** High · **Confidence:** High
* **Why it matters:** The site states its target keywords in FAQ answers but never in a
  heading. `/services` is the money page and its H1 is three generic words. There is a real
  tension here with the brand voice, and it is resolvable — a keyword-bearing H1 does not
  have to read like SEO filler.
* **Score impact:** −10 (On-Page)
* **Recommendation:** Rewrite each H1 to carry the page's actual subject. See
  `docs/content-voice.md` for the voice constraints that apply.

---

**O3 · No structured data anywhere on the site**
* **Category:** On-Page Optimization
* **Evidence:** `grep -c 'application/ld+json' .next/server/app/*.html` → 0 on all 12
  documents.
* **Severity:** High · **Confidence:** High
* **Why it matters:** Three concrete losses. (1) `/faq` carries 18 question/answer pairs in
  the server HTML and is a clean `FAQPage` candidate. (2) There is no `Organization` /
  `LocalBusiness` node, so the founder name, phone, email, address, and logo are not
  machine-readable — this is the entity foundation for a locally-targeted agency. (3) No
  `BreadcrumbList`, so SERP breadcrumbs will not render.
* **Score impact:** −10 (On-Page)
* **Recommendation:** `Organization`/`LocalBusiness` in the root layout, `FAQPage` on
  `/faq`, `Service` nodes on `/services`. Blocked on O8 (a complete address).

---

**O4 · Seven pages ship the same inherited meta description**
* **Category:** On-Page Optimization
* **Evidence:** Extracted from the built HTML — `/`, `/blog`, `/careers`, `/contact`,
  `/privacy-policy`, `/refund-policy`, `/terms-conditions` all serve the root description
  from `app/layout.tsx:32-33`: *"A results-driven digital marketing agency helping startups
  climb — step by step…"*. Only `/about`, `/faq`, `/services`, `/work` define their own.
* **Severity:** High · **Confidence:** High
* **Why it matters:** Google rewrites duplicate descriptions, so the snippet on more than
  half the site is out of the brand's control — including on `/contact`, the highest-intent
  page.
* **Score impact:** −10 (On-Page)
* **Recommendation:** A distinct 140–160 character description per route.

---

**O5 · No Open Graph or Twitter Card tags on any page**
* **Category:** On-Page Optimization
* **Evidence:** `grep -c 'property="og:' .next/server/app/*.html` → 0; same for
  `name="twitter:"`. No `opengraph-image` file exists.
* **Severity:** Medium · **Confidence:** High
* **Why it matters:** Every share on WhatsApp, LinkedIn, or Instagram DM — the channels an
  Indian agency's referrals actually travel through — renders as a bare URL with no image,
  title, or description.
* **Score impact:** −5 (On-Page)
* **Recommendation:** OG/Twitter metadata in the root layout, overridden per route; one
  `app/opengraph-image.tsx`.

---

**O6 · Titles are short and keyword-free**
* **Category:** On-Page Optimization
* **Evidence:** Lengths from the built HTML: `/services` "What We Do — ClimbX Digital" (27
  chars), `/contact` "Get in touch — ClimbX Digital" (29), `/careers` "Join the climb —
  ClimbX Digital" (31), `/privacy-policy` (31), `/work` (34). SERP titles have roughly 60
  characters of usable width; these use half of it, and none contains a service or location term.
* **Severity:** Medium · **Confidence:** High
* **Why it matters:** `/services` is the primary commercial landing page and its title tells
  a searcher nothing. Also: no `title.template` is configured, so the " — ClimbX Digital"
  suffix is hand-repeated on nine pages, which is how suffixes drift out of sync.
* **Score impact:** −5 (On-Page)
* **Recommendation:** Add `title.template` to the root layout, then rewrite each page title
  to carry its subject. Note the em-dash separator issue in `docs/content-voice.md`.

---

**O7 · Every content image carries `alt=""`**
* **Category:** On-Page Optimization
* **Evidence:** `app/work/page.tsx:121`, `components/sections/work.tsx:34`,
  `components/effects/shuffle-deck.tsx:196` — all `alt=""`. Only the logo has real alt text.
* **Severity:** Medium · **Confidence:** High
* **Why it matters:** `alt=""` is correct for the placeholder images they currently are —
  it stops screen readers announcing meaningless Picsum stock. It becomes wrong the moment
  real case-study imagery lands, which is the same moment the image-search and
  accessibility value appears. Filing it now so it is not missed then.
* **Score impact:** −5 (On-Page)
* **Recommendation:** Write descriptive alt text as part of the real-imagery swap (T2).

---

**O8 · Nothing to link to from the six service disciplines**
* **Category:** On-Page Optimization
* **Evidence:** `app/services/page.tsx:14-49` renders six services as `<h2>` rows with no
  `href`. `/services/[slug]` is deliberately deferred per `CLAUDE.md`. The full site link
  graph (12 documents) resolves to only 8 internal destinations.
* **Severity:** Medium · **Confidence:** Medium (the correct architecture depends on
  keyword-difficulty data I do not have)
* **Why it matters:** "SEO agency Nagpur" and "website development company Nagpur" are
  distinct queries with distinct intent. One `/services` page cannot rank for both without
  competing with itself, and there is currently no page for authority to flow to.
* **Score impact:** −2.5 (Medium × 50% confidence)
* **Recommendation:** Do keyword research before building anything. If the terms separate,
  `/services/[slug]` stops being deferred scope and becomes the plan.

> Raw: 100 − 10 − 10 − 10 − 10 − 5 − 5 − 5 − 2.5 = **42.5** → weighted **8.50**

---

### Content Quality & E-E-A-T — 67.5 / 100 (weight 15)

---

**E1 · Commercial pages are thin**
* **Category:** Content Quality & E-E-A-T
* **Evidence:** Rendered word counts (visible text, chrome included, so these are
  *generous*): `/blog` 39, `/contact` 129, `/careers` 225, `/work` 240, `/about` 293,
  `/services` 341, `/terms-conditions` 567, `/faq` 609. `/services` covers six disciplines
  in 341 words — roughly 50 words per service, of which one is a one-line promise and three
  are bullet fragments.
* **Severity:** High · **Confidence:** High
* **Why it matters:** The two longest pages on the site are the terms of service and the
  FAQ. The pages meant to win commercial queries are the shortest. There is not enough
  substance on `/services` to demonstrate expertise on any one discipline.
* **Score impact:** −10 (Content)
* **Recommendation:** Depth on `/services` first — it is the highest-intent page with the
  least on it.

---

**E2 · Case-study numbers are unverifiable and the imagery is random stock**
* **Category:** Content Quality & E-E-A-T
* **Evidence:** `app/work/page.tsx:22-51` — "RealEstate Co." 3.8x ROAS, "FashionForward"
  200% organic traffic, "HealthPlus Clinics" ₹2.4Cr, "EduTech Startup" 50,000 leads at ₹18
  CPL. Client names are generic; imagery is `picsum.photos/seed/cx-*`. In-code
  `TODO(content)` at line 20 acknowledges real imagery and permission are outstanding. The
  page then publishes a "How we count a win" block promising *"Every figure traces back to
  the client's own analytics or ad account"* — a verification claim attached to figures with
  no verifiable client behind them.
* **Severity:** High · **Confidence:** High
* **Why it matters:** This is the site's entire proof layer. A visitor who recognises stock
  photography beside a specific rupee figure discounts every other claim on the site.
  Pre-launch this is tracked debt; **the day it ships it becomes a Critical E-E-A-T
  finding**, because the counting-methodology block converts a placeholder into an assertion.
* **Score impact:** −10 (Content)
* **Recommendation:** Real named clients with written permission, or anonymised
  ("a Nagpur multi-speciality clinic") with the metric method stated. Do not launch `/work`
  with Picsum images beside rupee figures.

---

**E3 · No blog content, no topical depth, no dates, no author attribution**
* **Category:** Content Quality & E-E-A-T
* **Evidence:** `/blog` is a 39-word placeholder. The only named human on the site is
  "Anupam Kamble, Founder" in the About letter (`app/about/page.tsx:117-121`) — no bio, no
  credentials, no LinkedIn, no author byline anywhere else. No page carries a published or
  updated date.
* **Severity:** Medium · **Confidence:** High
* **Why it matters:** The FAQ answers informational questions ("Why is SEO important for
  business growth?") in two sentences each. Those are the queries that would build topical
  authority, and there is no surface to answer them properly on.
* **Score impact:** −5 (Content)
* **Recommendation:** A founder bio with verifiable credentials is the cheapest E-E-A-T win
  available and unblocks `Person`/`sameAs` structured data.

---

**E4 · No published/updated dates on the legal pages**
* **Category:** Content Quality & E-E-A-T
* **Evidence:** `components/sections/legal.tsx:15` renders `doc.effective` as the page
  subtitle, but no `<time>` element or `dateModified` reaches the markup.
* **Severity:** Medium · **Confidence:** High
* **Why it matters:** Trust pages that cannot be dated read as boilerplate.
* **Score impact:** −5 (Content)
* **Recommendation:** Render as `<time datetime>` and mirror into structured data.

---

**E5 · Newly-authored copy carries a machine-written signature**
* **Category:** Content Quality & E-E-A-T
* **Evidence:** 61 em-dash occurrences in non-comment source across `app/`, `components/`,
  `lib/`; ~25 in rendered visible copy. Home page density is 2.39 em dashes per 100 words of
  visible text — roughly 8× ordinary editorial prose. Plus negative-parallel constructions
  ("attributed, not claimed"; "Weekly, not quarterly"; "a person, not a form reply"),
  rule-of-three lists, and seven distinct climbing-metaphor words inside 341 words on
  `/services`. Full inventory with line numbers in **`docs/content-voice.md`**.
* **Severity:** Medium · **Confidence:** Medium (the constructions are directly observed and
  counted; the *ranking* consequence is inferred, not measured — em-dash frequency is not a
  documented ranking factor)
* **Why it matters:** Two distinct risks, and I want to be honest about which is which.
  The **reader** risk is concrete and immediate: a prospect who reads the site as
  machine-written discounts the agency selling them marketing services. The **algorithmic**
  risk is softer — Google's spam policy targets scaled content abuse and its quality
  guidance rewards demonstrable first-hand experience; uniform machine cadence works against
  the second. I am not claiming a dash penalty exists.
* **Score impact:** −2.5 (Medium × 50% confidence)
* **Recommendation:** Rewrite against `docs/content-voice.md`. Note that the *legacy*
  copy — the founder's letter, the 18 FAQ answers, the legal text — is human-written and
  should be preserved, not "improved".

> Raw: 100 − 10 − 10 − 5 − 5 − 2.5 = **67.5** → weighted **10.13**

---

### Authority & Trust Signals — 75 / 100 (weight 10)

**Directional only.** No backlink data, no Google Business Profile access, no citation
audit. This category scores what the site itself signals.

---

**A1 · All three social links point at `#`**
* **Category:** Authority & Trust Signals
* **Evidence:** `components/layout/footer.tsx:21-25` — Instagram, Facebook, LinkedIn all
  `href="#"`. 30 `#` hrefs across the 12 built documents. Inherited from the legacy site and
  flagged `TODO(content)` at line 6.
* **Severity:** High · **Confidence:** High
* **Why it matters:** No `sameAs` entity signals, and a visitor who clicks a social icon and
  goes nowhere learns something about the agency's attention to detail. For an agency
  selling social media management, dead social links are the worst possible dead link.
* **Score impact:** −10 (Authority)
* **Recommendation:** Real profile URLs, then `sameAs` in the `Organization` schema.

---

**A2 · Incomplete NAP for a locally-targeted business**
* **Category:** Authority & Trust Signals
* **Evidence:** Address is `Nagpur, Maharashtra 440001` (`app/contact/page.tsx:51-54`,
  `components/layout/footer.tsx:48`) — no street, no building, no locality. No Google Maps
  embed, no Google Business Profile link. Phone and email are consistent across footer,
  contact page, careers, and legal pages (verified: 11 `tel:` and 14 `mailto:` instances,
  all identical), which is the one thing that is right here.
* **Severity:** High · **Confidence:** High
* **Why it matters:** The FAQ targets "in Nagpur" seven times. Local pack eligibility and
  citation matching both depend on a full, consistent NAP that matches the Google Business
  Profile exactly. A pincode alone will not match.
* **Score impact:** −10 (Authority)
* **Recommendation:** Full street address matching the GBP listing character-for-character;
  link the GBP profile. This also unblocks `LocalBusiness` schema (O3).

---

**A3 · No third-party proof of any kind**
* **Category:** Authority & Trust Signals
* **Evidence:** No testimonials, client logos, review counts, certifications (Google
  Partner, Meta Business Partner), press mentions, or awards anywhere in `app/` or
  `components/`.
* **Severity:** Medium · **Confidence:** High
* **Why it matters:** Everything on the site is currently the agency's own word. Partner
  badges are verifiable, free, and directly relevant to the paid-media claims.
* **Score impact:** −5 (Authority)
* **Recommendation:** Client testimonials with names and companies; any platform partner
  badges actually held. Do not invent these.

**Positive, no deduction:** all three legal policies exist and are substantive
(`/privacy-policy` 288 words, `/refund-policy` 274, `/terms-conditions` 567), and the
founder is named. Both are real trust signals the legacy site also carried.

> Raw: 100 − 10 − 10 − 5 = **75** → weighted **7.50**

---

## Prioritized action plan

Derived from the findings above. No timelines — sequence only.

### 1 · Critical blockers

**None.** Nothing currently blocks crawling, indexing, or ranking. The Health Index is
therefore valid rather than flattered by an unresolved Critical.

Two findings become Critical **at the moment of launch** and should be treated as launch
gates:
* **E2** — `/work` publishing rupee figures beside Picsum stock photography under a
  verification promise.
* **T2** — 16 third-party image requests on the LCP-critical home route.

---

### 2 · High-impact improvements

Metadata and indexation. Cheap, mechanical, and worth the largest single score movement.

| Do | Fixes | Category |
|---|---|---|
| `metadataBase` + self-referencing canonical per route | C2 | Crawlability |
| `app/sitemap.ts` (exclude `/blog`) | C1 | Crawlability |
| `app/robots.ts` — sitemap ref, disallow non-prod `VERCEL_ENV` | C4 | Crawlability |
| `noindex` or remove `/blog` until it has a post | C3 | Crawlability |
| Unique description on the 7 pages inheriting the root one | O4 | On-Page |
| Single `<h1>` on the home page | O1 | On-Page |
| `Organization`/`LocalBusiness` + `FAQPage` JSON-LD | O3 | On-Page |

**Expected recovery:** Crawlability 62.5 → ~95 (+9.75 weighted); On-Page 42.5 → ~72.5
(+6.0 weighted). **Roughly +16 points, to ~80 (Good).** O3 is partly blocked on A2 — ship
`Organization` now, upgrade to `LocalBusiness` when the street address exists.

---

### 3 · Quick wins

| Do | Fixes |
|---|---|
| Real social profile URLs in the footer | A1 |
| Full street address matching the GBP listing | A2 |
| `title.template` in the root layout + rewritten page titles | O6 |
| OG/Twitter metadata + one `opengraph-image` | O5 |
| `poster` + `preload="none"` on the services video | T3 |
| Logos to SVG/WebP through `next/image` | T4 |
| `app/icon.png`, `app/apple-icon.png` | T5 |

**Expected recovery:** Authority 75 → 95 (+2.0 weighted); Technical 78 → ~90 (+3.0);
On-Page +5 raw (+1.0). **Roughly +6 points.**

---

### 4 · Longer-term opportunities

* **Keyword research before any new page is built** (blocks O2, O8). The site names its
  targets in FAQ answers but has never validated them. Everything below depends on this.
* **Depth on `/services`** (E1) — then decide `/services/[slug]` on the evidence (O8).
* **Rewrite the newly-authored copy** against `docs/content-voice.md` (E5, O2). This is the
  next piece of work and the reason the companion doc exists.
* **Real case studies** with permission and imagery (E2), which also resolves O7.
* **Founder bio and credentials** (E3) — the cheapest E-E-A-T win on the list.
* **A first blog post** (E3, C3) — turns the orphan liability into an asset.
* **Measure before optimising the preloader** (T1). Deploy, run PageSpeed Insights on
  mobile, then decide.
* **Install analytics** — there is no tracking script in the build at all, so none of the
  above can currently be validated after the fact.

---

## Limitations

* The score reflects **SEO readiness**, not guaranteed rankings.
* Competition, algorithm updates, and the backlink landscape are not scored.
* The Authority score is directional — no backlink, citation, or GBP data was available.
* Core Web Vitals findings (T1) are lab-reasoned from code, not field-measured. Verify
  against real data before acting on them.
* Indexation findings are derived from build output and source, not from Search Console
  coverage reports.
* No previous audit exists, so no score delta is available. Re-run this document after the
  high-impact group ships to establish the trend.

---

*Companion: `docs/content-voice.md` — the em-dash and AI-tell inventory, plus the voice
rules for the rewrite.*
