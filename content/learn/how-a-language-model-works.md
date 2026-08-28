---
title: How a language model turns text into text
level: foundations
outcome: >-
  You can trace one word of output through tokenisation, attention and
  sampling, name the only operation in the stack that moves information
  between positions, and explain why a model cannot see the letters inside its
  own tokens.
prerequisites:
  - what-a-model-is
mentions:
  - event/attention-is-all-you-need
  - concept/scaling-laws
---

A language model does exactly one thing: given a sequence of tokens, it
produces a score for every token in its vocabulary, representing how plausible
that token is as the next one. Everything else — chat, code, translation,
refusals — is that operation repeated, with the output appended to the input.

## Tokens are not words, and the split is frozen

Text is first cut into tokens by a tokeniser learned before training and fixed
forever after. Common words are usually single tokens; rare words, names,
numbers and non-English text are split into fragments. The vocabulary is part
of the model's identity in the same way the weights are: change it and the
weights are meaningless.

Three consequences follow directly, and they explain a family of famous
failures:

- **The model cannot see inside a token.** Counting the letters in a word, or
  reversing it, asks about structure that was discarded before the first layer
  ran. The model can often answer anyway, having read about spelling — which
  is why it succeeds on common words and fails on rare ones.
- **Digits split unevenly.** Numbers are cut into fragments by frequency, not
  by place value, so the same arithmetic operation may be an easy pattern in
  one number and an unseen one in another.
- **Languages are not billed equally.** A script that the tokeniser fragments
  heavily needs more tokens to express the same meaning, so it consumes more
  of a fixed input budget and costs more to process, for reasons that have
  nothing to do with the language's difficulty.

## Embeddings: positions, not meanings yet

Each token id is looked up in a table, giving a vector. At this point the
vector encodes the token, not its meaning in context: the vector for a word
with several senses is identical in all of them. Position information is added
too, because nothing later in the network is inherently ordered.

## Attention is the only place information moves sideways

The body of the network is a stack of identical blocks. Each block does two
things: an attention operation, then a position-wise feed-forward network.

Attention works like this. Each position emits a **query** (what am I looking
for), a **key** (what do I offer), and a **value** (what I would contribute).
Every position compares its query against every key, producing similarity
scores; those scores are normalised into weights that sum to one; and the
output is the weighted mixture of the values. That is the whole mechanism —
a soft, learned lookup. Several such lookups run in parallel per block, each
free to attend to a different pattern, and their results are concatenated.

The structural fact worth memorising: **attention is the only operation in the
stack that moves information between positions.** The feed-forward layers, the
normalisations and the activations all act on one position at a time, in
isolation. Anything a model does that requires combining two separated facts
must route through attention to do it.

In a generative model the comparison is masked so each position can only see
positions before it. This is why text is produced left to right and why
already-generated text never gets revised — there is no operation in the
architecture that edits a token once emitted.

## From scores to a word

The final layer projects each position's vector back to a score for every
vocabulary token. Those scores are converted to probabilities. Then a separate
step, outside the model, chooses one:

- **Greedy** decoding always takes the highest-scoring token. Deterministic,
  and reliably duller and more repetitive than the alternatives.
- **Temperature** flattens or sharpens the distribution before sampling —
  higher flattens, making unlikely tokens more reachable.
- **Top-k and top-p (nucleus)** truncate the distribution to the k best
  tokens, or to the smallest set whose probabilities sum past p, and sample
  within that.

None of this is part of the model. The same weights with different decoding
settings will feel like different products, which is worth remembering before
attributing a personality change to retraining.

The chosen token is appended to the input and the entire process runs again.
That loop is the reason output arrives at a steady drip rather than all at
once, and the reason a long answer costs more than a short one to produce.

## The mental model to keep

One pass gives one distribution over next tokens. Attention is the only
sideways channel. Sampling is a choice made outside the network. Everything a
language model appears to *do* is that loop, run under a text that someone
arranged in advance.
