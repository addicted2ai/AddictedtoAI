---
title: Machines that act in the world
level: foundations
outcome: >-
  You can say why a system that moves something is a different problem from a
  system that writes something, name what such a system has to be trained on
  and where those examples come from, and ask the question that separates a
  demonstration from a deployment.
prerequisites:
  - the-kinds-of-models
  - why-models-are-confidently-wrong
  - what-ai-is-used-for
mentions: []
---

A robot vacuum noses out from under the bed, meets a chair leg, and picks its
way around it. A car on the motorway drifts toward the lane line, and the
wheel eases it back. Sort these the way [the page that brought you
here](/learn/the-kinds-of-models) taught, by what goes in and what comes out,
and half of the method works. What goes in is familiar: camera frames, the
readings of the machine's own wheels. What comes out is not. Every family on
that page ends in something made for a person. A label, a ranking, a
transcript, a paragraph, a picture: whatever arrives, somebody reads it.
These machines are the family that page did not show. What they put out is a
movement, and nobody reads a movement. It happens.

So the car holding its lane is exactly as much AI as the chatbot. Underneath
is the machinery you know, weighted sums stacked in layers, trained by
computed blame, and none of it changed on the way to the steering wheel. What
changed is where the output lands. Everywhere else it lands in front of a
person. Here it lands on the world. That one relocation produces both of the
facts this page is for: what this family has to be trained on, and what
happens to checking when an output cannot wait to be read.

## The pile that has to be performed

[Training](/learn/learning-from-examples) turns a pile of solved cases into
behaviour, and every pile you have met had the same shape: something on the
left, the right answer for it on the right. Write down the pair this family
needs and the trouble is already visible. On the left, a situation. On the
right, the movement that was correct in it.

Now ask where the other piles came from. The text a language model reads was
written by people over decades, for their own reasons, and was still sitting
there when the machines came to read it. The photographs had been taken,
captioned and kept. The recommender's pile writes itself out of everyone's
taps at once. The prices differed, tagged photographs cost paid labelling
time and taps cost nothing, but every one of those piles shares a property so
obvious it is easy to miss. The examples are artifacts. A sentence, once
written, persists. It can be copied in a millisecond and read by a thousand
machines at once.

A movement is not an artifact. Steering around the chair leg leaves no record
of the chair, the steering, or whether it worked. People have handled the
physical world superbly for the whole of history, and almost none of that
skill survives as data, because acting on the world, unlike writing about it,
does not archive itself. **Every other family's pile was lying somewhere,
waiting to be collected. This family's has to be performed, one example at a
time, at the speed of the world.**

Performed is the precise word. Recording can be arranged. The acting still
has to happen. Fit cars with recorders and every mile a person drives becomes
a solved case, and a mile of examples still costs a mile of driving. Stand
beside the robot and steer its arms through the job by hand while it records
what the controls did, and one example costs one performance of the job. Ten
years of the internet's text can be read in an afternoon of computing. Ten
years of driving takes ten years, and yields nothing unless the recorders
were running from the start.

The recommender got its examples at a price no other family could match. This
family anchors the other end of that same axis. No family pays more.

## The bet that does not transfer

The price would be a curiosity if examples were one ingredient among many.
They are close to the whole recipe, and the winning move nearly everywhere
else, for a decade, has been the blunt one: get vastly more of them and build
a machine big enough to use them. More and better examples usually help, and
the move has a precondition so
quietly satisfied elsewhere that it became invisible — the pile had to exist
already, or write itself faster than anyone could spend it. Where it did,
abundance could simply be taken. Here it cannot. A field that wants machines
to act must manufacture its own abundance first, and the manufacturing runs
at the speed of arms, wheels and days.

That, and not any ranking of which problem is deeper, is the honest reason
this family improves on a different clock from the one the chatbots run on.
It is a statement about supply. Hold on to it, because it predicts more about
this corner of the subject than any demonstration does.

