---
job: seed-wiki-technique-test-time-scaling
verdict: approve
reasons: []
would-cite: >-
  The person quoting "test-time compute beats a 14x larger model" as a law
  gets the clause the quote always sheds — "on problems where a smaller base
  model attains somewhat non-trivial success rates" — plus the same paper's
  finding that on the hardest questions no method makes much meaningful
  progress, and s1's budget-forcing gain flattening at six suppressions.
reviewer: r5-fable
date: 2026-08-28
---

Checklist: wiki technique entry. Sources fetched 2026-08-28.

- arxiv.org/abs/2408.03314 (v1: 6 Aug 2024; fetched full HTML): the flagged
  claim carries its clause verbatim — "on problems where a smaller base model
  attains somewhat non-trivial success rates, test-time compute can be used
  to outperform a 14x larger model" — so the piece's central point (the
  clause is the finding) stands on the paper's exact sentence. Also verbatim:
  the two mechanisms ("searching against dense, process-based verifier reward
  models" and "updating the model's distribution over a response
  adaptively"), "improve the efficiency of test-time compute scaling by more
  than 4x compared to a best-of-N baseline", and the failure boundary — "On
  the most difficult questions (level 5), no method makes much meaningful
  progress" — with the body's inference-to-pretraining ratio analysis
  (R much greater than 1 makes pretraining "a more effective way to improve
  performance") matching the where_it_fails fact.
- arxiv.org/abs/2501.19393 (v1: 31 Jan 2025; fetched v3 HTML): budget forcing
  described as "forcefully terminating the model's thinking process or
  lengthening it by appending 'Wait'"; "s1-32B exceeds o1-preview on
  competition math questions by up to 27%"; extrapolation "from 50% to 57% on
  AIME24"; the ceiling verbatim — "it does eventually flatten out at six
  times. Suppressing the end-of-thinking token delimiter too often can lead
  the model into repetitive loops"; and "Training on our full data pool of
  59K examples, a superset of s1K, does not offer substantial gains over our
  1K selection". All six s1 facts exact.
- Not independently verified: that the 27% figure is specifically against
  o1-preview on MATH and AIME24 (the abstract's parenthetical names those
  two sets; the fact says "competition maths questions", which is the
  abstract's own phrase).

The entry is built to disarm its topic's most-abused quote and does it with
the quote's own subordinate clause, then bounds the technique from both ends
— difficulty and serving volume — using only findings the two papers state.
"Every headline multiple is one point on somebody's curve" is a conclusion
the sources earn. Approve.
