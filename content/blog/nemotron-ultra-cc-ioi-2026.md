---
title: "NVIDIA's IOI 2026 run scored 535.4 to the top human's 498.27, and the paper lists its own limits"
date: "2026-09-05"
anchor:
  url: "https://arxiv.org/abs/2609.02849v1"
  date: "2026-09-02"
covers:
  - key: "openrouter-models|31886658dc9b9e56|a6c7f5e5e6f3c575|nvidia/nemotron-3-ultra-550b-a55b:batch|$retirement"
    date: "2026-09-03"
mentions:
  - org/nvidia
  - org/z-ai
  - org/deepseek
  - model/nvidia-nemotron-3-ultra-550b-a55b
  - model/nvidia-nemotron-3-ultra-550b-a55b-batch
  - model/z-ai-glm-5-2
---

NVIDIA posted a paper to arXiv on 2 September 2026 reporting that a
competition-tuned model it calls Nemotron-3-Ultra-CC scored 535.4 out of 600 on
the IOI 2026 problem set. The highest-scoring human at that olympiad finished on
498.27.

A footnote in the paper's introduction says what the score is not:

> Our system was not an official IOI contestant and the run was not supervised
> by IOI. Therefore, its score was not included in the official rankings and the
> evaluation is reported as an unofficial, unsupervised benchmark.

Result and disclaimer come from the same five authors. The disclaimer is the
half that falls off as the number travels.

## The two comparison numbers belong to the IOI, not to NVIDIA

Vendor benchmarks usually supply both sides of the comparison. This one does
not, and it is checkable in about a minute.

The IOI publishes its own results at `stats.ioinformatics.org`. Read on
5 September 2026, the 2026 table lists 379 contestants. First place is Qiwen Xu
of China on 498.27, or 83.05%. The lowest of the 31 gold medals is 361.12. The
highest score that did not take gold is 358.76, a silver.

Both figures the paper compares itself against are exactly those: 498.27 and
361.12. The score being compared is NVIDIA's. The bar it is compared to is not.

## The contest conditions are specific, and the IOI's rules mostly match the paper's account

"Same constraints as human contestants" is the phrase doing the work in every
summary of this result, so it is worth knowing what it meant. From the paper:
"internet access was prohibited, local code execution was permitted, and each
problem allowed up to 50 submissions with one submission allowed per minute".

The IOI 2026 contest rules, published by the organising committee, say
"Contestants may perform at most 50 submissions for each task", forbid
contestants from reaching "any machine on the network or the Internet" beyond
the contest system, and set the shape of the competition: "There will be two
competition days. On each day contestants will be given three tasks to complete
in 5 hours."

One detail sits in the rules and not in the paper's summary of them. The full
rule reads: "Contestants may submit a solution to each task at most once per
minute. This restriction does not apply in the last 15 minutes of the contest
round." The paper does not mention the exception, and does not say whether its
run used it.

## The run happened once, on 760 GB300s

The paper puts a number on its own compute that its abstract does not: "During
the live inference deployment, we used a peak allocation of up to 760 NVIDIA
GB300 GPUs."

Its Limitations section draws the conclusion rather than leaving it to a critic.
The live result, the authors write, "should therefore be interpreted as a
system-level comparison under the same time and submission limits, rather than
an equal-resource comparison with human contestants."

It also happened exactly once: "This result is obtained from a single
prospective run using the competition-specific adaptations described above."
The authors did go back afterwards and run their general pipeline on the same
problems five times, which is the closest thing to an error bar anyone has. That
mean is 521.72, with an observed range of 495.0 to 545.8. The live 535.4 sits
13.68 points above the mean and inside the range.

Worth reading that range slowly. Its low end, 495.0, is below Qiwen Xu's 498.27.
The general pipeline's five runs straddle the top human score rather than sitting
clear of it, so for that pipeline the margin is inside its own run-to-run spread.
The competition system, run once, has no spread to compare.

## The year the record was set was a year human scores fell

Here is the context neither the paper nor the coverage assembles, from the IOI's
own two results pages.

| | IOI 2025 | IOI 2026 |
|---|---|---|
| Top human score | 591.23 (Hengxi Liu, China) | 498.27 (Qiwen Xu, China) |
| Gold threshold | 438.3 | 361.12 |
| Contestants | 334 | 379 |

