---
id: model/anthropic-claude-haiku-4-5
kind: model
display_name: "Anthropic: Claude Haiku 4.5"
status: active
maintenance: living
aliases:
  - name: "Anthropic: Claude Haiku 4.5"
    class: manual
feeds:
  openrouter-models: anthropic/claude-haiku-4.5
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
  - field: status
    source: feed
    feed: openrouter-models
    path: $status
    volatility: fast
timeline: []
mentions:
  - org/anthropic
  - model/anthropic-claude-3-haiku
  - model/anthropic-claude-sonnet-4
  - model/anthropic-claude-sonnet-5
  - model/anthropic-claude-opus-4
  - model/anthropic-claude-opus-4-6
---

Every other current Anthropic tier runs at a million-token context window.
This row doesn't: it lists
{{fact:model/anthropic-claude-haiku-4-5#context_window}} tokens, the same
ceiling {{fact:model/anthropic-claude-3-haiku#context_window}} carried on
`anthropic/claude-3-haiku`, a model old enough that its own catalog row
carries no recorded benchmark index at all. Nothing about the Haiku line's
context window has moved since.

Every other tier did move. Sonnet has run at
{{fact:model/anthropic-claude-sonnet-5#context_window}} tokens since at
least `anthropic/claude-sonnet-4`, which itself listed that same figure —
{{fact:model/anthropic-claude-sonnet-4#context_window}} — on essentially
the same day `anthropic/claude-opus-4` launched at
{{fact:model/anthropic-claude-opus-4#context_window}}, a fifth of the
size; the two rows were added to the catalog within fifteen minutes of
each other. Opus caught up at 4.6, moving to
{{fact:model/anthropic-claude-opus-4-6#context_window}} and holding there
ever since. Haiku, released later than either jump, is the tier that
never got one.
