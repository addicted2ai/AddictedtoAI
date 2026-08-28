---
id: model/vanished-model
kind: model
display_name: "Vanished Model"
status: active
maintenance: living
aliases:
  - name: "Vanished Model"
    class: exclusive
feeds:
  # This row id is declared here but absent from the latest snapshot. Its
  # facts must render their last-known value with a visible as-of date and
  # must never render as current (specs/wiki).
  demo-source: "vendor/gone"
facts:
  - field: price_input
    source: feed
    feed: demo-source
    path: pricing.prompt
    volatility: fast
timeline: []
mentions: []
---
