# Content voice — the AI-tell inventory and the rewrite rules

Companion to `docs/seo-audit.md` (finding **E5**, and the on-page findings **O1/O2/O4/O6**
that the rewrite has to satisfy at the same time).

**Scanned:** 2026-08-25 · commit `55dd59b` · `app/`, `components/`, `lib/` + the 12
prerendered documents in `.next/server/app/`.

---

## The one number that makes the case

| Corpus | Em dashes | Words | Per 100 words |
|---|---|---|---|
| Legacy site copy (`docs/reference/legacy-site/text/*.txt`) | **3** | 4,274 | 0.07 |
| Rebuild — home page, rendered visible text | **9** | 377 | **2.39** |
| Rebuild — `/services`, rendered visible text | 4 | 341 | 1.17 |
| Rebuild — `/about`, rendered visible text | 4 | 293 | 1.37 |

The founder's own site, written by a person, used three em dashes in four thousand words.
The rebuild uses nine on the home page alone. **That is a ~34× density increase on the
page a prospect lands on first.**

There is a second, cleaner control inside the repo. `app/faq/page.tsx` carries 18 answers.
Sixteen are verbatim from the live site; two (Q5 and Q18) had no body in the crawl and were
written for the rebuild — the file says so at line 11. **Those two are the only two of the
eighteen that contain an em dash.** Nobody planted that; it is just what the two authors do
differently.

---

## Scan reproduction

```bash
# every em dash in shipping source, comments excluded
grep -rn "—" app components lib --include="*.tsx" --include="*.ts" | grep -v "^\s*//"

# rendered density per page (after: npm run build)
python3 - <<'PY'
import re,glob,os,html
for f in sorted(glob.glob(".next/server/app/*.html")):
    n=os.path.basename(f).replace(".html","")
    if n.startswith("_"): continue
    h=open(f,encoding="utf-8").read()
    for p in [r'(?s)<script.*?</script>',r'(?s)<style.*?</style>',r'(?s)<template.*?</template>']:
        h=re.sub(p,'',h)
    t=re.sub(r'\s+',' ',html.unescape(re.sub(r'(?s)<[^>]+>',' ',h)))
    w=len(t.split()); d=t.count("—")
    print(f"/{n:20} {d:>3} / {w:>4} = {100*d/max(w,1):.2f} per 100w")
PY
```

Current totals: **22 em dashes in body copy**, **14 in metadata and attributes**, 23 more in
code comments (harmless — no reader sees them, leave them alone).

---

## Inventory A — body copy (22 instances, 22 lines)

Fix all of these. `components/sections/work.tsx:40` renders four times on the home page and
`app/layout.tsx:33` is inherited by seven pages, so 22 source instances become ~30 on screen.

