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
    accessed: "2026-09-01"
    volatility: slow
  - field: parameters
    source: cited
    value: "1T total, 32B activated"
    source_url: "https://huggingface.co/moonshotai/Kimi-K2.5"
    accessed: "2026-09-01"
    volatility: static
  - field: api_sunset
    source: cited
    value: "2026-08-31 — full platform sunset; closed to newly registered users beforehand"
    source_url: "https://platform.kimi.ai/docs/models"
    accessed: "2026-09-01"
    volatility: dated
timeline:
  - date: "2026-01-27"
    event: "released as an open-weight multimodal model with published weights"
    source_url: "https://siliconangle.com/2026/01/27/moonshot-ai-releases-open-source-kimi-k2-5-model-1t-parameters/"
  - date: "2026-08-31"
    event: "Moonshot's own API sunsets the model; migration directed to kimi-k3"
    source_url: "https://platform.kimi.ai/docs/models"
  - date: "2026-08-31"
    event: active
    source_url: https://openrouter.ai/api/v1/models
mentions:
  - org/moonshot-ai
  - model/moonshotai-kimi-k3
  - model/moonshotai-kimi-k2-7-code
---

This row had a death date on it, which almost none do: only a handful of
the several hundred rows in the OpenRouter catalog carry a non-null
`expiration_date` at any given time — a count and a membership that shift
from one snapshot to the next — and this one's date has since come due:
Moonshot's
platform record reads {{fact:model/moonshotai-kimi-k2-5#api_sunset}}, and
the vendor's model list has now moved to the past tense — "`kimi-k2.5` and
the `moonshot-v1` series were officially retired on August 31, 2026. Calls
to these models now return a 404 (model not found) error" — pointing
migrations at `kimi-k3`.

The catalog reads this row `active`; this page reads it `deprecated`, and
the disagreement is which signal counts. OpenRouter cleared the expiry from
its own row, {{fact:model/moonshotai-kimi-k2-5#expiration_date}}, and the
catalog's status is derived from that field — a cleared expiry reads
`active`. The `deprecated` badge follows Moonshot's own documentation,
which files `kimi-k2.5` under "Deprecated Models" — "officially
discontinued on August 31, 2026 and is no longer maintained or supported".
The router's data stopped carrying a date; the vendor's page says the model
is discontinued.

The arithmetic is the story. Released 27 January 2026, off the vendor's
platform on 31 August: 216 days of service for a model that shipped as a
trillion-parameter flagship, continually pretrained on roughly 15 trillion
mixed image and text tokens on top of Kimi-K2-Base, and topped the
tool-using HLE-Full evaluation — though not the plain one — on
[the day it launched](https://siliconangle.com/2026/01/27/moonshot-ai-releases-open-source-kimi-k2-5-model-1t-parameters/).
The [model card](https://huggingface.co/moonshotai/Kimi-K2.5) lists the
split: 50.2 on HLE-Full with tools, and 30.1 on the plain variant, where
Gemini 3 Pro's 37.5 is the top of the table.
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
