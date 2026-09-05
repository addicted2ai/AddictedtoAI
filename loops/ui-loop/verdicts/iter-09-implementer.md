# iter-09 — implementer report

Six items (judge A: I40, I41, I42, I43; judge B: I40, I41 — two independent I40/I41 pairs,
disambiguated below as "judge A / I40" etc., matching the queue's own headers). All six are
instances of one failure mode: a check registered to close an item inherited the ITEM's
scope, not the RULE's. The brief for this round was to state each rule's full domain, assert
across all of it, and accept an honest red where the fix could not close the whole domain in
one pass. That happened once (R13 / wiki entry template, below).

**Final gate: `npm run build` clean; `node scripts/verify-design.mjs` 45/45; `node
tools/ui-invariants.mjs` 18/19** — S18 is left FAILING on its new wiki-entry clause,
deliberately, with cause recorded in RULES.md R13's iter-09 addendum and in this report.
Every other check that was touched (S5, S15, S17, S19, S20) was re-falsified in both
directions after the change and is green. No check was widened and then left unverified.

---

## R7 (S1, S15, S16) — judge A / I43, `/blog`'s title column

**Full domain, stated.** R7 binds every row-based list's primary label/title column to a
measure token so metadata doesn't drift to the container's far edge. Its family now spans
`.browse-name` on `/wiki`, `/data`, `/tools` (`--measure-list`, S1/S16) and `.rail-title` on
`/blog` (S15). The item's own point: a post title is a HEADLINE (a sentence), a browse label
is a NAME/TERM — two different objects that had been sharing one cap.

**Verified against source.** `/blog`'s four post titles all sat at exactly 3 of 3 allowed
lines against `--measure-list` (384px), zero headroom — confirmed live, matching the item's
own reading. The lede above the list was bounded to `--measure` (608px), 224px wider than
the list's own resolved width (500px) below it.

**What I did.** New token `--measure-title: 38rem` (equal to `--measure`), declared beside
`--measure-list` in `app/globals.css`'s `:root` block. `.rail-posts .rail-item`'s second
track now uses it instead of `--measure-list`. `--measure-list` itself is untouched — `/wiki`,
`/data`, `/tools` are unaffected, so I32's dead-air drift (a cap too generous for a surface's
typical content) cannot reopen there.

**Widened check.** `S15`'s cap and every message string moved from `--measure-list` to
`--measure-title`. `MAX_WRAP_LINES` dropped from 3 to 2, matching what the wider cap actually
needs — measured live: all four titles now wrap to exactly 2 of 2 lines. **Recorded honestly
as zero headroom**, not oversold as slack — the same discipline the file's own iter-08
addendum already states (don't claim margin measurement doesn't show).

