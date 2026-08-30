---
title: How software learns from examples
level: orientation
outcome: >-
  You can explain how a program can be trained rather than written, why more
  and better examples usually help, and why a trained system can fail on
  anything it never saw.
prerequisites:
  - what-ai-actually-is
mentions:
  - event/imagenet-2012
---

A million junk emails sitting on a disk teach a computer nothing. Examples on
their own are inert, however many you pile up, and training is so far just the
name for whatever turns the pile into behaviour. Inside that black box is one
small procedure — the same one under the spam filter, the photo search and the
chatbot — and it is simple enough to hold in your head whole.

## Guess, score, nudge

Software built to be trained starts with millions of small adjustable numbers
inside it. Think of dials. Together, the dial settings decide what the
software does with whatever it is shown, and before training they are set at
random. Ask the untrained thing whether a photo shows a beach and its answer
is a coin flip. That is the intended starting point.

Then the loop begins. Take one example where the right answer is known because
a person supplied it: a message someone marked as junk, a photo someone
tagged. Let the software guess. Measure how wrong the guess was, as a single
number. Nudge every dial a tiny amount, in whichever direction would have made
that guess slightly less wrong. Move to the next example. That is the entire
procedure: guess, score, nudge, millions upon millions of times around the
pile, until the guesses come out right.

Notice what the loop never contains. Nobody explains junk mail to anything. No
rule is stated and no reason is given, and no single example teaches much on
its own, because one nudge barely moves anything. The only signal that ever
flows back into the software is that one number, meaning a little worse or a
little better and nothing else. Everything the finished system appears to
understand arrived through that channel. And because the final settings
accumulated rather than being designed, nobody can point at a dial afterwards
and say what it knows. The settings work. That is all anyone can read off
them.

## Graded only on what it never saw

There is a trap in the loop's own logic, and the field's whole way of keeping
score exists to avoid it. Perfect marks on the training pile are worth
nothing, because a filing cabinet can get them: store every example with its
answer, look each one up on demand, flawless. If memorising the pile were the
goal, no dials would be needed. The point of training is behaviour on things
that are not in the pile: junk the filter was never shown, a beach
photographed this morning. When the learned pattern carries over to cases the
system never met, that is called generalising, and it is the entire product.

So trained software is graded like a student the examiners do not trust.
Before the loop starts, part of the pile is locked away, and the finished
system meets those examples cold. Its score on them is the only score that
means anything, and the honest version of every accuracy claim you will ever
read was measured this way. The [ImageNet contest of
2012](/wiki/event/imagenet-2012), the most famous scoreboard in the field's
history, was this exam at full scale: entrants trained on a vast published
pile of labelled photographs and were ranked on photographs whose answers were
held back. The winner was the entry that had learned the most from its
examples rather than being handed the most by its designers, and it finished
so far in front that the scoreboard reads like two kinds of software sitting
one exam.

## It learns what the pile shares, not what you meant

The loop rewards whatever lowers the wrongness score, and that is the whole of
its morality. It cannot tell the pattern you meant from a pattern that happens
to ride along in the pile. Suppose the photographs gathered to teach a system
to spot cows nearly all show a cow standing on grass, cows living where they
live. Learning grass scores almost as well as learning cows, and grass is
easier. A system trained on that pile finds the cow in every meadow, misses
the one standing on sand, and never had a way to notice, because on the
examples the shortcut and the truth agree. **A trained system learns what its
examples have in common, not what you meant them to have in common.**

That is most of why more examples help. Volume does not bring wisdom; it kills
coincidences. A shortcut that holds across a thousand photographs rarely
survives ten million, while the pattern you actually wanted is, by definition,
in all of them. It is also why better examples matter, and better means two
plain things: answers that are actually right, since a mislabelled example is
taught with the same diligence as a correct one, and variety that resembles
what the system will face, since the loop can only pass on what is there. The
pile is not study material about the world. As far as the software is
concerned, the pile is the world.

That sets the ceiling, and it explains the strangest failures. Between its
examples a trained system fills gaps remarkably well. Past their edge there is
nothing to fill with. Shown something unlike everything it trained on, it
still answers, because dials produce an output for any input whatsoever, but
there is no longer a reason for the answer to be good. No pile of daylight
photographs ever taught a system about the dark.

## The loop is over before you arrive

One more property of the loop matters more than it seems: it stops. Training
and using are separate eras in the software's life. The loop runs before
release, at great expense, on a pile assembled in advance, and then the dials
freeze. What ships is the frozen result, copied out to wherever the work
happens. Training happened once, somewhere else; using happens constantly,
everywhere. The filter that judged your mail this morning was not learning
from your mail this morning. The nudging ended before you ever met it.

So when you click "report junk", you are not correcting your filter in the
moment. You are donating one labelled example to a future pile, and the change
arrives later, if a new training run learns from it and the new settings
replace the old. That frozen bundle of settings is called a model, and it has
[a page of its own](/learn/what-a-model-is).

Keep the loop in view the next time a trained system fails you in some
baffling way, because the failure will make a new kind of sense. Nothing
broke. The loop did what it always does, somewhere else and some time ago, on
a pile with its own patterns in it, and your case fell outside them. What
looks from outside like a machine being stupid is, from inside, a machine
being faithful to examples you never saw.