The standing attempt to escape the shortage is to let the machine perform its
examples where performing is free: in a simulation, a practice world written
in software, where time runs as fast as the computers allow and a fall breaks
nothing. It helps enough to be standard practice, and its limit is one you
already hold. The first page of this surface said there are two ways to make
software, write the rules by hand or let behaviour be learned from examples.
A practice world is the first kind standing in for the second's missing
ingredient: rules, written by a person, in advance, pretending to be a world.
A [trained system learns the pattern in its pile, including the pattern
nobody meant to put there](/learn/learning-from-examples), so a machine
raised in a written world learns that world exactly, down to its convenient
omissions — the glare, the slack in a cable, the floor that gives a little,
the thousand small frictions nobody wrote in because nobody knew they were
load-bearing. The gap between the practice world and the real one is not a
defect awaiting a patch. It is the original problem back in disguise, because
writing out the world in full is exactly what the whole subject exists to
avoid doing.

## An event, not a proposal

The second fact begins on a page you have read. A model's answer arrives
[unchecked by anything in the process that made
it](/learn/why-models-are-confidently-wrong). What has made that livable
everywhere else is an interval. A wrong paragraph is a proposal. It sits on
the screen, costing nothing, until a person decides what it is worth, and
[everywhere AI already does real work](/learn/what-ai-is-used-for), something
stands inside that interval: your own eye on the chatbot's answer, the editor
over the translation, the undo under the photograph, the test the code must
pass before it ships.

A movement has no interval. What comes out of these machines is not a
description of proposed steering, rendered for approval. It is the steering.
By the time anyone could check it, it is not a candidate for the world's next
state. It is the world's next state, and the world keeps no undo. The one
arrangement that made unchecked outputs safe to live with, a person between
the output and its consequences, is deleted by the output itself.

So the checking moves. It cannot come after. It has to be built in, and it
has to finish inside whatever time the physical situation allows, which for a
car drifting out of its lane is a fraction of a second. Look closely at any
machine trusted to act near people and most of what you are looking at is
that built-in checking, arranged around the learned model rather than inside
it. The speed is capped, so that the worst movement on offer stays
affordable. The reach is fenced with hard limits that were never learned from
anything, written the old way, rule by rule, and the learned behaviour cannot
cross them whatever it computes. And there is always a stop, for the machine
when its own readings stop making sense and for any person watching, because
motionless is the one output that is almost always safe. Around a machine
that moves, the oldest kind of software stands guard over the newest,
stationed at exactly the points where a mistake would stop being retrievable.

## What the footage cannot show

You already hold the rule that [a demo is not a
deployment](/learn/what-ai-is-used-for), and that a deployment is the
software plus everything built to survive its being wrong. In this family the
distance between the two is the widest it gets anywhere, and both of this
page's facts are why. The footage of a machine performing a task is real. It
is also a handful of performances from a pile whose size you were not told,
under conditions its makers chose, and a machine wrong once in every ten
tries can still supply an hour of flawless film. Everything that would turn
the film into a product is the part that does not film: the capped speed, the
fenced reach, the stop, and the long dull accumulation of performed examples
and measured errors showing that the mistakes stay affordable across hours
and streets nobody picked in advance.

Two questions this page has not opened are real, and each has its own page:
what machines that act mean for [the people whose work is
acting](/learn/ai-and-work), and who answers when a movement [lands on
someone](/learn/where-ai-fails-people) who never chose to stand near the
machine.

What you keep is the question in its final form. One page taught you to ask
what a system learned, and from what. Another sharpened it: what was paired
with what? For a machine that acts, sharpen it once more, and put it to every
demonstration this subject shows you from now on. At what rate is it wrong,
over how much exposure was that rate measured, and who chose the conditions?
A machine that comes with answers is a deployment, however dull it looks. A
machine that comes with footage is a demonstration, however long it has
already been driving.
