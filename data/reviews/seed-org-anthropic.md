---
job: seed-org-anthropic
verdict: revise
reasons: [false-or-unsupported-claim, intent-not-measurement]
would-cite: >-
  Someone arguing that frontier capability gating has become a policy and
  clearance question rather than a technical one — "the top model is not for
  sale, and it came back from suspension through a government approval" —
  would paste this page; so would anyone claiming Anthropic ships capability
  gains without price increases, since the flat five-release price ladder
  against a rising intelligence index is assembled here and nowhere else.
reviewer: task-6.5 seed reviewer (fresh invocation, no authorship of any seed content)
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
