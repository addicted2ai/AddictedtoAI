---
id: model/meta-muse-spark-1-3
kind: model
display_name: "Meta: Muse Spark 1.3"
status: active
maintenance: living
aliases:
  - name: "Meta: Muse Spark 1.3"
    class: manual
  - name: "Muse Spark 1.3"
    class: exclusive
  - name: "meta/muse-spark-1.3"
    class: exclusive
feeds:
  openrouter-models: meta/muse-spark-1.3
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
  - field: price_cache_read
    source: feed
    feed: openrouter-models
    path: pricing.input_cache_read
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
  - field: release_date
    source: cited
    value: "2026-09-02"
    source_url: "https://openrouter.ai/meta/muse-spark-1.3"
    accessed: "2026-09-03"
    volatility: dated
  - field: license
    source: cited
    value: "Open weights · Meta license (weights pending); weights not released"
    source_url: "https://llm-releases.com/models/muse-spark-1-3"
    accessed: "2026-09-03"
    volatility: slow
timeline:
  - date: "2026-09-02"
    event: "released; the flagship card still lists 'Open weights · Meta license (weights pending)' with weights not released — a listing first seen on the Muse Spark 1.2 card"
    source_url: "https://llm-releases.com/models/muse-spark-1-3"
mentions:
  - org/meta-superintelligence-labs
  - model/meta-muse-spark-1-2
  - model/meta-muse-spark-1-3-contributor
---

Spark 1.3 is a point release whose one notable row in the catalog is the
license line, and that row is notable for having stalled. Released
[2 September 2026](https://openrouter.ai/meta/muse-spark-1.3),
it is Meta's reasoning model for long-running agent work: the OpenRouter
listing positions it for "long-running agentic, multi-agent, and coding
workflows," built to track information across extended tasks and request
confirmation when needed. It keeps the family's million-token window — a
{{fact:model/meta-muse-spark-1-3#context_window}} context window — and the
row lists {{fact:model/meta-muse-spark-1-3#price_input}} input against
{{fact:model/meta-muse-spark-1-3#price_output}} output, with
{{fact:model/meta-muse-spark-1-3#price_cache_read}} on a cache read.

The detail worth reading twice is what the [llm-releases card](https://llm-releases.com/models/muse-spark-1-3)
records under License and Weights: {{fact:model/meta-muse-spark-1-3#license}}.
The listing first appeared on a Spark flagship with [Muse Spark 1.2's card](https://llm-releases.com/models/muse-spark-1-2)
on 5 August 2026 — the [1.1 card](https://llm-releases.com/models/muse-spark-1-1)
read Proprietary — and one full flagship release later the Weights field still
has not moved. It is a listing, not a release: nothing is downloadable, and
the pending state is the checkable fact — if the weights land, the line's
flagship is open again; if they do not, the flag stays a dated record of an
open-sourcing hope unfulfilled.

One limitation sits on the card before you pipe audio into it.
[OpenRouter's notice](https://openrouter.ai/meta/muse-spark-1.3) for this row
says "Audio understanding in Muse Spark 1.3 is currently not fully supported,
and response quality for requests including audio content may be degraded."
