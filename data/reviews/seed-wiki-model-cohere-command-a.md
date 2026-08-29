---
job: seed-wiki-model-cohere-command-a
verdict: approve
reasons: []
would-cite: >-
  A developer who has just downloaded Command A's weights for a product
  prototype needs this page before they write any more code: "open weights"
  here means CC-BY-NC plus an acceptable-use policy, so the commercial
  product they are prototyping is the one use the licence forbids outright.
reviewer: r8-opus
date: 2026-08-28
---

Checklist: model entry, two cited sources. Both re-fetched 2026-08-28; feed
and corpus arithmetic recomputed with a script.

- https://huggingface.co/CohereForAI/c4ai-command-a-03-2025 resolves to the
  model card. Licence, verbatim: "This model is governed by a CC-BY-NC,
  requires also adhering to Cohere Lab's Acceptable Use Policy" — the
  `license` fact reproduces both halves, and CC-BY-NC is a NonCommercial
  licence, so "commercial use is prohibited" is a correct reading, not a
  gloss. Parameters, verbatim: "Model Size: 111 billion parameters", matching
  the `parameters` fact. Context "256K" matches.
- https://openrouter.ai/cohere/command-a resolves and gives "released on
  March 13, 2025", matching the `listed_date` fact 2025-03-13 and the feed's
  `created` (2025-03-13T19:32:22Z). The page independently describes it as
  "an open-weights 111B parameter model" with "a 256,000 token context
  window" at "$2.50/M input tokens" — all three agree with the feed row.
- The comparison, recomputed from the 2026-08-28 snapshot: command-a
  intelligence_index 22.8 against deepseek-v4-flash-0731's 51.8, and that
  row's input 0.00000060. Both indices come from the *same* snapshot, so this
  is a contemporaneous measurement, not two readings taken months apart.
  DeepSeek's MIT licence is confirmed on its own model card ("MIT License").
  "listed more than a year later" — 2025-03-13 to 2026-07-31, ~16.5 months.
- "That is not the MIT or Apache terms most of this catalog's other open
  releases carry" — I counted rather than assumed. Nine model entries declare
  a `license` fact; of the eight other than this one, seven are MIT-family or
  Apache (all-minilm, deepseek-v4-flash, muse-glimmer, minimax-m2,
  kimi-k2-5, qwen3, glm-5-1) and one is bespoke (kimi-k3). "Most" is true at
  7 of 8.
- Recorded as a soft spot, not a defect: the competitive comparison is
  against a model listed sixteen months later, and a 29-point index gap
  between a March-2025 model and a July-2026 model is substantially explained
  by the age difference alone. The page does disclose the gap ("listed more
  than a year later"), and it hedges the conclusion ("Nor is the restriction
  *obviously* buying this row competitive standing"), which is what keeps it
  honest — but the disclosure is deployed as an amplifier when it is really a
  confound. A contemporaneous open-weight comparator would carry the point
  better.

The payload is genuine and is the thing an enthusiast would actually want:
not that Command A exists, but that a full-scale 111B release with a 256k
window sits in the open-weight bucket while being the one entry in that
bucket you cannot legally build a business on. That is a fact with
consequences, sourced verbatim to the model card, and it is not derivable
from the catalog row. Approve.
