---
id: model/openai-gpt-5-4
kind: model
display_name: "OpenAI: GPT-5.4"
status: active
maintenance: living
aliases:
  - name: "OpenAI: GPT-5.4"
    class: manual
feeds:
  openrouter-models: openai/gpt-5.4
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
  - org/openai
  - model/openai-gpt-5
  - model/openai-gpt-5-1
  - model/openai-gpt-5-2
  - model/openai-gpt-5-3-codex
  - model/openai-gpt-5-4-mini
  - model/openai-gpt-5-4-nano
  - model/openai-gpt-5-4-pro
  - model/openai-gpt-5-5
  - model/openai-gpt-5-6-sol
  - model/openai-gpt-5-6-terra
  - model/openai-gpt-5-6-luna
---

Four releases in a row shipped with the same context ceiling: GPT-5, 5.1,
5.2 and 5.3-Codex all cap at {{fact:model/openai-gpt-5#context_window}}.
This row broke the plateau —
{{fact:model/openai-gpt-5-4#context_window}}, more than double — and every
full-size GPT-5.x release since has kept that exact number:
{{fact:model/openai-gpt-5-5#context_window}} on 5.5,
{{fact:model/openai-gpt-5-6-sol#context_window}} on Sol,
{{fact:model/openai-gpt-5-6-terra#context_window}} on Terra, and
{{fact:model/openai-gpt-5-6-luna#context_window}} on Luna.

The jump wasn't universal. This row's own mini and nano siblings launched
at the old ceiling: `openai/gpt-5.4-mini` lists
{{fact:model/openai-gpt-5-4-mini#context_window}} and
`openai/gpt-5.4-nano` lists
{{fact:model/openai-gpt-5-4-nano#context_window}} — the number the
flagship carried before this release, not the number it carries now. The
Pro sibling did get the increase, listing
{{fact:model/openai-gpt-5-4-pro#context_window}}, matching this row
exactly: the jump reached the flagship and its Pro variant, not the
cheaper tiers launched alongside them.