**Falsifier observations, both directions, re-run live:**
- Old track reintroduced (`--measure-list`, 384px): routes to the COLLAPSE branch (narrower
  than the check's own 608px cap) — `"title ... wraps across 3 lines — the title track has
  collapsed to 384.0px, narrower than its own --measure-title cap (608.0px)"`.
- Font inflated at the new cap: `"wraps across 3 lines even at the --measure-title cap
  (608.0px) — exceeds the 2-line allowance"` — confirms 2, not 3, is what fires.
- Opposite (track squeezed to 40px): `"wraps across 16 lines — the title track has collapsed
  to 40.0px..."` — unchanged reading, confirming the collapse branch still works at the new
  cap value.
- `S1`, `S16` unaffected (their own token, `--measure-list`, was not touched) — re-ran, both
  still green.

**R10 interaction, verified rather than assumed.** `.rail-posts` is `width: fit-content`
(R10's iter-08 addendum); its border-top now resolves to 724.0px (100 + 16 + 608, the new
track), confirmed live via `getComputedStyle`, not re-derived from either token's literal
value.

---

## R8 (S17) and R9 (S20 clause B) — judge A / I42, home changed feed's `.src`

**Full domain, stated.** R8's iter-08 addendum governs any repeated, non-discriminating
value competing at a discriminating column's own weight — S17 covered `/catalog`'s Read
column and `/tools`' `.listing-verified` before this round; the home changed feed's `a.src`
("source", 24 of 24 rows) is the THIRD surface, and it was worse than either: rendered at
the bare `a { color: var(--accent) }` default (no rule of its own had ever been written for
it), i.e. LOUDER than `a.change-name` (the record link) beside it, not merely equal — R9's
accent-reservation clause is engaged on the same element at the same time.

**What I did.** `.src` (globals.css) now carries its own rest/hover pair — `--muted`
underlined at rest, `--accent` only on hover/focus — the same pattern every other record
link on the site already uses. This single rule also closes /blog's `[slug]` "Primary
evidence" citation links, which share the class and had the identical unstyled-default
problem, unevidenced by any item but caught by fixing the base selector rather than a
route-scoped override. `/catalog`'s exceptional-row `<a class="src">` is unaffected —
`.data-table a` (a higher-specificity selector) still wins there, so a row whose date
genuinely differs from the collection default still rises to ink.

**S17 widened.** Route list extended to `/`; new clause compares `a.src`'s dominant colour
against `a.change-name`'s on the same row (the record link is the named comparison
reference — there's no numeric column on a changed-feed entry). Falsified: `--break
".src{color:var(--ink) !important}"` → `"the changed feed's provenance link text \"source\"
appears on 24/24 rows (100.0%) and renders at the SAME computed colour ... as the record
link"` — matches the verdict's own "24 of 24" reading exactly. No dedicated opposite-
direction fixture for this specific clause (documented in the check's own falsifier text):
the changed feed has no fixed-format field to attach a `data-default`-style synthetic
fixture to the way `/catalog`/`/tools` do, and the registry's two-sidedness requirement is
already satisfied at the invariant level by those two existing fixtures, which exercise the
identical badge-clause-other-half property.

**S20 (R9) also widened to cover this** — see below, one combined document sweep now covers
`.src`, `.change-annotation`, `.span-rule` and the badge classes together.

---

## R9 (S20) — judge A / I41, the document sweep

**Full domain, stated.** R9's iter-08 addendum is absolute and page-wide ("a resting
border, rule or divider shall never carry [--accent]"); S20 tested exactly two selectors on
one page. Falsified the scope gap by inspection before touching anything: `--break
".door{border-top-color:var(--accent)}"` fired; `--break
".change-annotation{border-left-color:var(--accent)}"` and `--break
".span-rule{background:var(--accent);opacity:1}"` both left S20 green — reproducing the
item's own finding exactly.

**What I found, verified against source (one field-name correction).** Three live
violations: (a) `.change-annotation`'s `border-left`, 2px, opacity 1, home page, the changed
feed's most prominent entry. (b) `.span-rule`'s `background`, opacity 0.45 — 4 instances on
home, 54 on `/impossible-routine` (confirmed by grep on the built HTML). (c)
`.badge[data-tone="theme"]` on wiki entries — border, background AND text all at accent. The
item cited this attribute as `data-kind`; verified against `lib/render/common.mjs`'s
`badge()` helper before writing anything — the actual attribute is `data-tone`. The wrong
name was not propagated into source comments or the new check.

**What I fixed.** (a) → `--rule-strong`. (b) → `--rule` at opacity 1. (c) → folded into the
same unboxed treatment `.badge:not([data-tone])` already uses — a topic tag is a category,
not an exceptional state, and boxing it at rest was marking the norm as the exception on the
same line as the entry's genuinely-unboxed status/maintenance tags.

**What the sweep found beyond the item's own evidence, and what I did with it.**
`.badge[data-tone="early"]` and `.notice[data-tone="warn"]` also spent `--accent` at rest —
`early` is a genuine exception (preview/announced) and correctly stays boxed but now on the
base `.badge` styling rather than a hue the palette has no third colour for; `warn` is
`notice()`'s own DEFAULT tone (`tone = 'warn'` is the function's default parameter), so
colouring it was marking the norm as the exception a second time. **Both fixed even though
neither renders on any of the 14 routes today** (`grep -c 'data-tone="early"' out/**` and
the same for `warn` notices both return zero) — a currently-dormant instance of the exact
defect the round is about, left as a landmine otherwise. Declined: `--accent-soft`
backgrounds on `.prose code` and elsewhere were NOT touched — the widened sweep compares
against `--accent`'s own resolved value exactly, and `--accent-soft` resolves to a
genuinely different colour, so it's outside this specific prohibition's literal text; I
judged extending the ban to tinted derivatives a separate design decision this round's
evidence doesn't support.

**Widened check.** S20 is now two clauses: clause A (route `/`, unchanged — the door/delta
sibling-uniformity test) and clause B — a live sweep of `<main>` on 7 routes (`/`,
`/impossible-routine`, a wiki entry, `/catalog`, `/tools`, `/data`, `/blog`), every element,
every resting border side plus background plus outline, failing on any exact match to
`--accent`'s own resolved value. A resting-state sweep naturally excludes every
`:hover`/`:focus-visible` rule (neither pseudo-class is engaged by an unfocused page load),
so no allowlist was needed — none exists, matching the item's own prediction.

**Falsifier observations, all six breaks, re-run live:** door/delta/non-accent (clause A,
unchanged, still fire correctly) plus three NEW clause-B breaks, one per fixed violation —
`.change-annotation`, `.span-rule`, `.badge[data-tone='theme']`. The badge break is worth
recording: the FIRST attempt (`border-color` only) did NOT fire (0 of 1) — `border: none`
sets border-STYLE to none, and overriding only the colour channel doesn't reinstate a
visible border, so the sweep's own width/style gate correctly saw nothing to inspect. Fixed
with the full `border` shorthand, which then fired correctly. Recorded as a genuine
falsifier finding, not smoothed over.

**Not sampled: the other 7 routes** (`/colophon`, `/learn`, `/tutorials`, `/wiki` index,
individual `/blog/[slug]` posts, `/tools/[slug]`, `/data`'s sibling entries). Declared, not
hidden — see "What remains" below. Dark theme was spot-checked by direct inspection
(screenshots, both viewports) on every touched route rather than by a scripted
`colorScheme: 'dark'` run — no check in this harness currently drives Playwright's
`colorScheme` at all (a structural gap across the whole file, not one I introduced or
closed this round).

---

## R13 (S18) — judge A / I40, the wiki entry two-column template

**Full domain, stated.** R13's iter-07(a) dead-track floor ("neither sibling shall hold its
wide track open beside the other for more than 40% of its own height with nothing in it")
was enforced on `.home-grid` only. The wiki entry template — 495 pages, the site's most
numerous surface — has the identical two-column split and the identical defect, worse:
measured live, `/wiki/concept/ai-winter` — `.entry-facts` 451.9px against `.prose`
1945.1px, **23.2%**; `/wiki/event/attention-is-all-you-need` — 294.4px against 1733.1px,
**17.0%**. Both far under the 60% floor `.home-grid` already clears.

**What I tried first, and why it was wrong — recorded because it's a real CSS Grid
mechanic, not a one-off mistake.** Placing `.entry-facts`, `.entry-timeline` and `.rails` as
three independent `<article>` children, each `grid-column: 2`, does NOT make them share one
box. CSS Grid auto-placement puts FACTS into the same implicit row as PROSE; that row's
height is set by its tallest occupant (PROSE, ~1945px); RAILS, needing its own row because
FACTS already holds row 2's cell, drops to row 3 — which cannot begin until row 2's full
height is spent. Measured on that attempt: FACTS 226.9-678.8px, RAILS 2203.9-2360.9px — an
UNCHANGED 1493px gap, merely narrowed from 1152px wide to 524px wide, not closed. A grid
row's height is driven by whichever single item is confined to it; the fix needed the freed
track's content as ONE item, not several.

**What actually worked.** `.entry-side` — a wrapper `renderEntryPage` now renders around
FACTS + TIMELINE + RAILS (`lib/render/entry.mjs`), matching `.home-side`'s own role on the
home page. `display: contents` below the 60rem breakpoint (so the existing mobile
facts-before-prose `order` reflow is completely untouched — verified live at 390x844, FACTS
still renders first); a real block box above it, one grid item beside PROSE. DOM/reading
order is unchanged in both states — a screen reader encounters facts, then timeline, then
rails, exactly as before; only paint position moves, matching this rule's own established
restructure pattern.

**Measured result, honest.** `ai-winter`: `.entry-side` 640.9px against `.prose` 1945.1px =
**32.9%**. `attention-is-all-you-need`: 697.4px against 1733.1px = **40.2%**. Real,
verified progress (1.4x-2.4x the pre-fix ratio) — **both still short of the 60% floor.**

**Second lever, declined with cause.** The item itself anticipated this and named a second
lever: below some facts-to-prose ratio, fall back to the single-column order `S14` already
validates. I examined two ways to build it and declined both:
1. A hand-tuned text-length heuristic (word/character count as a height proxy) — no way to
   validate its threshold against real rendered pixels across 495 entries without a much
   larger measurement pass than this round's budget allows, and this loop's own registry
   already refuses a check it can't falsify with confidence in both directions. A wrong
   heuristic (flipping a genuinely-balanced entry to single-column, or missing a genuinely
   lopsided one) is worse than an honest, documented shortfall.
2. Widening PROSE's own column past `--measure` to shrink its rendered height — optimises
   the ratio at the direct expense of the property `--measure` protects (line-length
   readability). This is exactly IMPLEMENT.md's own "check the prescription optimises the
   right quantity" trap, and I declined it on that basis alone.

**S18 widened, left honestly red.** Route list now includes `/wiki/concept/ai-winter`, same
symmetric 60%-floor formula as the home clause. Falsified both directions live: forcing
`.entry-side` to 6000px min-height flips PROSE to the short side and fires correctly
(`"32.4% of .entry-side's own height"`); forcing it to 1200px clears the floor and PASSES
(`"61.7% ... 54.9px more before the floor is crossed"`), confirming the clause is
satisfiable and not vacuously always-red. The real, unbroken gate fails on
`/wiki/concept/ai-winter` at 32.9% — **left failing, not loosened, not scoped back down.**

---

## R10 (S5) — judge B / I40, `/catalog`'s preamble disclosure

**Full domain, stated.** R10 governs every route with a rule dividing a content block; S5
had never sampled `/catalog`. This round's own I23 remedy (the collapsible `<details>`
preamble) introduced `.catalog-preamble[open] > summary { border-bottom: 1px solid
var(--rule) }`, spanning the full 1152px shell while the widest actual content LINE inside
the disclosure — measured with my own Range-based method — reached 670.3px (the verdict's
own coarser box-based reading was 882.9px; both agree on a several-hundred-pixel overhang).

**What I did.** Dropped the border-bottom entirely rather than resizing it — the cheaper of
the two prescribed options, and the better-reasoned one: this control exists to solve a
390px problem (R6/R14), the rule was only ever painted at 1440px where there was none, and
the site's other two disclosures (`.nav-disclosure`, `/tools`' `.listings-az`) already carry
no such rule.

