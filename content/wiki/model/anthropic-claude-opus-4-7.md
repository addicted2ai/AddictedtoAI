---
id: model/anthropic-claude-opus-4-7
kind: model
display_name: "Anthropic: Claude Opus 4.7"
status: active
maintenance: living
aliases:
  - name: "Anthropic: Claude Opus 4.7"
    class: manual
feeds:
  openrouter-models: anthropic/claude-opus-4.7
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
  - model/anthropic-claude-opus-4-7-fast
  - model/anthropic-claude-opus-4-8
  - model/anthropic-claude-opus-4-8-fast
  - model/anthropic-claude-opus-5
  - model/anthropic-claude-opus-5-fast
---

`anthropic/claude-opus-4.7-fast` is where the fast-mode option makes its
debut in this line, priced at
{{fact:model/anthropic-claude-opus-4-7-fast#price_input}} input against
this row's own {{fact:model/anthropic-claude-opus-4-7#price_input}} — six
times over. Two releases later the ratio had fallen by two thirds:
`anthropic/claude-opus-4.8-fast` lists at
{{fact:model/anthropic-claude-opus-4-8-fast#price_input}} against
{{fact:model/anthropic-claude-opus-4-8#price_input}}, twice over rather
than six, and Opus 5 kept that same rate
({{fact:model/anthropic-claude-opus-5-fast#price_input}} against
{{fact:model/anthropic-claude-opus-5#price_input}}).

Nothing else about the option is recorded as having changed between the
two releases — same context window, same base rate — only the multiplier
sitting on top of it. And once it dropped, it stayed dropped: Opus 5's
fast row still bills at that same two-times rate, one full generation
after this row introduced the option at three times that multiplier.

This row's base price is itself part of a longer plateau —
{{fact:model/anthropic-claude-opus-4-7#price_input}}, unchanged from
`anthropic/claude-opus-4.5` through `anthropic/claude-opus-5` — so the
fast-mode cut is the one number in the family that actually moved during
that stretch.
