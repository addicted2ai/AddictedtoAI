---
job: seed-wiki-model-anthropic-claude-opus-4-8
verdict: approve
reasons: []
would-cite: >-
  Someone arguing that frontier inference prices are still falling would be
  answered by this page: Anthropic's top tier has billed the identical
  $5/M input across five consecutive releases while the Artificial Analysis
  index climbed 8.1 points — the capability got cheaper per point without the
  sticker ever moving, which is the distinction that argument keeps eliding.
reviewer: r8-opus
date: 2026-08-28
---

Checklist: model entry, no cited URLs — every claim is feed arithmetic.
Recomputed against `data/sources/openrouter-models/latest.json`
(snapshot 2026-08-28, 388 rows) with a script, not by eye.

- Five-in-a-row price plateau: opus-4.5, 4.6, 4.7, 4.8 and opus-5 all list
  `pricing.prompt` = `0.000005`. Exactly five, and no other non-batch,
  non-fast Opus row exists between them — the run has no exception.
- "the next release cut two thirds off that": opus-4.1 = `0.000015`,
  opus-4.5 = `0.000005`. 15 → 5 is precisely a two-thirds cut, and 4.5 *is*
  the next release (created 2025-08-05 → 2025-11-24, nothing in between).
  Checked for phantom 4.2/4.3/4.4 rows; there are none.
- "eight points of climb": intelligence_index 55 (4.7) → 57.3 (4.8) →
  63.1 (opus-5). 63.1 − 55 = 8.1. "Opus 5 two releases later" is correct
  counting (4.7 → 4.8 → 5).
- Context window on a separate schedule: opus-4 / 4.1 / 4.5 all
  `context_length` 200000; opus-4.6 raises it to 1000000 at an unchanged
  `0.000005`; 4.7, 4.8 and opus-5 hold 1000000. Verified, including the
  "same ceiling the line had shipped with since the first Opus 4".
- All 11 transclusions resolve to declared fields; every volatile value is
  feed-bound; no typed price or context literal anywhere in the prose.
- Recorded, not a defect: opus-4.5 and opus-4.6 carry **no** recorded
  intelligence index, so the 8-point climb spans the last three of the five
  releases, not all five. The prose names 4.7, 4.8 and opus-5 explicitly, so
  it does not actually claim otherwise — but a reader skimming "eight points
  of climb while the row billed the same five times running" could take the
  climb to cover the whole plateau. A clause noting the index only starts at
  4.7 would close the gap.

This is the cleanest piece in my slice and the one whose arithmetic survived
every check I threw at it. The payload is a real assembled finding, not a row
restatement: three dials — price, index, context window — moving on three
different schedules across one lineup, with the price dial not moving at all.
The closing "two separate dials in this lineup, and they don't turn together"
is a judgment the catalog cannot state for itself. Approve.