**A real instrument bug, found twice on the way to a working check — worth recording
because the exact shape (S1's, S5's own /blog clause's) keeps recurring on new surfaces.**
Attempt 1 measured each of the preamble's DIRECT children's own box: two of the four content
lines (fetch-line, sort-note) are rendered into a wrapping `<div dangerouslySetInnerHTML>`
(`app/catalog/page.tsx`), so the box measured was the DIV's own — unconstrained, full-shell
width regardless of actual text length. A break reinstating the old rule measured "0 of 1
fired". Attempt 2 applied a Range to those same direct children — S1's own established fix
for a box-vs-text mismatch — and was STILL vacuous: a Range over an element whose only
content is itself a block box returns that block's own layout rect, not a text line.
Attempt 3 selects the four actual text-bearing `<p>` elements (`.page-lede, .fetch-line,
.sort-note`) directly and Ranges those — this is what shipped.

**Falsifier observations, both directions, re-run live on the working check:**
- Rule reinstated: `"the border-bottom spans 1152.0px, 481.7px away from the widest
  rendered content LINE the disclosure introduces (670.3px)"`.
- Opposite (rule forced to 50px, content unchanged): `"spans 50.0px, 620.3px away from...
  (670.3px)"`.

Written generically (measures whatever border exists, if any) rather than assuming there's
nothing to check now that the rule is gone — a future reintroduction is still caught.

---

## R13 (S19) — judge B / I41, `/tools`' page-wide track alignment

**Full domain, stated.** R13's shared-track-set clause reads "share ONE set of grid tracks
across every row of THAT SURFACE" — the surface is the whole `/tools` listings index, not
one category. Each category's `.listings` declared its own independent trailing tracks
(correct WITHIN a category, per iter-07(b)'s own remedy), but each one's own `max-content`
columns sized against only that category's longest wiki-entry label, so the SAME field
landed at seven distinct x positions across the twelve categories (measured live on the
shipped build: 1009.4 to 1070.3px, 60.9px of spread) — the check's own scope (`S19`) was
narrower than the rule's.

**What I did.** Hoisted the real track declaration one level up, using the identical
subgrid mechanism R13 already established one level down (`.listing` onto `.listings`):
`.tools-index` (a class added to the wrapping div in `app/tools/page.tsx`) declares
`grid-template-columns: minmax(0, 1fr) max-content max-content` once; every category's
`.section` and its own `.listings` now `grid-template-columns: subgrid` onto it, so
`max-content` on the trailing two tracks is computed from every listing on the PAGE, not one
category's own. Verified live: `.listing-verified` and `.listing-entry` now resolve to
exactly ONE x each across all 35 listings in all twelve categories (0px spread, both,
confirmed by direct measurement before writing the check).

**Widened check.** `S19` samples every `.listing` on the page directly rather than grouping
by category first. Falsified both directions live:
- Per-category revert (`.listings{grid-template-columns:minmax(0,1fr) max-content
  max-content !important}`, alignment WITHIN each category left intact): `"varies by 60.9px
  across the PAGE's 35 entries (1009.4px vs 1070.3px, e.g. \"Argilla\" vs \"Aider\")"` — the
  exact spread the verdict measured.
- Whole-subgrid collapse (`.listing{display:block}`): `"varies by 883.6px"` — confirms the
  check still catches the older, cruder defect too.
- Opposite (trailing columns forced to 900px on `.tools-index`, the tracks' new home):
  `"pricing's own column is 67.3px wide ... narrower than the 200px floor"`.

---

## What remains (accurate, not exhaustive)

- **S18's wiki-entry clause is red.** 32.9% and 40.2% against a 60% floor, on the two
  sampled entries. Second lever not attempted — see the R13 section above for the reasoning.
- **S20's document sweep samples 7 of 14 routes** (`/`, `/impossible-routine`, a wiki entry,
  `/catalog`, `/tools`, `/data`, `/blog`). `/colophon`, `/learn`, `/tutorials`, the `/wiki`
  index, individual post/tool/entry pages beyond the one sampled each were not swept by the
  automated check this round — spot-checked visually (screenshots, both viewports, both
  themes) on every route this round actually touched, not on the full 14.
- **Dark theme is not exercised by any check in this harness via Playwright's
  `colorScheme`**, for any invariant, old or new — every existing check (S1-S21) resolves
  `--accent`/colours live and so is theme-correct BY CONSTRUCTION, but none of them actually
  RUNS under `colorScheme: 'dark'`. This is a structural gap in the harness predating this
  round; I verified dark theme by direct screenshot inspection on every route I touched
  (all six items, 1440x900 and 390x844) rather than by extending the harness itself, which
  would be a separate, larger piece of work.
- **`.badge[data-tone="early"]` and `.notice[data-tone="warn"]`** were fixed on the strength
  of the source sweep alone — currently dormant, unreachable by today's live data on any of
  the 14 routes, so no DOM check exercises them (matching S17's own precedent for
  currently-unreachable badge-clause branches, which use a synthetic render-function
  fixture instead). Not given a synthetic fixture this round; flagged for a future round if
  a synthetic-fixture pattern is wanted for R9 the way S17 already has one for R8.

## Files changed

- `app/globals.css` — `.change-annotation`, `.span-rule`, `.badge` (theme/early tones),
  `.notice` (warn tone), `.src`, `--measure-title` token, `.rail-posts .rail-item`,
  `.catalog-preamble[open] > summary`, the wiki-entry two-column grid (`.entry-side`,
  `article:has(> .prose):has(.entry-facts)` selector family), `.listings`/`.tools-index`.
- `lib/render/entry.mjs` — `.entry-side` wrapper around FACTS/TIMELINE/RAILS.
- `app/tools/page.tsx` — `className="tools-index"` on the listings wrapper div.
- `tools/ui-invariants.mjs` — S5, S15, S17, S18, S19, S20 widened; all re-falsified in both
  directions live (not assumed from prior rounds) except where noted otherwise inline.
- `loops/ui-loop/RULES.md` — iter-09 addenda under R7, R8, R9, R10 (x2), R13 (x2).
