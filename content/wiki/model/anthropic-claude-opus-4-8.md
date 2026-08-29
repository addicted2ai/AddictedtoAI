---
id: model/anthropic-claude-opus-4-8
kind: model
display_name: "Anthropic: Claude Opus 4.8"
status: active
maintenance: living
aliases:
  - name: "Anthropic: Claude Opus 4.8"
    class: manual
feeds:
  openrouter-models: anthropic/claude-opus-4.8
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
  - field: context_window
    source: feed
    feed: openrouter-models
    path: context_length
    volatility: fast
  - field: intelligence_index
    source: feed
    feed: openrouter-models
    path: benchmarks.artificial_analysis.intelligence_index
    volatility: fast
  - field: status
    source: feed
    feed: openrouter-models
    path: $status
    volatility: fast
timeline: []
mentions:
  - org/anthropic
  - model/anthropic-claude-opus-4-1
  - model/anthropic-claude-opus-4-5
  - model/anthropic-claude-opus-4-6
  - model/anthropic-claude-opus-4-7
  - model/anthropic-claude-opus-5
---

Five Opus releases in a row list at the same input price.
`anthropic/claude-opus-4.1` heads at
{{fact:model/anthropic-claude-opus-4-1#price_input}}; the next release lists
two thirds below that, at
{{fact:model/anthropic-claude-opus-4-5#price_input}} on
`anthropic/claude-opus-4.5` —
and every release since has matched that new number exactly:
{{fact:model/anthropic-claude-opus-4-6#price_input}} on 4.6,
{{fact:model/anthropic-claude-opus-4-7#price_input}} on 4.7, this row's own
{{fact:model/anthropic-claude-opus-4-8#price_input}}, and
{{fact:model/anthropic-claude-opus-5#price_input}} on Opus 5. Same number,
five times running. Each of those is the top listed provider's rate for its
row rather than necessarily Anthropic's own, and the 4.1 row is headed by
resellers, so the step down sits between listings rather than being a price
Anthropic announced.

Nothing about the model stayed flat over that stretch. The Artificial
Analysis intelligence index reads
{{fact:model/anthropic-claude-opus-4-7#intelligence_index}} on 4.7,
{{fact:model/anthropic-claude-opus-4-8#intelligence_index}} on this row,
and {{fact:model/anthropic-claude-opus-5#intelligence_index}} on Opus 5 two
releases later — eight points of climb while the row listed the same five
times running.

The context window moved on a different schedule than the price.
`anthropic/claude-opus-4.5` still capped at
{{fact:model/anthropic-claude-opus-4-5#context_window}} tokens, the same
ceiling the line had shipped with since the first Opus 4. The next
release, `anthropic/claude-opus-4.6`, raised it to
{{fact:model/anthropic-claude-opus-4-6#context_window}}, at an
unchanged price, and it has held there through this row and Opus 5. Price
and context window are two separate dials in this lineup, and they don't
turn together.
