---
job: seed-wiki-model-anthropic-claude-opus-4-7
verdict: revise
reasons:
  - false-or-unsupported-claim
would-cite: >-
  Someone budgeting for Anthropic fast mode on the assumption it has always
  carried a fixed premium would want this page: the premium debuted at 6x the
  base rate on Opus 4.7 and was cut to 2x fifteen days later, where it has
  stayed through Opus 5 — so a quote based on the 4.7-era multiplier is
  three times too high.
reviewer: r8-opus
date: 2026-08-28
---

Checklist: model entry, no cited URLs — every claim is feed arithmetic.
Recomputed against `data/sources/openrouter-models/latest.json`
(snapshot 2026-08-28, 388 rows) with a script.

**Verified:**
- Multipliers are exact, on both input and output:
  opus-4.7 base 0.000005 / fast 0.00003 = **6.00x** (output 0.000025 /
  0.00015 = 6.00x); opus-4.8 base 0.000005 / fast 0.00001 = **2.00x**
  (output 2.00x); opus-5 base 0.000005 / fast 0.00001 = **2.00x**.
  "six times over", "twice over", "fallen by two thirds" (6 → 2) and
  "three times that multiplier" (6 = 3 x 2) all check out.
- `anthropic/claude-opus-4.7-fast` is the first `-fast` row in the line —
  no earlier one exists in the feed, so "makes its debut in this line" holds.
- "Nothing else about the option is recorded as having changed between the
  two releases — same context window, same base rate": both fast rows list
  `context_length` 1000000 and both base rows list 0.000005. True.
- Base-price plateau 4.5 → opus-5 at 0.000005: true, five rows.
- All 7 transclusions resolve; every volatile value is bound.

**Defect 1 — "Two releases later".**
`anthropic/claude-opus-4.8` is the **next** release after 4.7, not two later:
4.7 created 2026-04-16, 4.8 created 2026-05-27, with no Opus row between
them. Forty-one days and one release, not two. This is demonstrably a slip
rather than a different counting convention, because the sibling entry
`anthropic-claude-opus-4-8` uses "two releases later" correctly for
4.7 → 4.8 → opus-5. Replace with "the next release".
- Worth noting the sharper version the page missed: opus-4.7-fast was listed
  2026-05-12 and opus-4.8-fast on 2026-05-27, so the 6x fast option existed
  for **fifteen days** before the 2x one replaced it. That is a better fact
  than the one currently in the paragraph.

**Defect 2 — "the one number in the family that actually moved".**
"This row's base price is ... unchanged from claude-opus-4.5 through
claude-opus-5 — so the fast-mode cut is the one number in the family that
actually moved during that stretch." Two other numbers moved inside exactly
that stretch:
- `context_length` went 200000 → 1000000 at claude-opus-4.6.
- `intelligence_index` went 55 (4.7) → 57.3 (4.8) → 63.1 (opus-5).
Both are documented on the sibling page for opus-4.8, so the corpus
contradicts itself here. The claim is rescuable by narrowing it to prices —
among *prices* the fast multiplier genuinely is the only mover, since base,
output and `:batch` rates are all flat across 4.5 → opus-5 (I checked
`:batch` too: 0.0000025 throughout). "the one price in this family that
moved" would be true as written.

**Recorded, not blocking:** this body carries its whole argument in prose
ratios — "six times over", "twice over", "two thirds", "three times that
multiplier" — stated as timeless truths over `volatility: fast` fields.
The underlying values are correctly transcluded, but the *relationships* are
typed, and if Anthropic re-prices either row the sentences become false
while every transclusion still renders correctly. The sibling opus-4.8 page
has the same shape but anchors its ratios to named historical releases; the
gemini-3.7-flash entry solves it properly with "Right now". A "as the
catalog stands today" anchor would cost one clause here.

The payload is real — the collapse of the fast premium from 6x to 2x is not
visible on any single row and is exactly the sort of cross-row finding this
site exists to produce. Two checkable errors, both narrowly fixable. Revise.
