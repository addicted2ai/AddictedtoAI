---
title: What an agent is, mechanically
level: mechanics
outcome: >-
  You can name every part of an agent loop, say which one the model is, and
  predict where a long-running agent will fail before you watch it fail.
prerequisites:
  - how-a-language-model-works
  - why-context-is-not-memory
mentions:
  - concept/model-context-protocol
  - concept/effective-context-length
---

An agent is a loop, and only one part of it is a model.

The model emits text. Some of that text, in an agreed format, names a tool and
its arguments. A program outside the model — the harness — parses that text,
decides whether to run it, runs it, and appends the result to the sequence. The
model runs again on the longer sequence. Repeat until something stops it.

That is the entire mechanism. Everything else described as agency is a property
of the harness, of the tool list, or of the sequence.

## The model never executes anything

It emits a string that looks like a call. Whether anything then happens is the
harness's decision, taken with the harness's permissions. Every capability an
agent has was granted by that program, and every check on that capability lives
there too. "The model deleted the directory" describes a harness that ran a
deletion without asking.

The corollary is easy to miss: a tool call is sampled like any other output. It
can name a tool that does not exist, pass an argument of the wrong type, or be
perfectly well-formed and wrong. Constrained decoding — restricting the sampler
at each step to tokens that keep the output valid under a schema — guarantees
the call parses. It says nothing about whether it was the right call. Shape and
choice are separate problems, and only one of them has a cheap fix.

## The tool list is text, and it is charged on every step

Tools are described to the model in its input, as prose or a schema. Adding a
tool means adding text to every request for the rest of the run. Two things
follow. The descriptions compete for room with the task, the history, and every
tool result so far. And a long list of similar-looking tools is a harder
selection problem than a short list of distinct ones, for the same reason
near-duplicate options are always harder.

The [Model Context Protocol](/wiki/concept/model-context-protocol) standardises
how a harness discovers tools and describes them, which removes a large amount
of per-integration work. It does not change the fact that the descriptions
arrive as tokens in the prompt and are paid for at every step.

## Reliability compounds, and the exponent is the step count

If each step succeeds independently with some probability, a task requiring
many steps succeeds with that probability raised to the number of steps. A
nineteen-in-twenty per-step success rate, which would be a very good model,
comes out worse than a coin flip after fourteen steps. Nothing in that
arithmetic is specific to language models. It is why long uninterrupted
pipelines are hard in every field.

What matters is what it implies about fixes. Raising per-step reliability helps,
but it is a linear improvement fighting an exponent. Breaking the chain helps
far more: any step whose result can be checked — a compiler, a test suite, a
schema validation, a diff a person reads — ends the multiplication and starts a
fresh one.

This is the real reason agents work better on software than on almost anything
else. Not that code is easier, but that code arrives with checkers, and a
checker converts a compounding failure into a retry.

## The sequence grows, and it grows with machine output

Every step appends three things: what the model wrote, the call it made, and
whatever the tool returned. Tool returns are large and mostly irrelevant: a
directory listing, a stack trace, a page of structured data of which one field
mattered. After enough steps the input is mostly machine output, and the
instruction that defined the task is a small, distant fraction of it, competing
with everything since.

That is where long runs drift. The model did not get worse; its input stopped
resembling the input it started with. Both failures from the rung below apply
here at speed: the wrong turn at step three is still in the sequence at step
thirty, and where the harness compacts the history to fit, that compaction is
lossy and one-way. A generous advertised length does not rescue it (see
[effective context length](/wiki/concept/effective-context-length)), because
what degrades is finding the relevant span, and an agent's sequence is exactly
a long input in which one early instruction is the span that matters.

Cost follows the same curve. Each step re-sends everything before it, so the
price of a step is roughly proportional to how many came before, and the price
of the run to the square of its length. An agent that takes twice as many steps
costs about four times as much, which is not what "twice as many steps" sounds
like. Prompt caching lowers the constant on that and does not change its shape.

## A plan is text

When a model writes a plan and then executes it, nothing enforces the plan. It
is tokens in the sequence, with precisely the standing of every other token: it
steers the next prediction, and it can be contradicted at any later step,
silently and without a signal that anything was skipped.

Plans do help, because text in the input steers output, and that is a real
effect. It is also a far weaker mechanism than the word suggests. If a step must
not be skipped, the thing that guarantees it is a harness that refuses to
proceed, not a sentence the model wrote about intending not to skip it.

## When an agent fails

Three questions, in order, and none of them is about the model. What is in the
sequence that should not be — a stale error, an abandoned wrong turn, a tool
result nobody needed? What was the harness permitted to do, and what did it
check before doing it? Which step had a checker available and did not use it?
