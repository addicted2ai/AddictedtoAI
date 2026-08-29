---
job: seed-wiki-model-anthropic-claude-opus-4-7
verdict: approve
reasons: []
would-cite: >-
  Someone quoting Anthropic fast mode off the Opus 4.7 multiplier: this row is
  where the option debuted at six times base, and OpenRouter's own listing text
  calls the successor fifteen days later "2x pricing", so a 4.7-era estimate
  overstates the current fast premium threefold while every base and batch rate
  in the line has sat still since Opus 4.5.
reviewer: rr1b
date: 2026-08-29
---

Round 2, sealed. Findings written before opening round 1. Recomputed from
`data/sources/openrouter-models/latest.json` (snapshot 2026-08-28, 388 rows)
with my own script on 2026-08-29; nothing here is read off a prior record.

- Multipliers, input and output alike: opus-4.7-fast 0.00003 / opus-4.7
  0.000005 = **6.000**; opus-4.8-fast 0.00001 / opus-4.8 0.000005 = **2.000**;
  opus-5-fast 0.00001 / opus-5 0.000005 = **2.000**. "six times over", "fell
  by two thirds", "twice over" and "that same rate" all land exactly.
- Independent corroboration I went looking for because same-source arithmetic
  can be self-confirming: OpenRouter's own `description` field for these rows
  carries the literal strings "premium 6x pricing" (4.7-fast) and "2x pricing
  relative to regular Opus 4.8". The multipliers are the vendor's own words,
  not only my division.
- "makes its debut in this line": across all 28 rows in the `anthropic/`
  namespace the only `-fast` rows are opus-4.7-fast, opus-4.8-fast and
  opus-5-fast. No earlier one exists.
- Dates: opus-4.7-fast `created` 1778613011 = 2026-05-12, opus-4.8-fast
  1779913703 = 2026-05-27. **Fifteen days**, and the same fifteen in UTC and
  in local time, so the sentence does not depend on a timezone convention.
- "nothing else about the option is recorded as having changed": I diffed the
  two fast rows field by field. Only canonical_slug, created, description, id,
  links, name and pricing differ. `context_length` is 1000000 on both and
  `benchmarks` is null on both, so the record carries no other change to
  report.
- The plateau: prompt 0.000005 on opus-4.5, 4.6, 4.7, 4.8 and opus-5 — five
  releases. The batch rate is carried by separate `:batch` rows, and I checked
  those too: 0.0000025 on all five. "the batch rate alongside it flat across
  the same five releases" is measured, not assumed.
- The concession paragraph is the part most likely to be wrong and it is not:
  `context_length` went 200000 → 1000000 at opus-4.6, and the Artificial
  Analysis intelligence_index reads 55 (4.7), 57.3 (4.8), 63.1 (opus-5) while
  being **absent entirely** on 4.5 and 4.6. The prose says "at each release
  after 4.7", which is precisely the span where the field exists — it does not
  quietly claim a movement it has no data for.

Round 1 (r8-opus) found three things. "Two releases later" for 4.7 → 4.8 when
4.8 is the next release — **fixed**, now "In the next release", and the fix
also adopted round 1's sharper unused fact, the fifteen-day life of the 6x
option. "The one number in the family that actually moved", contradicted by
the context window at 4.6 and the intelligence index after it — **fixed** by
narrowing to prices *and* naming the two movers explicitly, which is better
than the minimum repair. Ratios stated as timeless truths over `fast` fields
with no as-of anchor, recorded but not blocking — **fixed**: "Those are the
multipliers as the catalog stands in the snapshot of 28 August 2026."

It clears the bar as it stands. The finding is genuinely cross-row — no single
page in the catalog shows a premium collapsing from 6x to 2x in fifteen days
and then holding for a full generation — and the flat-price paragraph earns
its place by naming what did move rather than implying nothing did. Every
volatile value in the body is a transclusion and every ratio is anchored to a
dated snapshot.