| # | File:line | Current | Rewrite to |
|---|---|---|---|
| 1 | `app/layout.tsx:33` | "…helping startups climb **—** step by step. Data-driven marketing, clear strategy, real results." | Split the sentence. Also fixes **O4** (7 pages inherit this). |
| 2 | `components/sections/hero.tsx:63` | "We build the ladder **—** data-driven marketing, clear strategy, real results." | Colon, or two sentences. |
| 3 | `components/sections/expertise.tsx:13` | "…engineered for efficient scale **—** the spend, the creative and the measurement run as one loop." | Full stop. Two sentences. |
| 4 | `components/sections/expertise.tsx:16` | "…impossible to confuse **—** typography, colour and voice built to work as one set." | Full stop. |
| 5 | `components/sections/expertise.tsx:18` | "The plan behind the spend **—** where to play, what to ignore…" | Colon. |
| 6 | `components/sections/work.tsx:40` | `<span> — {w.line}</span>` (renders 4×) | Structural separator, not prose. Use a middot, a line break, or a `<br>`. |
| 7–8 | `app/services/page.tsx:50` | "We audit what you have **—** spend, site, search, social **—** and agree…" | Two dashes in one sentence is the strongest tell in the file. Use parentheses or split. |
| 9 | `app/services/page.tsx:66` | "…or the pitch you are stuck on **—** the engagement is the same either way: a plan, a number to beat, and someone on the rope." | Dash **and** colon **and** rule-of-three in one sentence. Rewrite whole. |
| 10 | `app/about/page.tsx:10` | metadata description: "…agency in Nagpur **—** strategic thinking, creative execution, and numbers you can check." | Full stop. |
| 11 | `app/about/page.tsx:33` | "…want to scale and stand out **—** strategic thinking on one side, creative execution on the other." | Full stop. |
| 12 | `app/about/page.tsx:48` | "…measurable performance **—** delivered with responsibility." | Full stop. |
| 13 | `app/about/page.tsx:24` | "built from a simple belief **—** every brand has potential…" | **LEAVE. This is the founder's own sentence** (`legacy-site/text/about.txt:37`). |
| 14 | `app/work/layout.tsx:5` | metadata: "Case studies from ClimbX Digital **—** paid media, SEO, social and brand work…" | Rewrite with the target keyword (**O4/O6**). |
| 15 | `app/work/page.tsx:165` | "45 days, six months, one quarter **—** the period is part of the number." | Full stop. |
| 16 | `app/faq/page.tsx:36` | Q5 answer (ClimbX-written): "…strategy and consulting **—** the full route is on the services page." | Full stop; drop "the full route". |
| 17 | `app/faq/page.tsx:88` | Q18 answer (ClimbX-written): "…send the form on the contact page **—** whichever is quickest for you." | Full stop. |
| 18 | `app/faq/page.tsx:116` | "Ask it directly **—** you will get a person, not a form reply." | Dash + negative-parallel in nine words. Rewrite whole. |
| 19 | `app/contact/page.tsx:21` | "…we'll come back with a route **—** usually within two working days." | Full stop. |
| 20 | `app/careers/page.tsx:17` | "Own paid accounts end to end **—** plan, build, read the numbers, kill what doesn't work." | Colon. |
| 21 | `components/sections/contact-form.tsx:37` | mail subject `New enquiry — ${name}` | Colon. Some mail clients mangle non-ASCII in subject lines anyway. |
| 22 | `components/sections/contact-form.tsx:104` | "Your mail app should be open with it drafted **—** if not, write to…" | Full stop. |

## Inventory B — metadata and attributes (14 instances)

Eleven of these are the `" — ClimbX Digital"` title suffix, hand-repeated across nine files.
Consolidating them into one `title.template` in the root layout fixes the tell **and** fixes
finding **O6** (no template configured, suffix drifts) in the same edit.

| File:line | Current |
|---|---|
| `app/layout.tsx:31` | `"ClimbX Digital — Your Partner in Digital Growth"` |
| `app/services/layout.tsx:4` | `"What We Do — ClimbX Digital"` |
| `app/work/layout.tsx:3` | `"Work That Climbs. — ClimbX Digital"` |
| `app/about/page.tsx:8` | `"Built around your brand. — ClimbX Digital"` |
| `app/faq/page.tsx:8` | `"Frequently asked questions — ClimbX Digital"` |
| `app/contact/page.tsx:6` | `"Get in touch — ClimbX Digital"` |
| `app/careers/page.tsx:6` | `"Join the climb — ClimbX Digital"` |
| `app/blog/page.tsx:3` | `"Insights from the climb. — ClimbX Digital"` |
| `app/privacy-policy/page.tsx:4` | `"Privacy Policy — ClimbX Digital"` |
| `app/refund-policy/page.tsx:4` | `"Cancellation & Refund Policy — ClimbX Digital"` |
| `app/terms-conditions/page.tsx:4` | `"Terms & Conditions — ClimbX Digital"` |
| `app/careers/page.tsx:73` | mailto subject `Application — ${r.title}` |
| `app/careers/page.tsx:109` | mailto subject `Open application — CV` |
| `components/layout/nav.tsx:120` | `aria-label="ClimbX Digital — home"` |

