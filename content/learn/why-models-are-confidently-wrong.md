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
  - technique/reinforcement-learning-with-verifiable-rewards
---

Nothing in the process that produces an answer checks the answer. There is no
step between computing the next piece of text and showing it to you where a
claim is compared against anything. Every property a reader takes as confidence
— fluent phrasing, a specific figure, a named source, an unhedged sentence — is
produced by the same machinery that produced the content, and is therefore
evidence about the machinery rather than about the content.

## Fluency and accuracy come out of the same pipe

A true sentence and an invented one are assembled identically: a piece at a
time, each piece chosen because it fits what came before. The model holds no
separate representation of "this is something I know" as against "this is
something that would sound right here". So the surface of the text carries no
signal you can read off it.

A fabricated citation is the clearest case. It has an author, a plausible
title, a journal that publishes that sort of work, and a year in the right
range — because those are the properties of the citations the model learned
from. Getting all of that right is the failure. It is not a mitigating detail.

## The failures are not spread evenly, and the pattern is predictable

A claim that appeared thousands of times across the training text left a
strong, redundant trace. A claim that appeared once left a faint one, competing
with everything that looks like it. The model's error rate therefore tracks how
often something was written down, not how difficult it is.

This gives a rule you can act on, and it runs opposite to how people calibrate
on each other. A human expert who knows the famous case usually knows the
obscure one, because they learned a subject. A model can be flawless on the
textbook example and invent the details of a small company, a minor character,
a rarely used function in a popular library — same domain, same apparent
competence, different amount of text behind it. Correctness on the well-known
case is not evidence about the neighbouring obscure one.

## Why "I don't know" is rare

Two mechanisms, neither of them a missing feature.

**The training text.** Documents that pose a question overwhelmingly go on to
answer it. Pages that say "no idea" are rarely written and rarely kept.
Abstention is an uncommon continuation, so it carries a low probability, and a
model asked a question is completing a document in which questions get answers.

**The scoring.** [Why Language Models
Hallucinate](https://arxiv.org/abs/2509.04664) makes the second argument
compactly: a benchmark that marks each answer right or wrong awards an
abstention and a wrong answer the same score. Under that rule a guess has
positive expected value and abstention has none, so anything selected against
such a score is selected for guessing. The paper's proposed remedy is a change
to how the dominant leaderboards score, not a new hallucination benchmark —
which puts the incentive where it actually lives. How a benchmark comes to
have that property is [its own subject](/learn/what-a-benchmark-measures).

## The model's uncertainty exists; you are not shown it

The model does compute a probability for every candidate next piece of text,
and those numbers are informative. But they are probabilities about the next
piece of text, not about the truth of a claim, and a chat product almost never
surfaces them. A model can be well calibrated about which word comes next and
still hand you a fluent falsehood, because the falsehood was the likely
continuation of the document it was completing.

Asking the model whether it is sure does not recover the number. That question
is answered by the same process, now running over a sequence in which the
confident claim is already established.

## What actually lowers the error rate

One pattern underlies all three of the things that work: put something in the
loop that can be wrong out loud.

- **Retrieval.** The fact is placed in the input, so producing it is copying
  rather than recall. The failure moves to the retriever, which you can
  inspect — and if the right document was not fetched, no amount of model
  quality recovers it.
- **A checker.** A compiler, a test suite, a schema, a calculator, a search
  result with a URL you can open. Where a verdict is cheap to compute, wrong
  answers can be caught before you see them, and the verdict can also be used
  as a training signal. Reinforcement Learning with Verifiable Rewards is that
  idea applied to training, and its gains land on exactly the tasks where a
  checker exists.
- **Repetition.** Ask the same question several times and compare. Disagreement
  across samples is a usable signal that the model is guessing, for
  [reasons worth understanding
  separately](/learn/why-the-same-request-gives-different-answers).

The asymmetry those three share is the important part: **the tasks where this
is fixable are the tasks where somebody can write a checker.** For an
open-ended claim about the world with no cheap verdict, none of the machinery
applies and the error rate is whatever it is.

## What does not help

- **Instructing it not to make things up.** That changes the register the model
  writes in. A more cautious register is not a more accurate one; it produces
  the same fabrications with more hedging attached.
- **Asking for a confidence score.** It will produce one. The number is text,
  generated the way the rest of the text was.
- **Asking for sources afterwards.** A model asked to justify a claim it has
  already made is completing a document in which that claim is true, and will
  supply supporting material of the same construction as the claim.

## The question to ask

Not whether an answer sounds sure — the sound is free, and it is applied
uniformly. Ask what in the system could have caught this if it were wrong. If
the answer is nothing, the fluency is decoration.
