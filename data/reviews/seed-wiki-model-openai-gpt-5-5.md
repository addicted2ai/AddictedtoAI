---
job: seed-wiki-model-openai-gpt-5-5
verdict: approve
reasons: []
would-cite: >-
  Someone treating OpenAI's "Pro" suffix as a stable compute tier worth roughly
  a dozen times the base rate: this row is the break in that pattern — 12.000x
  held for GPT-5, 5.2 and 5.4, halved here, and by the three GPT-5.6 variants
  every Pro row bills its base row's exact price.
reviewer: rr1b
date: 2026-08-29
---

Round 2, sealed. Findings written before opening round 1. Ratios recomputed
from `data/sources/openrouter-models/latest.json` (snapshot 2026-08-28, 388
rows) with my own script on 2026-08-29; the one external claim was fetched and
matched as a literal substring.

- Pro/base input ratios, to three decimals: gpt-5-pro **12.000**,
  gpt-5.2-pro **12.000**, gpt-5.4-pro **12.000**, gpt-5.5-pro **6.000**,
  gpt-5.6-sol-pro **1.000**, gpt-5.6-terra-pro **1.000**, gpt-5.6-luna-pro
  **1.000**. The completion ratios are identical throughout, so "half the
  premium" and "the same rate as the plain row" hold on both meters.
- I checked the enumeration rather than the examples, because "the five
  releases that shipped a Pro row" is an exhaustive claim: in the GPT-5 line
  the Pro rows are 5, 5.2, 5.4, 5.5 and 5.6 (three of them). `gpt-5.1` and
  `gpt-5.3-codex` ship none. The list is complete and correct.
- "OpenAI cut Luna 80% and Terra 20% on 30 July 2026" — this is the only claim
  on the page with no support anywhere in this repository's data
  (`changes.jsonl` carries the 2026-07-09 GA prices and nothing later), so I
  fetched OpenAI's changelog and matched the literal string. It is verbatim:
  "Starting July 30, GPT-5.6 Luna costs 80% less, while GPT-5.6 Terra costs
  20% less." I then checked the thing that would make the sentence a partial
  enumeration — whether Sol was cut in the same action — and it was not: the
  Jul 30 entry gives Sol fast mode, and Sol's own cut is a separate Aug 21
  entry ("GPT-5.6 Sol now costs $4 per million input tokens..."). Naming only
  Luna and Terra is correct, not a gap. Recording the method so this is not
  "corrected" later.
- `reasoning.default_enabled` reads true on gpt-5.5 and false on gpt-5.4 in
  the same snapshot, so "the opposite value" is measured.
- Recorded, not blocking: "base and Pro moved together and the ratios are
  undisturbed" is an inference rather than a measurement. Current parity is
  measured; the pre-cut Pro price is not recoverable here (`previous.json` is
  the same 2026-08-28 body) and the changelog does not break the cut out by
  row. The clause is supporting, not load-bearing, and it is directionally
  supported by the changelog treating each model as one price.

Round 1 (r9-opus) found three things. "Across four consecutive minors" — false,
since 5.3 ships no plain row, and the hedge cost the page its own best data
point — **fixed**: the sequence now opens with GPT-5 itself and reads "Across
the five releases that shipped a Pro row", which I verified is exhaustive.
A volatile value typed rather than transcluded ("where GPT-5.4 carried
`false`") — **fixed**, though by the other permitted route: `openai-gpt-5-4.md`
still carries no `reasoning_on_by_default` fact, so instead of transcluding it
the prose now states direction only and anchors it, "the opposite value in the
same snapshot". That is the allowed alternative, not a half-repair. No as-of
anchor on the ratios — **fixed**: "as observed on 28 August 2026". Round 1
also supplied the July 30 price-cut context, which the fix incorporated and
which I have now verified against the vendor's own changelog rather than
against round 1's assertion of it.

It clears the bar as it stands. The payload is a five-release arc that no
single catalog row shows, the arithmetic is exact rather than approximate, and
the reasoning-default paragraph adds a second, independent finding about the
same row instead of padding the first. Nothing volatile is typed; every ratio
sits inside a dated observation.

## Superseded in part 2026-08-31 by `addictedtoai-sng` — annotated, not overwritten

**What this record said, on its date.** The would-cite above reads "every Pro
row **bills** its base row's exact price", and the first finding concludes that
`"the same rate as the plain row" hold[s] on both meters`. Both quote prose that
no longer exists in that form, so the wording above is a dated account and not a
description of what ships today.

**What superseded it.** `addictedtoai-l6j` established that an OpenRouter
`pricing.prompt` is the **top listed provider's** rate for a row, re-chosen on a
rolling 30-second window — a rate on a listing, not a rate a company charges.
This page carried ten of the fifteen transclusions recorded as debt in
`data/price-attribution-debt.json`; `addictedtoai-sng` repaid them.

**The ratios in the finding above were re-derived live before anything changed,
and every one of them held.** Because two of the fifteen were suspected
*inverted* rather than merely unhedged, all 22 rows the four debt files touch
were fetched from `https://openrouter.ai/api/v1/models/<row>/endpoints` on
2026-08-31 (all HTTP 200) and read per-provider rather than off the headline. On
every row the headline equals the vendor's own standard-tier endpoint, so
12.000x / 12.000x / 12.000x / 6.000x / 1.000x hold at OpenAI's own rate exactly
as this record measured them off the snapshot. **Nothing was withdrawn and no
value changed** — the repair is additive.

**The current text.** The verbs that made a party the payee were replaced with
listing verbs *and* the house hedge was added, so no sentence here depends on
the section-wide exemption:

- was: `openai/gpt-5-pro` **billed** X against plain `openai/gpt-5`'s Y
  now: `openai/gpt-5-pro` **heads at** X against plain `openai/gpt-5`'s Y
- was: half the premium the three releases before it **charged**
  now: half the premium **of** the three releases before it
- was: each of the three GPT-5.6 variants **prices its Pro sibling at** exactly
  the same rate as the plain row
  now: each … **has its Pro sibling listing at** exactly the same rate as the
  plain row
- was: the premium **OpenAI charges for its own "Pro" label**
  now: the premium **attached to the "Pro" label in these listings**

plus, once per paragraph: "Each of those eight figures is the top listed
provider's rate for its row rather than necessarily OpenAI's own, and two rows
are not obliged to be headed by the same provider, so every ratio here is a gap
between two listings."

**One thing this repair deliberately does not say.** A first draft of the hedge
closed "…rather than a multiplier anyone announced". That was withdrawn before
merge: the OpenAI rows carry **no pricing language at all** in their `description`
field (checked on all seven Pro/base rows), so the corpus has no evidence either
way about what OpenAI announced, and asserting the negative would have been a new
unsourced claim smuggled in under a correction. The hedge now states only the
mechanism, which is always true.

**Also recorded, outside this record's slice:** the headline is one *service
tier* among several the same provider lists for a row — OpenAI lists gpt-5.5 at
$2.50 (`openai/flex`), $5.00 (`openai`) and $12.50 (`openai/fast`). That is a
second attribution hazard the check does not model, filed as `addictedtoai-pfc`.
