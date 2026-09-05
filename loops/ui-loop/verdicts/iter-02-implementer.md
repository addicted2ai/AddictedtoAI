# Iteration 2 — implementer report

Surface: `/catalog`. Items: I15 (S7 regression, R11) and I1 (390px unusable, new R12).

## Summary

Both items landed. `tools/ui-invariants.mjs` now registers 6 invariants (was 5), all
passing honestly, including S7 (previously the intentional red) and the new S8. All
three gates are green: `npm run build`, `node scripts/verify-design.mjs`,
`node tools/ui-invariants.mjs`.

## I15 — /catalog column headers cover the rows they label

**Premise re-verified, matched the queue's findings exactly.** Measured live with a
throwaway Playwright probe (deleted before finishing) against the pre-fix tree:
`.table-wrap` computed `overflow-y: auto` (the CSS coercion) but `clientHeight ===
scrollHeight === 12435` — it never actually scrolled vertically, so `position: sticky`
on the thead had no scrollport to stick within, in every variant including the original
pre-S7 `top: 0`. This matched the queue's premise findings 1–3 exactly; I did not
re-derive them from CSS reading alone, I re-measured them.

**Fix.** `.table-wrap` gets `max-height: calc(100vh - var(--header-h)); overflow-y:
auto`, turning it into a genuine scrollport. `.data-table thead th`'s `top` reverts from
`var(--header-h)` to `top: 0`, which is now correct because the thead sticks to the top
of its own (now real) scrolling box, not the page — no collision with `.site-header`
because they were never in the same scroll context to begin with. This is exactly the
shape the queue's finding 4 described as measured-working; I re-measured it myself
rather than taking it on faith, and it held: thead pinned at **416.3px** at rest and
after scrolling to row 50, at 1440×900, `hitRows: []` throughout.

**Files:** `app/globals.css` (`.table-wrap`, `.data-table thead th`), `app/layout.tsx`
(comment only — `--header-h` now sizes the scrollport's height budget, not a thead
offset; the runtime measurement script itself is unchanged and still needed).

