# ui-loop — Judge verdict, iteration 0

**Overall: 7.2 / 10 — Competent.** No anchor exists; every number below is scored from
scratch against the rubric and the evidence in `loops/ui-loop/evidence/current/`.

## Evidence read

All 20 of the `--1440` captures (both themes, all ten labels): `home`, `index-blog`,
`article`, `table-catalog`, `index-wiki`, `wiki-entry`, `index-learn`, `index-tools`,
`prose`, `data`. Plus the `--390` captures for `home`, `table-catalog`, `index-wiki`,
`article`, per the assignment's minimum. `app/globals.css` in full (the token system,
shell/measure math, every template-family class). `data/launch.json` for the payload and
design-verification measurements. `scripts/verify-design.mjs` (the focus-traversal
implementation, `FOCUS_SWEEP_CAP`) to understand what the 45/0 pass line in
`data/launch.json` does and does not certify. `RULES.md` and `CHARTER.md` in full.

I did not re-run `verify-design.mjs` myself. `data/launch.json`'s `design_verification`
entry is dated 2026-08-31 — the same day as the evidence capture — and reads `pass: true,
45 checks, 0 failures`, matching L1's description of the sandboxed exit-1 as a false
signal whose real, outside-sandbox run is green. I read that number, and I read the
script's own source to understand exactly what it measures (see I2 below), rather than
trusting the pass line alone — that is what L2 requires.

## What the artifact gets right

- **Typographic system (8.5).** One real type scale (`--step--1` through `--step-4`),
  a deliberate serif/mono division of labour (serif for prose and titles, mono for every
  record - dates, ids, prices, table cells), `font-variant-numeric: tabular-nums` used
  correctly wherever numbers need to align. The system-stack rationale in the CSS header
  comment (web fonts would blow the 150 KB budget and the network-origin allowlist) is a
  real constraint, not an excuse, and the pairing still reads as a considered choice
  against Vercel's benchmark of "a typeface chosen for the domain."
- **Colour discipline (8.5).** Exactly two accents, both semantic (indigo = follow,
  ember = ended), both themes carry the full token set, and — correctly, per the loop's
  own scope — the `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) }`
  block covers the un-stamped state, not just the `data-theme="dark"` override. Verified
  directly against both `home--dark--1440.png` and `home--light--1440.png`.
- **Chrome restraint (8).** Structure is carried by hairline rules and spacing almost
  everywhere; `.badge` and `.notice` borders are reserved for state (deprecated, ended,
  warn), which is the rubric's stated exception ("every visible divider must earn its
  place"). `home--light--1440.png` and `table-catalog--light--1440.png` show almost no
  boxes doing layout work.
- **Payload discipline (9, hard-measured).** `data/launch.json`'s `js_payload` block: the
  heaviest sampled page (`/catalog`) is 122.3 KB gzipped against the 150 KB bound —
  81.5%, inside the "at or under 85%" band for a 9. Home and the wiki entry are lighter
  still (109.5 KB, 109.1 KB).
- **List and table craft (8).** The 396-row catalog table (`table-catalog--light--1440.png`,
  `table-catalog--dark--1440.png`) uses tabular-nums, right-aligned numeric columns, a
  sticky header, and hover-only row emphasis — closer to Stripe's hairline-divider
  tabular style than to a bordered grid. `index-wiki--light--1440.png` and
  `index-blog--light--1440.png` show the same tight row rhythm on their list surfaces.
  Docked half a point for I3 below (no grouping cue across 396 rows).

## What holds it back

### Information density and family coherence (5.5 / 5.5) — the dominant defect

The single biggest thing wrong with this artifact is not visible on any one page in
isolation; it only shows up by placing the ten `--1440` captures side by side. `home` and
`table-catalog` use the full 1216px shell — `home` via `.home-grid`'s two-column split,
`table-catalog` because a table is naturally wide. Every other template — `wiki-entry`,
`article`, `prose` (colophon), `index-tools`, and to a lesser extent `index-learn` — caps
its content to a narrow single column and puts nothing in the freed width. On
`prose--light--1440.png`, the colophon's content ends at roughly x=760 of a 1440px canvas
and the remaining ~680px is bare `--paper` background for the entire page height.
`wiki-entry--light--1440.png` and `article--light--1440.png` show the identical shape:
long paragraphs and the `.facts` block occupy roughly half the shell, and the bottom
`REFERENCED HERE` / `APPEARS IN` rails don't reach the shell's right edge either.
`index-tools--light--1440.png` is the starkest case — the category jump-list and every
listing block sit in the left ~40% of the viewport for the full page length.

This is precisely the rubric's own definition of what caps family_coherence ("a template
that looks good alone but breaks the family"), and it is also what depresses
information_density, because the rubric asks explicitly whether density is *consistent
between templates* — it is not. A reader on `/wiki/concept/ai-winter` or `/tools` is
getting roughly half the content-per-screen that the same viewport delivers on `/` or
`/catalog`, for no reason connected to the content itself.

