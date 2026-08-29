---
job: seed-org-anthropic
verdict: approve
reasons: []
would-cite: >-
  The page to hand anyone claiming frontier access has become a clearance
  question: a tier that left the market for nineteen days and returned "for a
  set of US organizations, following the US government's approval", stacked
  against a measured five-release price ladder that never moved while the
  intelligence index climbed eight points.
reviewer: task-6.5 seed reviewer (fresh invocation, no authorship of any seed content); delta review by a separate fresh invocation (no authorship of the entry or its revision)
date: 2026-08-28
---

Checklist: wiki entry. Sources fetched, catalog claims measured against
`data/sources/openrouter-models/latest.json` (snapshot date 2026-08-28,
row_count 388).

**Verified by fetching:**
- anthropic.com/news/claude-fable-5-mythos-5 — confirms the 2026-06-09
  announcement, the quote "a tier of Claude models that sit above our Opus
  class in capability", "the same underlying model as Fable 5, but with the
  safeguards lifted in some areas", the 12 June suspension note ("We are
  suspending access to Claude Fable 5 and Claude Mythos 5"), the 1 July
  availability note, and the tier list Mythos/Fable/Opus/Sonnet/Haiku.
- anthropic.com/claude/mythos — confirms Project Glasswing (2026-04-07, all
  eleven named partners verbatim) and "We have restored access to Mythos 5
  for a set of US organizations, following the US government's approval."
- anthropic.com/news/claude-opus-5 — confirms 2026-07-24 release and "the
  same cost as its predecessor, Opus 4.8".
- en.wikipedia.org/wiki/Anthropic — confirms founded January 2021, San
  Francisco HQ, public benefit corporation, US$965B valuation dated May 2026.

**Verified by measurement (script over the snapshot):**
- All five rows `claude-opus-4.5` (created 2025-11-24) through
  `claude-opus-5` (2026-07-24) list prompt 0.000005 / completion 0.000025 —
  the flat price ladder holds exactly.
- Context 200000 on 4.5 → 1000000 on 4.6 (created 2026-02-04): quintupled,
  date exact.
- Intelligence index: 4.7 = 55, 4.8 = 57.3, opus-5 = 63.1. 4.7 created
  2026-04-16, opus-5 created 2026-07-24: 99 days.
- All transclusion targets and mention ids resolve.
- Aliases sanely classed; volatile values (prices, context, index) are all
  transclusions of feed-bound facts.

**Required changes (the revise):**
1. `false-or-unsupported-claim` — the `top_tier_access` fact: "general sale
   is of the Opus tier and below". The cited Mythos page does not say this
   anywhere (re-fetched and asked directly; it restricts Mythos 5 to testing
   partners and describes Fable 5 as the safeguarded variant, with no
   statement limiting general sale to Opus-and-below). Worse, it is
   contradicted by this entry's own body ("Fable 5 shipped everywhere") and
   by the catalog: `anthropic/claude-fable-5` is a listed, priced row
   (created 2026-06-09, $10/$50 per M). Fix the fact value to what the
   source supports, e.g. "Mythos 5 is restricted to vetted partners; Fable 5
   is the generally sold Mythos-class variant."
2. `intent-not-measurement` — "Three step-ups in a hundred days". The
   snapshot shows two measurable step-ups among the three transcluded values
   (55 → 57.3 → 63.1); `claude-opus-4.6` carries no Artificial Analysis
   intelligence index at all (measured: its benchmarks object holds only
   design_arena entries), so the third step-up (4.6 → 4.7) cannot be shown
   from the data the sentence stands on. Say "two step-ups" or re-ground the
   third.

Everything else in the piece held up under fetch and measurement, and the
piece easily clears the editorial bar — the suspension-and-clearance story
and the price-stillness measurement are exactly the assembled-in-one-place
material the spec asks for.

## Delta review (commit 6ba8b3b only) — approve

Both named findings verified fixed by independent re-fetch and
re-measurement; nothing new introduced.

1. The `top_tier_access` fact now reads "Mythos 5 is available to a small
   set of initial testing partners for cybersecurity, and soon, biology
   research." Fetched https://www.anthropic.com/claude/mythos — its
   Availability section carries the sentence verbatim ("Claude Mythos 5 is
   available to a small set of initial testing partners for cybersecurity,
   and soon, biology research."). The lede's softening to "not on general
   sale" is consistent with the page (access gated to testing partners; a
   published $10/$50 per million list price, so "not for sale" would have
   been wrong). The body's restatement that biology researchers "are still
   listed as coming" is supported on both cited pages: the Mythos page's
   "and soon, biology research" and the announcement's "In the coming weeks,
   some biomedical researchers and companies will be able to join our
   trusted access program for biology."