**Interaction with I1.** At 390px the table drops out of table layout entirely (below),
so there is no thead left for R11 to bound. Rather than let this pass by accident on a
missing DOM node, S7 now explicitly asserts `getComputedStyle(thead).display === 'none'`
at 390px as its third clause — a query that finds no thead is a **failure** ("no thead
element in the DOM at 390px — it must still exist and be computed display:none, not
removed"), only a computed `display: none` on an existing thead counts as the
deliberate-absence pass.

**expected_delta:** evidence screenshots of `/catalog` at scroll 0 (1440 and 390, both
themes) show the thead sitting cleanly above row 0 with no overlap — this was already
true of the pre-I15-fix rendering (D5: scroll-0 captures can't see the regression at
all). What the evidence set cannot show at all is clause 2 (the corridor while reading,
scrolled to a deep row) — that remains DOM-invariant-only territory (S7), matching D5's
standing note. If the orchestrator wants this visually confirmable, a scrolled capture
of `/catalog` at row ~50 would newly show the thead pinned near the top instead of
absent, which the current evidence rig does not produce.

## I1 — /catalog unusable at 390px

**Fix.** Below `33.999rem` (the codebase's existing narrow-breakpoint value, matching
`.facts`'s own mobile rule), `#catalog-table` drops out of table layout into one record
per row: the model name (`<th scope="row">`, unchanged markup) as the row heading,
followed by a label/value line per remaining column (provider, in/mtok, out/mtok,
context, status, read date). The thead is `display: none` at this width — asserted
deliberately by S7's new clause 3, not left to pass by accident.

Labels are generated content, `content: attr(data-label)`, reading a `data-label`
attribute I added to each `<td>` in `lib/render/catalog.mjs`'s `catalogRowHtml` —
sourced from the same `COLUMNS` array the desktop thead already renders from (`label =
(key) => ({ 'data-label': COLUMNS.find(c => c.key === key).label })`), so the label text
is not new copy and cannot drift from the visible desktop headers. `.table-wrap`'s I15
vertical scrollport is turned off at this width via a per-table id
(`#catalog-table-wrap`, added because the shared `.table-wrap` class is also used by
`/catalog/deprecations` and `/catalog/changed`, which I did not touch) — a nested
scrolling box around a stacked record list would read worse than normal page scroll,
and there is no sticky header left inside it to protect.

**Files:** `app/globals.css` (new `@media (max-width: 33.999rem)` block scoped to
`#catalog-table` / `#catalog-table-wrap`), `lib/render/catalog.mjs`
(`data-label` attributes on `catalogRowHtml`'s cells).

**Scope note on `lib/render/catalog.mjs`.** This file is not literally under `app/`, but
it is the templating logic that produces `/catalog`'s table markup — `app/catalog/page.tsx`
only calls `dangerouslySetInnerHTML` on its output. I treated it as "the `/catalog` page
template" per the queue's stated scope line, since satisfying I1's invariant without any
markup change is not achievable with CSS alone (a pure-CSS alternative, hardcoding label
strings via `:nth-of-type` selectors instead of `data-label`, was considered and
rejected: it duplicates copy that already lives in `COLUMNS`, with no mechanism to keep
the two in sync). No user-facing string was added, changed, or invented — the labels are
read from the exact same source the desktop thead uses.

**Deliberately not touched:** `/catalog/deprecations` reuses this renderer (same
`data-label` attributes now present in its HTML) and could take the identical mobile CSS
cheaply — I did not extend the `@media` block to it because the queue's scope line names
`/catalog` and defers the grid/track family (I16–I19) to iteration 3. `/catalog/changed`
uses a different, unrelated table shape (`renderChangedTable`) and was not touched at
all.

**A real gap, stated plainly rather than glossed over: CSS-generated content
(`content: attr(data-label)`) is not read reliably by every assistive technology.**
Chromium/Firefox with common screen readers generally expose `::before` content, but
support is inconsistent (notably some VoiceOver configurations). `axe-core` does not
flag this pattern — it is not a rule axe checks — so R1 stayed green through this change,
but a green axe run is not proof this is fully accessible for every AT combination. I
did not find a way to do better without either (a) restructuring the table into
non-table markup with explicit ARIA roles (a larger change I judged out of proportion to
this iteration, and arguably content-authored-structure territory beyond a data
attribute), or (b) duplicating the label text as visible on-page text per cell (which
would look wrong on a values-only compact list). Flagging this rather than claiming a
clean bill of health.

**expected_delta:** `/catalog` evidence at 390×844 (both themes) should newly show, per
row: the model name as a heading, then label:value lines for provider / in-mtok /
out-mtok / context / status / read-date, with no horizontal scrollbar and no cut-off
numeric column. Before: thead 1112px / tr 1112px inside a 390px page (D1's shape,
verified reproducible before this fix — see falsifier below). After: `document
.documentElement.scrollWidth === clientWidth === 390` and every value's
`getBoundingClientRect()` sits fully inside `[0, 390]`.

## Falsifier records (verbatim from `tools/ui-invariants.mjs`)

**S7** (`R11`):
> FOUR breaks, each observed separately on 2026-08-31. (1) iter-01: `top: 0` (thead
> occluded by the site header — pre-S7). (2) iter-01: the shipped `top:
> var(--header-h)` (thead displaced onto rows 0-1 at 1440, rows 3-4 at 390, at scroll
> 0). (3) iter-02: reverted `.table-wrap` to `overflow-x: auto` alone (no
> `max-height`/`overflow-y`), which restores clientHeight === scrollHeight, so the
> corrected `top: 0` becomes inert again exactly like break (1) — the box never
> scrolls, so `position: sticky` has nothing to stick within. (4) iter-02: commented
> out `#catalog-table thead { display: none }` inside the 390px media query, leaving
> the thead rendered with no scrollport at that width.
>
> Observed: (1)/(2) preserved from iter-01: clause 1 failed "at rest: table head
> (462.3-491.1px) is displaced onto data row 0 (445.1-476.9px)"; with plain `top: 0`
> and no scrollport, clause 2 failed "column labels are not visible while row 50 is on
> screen (thead top -1161.7px)". (3) iter-02, with the max-height/overflow-y removed:
> clause 2 failed "while reading: column labels are not visible while row 50 is on
> screen (thead top -1161.7px)" — the same number iter-01 observed with `top: 0`
> alone, confirming the scrollport, not the `top` value, is what makes stickiness
> real. (4) iter-02, with the mobile `display: none` removed: clause 3 failed "at
> 390px: thead is still rendered (display: table-header-group) with no scrollport to
> keep it pinned — R11 corridor is violated rather than deliberately retired at this
> width". All four restored; rebuilt tree passes all three clauses.

Breaks (1)/(2) are the record inherited from iteration 1 (S7 already existed and was
already falsified once). Breaks (3) and (4) are new for iteration 2 — I performed both,
rebuilt, read the actual failure text, then restored and rebuilt again, confirming PASS.

**S8** (`R12`, new this iteration):
> TWO breaks. (1) disabled the whole #catalog-table 390px media-query block (changed
> its `@media (max-width: 33.999rem)` to an unmatchable `@media (max-width: -1px)`,
> i.e. desktop table layout kept at 390px — the pre-iter-02 state, with .table-wrap's
> own I15 scrollport still active so it absorbs the horizontal overflow rather than
> the page). (2) the FIRST cut of this check only asserted `width > 0` on each cell,
> which PASSED even in break (1): a table cell keeps a non-zero box at its natural
> width whether or not that box sits inside the visible viewport, so a zero-width
> check is vacuous against exactly D1's shape ('R2 passes and useless') — caught
> unprompted while falsifying, before any deliberate correctness pass.
>
> Observed: (1) with the stronger left/right-vs-viewport check: check failed "at
> 390px: row 5 priceIn cell (left 550.0px, right 680.6px) sits outside the 390px
> viewport — it is rendered but not reachable without scrolling its container sideways
> (this is exactly D1's shape: a non-zero box the reader still cannot reach)". (2)
> confirmed by re-running the ORIGINAL width-only check against the same broken tree:
> it reported PASS — false negative, the exact green-and-wrong class D4/IMPLEMENT.md
> rule 3 warns about. Rewritten to bound each cell to window.innerWidth and to check
> .table-wrap's own scrollWidth vs clientWidth. Restored; rebuilt tree passes both S7
> and S8.

This is worth being explicit about: **the falsifier requirement caught a vacuous check
in my own first draft**, the same failure class D4 records from iteration 1 (S1's
box-vs-glyph mistake). The first S8 draft would have shipped a check that stays green
whether or not the fix actually reflows the table, because a table cell's box has
non-zero width regardless of where it sits relative to the viewport. Rewritten to
compare each cell's `left`/`right` against `window.innerWidth`, plus a direct check of
`.table-wrap`'s own `scrollWidth` vs `clientWidth`.

## Declined / not attempted

Nothing declined outright. One scope judgment call, stated above: editing
`lib/render/catalog.mjs` to add `data-label` attributes (no copy change) rather than
duplicating label strings as CSS literals, and not extending the mobile treatment to
`/catalog/deprecations` (same renderer, would be cheap, out of this iteration's named
scope).

## Gate results (final, on the restored/correct tree)

**`npm run build`** — completed, `out/` written, all routes exported including
`/catalog`, `/catalog/deprecations`, `/catalog/changed`. Log read in full, no errors.

**`node scripts/verify-design.mjs`** — exit 0, 45 checks, 0 failures. Relevant lines:
- `PASS axe light /catalog — 51 rule(s) passed`
- `PASS axe dark /catalog — 51 rule(s) passed`
- `PASS no horizontal scroll at 320px /catalog — scrollWidth 320 vs clientWidth 320`
- `PASS first-load JS within budget /catalog — 122.8 KB gzipped of 150 KB`
- keyboard traversal and focus-indicator checks for `/catalog` unchanged from before
  (150-of-817 focusable-element cap note is pre-existing, D2, not touched this
  iteration).

**`node tools/ui-invariants.mjs`** — exit 0, `PASS 6 invariant(s) hold`:
```
ok  S1  (R7)
ok  S2  (R8)
ok  S6  (R9)
ok  S5  (R10)
ok  S7  (R11)  — the previously-intentional red, now passing honestly
ok  S8  (R12)  — new
```

## Files changed

- `app/globals.css` — `.table-wrap` (max-height/overflow-y), `.data-table thead th`
  (`top: 0`), new `@media (max-width: 33.999rem)` block for `#catalog-table` /
  `#catalog-table-wrap`.
- `app/layout.tsx` — comment update only, describing `--header-h`'s new role sizing the
  scrollport rather than offsetting the thead; `HEADER_HEIGHT_SCRIPT` itself unchanged.
- `lib/render/catalog.mjs` — `data-label` attributes added to `catalogRowHtml`'s cells
  (sourced from the existing `COLUMNS` array); `renderCatalogTable`'s wrap `<div>` gets
  an `id` (`${id}-wrap`) so the mobile CSS can scope to `/catalog` specifically.
- `tools/ui-invariants.mjs` — S7 rewritten (three clauses: 1440 at-rest, 1440
  while-reading, 390 deliberate-absence), S8 added (R12).
- `loops/ui-loop/RULES.md` — R11 disposition amended with an iter-02 addendum; R12
  added.

No changes to `content/`, `data/`, `public/`, `tools/ui-evidence.mjs`, or the bounds
inside `scripts/verify-design.mjs`. Throwaway Playwright probe script used for premise
verification and falsifier testing was deleted before finishing.

---

# Addendum — round 2 (S7 strengthened by the orchestrator)

The coordinator strengthened S7 with a new clause 2b: page scroll pinned to
`scrollHeight - innerHeight`, composed with `.table-wrap`'s own container scroll to
row 50, asserting the thead is still on-screen and clear of the site header. It failed
on the round-1 tree: `thead top -130.7px` at max page scroll (547px at 1440x900).

**The bug it caught, restated precisely.** Round 1 gave `.table-wrap` its own vertical
scrollport so the thead's `position: sticky` had a real container to stick within — that
part was correct and remains correct (clauses 1 and 2 at 1440, clause 3 at 390 all still
hold). What round 1 missed: `.table-wrap`'s own BOX is an ordinary block in page flow.
`/catalog`'s total content is taller than the viewport (this route has a 396-row table;
max page scroll measured 547px), so as the page itself scrolls, `.table-wrap` — sticky
container and all — scrolls up and off with everything else, carrying its
internally-pinned thead along with it. The original I7 defect (thead occluded by the
site header) becomes genuinely reachable here, where the round-1 tree made it
structurally impossible (D6's finding was specific to the OLD tree; it does not carry
over unexamined to a tree whose structure changed).

**Why the check had missed this itself, per the coordinator's diagnosis — worth
restating because it is the same lesson as D6, one level up.** Clause 2's own
scroll procedure was "scroll whichever scrollport actually moves the table" — a
procedure conditional on the artifact's structure. Before round 1, `.table-wrap` didn't
scroll, so the procedure exercised page scroll. After round 1, `.table-wrap` scrolled, so
the SAME procedure silently switched to exercising only container scroll, and stopped
testing page scroll at all. **A check whose own procedure depends on the structure it is
checking can silently stop measuring the thing it was written for the moment that
structure changes.** This generalizes beyond S7: any invariant that picks its own test
procedure conditionally, based on the current tree, should be treated as suspect the
moment the tree it conditions on changes.

## What I tried, verified, and discarded

**Hypothesis offered by the coordinator, tested and found insufficient.** Making
`.table-wrap` itself `position: sticky; top: var(--header-h)` (no other change) does
NOT work. Measured, not assumed: `.table-wrap`'s sticky travel range is bounded by its
own containing block (`<main>`, `overflow: visible`, so no intervening scroll
container). Algebraically that range reduces to the height of the content BEFORE
`.table-wrap` within `<main>` — a quantity that does not depend on `.table-wrap`'s
own height at all, because `<main>` has nothing else after it (`.table-wrap` is its
last substantial child). Since `.table-wrap`'s height was sized to consume nearly the
entire remaining viewport (`calc(100vh - var(--header-h))`), there was no slack left in
`<main>` for the sticky pin to survive any further page scroll — measured at 1440x900:
~370px of the wrap's own natural top position before release, on a page with 547px of
scroll to give. Rebuilt and confirmed against S7's own clause 2b: `thead top -130.7px`
at max scroll — unchanged from the unfixed tree.

**Empirically-confirmed mechanism, since my hand derivation of the release
threshold was itself off by the exact amount of `<main>`'s trailing padding on a first
pass** (worth flagging, in the same spirit as the falsifier discipline: I derived a
formula, it disagreed with measurement by a suspiciously round number, and I trusted the
measurement over my own algebra rather than the reverse). Bisecting against real
`getBoundingClientRect()` values across the full scroll range settled it: `.table-wrap`'s
sticky pin releases almost exactly at the height of the content before it, and gets
no benefit at all from `<main>`'s trailing `padding-block` (3rem) or from
`.site-footer`'s `margin-top` (3rem) — those quantities do not extend the sticky travel
range in this browser's implementation, however the CSS spec's containing-block language
might read on paper.

## The actual fix

Shrink `.table-wrap`'s own height so the corridor above (header) and everything trailing
it (the gap inside `<main>`, the gap between `<main>` and the footer, and the footer's
own rendered height) all fit within the viewport at once — the condition that turns out
to govern whether the pin survives to the very end of the page's own scroll, regardless
of any padding trick. Concretely:

- `#catalog-table-wrap` (scoped by id, not the shared `.table-wrap` class, for the same
  reason as round 1's mobile scoping — `/catalog/deprecations` and `/catalog/changed`
  are untouched): `position: sticky; top: var(--header-h); max-height: calc(100vh -
  var(--header-h) - var(--footer-h))`, active above the 34rem breakpoint (below it,
  round 1's mobile reflow already turns `.table-wrap`'s own scrollport off, so there is
  nothing for this to protect).
- A new `--footer-h` custom property, fallback `13rem` in `:root`, measured precisely at
  runtime by `FOOTER_HEIGHT_SCRIPT` in `app/layout.tsx` — placed after the footer markup
  (same pattern as `HEADER_HEIGHT_SCRIPT`). It does not measure `.site-footer`'s own
  height (that was my first attempt, and it undershot — see falsifier below). It
  measures `document.documentElement.scrollHeight` minus `#catalog-table-wrap`'s own
  rendered bottom edge — the whole real trailing distance, whatever contributes to it,
  plus a 16px safety buffer. This measure is provably invariant to `.table-wrap`'s own
  current height (both terms move together), so it is correct even on first paint
  under the no-JS fallback, before this script has run.

**Files (round 2):** `app/globals.css` (`#catalog-table-wrap` sticky/max-height rule,
`--footer-h` token), `app/layout.tsx` (`FOOTER_HEIGHT_SCRIPT`).

**Verified result at 1440x900**, sampled across the full page scroll range (not just the
two points S7 checks): thead stays clear of the site header throughout, with margin
narrowing smoothly from 370.5px at scroll 0 to 15.5px at max scroll (355px) — a
deliberate, checked safety margin, not a coincidence of rounding. An earlier version of
this fix (footer-h from `.site-footer.offsetHeight` alone, 81px, omitting `<main>`'s
padding and the footer's margin) left only 0.48px of margin against the check's own
0.5px occlusion tolerance — technically passing, too fragile to ship, corrected before
finishing.

## Falsifier records added (S7, round 2 — appended to the existing entry, six breaks
total; see `tools/ui-invariants.mjs` for the verbatim text)

1. `.table-wrap { position: sticky; top: var(--header-h) }` alone, no height change —
   the coordinator's hypothesis, tested and found insufficient. Observed: clause 2b
   failed, `thead top -130.7px` at max scroll — unchanged from the unfixed tree.
2. `--footer-h` measured as `.site-footer.offsetHeight` (81px) instead of the full
   trailing distance (177px) — my own intermediate, incorrect attempt. Observed: clause
   2b failed, `thead top -49.7px` at max scroll — improved but short by exactly the
   omitted `<main>` padding + footer margin (96px).
3. Explicit final falsifier, performed and restored before finishing: set
   `--footer-h: 4rem` (too small) with `FOOTER_HEIGHT_SCRIPT`'s body emptied (fallback
   forced). Observed: clause 2b failed, `thead top -66.7px`. Restored both files;
   rebuilt tree passes all three clauses of S7 with the margin reported above.

## Gate results (final, round 2)

- **`npm run build`** — log read in full, clean, `out/` written.
- **`node scripts/verify-design.mjs`** — exit 0, 45 checks, 0 failures (re-run after
  round 2; axe clean both themes on `/catalog`, no horizontal scroll at 320px, unchanged
  from round 1).
- **`node tools/ui-invariants.mjs`** — exit 0, `PASS 6 invariant(s) hold`, including S7
  with all three clauses (1440 at-rest, 1440 while-reading including the new composite
  clause 2b, 390 deliberate-absence) and S8 (390px reflow), both re-confirmed after the
  round-2 change.

No files left over: all throwaway probe scripts (`__probe*.mjs`) and backup copies
(`*.bak`) created during this round were deleted before finishing.

---

# Round 2 — record written by the ORCHESTRATOR, not the implementer

**Provenance, stated plainly:** the implementer was re-dispatched after the orchestrator
strengthened S7, completed the code and the CSS commentary, and was then terminated by an
unrelated session closure before it could append its own report. The code below is its
work; this write-up is the orchestrator's, reconstructed from the source it left and from
independent re-measurement. It is not the implementer's account and should not be read as
one.

## What it was sent back for

S7 gained clause 2b (composite of both scroll dimensions) and went red on its round-1
tree. Measured at 1440x900: thead top 16.3px at page scroll 400 against a site-header
bottom of 45.8px (occluded), and -130.7px at the 547px maximum (off-screen).

## What it did

1. **Took the orchestrator's hypothesis and killed it with measurement.** It was offered
   `.table-wrap { position: sticky; top: var(--header-h) }` explicitly as a hypothesis to
   verify or discard. It discarded it, with a derivation: sticky travel is bounded by the
   containing block, reducing to `contentBeforeWrap - headerOffset` ≈ 372px against a
   547px page, so the element detaches and lands at the same -130.7px. It further showed
   algebraically that adding trailing padding inside `<main>` cannot help, because the
   padding term cancels out of the governing inequality.
2. **Named the governing inequality:** `viewport >= headerOffset + wrapHeight +
   footerHeight`; at 900/46/854/81 that is `900 >= 981`, false.
3. **Supplied the missing term.** A measured `--footer-h`, mirroring the existing
   `--header-h` pattern (`FOOTER_HEIGHT_SCRIPT` in `layout.tsx`, measuring the real
   trailing distance below the wrap rather than the footer element alone), and
   `#catalog-table-wrap { position: sticky; top: var(--header-h); max-height: calc(100vh -
   var(--header-h) - var(--footer-h)) }` scoped to `min-width: 34rem`.

## Orchestrator's independent verification — not taken on report

- `npm run build`: clean (log read, not exit code — H2).
- `scripts/verify-design.mjs`: 45 checks, 0 failures; axe 51 rules clean in BOTH themes on
  `/catalog`; no horizontal scroll at 320px; payload 123.0 KB of 150 KB.
- `tools/ui-invariants.mjs`: 6 of 6 pass, including S7 with clause 2b.
- Direct geometry, 1440x900, container scrolled to row 50, page at 0 / 178 / 355 (355 is
  the new maximum, down from 547 because the wrap is shorter): labels on-screen and
  unoccluded at every position; worst case `thTop 61.3px` vs `headerBottom 45.8px`.
- Direct geometry, 390x844: `thead` computes `display: none`; row 5's In / Out / Status
  cells carry `$0.75`, `$3.75`, `active`, spanning x 14-376 inside a 390px viewport; page
  does not scroll horizontally.

## Outstanding, carried to the judge and to state.md

- The round-2 work is **unjudged**. It ships into iteration 2's verdict, not around it.
- The evidence set was refreshed AFTER this change; earlier captures in
  `evidence/iter-01/` predate it.
- An instrument gap found by the orchestrator during this round and NOT yet fixed: every
  invariant runs at 1440x900 unless it opts out, so S1/S2/S5/S6 (rules R7-R10) are
  desktop-only and their 390px behaviour is unverified. Filed as an evidence-fix.


---

# Addendum — round 3 (S2 caught at 390px by the strengthened harness)

The coordinator fixed an instrument gap: every invariant in tools/ui-invariants.mjs had
been running only at the harness's 1440x900 default unless it set its own viewport, and
nothing in the output said so. S1, S2, S5, S6 had never actually been verified at 390px.
With a declared `viewports` array now driving the harness (and a refusal for any
invariant that declares none), S2 immediately failed at 390:

  /catalog @390x844: mid-table row still carries a border-bottom (1px row / 0px cell)

## What was wrong

Round 2's mobile stacked-record layout (`app/globals.css`, the
`@media (max-width: 33.999rem)` block for `#catalog-table`) drew
`border-bottom: 1px solid var(--rule)` on `#catalog-table tbody tr`, with a
`:last-child { border-bottom: 0 }` override — a rule between every pair of sibling
records. That is exactly what R8 prohibits, restated in the rule text itself:
"a list surface's sibling rows shall not carry a rule between every pair — separation is
carried by row rhythm and the group container's own boundary mark, drawn once." I wrote
this rule while building the mobile reflow for I1 and did not check it against R8 at the
time — the same defect class R8 was written to catch, landing again in a new context
(the coordinator's own comparison: the same shape as I19, filed against `/tools` in
iteration 1). It was invisible in every gate I ran during rounds 1 and 2 because S2 had
never actually exercised 390px.

