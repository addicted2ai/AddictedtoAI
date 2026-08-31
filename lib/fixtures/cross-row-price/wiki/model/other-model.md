---
id: model/other-model
kind: model
display_name: "Other Model"
status: active
maintenance: living
aliases:
  - name: "Other Model"
    class: exclusive
feeds:
  demo-source: "vendor/demo-model"
facts:
  - field: price_input
    source: feed
    feed: demo-source
    path: pricing.prompt
    volatility: fast
timeline: []
mentions: []
---
