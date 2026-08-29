---
job: seed-wiki-model-openai-gpt-5-6-luna
verdict: revise
reasons:
  - broken-reference
would-cite: >-
  Someone arguing you must pay more to escape a nano-tier model would be
  answered by Luna listing at the same 2e-7 input as gpt-5.4-nano while
  scoring 52.3 against nano's 39.7 — same meter, twelve and a half points of
  intelligence index apart.
reviewer: r9-opus
date: 2026-08-28
---

Checklist: wiki model entry. Sources fetched 2026-08-28; catalog claims
measured against `data/sources/openrouter-models/latest.json` (2026-08-28,
388 rows).

**Verified by fetching:**

- github.blog changelog, 2026-07-09 — publication date matches
  `release_date`. Luna is described verbatim as "A lightweight, cost-efficient
  variant for smaller, faster tasks and also the lowest-cost option in the
  family", which supports the cheapest-of-family framing.
- venturebeat.com — "approximately 20 total organizations" and the 26 June
  2026 preview, quoted directly: "At [the U.S. government's] request, we are
  starting with a limited preview for a small group of trusted partners." The
  timeline event holds.

**Defect — a citation that does not support its claim.** The timeline entry
"generally available across ChatGPT, Codex, the OpenAI API and GitHub Copilot"
is sourced to the github.blog changelog. I re-fetched that page and asked
specifically: it names no surface outside GitHub, does not mention ChatGPT,
Codex or the OpenAI API, and says only that the models are "now rolling out in
GitHub Copilot". The claim itself is true — search results confirm GA on
9 July 2026 across all four surfaces — but I could not reach OpenAI's own
announcement (openai.com/index/gpt-5-6/ returned HTTP 403), so the correction
rests on secondary coverage. Re-point this to the OpenAI announcement. The
same mis-citation is on the Sol and Terra entries.

**Verified by measurement:**

- Luna 2e-7 input and `gpt-5.4-nano` 2e-7 — identical to the digit.
- Context 1050000 against nano's 400000. Indices: intelligence 52.3 v 39.7,
  coding 71.4 v 56.1, agentic 46.9 v 29.7. All four transcluded, all exact.
- Sol 2e-6 and Terra 2e-6 are equal, so "the same rate Terra charges too" is
  right; Sol / Luna = exactly 10. "A factor of ten" is exact.
- "trails Sol's by under nine points" — 60.9 − 52.3 = 8.6. True today.
- Two minor versions from 5.4 to 5.6. Correct.
- Fifteen transclusions, all resolving.

**Anchoring — the thing to fix alongside the citation.** Every derived
statement here is undated, and two of them are tight enough to rot on a single
feed move. "Under nine points" has 0.4 points of headroom, and "prices
identically" is an exact-equality claim between two `fast` pricing fields. The
inputs are transcluded and cannot go stale, but the *relations* asserted over
them can, and the page states them as timeless truths. This matters more here
than elsewhere in the batch because the equality is a recent artefact:
OpenAI cut Luna's price by 80% on 30 July 2026, and Luna listed at $1/1M at
launch. The match with nano is six weeks old, not a design decision. `org/openai`
dates its comparable claims ("as observed on 28 August 2026"); this page
should too, and should say the equality is a post-cut coincidence.

**Minor:** "Luna is also the cheapest of its own family by a wide margin" is
tied exactly by `gpt-5.6-luna-pro` at 2e-7. The margin is wide against Sol and
Terra only.

**Angle check — passes.** `org/openai` also discusses Luna's price against its
score, but against the `gpt-5.4` *flagship* (within a point of it at roughly a
twelfth the price, 126 days later — I re-measured that and it is correct).
This page compares against `gpt-5.4-nano` instead, which is a different and
sharper comparison: same price, wholly different tier. Not restating.

The payload is real and the arithmetic is exact. Re-point the GA citation and
date the comparisons. Revise.
