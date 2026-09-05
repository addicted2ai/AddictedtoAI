# ui-loop — iteration 0 verdict (prose)

**Date:** 2026-08-31 · **Overall: 6.8** · **Ladder: Competent** · **No anchor** (iteration 0, scored from scratch; absolute values provisional)

---

## 1. Evidence audit

Before judging, what the evidence can and cannot support.

**Screenshots.** All 40 captures in `loops/ui-loop/evidence/current/` were read or sampled. I read all 20 `--1440` captures (ten labels × two themes) and the `--390` captures for home, table-catalog, index-wiki and article, as required. Because four pages exceed 3,000px and one (`table-catalog--light--1440.png`) is 13,427px tall, whole-page reads render too small to judge type and alignment; I cropped regions at native resolution for `table-catalog` (light and dark), `index-wiki` (light 1440 and dark), `article`, and the 390px catalog and wiki. All crops are derived from the filed PNGs with no resampling — they are the same evidence at usable magnification, not a new capture.

**Measured oracle.** `node scripts/verify-design.mjs` failed twice under the session's default sandbox with `serve-static exited with 1`; the cause was `EACCES` on `listen 127.0.0.1`, an environment restriction on binding sockets, not a defect in the script or the artifact. Re-run outside the sandbox it completed: **45 checks, 0 failures.** That output is the sole basis for the accessibility and payload scores, per the oracle table. I did not score either from a screenshot.

**Source.** I read `app/globals.css` where a finding turned on the token system, as the task permits. This corrected two hypotheses I had formed from the screenshots and would otherwise have filed wrongly:

- I was going to file "the catalog's column headers are not sticky across a 13,427px table." They **are** sticky (`.data-table thead th { position: sticky; top: 0 }`). Not filed.
- I was going to file "the link colour is a browser default blue." It is **not** — `--accent: #4a3bd4` is a deliberately chosen indigo, with a separate `--ember: #a62b21` for ended states. The colour was chosen; the problem is where it is spent (I8).

Reading the CSS then surfaced a defect the screenshots structurally cannot show — two `position: sticky; top: 0` claims in one scroll context (I7) — which is filed with that limitation stated, and paired with an `evidence-fix` (I13) to make it observable.

**What I declined to judge.** Hover and focus appearance, motion, tab *order* sensibility, and perceived speed: all declared blind spots. I6 is filed on the *resting* state only, which is exactly what the screenshot class is valid for. I14 is filed as `keeper-gate:reader` because it turns on what a real person does, which no capture answers.

---

## 2. What is genuinely good

Stating this plainly, because most of what follows is criticism and the criticism should not be mistaken for a verdict of "bad".

- **The measured floor is solid.** axe-core clean across four routes × both themes (45, 47, 51 and 46 rules passed). No horizontal scroll at 320px anywhere. Keyboard traversal not only *reaches* but *activates* nav, search and the theme toggle on every sampled route, and keyboard-only search returns results and opens them. Focus indicators present on every stop swept. R6 satisfied at both viewports (12 and 4 feed lines above the fold).
- **`/learn` is an excellent page.** A narrow left rail carrying the level label and its description, a content column beside it, rules only at level boundaries, no badges, no per-row hairlines — hierarchy entirely from type weight and space. This is the Linear mechanism, executed well, *already in this codebase*. Most of my prescriptions amount to "do what `/learn` does."
- **The serif/mono split is a real editorial idea**, not a default: serif for argument, mono for every dated machine-read fact. It gives the site a voice.
- **The catalog table's desktop craft is good** — numeric right-alignment, mono figures, uppercase small-cap headers, real filter controls, sticky `thead`, a genuine row count.
- **The dark theme is properly built**, not a filter: a distinct palette, `color-scheme` declared, and the un-stamped state correctly handled via `prefers-color-scheme` guarded by `:root:not([data-theme="light"])`. The captures I was given *are* the un-stamped state, and it holds.

---

## 3. Category-by-category

### 1. First-read hierarchy — 7.0

