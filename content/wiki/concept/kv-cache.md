---
id: concept/kv-cache
kind: concept
display_name: "KV cache"
status: active
maintenance: stable
aliases:
  - name: "KV cache"
    class: exclusive
  - name: "Key-value cache"
    class: shared
facts:
  - field: memory_waste_before_paging
    source: cited
    value: "60-80% of KV cache memory lost to fragmentation and over-reservation; under 4% with paged allocation"
    source_url: "https://vllm.ai/blog/2023-06-20-vllm"
    accessed: "2026-08-28"
    volatility: dated
  - field: paged_attention_throughput_gain
    source: cited
    value: "2-4x throughput over FasterTransformer and Orca at comparable latency"
    source_url: "https://arxiv.org/abs/2309.06180"
    accessed: "2026-08-28"
    volatility: dated
  - field: gqa_uptraining_cost
    source: cited
    value: "5% of original pre-training compute to convert a multi-head checkpoint to grouped-query attention"
    source_url: "https://arxiv.org/abs/2305.13245"
    accessed: "2026-08-28"
    volatility: dated
  - field: anthropic_cache_default_lifetime
    source: cited
    value: "5 minutes"
    source_url: "https://platform.claude.com/docs/en/build-with-claude/prompt-caching"
    accessed: "2026-08-28"
    volatility: slow
  - field: anthropic_cache_lookback_window
    source: cited
    value: "20 blocks"
    source_url: "https://platform.claude.com/docs/en/build-with-claude/prompt-caching"
    accessed: "2026-08-28"
    volatility: slow
  - field: anthropic_cache_breakpoints_max
    source: cited
    value: "4 per request"
    source_url: "https://platform.claude.com/docs/en/build-with-claude/prompt-caching"
    accessed: "2026-08-28"
    volatility: slow
  - field: openai_cache_retention
    source: cited
    value: "at least 30 minutes after the latest write or reuse"
    source_url: "https://developers.openai.com/api/docs/guides/prompt-caching"
    accessed: "2026-08-28"
    volatility: slow
timeline:
  - date: "2023-05-22"
    event: "grouped-query attention published with an uptraining recipe for existing checkpoints"
    source_url: "https://arxiv.org/abs/2305.13245"
  - date: "2023-06-20"
    event: "vLLM released, applying OS-style paging to the KV cache"
    source_url: "https://vllm.ai/blog/2023-06-20-vllm"
  - date: "2023-09-12"
    event: "PagedAttention published at SOSP 2023"
    source_url: "https://arxiv.org/abs/2309.06180"
mentions:
  - concept/effective-context-length
  - tool/vllm
  - tool/sglang
---

Attention at decode step *n* needs the key and value vectors of every earlier
position. Recomputing them each step is quadratic in the sequence; storing them
is linear, so every serving stack stores them. That store is the KV cache.

The property that governs everything downstream is that it is **per request**.
Model weights are loaded once and shared by every request on the box; each
concurrent request holds its own cache, sized two tensors per layer per position
— layers × key-value heads × head dimension × bytes per element — and it grows
with every token that request has seen or produced. This, not the parameter
count, usually decides how many requests a GPU can serve at once.

Three lines of attack, all of them ordinary practice in serving stacks today.

**Make it smaller in the architecture.** Multi-query attention gives all query
heads a single shared key-value head, shrinking the cache by the head count at
some quality cost. Grouped-query attention (Ainslie et al., 2023-05-22)
interpolates — more than one key-value head, fewer than all — and its practical
contribution is a recipe for converting an existing multi-head checkpoint using
5% of the compute that pre-trained it. Nobody had to retrain from scratch to get
the smaller cache, which is why the technique spread within months.

**Manage it like memory.** Before 2023, serving systems handed each request a
contiguous slab sized for the longest output it might produce. The vLLM authors
measured what that cost: 60-80% of KV memory lost to fragmentation and
over-reservation. PagedAttention (SOSP 2023) applies operating-system paging —
fixed-size blocks, a block table per sequence, non-contiguous physical storage —
and brings waste under 4%. Note where the reported 2-4x throughput improvement
over FasterTransformer and Orca came from: an allocator, not a faster kernel.
Reclaimed memory becomes batch size, and batch size is throughput.

**Reuse it between requests.** Two requests that share a prefix can share its
cache blocks — prefix caching in vLLM, RadixAttention in SGLang.

**The part users see, and misread.** Provider prompt caching is this same
mechanism sold through the API, and it is not "the provider remembers your
prompt". On Anthropic's API a cache entry is written only where you place a
`cache_control` breakpoint, and it writes exactly one entry: a hash of the prefix
ending at that block. A later request hits only if that prefix hash already
exists; if the breakpoint itself misses, the system walks backward — at most
{{fact:concept/kv-cache#anthropic_cache_lookback_window}}, counting the
breakpoint as the first — looking for an entry some earlier request wrote, then
stops. The breakpoint budget is {{fact:concept/kv-cache#anthropic_cache_breakpoints_max}}.
The default entry lives {{fact:concept/kv-cache#anthropic_cache_default_lifetime}},
timed from the *start* of the request that wrote or read it — so a reply that
streams for four minutes leaves about one minute for the follow-up to arrive. The
classic zero-hit-rate bug falls straight out of this: put the breakpoint on the
block that changes every request, and every write is a new hash that nothing will
ever match. OpenAI's version is automatic rather than declared, with a minimum
prompt length below which nothing is cached, retention of
{{fact:concept/kv-cache#openai_cache_retention}} on current models, and no
sharing across organizations.

Cache lifetimes are measured in minutes rather than days because a cached prefix
occupies the same GPU memory every other request is competing for. Prompt caching
is not storage. It is a reservation.
