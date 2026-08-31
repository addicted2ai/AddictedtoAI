---
id: model/priced-model
kind: model
display_name: "Priced Model"
status: active
maintenance: living
aliases:
  - name: "Priced Model"
    class: exclusive
feeds:
  demo-source: "vendor/feed-model"
facts:
  - field: price_input
    source: feed
    feed: demo-source
    path: pricing.prompt
    volatility: fast
  - field: context_window
    source: feed
    feed: demo-source
    path: context_length
    volatility: fast
timeline: []
mentions: []
---
