# iter-08 — implementer report

Five items (the queue's own opening line says "Four items, sized to the gate," then lists
five — I35, I36, I31, I38, I23; see "Queue specifics found wrong" below). All five worked;
four landed in full, one (I23) landed its first clause and declined its second with cause.
Final gate: `npm run build` clean, `node scripts/verify-design.mjs` 45/45, `node
tools/ui-invariants.mjs` 19/19 (17 pre-existing + S20, S21 new this round; S1, S5, S15, S17,
S18 rewritten or extended this round, all re-falsified).

---

## Queue specifics found wrong

Per the loop's own standing lesson ("verify each item's checkable specifics against source
before building on it"), two things in `iter-08-queue.md` itself did not match its own body:

1. **"Four items, sized to the gate"** (the queue's opening line) — the queue lists FIVE
   items (I35, I36, I31, I38, I23). Not itemised anywhere as a correction in a prior
   verdict; just a stale count, most likely left over from an earlier draft. Harmless
   (I worked all five regardless) but recorded because the loop's own protocol treats an
   uncorrected miscount as exactly the class of "checkable specific" this round is about.

2. **The "Scope" line names only `app/globals.css`, `app/layout.tsx`, and the `/blog`,
   `/catalog`, `/tools` templates** — but I31 explicitly targets `app/page.tsx` (the home
   template) and its `feature`/`data-feature` markup in `lib/render/home.mjs`, neither of
   which the Scope line covers. I31 is not new or ambiguous: it has been a held, real,
   impact-4 item since iter-04, re-verified every round since, and IMPLEMENT.md's own
   contract grants "the JSX structure of your assigned page template" per-item, not per a
   fixed iteration-wide list. Treated the itemised queue (the authoritative structure per
   IMPLEMENT.md: id/target/problem/invariant/prescription) as controlling over the
   preamble's Scope line, worked I31 against `app/page.tsx` and `lib/render/home.mjs`, and
   record the mismatch here rather than silently reinterpreting either document.

3. **A third, more consequential one, found while working I36**: `app/globals.css`'s own
   I11 comment (iter-07) read *"the four facts a reader arrives to compare on /tools (a
   listing's pricing/licence prose, its verification date and its wiki entry link)"* — a
   fourth field, "licence," that does not exist anywhere in `lib/render/tools.mjs` or
   `lib/listings.mjs`. Traced its origin: `iter-07-implementer.md`'s own "Declined with
   cause" section records *"I11's 'four fields' framing — read as three real DOM fields
   plus one concept (licence) embedded in prose inside the pricing field."* That is a
   charitable reinterpretation of a wrong judge claim, not a correction of it — the
   reinterpretation then got written into the shipped CSS comment as if it were fact, where
   it has sat for a full iteration. Corrected the comment this round (see I36 below) to say
   plainly that the surface has three fields, not four, and that "licence" does not appear
   on it — matching this round's own instruction: *"Correct anything you find wrong ... it
   does not mean true."*

---

## I35 — `/blog`'s `.rail-posts` 652px overhang (RULES.md R10)

**Problem verified, precisely.** Measured live on the pre-fix build: `.rail-posts`'s own
box spanned x=144.0 to 1296.0 (1152px, the full shell), while every `.rail-item` row's own
*grid content* — `--rail-col` (100px) + gap (16px) + the `--measure-list`-capped title
track (384px) — resolved to exactly 500px, ending at x=644.0. A 652px overhang, matching
the verdict's own numbers exactly. Confirmed `/tutorials` and `/learn` do NOT share this
shape (see RULES.md R10's iter-08 addendum for why) — the prescription's own "check /learn
and /tutorials too" was worked and came back clean, not skipped.

**What changed.** `.rail-posts { width: fit-content; max-width: 100%; }` — the identical
mechanism `.browse` already uses (R7's iter-05 addendum), landing on the same 500px every
row's own track resolves to, since `--measure-list`'s max is a fixed length the grid
maximises to regardless of the actual title text's length. `tools/ui-invariants.mjs` S5
gained a `/blog` clause and its route list gained `/blog`.

**A real instrument bug, found by falsifying my own new check — recorded because the shape
recurs.** The FIRST attempt at the check read `li.getBoundingClientRect().width` (the row's
outer box) and did NOT fire under `--only S5 --break ".rail-posts{width:100% !important}"`
— 0 of 1. `.rail-item` is a block-level li whose outer box fills whatever width
`.rail-posts` happens to be, so forcing `.rail-posts` back to 100% pulled every row's outer
box back to 1152px right alongside it: 0 diff, no violation detected, even though the
653px-class defect was fully live on the page. This is `S1`'s own historical mistake
(RULES.md R7's preserved post-mortem: "a grid item is blockified and stretches to fill its
track by default... a box-to-box gap is vacuous") — reproduced on a brand-new surface by
someone who had *just read that exact post-mortem* an hour earlier while researching this
item. Rewrote the check to read each row's own resolved `grid-template-columns` (summed
with its gap) instead, independent of the parent's width.

**Falsifier observations, verbatim, both directions (post-rewrite):**
- Forward (rule wider than content): `--only S5 --break ".rail-posts{width:100%
  !important}"` → `"/blog @1440x900: .rail-posts width 1152.0px vs widest row's own grid
  content 500.0px (diff 652.0px)"`.
- Opposite (rule narrower than content — cannot be produced by a simple `max-width` on the
  parent, since children are DOM descendants that shrink to fit rather than overflow it;
  needed a row `min-width` forced past a forced parent width to actually produce overflow):
  `--only S5 --break ".rail-posts{width:300px !important} .rail-item{min-width:500px
  !important}"` → `"/blog @1440x900: .rail-posts width 300.0px vs widest row's own grid
  content 500.0px (diff 200.0px)"`.

`RULES.md` R10 gained an iter-08 addendum recording both the fix and the vacuous-box
falsifier finding.

---

## I36 — R8's badge-clause generalisation, unmet on both surfaces it should govern

**Problem verified on both surfaces, both directions of the claim.** (a) `/catalog`: all
396 Read cells rendered the collection's dominant date unlinked (I8's own iter-07 fix, live
and correct) but at full ink (`rgb(26, 27, 34)`), byte-identical to the numeric columns —
confirmed live. (b) `/tools`: all 35 `.listing-verified` spans render `"verified
2026-08-28"`, and — corrected from the verdict's own framing, see "Queue specifics found
wrong" above — exactly THREE fields exist on this surface (pricing, verified date, wiki
entry), not four; there is no "licence" field to account for. `.listing-verified` measured
at the identical computed colour as `.listing-pricing` (`rgb(90, 95, 107)`, both inherited
from `.listing-line`), confirming the verdict's "byte-identical" claim exactly.

**What changed.**
1. `/catalog`: `.data-table td[data-label="Read"] > time { color: var(--muted); }` — the
   `>` combinator matches only the bare, unlinked `<time>` (the default case); the
   exception stays wrapped in `<a class="src">` and keeps `.data-table a`'s ink+underline.
2. `/tools`: `.listing-pricing` now explicit ink (the field a reader actually compares);
   `.listing-verified` gained a `data-default` attribute, computed per category in
   `lib/render/tools.mjs`'s `categorySection` (mirroring `catalogRowHtml`'s
   `isDefaultFetch`, via a shared `modeOf` moved to `lib/render/common.mjs` and now
   imported by both `catalog.mjs` and `tools.mjs` rather than duplicated); only
   `.listing-verified[data-default="no"]` rises to ink.
