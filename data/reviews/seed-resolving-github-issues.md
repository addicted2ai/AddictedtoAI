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

## Recheck 2026-08-29 (addictedtoai-flh) — holds, no change

Both ends re-verified independently, including re-reading the chart image
rather than trusting the caveat above.

- End A, arxiv.org/abs/2310.06770 (43,179 bytes): "[Submitted on 10 Oct
  2023"; "an evaluation framework consisting of $2,294$ software engineering
  problems drawn from real GitHub issues"; and the 1.96% claim. **The
  false-absence trap fires here and is worth recording**: the abstract is
  LaTeX-escaped, so the string "1.96%" does **not** appear — the page reads
  "The best-performing model, Claude 2, is able to solve a mere `$1.96$%` of
  the issues." A naive check would call this unsupported. It is exact,
  including the source's own word "mere". The row counts are escaped the
  same way (`$2,294$`, `$12$`).
- End B, anthropic.com/news/claude-3-7-sonnet (183,388 bytes): re-confirmed
  that "62.3" is absent from the page's text in every normalisation I tried
  (raw, entity-decoded, tag-stripped, case-folded). The running text carries
  only the two conditioned figures, both matched literally: "This results in
  a score of 70.3% on the subset of n=489 verified tasks which work on our
  infrastructure" and "Without this scaffold, Claude 3.7 Sonnet achieves
  63.7% on SWE-bench Verified using this same subset."
- **Chart image re-read, not taken on trust.** The asset hash the earlier
  record names is still referenced in the page source
  (`08bba4487fb5ac1ba52540ee656d7e4da10ca1be-1920x1145.png`, matched at
  offset 21,673 in a `srcSet`). Downloaded it (57,253 bytes) and looked at
  it: a bar chart titled "Software engineering / SWE-bench verified", y-axis
  ACCURACY. The Claude 3.7 Sonnet bar is labelled **62.3%** with a lighter
  extension above it labelled **70.3% with custom scaffold**; the other bars
  are Claude 3.5 Sonnet (new) 49.0%, OpenAI o1 48.9%, OpenAI o3-mini (high)
  49.3%, DeepSeek R1 49.2%. The delta's 62.3% is the announcement's own
  unconditioned headline figure, exactly as the delta presents it.

The caveat above is correct and is hereby confirmed a second time by a
different pass: **do not refute this figure with a text search.** It lives
only in the image.

No claim in this delta required correction.
