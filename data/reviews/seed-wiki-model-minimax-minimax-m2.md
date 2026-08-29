---
job: seed-wiki-model-minimax-minimax-m2
verdict: revise
reasons:
  - false-or-unsupported-claim
  - broken-reference
would-cite: >-
  The MiniMax M2 licence facts are worth citing on their own — plain MIT plus a
  single display obligation above 100M MAU or US$30M ARR, with no fee and no
  revenue share — but the counting sentence wrapped around them names the wrong
  number of labs for the second review running, so the data should carry this
  page rather than the prose.
reviewer: rr4b
date: 2026-08-29
---

Round 2, sealed. Findings written before opening round 1. Sources fetched
2026-08-29, confirmed by literal substring match against raw bytes on disk.

**Verified, and the licence work is genuinely good:**

- github.com/MiniMax-AI/MiniMax-M2 `LICENSE` (1,453 b, read in full): titled "MIT
  License", closing with "Our only modification is that, if the Software … more
  than 100 million monthly active users, or more than 30 million US dollars (or
  equivalent in other currencies) in annual recurring revenue, you shall
  prominently display "MiniMax M2" on the user interface". The `license` fact
  reproduces both thresholds and the obligation correctly.
- **"asks for neither a fee nor a share of revenue" earns its absence**: across
  all 1,453 bytes there is no "revenue share", no percentage, and the `%`
  character does not occur once.
- Parameters: the HF README states "(230 billion total parameters with 10 billion
  active parameters)" — fact exact. "Smallest of the three" holds: 230B < 284B
  (DeepSeek V4 Flash) < 1T (Kimi K2.5).
- Price is transcluded and anchored to "the snapshot of 28 August 2026", matching
  `$as_of`. The volatile-value and ratio rules are not re-broken here.

**DEFECT 1 — `false-or-unsupported-claim`. The corrected count is still wrong.**
"That makes MiniMax the second lab in this catalog to publish weights under a
modified MIT licence rather than a plain one. The other is Moonshot." I fetched
`mistralai/Mistral-Medium-3.5-128B`'s `LICENSE`: it is **literally titled
"Modified MIT License"** (1,695 b), and `model/mistralai-mistral-medium-3-5` is a
row in this catalog (`catalog.json`, 388 rows). Mistral is a third lab, so "the
second … the other is Moonshot" is false. It fails on the stricter reading too:
MiniMax's own file is titled plain "MIT License" and only *describes* a
modification, whereas Moonshot's and Mistral's carry the title. The corpus refutes
this in its own voice — the blog post published three days before the snapshot
reads that exact Mistral file at length.

**DEFECT 2 — `broken-reference`, introduced by the fix.** The sentence
"DeepSeek's `deepseek-ai/DeepSeek-V4-Flash-0731` ships under
{{fact:org/deepseek#weights_license}} — plain MIT, no clause attached at all"
transcludes an **org-level policy** fact whose value is "MIT License (since
January 2025); earlier models used the proprietary DeepSeek License".
`lib/transclude.mjs` splices the raw value inline, so the page publishes: "…ships
under MIT License (since January 2025); earlier models used the proprietary
DeepSeek License — plain MIT, no clause attached at all — and Z.ai's GLM 5.1
carries MIT." That is broken as prose and false as attribution: a claim about
DeepSeek's history is asserted as this checkpoint's terms. The correct fact exists
and was not used — `model/deepseek-deepseek-v4-flash-0731#license` = "MIT License,
repository and weights". (I verified the checkpoint's file directly: stock MIT,
"Copyright (c) 2023 DeepSeek".)

Round 1 (r8-opus) found: "the third lab … under a modified MIT licence" is
unsupported, DeepSeek and Kimi K3 are not instances, and MiniMax should be called
**the second**; secondarily that "flagship" was unearned. The "flagship" point is
**fixed** (the word now attaches only to Kimi K3, which r1 agreed is its lab's
flagship). The counting defect is **not fixed — it was renumbered**, and the fix
introduced Defect 2 while carrying out r1's instruction to reframe DeepSeek as the
baseline.

**A round-one finding I now believe was wrong.** r1 prescribed "second" from a
census of "every model entry declaring a `license` field (nine)". That measures
what this corpus has written down, not what labs publish, and the claim in the
prose is the latter. The prescription was wrong and the fixer followed it
faithfully, which is how a piece fails twice on one sentence.

I judge this a piece with two fixable sentences rather than a rotten core: the
licence reading is exact and the payload survives correction. But the assembled
cross-lab taxonomy *is* the only thing here that a facts table does not already
show, and it is the part that does not hold; the rest restates the transclusions.
As a data-only stub it keeps everything I verified — the licence, the parameters,
the listed date, the catalog row — and loses only the false count. That is the
right trade. Revise.
