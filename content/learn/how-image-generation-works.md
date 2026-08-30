---
title: How image generation works
level: mechanics
outcome: >-
  You can trace a prompt through a diffusion model — noise, denoising and the
  text that steers it — and say why the classic failures looked the way they
  did.
prerequisites:
  - the-kinds-of-models
  - how-machines-represent-meaning
mentions:
  - event/stable-diffusion-release
  - concept/embeddings
  - concept/tokenization
---

Take a photograph and ruin it. Draw a random number for every pixel, add them
in, and the picture dims under a layer of static. Do it again. A few hundred
rounds later there is nothing left to look at, only a field of random numbers,
and no way to tell which photograph you started from, because every photograph
ends here. That is the one useful property of destruction. It has a single
destination, and the destination is the cheapest thing a computer can make.

[The page that sorted the families](/learn/the-kinds-of-models) left a problem
open. Training needs a way to mark a guess, and a guessed picture cannot be
marked, because the description it was drawn from fits countless pictures and
only one of them is sitting in the pile. Diffusion is the answer that stuck,
and it is not a better way to grade pictures. It is a way of not asking for
one.

## Asking for the static instead

Here is the training step, whole. Take a real picture from the pile. Pick a
noise level at random, anywhere from a faint haze to total destruction. Draw
the noise yourself, add it at that strength, and hand the result to the network
along with the number saying how much you added. Then ask one question: what
was the noise?

You drew it. You have it. So the guess can be marked against the answer
exactly, at every pixel, the way a guessed label was marked against a stored
label. The unmarkable problem has been swapped for a markable one, and the swap
costs nothing, since a single photograph yields as many exercises as you have
patience for. Same picture, fresh noise, a different level, a new question
every time.

