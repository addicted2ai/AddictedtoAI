---
title: Why a model is confidently wrong
level: orientation
outcome: >-
  You can explain why a false answer arrives in the same confident prose as a
  true one, why "I don't know" is a rare output rather than a missing feature,
  and which kinds of scaffolding actually lower the error rate.
prerequisites:
  - what-a-model-is
mentions:
  - concept/hallucination
  - technique/reinforcement-learning-with-verifiable-rewards
---

Ask a chatbot for the source behind something it just told you, and the answer
can be a small work of art. An author whose name you half recognise. A title
that sounds exactly like the papers in that field. A journal that publishes
that sort of work, a year in the right range, even page numbers. Copy the
title into a search engine and, some of the time, there is nothing there. No
such paper exists. The citation was assembled for you on the spot.

To see how that is possible, start with what an answer physically is. A model
produces text a piece at a time, each piece picked from its ranked list of
what could come next. That is the whole procedure. **Nothing in the process
that produces an answer checks the answer.** There is no step between choosing
the next piece of text and showing it to you in which a claim gets compared
against anything at all. Every property a reader takes as a mark of
confidence — the fluent phrasing, the specific figure, the named source, the
unhedged delivery — is produced by the same machinery that produced the
content. The polish is evidence about the machinery. It was never evidence
about the claim.

## Fluency and accuracy come out of the same pipe

A true sentence and an invented one are assembled identically, a piece at a
time, each piece chosen because it fits what came before. The model keeps no
separate ledger of things it knows as against things that would merely sound
right here, so the surface of the text carries no signal you can read off it.

That is why the fabricated citation looked so good. It had an author, a
plausible title, the right journal and a believable year because those are the
properties the real citations in its training text share. The model completed
the pattern of a citation perfectly. Getting all of that right is the failure.
It is not a mitigating detail.

The field's name for an invented answer delivered as fact is
[hallucination](/wiki/concept/hallucination). The word suggests a malfunction,
some circuit misfiring. Everything on this page is the machinery working as
built.

## The errors follow what was written down

A claim that appeared thousands of times across the training text left a
deep, redundant trace in the model's numbers. A claim that appeared once left
a faint trace, competing with everything that merely resembles it. So a
model's error rate tracks how often a thing was written down, not how hard it
is.

That runs opposite to how people size each other up, which is what makes it
treacherous. A human expert who knows the famous case usually knows the
obscure one too, because a person learns a subject. A model can be flawless on
the textbook example and invent the details of a small company, a minor
character, the third verse of a song whose first verse everyone knows. Same
domain, same confident delivery, wildly different amounts of text behind them.
Correctness on the well-known case tells you nothing about the obscure case
sitting next to it.

## Why "I don't know" is rare

Two mechanisms produce this, and neither is a missing feature.

The first is the training text itself. Documents that pose a question
overwhelmingly go on to answer it. People rarely write pages that say "no
idea", and such pages are rarely kept or quoted or copied. So "I don't know"
is an unusual way for text to continue, the model scores it low, and a model
asked a question is completing a document in which questions get answers.

The second is how models are scored. The field grades its models on
standardised exams, called benchmarks, and the results feed the public
scoreboards that reputations ride on. The exams that dominate those
scoreboards mark each answer simply right or wrong. Under that rule a wrong
guess and an honest "I don't know" earn the same zero, so guessing sometimes
gains a point and admitting ignorance never gains anything, and a model tuned
to climb such a scoreboard is being tuned to guess. A paper titled [Why Language Models
Hallucinate](https://arxiv.org/abs/2509.04664) makes the case compactly, and
its proposed remedy says where the incentive really lives: change how the
dominant scoreboards mark answers, rather than build yet another test for
catching fabrications. How an exam comes to shape a model at all is [its own
subject](/learn/what-a-benchmark-measures).

## The uncertainty exists, and you are not shown it

The model does attach a number to every candidate next piece of text, a score
for how likely that piece is to come next, and those numbers genuinely carry
information. But they are scores about text, not about truth. A falsehood that
is the likely continuation of a document gets a high score precisely because
it fits. And a chat product almost never shows you the numbers anyway. What
reaches you is prose, with the scores stripped away.

Asking the model whether it is sure does not get the numbers back. That
question is answered by the same next-piece process, now running over a
conversation in which the confident claim already stands, and text that
follows a confident claim mostly agrees with it.

## What actually lowers the error rate

Everything that genuinely works shares one pattern: put something into the
loop that can be wrong out loud.

Retrieval is the clearest case. When the stack fetches a document and pastes
it into the input, producing the fact becomes copying rather than recall, and
copying is the thing models do most reliably. The failure has not vanished. It
has moved into the fetching, where you can look. Either the right document
came back or it did not, and no amount of model quality recovers from the
wrong one.

A checker works for the same reason. A checker is anything that can pass a
cold verdict on an answer the moment it exists. A calculator, for arithmetic.
A search result with a link you can actually open. Computer code turns out to
be the best-behaved case of all, because code can simply be run, and it either
visibly does what was asked or visibly does not, with no human judgement
required. Wherever a verdict is that cheap, wrong answers can be caught before
you ever see them. The verdict can even be put to work earlier, during
training itself: set the model tasks a machine can mark, and teach toward
whatever passes. The field calls that recipe Reinforcement Learning with
Verifiable Rewards, and its gains land precisely on the tasks where a checker
exists.

Repetition is the cheapest of the three. Ask the same question several times,
in fresh conversations, and compare. Where the answers disagree with one
another you have caught the model guessing, for [reasons worth understanding
separately](/learn/why-the-same-request-gives-different-answers).

Now look at what those three share, because it is the important part. The
tasks where the error rate can be beaten down are the tasks where somebody can
write a checker. For an open-ended claim about the world, with no cheap
verdict available, none of this machinery applies, and the error rate is
whatever it is.

## What does not help

Telling the model not to make things up changes how the answer sounds, not
how it is made. A more cautious voice is not a more accurate one. You get the
same fabrications with more hedging attached.

Asking for a confidence score gets you a number, promptly. The number is
text, produced the way all the other text was produced.

And asking for sources after the fact is how this page began. A model asked
to justify a claim it has already made is completing a document in which that
claim is true, and it will supply supporting material of exactly the same
construction as the claim itself.

## The question to ask

Not whether the answer sounds sure. The sound is free, and it is applied
evenly across true and false alike. Ask instead what, anywhere in the system,
could have caught this answer if it were wrong. If the answer is nothing, the
fluency is decoration.
