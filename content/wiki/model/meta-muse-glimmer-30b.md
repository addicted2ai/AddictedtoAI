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

Glimmer's own card puts the count at
{{fact:model/meta-muse-glimmer-30b#parameters}} — most of a 30B model, but
not all of it doing the same job. Strip the 1.8B vision encoder out and the
text backbone is closer to 28B, small enough that the card's other claim,
{{fact:model/meta-muse-glimmer-30b#local_hardware}}, is the ordinary case
for this row rather than a stretch: a multimodal model sized to leave your
account out of the loop entirely.

That local-hardware claim is not just a spec-sheet line — this same row
also carries an OpenRouter price, {{fact:model/meta-muse-glimmer-30b#price_input}}
input against {{fact:model/meta-muse-glimmer-30b#price_output}} output over
a {{fact:model/meta-muse-glimmer-30b#context_window}} context window. The
identical weights are usable two ways: rented by the token through that
API, or downloaded once and run on a single card for every request after.
The licence governing the download is
{{fact:model/meta-muse-glimmer-30b#license}}, which attaches no
field-of-use or user-count condition to the second path — a hobbyist with
one consumer GPU gets the same weights a paying API customer is billed for.

Glimmer did not start as its own model. Per its card,
{{fact:model/meta-muse-glimmer-30b#distilled_from}} is where it comes from,
released {{fact:model/meta-muse-glimmer-30b#release_date}} — and the model
it was distilled from is not offered either way. Meta Superintelligence
Labs' own record of its flagship line states
{{fact:org/meta-superintelligence-labs#flagship_weights}}. The lab kept the
larger model behind the API and shipped only the smaller, distilled one as
something you can also just own.
