---
id: model/bound-model
kind: model
display_name: "Bound Model"
status: active
maintenance: living
aliases:
  - name: "Bound Model"
    class: exclusive
feeds:
  demo-source: "vendor/bound-model"
facts:
  # Ordinary bindings of paths no refusal touches. They must never fire, and
  # they are what makes the passing control mean something: a check that fires
  # on everything would "pass" the mutation test by accident.
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
  # Two leaves of one block. When a fixture registry declines the BLOCK
  # `benchmarks.demo_index`, both of these are bindings of a declined path by
  # the ancestor direction of the overlap test — which is the shape the real
  # corpus carries and the one an equality-only test would miss entirely.
  - field: intelligence_index
    source: feed
    feed: demo-source
    path: benchmarks.demo_index.intelligence
    volatility: fast
  - field: coding_index
    source: feed
    feed: demo-source
    path: benchmarks.demo_index.coding
    volatility: fast
  # A cited fact whose `source_url` happens to mention the same words. It binds
  # nothing a registry serves, so no refusal can reach it.
  - field: license
    source: cited
    value: "Apache-2.0"
    source_url: "https://example.org/bound-model/license"
    accessed: "2026-08-28"
    volatility: slow
timeline: []
mentions: []
---
