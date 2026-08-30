---
title: Why bigger kept getting better
level: mechanics
outcome: >-
  You can state what a scaling law actually predicts, what the bitter lesson
  claims, and why buying more compute was the winning move for a decade without
  ever being the whole story.
prerequisites:
  - how-models-are-trained
  - what-a-benchmark-measures
  - why-models-are-confidently-wrong
mentions:
  - concept/scaling-laws
  - concept/the-bitter-lesson
  - concept/emergence
  - concept/grokking
---

In January 2020, [Scaling Laws for Neural Language
Models](https://arxiv.org/abs/2001.08361) reported the measurement that
changed how the field spends money. Train language models across a wide
range of sizes and the loss (how wrong the model is, on average, about the
next token) falls as a power law: each multiplication of parameters, data or
compute buys a predictable slice of improvement, "with some trends spanning
more than seven orders of magnitude." Seven orders of magnitude means the
curve fitted on cheap runs still described runs ten million times larger. A
lab weighing a nine-figure run could now read its expected loss off a chart
drawn from experiments costing a thousandth as much. That is
the historical point of [scaling laws](/wiki/concept/scaling-laws): they
turned the frontier from a gamble into a calculable bet.

## The law was refit within two years

The bet stayed calculable and the calculation changed. In March 2022,
[Training Compute-Optimal Large Language
Models](https://arxiv.org/abs/2203.15556) re-measured the trade-off and put
the compute-optimal balance somewhere else: "current large language models
are significantly undertrained," with budgets favouring parameters over the
data to feed them. The corrected prescription was to grow both together,
doubling the training data whenever the model doubles. Its proof was
Chinchilla, a deliberately smaller model trained on far more text, which
beat models several times its size.

Notice what kind of thing just got corrected. Nothing was derived from a
theory of learning and found faulty. A curve was fitted to measurements,
better measurements arrived, and the curve moved. The 2020 paper's own
opening words are "We study empirical scaling laws," and [the
forensics](/wiki/concept/scaling-laws) of why the two fits disagreed took
until 2024 to finish. Fitted curves are what these laws are.

## The bitter lesson, and its critics

The measured regularity acquired an ideology. In March 2019, the
reinforcement-learning researcher Rich Sutton posted a one-page essay on his
personal site titled [The Bitter
Lesson](http://www.incompleteideas.net/IncIdeas/BitterLesson.html): "The
biggest lesson that can be read from 70 years of AI research is that general
methods that leverage computation are ultimately the most effective, and by a
large margin." Chess fell to search rather than to encoded grandmaster
judgment; Go repeated the pattern; speech recognition went to statistics over
linguistics. Build your own understanding of a domain into the system, the
essay says, and you buy a head start that becomes a ceiling, while the
general method rides falling compute prices through it.

The essay has serious critics. [A Better
Lesson](https://rodneybrooks.com/a-better-lesson/), Rodney Brooks's rebuttal,
arrived six days later and grants the compute while denying the moral: the
human knowledge never left, it moved — into architectures designed by hand,
training regimes tuned by hand, datasets labelled by hand. Encoding what we
want learned into the labels, Brooks writes, "is sleight of hand in moving
the human intellectual work to somewhere else." [Sutton himself has since
argued](/wiki/concept/the-bitter-lesson) that language models sit on the
human-knowledge side of his own dichotomy, which leaves the most-quoted
licence for scaling disputed by its author.

A decade of writing has run the two claims together. Keep them apart.
A scaling law is a measurement: spend more like this, lose less like that.
The bitter lesson is a thesis about research strategy, still accumulating
counterexamples and defences. The measurement never proved the thesis. It
made the thesis cheap to act on.

## The jumps may be in the ruler

Nobody wanted loss. [The objective is a proxy](/learn/how-models-are-trained),
and the winnings were what came with it: as loss fell, models began
translating, doing arithmetic, writing working code, none of it the thing
trained for. In June 2022, [Emergent Abilities of Large Language
Models](https://arxiv.org/abs/2206.07682) gave the surprises their
definition: an ability is emergent "if it is not present in smaller models
but is present in larger models," and such abilities "cannot be predicted
simply by extrapolating the performance of smaller models." Smooth curve in,
surprises out.

Ten months later a rebuttal arrived titled as a question. [Are Emergent
Abilities of Large Language Models a
Mirage?](https://arxiv.org/abs/2304.15004) held the models' outputs fixed
and varied only the scoring rule: "nonlinear or discontinuous metrics
produce apparent emergent abilities, whereas linear or continuous metrics
produce smooth, continuous predictable changes in model performance." An exact-match score awards
nothing for almost right, so steadily improving answers score zero, zero,
zero, everything. That is [the threshold you have already
met](/learn/what-a-benchmark-measures), where the smooth thing is the loss
and the jagged thing is the metric. The rebuttal's own conclusion stops short
of victory: the alleged jumps "may not be a fundamental property of scaling
AI models."

The dispute is live, and [the record of it](/wiki/concept/emergence) rewards
reading whole. The rebuttal showed that the sharpness and the
unpredictability, the two properties that made it alarming, sit largely in
the choice of ruler. It did not show why the abilities exist at
any size. [Grokking](/wiki/concept/grokking) teaches the same caution from
the other direction: a small network that appeared to snap from memorising
into generalising was building the general solution gradually the whole time,
and the snap was in what the metric could see.

## What no size bought

Every failure of [the confidently wrong
model](/learn/why-models-are-confidently-wrong) survives scaling, because
scaling improves every number except the one those failures come from:
nothing in the process that produces an answer checks the answer, at any
size. A larger model fabricates citations with more plausible authors in more
plausible venues, which is the failure getting better at its job. Its error
rate still tracks how often a thing was written down, not whether it is so.
The objective is the one thing every size shares, and truth was never in it.

## The walls, as of 2026

The decade of buying improvement now has a supply question. As of 2026,
arguments about the next order of magnitude are mostly arguments about
inputs: whether enough uncollected text remains, and whether the electricity
and the money keep arriving ahead of the returns. Those are questions of
infrastructure and patience as much as of learning, and their arithmetic is
a subject of its own.

## Prediction without explanation

Set the two halves of the decade side by side. The field owns a family of
measured regularities that has held across seven orders of magnitude and
priced its biggest bets in advance. It owns no accepted account of why
optimising next-token prediction produces translation, or arithmetic, or
working code. The regularity is about loss. The abilities arrived with loss.
The connection between the two is exactly where the emergence dispute lives —
one paper saying capability arrives unforeseeably, the other saying the plots
deceive, neither supplying a reason the capability should be there at all.
**The field can predict the loss of a model nobody has built yet, and cannot
explain the abilities of the models it already has.**

There is precedent for standing here. Steam engines pumped water for a
century before thermodynamics existed; the theory came later, partly built to
explain the engines. Prediction without explanation is a workable condition
for engineering. It is a poor foundation for prophecy, because extrapolation
reports that a curve has continued, never why, and so never what could make
it stop. "The scaling laws say" begins a strong sentence about loss and a
weak sentence about anything else. Ten years of measurement earned the first
kind its confidence. Nothing yet has earned the second.
