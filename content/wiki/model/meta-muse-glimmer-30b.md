---
id: model/meta-muse-glimmer-30b
kind: model
display_name: "Meta: Muse Glimmer 30B"
status: active
maintenance: living
aliases:
  - name: "Meta: Muse Glimmer 30B"
    class: manual
  - name: "Muse Glimmer 30B"
    class: exclusive
  - name: "meta/muse-glimmer-30b"
    class: exclusive
feeds:
  openrouter-models: meta/muse-glimmer-30b
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
  - field: license
    source: cited
    value: "Apache License 2.0"
    source_url: "https://huggingface.co/meta-models/Muse-Glimmer-30B"
    accessed: "2026-08-28"
    volatility: slow
  - field: parameters
    source: cited
    value: "about 29.6B, including a 1.8B vision encoder"
    source_url: "https://huggingface.co/meta-models/Muse-Glimmer-30B"
    accessed: "2026-08-28"
    volatility: static
  - field: distilled_from
    source: cited
    value: "Muse Spark"
    source_url: "https://huggingface.co/meta-models/Muse-Glimmer-30B"
    accessed: "2026-08-28"
    volatility: static
  - field: local_hardware
    source: cited
    value: "runs offline on a single 24 GB consumer GPU"
    source_url: "https://en.wikipedia.org/wiki/Muse_Spark"
    accessed: "2026-08-28"
    volatility: slow
  - field: release_date
    source: cited
    value: "2026-08-10"
    source_url: "https://en.wikipedia.org/wiki/Muse_Spark"
    accessed: "2026-08-28"
    volatility: dated
timeline:
  - date: "2026-08-10"
    event: "released under the Apache License 2.0 — Meta's first open-weight release since the Llama line ended"
    source_url: "https://huggingface.co/meta-models/Muse-Glimmer-30B"
mentions:
  - org/meta-superintelligence-labs
  - model/meta-muse-spark-1-2
---
