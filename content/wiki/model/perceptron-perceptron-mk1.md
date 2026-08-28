---
id: model/perceptron-perceptron-mk1
kind: model
display_name: "Perceptron: Perceptron Mk1"
status: active
maintenance: living
aliases:
  - name: "Perceptron: Perceptron Mk1"
    class: manual
feeds:
  openrouter-models: perceptron/perceptron-mk1
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
