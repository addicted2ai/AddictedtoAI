---
title: How inference is served, and why it is priced the way it is
level: advanced
outcome: >-
  You can explain why input and output are billed at different rates, what a
  prompt cache actually stores, why your latency depends on other people's
  requests, and which of the two latency numbers a given optimisation improves.
prerequisites:
  - how-a-language-model-works
  - how-models-are-trained
mentions:
  - event/attention-is-all-you-need
  - concept/kv-cache
  - technique/quantization
  - technique/speculative-decoding
---

Almost every pricing rule, latency quirk and capacity limit in served language
models follows from one asymmetry: a request has two phases with opposite
hardware characteristics.

## Prefill and decode

**Prefill** processes the entire prompt. Because the whole input is known
before it starts, every position runs at once as a few large matrix
multiplications. The accelerator is saturated with arithmetic. This phase is
compute-bound, and its cost per token of input is low.

**Decode** produces the answer, one token at a time. Each new token needs the
previous one, so the work cannot be parallelised across the sequence. For each
token, the entire set of model weights must be read out of memory to perform
comparatively little arithmetic. This phase is memory-bandwidth-bound: the
accelerator spends most of its time waiting for weights to arrive, not
computing.

Once you have this, the pricing follows. **Input is cheap because it is
parallel; output is expensive because it is serial.** A provider charging
different rates for the two directions is not applying a margin policy, it is
passing through a hardware fact. The same fact explains why a request that
reads a long document and replies briefly is inexpensive, while a short prompt
that produces a long answer is not.

## The KV cache, and what actually gets cached

Attention at each step compares the current position's query against the keys
of every earlier position, then mixes their values. Those keys and values do
not change as generation continues, so recomputing them for the whole prefix
at every step would be pure waste. They are kept in accelerator memory: the
**KV cache**.

Two properties of this cache drive most serving behaviour:

- **It grows with sequence length, per request.** Every generated token adds
  an entry for every layer and every attention head. Long conversations
  occupy proportionally more memory for their whole lifetime.
- **It competes with the weights for the same memory.** The weights are a
  fixed cost; whatever is left over divided by the per-request cache size is
  the number of requests that can be in flight. That number — not raw
  arithmetic throughput — is usually what sets a deployment's capacity.

**Prompt caching**, offered as a discount by many providers, is this cache
retained between requests. What is stored is the computed keys and values for
a prefix, not the text and not the answer. That is why it only helps when a
new request begins with a byte-identical prefix: change one character near the
start and every subsequent position's cached entries are invalid, because each
depends on everything before it. It is also why the savings land on the input
side. The cache lets prefill be skipped; it does nothing for decode.

## Batching, and why your latency depends on strangers

Because decode is limited by reading weights rather than by arithmetic, a
server that decodes one request at a time wastes most of its hardware. The
weights are read once per step regardless, so running many requests through
the same step costs barely more than running one. Servers therefore batch
aggressively, and modern schedulers use **continuous batching**: finished
requests leave the batch and waiting ones join at the next step, rather than
the whole batch starting and ending together.

This is why the same prompt to the same model returns at different speeds at
different times. Throughput and latency trade against each other through the
batch size, and the operator picks a point on that curve.

## The two latency numbers

- **Time to first token** measures queueing plus prefill. It grows with prompt
  length and with how busy the server is. Prompt caching, shorter prompts, and
  more capacity improve it.
- **Inter-token latency** measures the decode step: how fast the tokens flow
  once they start. It is governed by memory bandwidth, model size and batch
  size, and is almost independent of prompt length.

Reporting a single "response time" hides which of these is the problem, and
the fixes are unrelated.

## Attacks on the decode bottleneck

Since decode is bound by moving bytes rather than by doing arithmetic, the
useful optimisations either move fewer bytes or do more per byte moved.

**Quantisation** stores weights in a smaller numeric format. Fewer bytes per
parameter means less to read per token, so decode gets faster and more
requests fit in memory, at some cost in accuracy that depends heavily on the
method and on which parts of the network are reduced.

**Speculative decoding** exploits the asymmetry directly. A small, cheap draft
model proposes several tokens ahead. The large model then checks all of them
in a single parallel pass — a prefill-shaped operation, which it is good at —
and keeps the longest prefix it agrees with. When the draft is right the
system produces several tokens for roughly the cost of one; when it is wrong
the tokens are discarded and nothing is lost but the draft's work. Crucially,
the accepted output is drawn from the same distribution the large model would
have produced alone, so this is a speed optimisation and not a quality
trade-off.

**Attention variants** reduce how much of the cache must be read per step by
having several query heads share one set of keys and values. Less cache per
token means both faster decode and more concurrent requests.

## Long inputs cost differently in each phase

Prefill's attention work grows with the square of the input length, because
every position is compared against every other. The KV cache grows linearly.
So a very long input is felt first as a large one-off prefill charge and a
slow first token, and afterwards as a standing memory cost that limits how
many such requests can be served at once. These are separate problems with
separate mitigations, and a system that handles long inputs cheaply in one
phase may still be constrained by the other.