## The fix — tried, not declined

I did not take the decline option, because a fix that satisfies R8's own stated
rationale was available without compromising the mobile record's readability. Replaced
the per-row `border-bottom` with padding-only rhythm:

```
#catalog-table tbody tr {
  display: block;
  padding: 1.1rem 0;
}
```

(plus a slightly reduced `padding-top` on `:first-child` so the list doesn't start with
extra air under the filters). Two things carry the separation instead of a drawn line,
matching R8's own text: (1) generous whitespace between records — deliberately more
than the desktop row's own rhythm, since a stacked record is six lines rather than one
and needs more air to read as a discrete block; (2) the record's own bold name heading
(`tbody th`, already `font-weight: 600`) repeats as a fixed visual anchor at the top of
every record, giving the eye a landmark to jump between without a rule. The group's own
boundary mark — `#catalog-table-wrap`'s panel background, established back in iteration
1's S2 — is unchanged and still drawn exactly once, around the whole list, not per row.

I judged this sufficient rather than reaching for R8's stated exception path. The
six-line-block argument the coordinator raised is real, but padding alone at this scale
(1.1rem, roughly 1.5x the desktop row's rhythm) reads as clearly separated in the
rendered output, and R8's own text already names rhythm as an accepted lever — it does
not require rhythm to be weaker on a taller row, only that it not be a drawn rule. I am
not filing a decline or an R8 amendment; if the keeper's own visual review (KP1/KP2, or
a future judge pass) finds the spacing insufficient at 390px, that is a return trip with
a concrete before/after rather than a rule change made on my own say-so without a judge
having seen the rendered result.

