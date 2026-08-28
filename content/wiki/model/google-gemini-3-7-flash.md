---
id: model/google-gemini-3-7-flash
kind: model
display_name: "Google: Gemini 3.7 Flash"
status: active
maintenance: living
aliases:
  - name: "Google: Gemini 3.7 Flash"
    class: manual
  - name: "Gemini 3.7 Flash"
    class: exclusive
  - name: "google/gemini-3.7-flash"
    class: exclusive
feeds:
  openrouter-models: google/gemini-3.7-flash
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
  - field: intelligence_index
    source: feed
    feed: openrouter-models
    path: benchmarks.artificial_analysis.intelligence_index
    volatility: fast
  - field: coding_index
    source: feed
    feed: openrouter-models
    path: benchmarks.artificial_analysis.coding_index
    volatility: fast
  - field: status
    source: feed
    feed: openrouter-models
    path: $status
    volatility: fast
  - field: release_date
    source: cited
    value: "2026-08-13"
    source_url: "https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-3-7-flash/"
    accessed: "2026-08-28"
    volatility: dated
  - field: introductory_pricing_ends
    source: cited
    value: "2026-12-31; regular pricing is double the introductory rate on input and output"
    source_url: "https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-3-7-flash/"
    accessed: "2026-08-28"
    volatility: dated
  - field: deepswe_score
    source: cited
    value: "65.3%, against 49.0% for the preceding Flash release"
    source_url: "https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-3-7-flash/"
    accessed: "2026-08-28"
    volatility: dated
  - field: frontiercode_score
    source: cited
    value: "43.6%, against 34.4% for the preceding Flash release"
    source_url: "https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-3-7-flash/"
    accessed: "2026-08-28"
    volatility: dated
timeline:
  - date: "2026-08-13"
    event: "released with introductory pricing declared to run through 2026-12-31"
    source_url: "https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-3-7-flash/"
mentions:
  - org/google-deepmind
  - model/google-gemini-3-6-flash
  - model/google-gemini-3-1-pro-preview
---
