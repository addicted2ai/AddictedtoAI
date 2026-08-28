---
id: model/x-ai-grok-4-6
kind: model
display_name: "SpaceXAI: Grok 4.6"
status: active
maintenance: living
aliases:
  - name: "SpaceXAI: Grok 4.6"
    class: manual
  - name: "Grok 4.6"
    class: exclusive
  - name: "x-ai/grok-4.6"
    class: exclusive
feeds:
  openrouter-models: x-ai/grok-4.6
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
  - field: status
    source: feed
    feed: openrouter-models
    path: $status
    volatility: fast
  - field: reasoning_mandatory
    source: feed
    feed: openrouter-models
    path: reasoning.mandatory
    volatility: slow
  - field: listed_date
    source: cited
    value: "2026-08-12"
    source_url: "https://openrouter.ai/x-ai/grok-4.6"
    accessed: "2026-08-28"
    volatility: dated
  - field: vendor_description
    source: cited
    value: "SpaceXAI's smartest model with frontier performance on coding, knowledge work, and STEM"
    source_url: "https://openrouter.ai/x-ai/grok-4.6"
    accessed: "2026-08-28"
    volatility: slow
timeline:
  - date: "2026-08-12"
    event: "listed as SpaceXAI's frontier model, keeping the shortened context window introduced with the July release"
    source_url: "https://openrouter.ai/x-ai/grok-4.6"
mentions:
  - org/spacexai
  - model/x-ai-grok-4-5
  - model/x-ai-grok-4-20
---
