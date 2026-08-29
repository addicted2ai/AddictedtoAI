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

## Recheck 2026-08-29 (addictedtoai-flh) — holds, verdict unchanged

Both ends re-fetched and matched literally.

**End A** — `ar5iv.labs.arxiv.org/html/2103.03874` (248,343 B) carries
verbatim: "assuming a log-linear scaling trend, models would need around
10^{35} parameters to achieve 40\% accuracy on MATH, which is impractical."
Note for any later pass: **searching for `40% accuracy` returns ABSENT** —
the source LaTeX-escapes it as `40\%`. That is a false absence, not a
missing claim.

The `5.2%` metric needed care, because the first `5.2` in the document is a
GPT-2 0.1B Prealgebra cell. The correct row is Table 2's last line:
"GPT-3 175B* 7.7 6.0 4.4 4.7 3.1 4.4 4.0 **5.2**" — seven subject columns
then Average, so 5.2 is GPT-3 175B's overall MATH accuracy. The `*` marks it
a few-shot model, which the delta does not contradict. Date confirmed on
abs/2103.03874: "[Submitted on 5 Mar 2021 ( v1 )".

**End B** — `arxiv.org/html/2501.12948v1` (225,089 B): "On MATH-500, it
attains an impressive score of 97.3%", and the results table row reads
"MATH-500 (Pass@1) 78.3 74.6 90.2 90.0 96.4 **97.3**" — so `pass@1` in the
metric line is the paper's own qualifier, not the entry's addition. Open
weights: "we open-source DeepSeek-R1-Zero, DeepSeek-R1, and six dense models
(1.5B, 7B, 8B, 14B, 32B, 70B) distilled from DeepSeek-R1". Header:
"arXiv:2501.12948v1 [cs.CL] 22 Jan 2025".

Both dates, both metrics and both `what` sentences hold to the byte.
