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
  - technique/direct-preference-optimization
  - technique/low-rank-adaptation
---

Ask a question of a model that has just finished the long, expensive part of
its training, and one perfectly likely reply is a list of further questions.
Nothing malfunctioned. Documents that contain a question tend to contain
several, the model was trained to continue documents, and it is continuing
yours.

Everything between that model and the assistant you actually use was added
afterwards, in stages, and there are few enough stages to hold in your head.
They are worth holding, because which stage a behaviour came from decides who
can change it, at what cost, on what timescale — the difference between a
complaint fixed by editing a configuration file this afternoon and one that
waits for the next training run.

## Pretraining: one objective, repeated

The long, expensive part is called pretraining, and it is [the training loop
you already know](/learn/learning-from-examples) — guess, score, nudge — run
without anyone writing an answer key. The model is shown stretches of text in
batches, many stretches at once, and at every position in each stretch it must
[score every token in its vocabulary](/learn/how-a-language-model-works) as a
candidate for the next one. The right answer is whatever token actually came
next: the text grades itself. How far the prediction missed is measured as a
single number — the wrongness score of the earlier pages, which the field
calls the loss, a word worth adopting here because the field's own writing
uses no other. The loss is [turned into an exact correction for every
weight](/learn/what-a-neural-network-is), the weights take their nudges, and
the loop fetches the next batch. Months of that, and nothing else. Because the
right answers come free with the text, the arrangement is called
self-supervised: the supervision is the text's own continuation.

Two things about this stage carry the rest of the page.

The objective is a proxy, and everyone involved knows it. Nobody wants a
next-token predictor. They want a system that is accurate, or helpful, or
safe. Next-token prediction is what gets optimised because it is the only
objective available at the scale that produces general capability: the text
already exists, and the answers ship inside it. Every stage after pretraining
exists to close the gap between the objective that was optimised and the
behaviour that was wanted.

And a pretrained model is not an assistant. The raw result of this stage is
called a base model — its weights freeze the moment the run ends — and the
model this page opened with is one. It continues text, and does nothing else.
The question-answering it lacks is not missing knowledge. It is a format
nothing has yet pointed it toward.

## Post-training begins with demonstrations

Post-training is every training stage after that run, and the first one is
startlingly small next to the thing it steers. Supervised fine-tuning
continues the same next-token training — fine-tuning always means further
training on a smaller, chosen pile — but the pile is now curated
demonstrations of the behaviour someone wants: a prompt, then a good response,
usually with the loss counted only on the response, so what gets reinforced is
the answering rather than the asking. Format and register come from here, at a
cost that is a rounding error beside pretraining.

