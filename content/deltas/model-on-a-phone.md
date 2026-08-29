---
title: "A capable model in a phone"
capability: "Running a genuinely capable language model on a phone, offline."
impossible:
  date: "2020-09-07"
  what: "GPT-3, served from a datacenter at 175 billion parameters, scores 43.9% on the new 57-subject MMLU exam."
  source_url: "https://arxiv.org/html/2009.03300"
  metric: "175B parameters, 43.9% MMLU"
routine:
  date: "2024-04-22"
  what: "Phi-3-mini, quantized to 1.8 GB, runs fully offline on an iPhone 14 at more than 12 tokens per second and scores 69% on MMLU."
  source_url: "https://arxiv.org/html/2404.14219v4"
  metric: "3.8B parameters on a phone, 69% MMLU"
mentions:
  - technique/quantization
---

The routine end quotes the paper directly: "We tested the quantized model
by deploying phi-3-mini on iPhone 14 with A16 Bionic chip running natively
on-device and fully offline achieving more than 12 tokens per second."

One inconsistency inside that sentence belongs to the paper rather than to
this page, and is recorded here so it is not mistaken for a transcription
error and quietly "corrected". Apple shipped the A16 Bionic in the iPhone
14 Pro and Pro Max; the base iPhone 14 carries the A15. The paper's own
figure caption drops the model number and says only "an iPhone with A16
Bionic chip". The device is named above as published.

The 69% is likewise the paper's headline figure, stated in its abstract;
the results table gives 68.8% at 5-shot.