Note the legacy site used a pipe: `FAQ | ClimbX Digital`. Its own convention is already the
fix. Use `%s | ClimbX Digital`.

---

## Leave these alone

Not every dash is a tell. Do not over-correct.

* **En dashes in numeric ranges** are correct typography, not AI residue:
  `app/faq/page.tsx:56` "7–21 working days", `app/contact/page.tsx:57` "Mon–Sat,
  10:00–19:00 IST". Keep.
  * One consistency nit: `components/sections/contact-form.tsx:16` spaces its en dashes
    ("₹1L – ₹3L") while the FAQ closes them up ("7–21"). Pick one. Closed up is standard.
* **The founder's letter** (`app/about/page.tsx:22-27`) — verbatim from
  `legacy-site/text/about.txt`. It contains the em dash at line 24, "not just about
  following trends, it's about building trust", and "We don't see our clients as just
  accounts". Every one of those reads as an AI tell in isolation. **They are a real person's
  sentences.** Rewriting them to sound less like AI would make the only genuinely human page
  on the site sound like everything else.
* **The 16 verbatim FAQ answers** and **all three legal documents** — legacy copy, already
  human, already indexed. Do not touch.
* **Code comments.** 23 em dashes in `//` comments. No reader sees them.

---

## The other tells (dashes are not the whole problem)

Removing 22 dashes and leaving the sentence architecture untouched produces prose that still
reads as machine-written. These are the structural habits.

### 1 · Negative parallel — "X, not Y"

The single most repeated construction in the new copy.

* `app/work/page.tsx:163` "Attributed, not claimed"
* `app/services/page.tsx:52` "Weekly, not quarterly."
* `app/services/page.tsx:53` "One report you can act on, and the next route already drawn."
* `app/faq/page.tsx:116` "you will get a person, not a form reply"
* `app/careers/page.tsx:17` "kill what doesn't work"
* `app/careers/page.tsx:37` "would rather own a number than a job title"

**Rule:** at most one per page, and only where the contrast is the actual point. Right now
it is the default rhythm.

### 2 · Rule-of-three lists

"a plan, a number to beat, and someone on the rope" · "data-driven marketing, clear
strategy, real results" · "spend, site, search, social" · "strategic thinking, creative
storytelling and measurable performance" · "typography, colour and voice".

Real writing has lists of two, four, and one. Three every time is a cadence, not a thought.

**Rule:** vary the count. If a list is exactly three and each item is exactly two words,
rewrite it.

### 3 · The fragment-after-colon

"The plan behind the spend: where to play, what to ignore…" · "Six disciplines, one ascent."
· "Four routes, four different mountains."

**Rule:** a fragment is fine. A page built entirely from fragments is a style, and it is the
style people now recognise.

### 4 · The climbing metaphor is load-bearing where it should be decorative

`/services` uses seven distinct metaphor words in 341 rendered words: *ascent, basecamp,
climb, pitch, rope, route, summit*. The four process steps are named **Basecamp / Route /
Climb / Summit** — four headings, zero information, zero keyword value. A visitor searching
"digital marketing process" or "how does an SEO agency work" finds nothing to match.

This is also SEO finding **O2**: no `<h1>` on the site contains a commercial or geographic
keyword, while the FAQ body targets "in Nagpur" seven times.

**Rule:** the metaphor lives in the brand name, the logo, one hero line, and the CTA. It
does not name the deliverables. "Basecamp" can keep its label *beside* a real heading —
`Step 01 · Audit` with "Basecamp" as the eyebrow — so the brand survives and the heading
does its job.

### 5 · Manufactured specificity

"survives contact with a real week" · "retired a losing ad within days, not quarters" ·
"the maths works, not because the budget grew" · "someone on the rope".

These sound concrete and assert nothing checkable. Real specificity is a number, a client, a
platform, or a date. Compare with what the legacy FAQ does: *"Most websites are completed
within 7–21 working days."* That is a claim someone can be held to.

