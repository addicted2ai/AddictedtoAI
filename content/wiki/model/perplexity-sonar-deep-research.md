---
id: model/perplexity-sonar-deep-research
kind: model
display_name: "Perplexity: Sonar Deep Research"
status: active
maintenance: living
aliases:
  - name: "Perplexity: Sonar Deep Research"
    class: manual
feeds:
  openrouter-models: perplexity/sonar-deep-research
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
