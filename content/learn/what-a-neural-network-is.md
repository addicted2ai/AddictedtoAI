---
title: What a neural network actually is
level: foundations
outcome: >-
  You can say what a neural network computes, what a weight is, and how
  nudging millions of numbers against examples produces behaviour nobody
  programmed.
prerequisites:
  - learning-from-examples
  - what-a-model-is
mentions:
  - concept/emergence
---

One unit of a neural network does this, and nothing else: it takes in some
numbers, multiplies each by a number of its own, adds up the results, and
passes the total onward if it is big enough. Otherwise it passes nothing.
Multiply, add, compare. However large the network and whatever it was trained
to do, there is no other ingredient in it.

[A model, you already know](/learn/what-a-model-is), is a fixed array of
numbers plus a description of the arithmetic to run on them. You are looking
at both halves at once. The unit is the arithmetic, and its private
multipliers are the numbers: the millions of adjustable dials from [the
training loop](/learn/learning-from-examples), which the model page called
weights in passing. The name is literal. Each weight sets how much weight one
incoming signal carries in the total. A weight near zero makes the unit deaf
to that input. A large one makes the unit hang on it.

The unit is called a neuron, because it began as a deliberate cartoon of a
brain cell. The resemblance was loose then and has not tightened since.

## Each layer reads only the layer before

Neurons are stacked in layers. The first layer reads the input itself,
already numbers, since to a computer a photo is a grid of brightness values.
Every later layer reads only the outputs of the layer before it, so a neuron
deep in the network has never seen your photo. It works on a description of a
description.

That sounds like a defect and is the entire design. In networks trained on
photographs, the early layers end up responding to edges and small patches of
contrast. Middle layers respond to arrangements of those: corners, curves,
textures. Later layers respond to things built from the arrangements, an
eye, a wheel, a patch of fur. The story is tidier in the telling than in any
real network, where jobs blur and plenty of neurons answer to nothing
nameable. But the direction of travel is real, and it is what depth buys.
"Is there a cat in this photo" cannot be answered in the vocabulary of
pixels. It nearly answers itself in the vocabulary of fur,
whiskers and pointed ears. Each layer redescribes the input in terms one step
closer to the question, until the description and the answer almost coincide.

No layer was given its job. Edge-finding appears nowhere in the code and
nowhere in the examples. It is where the early weights drift during training,
because a good early vocabulary makes every later guess less wrong at once.

## The blame is computed, not guessed

[The training loop](/learn/learning-from-examples) as you first met it had a
hole in the middle. Guess, score, then nudge every dial in whichever direction
would have made the guess less wrong. With millions of dials, which direction
is that, for each one?

Not found by trying. Because everything between input and guess is
arithmetic, the question has an exact answer. A wrong answer is never just
held against the network. It is itemised: for every weight at once, it can be
worked out whether up or down would have helped, and by how much, so each
weight receives its own share of the blame and its own correction before the
loop fetches the next example. The procedure is called gradient descent, the
gradient being the slope of the wrongness under each weight, the descent
being what the weights do on it, one small step per example, for as long as
training runs. There is no trial and error anywhere in this. Training is
bookkeeping, exact and absurdly repeated.

## Written nowhere

Open the finished network and look for what it learned: the junk-mail rules
in the spam filter, the cats in the cat-spotter. There is nothing to find. No
weight holds a rule, and no cluster of weights is the shelf where the cats
are kept. Every example nudged every weight, every weight absorbed pressure
from millions of examples, and at no point was anything filed anywhere.
Nothing in the loop asks for the result to be readable; a reader was never
part of the score.

Nor is this untidiness that a better loop would fix. Remember the filing
cabinet from [the loop's page](/learn/learning-from-examples): store every
example, look each one up on demand, score perfectly, generalise not at all.
Keeping things separate is what the cabinet does. The network does the
opposite, and the blending is the point, because what carries over to new
cases is exactly what stopped belonging to any particular old one. **A neural
network is unreadable for the same reason it works: everything it knows is
stored across the same weights as everything else it knows.**

So nobody, including the people who ran the training, can point at the
numbers and say what they hold. Finding anything out about the inside takes
an experiment on the running machine, not an inspection of the file, and [a
research field exists](/learn/looking-inside-a-model) to run exactly those
experiments.

## When more became different

The recipe has one more property, and the last decade of AI was built on it:
nothing about it changes with size. Multiply, add, compare, layer on layer,
blame computed and applied. A network of a thousand weights and a network of
billions are the same recipe at different quantities.

For most of the field's history, quantity bought degree. A bigger network was
a better spam filter, a sharper photo-sorter: the same abilities with fewer
mistakes. Then networks grown to billions of weights, trained on text
gathered at the scale of the public internet, began doing things that were
not better versions of anything the smaller ones did. Translation between
languages. Arithmetic. Working code. None of these was a target of training,
and there is [a live argument](/wiki/concept/emergence) about whether such
abilities arrive gradually or in sudden jumps. What is not in dispute is that
nobody put them in one at a time. You already know why no one can point to
where they live: there are no modules in there to point at.

Why quantity alone does this is not settled. The field can build networks
whose abilities it cannot yet explain, and that sentence describes the
present, not an early chapter.

## Which part is actually mysterious

"Nobody knows how AI works" may be the commonest sentence in the subject, and
you can now say exactly how much of it is true. At the level of parts,
nothing is unknown. Every multiply, every threshold, every step of the blame
arithmetic is ordinary, published, and checkable by hand given the patience.
What nobody knows is why the particular millions of settings that training
found produce the behaviour they produce. The sentence is false about the
machinery and true about what the machinery has come to hold. Keep the two
levels apart and you can hear, in any confident claim about AI, which one it
is actually about.
