---
title: Running a model on your own computer
level: mechanics
outcome: >-
  You can say what it takes to run a model on hardware you own, what
  quantisation trades away, and when local genuinely beats an API.
prerequisites:
  - what-a-model-is
  - open-weights-and-closed-models
  - where-your-words-go
mentions:
  - technique/quantization
  - technique/mixture-of-experts
  - concept/kv-cache
  - tool/llama-cpp
  - tool/ollama
  - tool/lm-studio
---

The download finishes and there is a file of numbers on your disk. Whether it
runs is not a question about the disk.

To compute anything, the chip doing the arithmetic has to read every one of
those numbers, and it reads at speed only from memory wired directly to it.
Disk is where the file waits between runs. Memory is where it has to sit the
whole time it works, and memory is much the smaller number.

So the first question about running a model on hardware you own is not how fast
the machine is. It is how much memory the model can be given. That figure
decides which models are available to you at all, and everything else on this
page follows from it.

## What has to fit, and where

The size of the file comes from two things and nothing else: how many
[parameters](/learn/what-a-model-is) the model has, and how many bytes each
parameter is stored in. One billion parameters at two bytes each is two
gigabytes. Multiply that rate by the parameter count of whatever you are looking
at and you have done the calculation everybody doing this actually does.

Which memory, though, is where the surprises live. The arithmetic goes to
whichever chip in the machine is best at doing thousands of multiplications at
once, which is usually the graphics processor rather than the main one, and
machines come in two shapes. In the first, the graphics processor has its own
memory beside it, separate from the machine's main memory, and that separate
pool is the entire budget. A desktop stuffed with system memory and carrying a
card with a fraction of it can run only what fits on the card. In the second,
one pool serves both processors, and a large share of the machine's total is
available to the model. A thin laptop of the second kind will run models a much
more expensive desktop of the first kind refuses, and the price of the machine
has nothing to do with it.

A model file does nothing by itself. Some program has to load it, hand it to the
right chip and run the arithmetic. That program is called a runtime, and many of
the friendly desktop applications are windows built around a small number of
runtimes rather than separate engines of their own. This page has no commands
in it. Which programs exist is a question for [the directory](/tools),
and step-by-step procedure is what [the tutorials](/tutorials) are for. Both of
those change more often than anything here does.

When a model is larger than the budget, a runtime does not simply refuse. It
keeps the surplus in the machine's ordinary memory and drags those parts across
the link between the two pools each time they are needed, which is called
offloading. That link is far slower than the memory on either side of it, and
every piece of output waits for the slowest part of the model to arrive. Going a
little over does not cost a little. It puts the whole job on the slow path for
whatever fraction spilled, which is why a model slightly too large for a machine
is not slightly slower on it.

The ladder of machines is that one figure restated four times. A phone hands an
app a few gigabytes and slows itself down when it gets hot, so it runs the
smallest models in short bursts. A laptop's answer depends entirely on which of
the two shapes above it has. A desktop with a plug-in card is capped by the
card, and the rest of the machine does not enter into it. Above that you are
buying more than one card, and the model gets cut into pieces across them — at
which point each piece's output has to be shipped to whichever card holds the
next piece.

## A local model runs at reading speed

Text leaves a model one piece at a time. A piece is a word, or a fragment of a
word, or a punctuation mark, and the pieces are called tokens. Producing one
takes a full pass: the machine reads every weight out of memory, uses each one
once, and emits a single token. Then it starts again from the top for the next
one.

That is why the number you feel is not the chip's arithmetic rate. It is the
memory's reading rate divided by how many bytes the model occupies. Halve the
model and the same machine reads it in half the time and produces roughly twice
as many tokens a second, with no change to the processor at all. **A model on
your own machine does not run at the speed of your processor. It runs at the
speed your machine can read it.** Why the arithmetic ended up being the cheap
part is [a subject of its own](/learn/the-hardware-that-runs-ai).

Capacity and bandwidth are therefore the two figures worth finding for your own
machine. How much memory the chip can reach decides which models run. How fast
it can read that memory decides how quickly they write. The large arithmetic
figure that leads the announcement decides neither of those.

