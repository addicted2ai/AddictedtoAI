---
job: seed-wiki-concept-distillation
verdict: approve
reasons: []
would-cite: >-
  Someone in a "DeepSeek just distilled GPT-4" argument claiming API access is
  all you need to distill a competitor — this page settles that Hinton's 2015
  method requires the teacher's output distribution, which a text-only API
  never exposes, and that R1's "distilled" models are SFT on 800k sampled
  texts by the paper's own sentence.
reviewer: r4-fable
date: 2026-08-28
---

Checklist: wiki concept entry. Sources fetched 2026-08-28.

- ar5iv.labs.arxiv.org/html/1503.02531 + arxiv.org/abs/1503.02531 — the
  soft-target rationale verbatim: "one version of a 2 may be given a
  probability of 10^-6 of being a 3 and 10^-9 of being a 7 whereas for another
  version it may be the other way around. This is valuable information that
  defines a rich similarity structure over the data"; the MNIST omitted-3s
  numbers exact: 206 test errors with 133 on the 1010 threes, and after
  raising the 3-class bias by 3.5, 109 errors with 14 on 3s; the temperature
  mechanism is the paper's ("raise the temperature of the final softmax until
  the cumbersome model produces a suitably soft set of targets"); v1 Mon,
  9 Mar 2015, matching the timeline.
- arxiv.org/html/2501.12948v1 — both quotes verbatim: "we directly fine-tuned
  open-source models like Qwen and Llama using the 800k samples curated with
  DeepSeek-R1" and "For distilled models, we apply only SFT and do not include
  an RL stage"; six distilled dense models (1.5B–70B) released; submitted
  22 Jan 2025, matching the timeline.
- Not independently verified: nothing material; every quote and number was
  re-fetched today.

The payload is the two-meanings distinction, and the entry earns it the right
way: both senses anchored to the primary papers' own sentences, and the
closing test — did any teacher probabilities cross the boundary, or only
text — gives the reader a question they can actually apply to the next lab
announcement. The MNIST recovered-3s result is a genuine
thing-an-enthusiast-did-not-know. Specific throughout, no filler. Approve.
