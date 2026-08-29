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
