---
id: model/perplexity-sonar-reasoning-pro
kind: model
display_name: "Perplexity: Sonar Reasoning Pro"
status: active
maintenance: living
aliases:
  - name: "Perplexity: Sonar Reasoning Pro"
    class: manual
feeds:
  openrouter-models: perplexity/sonar-reasoning-pro
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
mentions: []
---