**File:** `app/globals.css` (`#catalog-table tbody tr` and `:first-child` inside the
mobile media query; `:last-child` override removed as no longer needed).

## Falsifier (S2, round 3 — appended to the existing entry in
`tools/ui-invariants.mjs`, three runs total)

Reintroduced `border-bottom: 1px solid var(--rule)` on `#catalog-table tbody tr`,
rebuilt, and confirmed: check failed exactly as the coordinator reported —
`/catalog @390x844: mid-table row still carries a border-bottom (1px row / 0px cell)` —
with 1440x900 still passing, confirming this was purely a 390px-layout defect the
pre-fix single-viewport harness could never have surfaced. Restored; rebuilt tree
passes at both declared viewports.

## Gate results (final, round 3)

- **`npm run build`** — log read in full, clean, `out/` written.
- **`node scripts/verify-design.mjs`** — exit 0, 45 checks, 0 failures.
- **`node tools/ui-invariants.mjs`** — exit 0, `PASS 6 invariant(s) hold`, all six now
  printing their declared viewports (`S1`, `S2`, `S5`, `S6` at both 1440x900 and
  390x844; `S7`, `S8` self-managed), S2 green at both.

No files left over: the falsifier's temporary CSS change was made and restored via file
copy, not left in place; no throwaway probe scripts were needed for this round.
