---
id: model/google-gemini-3-1-pro-preview
kind: model
display_name: "Google: Gemini 3.1 Pro Preview"
status: active
maintenance: living
aliases:
  - name: "Google: Gemini 3.1 Pro Preview"
    class: manual
feeds:
  openrouter-models: google/gemini-3.1-pro-preview
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
  - field: status
    source: feed
    feed: openrouter-models
    path: $status
    volatility: fast
  - field: listed_date
    source: cited
    value: "2026-02-19"
    source_url: "https://openrouter.ai/google/gemini-3.1-pro-preview"
    accessed: "2026-08-28"
    volatility: dated
timeline: []
mentions:
  - org/google-deepmind
  - model/google-gemini-3-1-pro-preview-customtools
  - model/google-gemini-3-1-pro-preview-batch
  - model/google-gemini-3-1-flash-lite
  - model/google-gemini-3-1-flash-lite-preview
  - model/google-gemini-3-1-flash-image
  - model/google-gemini-3-1-flash-image-preview
---

This row first appeared in OpenRouter's catalog on
{{fact:model/google-gemini-3-1-pro-preview#listed_date}} — confirmed
against [the model's own listing](https://openrouter.ai/google/gemini-3.1-pro-preview)
today, which still shows no non-preview release. That is more than six
months before the snapshot of 31 August 2026 this page reads, and in all
that time the tier has never shipped a plain row: the catalog, as observed
on 31 August 2026, carried three Pro rows — this one, a batch billing tier,
and a custom-tools variant — and every one of them still carried "preview"
in its slug.

Its siblings didn't stay there. `google/gemini-3.1-flash-lite-preview` got
its plain row 65 days after listing, and
`google/gemini-3.1-flash-image-preview` got one 112 days after listing —
and for the second of them graduation was not merely a change of slug: the
plain row's context window is
{{fact:model/google-gemini-3-1-flash-image#context_window}} against the
preview's {{fact:model/google-gemini-3-1-flash-image-preview#context_window}},
which in the 31 August 2026 snapshot is twice the room at an unchanged
input price. The Pro tier, heading at
{{fact:model/google-gemini-3-1-pro-preview#price_input}} input — the top
listed provider's rate for that row rather than necessarily Google's own —
has had no such row at all.
