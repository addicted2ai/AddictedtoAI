---
job: seed-learn-what-safety-training-changes
verdict: approve
reasons: []
would-cite: >-
  Someone arguing that an open-weights release is fine because refusals were
  trained in — this page settles why refusal is a locatable direction that a
  cheap activation edit removes, so open weights and guaranteed refusals are
  in tension by construction, not by negligence.
reviewer: r7-fable
date: 2026-08-28
---

Checklist: education page (advanced). Sources fetched 2026-08-28.

- https://arxiv.org/abs/2406.11717: fetched; title matches verbatim, abstract
  says "13 popular open-source chat models up to 72B parameters", "erasing
  this direction from the model's residual stream activations prevents it
  from refusing harmful instructions, while adding this direction elicits
  refusal on even harmless instructions", and the paper "mechanistically
  analyze[s] how adversarial suffixes suppress propagation of the
  refusal-mediating direction". All three page claims are the paper's own.
- https://arxiv.org/abs/2406.05946: fetched; abstract: alignment "adapts a
  model's generative distribution primarily over only its very first few
  output tokens" and explains "adversarial suffix attacks, prefilling
  attacks, decoding parameter attacks, and fine-tuning attacks" — the page's
  "one technique approached from four directions" framing is faithful.
- https://arxiv.org/abs/2310.03693: fetched; "only 10 such examples at a cost
  of less than $0.20" supports "a handful of adversarial examples... at a
  cost the authors report in cents"; "benign and commonly used datasets can
  also inadvertently degrade the safety alignment... though to a lesser
  extent" supports "less severely, and with nobody trying".
- No perishable literals: read every line — no model names, vendors, prices
  or versions; every number is a dated paper finding.
- Prerequisite rung: "residual stream" is the one term not taught below, but
  the page glosses it inline as a direction in "the activations", which
  how-a-language-model-works (transitive prerequisite) does introduce; the
  no-token-revision fact it leans on is taught there explicitly. Acceptable.
- Not independently verified: "most users never leave the distribution where
  the training holds" — a plausibility claim, clearly framed as one.

Clears the bar easily. The payload is the three-way split of "cannot" at the
end — classifier blocked it / weights make it unlikely / capability absent —
plus the structural reading of the single-direction result. The
over-refusal/under-refusal pair ("it never had a policy") is the mechanism a
daily follower has seen argued and never seen explained. The strongest of the
six learn pages in this slice. Approve.
