---
title: Why context is not memory
level: foundations
outcome: >-
  You can predict which failures come from a conversation's length, explain why
  telling a model it was wrong does not remove the wrong answer, and say what a
  product's "memory" feature is actually storing.
prerequisites:
  - how-a-language-model-works
mentions:
  - concept/effective-context-length
  - concept/kv-cache
---

A model's input is one flat sequence of tokens, assembled fresh for every
request and discarded after it. There is no store, no state that survives, and
no privileged region. The system prompt, your first message, a retrieved
document, a tool result from four steps ago and your correction all arrive
through the same channel, as tokens, with nothing marking one apart from
another once the arithmetic begins.

Most of what gets described as a memory problem follows from that one fact.

## You cannot un-say anything

A correction appends. The mistaken sentence stays exactly where it was, and
attention — the only operation that moves information between positions —
computes a weighted mixture over everything present, that sentence included.
Nothing is deleted. The model reads a longer document which now contains both
the claim and the objection, and produces its next token from the pair.

So "I already told you not to do that" is not a retraction. It is a second
instruction competing with the first, and with everything the model has since
written in the first's direction — several turns of text all agreeing with the
thing you are trying to remove. Interfaces that let you edit a message and
resend are doing the only thing that actually removes text: rebuilding the
sequence without it. Starting a new conversation is the blunt version of the
same move, which is why it so often works when arguing does not.

## The same words do different work depending on where they sit

Position is part of a token's representation, so the model is not reading a set
of facts; it is reading an ordered document. The measured consequence is
consistent across models: [Lost in the
Middle](https://arxiv.org/abs/2307.03172) varied where the needed passage sat
in a long input and found accuracy highest when it was near the beginning or
the end and lowest in the middle — including for models built specifically for
long inputs.

There is a structural reason to expect dilution alongside it. Attention weights
are normalised to sum to one, so a longer input does not bring more attention
with it; it divides a fixed budget among more candidates. Every position added
competes with every position already there. An instruction is not the same
instruction at the first turn and the fiftieth, even when the characters are
identical.

## Accepting a length is not the same as using it

An advertised length states how many positions a model will accept without
erroring. Whether it can find the relevant span among them is a separate
question with a separately measured answer — that is what [effective context
length](/wiki/concept/effective-context-length) is, and the benchmarks built to
test it live there with their results. The short form: retrieval that a keyword
search would also solve survives long inputs, and retrieval that needs a
semantic hop degrades well before the advertised limit.

## Every turn pays for the whole conversation

Because the sequence is rebuilt each time, a long conversation is re-sent in
full on every message. Servers avoid recomputing it by keeping the per-position
intermediate values — the [KV cache](/wiki/concept/kv-cache) — so an unchanged
prefix can be skipped, which is [what a prompt-cache discount
is](/learn/how-inference-is-served).

Reuse requires the prefix to be byte-identical, and that produces an asymmetry
worth carrying around: **appending is cheap; editing the beginning is not.**
Change one character in a system prompt and every cached position after it is
invalid, because each one was computed from everything before it. A product
that inserts the current date at the top of its prompt has thrown away its own
cache once a day, for one line of text.

## A "memory" feature is a file

Products that remember across sessions extract statements from past
conversations, store them somewhere ordinary, retrieve some of them and paste
them into the input ahead of your message. That is why the memories can be
listed, edited and deleted, and why they can be wrong in a way the model has no
means of detecting: a retrieved memory arrives in the same channel as the
sentence you typed a second ago, carrying the same standing.

That property is also the root of prompt injection. A document the model was
asked to summarise and an instruction from you are both text in one sequence.
An "ignore your instructions" sitting inside a fetched web page is, to the
arithmetic, an instruction in the input — there is no field marking one as data
and the other as command, because there is only one field. Every defence
against this is built outside the model: delimiters the model is trained to
respect, classifiers on the way in, and limits on what tools may do while
untrusted content is present.

## Summarising to fit is lossy and one-way

When a conversation outgrows the limit, something has to go. Products drop the
oldest turns or replace them with a summary. Either way the original text
leaves the model's view permanently: from the next turn on, the summary is the
record, and every subsequent answer reasons from it.

An error introduced by a summary cannot be corrected by pointing at the earlier
message, because that message is no longer present. This is the specific and
underrated failure of very long sessions — the model is not contradicting
itself, it is faithfully continuing a compressed history that dropped the
detail you now need.

## The working model

Treat the context as a workspace you are rewriting, not an archive that
accumulates. When a long conversation goes wrong, the first question is not
what the model forgot. It is what is still in the sequence.
