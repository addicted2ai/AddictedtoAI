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
today, which still shows no non-preview release. That's 189 days ago as of
this writing, and this tier has never shipped a plain row: the
catalog carries three separate Pro variants — this one, a batch tier, and
a custom-tools variant — and every one of them still carries "preview" in
its slug.

Its siblings didn't stay there. `google/gemini-3.1-flash-lite-preview` and
`google/gemini-3.1-flash-image-preview` both eventually got a plain,
non-preview row in the same generation —
{{fact:model/google-gemini-3-1-flash-lite#price_input}} and
{{fact:model/google-gemini-3-1-flash-image#price_input}} respectively —
while the Pro tier, priced at
{{fact:model/google-gemini-3-1-pro-preview#price_input}} input and
carrying an Artificial Analysis intelligence index of
{{fact:model/google-gemini-3-1-pro-preview#intelligence_index}}, has not.
