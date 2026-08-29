---
id: model/openai-gpt-5-4-nano
kind: model
display_name: "OpenAI: GPT-5.4 Nano"
status: active
maintenance: living
aliases:
  - name: "OpenAI: GPT-5.4 Nano"
    class: manual
feeds:
  openrouter-models: openai/gpt-5.4-nano
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
  - field: status
    source: feed
    feed: openrouter-models
    path: $status
    volatility: fast
timeline: []
mentions: []
---
