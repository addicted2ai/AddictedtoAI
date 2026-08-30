---
title: Looking inside a model
level: advanced
outcome: >-
  You can say what interpretability researchers actually do, name results where
  a behaviour was genuinely located in the weights, and state why "we don't know
  how it works" is both true and shrinking.
prerequisites:
  - how-a-language-model-works
  - what-safety-training-changes
mentions:
  - concept/grokking
---

Download a set of open weights and what arrives is a list of named tensors. One
is called `model.layers.31.mlp.down_proj.weight`. The name is an address: which
layer, which sub-block, which matrix. Nothing in the file says what the numbers
in that matrix are *for*.

So almost nobody studies the weights by reading them. The first move is to run
the model and watch the activations, the values flowing through the network on
one input, on the bet that whatever a model is doing, it is doing there.

## A probe measures the probe as well

The oldest technique is a probe: train a small classifier on the activations at
one layer and see whether it recovers a property you care about. [Alain and
Bengio named the method in 2016](https://arxiv.org/abs/1610.01644). It is cheap,
it works on anything, and it reads like evidence. If a classifier can pull parts
of speech out of layer two, layer two must represent parts of speech.

That inference is the one this field has had to learn not to make. [Hewitt and
Liang built the control](https://arxiv.org/abs/1909.03368): the same setup, but
with every word type assigned a random output, so there is genuinely nothing in
any representation to find. A probe that scores well on *that* is reporting its
own capacity to memorise. What matters is the gap between the real task and the
control, which they named selectivity, and the popular probes of the day were
not selective. High probe accuracy, on its own, is a fact about the probe.

## Neurons were never going to be the unit

The next thing to try is finding a neuron that means something. Some do. Most
respond to assortments of things with no evident relation to each other, which
looked for years like untidiness.

It is not untidiness. Anthropic's [toy models of
superposition](https://transformer-circuits.pub/2022/toy_model/index.html) put
the reason in one line: "Linear representations can represent more features than
dimensions, using a strategy we call superposition." A network with a thousand
dimensions available and ten thousand things worth tracking does not discard
nine thousand of them. It packs them in at angles, accepting interference in
exchange for capacity. A neuron that fires for three unrelated things is not a
broken neuron. It is what compression looks like from the inside.

So the unit was never the neuron. It is a direction in activation space, and
directions have to be found.

## Features, and the argument still running

The approach carrying most of the work since 2023 is dictionary learning: train
a second, much wider network to reconstruct the activations using only a few of
its many outputs at a time, then read those sparse components as features.
[Cunningham and colleagues](https://arxiv.org/abs/2309.08600) found them more
interpretable than what rival decompositions produced. In 2024 Anthropic ran
sparse autoencoders against a production model and got the result everyone
remembers: a feature for the Golden Gate Bridge which, [clamped to ten times its
maximum
activation](https://transformer-circuits.pub/2024/scaling-monosemanticity/index.html),
makes the model start describing itself as the bridge.

That is a causal test and it passed. Whether these components are the model's
own units or an artefact of the method that finds them is not settled, and in
2025 the same research community published two results against its own tool.
[Sparse autoencoders do not find canonical units of
analysis](https://arxiv.org/abs/2502.04878): train a second autoencoder on the
first and a latent for "Einstein" comes apart into "scientist", "Germany" and
"famous person". And [put to work on a downstream probing
task](https://arxiv.org/abs/2502.16681), they could not be made to beat simple
baselines consistently.

## The refusal direction, read as evidence

You already have the strongest result on this page. The paper behind [what
safety training changes](/learn/what-safety-training-changes) is [Refusal in
Language Models Is Mediated by a Single
Direction](https://arxiv.org/abs/2406.11717): across thirteen open chat models,
one direction in the residual stream such that erasing it stops the model
refusing harmful instructions, while adding it elicits refusal on harmless ones.

Look at the shape of that evidence rather than the finding. Nothing is being
decoded. Two interventions run in opposite directions and both land where the
account predicts, which closes off the failure the control tasks exposed: a
direction that is merely readable cannot also be a direction that, added to a
request about baking, produces a refusal.

What it does not say is worth as much. It does not say refusal is one direction
in every model; it says it is in the ones tested. And it does not make refusal
certifiable, because the address that lets a researcher study the behaviour lets
anyone holding the weights delete it.

## Two kinds of not knowing

*What is this part doing* now has answers, more of them every year, and the good
ones arrive with an intervention attached. The best measure of how far that
reaches comes from the people with the best tools. Anthropic's
[attribution-graph work](https://transformer-circuits.pub/2025/attribution-graphs/biology.html)
of 27 March 2025 reports "satisfying insight for about a quarter of the prompts
we've tried", and says that even the successes "only capture a small fraction of
the mechanisms of the model". A quarter is not nothing. It is also not a model
you could audit.

That paper carries the finding that sits worst with everything you know about
how these models run. Before it writes the first word of a line of verse, the
model has already lit up the words it might end that line on; suppress the one
it prefers and it writes a different line, landing on one of the others.

Nowhere in training did anyone ask for that, which sharpens the question none of
this answers. [How models are trained](/learn/how-models-are-trained) is blunt
about the objective: pretraining optimises one proxy, next-token prediction, and
nobody wants a next-token predictor. Why running that proxy over enough text
yields something that plans a rhyme is a different question from what any of its
parts are doing, and locating the refusal direction says nothing about why
refusal was learnable at all.

The conventional answers did not survive contact with the evidence. Zhang and
colleagues showed that networks which generalise well on real labels will [also
fit a random labelling of the same data
perfectly](https://arxiv.org/abs/1611.03530), and will do it on unstructured
noise in place of images, so neither the model family nor the regularisation
explains the generalisation.

The clearest case where the question *was* answered is one this page has used
already. The work that reverse engineered a
[grokked](/wiki/concept/grokking) modular-addition network did not stop at the
algorithm; it explained the arrival of generalisation as three phases,
"memorization, circuit formation, and cleanup". The task was a table of modular
sums. The whole world that network had to learn was written down in advance.

For a model trained on the open internet there is no written-down world. The
sparse-autoencoder argument above cannot be closed by running a better
experiment, because, as the sparse-probing paper says in its opening lines,
there is a "lack of a ground truth for the concepts used by an LLM". You cannot
score a decomposition against the right answer while nobody can state the right
answer. One question comes with a way to be wrong: erase the direction, see
whether the behaviour goes. The other does not have one yet, and effort is not
the thing it is short of.

This is not a reason to shrug. *What safety training changes* ended on the gap
between a model that is unlikely to do something and one that cannot, and only
the second is a guarantee. Interpretability is the only programme that could
supply it, which is why its practitioners keep publishing the tests their own
methods fail.

So the question to bring to the next result you read is not whether the picture
looks compelling. It is what got intervened on, and what happened when it did. A
probe score, or a feature dashboard that reads beautifully, is without that a
hypothesis wearing the clothes of a measurement.
