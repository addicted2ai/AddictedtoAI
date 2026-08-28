---
id: model/perplexity-sonar
kind: model
display_name: "Perplexity: Sonar"
status: active
maintenance: living
aliases:
  - name: "Perplexity: Sonar"
    class: manual
feeds:
  openrouter-models: perplexity/sonar
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
