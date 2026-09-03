---
id: model/meta-muse-spark-1-3-contributor
kind: model
display_name: "Meta: Muse Spark 1.3 Contributor"
status: active
maintenance: living
aliases:
  - name: "Meta: Muse Spark 1.3 Contributor"
    class: manual
  - name: "Muse Spark 1.3 Contributor"
    class: exclusive
  - name: "meta/muse-spark-1.3-contributor"
    class: exclusive
feeds:
  openrouter-models: meta/muse-spark-1.3-contributor
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
  - field: contributor_tier_terms
    source: cited
    value: "prompts and outputs may be used to improve Meta's products"
    source_url: "https://openrouter.ai/meta/muse-spark-1.3-contributor"
    accessed: "2026-09-03"
    volatility: slow
  - field: release_date
    source: cited
    value: "2026-09-02"
    source_url: "https://openrouter.ai/meta/muse-spark-1.3-contributor"
    accessed: "2026-09-03"
    volatility: dated
timeline:
  - date: "2026-09-02"
    event: "released alongside the standard Muse Spark 1.3 row at the contributor price"
    source_url: "https://openrouter.ai/meta/muse-spark-1.3-contributor"
mentions:
  - org/meta-superintelligence-labs
  - model/meta-muse-spark-1-3
---

The contributor row is Spark 1.3 with the training-permission trade applied.
The [llm-releases card](https://llm-releases.com/models/muse-spark-1-3) for
the model states the deal in terms: the lower-cost contributor tier is offered
"in exchange for permission to train future Meta models on prompts and
completions." The card states the condition itself:
{{fact:model/meta-muse-spark-1-3-contributor#contributor_tier_terms}} — the
same trade the org entry records for the 1.2 contributor row.

The two rows carry the same model and the same
{{fact:model/meta-muse-spark-1-3-contributor#context_window}} window; the
price is where they part. The contributor row lists
{{fact:model/meta-muse-spark-1-3-contributor#price_input}} input against
{{fact:model/meta-muse-spark-1-3-contributor#price_output}} output, while the
standard row lists {{fact:model/meta-muse-spark-1-3#price_input}} input
against {{fact:model/meta-muse-spark-1-3#price_output}} output — the gap
between the two rows is the listed price of that trade.
