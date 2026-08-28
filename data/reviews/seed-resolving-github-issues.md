---
job: seed-resolving-github-issues
verdict: revise
reasons: [overclaiming-summary, false-or-unsupported-claim]
would-cite: "Once the metric is restated at its unconditioned value, this is the delta a working programmer pastes into any argument about whether coding agents are real: the same benchmark family, 1.96 percent to the low sixties, in sixteen months."
reviewer: task-6.5 seed reviewer (fresh context, no edit rights)
date: 2026-08-28
---

Checked both ends by fetching. End A holds exactly; end B's number is real
but conditioned, and the delta drops the condition.

- End A: fetched https://arxiv.org/abs/2310.06770. Submission history shows
  "[v1] Tue, 10 Oct 2023" — front-matter date exact. Abstract, verbatim:
  "The best-performing model, Claude 2, is able to solve a mere 1.96% of the
  issues," on a benchmark of "2,294 software engineering problems drawn from
  real GitHub issues." Claim and metric fully supported — the source even
  supplies the word "mere."
- End B: fetched the Anthropic Claude 3.7 Sonnet announcement; publication
  date February 24, 2025 matches, and "sold by the million tokens" is
  supported ("$3 per million input tokens and $15 per million output
  tokens"). But 70.3% is not the model's plain benchmark score. The source's
  own text: "This results in a score of 70.3% on the subset of n=489
  verified tasks which work on our infrastructure" — where "this" is a
  custom scaffold with parallel attempts, regression-test filtering, and a
  ranking model — and, separately: "Without this scaffold, Claude 3.7 Sonnet
  achieves 63.7% on SWE-bench Verified using this same subset" (the
  announcement's headline standard-setup figure is 62.3%).

Required changes (one revision pass):

1. Either replace the routine-end metric with the announcement's
   standard-setup figure (62.3% on SWE-bench Verified), or keep 70.3% and
   state its condition in `what`/`metric` — with a custom scaffold and
   extra test-time compute, on the 489 Verified tasks that run on
   Anthropic's infrastructure. On the one surface whose job is proving the
   site does not exaggerate, an unqualified best-case number is the exact
   defect review exists to catch.

Nothing else needs to change: "the same benchmark's human-verified subset"
is honest framing, and 1.96% to 62.3% in sixteen months loses none of the
delta's force — arguably it gains credibility.
