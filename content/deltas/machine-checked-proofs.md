---
title: "Machine-checked proofs"
capability: "Writing formal, machine-verifiable proofs for olympiad-level mathematics."
impossible:
  date: "2021-08-31"
  what: "The miniF2F benchmark debuts and its strongest baseline, a GPT-f/PACT prover, closes 29.2% of the olympiad-level test problems in Lean."
  source_url: "https://arxiv.org/html/2109.00110"
  metric: "29.2% of test problems at Pass@8; 24.6% at Pass@1"
routine:
  date: "2025-04-30"
  what: "DeepSeek-Prover-V2-671B, released as open weights, proves 88.9% of the miniF2F test set at Pass@8192 — and 61.9% of it at Pass@1."
  source_url: "https://arxiv.org/abs/2504.21801"
  metric: "88.9% at Pass@8192; 61.9% at Pass@1"
mentions:
  - org/deepseek
---

Sampling budget is the largest single lever on a pass rate in theorem
proving, so both ends state theirs. The headline 88.9% is Pass@8192,
1,024 times the impossible end's Pass@8, and the two are not a matched
comparison. Both papers happen to report Pass@1 as well, so the matched
one can be read straight off the ends: 24.6% in 2021 against 61.9% in
2025, on the same sampling budget. The span survives either reading,
which is the point of stating both.

The two ends are not scored on an identical artifact, either. End A is
GPT-f/PACT in Lean; end B is Lean 4.9.0. The 244 test statements are the
same problems, but the Lean 4 version is a re-formalisation rather than
the same file.
