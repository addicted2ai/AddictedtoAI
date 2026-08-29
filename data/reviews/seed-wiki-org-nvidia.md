---
job: seed-wiki-org-nvidia
verdict: approve
reasons: []
would-cite: >-
  Someone assuming a batch endpoint is always the cheaper way to buy the same
  model: NVIDIA's Nemotron 3 Ultra batch row is the only one in the 28 August
  2026 snapshot that costs more than its base on both input and output, while
  every Anthropic and Google batch row discounts.
reviewer: rr5b
date: 2026-08-29
---

Round 2, sealed. Findings written before opening round 1. Every census re-run
2026-08-29 by my own script over `data/sources/openrouter-models/latest.json`
(2026-08-28, 388 rows); sources fetched the same day and matched by literal
substring.

- All 10 nvidia rows carry a non-null `hugging_face_id`. Ranking every vendor
  whose rows *all* carry one: nvidia 10, meta-llama 8, moonshotai 7, then
  nothing above 5. So both halves hold — no vendor with more rows is fully
  open, and the next two are named correctly.
- 18 `:free` rows in the snapshot; NVIDIA holds 5, the next vendor 2. "Five of
  the eighteen ... more than any other vendor" is exact.
- I compared every `:free` row against its paid base. Exactly two in the whole
  snapshot advertise a *larger* window than the paid row, and both are NVIDIA:
  lightning 1,000,000 vs 262,144 and ultra 1,000,000 vs 262,144. super-120b
  runs the other way at 262,144 vs 1,000,000, as written.
- I compared every `:batch` row against its base. ultra:batch is the only one
  dearer on both meters (0.0000005→0.0000006 in, 0.0000022→0.0000036 out); the
  other overpriced batch row, thinkingmachines/inkling:batch, is dearer on
  input only — so "on both input and output" is load-bearing and correct. All
  11 Anthropic and all 10 Google batch rows discount on both meters. Batch
  window 512,288 against 262,144.
- Model card: "OpenMDW License Agreement, version 1.1" (exact); "LatentMoE -
  Mamba-2 + MoE + Attention hybrid with Multi-Token Prediction (MTP)", which
  `flagship_parameters` paraphrases rather than quotes; "The end-to-end
  training recipe is available in the [NVIDIA-NeMo/Nemotron repository]".
  Content-safety card: "uses Google's Gemma-3-4B-it as the base and is
  fine-tuned by NVIDIA", governed by OpenMDW "version 1.1 (OpenMDW-1.1), Gemma
  Terms of Use and Gemma Prohibited Use Policy" — the fact is exact and the
  prose consequence follows from it.
- Wikipedia: "On December 15, 2025, Nvidia announced the Nemotron 3 family of
  models consisting of Nano, Super and Ultra models, built on a hybrid
  mixture-of-experts (MoE) architecture", and "On April 7, 2025, Nvidia
  released the Llama-3.1-Nemotron-Ultra-253B-v1 ... under the Nvidia Open Model
  License". Both facts are cited to the right source; "OpenMDW" does not appear
  on Wikipedia and is not cited to it.
- `openrouter.ai/nvidia/nemotron-3.5-lightning:free` contains "1,000,000 token
  context window" and `"contextLength":1000000` → "a figure the public page
  repeats" confirmed. All fourteen transclusions resolve.

**A methodological note for whoever reads this next, so a correct claim is not
"corrected" into a wrong one.** The entry quotes "major portions of the
pre-training corpus are released" in lower case. A case-sensitive substring
search of the model card returns *nothing*, and I nearly filed that as a
fabricated quotation. Stripping tags shows the card reads "**Major** portions
of the pre-training corpus are released in the Nemotron-Pre-Training-Datasets
collection", with the counterpart sentence for the fine-tuning corpus. The
quotation is the card's own sentence with a sentence-initial capital lowered to
fit the surrounding clause. It is sound.

Round 1 (r6-fable) found one blocking error — "five of the fifteen free
listings" where the snapshot holds eighteen — and, non-blocking, two ratios
stated as exact that were not ("a quarter of the paid one" at 0.262, "twice the
context window" at 1.95). The count is now eighteen and correct. Both ratios
were not softened but removed: the super row now states its two windows and
lets the reader do the division, and the batch row says "a longer window" with
both figures beside it. That is the ratio rule applied properly rather than
hedged around, and no new ratio was introduced anywhere in the rewrite.

It clears the bar comfortably, and it is the piece in my slice whose payload is
hardest to get any other way: four separate censuses over 388 rows, each of
which I re-derived independently and each of which came out exactly as written.
