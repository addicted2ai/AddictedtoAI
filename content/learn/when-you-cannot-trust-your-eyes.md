---
title: When you cannot trust your eyes
level: foundations
outcome: >-
  You can explain why spotting generated media by eye stopped working, what
  watermarks and provenance labels can and cannot promise, and where the trust
  problem actually has to move.
prerequisites:
  - the-kinds-of-models
mentions:
  - event/stable-diffusion-release
---

In 2018 three researchers published a way to catch a faked video of a person,
and it came down to watching the eyes. The faces did not blink. [Their
paper](https://arxiv.org/abs/1806.02877) gives the reason in a line, and the
reason is the whole of this page: "most training datasets do not contain faces
with eyes closed." Nobody uploads the frame where the subject was mid-blink. The
collections of photographs those machines learned from held almost no closed
eyes, so the faces they produced never closed theirs.

Look hard at what that tell was. It was not a property of fake video. It was a
gap in one pile of photographs, showing through. Fill the gap and the tell is
gone, and filling it is a fortnight's work for anyone who knows it is there.

Every giveaway you have ever been handed is of this kind. Hands with too many
fingers. Lettering on a shop sign that dissolves into nonsense when you look at
it directly. Each was one generation of machine failing at one thing at one
moment. The researcher who wrote the blink method [described it two years
later](https://www.scientificamerican.com/article/detecting-deepfakes1/) as
detection "based on the lack of realistic eye-blinking in the early generations
of deepfake videos" — a deepfake being a video in which someone's face or voice
has been replaced by a machine's. Early generations. He was scoping his own
result, and the scope is the finding.

## A test is a training signal

Someone fixing a known flaw is ordinary engineering, and that alone would retire
every tell on a schedule. What sits underneath is less comfortable.

[The page that brought you here](/learn/the-kinds-of-models) left you with a
generator as a recogniser's pile read backwards, and with the reason the
backward direction is the hard one. A guessed label can be marked against the
single right answer sitting in the pile. A guessed picture cannot, because a
description has countless faithful pictures, and punishing every difference from
the stored one punishes the good guesses too.

There is one way to score a guessed picture anyway. Build a recogniser whose job
is real or generated, image in and label out, and use its verdict as the score.
This is not a thought experiment. It is an entire family of generator,
[proposed in 2014](https://arxiv.org/abs/1406.2661) as two networks trained
against each other: one making images, the other estimating whether a sample
came from the real collection or from the maker, with the maker trained to
maximise the chance that the judge gets it wrong. The stated solution of that
training is the point where the judge does no better than a coin flip. **Any
tell good enough to teach is good enough to train against.**

Not every generator is built that way. The image models most people met after
[weights anyone could download appeared in
2022](/wiki/event/stable-diffusion-release) work on a different principle. The
pressure survives the difference by slower routes. A published tell is a
specification, and the people building generators read the same papers as the
people writing the tips.

Sharper still is the route with no engineering in it at all. Anyone setting out
to deceive you makes many images and sends one. Every image they threw away was
thrown away for looking wrong. So the generated pictures that actually reach you
have already been filtered by every tell their maker knows, which is every tell
that has been published. The advice fails hardest on exactly the images it was
written for.

Software detectors sit inside the same logic, and being exact about them matters,
since alarm and dismissal are the same error in different clothes. A detector is
a recogniser, so it inherits a recogniser's ceiling: it [learns what its examples
have in common](/learn/learning-from-examples), and its examples are the
generators that existed when it was trained. Whatever accuracy it reports was
measured against those. Next year's generator cannot be in that pile, and past
the pile's edge a trained system still answers with nothing making the answer
good. None of which makes forensic work futile. A laboratory with the original
file, the camera it is claimed to come from and a month to spend is not doing
what you do squinting at a phone. What ended is the amateur version: a reader,
unaided, ruling on the artifact.

## What doubt costs

The arithmetic here is lopsided, and the lopsidedness is the point. A convincing
fake has to work once. Doubt has to be maintained about everything, by everyone,
permanently. So the cheap move was never to build one perfect forgery. It was to
make forgery ordinary, because once it is, every genuine recording becomes
deniable.

Two law professors [named that in
2019](https://www.californialawreview.org/print/deep-fakes-a-looming-challenge-for-privacy-democracy-and-national-security):
the liar's dividend, the benefit that accrues to a person caught on tape who now
need only say the tape is fake. Their sharpest line is the one that should
govern how anybody writes about this subject. The dividend, they wrote, "flows,
perversely, in proportion to success in educating the public about the dangers
of deep fakes."

Take that as an instruction rather than an observation. Teaching people to
distrust what they see is not a free defensive act. It is the resource the liar
spends. A list of spot-the-fake tips makes a small deposit into that account,
and the tips have a shelf life besides. Which is why this page has given you
none and will not.

## Marks in the pixels

A watermark is a signal put into a file when the file is made, saying this came
from a machine. It can be plain, a logo in the corner, or hidden in small
adjustments to the pixel values, under the threshold an eye picks up and
readable by software that knows the pattern. What it promises is narrow and
real. If the mark survives and reads, the file came from something that marks.

Anything that rewrites the pixels enough carries it off. Crop, re-encode,
screenshot, photograph the screen. In 2023 a group of researchers [showed the
removal could be generic](https://arxiv.org/abs/2306.01953) rather than done
scheme by scheme: add noise to the image, reconstruct the image, and the hidden
mark does not survive the round trip. They were careful about what still stood
up. Marks tied to the picture's meaning rather than to its pixel values resisted
the attack, and that, they argued, is where the effort belongs.

Robustness is not the binding limit anyway. A watermark marks the cooperative.
Marking is a courtesy of the service, not a property of the model, and the model
is often a file on somebody's disk. Anyone intending to mislead you reaches for
a generator that does not mark. The marks land on the output of people with
nothing to hide, and an unmarked image tells you nothing whatever, because
almost every image in the world is unmarked.

## A seal on the chain

Provenance runs the other way. Instead of marking what is synthetic, it vouches
for a file's whole history, whatever that history holds. The [Content
Credentials standard](https://c2pa.org/) is the current shape of it: a camera or
an editing tool attaches a record of where the file came from and what has been
done to it since, in what its authors call "tamper-evident, cryptographically
signed data structures". The seal is the whole of it — alter either the record
or the file, and the seal breaks visibly. They compare the result to a nutrition
label.

That analogy is more honest than most of what gets claimed for the technology,
and it should be taken seriously in both directions. A nutrition label lists
what is in the package and says nothing about whether you should eat it.
Provenance can certify that a particular camera recorded light at a stated time
and that nothing has changed since. It certifies nothing about what stood in
front of the lens. A staged scene, honestly photographed and correctly signed,
is a correctly signed lie.

The other direction is harder. A package with no nutrition label is not poison.
It is unlabelled. Strip the record and an ordinary file is left, and ordinary
files are nearly all of them. So the verdicts run one way only: a credential can
raise your confidence in a file, and a missing credential can never lower it.
The standard's own answer to stripping, in its published questions and answers,
is to fall back on invisible watermarking to find the record again, which is the
technique of the last section propping up the technique of this one. It is a
limit rather than a defect, once you stop asking a provenance system to be a
detector.

## The question that still has an answer

Everything above converges away from the image. The eye lost, and the fix is not
a better eye.

"Is this real?" is on its way to being unanswerable from the artifact alone, and
looking harder will not bring the answer back. It was never the question doing
the work. Where did this come from, who is standing behind it, and what happens
to them if it turns out to be false: those are answerable, they are answerable
by anybody, and the answers do not expire when the generators improve. The first
of them has a name courts and newsrooms have used for a very long time. Chain of
custody is the record of who held a thing, and when, from the moment it was made
to the moment it reached you.

So the habit changes shape. An image arrives with a claim attached, and instead
of interrogating the pixels you walk backwards along it. Who published this
under their own name, who says they were there, and whether anyone will produce
the original. Those questions decided such matters long before there was
anything to generate, and they have the advantage of being about people, who can
be asked and can be held to what they said.

The strange part is not that this is work. It is that photography made it so
easy for so long that we stopped noticing it was ever the job.
