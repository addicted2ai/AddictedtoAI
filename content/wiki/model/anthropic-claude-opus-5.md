---
id: model/anthropic-claude-opus-5
kind: model
display_name: Claude Opus 5
status: active
maintenance: living
aliases:
  - name: Claude Opus 5
    class: exclusive
  - name: "anthropic/claude-opus-5"
    class: exclusive
  - name: Opus 5
    class: shared
  - name: Opus
    class: manual
feeds:
  openrouter-models: anthropic/claude-opus-5
facts:
  - field: price_input
    source: feed
    feed: openrouter-models
    path: pricing.prompt
    volatility: fast
  - field: price_output
    source: feed
    feed: openrouter-models
    path: pricing.completion
    volatility: fast
  - field: price_cache_read
    source: feed
    feed: openrouter-models
    path: pricing.input_cache_read
    volatility: fast
  - field: context_window
    source: feed
    feed: openrouter-models
    path: context_length
    volatility: fast
  - field: max_output_tokens
    source: feed
    feed: openrouter-models
    path: top_provider.max_completion_tokens
    volatility: fast
  - field: intelligence_index
    source: feed
    feed: openrouter-models
    path: benchmarks.artificial_analysis.intelligence_index
    volatility: fast
  - field: coding_index
    source: feed
    feed: openrouter-models
    path: benchmarks.artificial_analysis.coding_index
    volatility: fast
  - field: agentic_index
    source: feed
    feed: openrouter-models
    path: benchmarks.artificial_analysis.agentic_index
    volatility: fast
  - field: default_reasoning_effort
    source: feed
    feed: openrouter-models
    path: reasoning.default_effort
    volatility: slow
  - field: reasoning_on_by_default
    source: feed
    feed: openrouter-models
    path: reasoning.default_enabled
    volatility: slow
  - field: status
    source: feed
    feed: openrouter-models
    path: $status
    volatility: fast
  - field: release_date
    source: cited
    value: "2026-07-24"
    source_url: "https://www.anthropic.com/news/claude-opus-5"
    accessed: "2026-08-28"
    volatility: dated
  - field: fast_mode_speed
    source: cited
    value: "around 2.5x the default speed, at twice the base price"
    source_url: "https://www.anthropic.com/news/claude-opus-5"
    accessed: "2026-08-28"
    volatility: dated
timeline:
  - date: "2026-07-24"
    event: "released; Anthropic states the same price as the preceding Opus release"
    source_url: "https://www.anthropic.com/news/claude-opus-5"
mentions:
  - org/anthropic
  - model/anthropic-claude-fable-5
  - model/anthropic-claude-opus-5-fast
  - model/anthropic-claude-opus-5-batch
  - model/anthropic-claude-opus-4-8
---

The quiet change in this row is a boolean. Opus 5 ships with reasoning
enabled by default — the catalog's `reasoning.default_enabled` reads
{{fact:model/anthropic-claude-opus-5#reasoning_on_by_default}} here, where
the `anthropic/claude-opus-4.7` and `anthropic/claude-opus-4.8` rows both
carry `false`. The effort ladder itself is unchanged from those releases
(`low`, `medium`, `high`, `xhigh`, `max`, defaulting to
{{fact:model/anthropic-claude-opus-5#default_reasoning_effort}}); what
changed is which setting you get if you say nothing, and therefore what a
naive request costs.

Speed is a second dial with a published exchange rate. The separate
`anthropic/claude-opus-5-fast` row lists
{{fact:model/anthropic-claude-opus-5-fast#price_input}} input against this
row's {{fact:model/anthropic-claude-opus-5#price_input}} for what Anthropic's
[launch post](https://www.anthropic.com/news/claude-opus-5) describes as
{{fact:model/anthropic-claude-opus-5#fast_mode_speed}}. Going the other way,
`anthropic/claude-opus-5:batch` halves the price for work that can wait, and
a cache hit reads at {{fact:model/anthropic-claude-opus-5#price_cache_read}}.
Between a cached batch read and fast-mode output, the price of a token from
one model spans more than two orders of magnitude.

The comparison Anthropic drew was with its own dearer tier. Opus 5 lands
"within 0.5% of Fable 5's peak score" on Cursor's coding benchmark at half
the cost per task, and beats Fable 5's best OSWorld result "at just over a
third of the cost." The catalog's scoreboard agrees and goes further: the
Artificial Analysis intelligence index on this row is
{{fact:model/anthropic-claude-opus-5#intelligence_index}} against
{{fact:model/anthropic-claude-fable-5#intelligence_index}} on
`anthropic/claude-fable-5`, which lists at
{{fact:model/anthropic-claude-fable-5#price_input}} input — the dearer of the
two. On that measure the premium tier is behind the flagship and ahead of it
on the invoice.

One capability is explicitly absent. The same post says Opus 5 "remains
behind Mythos 5 on cybersecurity tasks" — the tier Anthropic does not sell
on the open market, which returned from a June 2026 suspension only after US
government approval. Whatever ceiling this row represents, it is the top of
the purchasable stack rather than the top of the stack.
