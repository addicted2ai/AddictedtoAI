---
job: seed-wiki-technique-low-rank-adaptation
verdict: revise
reasons:
  - false-or-unsupported-claim
would-cite: >-
  The person in the eternal "is LoRA just as good as full finetuning?" thread
  gets the study that settles it both ways: Biderman et al.'s own words —
  "substantially underperforms" on code and maths in standard low-rank
  settings, a 10-100x rank gap — next to the same paper's finding that LoRA
  forgets less than weight decay or dropout.
reviewer: r5-fable
date: 2026-08-28
---

Checklist: wiki technique entry. Sources fetched 2026-08-28.

- arxiv.org/abs/2106.09685 (v1: 17 Jun 2021, matching first_published):
  abstract verbatim — "reduce the number of trainable parameters by 10,000
  times and the GPU memory requirement by 3 times". Body (via ar5iv) verbatim:
  "we reduce the VRAM consumption during training from 1.2TB to 350GB", "the
  checkpoint size is reduced by roughly 10,000x (from 350GB to 35MB)", "a 25%
  speedup during training on GPT-3 175B", "a rank as small as one suffices for
  adapting both Wq and Wv on these datasets", and the limitations sentence "it
  is not straightforward to batch inputs to different tasks with different A
  and B in a single forward pass, if one chooses to absorb A and B into W to
  eliminate additional inference latency". All five facts sourced here are
  exact. The abstract does claim "on-par or better than fine-tuning ... on
  RoBERTa, DeBERTa, GPT-2, and GPT-3", so the piece's framing of what the
  original claim covered is fair.
- arxiv.org/abs/2305.14314 (v1: 23 May 2023): "finetune a 65B parameter model
  on a single 48GB GPU while preserving full 16-bit finetuning task
  performance"; "reaching 99.3% of the performance level of ChatGPT while only
  requiring 24 hours of finetuning on a single GPU"; NF4, double quantization,
  paged optimizers all named in the abstract. Facts exact.
- arxiv.org/abs/2405.09673 (v1: 15 May 2024, first author Biderman): the two
  flagged claims are verbatim in the abstract — "in the standard low-rank
  settings, LoRA substantially underperforms full finetuning" on programming
  and mathematics, regimes "instruction finetuning (approximately 100K
  prompt-response pairs) and continued pretraining (20B unstructured tokens)",
  and "full finetuning learns perturbations with a rank that is 10-100X
  greater than typical LoRA configurations". The forgetting/regularization/
  diversity findings in the closing paragraph are also abstract-verbatim.

The defect: the timeline event for 2023-05-23 says QLoRA put "65B finetuning
on one consumer-class card". The cited paper says the opposite — its own
Section 9 reads "using a single professional GPU over 24 hours we achieve
99.3% with our largest model", and it reserves "consumer GPUs" for the
24GB/33B case ("Guanaco 33B can be trained on 24 GB consumer GPUs in less
than 12 hours"). No 48GB consumer card exists. Fetched and quoted from the
ar5iv full text. Fix: replace "one consumer-class card" with "a single 48GB
GPU" (the abstract's phrase) and the entry is clean. Optional tightening, not
verdict-driving: "fits in email" overstates — 35MB exceeds common attachment
limits; "trivially small" is the true claim.

Otherwise this is the strongest kind of entry the site can run: the original
paper's claim, the boundary where it fails, and the mechanism, all in the
papers' own words. The regularizer framing in the last paragraph is earned by
the cited findings. Revise — one phrase, then publish.
