---
title: The hardware AI runs on
level: mechanics
outcome: >-
  You can say why AI runs on graphics chips, which two numbers on an
  accelerator's spec sheet matter, and what a training cluster physically is.
prerequisites:
  - how-a-language-model-works
  - how-models-are-trained
mentions:
  - org/nvidia
  - event/imagenet-2012
  - technique/quantization
---

The processors that run modern AI were built to draw video games.

Drawing one frame means running the same short piece of arithmetic on every
pixel of the screen, a million of them, with no pixel waiting on any other. A
processor built for that job has thousands of small arithmetic units that all
perform the same operation in the same instant on different numbers. It is
poor at work that has to happen in a strict order, and it never needed to be
good at that, because a frame has no order in it.

A layer of a neural network has that shape exactly. Each unit
[multiplies its inputs by its own weights and adds up the
result](/learn/what-a-neural-network-is), every unit in the layer does it at
the same moment, and none of them reads any other's answer, only the layer
before. So one layer is thousands of identical independent multiply-and-adds.
The hardware did not have to be adapted for that work. It had to be pointed at
it.

Arriving this way was also cheap, and the cheapness decided who could take
part. The machines were already manufactured in volume for people who wanted to
play games, which meant the hardware that made deep learning practical could be
bought from a shop rather than requisitioned from an institution. The image
classifier that
[won a contest in 2012](/wiki/event/imagenet-2012) and restarted the whole
subject ran on a computer with two [NVIDIA](/wiki/org/nvidia) cards in it.
Since then the machines have stopped being graphics cards in anything but
ancestry. They carry circuits that do nothing but multiply matrices, and memory
arranged in ways no game has ever wanted. The name stayed. The machine left.

## Two numbers, and one of them is advertised

The chip doing this arithmetic is called an accelerator, whatever its
manufacturer is calling the product line this year, and it is described by two
rates. Announcements quote one of them.

