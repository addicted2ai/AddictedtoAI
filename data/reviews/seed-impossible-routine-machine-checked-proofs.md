---
job: seed-impossible-routine-machine-checked-proofs
verdict: revise
reasons:
  - overclaiming-summary
would-cite: >-
  Someone arguing formal theorem proving went from 29% to 89% of miniF2F in
  under four years: the ends are real but the page currently hides that the
  second number used a thousand times the sampling budget of the first.
reviewer: r2-opus
date: 2026-08-28
---

Checklist: Impossible-to-Routine delta, both ends primary preprints.
Sources fetched 2026-08-28.

- https://arxiv.org/html/2109.00110: confirmed. miniF2F is 488 formalised
  olympiad-level statements drawn from AIME, AMC, IMO and MATH. Observed
  verbatim the strongest baseline result: "a Pass@8 of 29.2% on miniF2F-test",
  from GPT-f/PACT in Lean. The delta's prover name and pass setting are the
  paper's. Submission history checked directly because the cited HTML serves a
  later version: "[v1] Tue, 31 Aug 2021 23:21:12 UTC", "[v2] Mon, 28 Feb 2022"
  — the front-matter date 2021-08-31 is the v1 date and is correct.
- https://arxiv.org/abs/2504.21801: DeepSeek-Prover-V2 confirmed open-source
  in the abstract, 88.9% on miniF2F-test, v1 submitted April 30, 2025 —
  matching the front matter.
- The defect, found by fetching the HTML for the sampling setting the abstract
  page does not foreground: https://arxiv.org/html/2504.21801v1 gives the
  88.9% as **DeepSeek-Prover-V2-671B at Pass@8192**, in CoT generation mode,
  using Lean 4.9.0. End A is Pass@8. The delta's metric fields put "29.2% of
  test problems (pass@8)" against "88.9% of test problems" — disclosing the
  budget on the end where it is small and omitting it on the end where it is
  1,024 times larger. Sampling budget is the single largest lever on a
  pass-rate in theorem proving, so an undisclosed 8-to-8192 jump is not a
  detail; it is a substantial part of the number the reader is being shown.
- Second, smaller mismatch: "the same miniF2F test set" is doing more work
  than it can carry. End A is Lean 3 via GPT-f/PACT; end B is Lean 4.9.0. The
  problem statements are the same 244, but the Lean 4 port is a
  re-formalisation, not the identical artifact, and "the same" invites a
  precision the sources do not support.
- Not independently verified: whether DeepSeek-Prover-V2 reports a low-budget
  figure comparable to Pass@8. I did not find one and am deliberately not
  supplying a substitute number — a replacement value I have not fetched would
  be a hypothesis, not evidence, and the fix below does not require one.

What saves it, concretely. State the sampling budget on the routine end the
way the impossible end already does: 88.9% at Pass@8192, DeepSeek-Prover-V2-671B,
Lean 4.9.0. If the paper reports a comparable small-budget pass rate, quoting
that alongside would make the span like-for-like and is the stronger fix. And
soften "the same miniF2F test set" to name the Lean 4 port.

Worth saving. Even at matched framing the shift is dramatic, and the delta
picks a genuinely good impossible end — a benchmark's own debut baseline, in
print, is the hardest kind of impossibility claim to argue with. The problem
is one omitted parenthetical doing a lot of unearned work. Revise.
