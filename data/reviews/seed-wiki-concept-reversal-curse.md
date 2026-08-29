---
job: seed-wiki-concept-reversal-curse
verdict: approve
reasons: []
would-cite: >-
  Someone wielding the reversal curse as proof LLMs cannot do basic logic —
  this page settles that the paper's own abstract grants the in-context
  exception (the forward pass inverts fine) and confines the failure to what
  gradient descent writes into weights, which is exactly why retrieval
  sidesteps it.
reviewer: r4-fable
date: 2026-08-28
---

Checklist: wiki concept entry. Sources fetched 2026-08-28.

- arxiv.org/abs/2309.12288 + ar5iv — all four fact fields verbatim in the
  abstract: "GPT-4 correctly answers questions like the former 79% of the
  time, compared to 33% for the latter" (the former/latter being the Tom
  Cruise / Mary Lee Pfeiffer pair, as the piece frames it); "the likelihood
  of the correct answer ... will not be higher than for a random name"; "The
  Reversal Curse is robust across model sizes and model families and is not
  alleviated by data augmentation"; "if 'A is B' appears in-context, models
  can deduce the reverse relationship". The invented example is the paper's
  own: "Uriah Hawthorne is the composer of Abyssal Melodies" and the failed
  question "Who composed Abyssal Melodies?" both appear verbatim in the
  abstract. "Finetuning GPT-3 and Llama-1" is the abstract's phrase. The
  meta-pattern framing the piece attributes to the paper is the abstract's:
  "models do not generalize a prevalent pattern in their training set: if
  'A is B' occurs, 'B is A' is more likely to occur". Seven authors, so
  "Lukas Berglund and six co-authors" is right; v1 Thu, 21 Sep 2023,
  matching the timeline.
- Not independently verified: the mechanism paragraph (no gradient flows to
  the reversed ordering because it is a different input sequence) is the
  piece's own explanation rather than a quoted one; it is the standard and
  correct account of next-token training, presented as explanation, not as
  citation, so the risk is acceptable.

The payload is the likelihood check — the fact is absent in the reversed
direction, not weakly present — and the usually-dropped exception that
locates the failure in weight-writing rather than reasoning. Both are the
paper's own claims, quoted exactly, and the piece resists every available
overreach in both directions. Approve.