3. `tools/ui-invariants.mjs` S17 widened from "does the cell contain an `<a>`" to "is the
   dominant value's computed colour distinguishable from the compared column's computed
   colour" on `/catalog`, AND extended with an entirely new `/tools` clause (real DOM, per
   category, plus a synthetic 10-listing fixture mirroring `/catalog`'s own clause 2, since
   the real page's 35 listings have no natural minority-date listing to exercise the
   exception with either).

**Falsifier observations, verbatim, all four new directions:**
- `/catalog` clause 1b, forward: `--only S17 --break "#catalog-table td[data-label='Read']
  > time{color:var(--ink) !important}"` → `"/catalog: the Read column's dominant value
  \"2026-08-31\" renders at rgb(26, 27, 34), the SAME computed colour as the numeric
  columns (rgb(26, 27, 34)) a reader compares across — link absence alone did not lower its
  visual weight"`.
- `/tools` clause 1, forward: `--only S17 --break ".listing-verified{color:var(--ink)
  !important}"` → `'/tools category "agents": the .listing-verified column\'s dominant
  value "verified 2026-08-28" appears on 2/2 listings (100.0%) and renders at the SAME
  computed colour (rgb(26, 27, 34)) as .listing-pricing'`.
- `/tools` clause 2, opposite (JS-logic, no `--break`; a real source edit + re-run, same
  mechanism `/catalog`'s own clause 2 already uses, since `--break`'s CSS injection cannot
  reach a JS conditional): inverted `renderListingRow`'s `isDefaultVerified` comparison
  (`===` to `!==`) → `"synthetic /tools fixture: 9 of 9 majority-date listings do NOT carry
  data-default=\"yes\" — R8's badge-clause other half (the default stays demoted) is
  unmet"`. Restored; re-ran and confirmed PASS.