**Rule:** if a phrase sounds specific but you cannot say who, when, or how much — cut it or
replace it with the actual figure.

### 6 · Uniform sentence length

Nearly every sentence in the new copy is 12–20 words. Human paragraphs swing: a four-word
sentence next to a thirty-word one. The founder's letter does exactly that; the rewrite
does not.

**Rule:** every paragraph gets one sentence under eight words or one over twenty-five.

---

## Rewrite rules

Apply while rewriting. The SEO constraints and the voice constraints are listed together
deliberately — they must be satisfied in the same pass, not in two.

**Voice**

1. Em dash budget: **two per page, maximum.** Prefer a full stop. Then a colon. Then
   parentheses. The dash is the last option, not the first.
2. One negative parallel per page, maximum.
3. Vary list lengths. Never three two-word items.
4. Every paragraph swings — one short sentence or one long one.
5. Specific or cut. Numbers, platforms, names, dates.
6. The metaphor decorates. It never names a deliverable or replaces a heading.
7. Read it aloud. If it sounds like a brand deck, it is not finished.
8. Preserve the founder's voice verbatim. It is the only first-person on the site and the
   only thing here that cannot be regenerated.

**SEO — must be satisfied by the rewrite, not bolted on after**

9. **One `<h1>` per page**, and it names the subject. The home page currently has three
   (`GROW.` / `CLIMB.` / `SCALE.`) — wrap them in a single `<h1>` with a real subject
   (audit **O1**).
10. Every `<h1>` carries a commercial or geographic term. "What we do." → something naming
    the services and Nagpur (audit **O2**).
11. **A unique 140–160 character description per route.** Seven pages currently share the
    root one (audit **O4**): `/`, `/blog`, `/careers`, `/contact`, `/privacy-policy`,
    `/refund-policy`, `/terms-conditions`.
12. **Titles: `title.template` = `%s | ClimbX Digital`** in the root layout, delete the
    hand-written suffix from nine files, and use the 60 characters. `/services` currently
    spends 27 of them on "What We Do" (audit **O6**).
13. `/services` needs real depth — 341 words across six disciplines is ~50 words each
    (audit **E1**). This is where the rewrite adds words, not trims them.
14. Do not write case-study numbers that cannot be traced to a client's own account
    (audit **E2**). `/work` already promises they can be.

---

## Worked example

**Now** (`app/services/page.tsx:66`, the `/services` page header):

> Six disciplines, one ascent. Take the whole route or the pitch you are stuck on — the
> engagement is the same either way: a plan, a number to beat, and someone on the rope.

Tells in 30 words: fragment-opening, metaphor as deliverable ("ascent", "route", "pitch",
"rope"), em dash, colon-fragment, rule of three, manufactured specificity. Zero keywords,
and the H1 above it is "What we do."

**Rewrite:**

> H1: **Digital marketing services in Nagpur**
> Six things we do: paid media, SEO, social, brand, web, and strategy. Take all six or just
> the one that's stuck. Either way you get a plan, a number to hit, and a weekly call where
> we show you whether it moved.

Six-item list (not three). One em dash → none. Metaphor gone from the deliverables and left
where it belongs, in the brand. "Digital marketing services in Nagpur" is now in the H1.
"a weekly call" is checkable in a way "someone on the rope" is not.

---

## Order of work

1. **Keyword research first.** Rules 9–12 need real target terms. The site names its
   targets in FAQ answers but has never validated them (audit action plan, group 4).
2. **`/` and `/services`** — highest traffic, highest intent, worst density.
3. **`/about` and `/work`** — proof pages. Preserve the founder's letter exactly.
4. **`/contact`, `/careers`, metadata sweep** — short, mechanical.
5. **Do not touch** the 16 verbatim FAQ answers or the three legal documents.
6. Re-run the scan at the top of this file. Target: **under 0.3 em dashes per 100 words**
   sitewide, which is still four times the legacy site's rate.
