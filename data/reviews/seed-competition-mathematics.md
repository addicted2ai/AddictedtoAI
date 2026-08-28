---
job: seed-competition-mathematics
verdict: approve
reasons: []
would-cite: "The clean receipt for any argument about capability forecasts aging badly: the benchmark's own authors computed ten-to-the-35 parameters as the impractical cost of 40% accuracy, and an open-weights model posted 97.3% under four years later — quotable at both ends."
reviewer: task-6.5 seed reviewer (fresh context, no edit rights)
date: 2026-08-28
---

Checked both ends by fetching.

- End A: fetched https://ar5iv.labs.arxiv.org/html/2103.03874. Observed
  verbatim: "assuming a log-linear scaling trend, models would need around
  10^35 parameters to achieve 40% accuracy on MATH, which is impractical."
  The results table shows GPT-3 175B at 5.2% overall — the metric line is
  supported. Confirmed the date against the arXiv abstract page's submission
  history: "[v1] Fri, 5 Mar 2021" — the front-matter date is exact.
- End B: fetched https://arxiv.org/html/2501.12948v1. Header shows
  "arXiv:2501.12948v1 [cs.CL] 22 Jan 2025" — date exact. Observed: DeepSeek-R1
  reports 97.3% pass@1 on MATH-500, and "we open-source DeepSeek-R1-Zero,
  DeepSeek-R1, and six dense models (1.5B, 7B, 8B, 14B, 32B, 70B) distilled
  from DeepSeek-R1" — both the score and the "distilled into versions from
  1.5B parameters up" claim are supported verbatim.

Noted and acceptable: MATH-500 is a 500-problem subset drawn from the MATH
test set, and the delta names the subset in its metric rather than claiming
the full benchmark — the honest form.

Quality: this is the strong form at its purest — an in-print, quantified
impossibility claim against a measured result, with open weights making the
routine end undeniable. Top three on the surface.
