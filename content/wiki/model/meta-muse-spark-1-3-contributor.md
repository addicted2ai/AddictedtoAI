---
id: model/meta-muse-spark-1-3-contributor
kind: model
display_name: "Meta: Muse Spark 1.3 Contributor"
status: active
maintenance: living
aliases:
  - name: "Meta: Muse Spark 1.3 Contributor"
    class: manual
feeds:
  openrouter-models: meta/muse-spark-1.3-contributor
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