`RULES.md` R8 gained an iter-08 addendum stating the widened clause and updated its
"Enforced by" reference to name both `lib/render/catalog.mjs` and `lib/render/tools.mjs`.

---

## I31 — home page's accent-as-decoration (RULES.md R9)

**Problem verified, held correctly by the loop since before this loop's own anchor.**
`.door[data-feature="yes"]` (the "Impossible → Routine" door) and
`.deltas-strip .delta:first-child` (the first of the home strip's two deltas) each carried
`border-top-color: var(--accent)` at rest while every structurally identical sibling
carried the neutral token. Re-verified: nothing else on the page names a "featured" state
anywhere, so the colour was decoding nothing a reader could act on.

**What changed.** Both overrides removed; `.door` and `.delta` revert to their own base
rule's `--rule`/`--rule-strong` unconditionally. **Declined the prescription's optional
second half** — "if 'featured' is a real editorial state worth marking, mark it with a
word... a two-word tag would say what the colour cannot" — because that is new user-facing
copy, and content is read-only to this loop under IMPLEMENT.md's own contract; the
invariant does not require it (removing the colour differentiation satisfies "a sibling...
carries a border colour different from its siblings only where that difference encodes a
state the page names elsewhere" by making the antecedent false, not by proving the
consequent). The `data-feature`/`feature: true` markup itself is left in place, inert —
harmless, and a reversible hook if a real editorial state is ever added later.

`tools/ui-invariants.mjs` gained a new entry, `S20`, rather than extending `S6` as the
prescription suggested: `S6`'s own check machinery (a `SELECTOR` map plus a `captured`
closure comparing one link colour per route, across five routes) has no natural slot for a
per-page, per-sibling-list border-colour comparison — the two checks enforce the same
principle through different mechanisms rather than sharing one. `RULES.md` R9 gained an
iter-08 addendum.

**Falsifier observations, verbatim, three episodes (see `oneSidedBecause` below for why the
registry's usual two-sided shape does not apply cleanly here):**
- `--only S20 --break ".door[data-feature='yes']{border-top-color:var(--accent)
  !important}"` → `"at least one .door carries --accent as its resting border-top colour
  (rgb(74, 59, 212)) — R9 reserves --accent for hover/focus, not rest"`.
- `--only S20 --break ".deltas-strip .delta:first-child{border-top-color:var(--accent)
  !important}"` → `"at least one .deltas-strip .delta carries --accent as its resting
  border-top colour (rgb(74, 59, 212))"`.
- Isolating the uniformity clause from the accent clause, using a non-accent colour so the
  accent check cannot trigger first: `--only S20 --break
  ".door:first-child{border-top-color:red !important}"` → `".door siblings do not share one
  resting border colour: rgb(255, 0, 0) vs rgb(215, 216, 224) — no state on the page names
  which door is different"`.

**Declared `oneSidedBecause` rather than fabricating a second direction.** Both of this
check's clauses are a flat PROHIBITION (never `--accent`) and a UNIFORMITY test (all
siblings equal), neither of which has a meaningful "opposite excess" the way a bounded
RANGE does (S18's ratio can fail from either side because a range has two ends; "never" and
"all the same" do not). The invariant's own text names the one case that WOULD give this a
second direction — "only where that difference encodes a state the page names elsewhere" —
but neither list names any such state today, and fabricating one would mean adding content
this loop may not add. The three breaks above instead prove the check's two clauses fire
independently rather than one riding on the other's detection.

