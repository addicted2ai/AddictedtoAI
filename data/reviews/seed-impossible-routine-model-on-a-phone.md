---
job: seed-impossible-routine-model-on-a-phone
verdict: approve
reasons: []
would-cite: >-
  Someone dismissing on-device models as toys gets both primary papers'
  headline numbers on one page: the 175B datacentre GPT-3 that opened the era
  at 43.9% MMLU, and a 1.8 GB file running offline in a pocket at 69% four
  years later.
reviewer: rr4
date: 2026-08-28
---

Round 2, sealed. Findings written before opening round 1. Sources fetched
2026-08-28, confirmed by literal substring match against the saved bytes.

- https://arxiv.org/html/2009.03300: "the 175 billion parameter GPT-3 model
  reaches a much higher 43.9% accuracy" — verbatim. Abs page: "[v1] Mon, 7
  Sep 2020", matching the impossible end's date.
- https://arxiv.org/html/2404.14219v4: the delta's quoted sentence is present
  verbatim — "We tested the quantized model by deploying phi-3-mini on iPhone
  14 with A16 Bionic chip running natively on-device and fully offline
  achieving more than 12 tokens per second" (the HTML doubles the "12" via
  math markup; an artifact, not a discrepancy). Also verbatim: "quantized to
  4-bits so that it only occupies ≈1.8GB", abstract "achieves 69% on MMLU",
  results table "MMLU (5-Shot) … 68.8", and the figure caption "4-bit
  quantized phi-3-mini running natively on an iPhone with A16 Bionic chip" —
  which confirms the delta's note that the caption drops the model number.
  Abs page: "[v1] Mon, 22 Apr 2024", matching the routine end's date.
- https://en.wikipedia.org/wiki/IPhone_14: "The iPhone 14 and 14 Plus use …
  the A15 Bionic, while the iPhone 14 Pro and 14 Pro Max have a newer A16
  Bionic" — the delta's paper-inconsistency note is byte-supported.

Round 1 (r2-opus) found: the delta names "an iPhone 14", "a device that
cannot be the one the paper measured", asserting "The paper says no such
thing — it says '… an iPhone with A16 Bionic chip'" — **that finding was
wrong**. Round 1 quoted the figure caption as if it were the paper's only
statement; the paper's body sentence names "iPhone 14 with A16 Bionic chip"
explicitly, verified against the fetched v4 bytes before I opened the round-1
record. The contradiction is the paper's own, not the delta's. The revision
resolved it the right way: it quotes the paper verbatim, names the device "as
published", and documents the source's internal inconsistency so nobody
quietly "corrects" it — exactly the disclosure this file's brief asks reviews
themselves to make.

Clears the bar as it stands: a like-for-like 57-subject MMLU comparison, both
ends primary, the four-year gap specific and startling, and the one wrinkle in
the source handled honestly rather than paved over. Publish.
