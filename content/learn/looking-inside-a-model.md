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
baselines consistently. Neither critique comes from outside the programme: an
author of the original sparse-autoencoder paper is also an author of the
canonical-units result.

## Circuits: a whole account of one behaviour

A feature is a unit. A circuit is units wired into a computation, and circuits
are what the field reaches for when it wants to explain a behaviour rather than
label a component. A worked one covers [indirect object
identification](https://arxiv.org/abs/2211.00593): how a small language model
completes "When Mary and John went to the store, John gave a drink to" with the
other name. The account, assembled with causal interventions throughout, comes
to twenty-six attention heads grouped into seven classes, each class doing an
identifiable job, and between them they carry the bulk of the task.

What makes that paper worth reading is what it does next. Instead of declaring
the behaviour explained, the authors score their own account against three
criteria they name faithfulness, completeness and minimality, and report that
while those criteria support it, "they also point to remaining gaps in our
understanding". So a behaviour can have an address. Twenty-six heads is what one
address cost, in a small model, on a task you can state in a sentence.

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
request about baking, produces a refusal. The same paper then makes a prediction
about something else entirely, that adversarial suffixes work by suppressing the
propagation of that direction, and finds it.

What it does not say is worth as much. It does not say refusal is one direction
in every model; it says it is in the ones tested. And it does not make refusal
certifiable, because the address that lets a researcher study the behaviour lets
anyone holding the weights delete it.

## Where a fact lives is not where to change it

Causal evidence gets over-read too, and the cleanest demonstration is a pair of
papers about stored facts. [Locating and Editing Factual Associations in
GPT](https://arxiv.org/abs/2202.05262) developed causal tracing: corrupt the
input, restore individual activations one at a time, and see which restorations
bring the right answer back. It localised factual recall to middle-layer
feed-forward modules, and its authors built an editing method on that
localisation.

Then [Does Localization Inform Editing?](https://arxiv.org/abs/2301.04213)
tested the step in between. It found you can change how a fact is stored by
editing weights in a different location from the one tracing points at, and
reported that tracing results "do not provide any insight into which model MLP
layer would be best to edit". The authors' own summary is the sentence to keep:
"better mechanistic understanding of how pretrained language models work may not
always translate to insights about how to best change their behavior."

Nothing was wrong with the localisation. What failed was an unchecked move
between two questions, where a computation happens and where to intervene on it,
that everyone had been treating as one.

## Two kinds of not knowing

*What is this part doing* now has answers, more of them every year, and the good
ones arrive with an intervention attached. The best measure of how far that
reaches comes from the people with the best tools. Anthropic's
[attribution-graph work](https://transformer-circuits.pub/2025/attribution-graphs/biology.html)
of 27 March 2025 reports "satisfying insight for about a quarter of the prompts
we've tried", and says that even the successes "only capture a small fraction of
the mechanisms of the model". What the method cannot reach arrives as error
nodes the authors call dark matter. A quarter is not nothing. It is also not a
model you could audit.

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
methods fail. The paper that found the Golden Gate feature also found features
relating to lying, deception and power-seeking, and then cautioned its readers
not to read too much into their mere existence: "there's a difference (for
example) between knowing about lies, being capable of lying, and actually lying
in the real world."

So the question to bring to the next result you read is not whether the picture
looks compelling. It is what got intervened on, and what happened when it did. A
probe score, or a feature dashboard that reads beautifully, is without that a
hypothesis wearing the clothes of a measurement.
