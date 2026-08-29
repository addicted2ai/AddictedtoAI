---
job: seed-wiki-model-deepseek-deepseek-v4-flash-0731
verdict: revise
reasons:
  - false-or-unsupported-claim
  - overclaiming-summary
would-cite: >-
  Someone dismissing a lab's self-reported benchmark table would meet the
  counter-argument here: DeepSeek's Terminal-Bench and CyberGym numbers are
  self-published, but the MIT-licensed weights that produced them are
  downloadable, so the claim costs compute to check rather than trust — the
  distinction between an unfalsifiable number and an unverified one.
reviewer: r8-opus
date: 2026-08-28
---

Checklist: model entry, five cited sources. All five re-fetched 2026-08-28;
feed arithmetic recomputed against
`data/sources/openrouter-models/latest.json` (2026-08-28, 388 rows).

**Verified:**
- https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731 resolves. The
  benchmark table gives Terminal Bench 2.1 = **82.7** for this release and
  **61.8** for DeepSeek-V4-Flash (Preview); CyberGym = **76.7** and **38.7**.
  All four numbers verbatim, in that unit, meaning that thing. Licence "MIT
  License" confirmed. 82.7/61.8 = 1.34 ("rose by roughly a third") and
  76.7/38.7 = 1.98 ("very nearly doubled") — both arithmetic descriptions are
  right.
- https://www.tbench.ai/ resolves to the real Terminal-Bench site (Harbor /
  Laude Institute), presenting an agent benchmark ranked by resolution rate,
  cost and tokens. The landing page does not itself spell out "inside a live
  terminal", so I am recording *how* I verified: the page is the benchmark's
  real home and the gloss is an accurate description of it, not a greppable
  quotation. A later pass should not "correct" this to landing-page wording.
- Feed: intelligence_index 51.8 and coding_index 69.1 are present under
  `benchmarks.artificial_analysis`, so the "scored independently by
  Artificial Analysis" framing is accurate to where the numbers come from.
- All 8 transclusions resolve.

**Defect 1 — "re-post-trained revision" is in none of the cited sources.**
The page's central premise is quoted from its own front matter: "this row's
own timeline calls it a 're-post-trained revision' of the April preview".
That timeline entry cites https://en.wikipedia.org/wiki/DeepSeek. I fetched
it: it says "On 24 April 2026, DeepSeek released a preview of its V4 series"
and "The official versions of DeepSeek V4-Flash and V4-Pro were released on
31 July and 13 August, respectively" — and says nothing about
re-post-training or about what changed. The model card does not use the term
either; it says the release is "the official release of DeepSeek-V4-Flash,
superseding the preview version, with substantially enhanced agentic
capabilities". https://simonwillison.net/2026/Jul/31/deepseek-v4-flash-0731/
resolves, is dated 31 July 2026 (supporting the `release_date` fact), and
calls it only "the latest release in DeepSeek's V4 family". So the
characterisation exists nowhere but in this corpus, and the prose cites the
corpus back to itself as evidence.

**Defect 2 — "Nothing about the architecture changed in between" is
contradicted by the sources.**
- The model card states this release "has the same model structure as
  DeepSeek-V4-Flash-DSpark, i.e. it comes with a speculative decoding module
  attached" — an architectural component the April preview is not described
  as carrying.
- Parameter count: the card says "Model size: 304B params". The Simon
  Willison post, independently, says "304 billion parameters - 167GB on
  Hugging Face". Wikipedia gives **284**B for the *April preview*
  ("the 284-billion parameter DeepSeek-V4-Flash"). Two independent sources
  put the July release at 304B and the preview at 284B — i.e. the model got
  bigger between the checkpoints, which is precisely what the paragraph
  denies.
- The feed's own rows agree something changed: `context_length` went
  1,048,576 (preview) → 1,310,720 (this row).
Therefore "the entire gain on both numbers came from further post-training
against the same base model, not from a bigger or different one" is not
supported and is probably false. This is the piece's whole first paragraph
and its headline inference.

**Defect 3 — the `parameters` fact is wrong for this checkpoint, and the
prose makes it load-bearing.** The fact reads "284B total, 13B active per
token" and cites https://openrouter.ai/api/v1/models; the feed row's
description does say "13B active parameters out of 284B total", so the fact
is faithfully transcribed — but OpenRouter appears to have carried the
preview's figure forward, since the *identical* text appears on the
`deepseek/deepseek-v4-flash` preview row. The prose then welds that number
onto a claim about a different artifact: "the exact {{parameters}} weights
that produced the self-reported scores are the same weights anyone can
download". The weights anyone can download are the ones whose card says
304B. Re-source the fact to the model card, or state both figures with their
provenance.

**What survives, and it is the good part.** Paragraphs two and three are
sound and are the reason this is a revise and not a reject: the distinction
between a vendor-published table and an independently-run index, and the
observation that open weights convert a self-reported number from a
trust problem into a compute problem, are genuine ideas that no catalog row
contains. Rebuild paragraph one around what the sources actually say — the
official release beat its own preview by 20.9 points on Terminal-Bench and
38.0 on CyberGym — and drop the causal story about post-training, or source
it. Revise.
