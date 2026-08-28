---
title: How models are trained, and how they are changed afterwards
level: mechanics
outcome: >-
  You can say which stage a given behaviour came from — pretraining,
  post-training, adaptation, or the prompt — and therefore which changes
  require a training run and which are edits to a configuration file.
prerequisites:
  - how-a-language-model-works
mentions:
  - concept/scaling-laws
  - concept/the-bitter-lesson
---

There are two training stages and three ways to change a model's behaviour
without retraining it. Knowing which is which is the difference between a
useful complaint and a useless one.

## Pretraining: one objective, repeated

Pretraining shows the model text and asks it, at every position at once, to
predict the next token. The prediction is compared against the token that
actually followed, the difference is turned into a gradient, and the weights
move slightly. That is the entire objective. There are no labels and no task
definitions, which is why it is called self-supervised: the supervision is the
text's own continuation.

Two things about this are worth holding onto.

**The objective is a proxy and everyone knows it.** Nobody wants a
next-token predictor. They want a system that is accurate, or helpful, or
safe. Next-token prediction is optimised because it is the only objective
available at the scale that produces general capability. Every subsequent
stage exists to close the gap between the objective that was optimised and the
behaviour that was wanted.

**A pretrained model is not an assistant.** It continues text. Ask a base
model a question and a plausible continuation is a list of similar questions,
because that is what documents containing questions look like. The
question-answering behaviour is not knowledge the model lacks; it is a format
it has not been directed toward.

## Post-training: pointing the capability somewhere

Post-training turns a text continuer into something that answers. It has two
common stages.

**Supervised fine-tuning** continues the same next-token training, but on
curated examples of the desired behaviour: a prompt and a good response, with
the loss usually applied only to the response. This is cheap relative to
pretraining and it establishes format and register.

**Preference optimisation** handles what demonstrations cannot: which of two
acceptable answers is better. Humans (or a model standing in for them) compare
pairs of responses. There are two mainstream ways to use those comparisons:

- Train a separate **reward model** to predict which response a human would
  prefer, then optimise the language model against that reward with
  reinforcement learning. This is the classical pipeline. It has a
  characteristic failure: the policy learns to exploit the reward model's
  errors rather than the preferences behind them, so training is constrained
  to stay near the starting model.
- Skip the reward model entirely and rewrite the preference comparison
  directly as a loss on the language model — the family of direct preference
  methods. One fewer model to train, one fewer thing to overfit, and no
  reinforcement learning loop; in exchange, less flexibility once training
  begins.

The empirical picture from this stage is more interesting than it is usually
presented. An often-cited 2023 experiment,
[LIMA](https://arxiv.org/abs/2305.11206), fine-tuned a large base model on
about a thousand carefully curated examples with no preference training at all
and got strong instruction-following, concluding that "almost all knowledge in
large language models is learned during pretraining, and only limited
instruction tuning data is necessary to teach models to produce high quality
output." Treat that as a working hypothesis rather than a law, but it is the
right first guess: **capability is mostly bought in pretraining; behaviour is
mostly set afterwards.**

## Adaptation: changing behaviour without changing the weights

Three levers, in ascending order of cost.

**The prompt.** Instructions, examples, and a persona placed before the user's
text. This is not a lesser technique — it is the only one that takes effect
immediately, and it is where most deployed behaviour actually comes from.

**Retrieval.** Fetch relevant documents at request time and put them in the
input. The model's knowledge cutoff stops mattering for anything retrieval
covers, and the source is inspectable, which fine-tuned knowledge is not. The
failure modes move to the retriever: if the right document is not fetched, no
amount of model quality recovers it.

**Parameter-efficient fine-tuning.** Freeze the original weights and train a
small number of new ones alongside them — most commonly low-rank adapter
matrices added to selected layers. The adapter is a small file, several can be
swapped per request against one copy of the base weights, and the original
model is untouched and recoverable. Full fine-tuning, by contrast, produces an
entirely new set of weights that must be stored and served on its own.

The distinction that matters in practice: adapters and prompts are edits to
*behaviour*; they are a poor way to install *facts*. Facts belong in
retrieval, where they can be corrected without a training run and cited when
used.

## Reading behaviour changes correctly

When a deployed system starts behaving differently, the stages above give a
priority order for suspicion. The prompt and the surrounding configuration
change constantly. Adapters and serving settings change often. Post-training
changes occasionally. Pretraining is a one-time event whose result is a
distinct artefact. Attributing a Tuesday's behaviour to lost pretraining
knowledge requires ruling out three cheaper explanations first.
