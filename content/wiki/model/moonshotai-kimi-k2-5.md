---
id: model/moonshotai-kimi-k2-5
kind: model
display_name: "MoonshotAI: Kimi K2.5"
status: deprecated
maintenance: living
aliases:
  - name: "MoonshotAI: Kimi K2.5"
    class: manual
  - name: "Kimi K2.5"
    class: exclusive
  - name: "moonshotai/kimi-k2.5"
    class: exclusive
feeds:
  openrouter-models: moonshotai/kimi-k2.5
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
  - field: expiration_date
    source: feed
    feed: openrouter-models
    path: expiration_date
    volatility: fast
  - field: status
    source: feed
    feed: openrouter-models
    path: $status
    volatility: fast
  - field: license
    source: cited
    value: "Modified MIT License, code and weights"
    source_url: "https://huggingface.co/moonshotai/Kimi-K2.5"
    accessed: "2026-08-28"
    volatility: slow
  - field: parameters
    source: cited
    value: "1T total, 32B activated"
    source_url: "https://huggingface.co/moonshotai/Kimi-K2.5"
    accessed: "2026-08-28"
    volatility: static
  - field: api_sunset
    source: cited
    value: "2026-08-31 — full platform sunset; closed to newly registered users beforehand"
    source_url: "https://platform.kimi.ai/docs/models"
    accessed: "2026-08-28"
    volatility: dated
timeline:
  - date: "2026-01-27"
    event: "released as an open-weight multimodal model with published weights"
    source_url: "https://siliconangle.com/2026/01/27/moonshot-ai-releases-open-source-kimi-k2-5-model-1t-parameters/"
  - date: "2026-08-31"
    event: "Moonshot's own API sunsets the model; migration directed to kimi-k3"
    source_url: "https://platform.kimi.ai/docs/models"
mentions:
  - org/moonshot-ai
  - model/moonshotai-kimi-k3
  - model/moonshotai-kimi-k2-7-code
---

This row has a death date on it, which almost none do. Of the 388 rows in
the OpenRouter snapshot of 28 August 2026, eight carry a non-null
`expiration_date`; this one reads
{{fact:model/moonshotai-kimi-k2-5#expiration_date}}. Moonshot's own model
list is blunter — "`kimi-k2.5` and the `moonshot-v1` series are no longer
available to newly registered users (full platform sunset on August 31)" —
and points migrations at `kimi-k3`.

The arithmetic is the story. Released 27 January 2026, off the vendor's
platform on 31 August: 216 days of service for a model that shipped as a
trillion-parameter flagship, trained on 15 trillion tokens of mixed image
and text, and topped the HLE-Full evaluation on
[the day it launched](https://siliconangle.com/2026/01/27/moonshot-ai-releases-open-source-kimi-k2-5-model-1t-parameters/).
Its replacement in the same family, `moonshotai/kimi-k3`, arrived on
16 July — 170 days after it.

What actually ends on 31 August is an endpoint, not a model. K2.5's weights
were published under a
[Modified MIT License](https://huggingface.co/moonshotai/Kimi-K2.5) and stay
downloadable after the API stops answering, so the retirement withdraws
Moonshot's hosting and nothing else: anyone with the hardware can keep
serving the same checkpoint. That is the practical difference between an
open-weight retirement and a closed one. For a closed model the sunset date
is the date the artefact becomes unreachable to everyone; here it is the
date one company stops paying for the GPUs.
