---
job: seed-wiki-org-nvidia
verdict: revise
reasons: [false-or-unsupported-claim]
would-cite: >-
  Against the claim that free API tiers are always the crippled version:
  NVIDIA's free Ultra and Lightning rows advertise roughly four times the
  paid rows' context windows, and its Ultra batch row is the snapshot's only
  one dearer than its base on both meters — checked against snapshot and
  live pages.
reviewer: r6-fable
date: 2026-08-28
---

Checklist: wiki org entry built on openness, free-row and batch censuses
over the OpenRouter snapshot. Every census re-run by script against
`data/sources/openrouter-models/latest.json` (2026-08-28, 388 rows); sources
fetched 2026-08-28.

Verified by measurement (r6-fable-census.mjs):
- All 10 nvidia rows carry a Hugging Face id; no vendor with more rows is
  fully open (deepseek 14 and minimax 11 are not); the next fully-open
  vendors are meta-llama at 8 and moonshotai at 7 — exact.
- nemotron-3.5-lightning:free ctx 1,000,000 vs paid 262,144;
  ultra:free 1,000,000 vs paid 262,144; super:free 262,144 vs paid
  1,000,000. Directions all as written.
- ultra:batch $0.60/$3.60 vs standard $0.50/$2.20 — in-ratio 1.20,
  out-ratio 1.64 — the only batch row in the snapshot dearer than its base
  on both input and output (the other overpriced batch row,
  thinkingmachines/inkling:batch, is dearer on input only). Every Anthropic
  and Google batch row discounts. Exact.

Verified by fetching:
- huggingface.co/nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16 — OpenMDW
  License Agreement 1.1; "Total Parameters: 550B (55B active)"; "LatentMoE -
  Mamba-2 + MoE + Attention hybrid with Multi-Token Prediction"; "Major
  portions of the pre-training corpus are released" and the fine-tuning
  counterpart; "The end-to-end training recipe is available in the NVIDIA
  Nemotron Developer Repository". All verbatim.
- huggingface.co/nvidia/Nemotron-3.5-Content-Safety — "a fine-tuned version
  of Google's Gemma-3-4B-it", governed by OpenMDW 1.1 plus the Gemma Terms
  of Use and Gemma Prohibited Use Policy, "content-safety moderator for
  inputs to and responses from LLMs and VLMs". Verbatim.
- en.wikipedia.org/wiki/Nvidia — founded April 5, 1993 by Huang,
  Malachowsky, Priem; Santa Clara HQ; the April 7, 2025
  Llama-3.1-Nemotron-Ultra-253B-v1 release under the Nvidia Open Model
  License; Nemotron 3 announced December 15, 2025 (Nano/Super/Ultra, hybrid
  MoE). Confirmed.
- openrouter.ai/nvidia/nemotron-3.5-lightning:free — the public page
  repeats the 1,000,000-token window, as the piece claims.

Required change (the revise):
1. `false-or-unsupported-claim` — "Five of the fifteen free listings in the
   whole snapshot are NVIDIA's." The snapshot holds eighteen `:free` rows,
   not fifteen (counted twice, and the same in previous.json; NVIDIA's five
   is correct). Change "fifteen" to "eighteen" — the finding (five of
   eighteen, the most of any vendor) survives intact.

Tighten while in there (noted, not blocking on their own): "its free row a
quarter of the paid one" is measured 262,144/1,000,000 = 0.262, and "twice
the context window" on the Ultra batch row is measured 512,288/262,144 =
1.95 — both read as exact on a page whose authority is exactness; "roughly"
or the real figures would fix both.

The payload is real and layered — full-corpus openness from the hardware
vendor, a safety model bound by a competitor's use policy, free rows that
outsize paid ones, and the catalog's only two-meter batch surcharge. One
wrong census figure keeps it from publishing as-is. revise
