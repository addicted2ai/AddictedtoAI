---
id: model/demo-model
kind: model
display_name: "Demo Model"
status: active
maintenance: living
aliases:
  - name: "Demo Model"
    class: exclusive
  - name: "Demo"
    class: manual
feeds:
  demo-source: "vendor/demo-model"
facts:
  - field: license
    source: cited
    value: "Apache-2.0"
    source_url: "https://example.org/demo-model/license"
    accessed: "2026-08-25"
    volatility: slow
  - field: price_input
    source: feed
    feed: demo-source
    path: pricing.prompt
    volatility: fast
timeline:
  - date: "2026-06-01"
    event: released
    source_url: "https://example.org/demo-model/release"
mentions:
  - concept/demo-concept
themes:
  - history
---

Demo Model is the fixture corpus's stand-in for a frontier model entry: a
prose body, a cited fact, a feed-bound fact and one timeline event, which is
also the shape that makes an entry indexable.
