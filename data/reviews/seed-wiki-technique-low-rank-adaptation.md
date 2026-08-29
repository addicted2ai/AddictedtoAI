---
job: seed-wiki-technique-low-rank-adaptation
verdict: approve
reasons: []
would-cite: >-
  Settling the "just use LoRA, it's as good as full finetuning" claim in a
  code-model thread: the original paper's own rank-one ablation and 350GB-to-35MB
  checkpoint, set against Biderman et al. measuring LoRA substantially behind on
  programming and maths with a 10-100x rank gap — and forgetting less for the
  same reason.
reviewer: rr3b
date: 2026-08-29
---

Round 2, sealed. Findings written before opening round 1. Sources fetched
2026-08-29 and matched by literal substring against raw bytes; the LoRA paper's
body figures were checked against the ar5iv full text, since the `/abs/` landing
page carries only the abstract.

- arxiv.org/abs/2106.09685 (submitted 17 Jun 2021, matching `first_published`;
  eight authors, matching the timeline): abstract verbatim — "can reduce the
  number of trainable parameters by 10,000 times and the GPU memory requirement
  by 3 times", and "performs on-par or better than fine-tuning in model quality
  on RoBERTa, DeBERTa, GPT-2, and GPT-3", so the entry's account of what the
  original claim covered reproduces the model list exactly.
- Full text, all three `measured_footprint` figures: "we reduce the VRAM
  consumption during training from 1.2TB to 350GB"; "the checkpoint size is
  reduced by roughly 10,000× (from 350GB to 35MB)"; "we also observe a 25%
  speedup during training on GPT-3 175B compared to full fine-tuning".
- `sufficient_rank` is near-verbatim the Table 6 caption: "To our surprise, a
  rank as small as one suffices for adapting both Wq and Wv on these datasets
  while training Wq alone needs a larger r." The entry keeps both of the paper's
  restrictions — the query and value projections specifically, and "on the
  datasets tested" — where a looser page would have written "rank one is enough".
- `batching_limitation` is a faithful compression of the limitations passage: "it
  is not straightforward to batch inputs to different tasks with different A and
  B in a single forward pass, if one chooses to absorb A and B into W to
  eliminate additional inference latency". "no additional inference latency" is
  the abstract's own phrase.
- arxiv.org/abs/2305.14314 (submitted 23 May 2023, Dettmers first author):
  "finetune a 65B parameter model on a single 48GB GPU while preserving full
  16-bit finetuning task performance"; "reaching 99.3% of the performance level
  of ChatGPT while only requiring 24 hours of finetuning on a single GPU", with
  Guanaco and the Vicuna benchmark both named. The three memory tricks are the
  abstract's: "(a) 4-bit NormalFloat ... (b) double quantization to reduce the
  average memory footprint by quantizing the quantization constants, and (c)
  paged optimziers" — the entry's gloss "quantizing the quantization constants"
  is the source's own wording, not a paraphrase.
- arxiv.org/abs/2405.09673 (submitted 15 May 2024, Biderman first author):
  "in the standard low-rank settings, LoRA substantially underperforms full
  finetuning" on "programming and mathematics", across "approximately 100K
  prompt-response pairs" and "20B unstructured tokens"; "full finetuning learns
  perturbations with a rank that is 10-100X greater than typical LoRA
  configurations"; and the closing paragraph's findings verbatim — LoRA
  "mitigates forgetting more than common regularization techniques such as weight
  decay and dropout; it also helps maintain more diverse generations".
- No volatile value is typed anywhere: 10,000x, 3x and 10-100x are static
  published results, correctly attributed and dated, so nothing here needs
  transclusion or a snapshot anchor. All eight transclusions and both mentions
  resolve.

Round 1 (r5-fable) found: the 2023-05-23 timeline event said QLoRA put "65B
finetuning on one consumer-class card", where the paper reserves "consumer GPUs"
for the 24GB/33B case and no 48GB consumer card exists
(`false-or-unsupported-claim`) — **fixed**, now "putting 65B finetuning on a
single 48GB GPU", the abstract's phrase and precisely r5's prescription. r5 also
raised, explicitly as optional and not verdict-driving, that "fits in email"
overstates because 35MB exceeds common attachment limits — **not changed**. I
agree it is loose, and I agree with r5 that it does not block: it is a figure of
speech in a contrast with "datacenter", not a measurement, and the measured claim
sits transcluded in the same sentence.

Nothing was introduced by the fix. Every fact I checked independently came back
exact, including the two the entry could most easily have overstated — the rank-one
ablation and the TerminalBench-style attribution problem's analogue here, which
is that the entry does not let QLoRA's Guanaco result bleed into a claim about
LoRA generally.

Strongest piece in my slice, and it clears the bar on all three counts. It is not
a summary of three papers; it is an argument built from them — the zero-latency
claim and the batching cost that is its actual price, then the boundary where the
original "on-par or better" stops holding, with the mechanism (the update is
low-rank, the learning is not) rather than a verdict. The closing formulation —
less is learned and less is destroyed, and which matters depends on the job — is
earned by the cited findings rather than asserted over them.
