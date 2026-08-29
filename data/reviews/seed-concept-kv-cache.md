---
job: seed-concept-kv-cache
verdict: approve
reasons: []
would-cite: >-
  The zero-hit-rate paragraph is what you paste at a developer whose cache
  never hits — the hash-of-prefix mechanism predicts the bug before any log
  does — and the lifetime-timed-from-request-start detail, quoted from the
  vendor's own documentation, ends the argument about why long streaming
  replies miss their follow-up window.
reviewer: task-6.5 seed reviewer (fresh invocation, no authorship of any seed content); delta review by a separate fresh invocation (no authorship of the entry or its revision)
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

## Delta review (commit 6ba8b3b only) — approve

The one named finding is fixed. Fetched
https://developers.openai.com/api/docs/guides/prompt-caching and matched the
substring myself — the doc reads verbatim: "After the minimum cacheable
token length, you can choose where to place cache breakpoints explicitly, or
let OpenAI choose their locations implicitly." The rewritten sentence quotes
this exactly, and its framing ("supports both modes: below a minimum
cacheable prompt length nothing is cached at all, and above it ...") is the
doc's own structure — the preceding sentence there is "A prompt prefix must
meet the model's minimum cacheable token length before it can be cached."
The 30-minute retention transclusion re-confirmed on the same page. The
false automatic-versus-declared contrast is gone and nothing unsupported
replaced it.

## Recheck 2026-08-29 (wave addictedtoai-flh) — approve stands

Re-examined because this entry was approved in the earlier seed round, which
the 2026-08-29 seed wave never revisited. All five source documents were
re-fetched and every decisive string re-matched as a literal substring of the
saved bytes.

- `vllm.ai/blog/2023-06-20-vllm` (117,850 bytes) — "60% - 80% of memory",
  "fragmentation and over-reservation", "a mere waste of under 4%",
  "PagedAttention". The `memory_waste_before_paging` fact is the blog's own
  pair of numbers.
- `arxiv.org/abs/2309.06180` (43,425 bytes) — "improves the throughput of
  popular LLMs by 2-4" and "with the same level of latency compared to the
  state-of-the-art systems, such as FasterTransformer and Orca", submission
  "12 Sep 2023". `paged_attention_throughput_gain` supported verbatim.
- `arxiv.org/abs/2305.13245` (41,223 bytes) — "uptraining existing multi-head
  language model checkpoints" using "5% of original pre-training compute",
  submitted "22 May 2023". `gqa_uptraining_cost` and the timeline row both
  supported.
- `platform.claude.com/.../prompt-caching` (1,913,199 bytes) — every one of
  the five Anthropic claims matched raw: "The lookback window is 20 blocks",
  "counting the breakpoint itself as the first", "writes exactly one cache
  entry", "a hash of the prefix ending at that block", "The lifetime is
  measured from the start of the request that writes or reads the cache
  entry", "4 minutes to stream", "5-minute", "4 cache breakpoints". The
  four-minute streaming example in the body is still the documentation's own.
- `developers.openai.com/api/docs/guides/prompt-caching` (640,956 bytes) —
  "you can choose where to place cache breakpoints explicitly, or let OpenAI
  choose their locations implicitly" (raw), and the retention fact's source
  sentence in full: "A cached prefix remains eligible for reuse for 30 minutes
  after its most recent write or reuse, though OpenAI may retain it longer."
  The "at least 30 minutes" rendering is right *because* of the trailing
  clause, not in spite of it. The doc scopes that paragraph to "GPT-5.6 and
  later", which is what the body's "on current models" carries; earlier models
  use `prompt_cache_retention` with different numbers, and the body correctly
  does not claim otherwise. "minimum cacheable token length" and "not shared
  across organizations" both matched raw.

No superlative, no licence claim and no secondary-source figure in this entry
— every number is a vendor doc or a paper, and each was read at the source.
Nothing changed.
