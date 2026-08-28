---
id: model/full-entry
kind: model
display_name: "Full Entry"
status: active
maintenance: living
themes: ["history"]
aliases:
  - name: "Full Entry"
    class: manual
  - name: "FE-1"
    class: manual
feeds:
  demo-source: "vendor/demo-model"
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
  - field: license
    source: cited
    value: "Apache-2.0"
    source_url: "https://example.org/full-entry/license"
    accessed: "2026-08-25"
    volatility: slow
timeline:
  - date: "2026-01-10"
    event: released
    source_url: "https://example.org/full-entry/release"
  - date: "2026-06-01"
    event: "context window doubled"
    source_url: "https://example.org/full-entry/context"
mentions:
  - concept/stub-entry
---

An entry with a prose body, feed-bound and cited facts, two timeline events
and a mention. This body exists so the page has every region at once.