2. "Two step-ups in ninety-nine days, neither of them charged for" —
   re-measured against `data/sources/openrouter-models/latest.json`
   (2026-08-28, 388 rows): 4.7 = 55 (created 2026-04-16), 4.8 = 57.3
   (2026-05-27), opus-5 = 63.1 (2026-07-24); `claude-opus-4.6` carries no
   artificial_analysis object at all; 2026-04-16 to 2026-07-24 is exactly
   99 days; all five opus rows at 0.000005/0.000025. Two step-ups, measured.

New-defect check: `anthropic/claude-fable-5` is a priced catalog row
(0.00001/0.00005, created 2026-06-09), which the new fact wording no longer
contradicts; the reworded lede paragraph's remaining quotes were already
verified in the first pass and are unchanged.

## Recheck 2026-08-29 (addictedtoai-flh) — holds, no change

Every quotation re-matched literally against bytes on disk, and every
catalog claim re-measured from the snapshot rather than read out of the
earlier record.

- anthropic.com/news/claude-fable-5-mythos-5 (371,344 bytes): "a tier of
  Claude models that sit above our Opus class in capability"; "It's the same
  underlying model as Fable 5, but with the safeguards lifted in some
  areas"; "We are suspending access to Claude Fable 5 and Claude Mythos 5"
  under a "Jun 12, 2026" heading, with a "Jul 1, 2026 Claude Fable 5 and
  Mythos 5 are now available" heading above it; "In the coming weeks, some
  biomedical researchers and companies will be able to join our trusted
  access program for biology capabilities in Mythos 5". The body's
  "biology and chemistry safeguards" is the page's own category name
  ("a request related to cybersecurity, biology and chemistry, or
  distillation"). The site nav lists the tiers "Mythos Fable Opus Sonnet
  Haiku", supporting the five-tier `model_tiers` fact.
- anthropic.com/claude/mythos (322,724 bytes): "Claude Mythos 5 is available
  to a small set of initial testing partners for cybersecurity, and soon,
  biology research" verbatim (the `top_tier_access` fact, word for word);
  "We have restored access to Mythos 5 for a set of US organizations,
  following the US government's approval." The Glasswing partner list is on
  the page in the entry's order — "Amazon Web Services, Anthropic, Apple,
  Broadcom, Cisco, CrowdStrike, Google, JPMorganChase, the Linux Foundation,
  Microsoft, NVIDIA, and Palo Alto Networks" — twelve names including
  Anthropic itself, which is why the timeline correctly lists eleven
  partners.
- anthropic.com/news/claude-opus-5 (354,386 bytes): "greatly improved
  performance for the same cost as its predecessor, Opus 4.8."
- en.wikipedia.org/wiki/Anthropic (654,553 bytes): "founded in January
  2021"; "public benefit corporation headquartered in San Francisco,
  California"; "It was valued at US$965 billion in May 2026." All four
  Wikipedia-sourced facts hold as written.

**Re-measured from `data/sources/openrouter-models/latest.json`** (which has
rolled to 2026-08-29, 396 rows, since the round-one measurement against the
388-row snapshot — every figure below re-derived from the current file, and
every one still matches):
- All five Opus rows list prompt 0.000005 / completion 0.000025:
  `claude-opus-4.5` (created 2025-11-24), `-4.6` (2026-02-04), `-4.7`
  (2026-04-16), `-4.8` (2026-05-27), `claude-opus-5` (2026-07-24).
- Context 200000 → 1000000 at `claude-opus-4.6`, created 2026-02-04.
  "Quintupled" is exact.
- Intelligence index 55 → 57.3 → 63.1; `claude-opus-4.6` carries only a
  `design_arena` benchmarks object and no `artificial_analysis` key at all,
  so "two step-ups" remains the only defensible count. 2026-04-16 →
  2026-07-24 = 99 days.
- Suspension arithmetic: 2026-06-12 → 2026-07-01 = 19 days. "Nineteen days"
  exact.

One phrase examined and left alone: "five releases ... over nine months".
The five *releases* span 2025-11-24 → 2026-07-24, which is eight months; the
*price stillness* the sentence is about runs from the 4.5 listing to the
present (2026-08-29), which is nine months and five days. The second reading
is the one the sentence makes — the price is a live transclusion, so the
interval is open-ended — and it measures out. Recorded here so a later pass
does not "fix" it to eight and break the claim it is actually making.