---

## I38 — three checks with content-derived bounds and zero visible headroom

**Problem verified exactly, including the adversarial claims.** `S1`'s worst case on
`/data` is 2 of 3 lines (1 headroom); `S15`'s worst case on `/blog` is 3 of 3, uniformly,
across all four live posts (zero headroom); `S18`'s ratio is 87.7% against a 60% floor,
568.0px of headroom on `.rail-changes`. All three numbers reproduce the verdict's own
figures to one decimal place. Re-verified the adversarial claim too (forcing `/data`'s track
to 350px fires the COLLAPSED branch at both 2 and 3 lines) rather than trusting it.

**What changed — printing, not loosening.** `S1`, `S15` and `S18` now `console.log` their
margin on every PASS (not only their failure message): `S1`/`S15` print the worst-case line
count against the 3-line bound and whether there is any headroom left; `S18` prints the
ratio, the floor, and how many more pixels the taller side could grow before crossing it.
No bound was widened, raised, or lowered anywhere in this item — confirmed by running the
three checks and reading the printed numbers, which match the pre-existing thresholds
exactly. `RULES.md` R7 and R13 each gained a short iter-08 addendum recording the content
assumption each bound rests on and what a future implementer should do if it is exceeded
(a template-specific token for S1/S15; a different `.home-grid` split mechanism for S18 —
never a raised bound in either case).

**Verified output (from a live, non-`--break` run):**
```
S1 headroom: worst case 2 of 3 lines allowed on /data (1 line(s) of headroom)
S15 headroom: worst case 3 of 3 lines allowed on /blog — NO HEADROOM
S18 headroom: .home-side at 87.7% of .rail-changes (floor 60%) — .rail-changes could grow
568.0px more before the floor is crossed
```

**No new falsifier branch was added** — this item does not introduce a new pass/fail
condition, only a diagnostic print on the existing PASS path, so there is nothing new to
break in either direction; the pre-existing falsifiers for S1/S15/S18 (unchanged logic)
were re-run to confirm they still fire correctly (see their own `falsifier` records, each
now carrying an added note on the content assumption the bound rests on).

---

## I23 — `/catalog`'s stacked record below the fold at 390x844 (RULES.md R6/R14, one clause of two)

**Problem verified, both clauses, and the second clause's arithmetic re-derived rather than
trusted.** Pre-fix: first record began at y=724.5 (below the 844px fold). Record height:
measured 209.5px live (verdict's own figure was 215.9px — close enough to be the same
measurement taken at slightly different build states, not a discrepancy). Re-derived
independently that no CSS-only lever gets a 209.5px record under 120px while keeping all
six labelled fields on separate lines: even at the tightest defensible padding/line-height,
six value rows alone cost roughly 120px before counting the name heading or the row's own
separating padding — the 120px bound is only reachable by reducing the LINE COUNT, which
means touching the `attr(data-label)` mechanism I27 gates.