How little it can take was measured directly. In May 2023, an experiment
called [LIMA](https://arxiv.org/abs/2305.11206v1) took a "65B parameter LLaMa
language model", "fine-tuned with the standard supervised loss on only 1,000
carefully curated prompts and responses" — no comparisons, "without any
reinforcement learning or human preference modeling" — and got strong
instruction-following, concluding that "almost all knowledge in large language
models is learned during pretraining, and only limited instruction tuning data
is necessary to teach models to produce high quality output." One experiment
is a working hypothesis, not a law, and production pipelines use far more than
a thousand examples. But it is the right first guess about the whole subject:
**capability is mostly bought in pretraining; behaviour is mostly set
afterwards.**

## Where demonstrations run out

A demonstration shows the model one good answer. It cannot say which of two
acceptable answers is better, or how cautious is too cautious, and for most of
what people actually want from an assistant — *was that reply helpful* —
nobody can write the right answer down at all. People can only recognise the
better of two when shown both. So the second stage of post-training runs on
comparisons: raters — people, or a model standing in for people — are shown
two responses to the same prompt and pick the better one. Preference
optimisation is the family of methods that turn those picks into weight
changes, and the field has two mainstream ways of doing it.

The classical pipeline builds a judge first. A reward model is a second model,
trained on the comparisons to predict which response the raters would prefer —
a stand-in judge, consultable millions of times at machine speed where the
raters are not. The language model is then trained against that judge by
reinforcement learning, which is the other way of moving weights: no correct
output is shown, ever. The model produces outputs, each one receives a score —
here, from the reward model — and the weights move to make higher-scoring
outputs more likely. In the field's writing, the model being trained in such a
loop is called the policy: reinforcement learning's word for the thing being
trained to act. The vocabulary matters because the pipeline's characteristic
failure is told in exactly these terms. The policy learns to satisfy the
judge, and the judge is not the thing it stood in for. A reward model is
itself just a trained model, wrong in patches, and an optimiser aimed at it
finds the patches. That is why the training is constrained to keep the policy
near the model it started from: the leash exists because the judge can be
flattered.

None of this began with language models. In June 2017, [researchers trained
simulated robots](https://arxiv.org/abs/1706.03741v4) against goals "defined in
terms of (non-expert) human preferences between pairs of trajectory segments"
— a person watching pairs of short clips and clicking the better-looking one —
and reported learning "complex novel behaviors with about an hour of human
time". Fit a judge to the clicks, optimise against the judge: the same
pipeline, before there was language anywhere in it.

Assembled end to end on a language model, the pipeline is called reinforcement
learning from human feedback — RLHF wherever you meet it. The March 2022 paper
[describing how GPT-3 was turned into an
instruction-follower](https://arxiv.org/abs/2203.02155v1) walks this same
staircase in its abstract — "fine-tune GPT-3 using supervised learning", then
"further fine-tune this supervised model using reinforcement learning from
human feedback" — and reports the measurement that made post-training's case:
"outputs from the 1.3B parameter InstructGPT model are preferred to outputs
from the 175B GPT-3, despite having 100x fewer parameters." A model a
hundredth the size, pointed correctly, was preferred to the whole thing left
raw. That is the bolded sentence above, run as an experiment.

The newer route deletes the judge. Direct preference methods rewrite the
comparison itself as a loss on the language model: make the response the
raters chose more likely and the rejected one less likely, directly, with no
reward model trained and no produce-and-score loop run. The founding method is
[Direct Preference
Optimization](/wiki/technique/direct-preference-optimization), and the trade
is what removing a moving part usually buys: one model fewer to train, one
judge fewer to flatter, and it runs on hardware the classical pipeline never
fit on — in exchange, it learns only from pairs somebody already collected,
where a policy producing fresh outputs can be scored on text nobody
anticipated. Which route is better is a live argument, and the entry carries
it.

## Adaptation: what changes without a new model

Everything so far moves weights, and moving weights is the expensive,
occasional act. Most deployed behaviour is set without it. Three levers, in
ascending order of cost; none of them produces a new model, and only the last
one trains anything at all.

The prompt. Instructions, examples and a persona placed before the user's
text — the [system prompt you have already met](/learn/what-a-model-is), and
everything else the operator places there. This is not a lesser technique. It
is the only lever that acts immediately, it needs no access to the weights,
and it is where most of the behaviour you actually experience comes from.

Retrieval. Fetch documents relevant to the request at the moment of the
request and paste them into the input. The [knowledge
cutoff](/learn/what-a-model-is) stops mattering for anything retrieval covers,
and the source is inspectable in a way nothing in the weights ever is. The
failures move to the retriever — fetch the wrong passage and no amount of
model quality recovers it — and they have [a page of their
own](/learn/how-a-model-uses-your-documents).

Parameter-efficient fine-tuning. Freeze every original weight and train a
small number of new ones bolted alongside. The standard recipe is [low-rank
adaptation](/wiki/technique/low-rank-adaptation) — LoRA on any model card —
and what matters at this altitude is the shape of what it produces: the
trained add-on, called an adapter, is a file thousands of times smaller than
the model, several can be swapped per request against one copy of the base
weights, and the base model underneath stays untouched and recoverable. Full
fine-tuning, the alternative, edits the original weights themselves and
produces an entire new model that must be stored and served on its own.

The distinction that decides which lever to pull: prompts and adapters are
edits to behaviour, and behaviour is what they are good at. Facts are a
different cargo. A fact pushed into weights by a training run has no address —
nothing can cite it, and correcting it means training again. Facts belong in
retrieval, where they can be corrected without a training run and cited when
used.

## Reading a behaviour change

When a deployed system starts behaving differently, the stages above are a
priority order for suspicion, cheapest first. The prompt and [the rest of the
stack around the model](/learn/what-a-model-is) change constantly. Adapters,
retrieval sources and decoding settings change often. Post-training changes
occasionally. Pretraining is a one-time event whose result is a distinct,
versioned artefact. Attributing a Tuesday's odd behaviour to lost pretraining
knowledge means ruling out three cheaper explanations first, and the cheap
explanations almost always win.

Read the other way, the same ladder is a ledger of who can act. Changing
pretraining is open to a handful of organisations, occasionally, at [a cost
that is a subject of its own](/learn/what-it-costs-to-build-and-run-ai).
Changing post-training is open to any team holding the weights and a pile of
comparisons. Changing an adapter, a retrieval source or a prompt is open to
whoever ships the product, before lunch. When you want a model's behaviour
changed, you are choosing which of those doors to knock on. And when its
behaviour changes on its own, the knock almost always came through the
cheapest door that was open.