I want to be precise about what is *not* the problem here: the narrow prose measure
(`--measure: 38rem`) is good typography — a controlled line length is exactly what the
Vercel/typographic-system benchmark rewards, and I have not marked it down. The defect is
that nothing occupies the width the measure frees up. Benchmark comparison: Vercel's own
docs keep a narrow reading column but pair it with a persistent right-hand table of
contents that occupies the freed width on every article page — the grid rhythm the
benchmark table names ("a grid whose rhythm stays visible across every page of the
property") is visible on every page, not just the two that happen to be wide by content
type. This artifact has the ingredients for that pairing already — `renderEntryPage`
builds `REFERENCED HERE` / `APPEARS IN` rails and every long page has real headings — it
just doesn't place them where the freed width is.

Filed as **I1**, impact 8, `ui-fixable`. Invariant and prescription are in the JSON block;
summarized, promote the existing `.rails` output to a persistent sidebar at `>=60rem`
using the same grid mechanism `.home-grid` already defines, and add an anchor list built
from existing headings on the prose/tools/learn templates. No copy or content changes are
implied.

### Accessibility (7, hard-measured)

`data/launch.json` reports `design_verification: pass true, 45 checks, 0 failures` for
2026-08-31, which is the same day as this evidence pull and consistent with L1 (the
sandboxed `EACCES` exit-1 is not a real failure; the identical command completed clean
outside the sandbox). I did not treat the green line as sufficient on its own — L2 exists
specifically to warn against that. I read `scripts/verify-design.mjs`'s
`checkFocusIndicators` directly: it caps the keyboard-focus sweep at `FOCUS_SWEEP_CAP =
150` stops, and the function's own comment says `/catalog has more focusable elements than
the cap`. The catalog table alone has 817 focusable elements (396 rows × 2 links each,
plus filters and header chrome), so the traversal on that route stops at 150 and reports
"STOPPED AT THE 150-STOP CAP, the rest unswept" — an honestly-labelled but genuinely
partial PASS, the exact shape L2 pre-registered. Under the accessibility scoring mapping,
this means Rule R5 (focus visibility) is *unverified* on a sampled route, which caps the
category at 7 regardless of the clean summary line. This is not evidence that anything
past stop 150 is broken — it is evidence that nobody has checked. Filed as **I2**,
`evidence-fix`, impact 5: raise `FOCUS_SWEEP_CAP` past `/catalog`'s actual count so R5 can
actually close on that route.

### First-read hierarchy (7.5)

Home is genuinely good here — `WHAT CHANGED` dominates by position and the right rail
(`CATALOG`, `DEPRECATED & RETIRED`, `LATEST`) is visually secondary through width alone,
matching the "weight and space, not boxes" benchmark for all three exemplars. The
deduction is systemic, not home-specific: on every template affected by I1, the page
title sits directly above a narrow content column with no equivalent secondary signal
telling the reader what else is on the page (a table of contents, a related-entries
count) — hierarchy is legible within the narrow column but the page as a whole doesn't
signal its own shape the way home does. This resolves via the same fix as I1; no separate
item filed.

### Responsive integrity (8)

No page-level horizontal overflow in any of the four required `--390` captures (`home`,
`table-catalog`, `index-wiki`, `article`); the catalog table's `.table-wrap` correctly
contains its own scroll per `RULES.md R2` and `globals.css`'s explicit comment on that
rule. I did not sample `/tools`, `/learn`, `/data`, or `/colophon` at 390 per this
assignment's required minimum, so responsive_integrity for those specific templates rests
on the CSS's `repeat(auto-fit, minmax(...))` patterns rather than direct observation —
noted, not scored down, since JUDGE.md's evidence table declares screenshots valid for
this property and I read what was in scope.

### Visual distinctiveness (7, capped contributor)

The date-rail / span motif ("Impossible → Routine," the elapsed-time rule between two
dated points) is a real, specific idea, not a generic template default — visible clearly
in `home--light--1440.png`'s bottom section and explained in the `globals.css` header
comment. It's a genuine differentiator. It doesn't show up as forcefully on the interior
templates (wiki-entry's timeline uses a plain `dt`/`dd` list rather than the rail
treatment used elsewhere), which is a coherence observation, not scored here since the
cap forbids it from being the reason anything is held down — see I1, which already
captures the underlying defect through family_coherence instead.

## Benchmarks cited (mechanism, not adjectives)

- **Linear** — density without clutter: tight uniform rows, chrome carried by type and
  space. The artifact matches this on `home` and `table-catalog` (dense date-rail rows,
  hairline-only dividers) but not on the five templates named in I1, where the *absence*
  of chrome combines with narrow measure to produce empty space rather than density.
- **Stripe** — structured tabular presentation as a first-class surface. The catalog
  table's tabular-nums, right-aligned numerics, and sticky header match this; the lack of
  any grouping cue across 396 uniform rows (I3) is the one place it falls short of
  Stripe's own catalogue/pricing tables, which pair hairline dividers with periodic
  grouping at this scale.
- **Vercel** — a domain-chosen typeface (met, see typographic_system) and "a grid whose
  rhythm stays visible across every page of the property" (not met — see I1; the grid
  rhythm is visible on 2 of 10 sampled templates, not all of them).

## Item summary

| id | target | tag | impact |
|---|---|---|---|
| I1 | design system + wiki-entry/article/prose/tools/learn templates | ui-fixable | 8 |
| I2 | `scripts/verify-design.mjs` focus-sweep cap | evidence-fix | 5 |
| I3 | `.data-table` in `globals.css` | ui-fixable | 3 |

No `keeper-gate` items this iteration — nothing found turned on content, page existence,
or reader intent in a way a screenshot can't answer.

## Verdict reasoning

7.2 overall against an 8.5 target. The fundamentals are real: typography, colour, payload
and table craft are all solidly executed and specific to this site rather than templated
defaults. But the family_coherence/information_density pairing is not a polish gap — it's
the rubric's own definition of a family-breaking defect, present on five of ten sampled
templates, and it is the first thing a reader hits the moment they leave the home page.
That, plus an accessibility category that cannot currently claim full R5 coverage on the
site's largest page, is enough to hold this at **Competent**: correctly executed on its
strongest surfaces, not yet holding together as one system. It is not **Well-designed
reference site** until I1 closes and the freed width on the interior templates is doing
work instead of sitting empty.