One family of models breaks the division, and it breaks it usefully. Some are
built as a set of parallel sub-networks with a small router in front that picks
a couple of them for each token, an arrangement called a
[mixture of experts](/wiki/technique/mixture-of-experts). Every sub-network has
to be in memory, because the router's choice is not known in advance, but only
the chosen ones get read. The [2024 paper that popularised the design in open
weights](https://arxiv.org/abs/2401.04088) described a model where "each token
has access to 47B parameters, but only uses 13B active parameters during
inference". Inference is the field's name for running a finished model rather
than training one. So the memory bill and
the reading bill come apart. Such a model asks for room like a large one and
writes at closer to the speed of a small one, which is exactly the trade a
machine with plenty of memory and modest bandwidth wants.

## The conversation competes for the same memory

The weights are not the only thing in there. Everything the model is reading
arrives as one block of text — the invisible instructions, your question, and
every earlier turn, which is
[re-sent from the beginning each time](/learn/what-a-model-is) rather than
remembered — and the field calls that block the context.

Working through it costs memory of its own. So that each new token does not
require recomputing everything in front of it, the runtime stores a set of
intermediate numbers for every token it has already read. That store is the
[KV cache](/wiki/concept/kv-cache), it sits in the same memory as the weights,
and it grows with every token in the conversation.

Two consequences catch people. A model that loaded comfortably can run out of
room partway through a long document, because the thing that grew was not the
model. And the setting that raises the conversation limit reserves that room at
load time, so asking for a longer context can stop a model that used to start.

## Rounding the weights down

Bytes per weight is not fixed by nature. Weights come out of training stored
with room for fine gradations, and they can be rounded onto a coarser grid and
kept in half or a quarter of the space. Nothing is retrained. The file is
rewritten, and the rewriting is called
[quantisation](/wiki/technique/quantization).

It pays into both of the figures this page has been about. The model fits where
it did not fit, and because generating is reading, the shorter read also writes
faster. Reading a long prompt is a different operation and barely moves, which
the entry shows with measurements from one machine, along with the reason the
advertised width is a floor rather than a description.

What it costs is accuracy, and the useful version of that question is not how
much accuracy but how to spend a fixed pool of memory.
[A study published in 2022](https://arxiv.org/abs/2212.09720) ran that
comparison at "3 to 8-bit precision" across four model families and "at scales
of 19M to 176B parameters", scoring each on tasks it had been shown no worked
examples of. It reported four bits a weight to be "almost universally optimal
for total model bits and zero-shot accuracy". For somebody with a fixed pool of
memory that reads as a rule about how to spend it: usually on a larger model
compressed harder rather than a smaller model kept precise. Methods have moved
since, and how far a particular model can be pushed before it starts making
different mistakes is a question about that model. What has not changed is the
shape of the choice. Memory buys either size or precision, and you have to say
which.

## The reasons that are not speed

None of this is an argument for doing it. Renting a model through somebody's API
gets you a larger one running faster, so the case for the copy on your own disk
has to come from somewhere other than performance. It comes from three
properties that depend on possession rather than on a promise.

The first is privacy, and running locally does not answer that question so much
as delete it. A message to a hosted product takes
[a route with real questions attached](/learn/where-your-words-go): servers,
logs, review queues, and a switch about future training. On your own machine
there is no retention period to look up because there is no retention, and no
policy to read because there is no second party. What replaces it is an ordinary
responsibility. The conversation is now a file on a disk you are in charge of,
which is a different exposure rather than no exposure.

The second is the shape of the cost. Paid access is variable: you pay per unit
of text, forever, in proportion to how much you use it. Hardware is fixed, paid
once, after which a request costs electricity. That is not automatically
cheaper, and treating it as a saving is a bet that your volume is high enough
and sustained enough to cross over, which most people's is not. What reliably
changes is the shape. The bill stops being a function of how much you use the
thing, which matters most for the work you would otherwise ration.

The third is the one nothing else supplies. A hosted model can be deprecated,
and the stack around it is edited continuously, so what you tested against in
March may not be what answers in September without anyone having misled you. The
permanence that makes a careless open release impossible to recall is
[the same property](/learn/open-weights-and-closed-models) read from the useful
side. A file on your disk cannot be retired out from under you. It is the same
numbers next year, it answers with no network at all, and because you hold the
weights you can change them, which is the only route to a model fitted to
material of your own.

## The comparison people make is the wrong one

Set the two side by side and local loses on the axis people compare first. The
largest models are not published at all, and the largest that are published need
far more memory than an ordinary machine has. So the honest comparison is never
the best local model against the best model. It is a model several rungs down,
on a
machine with a fraction of the memory bandwidth a provider is reading its
weights with, against the best thing anyone has.

A second gap gets mistaken for the first. What people have been using is a
product, and [most of a product is not the model](/learn/what-a-model-is): the
retrieval that pulls documents in, the tools it can call, the search, the
invisible instructions, the layer that may run the model several times before a
word appears. Downloading the weights gets you the weights. A good deal of what
made the product feel capable was the rest of it, and a local model that
disappoints is often being measured against a product rather than against a
model.

So the question worth asking is not which one is better. It is which of your
requirements would survive somebody else's decision. A requirement about answer
quality is best served by whoever owns the most hardware, and that will not be
you. A requirement about confidentiality, about working with no network, about a
bill that does not track usage, or about the same numbers still being there in
five years is a requirement about possession, and possession is the one thing a
subscription cannot include.
