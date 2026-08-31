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

The other tiers reached the ceiling by two different routes, and only one
of them was a climb. Sonnet was never below it: `anthropic/claude-sonnet-4`
is the oldest Sonnet row in the catalog and it already listed
{{fact:model/anthropic-claude-sonnet-4#context_window}} — on essentially
the same day `anthropic/claude-opus-4` launched at
{{fact:model/anthropic-claude-opus-4#context_window}}, a fifth of the
size; the two rows were added to the catalog within fifteen minutes of
each other. Opus is the tier that actually moved, at 4.6, to
{{fact:model/anthropic-claude-opus-4-6#context_window}}, and it has held
there ever since.

Haiku 4.5 landed in between, which is the part that makes it interesting.
It was listed on 15 October 2025 — 146 days after Sonnet was already
running at a million, and 112 days *before* Opus got there on 4 February
2026. So the 200k ceiling is not a decision taken against a settled house
standard; it is a row nobody has been back to. In the snapshot of 31 August
2026, five further Opus revisions, two Sonnets and a Fable have been listed
since that date, and not one new Haiku.