The top score fell 92.96 points between the two years and the gold threshold fell
77.18. The paper itself notes that IOI medal thresholds "were determined from the
final score distribution", so a threshold that low describes a problem set that
the field as a whole scored badly on.

Against that, the paper's own general pipeline scored 502.0 on IOI 2025. Hengxi
Liu scored 591.23 on the same problems. Nothing in this paper has reached that
number on any problem set.

Which is why the authors' claim is worded the way it is: first to outscore the
highest-scoring human "on an IOI problem set". That is true, it is narrower than
"an AI beat the best competitive programmer", and the narrowness is the accurate
part.

## Contamination is the one objection this run does answer

The usual first response to a benchmark result is that the model had seen the
questions. Here it could not have. "IOI 2026 is a strictly prospective evaluation
because our system was run before the problems were publicly released." The
system was run during the official competition, on problems that were not yet
public.

The training side matches: the authors say they exclude "all IOI 2025, ICPC 2025,
and LiveCodeBench Pro problems from the SFT and RL data" and deduplicate against
them. Prospective evaluation is expensive and rare, and it settles a question
that retrospective benchmarks argue about for years.

## The system that beat the top human was taught by GLM-5.2

The competition model was fine-tuned on traces from someone else's model. The
authors tested GLM-5.2 and DeepSeek-V4-Flash as teachers, scoring them on IOI
2025: GLM-5.2 reached 66.0% Score@1 against 55.3%, with shorter outputs, and the
advantage carried through to the students. "We therefore select GLM-5.2 training
data for the live run."

Ultra-CC never got reinforcement learning at all. The reason given is budget:
"RL at Ultra scale exceeds our available compute budget." The gold-medal system
is a supervised fine-tune of an existing model, quantised to NVFP4 for the run,
trading 6.6 percentage points of IOI 2025 Score@1 for 3.7 times the throughput
so it could generate enough candidates inside the five hours.

## Nothing described here is a model you can run

If you go looking for the model that did this, you will not find it, and you may
find the wrong one instead.

Nemotron-3-Ultra-CC is not published. Querying the Hugging Face model API on
5 September 2026 for `Nemotron-3-Ultra-CC` and `Nemotron-3-Nano-CC` returns zero
results for each, while a search for `Nemotron-3-Ultra` returns the shipped model
in BF16, NVFP4, GenRM and base variants. The paper states an intention, not a
release: "We plan to release our competition Nemotron-3-Ultra-CC checkpoint
together with runnable inference and evaluation recipes in NeMo-Skills."

The model you can call is the paper's starting point, not its result. NVIDIA's
shipped Nemotron 3 Ultra is what the authors applied SFT to. The competition
system is that model plus competition-specific training data, quantisation, a
five-round generation pipeline and a 760-GPU allocation. Prompting the shipped
model will not reproduce 535.4.

That model's own catalogue entry moved this week too. This site's change feed
recorded `nvidia/nemotron-3-ultra-550b-a55b:batch` retiring from OpenRouter on
3 September 2026, one day after the paper went up. The batch endpoint is the
half that went. The standard endpoint is still listed, and still active.

## Sources

The paper is [arXiv:2609.02849v1](https://arxiv.org/abs/2609.02849v1),
"Post-Training Language Models for Gold-Medal Performance in Coding
Competitions", by Aleksander Ficek, Sean Narenthiran, Mehrzad Samadi, Somshubra
Majumdar and Boris Ginsburg, submitted 2 September 2026. It was the only version
at retrieval. The paper prints no institutional affiliation beside the author
names. It is attributed to NVIDIA here on its "© 2026 NVIDIA. All rights
reserved." line, its Nemotron models and its NeMo-Skills release plan. Every
passage quoted above was checked against both the arXiv HTML and the PDF of v1,
retrieved 5 September 2026, and the two agree on all of them.

The contestant figures are the IOI's own, from
[IOI 2026 results](https://stats.ioinformatics.org/results/2026) and
[IOI 2025 results](https://stats.ioinformatics.org/results/2025), and the contest
conditions from the
[IOI 2026 contest rules](https://www.ioi2026.uz/contest-rules), all retrieved
5 September 2026. The checkpoint check was a query against
`huggingface.co/api/models` on the same date. The OpenRouter retirement is a line
in this site's change feed, dated 3 September 2026.
