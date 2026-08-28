---
job: seed-concept-kv-cache
verdict: revise
reasons: [false-or-unsupported-claim]
would-cite: >-
  The developer debugging a zero-hit cache rate would link the
  breakpoint-hashing paragraph — the bug falls straight out of the mechanism
  as described; and the lifetime-measured-from-request-start detail, which
  this review verified verbatim against Anthropic's documentation, settles
  arguments about why long streaming replies miss their follow-up window.
reviewer: task-6.5 seed reviewer (fresh invocation, no authorship of any seed content)
date: 2026-08-28
---

Checklist: wiki entry. All seven cited facts and every prose claim with a
source were checked by fetching.

**Verified by fetching:**
- vllm.ai/blog/2023-06-20-vllm — "existing systems waste 60% – 80% of
  memory due to fragmentation and over-reservation"; "a mere waste of under
  4%". Both figures exact; PagedAttention framing as OS paging confirmed.
- arxiv.org/abs/2309.06180 — "improves the throughput of popular LLMs by
  2-4x with the same level of latency compared to the state-of-the-art
  systems, such as FasterTransformer and Orca"; submitted 12 Sep 2023
  (SOSP 2023). The body's point that the gain came from an allocator is a
  fair reading of the paper's own account.
- arxiv.org/abs/2305.13245 — GQA as interpolation; "uptraining existing
  multi-head language model checkpoints ... using 5% of original
  pre-training compute"; submitted 22 May 2023. All exact.
- platform.claude.com prompt-caching docs — every one of the five specific
  claims verified with exact quotes: 5-minute default lifetime; "The
  lookback window is 20 blocks. The system checks at most 20 positions per
  breakpoint, counting the breakpoint itself as the first"; up to 4
  breakpoints; "Marking a block with cache_control writes exactly one cache
  entry: a hash of the prefix ending at that block"; and — the claim I
  expected to be an embellishment — "The lifetime is measured from the
  start of the request that writes or reads the cache entry ... if a
  response takes 4 minutes to stream, a follow-up request ... must start
  within about 1 minute". The body's four-minute example is the
  documentation's own.
- developers.openai.com prompt-caching docs — retention fact supported:
  "A cached prefix remains eligible for reuse for 30 minutes after its most
  recent write or reuse, though OpenAI may retain it longer" ("at least 30
  minutes ... on current models" is a fair rendering). Minimum cacheable
  length and no-sharing-across-organizations both confirmed. But see the
  required change.

**Also checked:** the transclusions all resolve against this entry's own
facts; aliases sane ("Key-value cache" as shared is right — databases have
them too); the per-request sizing formula (two tensors per layer per
position, layers x kv-heads x head-dim x bytes) is correct.

**Required change (the revise):**
1. `false-or-unsupported-claim` — "OpenAI's version is automatic rather
   than declared." The cited OpenAI documentation says the opposite of
   "rather than declared": "you can choose where to place cache breakpoints
   explicitly, or let OpenAI choose their locations implicitly." Explicit
   breakpoint placement exists on the current API, so the
   automatic-versus-declared contrast with Anthropic no longer holds as
   stated. Reword to something the source supports, e.g. "OpenAI's version
   defaults to implicit placement (explicit breakpoints are optional),
   with a minimum prompt length below which nothing is cached ..." —
   the rest of the sentence survives as written.

Everything else in this piece is the strongest sourcing I checked in the
whole seed set — including the one detail I specifically tried to catch as
written-from-intent, which turned out to be quoted from measurement.
