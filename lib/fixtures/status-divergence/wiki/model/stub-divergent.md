---
id: model/stub-divergent
kind: model
display_name: "Stub Divergent"
status: deprecated
maintenance: living
aliases:
  - name: "Stub Divergent"
    class: exclusive
feeds:
  demo-source: "vendor/demo-model"
facts:
  - field: status
    source: feed
    feed: demo-source
    path: $status
    volatility: fast
timeline: []
mentions: []
---
