---
id: model/openai-gpt-5-5
kind: model
display_name: "OpenAI: GPT-5.5"
status: active
maintenance: living
aliases:
  - name: "OpenAI: GPT-5.5"
    class: manual
feeds:
  openrouter-models: openai/gpt-5.5
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
timeline: []
mentions:
  - org/openai
  - model/openai-gpt-5
  - model/openai-gpt-5-pro
  - model/openai-gpt-5-5-pro
  - model/openai-gpt-5-2
  - model/openai-gpt-5-2-pro
  - model/openai-gpt-5-4
  - model/openai-gpt-5-4-pro
  - model/openai-gpt-5-6-sol
  - model/openai-gpt-5-6-sol-pro
  - model/openai-gpt-5-6-terra
  - model/openai-gpt-5-6-luna
---

For three releases running, "Pro" meant twelve times the price.
`openai/gpt-5-pro` billed {{fact:model/openai-gpt-5-pro#price_input}}
against plain `openai/gpt-5`'s {{fact:model/openai-gpt-5#price_input}};
GPT-5.2 Pro repeated the ratio
({{fact:model/openai-gpt-5-2-pro#price_input}} against
{{fact:model/openai-gpt-5-2#price_input}}), and GPT-5.4 Pro repeated it
again ({{fact:model/openai-gpt-5-4-pro#price_input}} against
{{fact:model/openai-gpt-5-4#price_input}}). This row is where the
multiplier broke: `openai/gpt-5.5-pro` lists at
{{fact:model/openai-gpt-5-5-pro#price_input}} against this row's own
{{fact:model/openai-gpt-5-5#price_input}} — half the premium the three
releases before it charged.

The slide didn't stop there. One generation later, each of the three
GPT-5.6 variants — Sol, Terra, Luna — prices its Pro sibling at exactly
the same rate as the plain row: `openai/gpt-5.6-sol-pro` lists at
{{fact:model/openai-gpt-5-6-sol-pro#price_input}}, identical to
{{fact:model/openai-gpt-5-6-sol#price_input}} for Sol itself, and Terra
and Luna match their own base rows the same way. Across the five releases
that shipped a Pro row — GPT-5, 5.2, 5.4, 5.5 and 5.6 — the premium
OpenAI charges for its own "Pro" label went from twelve times the base
rate to nothing, as observed on 28 August 2026. These are not launch
prices: OpenAI cut Luna 80% and Terra 20% on 30 July 2026, though base
and Pro moved together and the ratios are undisturbed.

Reasoning followed a similar on/off pattern. The `reasoning.default_enabled`
flag reads {{fact:model/openai-gpt-5-5#reasoning_on_by_default}} on this
row, where GPT-5.4 carried the opposite value in the same snapshot — a
bare request to 5.5 spends reasoning tokens that the same request to 5.4
would not have, on top of the price move the Pro tier already made.
