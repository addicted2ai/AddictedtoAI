---
title: What a benchmark measures, and what it does not
level: mechanics
outcome: >-
  You can say what a reported benchmark number is a measurement of, name three
  reasons two labs can publish different scores for the same model on the same
  test without either being dishonest, and tell a real gap from noise.
prerequisites:
  - how-models-are-trained
mentions:
  - technique/reinforcement-learning-with-verifiable-rewards
  - concept/scaling-laws
  - event/imagenet-2012
---

A benchmark score measures a procedure, not a model. The procedure is the
items, the prompt format, the scoring rule, how many examples were shown first,
the decoding settings, and the software that ran the whole thing. Change any of
them and the number changes, legitimately, with nobody lying. Most apparent
disagreement between published scores is disagreement about the procedure, and
the procedure is usually not published beside the number.

## The scoring rule is part of the measurement

Take a multiple-choice test, the most standardised artefact in the field. There
are at least three ways to score it, and they are three different tests:

- compare the model's probability for each option **letter** and take the
  highest;
- compare its probability for each option's **full text**, usually normalised
  by length;
- make it **generate** an answer as text, and parse what comes out.

The first can never fail to parse and can never refuse. The third can fail for
reasons unrelated to knowing the answer — a preamble, an unexpected format, a
refusal — so the parser's tolerance becomes part of the score. When the Open
LLM Leaderboard team traced why the same models ranked differently in different
harnesses, this was the answer: [three implementations, three scoring
conventions](https://huggingface.co/blog/open-llm-leaderboard-mmlu), with one
model's score on one test landing nearly fifteen points apart depending only on
which harness ran it.

## Prompt format is a variable, not a detail

Option order alone moves scores. Models show measurable selection bias in
multiple choice, preferring particular option slots regardless of content, and
the effect has been [traced to token-level bias on the option
identifiers](https://arxiv.org/abs/2309.03882) rather than to anything about
the questions. The wording of the instruction, whether examples precede the
question and how many, and whether a fixed answer format is demanded each move
the number by margins comparable to the differences reported as progress.

A leaderboard that fixes the format is measuring models under that format. That
is the right thing for it to do, and it is not the same as measuring the
models.

## Contamination is real and mostly unmeasurable from outside

The mechanism is plain. The test items were on the public web before the
training data was collected, so they are plausibly in the training text, and a
model reproducing a memorised answer scores the same as one that worked it out.

The difficulty is detection. The usual check is string overlap between test
items and the corpus, which catches verbatim copies and misses paraphrases,
translations, and items that entered through a blog post discussing the
benchmark rather than through the benchmark itself. And the corpus is usually
unpublished, so the party best placed to run the check is the one with the
least reason to publish the result.

The only strong evidence is a test written after the model's data was
collected, held out, and never posted. Everything else is an argument about
likelihood, and should be stated as one.

## Near the ceiling, a score measures the test

Every large hand-labelled benchmark contains wrong items. A re-annotation of
one widely used multiple-choice suite found [errors in roughly one question in
fifteen](https://arxiv.org/abs/2406.04127), concentrated hard in particular
subjects — in one subject, a majority of the questions the authors sampled.

Once a model's remaining errors are the same size as the test's own error rate,
the score has stopped discriminating between models and started measuring the
labels. A gap near the top of a benchmark is not the same quantity as an
identical gap in the middle, and a model that is "wrong" on a mislabelled item
is right.

## A difference smaller than the interval is not a difference

A benchmark has a finite number of items, so a score is an estimate with a
standard error, and comparisons are usually published without one. Where the
score comes from sampled generations rather than probabilities, run-to-run
variance stacks on top of item variance. Two numbers differing in the first
decimal place, on a test of a few thousand items, each scored once, are
compatible with no difference at all. Adding decimal places does not add
precision.

## The smooth thing is the loss; the jagged thing is the metric

Pretraining loss falls predictably with compute and data — that regularity is
what scaling laws describe. Benchmark accuracy does not inherit the smoothness,
because a benchmark applies a threshold to a continuous quantity: the model's
probability of the correct answer can climb steadily for a long time while the
answer it actually emits stays wrong, and then flip.

Sudden jumps on a metric are frequently a threshold being crossed rather than a
capability appearing. That cuts both ways, and the second direction gets less
attention: a flat benchmark is weak evidence that nothing is improving
underneath it.

## pass@k and pass@1 measure different products

pass@k asks whether any of k samples passes a checker; pass@1 asks about one
sample. Training that concentrates probability on the model's best answer
raises pass@1 and can lower pass@k, because it spends the diversity that a
larger k was harvesting. That is the measured pattern for models trained
against verifiable rewards:
{{fact:technique/reinforcement-learning-with-verifiable-rewards#pass_at_k_finding}}.

How to read it matters. If the base model already produces a passing solution
within k tries, the training did not add the capability — it moved probability
mass onto it. Whether that counts as an improvement depends on how many tries
your deployment gets, which is a fact about your product rather than about the
model.

## Preference arenas measure preference

Head-to-head human voting ranks what raters preferred, and raters see the
response rather than the ground truth. Length, formatting, structure and a
confident register all move votes. A model tuned to produce longer,
better-organised answers climbs such a ranking with no change in what it knows.

That is not cheating. It is what the instrument measures, and it measures it
well — which is a reason to read the ranking as what raters chose, and not as
an accuracy result by another name.

## What benchmarks are actually for

The historical case shows the function most clearly. ILSVRC 2012 mattered not
because one number was impressive but because everyone was measured the same
way on the same items, so a result was legible to an entire field at once and
the field could agree on what had happened.

Comparability across submissions is the whole product. It is destroyed by
precisely the thing that makes any individual number look best: each lab
evaluating in its own harness, on its own format, and reporting the outcome.

Before quoting a score, ask who ran it, in which harness, and on which items.
If any of the three differs between the two numbers you are holding, you are
not comparing them.
