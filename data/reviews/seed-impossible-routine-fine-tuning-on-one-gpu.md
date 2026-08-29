---
job: seed-impossible-routine-fine-tuning-on-one-gpu
verdict: approve
reasons: []
would-cite: >-
  Someone told that customising a frontier-scale model requires a datacentre:
  the LoRA authors put full GPT-3 fine-tuning in print at 1.2 TB of VRAM, and
  QLoRA put a 65B fine-tune on one 48 GB card in 24 hours two years later.
reviewer: r2-opus
date: 2026-08-28
---

Checklist: Impossible-to-Routine delta, both ends primary preprints.
Sources fetched 2026-08-28.

- https://arxiv.org/html/2106.09685v2: observed verbatim "On GPT-3 175B, we
  reduce the VRAM consumption during training from 1.2TB to 350GB" — the
  1.2 TB figure is the paper's own measurement of the full fine-tuning
  baseline, in that unit, meaning that thing. The second half of the delta's
  sentence is also verbatim: "deploying independent instances of fine-tuned
  models, each with 175B parameters, is prohibitively expensive." Attribution
  to Microsoft researchers is correct (Hu et al., Microsoft). Submission
  history: "[v1] Thu, 17 Jun 2021 17:37:18 UTC" — front-matter date exact.
- https://arxiv.org/abs/2305.14314: abstract confirms all four numbers — a 65B
  parameter model, a single 48 GB GPU, 24 hours of finetuning, and 99.3% of
  ChatGPT's performance level on the Vicuna benchmark. Submission history
  gives v1 23 May 2023, matching the front-matter date.
- Noted and acceptable: the ends differ in model scale — 175B full fine-tuning
  at end A, a 65B QLoRA fine-tune at end B. The delta's capability line says
  "a large language model", not "GPT-3", and it nowhere claims 175B fits on
  one card, so the framing does not outrun the evidence. Recording it here
  because it is the one place this delta could be misread.
- Caveat recorded rather than charged as a defect: the Vicuna benchmark is 80
  prompts judged by GPT-4, a weak instrument. The delta names the benchmark
  instead of saying "99.3% of ChatGPT", which is the disclosure that makes
  reporting the paper's headline legitimate.

Clears the bar. The payload is the 1.2 TB number itself — enthusiasts know
LoRA made fine-tuning cheap, far fewer can quote what the authors measured the
uncompressed baseline at, and having it in print at both ends is what makes
this linkable rather than merely true. Approve.
