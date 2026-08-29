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

---

## Recheck, 2026-08-29 (b2-prices) — `addictedtoai-sdh`

Verdict unchanged: **approve**. This is the mildest of the seven hits in the
`addictedtoai-sdh` sweep: **the attribution was loose, the conclusion was
sound**, so the fix is a hedge and two verbs rather than a rewrite.

### What was measured

2026-08-29 against `https://openrouter.ai/api/v1/models/<row>/endpoints`,
headlines from `data/sources/openrouter-models/latest.json` (`date: 2026-08-29`):

- **`anthropic/claude-opus-4.1`** — **2 endpoints, neither of them Anthropic**:
  Amazon Bedrock `0.000015` / `0.000075` and Google Vertex `0.000015` /
  `0.000075`. The headline is a reseller's.
- **`anthropic/claude-opus-4.5`** — 6 endpoints, **including `anthropic` itself
  at `0.000005` / `0.000025`**, which is the headline.
- **`anthropic/claude-opus-4.8`** (this row) — 10 endpoints, **including
  `anthropic` at `0.000005` / `0.000025`**, which is the headline.

So the sentence "`anthropic/claude-opus-4.1` **billed at** `0.000015`" made
Anthropic the biller on the one row in the comparison Anthropic does not serve,
while the four rows it compared against **are** Anthropic-served at the
headline.

### Why the conclusion survives where the others did not

Unlike the z-ai and NVIDIA hits, the magnitude here is not at risk. **Both
providers on the 4.1 row post the identical `0.000015`**, so there is nothing
for the top-provider rotation to change: any rotation on that row lands on the
same number. The "two thirds" is therefore exact and stable —
`0.000005 / 0.000015` = 1/3 — and "five releases at the same input price"
re-verified across 4.5, 4.6, 4.7, 4.8 and Opus 5, all `0.000005` / `0.000025`,
four of which are confirmed Anthropic-served. The finding stands; only its
grammar assigned it to the wrong party.

### What changed in the body

Facts untouched; prose only. Three edits, all verbs and one added hedge:

- "`anthropic/claude-opus-4.1` **billed at**" → "**heads at**".
- "the next release **cut two thirds off that, to**" → "**lists two thirds
  below that, at**" — the cut is now a property of the listings rather than an
  act by Anthropic.
- "eight points of climb while the row **billed** the same five times running"
  → "**listed** the same".
- Added after "Same number, five times running": each of those is the top
  listed provider's rate for its row rather than necessarily Anthropic's own,
  and the 4.1 row is headed by resellers, so the step down sits between listings
  rather than being a price Anthropic announced.

No provider is named, in keeping with the hedge written for this defect on
`model/cohere-command-a`: pinning Bedrock or Vertex would rot as the top
provider rotates.

### Flagged rather than edited

The `would-cite` in the front matter above says "Anthropic's top tier has
**billed** the identical $5/M input across five consecutive releases". The
$5/M figure is correct **and is Anthropic's own rate** on all four of the
later rows, so unlike the z-ai and NVIDIA records this `would-cite` is not
false — but its verb carries the same loose attribution the body just shed.
Front matter was out of scope for this pass; noted for whoever revisits it.

The three-dials finding (price, index, context window on three schedules) is
unaffected and untouched.
