---
title: What a model is, and what it is not
level: orientation
outcome: >-
  You can point at any AI product and say which part of it is the model and
  which part is not, and predict which changes need a new model and which do
  not.
prerequisites: [what-ai-actually-is]
mentions:
  - event/attention-is-all-you-need
---

Most public confusion about AI comes from one collapsed distinction. A model,
the software that runs it, and the product wrapped around it are three
different things, and almost every argument that goes nowhere is an argument
in which two people are talking about different ones.

## The model is a fixed array of numbers

A trained model is a large collection of numbers — parameters, also called
weights — together with a description of the arithmetic to perform on them.
Nothing else. Given the same input and the same arithmetic settings, it
computes the same output, and it is unchanged afterwards. It does not
accumulate anything. It cannot.

This has a consequence people find hard to believe: **a model does not
remember your conversation**. When a chat product appears to remember what you
said, the earlier text was stored elsewhere and re-sent with your new message.
Every turn, the whole visible history is fed in again from the beginning. What
looks like memory is re-reading.

The same follows for corrections. Telling a model it is wrong changes the text
it is reading, and therefore its next output. It changes nothing about the
model. The next person to use it — and you, in a fresh conversation — get the
identical starting weights.

## The product is a stack, and most of it is not the model

What you interact with typically includes:

- the weights;
- a **system prompt**, invisible text placed before your conversation;
- **decoding settings** that decide how the next word is picked from the
  model's output;
- **tools** the model may call — search, code execution, a calculator, a
  database;
- **retrieval**, which pulls documents in and pastes them into the input;
- **filters and classifiers** that can block or rewrite either side;
- an **orchestration layer** that may run the model several times per reply.

Every one of these can change without the weights changing. This is the single
most useful thing to know when you read that a product "got worse" or "got
smarter" overnight. Weights are expensive to produce and are shipped rarely;
the surrounding stack is edited continuously. A behaviour change on a Tuesday
is far more likely to be a prompt, a filter, a routing rule, or a serving
change than a new model.

The reverse also holds: two products serving identical weights can behave very
differently, and neither is misrepresenting anything.

## Training happened once, in the past

A model's parameters are the residue of a training run that ended on a
particular date. That is what a knowledge cutoff is — not a policy, not a
filter, just the fact that the text it learned from stopped. Anything the
model appears to know about later events came in through its input: retrieval,
a tool result, or your own message.

"The model learned from our conversation" is, for a deployed model, almost
always false. Systems that improve from usage do so by storing data and
running a separate training job later, which produces different weights, which
someone then chooses to deploy.

## Same input, different output

Asking the same question twice can produce different answers, and this is
usually not a malfunction. The model's actual output is a probability
distribution over possible next pieces of text; picking one is a separate step
that is normally random by design, because always taking the single highest
probability option produces repetitive, oddly flat text. Turn that randomness
off and repeat runs converge — though not always exactly, because the order in
which requests get grouped together on a server can perturb floating-point
arithmetic.

This is why "I couldn't reproduce it" is weak evidence about model behaviour,
and why a screenshot of one output is weak evidence of anything at all.

## What to take away

When a claim is made about "the AI", ask which layer it is about. Does it
concern the weights, the surrounding stack, the input, or the sampling step?
Four different kinds of claim, four different kinds of evidence, and only the
first one requires anybody to train anything.