Notice that the network is not being taught what pictures look like. It is
being taught what static looks like in the presence of a picture. The 2020
paper that turned the idea into a working image model describes the network in
six words, as ["a function approximator intended to
predict"](https://arxiv.org/abs/2006.11239) the noise from the noisy image.
Nothing in that description mentions pictures at all.

Pictures come out anyway. To name the static, the network has to hold an
opinion about what is underneath it. At a faint haze the opinion
barely matters, because almost everything on the canvas is picture and nearly
anything that is not picture is noise. At heavy destruction the opinion is the
entire job: deciding which part of a field of random numbers is signal requires
a view about what signals look like. Training runs at every noise level, so
both extremes are forced into one network, and the second one is the view worth
having.

## Starting where every picture ends

Now run the road backwards. Draw a field of random numbers from scratch.
Nothing was destroyed to produce it, which is exactly the point: it is
indistinguishable from what a destroyed picture becomes, so the network cannot
tell the difference and treats it as a picture with everything taken away. Ask
for the noise. Subtract a fraction of what it names. Ask again at the next
level down. Twenty or fifty rounds of that and a picture is standing there.

The shape of this was set out [in 2015](https://arxiv.org/abs/1503.03585) by
researchers borrowing from statistical physics, who proposed to
"systematically and slowly destroy structure in a data distribution through an
iterative forward diffusion process" and then to "learn a reverse diffusion
process that restores structure in data". Restore is the word to be careful
with, because the obvious reading of it is wrong.

Nothing is being restored. There was never a picture under the noise and the
network is not uncovering one. Take its estimate at the first step and subtract
the whole of the noise it names rather than a fraction, and you are looking at
the picture it currently takes to be underneath: a formless smear, the colour
of everything averaged together. That is not a failure. It is the correct
answer, because a field of pure noise is consistent with every picture at once,
and the smear is what all of them look like at the same time.

Useless as a picture, then, and perfect as a direction, which is the reason the
loop only ever takes a fraction. Step a little way
toward the smear, put back a little fresh noise, and the field is no longer
quite the field you started with. Fewer pictures are consistent with it now.
Ask again and the average comes back slightly less formless, because it is an
average over a smaller set. That is the whole engine. A diffusion model does
not find a picture in the noise; it narrows, a step at a time, the set of
pictures the noise could still turn out to be.

Which raises the question of where the narrowing gets its opinions, and the
answer is that it does not have any. Two runs from two different starting
fields give two different pictures with nothing else about the system changed.
The starting field is the whole of the difference. Every commitment the picture
ends up making, this face and not that one, the light coming from the left, was
settled by which random numbers happened to be sitting where at the moment the
averaging tightened past the point of return. The number that reproduces a
starting field is called a seed, and a seed is not a style setting or a quality
dial. It is the complete list of tie-breaks.

One practical note changes the arithmetic without touching the argument. Real
systems mostly do none of this on pixels. The picture is squeezed first into a
much smaller grid of numbers that stands in for it, the loop runs there, and
the result is expanded back at the end. That compression is why the release
that [put image generation on ordinary home
machines](/wiki/event/stable-diffusion-release) in 2022 fit inside the memory
of a gaming graphics card. Everything here is described in pixels for
readability and holds for the stand-in.

## What the words actually do

So far the network has no way of being told anything. It sees a noisy field and
a noise level, and it will produce some picture, unbidden and unrelated to
whatever you had in mind.

Give it a third input. [The shared map](/learn/how-machines-represent-meaning)
is what makes that possible: photographs and their captions, trained together,
land on one map, so a typed phrase has a position among pictures, in the
only form a network reads, which is [a list of
numbers](/wiki/concept/embeddings). During training the caption that came with
the photograph was supplied along with the noise level. The question the
network answered was never quite *what was the noise*. It was *what was the
noise, given that the picture underneath was described like this*.

That single change is the whole of text-to-image. It takes effect at every
step, all the way down, and never only at the start. A prompt is a term in the
estimate rather than an instruction the system carries out, present at each of
the few dozen tie-breaks, tilting every average toward the region of the map
where its own position sits.

The tilt has a volume control, and knowing how it works explains a slider you
have probably dragged. Ask the network twice at each step, once with your
prompt and once with nothing, and the difference between the two answers is the
part of the estimate your words are responsible for. Amplify that difference
and the picture obeys you harder. The [2022 paper that introduced
this](https://arxiv.org/abs/2207.12598) describes jointly training "a
conditional and an unconditional diffusion model" and combining their estimates
"to attain a trade-off between sample quality and diversity", and the trade-off
is the part to keep. Turn the dial up and the pictures track your words more
closely and start to resemble each other. Turn it down and they diverge,
occasionally into something better than you asked for, more often into
something you did not ask for at all.

The map brings its defects along too. Nearness on it is company kept rather
than likeness, so a phrase and its flat denial land close together. *A street
with no cars* sits almost on top of a street with cars, and the system draws
the cars. This is not a model failing to understand the word *no*. Nothing in
the mechanism has anywhere to put a word. It has a position, and the negation
is what fell out on the way to the position.

None of this has stayed as bad as it was, and the improvement arrived on the
reading side rather than the painting side. A [result published in May
2022](https://arxiv.org/abs/2205.11487) reported that "increasing the size of
the language model" in a text-to-image system "boosts both sample fidelity and
image-text alignment much more than increasing the size of the image diffusion
model". A better reader of the sentence bought more than a better painter of
the picture.

## Graded by area

Go back to the training step and look at what the marking does. The guess is a
grid of numbers, the answer is a grid of numbers, and the score is the
difference at each location, summed. Every location counts once. A patch of sky
in slightly the wrong blue is tens of thousands of locations wrong, and the
loop hunts that down with everything it has.

**A sixth finger is wrong in a few hundred pixels, and pixels are the only
thing the score has ever counted.**

Nothing in the loop knows what a hand is, or that hands come in a number. There
is no step at which anything counts anything. Each pass asks the same question
about static, and a hand with six fingers answers it beautifully: every finger
is a well-formed finger, every knuckle sits where a knuckle sits, the shadows
fall correctly and the skin is right. The error is not in any region of the
picture. It is in a relation between regions, and a relation occupies no area.

Which is a rule you can apply before typing anything. Find the part of what you
want that will occupy almost none of the finished picture. That is the part
that will be wrong.

Counting is the obvious case, in fingers and in a request for five apples.
Lettering is
another, because whether a sign reads OPEN depends on the identity and order of
four small shapes, and those shapes are a rounding error against the rest of
the frame. Symmetry across a gap fails the same test, which is why a pair of
glasses gets two different arms. So do long thin things that must connect at
both ends, chains and cables and guitar strings, where every stretch is locally
impeccable and the object as a whole goes nowhere. And so does anything
required to agree across the frame, two shadows cast by one sun, a reflection
that has to match what stands in front of it.

Lettering has a second cause stacked on the first, and that one was measured.
Text reaches the model in pieces drawn from a fixed vocabulary, common words
arriving whole, a step called [tokenisation](/wiki/concept/tokenization).
Nothing in that input tells the model that OPEN is made of O, P, E and N. A
[December 2022 paper](https://arxiv.org/abs/2212.10562) found that "popular
text-to-image models lack character-level input features, making it much harder
to predict a word's visual makeup as a series of glyphs", and closed much of
the gap by letting the part of the system that reads the prompt see individual
characters. Twice now the repair has landed on the reading side rather than the
painting side.

One caution about how to hold all of this. It tells you what your own generator
will get wrong this afternoon, which is a different job from telling a
generated picture from a photograph. That second job has [a page of its
own](/learn/when-you-cannot-trust-your-eyes), and the short version of it is
that any tell good enough to publish has a short life. The failures above are
famous, which is exactly why they are the ones that got worked on.

## Getting on partway down

The noise levels form a ladder, and pure noise is only the top rung. Add noise
to a real photograph at some middling strength and you get a field still
arranged like the photograph and stripped of its details. Hand that to the loop
with a new prompt and it denoises down to a picture carrying the old
arrangement and the new subject. A [2021 method](https://arxiv.org/abs/2108.01073)
that set this out describes it in a line: it "first adds noise to the input,
then subsequently denoises the resulting image". Your tool calls this
image-to-image, and the slider marked strength is doing something very literal.
It picks the rung you get on.

Which explains the slider's one maddening property. It is one-dimensional,
because the destruction is. Whatever survives at your chosen rung survives
together, and the order of loss going up the ladder is broad layout and colour,
then the identity and pose of what is in the frame, then texture and fine
detail. There is no setting that keeps the arrangement and swaps the animal,
because those two are decided a rung or two apart.

Inpainting is what you reach for instead, and it changes less than you would
expect. Mask the region you want redone and run the same loop, with one
addition: at every step, everything outside the mask is overwritten by the
original picture, noised to that step's level. A [2022
method](https://arxiv.org/abs/2201.09865) describes altering nothing else about
the process: to steer it, "we only alter the reverse diffusion iterations by
sampling the unmasked regions using the given image information".
The model's freedom is confined to the mask while it sees the correctly noised
surroundings at every step it takes, which is why an inpainted patch inherits
the light and the grain around it instead of looking pasted on.

It also explains the limit. Masking the bad hand and running it again gets you
a new hand, drawn under the same score that did not count fingers the first
time. You changed the tie-breaks. You did not change what is being graded.

## The same thing with a clock

Video is this machinery with one more axis. What gets denoised is a stack of
frames rather than a single image, the score sums across the whole stack, and
so the network's estimate at any point is conditioned on its neighbours in time
as well as in space. A [2022 paper](https://arxiv.org/abs/2204.03458)
introducing this called its design "a natural extension of the standard image
diffusion architecture".

The constraint is what is new. A thing has to stay the same thing from the
first frame to the last, and identity across time is exactly the sort of
property that fails the area test. It lives in the relation between frames, it
occupies no area, and nothing in the loop holds a record of *that object* to
check anything against. So the characteristic video failure is drift. Objects
turn slowly into other objects, a thing that passes behind something comes back
subtly altered, a face is the same face for two seconds and somebody else's by
the fourth. The same paper names "temporally coherent high fidelity video" as
the milestone being worked toward, which tells you the difficulty was
understood from the start. And the cost follows the stack, because the score
now runs over a volume rather than a surface, so everything about a second of
video is multiplied by the frames inside it.

## What you are actually supplying

Nothing in this process takes a request and carries it out. You supply two
things and neither is an instruction: a field of random numbers that will
settle every tie, and a position on a map that will tilt every estimate. The
grading in between counts pixels, because pixels are the only thing there is to
count.

So the useful question, before you type, is not how to describe the thing
better. It is which part of the picture in your head is carried by almost no
pixels, because that part has nothing defending it, and it is the part you will
end up masking and drawing again. The machine was never asked for what you
meant. It was asked, a few dozen times, what static looks like, and the picture
is what fell out of being right.
