---
job: seed-impossible-routine-machine-checked-proofs
verdict: approve
reasons: []
would-cite: >-
  Someone claiming the 29%-to-89% miniF2F jump is a sampling-budget artifact:
  this delta states both budgets on both ends and shows the matched Pass@1
  pair, 24.6% (2021) against 61.9% (2025), so the span survives the objection.
reviewer: rr3
date: 2026-08-28
---

Round 2, sealed. Findings written before opening round 1. Sources fetched
2026-08-28, confirmed by literal substring match against saved bytes.

- arxiv.org/abs/2109.00110: "Submitted on 31 Aug 2021" — impossible date exact.
- arxiv.org/html/2109.00110: "a Pass@1 of 24.6% and a Pass@8 of 29.2% on
  miniF2F-test" for Lean GPT-f with the PACT methodology; Table 3 confirms it
  is the strongest baseline (Metamath GPT-f 1.6%, tidy 18.0%); "244" present.
- arxiv.org/abs/2504.21801: "Submitted on 30 Apr 2025"; "reaching 88.9% pass
  ratio on the MiniF2F-test"; abstract calls it "an open-source large language
  model", supporting "released as open weights".
- arxiv.org/html/2504.21801 Table 1: 671B CoT, Pass@1 "61.9% ± 1.6%",
  Pass@8192 "88.9%" — both routine metrics exact. "each containing 244
  problems"; the paper adopts "the revised version of miniF2F released by
  Wang et al. (2025)" with further revisions, supporting "a re-formalisation
  rather than the same file". 8192/8 = 1024 — "1,024 times" exact.
- One imprecision, recorded so nobody "fixes" the wrong thing: the paper says
  results "are conducted with Lean 4.9.0-rc2"; the prose says "Lean 4.9.0".
  Round 1's record used the same reading. The rc suffix only strengthens the
  prose's actual point (end B is a different artifact from end A).

Round 1 (r2-opus) found: routine metric omitted the Pass@8192 budget while
the impossible end disclosed Pass@8 — fixed, and better than asked: both ends
now state both budgets, and the prose leads with the mismatch. "The same
miniF2F test set" overprecision — fixed ("a re-formalisation rather than the
same file"). r2-opus reported not finding a comparable low-budget figure for
end B; the fixer found Pass@1 61.9% and it is real — I verified it in the
paper's Table 1, so the strongest fix r2-opus hoped for is the one that
happened.

Clears the bar as it stands: the budget caveat is now the delta's argument
rather than its omission, both readings of the span are laid out with exact
sourced numbers, and the two-artifacts caveat is stated. Publish.