The eyebrow → serif title → lede → mono provenance-note pattern is used on every template and works: within a second you know what page you are on and what it contains. Content is above the fold on the home page at both sizes (measured, not eyeballed).

It is held at 7 by three placement failures rather than any type failure. On `home--light--1440.png` the right rail ends around y=480 while the feed beside it runs to y=1120, so the front door has ~640px of empty column through its middle. On `wiki-entry--light--1440.png` the FACTS block — the structured answer a reference reader came for — sits at y≈2400 of a 2937px page, behind every word of prose. On `index-wiki--light--1440.png` the ~950px gap between an entry name and its type breaks the association the row exists to make.

*Path to target:* I5 (facts beside the prose, not below it), I9 (rail fills its column), I4 (row associates its own values). Those three take this to ~8.5; the type work needs no change.

### 2. Chrome restraint — 5.0

The worst category, and the one the benchmark comparison is most brutal about.

Every list on this site draws a 1px rule under every row: 396 on `/catalog`, ~85 on `/wiki`, 24 on the home feed, 12 on the `/tools` jump list, 11 on `/data`. `/catalog` additionally boxes the whole table. On top of that, `.badge` renders a bordered uppercase chip on *every* row including the default: roughly 60 grey `ACTIVE` chips on the wiki index and 396 on the catalog, all identical.

**Benchmark — Linear.** The mechanism is not "Linear is cleaner." It is that in Linear's issue lists the *default* state renders as **nothing at all**, and separation between rows is produced by consistent row padding and a single alignment axis, with a rule reserved for group boundaries. What that buys is a scan in which every mark you see is a mark that means something — an assignee avatar, a priority glyph, a status that is *not* the default. Here, on `table-catalog--dark--1440.png`, 396 grey `ACTIVE` boxes march down a column beside 396 horizontal rules, and the ember-bordered `DEPRECATED` chip — the one mark on the page that carries real state — has to compete with 396 boxes that carry none. The site inverts Linear's rule: it marks the default and lets the exception blend in.

The cost is **higher in dark**, which is a "both themes equally considered" failure with a measurable cause: `--rule: #2c303b` against `--paper: #14161c` is a higher-contrast line than `#d7d8e0` against `#f6f6f8`. Comparing `table-catalog--light--1440.png` with `table-catalog--dark--1440.png` at the same magnification, the same rule set reads as a distinctly stronger ladder in dark. A chrome budget that is merely tolerable in light is overspent in dark.

*Path to target:* I2 alone. Drop `border-bottom` from `.browse-row` and `.data-table tbody tr`, keep one `--rule-strong` line under the header, and render `.badge` only when `data-tone` is set. That is a small diff with a large effect and should move this to ~8.

### 3. Information density — 6.5

The rubric asks two things: how much useful content reaches the reader per screen, **and whether density is consistent between templates**. The first is often fine; the second fails badly.

`/catalog` and `/learn` are dense and legible. `/tools` is reasonable. But `/wiki` spends 80% of each row's width on nothing (`index-wiki--light--1440.png`); `/data` does the same (`data--light--1440.png`); `/blog/*`, `/wiki/*` and `/colophon` leave 545–600px of a 1216px shell permanently empty with nothing placed in it; and `index-blog--light--1440.png` puts four rows in a viewport and then stops. Across the property, "how much reaches me per screen" varies by roughly a factor of five with no principle governing which page gets which.

*Path to target:* I4 and I5 recover the wasted width where it exists; I3 makes the variation principled rather than accidental. ~8 is reachable without any page becoming more cluttered.

### 4. List and table craft — 5.5

These are the site's primary surfaces, so this category carries weight, and it contains the single worst defect on the property.

