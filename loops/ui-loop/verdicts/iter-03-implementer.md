# Iteration 3 — implementer report

Finding implemented: the mirror-validated blind forced-choice split in `state.md`,
"DIAGNOSTIC — FINAL RESULT (three runs)". Row rules restored on `/catalog` and the home
changed feed; left removed on `/wiki`, `/data`, `/tools`; badge treatment untouched. R8
amended from a blanket ban to a surface-conditioned test, paired with a rewritten `S2` in
`tools/ui-invariants.mjs`.

## Premise check

The premise held on direct inspection, no correction needed. Screenshots taken at
1440x900, both themes, before writing any CSS:

- `/catalog`: 396 rows, 7 columns (model, provider, in/mtok, out/mtok, context, status,
  read date) — a value several columns wide of its row label with no rule is exactly the
  cross-row drift the diagnostic named.
- `/` (home): the changed feed's entries are genuinely ragged — a plain one-line change,
  a change with a wrapped `source` link, and a change carrying a full `change-annotation`
  paragraph ("What it means…") all sit in the same list with no separator, so a wrapped
  tail is ambiguous with the start of the next entry.
- `/wiki`: confirmed still reads as intended — near-uniform single-line rows where the
  name is itself the link; RETIRED/DEAD badges pop cleanly against unboxed ACTIVE text.

