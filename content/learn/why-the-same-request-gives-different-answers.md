---
title: Why the same request gives different answers
level: advanced
outcome: >-
  You can name four independent sources of run-to-run variation, explain why
  turning sampling off does not make a served model deterministic, and design a
  comparison between two models that is not measuring noise.
prerequisites:
  - how-a-language-model-works
  - how-inference-is-served
mentions:
  - concept/kv-cache
  - technique/mixture-of-experts
  - technique/speculative-decoding
---

There are four independent causes, and only the first is the one everybody
names. The other three survive turning the temperature down to zero.

## One: sampling

The model produces a distribution and a step outside the model draws from it.
Making that draw deterministic — greedy decoding, no randomness — removes this
source completely and removes no other. If outputs still vary afterwards,
nothing below has been addressed.

## Two: floating-point reductions, whose order depends on the batch

Floating-point addition is not associative. Summing the same numbers in a
different order gives results that differ in the last bits. The arithmetic
itself is done by a kernel, which is the small program written to run one
operation on the accelerator, and a kernel computing a sum over thousands of
terms splits that sum across many cores and then combines the partial results.
How it splits depends on the shape of the grid of numbers it was handed, and
that shape depends on how many requests are in the batch and how long they are.

So the arithmetic your request receives depends on who else is on the server at
that instant. [Defeating Nondeterminism in LLM
Inference](https://thinkingmachines.ai/blog/defeating-nondeterminism-in-llm-inference/)
names the property precisely: the kernels are individually deterministic but
not **batch-invariant**, and from one user's point of view the other users are
not an input to the system, so their effect is indistinguishable from
randomness.

The differences are minute: a few least significant bits in a score. What
turns them into different paragraphs is the step immediately after. Greedy
decoding takes an argmax, which is nothing more than picking whichever
candidate scores highest, and an argmax is discontinuous: where two candidates
are nearly tied, a last-bit difference flips the choice. One flipped token
changes the prefix that every later token is generated from, and the outputs
diverge completely from there. **A numerically negligible difference becomes a
different answer by passing through one comparison.**

Two consequences catch people out. The first is that a cache hit can change the
output. Reusing a [KV cache](/wiki/concept/kv-cache) prefix means the remaining
positions are computed in a differently shaped operation than they would have
been in a cold request. Distributionally identical, not bit-identical: the
discount and the divergence have one cause.

The second is that the fix exists and costs throughput. Writing the reductions
so their order does not depend on batch composition makes results reproducible,
and gives up some of the performance that shape-dependent splitting was buying.
That trade is why batch invariance is a deliberate mode rather than the
default.

## Three: routing, in a sparse model

A Mixture of Experts model splits each layer into many separate sub-networks,
and those sub-networks are the experts. Only a few of them run on any given
token, chosen per token and chosen again at every layer. That is what the word
sparse is doing in the heading: most of the model sits idle on any one word.

Where the implementation caps how many tokens one expert may accept within a
batch, a token arriving in a crowded batch can be refused by its first choice.
Some implementations pass it through the layer unprocessed. Others hand it to a
lower-ranked expert.

Then the identity of the other requests in your batch changes not only when
your answer arrives but what it says. This is the strong form of a fact the
serving page states mildly. Sharing a machine with strangers is normally a
scheduling concern; under capacity-limited routing it is an input.

## Four: the stack moved under you

None of this involves the weights. One model name is frequently served by a
fleet of replicas that differ. One may hold the weights at lower numerical
precision than another, which is what it means to call a copy quantised. Two
accelerator generations may be running different kernels. A rolling deployment
may be half-finished. The system prompt may have changed between your two
requests. A
classifier may have fired on one and not the other. Two requests identical to
you were not identical to the system.

## Why speculative decoding is not on the list, and the asterisk

Speculative decoding is distribution-preserving by construction: the acceptance
rule is designed so that the tokens which survive are drawn from exactly the
distribution the large model would have produced alone. It changes when tokens
arrive, not which distribution they came from.

The asterisk is cause two. A verification pass hands the kernel a differently
shaped grid of numbers than a plain decode step does, so the reduction-order
argument applies to it as well. "Same distribution" and "same bits" are
different guarantees, and most claims about determinism are quietly about the
first while readers hear the second.

## What this does to evidence

One output is one draw. A screenshot shows that an output was reachable. It
says nothing about how likely it was. The upgrade is cheap: run it several
times and report the rate.

One prompt does not compare two models. Variance across samples from a single
model is routinely larger than the gap between two models, so a single
head-to-head measures noise. Comparing distributions means many samples of
each, on many prompts, with the spread reported.

Reproducibility needs more than a seed. A seed fixes the draw, which is cause
one. Pinning the rest means fixing the decoding settings, the serving
configuration, the batching policy and the exact replica, most of which an API
does not expose. Read a provider's "deterministic" or "seed" option as
*sampling disabled*, not as *same output*, unless it says otherwise in those
words.

## The claim that survives

A model is a function. A served model is a function plus a scheduler plus a
fleet, and reproducibility is a property of the second thing. It is achievable
— batch-invariant kernels demonstrate that — but it is bought, not assumed.
