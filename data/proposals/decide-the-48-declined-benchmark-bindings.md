---
date: 2026-09-06
slug: decide-the-48-declined-benchmark-bindings
type: repair
summary: >
  Resolve the contradiction the new declined-field cross-check detects but
  deliberately does not decide: `data/sources/registry.json` declines
  `benchmarks.artificial_analysis` for `openrouter-models` — "not carried: not a
  column, not a fact, not an event", decided 2026-09-05 on a measurement — while
  48 `source: feed` facts across 29 `content/wiki/model/` entries bind leaves of
  that block and render them on published pages. Exactly two repairs are
  legitimate and the job is to pick one and carry it out: unbind the 48 facts
  (and delete their lines from `data/declined-binding-debt.json`), or withdraw
  the refusal from the registry with a dated note saying why the 2026-09-05
  measurement no longer holds. Either way the debt file shrinks to empty and the
  warning stops. Tracked as beads addictedtoai-226f.
evidence: >
  Measured 2026-09-06 in this repository, not fetched from anywhere.
  `declinedFieldsStep({ debt: { known: [] } })` from `lib/declined-fields.mjs`
  run against the committed registry and the committed corpus reported "1
  declined-field error(s)" naming `benchmarks.artificial_analysis` and "48
  content file binding(s)" across 29 files — `intelligence_index` on 29 entries,
  `coding_index` on 11, `agentic_index` on 8. The refusal itself is
  `data/sources/registry.json`, `sources[openrouter-models].declined_fields[0]`,
  `decided_on: 2026-09-05`, whose own note records the measurement behind it: 165
  of the 179 rows carrying the block moved between the 2026-09-04T06:00:03Z and
  2026-09-05T06:00:04Z fetches, 147 directional moves down and 0 up, 181 values
  going number->null with 0 going the other way. That note also cites Artificial
  Analysis's "Announcing Artificial Analysis Intelligence Index v4.2"
  (https://artificialanalysis.ai/articles/artificial-analysis-intelligence-index-v4-2,
  dated September 4, 2026) as corroborating but not load-bearing; this proposal
  did NOT re-fetch that page, and a job taking this on should, because the
  choice between the two repairs turns partly on whether the publisher has since
  started serving the index version and evaluation date alongside the number —
  which is the exact condition the refusal names as its own revisit trigger.
proposed_by_job: j-20260906-07
proposed_by_type: machinery
---

## Why this is a separate job and not the one that found it

Job `j-20260906-07` was scoped to add the detector and was told, in its own
brief, not to resolve the contradiction: *"the first discards a measured refusal
and the second is a content decision tracked separately."* That was right, and it
is why the detector ships with a shrink-only debt list rather than with a repair.
But a debt list with no job pointed at it is how a ratchet stops ratcheting: the
warning fires on every build, nothing selects it, and in three months it is
scenery. This proposal is the job the list is waiting for.

## What makes it a `repair` and not an `entry`

Nothing here is prose. It is 48 front-matter facts and one registry entry, and
the outcome is that two records stop contradicting each other — a malformed
record set, which is what `repair` covers. It touches 29 entry files but writes
no sentence in any of them.

## What the job has to settle first, because the answer changes the diff

The refusal's own note names the condition under which it should be revisited:
*"Revisit if OpenRouter starts serving the index version and evaluation date
alongside the number, or if coverage stops collapsing on a rebase."* So the first
step is not editing anything — it is fetching a current `openrouter-models`
snapshot and answering that question. If the block now carries an index version
and a measurement date, the honest repair is to withdraw the refusal and keep the
bindings (and the field becomes bindable without importing the rot). If it still
carries a bare number with no scale and no date, the honest repair is to unbind
the 48, because the site is currently rendering, as a fact, a value the registry
says it cannot say the meaning of — and the 2026-09-04/05 rebase is the proof
that the meaning moves by a fifth without the number announcing it.

## Done when

- One of the two repairs is complete, with the measurement that chose it quoted
  in the diff.
- `data/declined-binding-debt.json` carries zero `known` entries — either every
  binding is gone, or the refusal is gone and there is nothing to forgive. The
  file's stale-entry warning must be silent, not merely quieter.
- `npm run build` prints `0 contradiction(s)` and `0 recorded as debt` from the
  `declined-fields` step, and `npm test` passes unchanged —
  `lib/declined-fields.test.mjs` asserts the debt as a ceiling rather than an
  equality, so paying it down is already green there and nothing in the suite
  needs relaxing to let this land.