One judgment call, not a decline: "restore a per-row rule on `/catalog`'s table rows"
is scoped to the **desktop** table layout only. Below the 33.999rem breakpoint `/catalog`
is already a different surface — one stacked record card per row (R12) — and R8's own
iter-02-round-3 post-mortem already established that a rule between those cards is wrong
(padding rhythm + the record's bold name heading is the anchor there instead). Restoring
the rule there would silently re-introduce a defect this loop already fixed once. The
restored rule is therefore desktop-only, with an explicit `border-bottom: none` in the
mobile media block so the cascade doesn't leak it in — not left to chance.

## 1. CSS — `app/globals.css`

**`/catalog` (desktop only).** Scoped by id (`#catalog-table`), not the shared
`.data-table` class, so `/catalog/deprecations` and `/catalog/changed` — smaller tables
the diagnostic never tested — keep the iter-01 ruleless treatment, following the same
id-scoping precedent iter-02 used for the mobile reflow (`#catalog-table-wrap`).

```css
#catalog-table tbody tr {
  border-bottom: 1px solid var(--rule);
}
```

Guarded explicitly inside the existing `@media (max-width: 33.999rem)` block:

```css
#catalog-table tbody tr {
  display: block;
  padding: 1.1rem 0;
  border-bottom: none;   /* desktop rule turned off, not inherited */
}
```

No outer box reintroduced — `.table-wrap` is untouched, still `background: var(--panel)`
with no border, per the task's explicit instruction not to conflate this with the
`.table-wrap` removal.

**Home changed feed.** Scoped to `.rail-changes > .rail-item` — a direct-child selector
— so the generic `.rail-item` (blog's post index, corrections, entry timelines, none of
them ragged and none of them tested by the comparison) is unaffected:

```css
.rail-changes > .rail-item {
  border-bottom: 1px solid var(--rule);
}
```

**Badges** — not touched, per instruction. `.badge:not([data-tone])` still unboxed,
`.badge[data-tone="ended"]` still boxed. Confirmed unchanged by inspection and by S2's
own badge assertions (below), which still pass.

## 2. `loops/ui-loop/RULES.md` — R8 amended

R8 rewritten from an unconditioned ban ("A list surface's sibling rows shall not carry a
rule between every pair") to a surface-conditioned test: rules are **required** where a
reader must track a value across a wide row or where entry heights are ragged, and
**forbidden** where nearly every row is itself a link and rows are near-uniform height.
The stated test a future implementer applies: *does a value drift from the row it
belongs to, or does an entry's end become ambiguous, without the rule?* The badge clause
is unchanged. The original text is preserved, not deleted — the rewrite extends it and
cites the same origin (`iter-00-a` I3 / `iter-00-b` I2). A new `> *Post-mortem,
preserved.*` block appended below it (matching the pattern R11 already uses for its own
amendments) records why the blanket form was wrong: `chrome_restraint` is one global
judge-rubric category scoring a property whose correct value is surface-dependent, so a
change that helped three surfaces and hurt two still read as net progress in the
aggregate (`5.0 -> 7.5`) — the scale itself can't express the distinction, only a
forced choice per surface could.

## 3. `tools/ui-invariants.mjs` — S2 rewritten

`S2` now runs across all five diagnostic surfaces (`/catalog`, `/`, `/wiki`, `/data`,
`/tools`) at both declared viewports (`[1440,900]`, `[390,844]`), and asserts in both
directions per route:

- `/catalog`: mid-table row border-bottom **required** at desktop width (`innerWidth >=
  544`), **forbidden** at the 390px stacked-record width; header's own boundary rule and
  the badge assertions (toneless unboxed, `ended` boxed) unchanged from before.
- `/`: mid-feed `.rail-changes > .rail-item` border-bottom **required** at both
  viewports (the feed stays ragged-height at 390px too — it doesn't switch structure the
  way `/catalog` does).
- `/wiki`, `/data`, `/tools`: mid-list `.browse-row` border-bottom **forbidden**.

`independent` and `intent` fields rewritten to describe the five-surface, both-directions
shape rather than the old single-route absence-only check.

## Falsifier — both directions, run live, verbatim

All breaks below were performed against the real tree: edited `app/globals.css`,
rebuilt with `npm run build`, ran `node tools/ui-invariants.mjs`, read the actual output,
then reverted and confirmed the restored file is byte-identical to the pre-break version
(diffed against a copy held outside the repo) before rebuilding again.

**(4a) Rule MISSING where required.** Removed `border-bottom` from both `#catalog-table
tbody tr` and `.rail-changes > .rail-item` at once:

```
FAIL    S2  (R8)
        /catalog @1440x900: mid-table row requires a border-bottom rule (RULES.md R8 —
        396 rows x 7 columns needs cross-row tracking) but has none (0px)
```

Restored `#catalog-table tbody tr` alone and re-ran to isolate the home-feed failure
independently:

```
FAIL    S2  (R8)
        / @1440x900: mid-feed changed entry requires a border-bottom rule (RULES.md R8 —
        ragged entry heights need it) but has none (0px)
```

**(4b) Rule PRESENT where forbidden.** With both restorations back in place, added
`border-bottom: 1px solid var(--rule)` to `.browse-row`:

```
FAIL    S2  (R8)
        /wiki @1440x900: .browse-row must not carry a border-bottom rule (RULES.md R8 —
        a link index's rows are near-uniform, the rule would degrade the exception
        signal) but has 1px
```

**(4c) Extra sub-case — desktop rule leaking into the 390px stacked-record layout,**
the exact shape iter-02-round-3 already found and fixed once. Removed the explicit
`border-bottom: none` override inside the mobile media block:

```
FAIL    S2  (R8)
        /catalog @390x844: at 390px: the stacked-record layout must not carry a per-row
        rule (RULES.md R8 / R12 — padding and the record's own name heading are the
        anchor there) but has one (1px)
```

(The doubled "@390x844 ... at 390px:" is the harness's own route/viewport prefix plus
the check's inline restatement — cosmetic, same class of thing already noted on `S6`'s
falsifier entry, harmless.)

All four breaks restored in sequence; `app/globals.css` diffed byte-identical to the
pre-break file before the final rebuild. `viewports: [[1440, 900], [390, 844]]` declared
on `S2`, unchanged shape from before (already present, still required and honored).

## Gate results (final, on the restored tree)

**`npm run build`** — log read in full. `prebuild` completed (495 entries, 396 catalog
rows, etc., all pre-existing counts unaffected), Next.js build compiled successfully, all
620 pages generated and exported, no errors.

**`node scripts/verify-design.mjs`** — `verify-design: 45 check(s), 0 failure(s)`. Log
read in full, not just the summary line — axe clean in both themes on `/`, `/catalog`,
`/tools`, `/wiki/concept/ai-winter` (0 violations each); no horizontal scroll at 320px on
any sampled route; first-load JS 109.6 KB (`/`) / 122.9 KB (`/catalog`) against a 150 KB
budget; keyboard traversal and focus-indicator checks unchanged and passing; above-fold
check unchanged (`/` shows changed-feed lines at both 1440x900 and 390x844).

**`node tools/ui-invariants.mjs`** — `PASS 6 invariant(s) hold`:

```
ok  S1  (R7)
ok  S2  (R8)   — rewritten this iteration, all five surfaces, both directions falsified
ok  S6  (R9)
ok  S5  (R10)
ok  S7  (R11)
ok  S8  (R12)
```

## Visual confirmation

Screenshots taken at 1440x900, both themes (light/dark), of `/catalog`, `/`, and `/wiki`
after the fix, to confirm the restored rules read correctly and the untouched surfaces
are in fact untouched:

- `/catalog`: clean 1px hairlines separate all 396 rows in both themes; no outer box
  around the table; ACTIVE badges stay unboxed.
- `/` (home): the rule now cleanly separates entries of different heights — a
  one-line change, a change with a wrapped `source` link, and a change carrying a full
  annotation paragraph — in both themes.
- `/wiki`: unchanged from before — still ruleless, RETIRED/DEAD badges still the only
  boxed marks on the page.

## Declined / not attempted

Nothing declined. No content, `data/`, `public/`, or evidence-rig files touched. Two
throwaway Playwright scripts were used for visual confirmation (screenshot capture only,
no assertions) and deleted before finishing; a temporary CSS backup made outside the
repo for falsifier diffing was also deleted.

## Files changed

- `app/globals.css` — `.data-table th/td` comment trimmed; new `#catalog-table tbody tr`
  rule (desktop) with explicit `border-bottom: none` override in the 390px stacked-record
  media block; new `.rail-changes > .rail-item` rule; `.rail-item`'s existing S2 comment
  extended to note it still applies to the generic (non-changed-feed) rail.
- `loops/ui-loop/RULES.md` — R8 rewritten as a surface-conditioned test; post-mortem
  block appended (original text preserved, not deleted).
- `tools/ui-invariants.mjs` — `S2` rewritten: five routes (`/catalog`, `/`, `/wiki`,
  `/data`, `/tools`), both viewports, asserting presence where required and absence
  where forbidden; `falsifier` extended with the iter-03 both-direction breaks (verbatim
  above) alongside the three preserved prior entries.
