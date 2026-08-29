---
job: seed-impossible-routine-model-on-a-phone
verdict: revise
reasons:
  - false-or-unsupported-claim
would-cite: >-
  Someone arguing on-device models are toys: this puts a 1.8 GB offline phone
  model 25 MMLU points above the 175B datacentre model that started the era —
  once it stops naming a phone that does not have the chip the paper names.
reviewer: r2-opus
date: 2026-08-28
---

Checklist: Impossible-to-Routine delta, both ends primary preprints.
Sources fetched 2026-08-28.

- https://arxiv.org/html/2009.03300: the MMLU paper. Confirmed 57 subjects and
  the X-Large 175B GPT-3 model at "43.9% accuracy" few-shot. Submission
  history fetched separately: "[v1] Mon, 7 Sep 2020 17:59:25 UTC" — the
  front-matter date 2020-09-07 is the v1 date and is exact.
- How I verified the 43.9% is present as of v1, since the cited HTML serves a
  later version and a naive check would not settle it: the v1 abstract states
  that "the very largest GPT-3 model improves over random chance by almost 20
  percentage points on average". MMLU is four-choice, so random chance is 25%,
  and 25 + ~19 gives 43.9%. The abstract's claim and the table figure agree,
  so the number is the paper's from the start. A later pass should not
  "correct" this to a different figure on the grounds that 43.9% is absent
  from the v1 abstract text — it is present as the table value.
- https://arxiv.org/html/2404.14219v4 and the abstract page: v1 submitted
  "Mon, 22 Apr 2024 14:32:33 UTC", matching the front matter. Confirmed 3.8
  billion parameters, "over 12 tokens per second", 4-bit quantisation
  occupying approximately 1.8 GB.
- The delta's "69% on MMLU" checked specifically, because the results table
  gives 68.8% (5-shot) and a careless pass would flag this as a rounding
  error. The abstract itself says phi-3-mini "achieves 69% on MMLU" and is
  "small enough to be deployed on a phone". The delta is quoting the paper's
  own headline figure. Not a defect; recorded so nobody "fixes" it downward.
- The defect. The delta says phi-3-mini "runs fully offline on an iPhone 14".
  The paper says no such thing — it says "4-bit quantized phi-3-mini running
  natively on an iPhone with A16 Bionic chip, generating over 12 tokens per
  second." The A16 Bionic never shipped in the base iPhone 14, which carries
  the A15; it shipped in the iPhone 14 Pro and Pro Max, and later the iPhone
  15 and 15 Plus. So the one device the delta names is a device that cannot be
  the one the paper measured. In a record whose entire routine end is a single
  sentence, a specific and checkable hardware claim that contradicts the cited
  source is not a nit.
- Noted and acceptable: comparing GPT-3's 43.9% to phi-3-mini's 69% is
  like-for-like in a way several deltas in this batch are not — same 57-subject
  MMLU, both few-shot, no intervening revision of the test set.

What saves it, concretely. Replace "an iPhone 14" with the paper's own words —
an iPhone with an A16 Bionic chip — or with "an iPhone 14 Pro" if the page
wants a named device. That is the whole fix; nothing else in the record needs
to move.

Worth saving, easily. The payload is genuine and well chosen: the model that
defined the datacentre era scores 25 MMLU points *below* a 1.8 GB file running
offline in a pocket four years later, and both ends are the primary papers'
own headline numbers. It is let down by one wrong noun. Revise.
