---
id: model/prose-divergent
kind: model
display_name: "Prose Divergent"
status: deprecated
maintenance: living
aliases:
  - name: "Prose Divergent"
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

This entry deliberately keeps `deprecated` in its own front matter even
though the bound feed fact currently reads `active`, mirroring
model/moonshotai-kimi-k2-5: the page's own reviewed judgment can outweigh
one feed's raw report, and that disagreement is meant to survive at render
time rather than being silently overwritten by the feed.
