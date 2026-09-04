---
id: org/meta-superintelligence-labs
kind: org
display_name: Meta Superintelligence Labs
status: active
maintenance: stable
aliases:
  - name: Meta Superintelligence Labs
    class: exclusive
  - name: MSL
    class: manual
  - name: Meta AI
    class: shared
  - name: Meta
    class: manual
facts:
  - field: flagship_weights
    source: cited
    value: "not released; Meta's 1.3 announcement (2026-09-02) names 'the Muse Spark open weights release' on its roadmap"
    source_url: "https://research.meta.ai/blog/introducing-muse-spark-1-3"
    accessed: "2026-09-03"
    volatility: slow
  - field: flagship_weights_listing
    source: cited
    value: "listed 'Open weights · Meta license (weights pending)' with weights 'Not released'"
    source_url: "https://llm-releases.com/models/muse-spark-1-2"
    accessed: "2026-09-03"
    volatility: slow
  - field: open_weight_release
    source: cited
    value: "Muse Glimmer 30B, Apache License 2.0"
    source_url: "https://huggingface.co/meta-models/Muse-Glimmer-30B"
    accessed: "2026-08-28"
    volatility: slow
  - field: previous_model_line
    source: cited
    value: "Llama; last frontier release 2025-04-05 under the Llama 4 Community License Agreement"
    source_url: "https://huggingface.co/meta-llama/Llama-4-Maverick-17B-128E-Instruct"
    accessed: "2026-08-28"
    volatility: static
  - field: contributor_tier_terms
    source: cited
    value: "prompts and outputs may be used to improve Meta's products"
    source_url: "https://openrouter.ai/meta/muse-spark-1.2-contributor"
    accessed: "2026-08-28"
    volatility: slow
timeline:
  - date: "2025-04-05"
    event: "Llama 4 Maverick released under the Llama 4 Community License Agreement — the last frontier Llama release"
    source_url: "https://huggingface.co/meta-llama/Llama-4-Maverick-17B-128E-Instruct"
  - date: "2026-04-08"
    event: "Muse Spark introduced as Meta Superintelligence Labs' first model, with closed weights"
    source_url: "https://about.fb.com/news/2026/04/introducing-muse-spark-meta-superintelligence-labs/"
  - date: "2026-07-09"
    event: "Muse Spark 1.1 launched"
    source_url: "https://en.wikipedia.org/wiki/Muse_Spark"
  - date: "2026-08-05"
    event: "Muse Spark 1.2 released"
    source_url: "https://en.wikipedia.org/wiki/Muse_Spark"
  - date: "2026-08-10"
    event: "Muse Glimmer 30B released under the Apache License 2.0"
    source_url: "https://huggingface.co/meta-models/Muse-Glimmer-30B"
  - date: "2026-09-02"
    event: "Muse Spark 1.3 released; the flagship card's 'Open weights · Meta license (weights pending)' listing, unchanged since the 1.2 release, still shows weights not released"
    source_url: "https://llm-releases.com/models/muse-spark-1-3"
mentions:
  - model/meta-muse-spark-1-2
  - model/meta-muse-spark-1-2-contributor
  - model/meta-muse-glimmer-30b
  - model/meta-llama-llama-4-maverick
  - model/meta-muse-spark-1-1
  - model/meta-muse-spark-1-3
  - model/meta-muse-spark-1-3-contributor
---

The company that made open weights a mainstream expectation stopped shipping
them at the frontier. Meta's last frontier Llama release was Llama 4 Maverick
on 5 April 2025. Its successor line arrived a year later: Muse Spark,
introduced [8 April 2026](https://about.fb.com/news/2026/04/introducing-muse-spark-meta-superintelligence-labs/)
by Meta Superintelligence Labs, with the weights kept closed and the
announcement saying only that Meta "hope[s] to open-source future versions of
the model." In the OpenRouter catalog the change shows up as a change of
prefix: `meta-llama/` rows stop in 2025, `meta/` rows begin in July 2026.

The catalogue's license line moved ahead of the weights themselves, and then
stalled. Muse Spark 1.2's card on [llm-releases](https://llm-releases.com/models/muse-spark-1-2),
released 5 August 2026, was the first Spark flagship
{{fact:org/meta-superintelligence-labs#flagship_weights_listing}}; the card
added that "Meta has signaled open weights are coming." One full flagship
release later, on 2 September 2026, Muse Spark 1.3's
[card](https://llm-releases.com/models/muse-spark-1-3) carries the same
License and Weights lines, character for character. A month of "pending"
spanning two releases,
with nothing downloadable, is its own fact — and the catalogue contradicts
itself about what the flag means: its own
[changelog](https://llm-releases.com/changelog) still describes Glimmer as
"its first open-weight model after the closed Muse Spark line." The only
Spark-family weights actually shipped remain the distilled Glimmer 30B under
Apache-2.0.

The licence went the other way. Llama shipped under Meta's own
[Llama 4 Community License Agreement](https://huggingface.co/meta-llama/Llama-4-Maverick-17B-128E-Instruct),
which required a separate licence from Meta for any product with more than
700 million monthly active users, obliged you to display "Built with Llama,"
and made you prefix derived model names with "Llama." The open-weight model
Meta shipped on 10 August 2026, Muse Glimmer 30B, is
[Apache-2.0](https://huggingface.co/meta-models/Muse-Glimmer-30B): no user
threshold, no naming clause, and a licence text left unmodified. A usage
policy still ships in the repository, but the Apache grant never references
it, so it binds nothing — where the Llama agreement made adherence to its
acceptable-use policy a condition of the licence. Meta's open weights got
freer and smaller in the same move — Glimmer is a distillation of Muse Spark
sized to run on one consumer GPU, not the flagship.

The third row is the one to read the terms on. Alongside
`meta/muse-spark-1.2` at {{fact:model/meta-muse-spark-1-2#price_input}} input,
Meta lists `meta/muse-spark-1.2-contributor` at
{{fact:model/meta-muse-spark-1-2-contributor#price_input}} — the same model,
the same million-token window, with one condition stated in the listing:
{{fact:org/meta-superintelligence-labs#contributor_tier_terms}}. The gap
between those two prices is a public number for what a prompt is worth to
Meta, offered as a discount rather than asked for as a favour.