**At 390px the catalog shows the model name and nothing else.** `table-catalog--light--390.png` shows the table clipped to the MODEL column; in/mtok, out/mtok, context and status are all off-screen behind a container scroll. The reflow oracle corroborates the mechanism rather than contradicting it — at a 320px viewport it reported `thead 1112px; tr 1112px`, meaning the table retains its full desktop width and hides ~760px of it. R2 passes. The page does not scroll; the container does; that is "correct by design" per the oracle table. And the result is 13,843px of scrolling that delivers 396 names and no numbers. This is the case the oracle table warns about: a cheap check passing while the surface is useless.

**Benchmark — Stripe.** Stripe treats structured tabular presentation as a first-class surface, and the specific move is that at narrow widths a data table is *rebuilt* — into stacked label/value records, or a prioritised two-or-three column subset — rather than preserved at desktop width behind a scrollbar. What that buys is that the mobile reader keeps the ability to compare down a column, which is the only reason a price table exists. Here that ability is lost entirely: comparing two models' prices requires scrolling each row horizontally on its own, which destroys the alignment that made comparison possible.

Three further defects: the `READ` column repeats the identical string `2026-08-31` on all 396 rows as an independent link (a column that discriminates nothing, and the direct cause of the route's 817 focusable elements); the wiki index's 950px name-to-type gap; and `/tools` rendering four repeated fields per entry as 35 run-on mono sentences where Stripe would use four aligned columns.

*Path to target:* I1 is the whole difference between 5.5 and ~7.5; I8 and I11 take it toward 8.5.

### 5. Typographic system — 7.0

One scale (`--step--1` … `--step-4`), a controlled measure (`--measure: 38rem`), deliberate weights, a consistent eyebrow/title/lede rhythm, and a domain-appropriate two-family split used with real discipline. On the evidence of `article--light--1440.png` and `prose--light--1440.png` the prose is well set.

**Benchmark — Vercel.** Vercel's mechanism is a face chosen and *shipped* for the property, so the grid's rhythm resolves identically on every page and every machine. This site has **no `@font-face`, no `next/font`, no bundled face anywhere in `app/`**. `--serif` is `Charter, "Bitstream Charter", "Sitka Text", Cambria, Georgia, "Times New Roman", serif`. Those faces are not metric-compatible: their x-heights and set widths differ materially. So the "controlled measure" of 38rem yields a different character count on macOS, Windows and Linux, and the vertical rhythm lands on different baselines. The typographic system this category credits is only reliably true on machines that happen to have Charter installed — which is the precise mechanism Vercel's approach eliminates.

I note the cap here deliberately. "It uses system fonts so it looks generic" would be a distinctiveness symptom and could not carry impact above 4. That is not what I filed. I filed the *metric instability across platforms* (I10), which is an uncapped typographic-system defect that the distinctiveness symptom merely pointed at — the narrow exception the rubric allows.

*Path to target:* I10. Self-host one subset woff2 with a `size-adjust`-tuned fallback. ~8.5.

### 6. Colour discipline — 7.0

A genuine strength, scored down for one specific misuse rather than for the palette.

The neutral is chosen, not defaulted (`--paper: #f6f6f8`, not `#fff`). `--accent: #4a3bd4` is a deliberate indigo. `--ember: #a62b21` is reserved for ended lifecycle states and is used consistently across `DEAD`, `RETIRED` and `DEPRECATED` on `index-wiki--light--1440.png`. The dark palette is separately authored. Both themes are axe-clean (measured). The un-stamped state — what the captures show — is correctly handled.

The failure is that **the accent is spent on link-ness rather than on state**. On `table-catalog--dark--1440.png`, two of seven columns (MODEL and READ) are *entirely* accent-coloured, on all 396 rows. Colour reserved for state and meaning is the one principle all three benchmarks agree on; here the site's meaning-colour is drowned by its link-colour, and the ember that marks a genuinely deprecated model competes with 792 accent-coloured cells that mark nothing.

*Path to target:* I8 removes one of the two accent columns outright. Combined with I2's badge change, the ember regains its signal value. ~8.5.

### 7. Family coherence — 5.5

The rubric says a template that looks good alone but breaks the family caps this category, and that is exactly the situation.

**Three container geometries, three different right edges.** The left margin is a consistent 145px everywhere — good — but the content's right edge lands at ~1295px on `/catalog`, `/wiki` and `/data`; ~1000px on `/learn`; and ~750px on `/blog/*`, `/wiki/*` and `/colophon`. Nothing occupies the difference. A reader moving between two pages of one property sees the text block change width by 545px with no signal that anything changed.

**Three link treatments across three index templates.** `/catalog` sets model names in accent + underline. `/wiki` sets entry names in plain `--ink` with no underline at all. `/blog` sets post titles in accent bold with no underline. Three indexes, three conventions for the same act.

**Two contradictory label/value idioms.** `prose--light--1440.png` packs its Records / Catalog / Change-history pairs into a tight left-aligned block — correct. `data--light--1440.png` and `index-wiki--light--1440.png` justify the same kind of pair to opposite ends of a 1150px row — wrong. The system contains both and picks between them arbitrarily.

**Benchmark — Vercel** again, on the second half of its mechanism: a grid whose rhythm *stays visible across every page of the property*. That is what is missing. Not polish — a shared grid.

*Path to target:* I3 (two declared tracks, one link treatment) and I4. ~8.

### 8. Responsive integrity — 7.0

Measured: no page-level horizontal scroll at 320px on any of the four probed routes. Home reflows cleanly at 390 (`home--light--390.png`: header stacks, feed rows go date / name / detail on three lines). The wiki index reflows *well* — `index-wiki--light--390.png` shows name and badge adjacent on line one and type on line two, which is a better-composed row than the same component produces at 1440.

Held at 7 because the primary surface complies with the letter of R2 while defeating its purpose (I1). I have deliberately not scored this lower: the rubric's own wording is "wide content scrolling inside its own container," which `/catalog` does. The defect is that the *content chosen to be wide* should not have been. That is list-and-table craft, and I have scored it there rather than double-counting it here.

*Path to target:* I1. ~8.5.

### 9. Accessibility — 8.5 *(hard-measured)*

Scored only from `scripts/verify-design.mjs` output. 45 checks, 0 failures. axe clean on `/`, `/wiki/concept/ai-winter`, `/catalog` and `/tools` in both themes. Reflow clean at 320px. Keyboard traversal reaches *and activates* nav (7 of 7), search and the theme toggle on every route, and keyboard-only search returns results and opens them — R4's "reaching is not the same as being able to use it" is genuinely satisfied. Focus indicators present on every stop swept, including complete sweeps of `/` (83 stops) and `/tools` (98 stops, with the closed-`<details>` case correctly explained).

Two things hold it below 9.5. First, `/catalog` swept **150 of 817** focusable elements and recorded a PASS — 18% coverage, with the unswept remainder being exactly the deep-table region most likely to differ (I12). That is R5's own preserved post-mortem failure mode returning as a cap instead of an early return, and the check prints both numbers, sees them disagree by 667, and passes anyway. Second, 817 tab stops on one route is a real burden even though axe's bypass rule passes on landmarks; I8 halves it.

I have not scored this down for the incomplete sweep as though the artifact failed — it may well be fine. I scored it as an oracle that cannot currently certify the route it most needs to.

### 10. Payload discipline — 9.5 *(hard-measured)*

Measured against the 150 KB gzipped bound from `data/launch.json`: `/` at 109.5 KB, `/wiki/concept/ai-winter` at 109.1 KB, `/catalog` at 122.3 KB. Comfortable headroom on every sampled route, and the discipline is real — this is a static export with no framework bloat. Not 10 only because `/catalog` ships 346.8 KB raw inline script (17.5 KB gzipped) and 581.4 KB raw HTML to render a table whose 396 rows are almost all off-screen; the bound is met, but the route is carrying the whole dataset eagerly.

### 11. Visual distinctiveness — 6.0 *(capped contributor)*

There **is** an identity here, and it is not a template: Charter serif against mono, indigo and ember, uppercase mono eyebrows, no cards, effectively no shadows, provenance stated in the layout rather than hidden. It reads as a considered reference publication with an editorial point of view.

It is held at 6 by the system-font-only stack and by the ubiquitous bordered chip, which together pull it toward "well-set default."

**Observing the cap:** this score is not a reason the overall is held down, and I have filed no item whose only symptom lives here. The nearest candidate, the missing webfont, is filed as I10 at impact 5 against the *typographic-system* defect it causes (cross-platform metric instability), not against the way it looks. If distinctiveness were scored 9 instead of 6, the overall would not move.

---

## 4. Overall and ladder

**Overall 6.8.** The ten uncapped categories average 6.85; distinctiveness at 6 is capped out of holding it down and does not raise it. I did not round up: the damage is concentrated in the three categories that most govern whether a reference reader finds what they came for — chrome restraint at 5.0, list and table craft at 5.5, family coherence at 5.5 — and the site's single most important surface is functionally empty on a phone.

**Ladder: Competent.**

Not *Functional* — that would be unfair. This site is accessible on measurement, fast, coherent in voice, dark-theme-correct, and contains at least one page (`/learn`) I would hold up as an example.

Not a *Well-designed reference site*. To earn that, the primary surface must work on the primary device; `/catalog` at 390px delivers names and no numbers. A well-designed reference site also does not run three container geometries, three link conventions and two contradictory row idioms across seven templates, and does not spend its structural budget on 396 rules and 396 chips that say the same word. Those are not refinements outstanding; they are the system not yet being one system.

The encouraging part is that the fixes are mostly **subtractive and mostly central**. Seven of the eleven `ui-fixable` items target `globals.css`, several are single-declaration changes, and the correct pattern for most of them already exists elsewhere in this codebase — `/learn` for chrome, `/colophon` for label/value pairs, `/catalog` for column alignment, `/blog` for link colour. This is a site that has already solved each of these problems once and has not yet propagated the solution. That is a good position to be in at iteration 0, and 8.5 is reachable.

---

## 5. Item summary

14 items: **11 `ui-fixable`**, **2 `evidence-fix`**, **1 `keeper-gate`** (`reader`).

| id | impact | target | one line |
|---|---|---|---|
| I1 | 9 | catalog template | 390px catalog shows names only; all numbers behind a container scroll |
| I2 | 8 | globals.css | rule under every row + chip on every row, including the default state |
| I3 | 7 | globals.css + layout | three container geometries, three link treatments, no shared grid |
| I4 | 7 | globals.css `.browse-row` | 1fr name column strands type/status ~950px away |
| I5 | 7 | wiki entry template | FACTS buried at y≈2400 while 545px of column sits empty |
| I6 | 6 | globals.css `.browse-name` | wiki entry names have no resting link affordance |
| I7 | 6 | globals.css | two `sticky; top:0` claims — table head occluded by site header |
| I8 | 6 | catalog template | READ column: 396 identical dates, 396 redundant tab stops |
| I9 | 5 | home template | right rail dies at 40% height, ~640px void on the front door |
| I10 | 5 | globals.css | no webfont; non-metric-compatible fallback chain destabilises the measure |
| I11 | 5 | tools template | four repeated fields per entry set as 35 run-on mono sentences |
| I12 | 4 | evidence rig | focus sweep PASSes having swept 150 of 817 stops (R5 post-mortem redux) |
| I13 | 4 | evidence rig | every capture is top-of-document; scrolled/sticky states unobservable |
| I14 | 4 | keeper (`reader`) | whether filters let a reader converge in a 396-row table — untestable here |

**Restructures requiring KP1 before commit:** I5 and I9.
**Items whose prescription touches a rule that must not regress:** I1 (R2), I6 (R1), I8 (R4/R5), I9 (R6), I10 (R3), I11 (R2).
**Candidate new rules if accepted:** I1's 390px-column invariant, I2's exception-only status rule, I5's entry-page intent-preservation rule (the R6 analogue for wiki entries).