The first is arithmetic throughput: multiply-and-adds performed per second. The
second is memory bandwidth, the rate at which the chip can pull bytes out of
its own attached memory and into those arithmetic units. Bandwidth is much the
smaller of the two and has been losing ground for a long time. A 2024 survey of
two decades of server hardware found
[peak arithmetic throughput](https://arxiv.org/abs/2403.14123) scaling at three
times every two years, while memory bandwidth and the links between chips
managed only 1.6 and 1.4 times over the same interval.

This matters because no chip can multiply a number it has not fetched. Weights
sit in memory. To use one, the accelerator reads it, computes with it, and
moves on. Do a single multiply per weight read and the arithmetic units finish
almost immediately, then stand idle until the next weight arrives. The only
route to the advertised rate is to arrange for each fetched number to be used
many times before it is discarded.

That ratio has a name. Operations performed per byte loaded from memory is
called [arithmetic intensity](https://arxiv.org/abs/2403.14123), and it is a
property of the work rather than of the chip.

Both of its extremes are already familiar.
[Training](/learn/how-models-are-trained) reads text in large batches, many
stretches at once, so every weight the chip
fetches gets multiplied against every stretch in the batch before being thrown
away. Hundreds of operations per byte. The arithmetic units stay busy and the
chip runs somewhere near its headline figure. Now take
[generation](/learn/how-a-language-model-works), which produces one token,
appends it to the input, and runs the whole model again for the next one. Each
token needs the one before it, so nothing can be done in parallel. The
accelerator reads the entire set of weights out of memory, uses each one
exactly once, and emits a single token. One operation per byte. The arithmetic
finishes long before the reading does.

**An accelerator's headline speed is the speed of its arithmetic, and the
arithmetic is almost never what you are waiting for.**

Time is not the only thing the fetching costs. A 2016 paper proposing hardware
built around this asymmetry stated the other half of it flatly: fetching
weights from memory
["is two orders of magnitude more expensive than ALU operations"](https://arxiv.org/abs/1602.01528)
— the arithmetic units' own work — "and dominates the required power." Roughly
a hundred times more energy goes into carrying a number to the multiplier than
into the multiplication itself. The arithmetic is not merely fast. On this
hardware it is nearly free, and it has been the cheap part for a long time.

What follows from that asymmetry commercially, including why input and output
are billed at different rates and why the first token behaves unlike the rest,
is worked out on [how inference is served](/learn/how-inference-is-served).

## What fits decides what runs

Bandwidth governs how fast the weights arrive. Capacity decides whether they
can be there at all. An accelerator's memory is its own, and it is not the
computer's main memory. Anything read from further away comes at a fraction of
the speed, so in practice the weights must sit in the accelerator's own memory
or the model does not run on that accelerator.

A model too large for one chip gets cut into pieces spread across several, and
every piece's output must then be shipped to whichever chip holds the next
piece. Falling short on memory does not slow a model down a little. It converts
a problem inside one machine into a problem between machines — a different kind
of problem, and a worse one.

Hence the standard move of [storing each weight in fewer
bytes](/wiki/technique/quantization). It pays off against both numbers at once.
The weights fit where they did not fit, and fewer bytes per weight means fewer
bytes to move per token, so the model also speeds up in the mode where speed
was bandwidth all along.

## A training cluster is a network with chips in it

Nothing at the frontier fits on one accelerator, or one machine, or one rack.
The [published account](https://arxiv.org/abs/2407.21783) of a large 2024
training run describes accelerators installed eight to a server, each server's
eight sharing a direct link between them, with up to sixteen thousand of those
accelerators joined by a dedicated network.

Read that description again and notice that it is a hierarchy of distances.
Weights already inside an accelerator's own memory are the closest thing to
hand. A number that has to reach the accelerator beside it, over the direct
link inside the server, has travelled further and arrives later. A number that
has to leave the server and cross the room over the network arrives later
again. Each tier outward is slower than the one nested inside it, which is the
only reason to build the tiers at all.

That is why where a model is cut matters as much as how many chips it is cut
across. Split it at a seam where little has to cross, and the cluster behaves
something like one enormous accelerator. Split it badly and thousands of
expensive chips spend their time waiting on cable.

The network, then, is not plumbing around the computer. It is part of the
computer, and the reason is [the training step
itself](/learn/how-models-are-trained). Each accelerator works through its own
slice of the text and computes its own corrections to the weights. Those
corrections are all corrections to one model, so before the next step can begin
they have to be summed across every accelerator in the cluster. The step rate
is the rate of that exchange. Arithmetic you cannot feed and cannot synchronise
is arithmetic you did not buy.

Synchrony has a second consequence. Because every accelerator must reach the
same step together, one failure anywhere can require restarting the whole job,
and at this scale hardware breaks continuously. That same account records 466
interruptions across a 54-day stretch of training, 419 of them unplanned,
roughly 78 percent of those traced to confirmed hardware faults. That is an
interruption about every three hours, for weeks.

The engineering answer is not to prevent failure; that is not on offer. It is
to make resuming cheap, by writing the full state of the run to storage often
enough that a crash costs minutes instead of days, then restarting and
continuing. The same team reports keeping more than 90 percent of elapsed time
as useful training. A frontier run is not a long calculation that happens to be
large. It is a distributed system with a fault every few hours, running for
months, and finishing at all is the achievement.

## The second number comes from a different factory

The two rates are bought from two different supply chains, which is why a
shortage here is rarely a simple shortage of chips.

Arithmetic comes from the logic die, the slab of patterned silicon at the
centre of the package. Its smallest features are printed by lithography
machines using extreme ultraviolet light, and
[as of 2025](https://en.wikipedia.org/wiki/Extreme_ultraviolet_lithography) a
single company was the only producer and seller of them, with a prototype built
in China reported that December.

Bandwidth is bought another way entirely. Moving bytes that fast requires the
memory to be physically close, so memory chips are stacked in towers of as many
as thirty-two, wired to each other by vertical connections driven straight
through each chip, and the finished tower is mounted beside the processor on a
[shared base](https://en.wikipedia.org/wiki/High_Bandwidth_Memory). That
assembly step is called packaging, and it has its own scarce capacity and its
own queue. An accelerator company can have every logic die it ordered and still
ship nothing.

That construction also answers something the capacity wall left open. An
accelerator holds far less memory than an ordinary desktop machine does, which
looks like an odd economy on a component this expensive. It is small for the
same reason it is fast. The memory has to sit right beside the processor, and
beside the processor is not much room.

The industrial consequences of a chain this narrow are
[somebody else's subject](/learn/who-builds-ai). What the machine explains is
why the narrow places are narrow. Fabrication and packaging are not designs
that a competitor can copy. They are working plants, and a plant takes years.

Once you know to look for the shape, it is at every scale of this machine. A
chip waits on its memory. A server waits on its network. A company with a
warehouse of finished logic dies waits on a packaging queue. At each level the
computing was the part that was ready and the moving was the part that was not,
which is worth carrying into any claim about what this hardware will do next.
The calculating was never the expensive part.
