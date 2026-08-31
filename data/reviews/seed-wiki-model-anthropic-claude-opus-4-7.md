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

## Superseded in part 2026-08-31 by `addictedtoai-sng` — annotated, not overwritten

**What this record said, on its date.** The first finding quotes the prose as
*"six times over", "fell by two thirds", "twice over" and "that same rate" all
land exactly*. The opening sentence it was reviewing read "…**priced at** X input
against this row's own Y", and the second paragraph read "Opus 5's fast row still
**bills at** the two-times rate". Both of those verbs are gone; the record above
is a dated account, not a description of what ships today.

**What superseded it.** `addictedtoai-l6j` established that an OpenRouter
`pricing.prompt` is the **top listed provider's** rate for a row, re-chosen on a
rolling 30-second window. This page carried two of the fifteen transclusions
recorded as debt in `data/price-attribution-debt.json`; `addictedtoai-sng` repaid
them. The neighbouring `anthropic-claude-opus-4-8.md` had already been repaired
by hand under `addictedtoai-sdh` and carried the hedge at its own :59, so until
now the corpus said it both ways; it no longer does.

**Re-derived live, and held.** All 22 rows the four debt files touch were fetched
from `https://openrouter.ai/api/v1/models/<row>/endpoints` on 2026-08-31 (all
HTTP 200). On every Opus row the headline equals Anthropic's own endpoint rate —
4.7 $5.00/M, 4.7-fast $30.00/M, 4.8 $5.00/M, 4.8-fast $10.00/M, 5 $5.00/M,
5-fast $10.00/M — so 6.000x, 2.000x and 2.000x hold at the vendor's own rate.
**Nothing was withdrawn and no value changed.**

**This record's second finding turned out to be load-bearing, and it caught an
error in the repair itself.** The corroboration recorded above — that
OpenRouter's `description` field carries the literal strings "premium 6x pricing"
and "2x pricing relative to regular Opus 4.8" — was re-checked on 2026-08-31 and
**still holds verbatim** on all three fast rows (Opus 5's reads "2x pricing
relative to regular Opus 5"). A first draft of the hedge closed "…not multipliers
Anthropic announced". That is **false**, and this record is why it was caught
before merge: Anthropic states the multipliers in its own row text, so the
figures being top-provider rates does not make the *ratio* a listing artifact
here. The merged hedge therefore states only the mechanism and stops:

- was: …**priced at** X input against this row's own Y — six times over
  now: …**heading at** X input against this row's own Y — six times over
- was: Opus 5's fast row still **bills at** the two-times rate
  now: Opus 5's fast row still **lists at** the two-times rate
- added: "Each of those six figures is the top listed provider's rate for its row
  rather than necessarily Anthropic's own, and two rows are not obliged to be
  headed by the same provider, so these are the multipliers between listings as
  the catalog stands in the snapshot of 28 August 2026."

**Also recorded:** the headline is one *service tier* among several — Opus 4.8
lists at $5.00/M from Anthropic, Bedrock, Vertex, Azure and Claude-on-AWS, but at
$5.50/M from the `amazon-bedrock/eu-west-1`, `google-vertex/europe` and
`google-vertex/us` regional endpoints. Filed as `addictedtoai-pfc`.
