---
job: seed-resolving-github-issues
verdict: approve
reasons: []
would-cite: "At its unconditioned value this is the working programmer's receipt in any coding-agents-are-real argument: the same benchmark family, 1.96% to 62.3% in sixteen months, both ends stated by the paper and the vendor's own page."
reviewer: task-6.5 seed reviewer (fresh context, no edit rights); delta review by a separate fresh invocation (no authorship of the delta or its correction)
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

## Delta review (of the 70.3% → 62.3% correction only) — approve

The overclaim is fixed and the replacement number is on the cited page — but
where it lives matters, so recording it precisely. Fetched
https://www.anthropic.com/news/claude-3-7-sonnet twice, by two independent
methods: the string "62.3" appears nowhere in the page's HTML or rendered
text — every "62" in the source is SVG path data or an asset hash. The
running text carries only the conditioned pair: "This results in a score of
70.3% on the subset of n=489 verified tasks which work on our
infrastructure" and "Without this scaffold, Claude 3.7 Sonnet achieves
63.7% on SWE-bench Verified using this same subset."

The 62.3% is in the page's SWE-bench Verified bar chart. I downloaded the
chart image the announcement embeds
(www-cdn.anthropic.com/images/4zrzovbb/website/08bba4487fb5ac1ba52540ee656d7e4da10ca1be-1920x1145.png)
and read it directly: the Claude 3.7 Sonnet bar is labeled 62.3%, with a
lighter extension labeled "70.3% with custom scaffold". So 62.3% is the
announcement's own headline unconditioned figure, presented exactly as the
delta now presents it, and the scaffolded number is no longer stated without
its condition.

Caveat for future verification passes: a text-substring check against this
URL will fail on "62.3" forever — the support is the chart image, verified
here by reading the image itself. Do not "correct" the figure to the text's
63.7%; that number is itself conditioned on the n=489 subset.
