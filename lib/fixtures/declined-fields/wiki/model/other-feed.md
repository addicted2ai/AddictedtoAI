---
id: model/other-feed
kind: model
display_name: "Other Feed"
status: active
maintenance: living
aliases:
  - name: "Other Feed"
    class: exclusive
feeds:
  other-source: "vendor/other-feed"
facts:
  # The SAME dotted path, bound from a DIFFERENT source. A refusal belongs to
  # the source that recorded it: `other-source` has declined nothing, so this
  # binding must come through untouched even while `demo-source` declines the
  # identical path. A join on the path alone would report it and would be
  # wrong — the two feeds are unrelated documents that happen to share a key.
  - field: intelligence_index
    source: feed
    feed: other-source
    path: benchmarks.demo_index.intelligence
    volatility: fast
timeline: []
mentions: []
---