**What changed — clause 1 only.** The four preamble elements (the lede, the fetch line,
the sort note, and the "Machine-readable" links paragraph) are now wrapped in
`<details className="catalog-preamble" open>`, the same disclosure primitive as
`.nav-disclosure` (R14, `layout.tsx`) and `/tools`' own `.listings-az`: `open` ships
unconditionally in the server-rendered markup (R4's safe default), and a page-scoped
inline script (mirroring `NAV_DISCLOSURE_SCRIPT`'s own shape exactly) sets the default
OPEN/CLOSED state to match the viewport at load and again only when it crosses the same
33.999rem breakpoint R12's own stacked-record layout uses. **Measured after the fix:**
first record now sits at top=450.9px, bottom=660.4px — fully inside the 844px viewport,
with the disclosure defaulting closed at 390px and open at 1440px, confirmed live both
ways.

**Declined clause 2 (record height ≤ 120px) with cause, per the item's own stated
fallback.** I27 — "whether generated `attr(data-label)` labels are announced by assistive
technology" — is still open and unresolved; the item's own prescription names exactly this
gate: *"resolve I27 before removing any of them, or remove none and take the height out of
the preamble alone."* Took the second branch. I considered, and rejected, inventing a THIRD
option not authorised by the prescription (regrouping the record's fields into a denser
multi-column layout without removing any `data-label`) — it is not proven safe across 396
real records of varying content length without exactly the kind of un-budgeted visual
regression risk this loop's own postmortems warn about (I33's centring-relocated-the-defect
episode), and the prescription's own text frames preamble-only as the deliberate, scope-
limited fallback rather than an invitation to improvise a fourth option. **This clause
remains open**; I23 should stay live in the queue, scoped to the remaining 120px bound,
until I27 resolves.

**Falsifier observations, verbatim, both directions:**
- Forward (the original defect; JSX/template change, so a real revert + rebuild, matching
  this registry's established precedent for structural changes — S14, S18): reverted
  `app/catalog/page.tsx`'s `<details>` wrapper to flat markup, rebuilt →
  `"/catalog @390x844: missing .catalog-preamble or #catalog-table tbody tr on /catalog"` —
  the check's own precondition failed rather than its geometry clause, since the check
  queries `.catalog-preamble` first; recorded as-observed rather than as the geometry
  message I had expected before running it. Restored, rebuilt, re-confirmed PASS.
- Opposite (the mirror excess S14 already established a precedent for — a check bounding
  only "too far down" passes a record pushed too far up just as easily), CSS-only, no
  rebuild: `--only S21 --break "#catalog-table tbody tr:first-child{margin-top:-9999px
  !important}"` → `"/catalog @390x844: first record's top edge (-9548.1px) to bottom edge
  (-9338.6px) is not fully within the first viewport (0-844px) — top is negative"`.

`tools/ui-invariants.mjs` gained a new entry, `S21`, scoped explicitly to clause 1 only
(its own `intent` states plainly that it does not close clause 2, and why).

---

## Visual review (1440x900 and 390x844, both themes, every page changed)

Screenshotted `/`, `/blog`, `/catalog`, `/tools` at both viewports and both themes (16
full-page captures, plus targeted crops of `.doors`, a `/tools` category, and `/catalog`'s
Read column for close colour inspection) and looked at all of them. Confirmed by eye,
matching the measured numbers above:
- `/blog`: the rule under "Sorted by..." now stops where the post list's own content does,
  not at the page edge; all four titles wrap to three lines, both themes.
- `/tools`: pricing prose reads at full ink, "verified <date>" reads visibly lighter/muted,
  the wiki-entry link stays accent — at both 1440 and 390 (fields stack at 390 but keep the
  same colour relationship).
- `/catalog`: READ column now visibly matches STATUS's own muted default weight rather than
  the black IN/OUT/CONTEXT numerals, both themes. At 390px the "About this table" disclosure
  is visibly collapsed by default and the first record ("Anthropic Claude Haiku Latest")
  begins almost immediately below the filters.
- `/` (home): every `.door` border and both `.delta` borders read as one uniform light-grey
  (light) / dark-grey (dark) family; no accent hairline anywhere at rest, either theme.

No visual regressions found on any of the four surfaces, at either viewport, in either
theme.

---

## Files changed

- `tools/ui-invariants.mjs` — S1, S15 (headroom printing, I38); S5 (rewritten check +
  `/blog` clause, I35); S17 (widened to computed colour + new `/tools` clause, I36); S18
  (headroom printing, I38); two new entries, S20 (I31) and S21 (I23) — 19 invariants
  registered, all falsifier-verified in both directions (or `oneSidedBecause`-argued, S20).
- `loops/ui-loop/RULES.md` — R7 iter-08 addendum (I38); R8 iter-08 addendum (I36); R9
  iter-08 addendum (I31); R10 iter-08 addendum (I35); R13 iter-08 addendum (I38).
- `app/globals.css` — `.rail-posts` `width: fit-content` (I35); `.data-table td[data-label=
  "Read"] > time` muted, `.listing-pricing` ink, `.listing-verified[data-default="no"]` ink,
  and the I11 comment's "licence" fabrication corrected (I36); `.door[data-feature="yes"]`
  and `.deltas-strip .delta:first-child` accent overrides removed (I31); `.catalog-preamble`
  disclosure styling (I23).
- `lib/render/common.mjs` — `modeOf` added and exported (shared by catalog.mjs and
  tools.mjs, I36).
- `lib/render/catalog.mjs` — imports `modeOf` from common.mjs instead of a local duplicate
  (I36); no behavioural change.
- `lib/render/tools.mjs` — `renderListingRow` takes `opts.defaultVerified`, computes
  `data-default`; `categorySection` computes and passes it per category, now exported (I36).
- `app/page.tsx` — no change (I31 was CSS-only; `data-feature` markup left in place, inert).
- `app/catalog/page.tsx` — the four preamble elements wrapped in `<details
  className="catalog-preamble" open>` with a page-scoped disclosure script (I23).

No changes to `content/`, `data/`, `public/`, `scripts/verify-design.mjs`'s bounds, or
`tools/ui-evidence.mjs`. No user-facing copy edited anywhere, except the functional
`<summary>` label "About this table" — UI chrome analogous to the existing "menu" label on
`.nav-toggle` (R14), not editorial content.

## Declined with cause

- **I23's record-height clause (120px bound)** — declined, per the item's own stated
  fallback; blocked on I27 (unresolved, unmeasured AT question about `attr(data-label)`).
  See the I23 section above for the full reasoning. **I23 should stay open** in the queue,
  narrowed to this one clause.
- **I31's "mark it with a word" optional half** — declined; new user-facing copy, out of
  this loop's read-only-content charter, and not required by the invariant as satisfied
  (see I31 section above).

## Measured cases for IMPLEMENT.md's "declined and wrong-quantity" log

- **A vacuous falsifier, caught by falsifying my own new check (I35's S5 `/blog` clause).**
  First attempt measured a grid item's outer `getBoundingClientRect()` and reported 0 of 1
  firing under a real, visible 652px-overhang break — `S1`'s own historically-documented
  mistake (RULES.md R7's post-mortem), reproduced on a new surface immediately after reading
  that exact post-mortem. Not a wrong quantity in the fix; a wrong quantity in the CHECK.
  Rewritten to read the row's own resolved grid tracks instead of its outer box; both
  directions re-verified firing correctly afterward. Recorded in full in RULES.md R10's
  iter-08 addendum and in `S5`'s own falsifier text.
- **A message documented before it was run, then corrected against the real output (I23's
  S21).** Drafted the forward-direction falsifier's `observed` text assuming it would report
  the geometry-overflow message; the actual reverted-markup break instead failed the check's
  precondition ("missing .catalog-preamble..."), since the check's first query target no
  longer existed. Corrected the recorded text to match the real run rather than leaving the
  invented message in place.

## Final gate

- `npm run build` — clean, no errors, no new warnings.
- `node scripts/verify-design.mjs` — **45/45**, unchanged from the anchor (includes axe on
  both themes for `/`, `/wiki/concept/ai-winter`, `/catalog`, `/tools`; reflow at 320px;
  keyboard traversal; focus indicators; above-the-fold).
- `node tools/ui-invariants.mjs` — **19/19** (17 pre-existing, re-verified where touched;
  S20 and S21 new).
- Throwaway falsification/screenshot scripts deleted; no `_scratch_*` files or
  `TEMP FALSIFIER` markers remain in the tree (confirmed by grep).

Gate is genuinely green, not papered over: I23's second clause is real, open, unclosed work,
named as such above and left out of the invariant registry rather than asserted falsely.
