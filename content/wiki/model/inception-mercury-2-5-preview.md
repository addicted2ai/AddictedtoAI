---
id: model/inception-mercury-2-5-preview
kind: model
display_name: "Inception: Mercury 2.5 Preview"
status: active
maintenance: living
aliases:
  - name: "Inception: Mercury 2.5 Preview"
    class: manual
  - name: "Mercury 2.5 Preview"
    class: exclusive
  - name: "Mercury 2.5"
    class: shared
  - name: "inception/mercury-2.5-preview"
    class: exclusive
feeds:
  openrouter-models: inception/mercury-2.5-preview
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
  - field: max_output_tokens
    source: feed
    feed: openrouter-models
    path: top_provider.max_completion_tokens
    volatility: fast
  - field: status
    source: feed
    feed: openrouter-models
    path: $status
    volatility: fast
  - field: architecture
    source: cited
    value: "Diffusion LLM (dLLM): produces and refines multiple tokens in parallel rather than one at a time"
    source_url: "https://openrouter.ai/inception/mercury-2.5-preview"
    accessed: "2026-09-02"
    volatility: static
  - field: release_date
    source: cited
    value: "2026-08-31"
    source_url: "https://openrouter.ai/inception/mercury-2.5-preview"
    accessed: "2026-09-02"
    volatility: dated
  - field: observed_throughput_p50
    source: cited
    value: "359 tok/s"
    source_url: "https://openrouter.ai/inception/mercury-2.5-preview"
    accessed: "2026-09-02"
    volatility: dated
  - field: observed_latency_p50
    source: cited
    value: "1.37 s"
    source_url: "https://openrouter.ai/inception/mercury-2.5-preview"
    accessed: "2026-09-02"
    volatility: dated
  - field: introductory_pricing_ends
    source: cited
    value: "2026-09-08 07:00 UTC"
    source_url: "https://openrouter.ai/inception/mercury-2.5-preview"
    accessed: "2026-09-02"
    volatility: dated
  - field: list_price_input
    source: cited
    value: "$0.20 per Mtok"
    source_url: "https://www.inceptionlabs.ai/models"
    accessed: "2026-09-02"
    volatility: slow
  - field: list_price_output
    source: cited
    value: "$0.75 per Mtok"
    source_url: "https://www.inceptionlabs.ai/models"
    accessed: "2026-09-02"
    volatility: slow
timeline:
  - date: "2026-08-31"
    event: "released as Mercury 2.5 Preview, Inception's latest diffusion LLM; the OpenRouter row is created the same day"
    source_url: "https://openrouter.ai/inception/mercury-2.5-preview"
  - date: "2026-09-02"
    event: "the OpenRouter change feed records the row's arrival"
    source_url: "https://openrouter.ai/api/v1/models"
mentions:
  - model/inception-mercury-2
  - model/openai-gpt-5-6-luna
  - model/google-gemini-3-5-flash-lite
  - model/anthropic-claude-haiku-4-5
---

Mercury 2.5 Preview is the newest diffusion LLM Inception has shipped, and
one of only two rows in the current OpenRouter snapshot whose listings
describe a diffusion model — both Inception's. The mechanism is the message:
an autoregressive model emits one token at a time, while Inception's listing
says Mercury 2.5 "produces and refines multiple tokens in parallel",
"achieving 1,107 tokens/sec on standard GPUs". That copy is the vendor's own
— the OpenRouter description is Inception's text — and
[llm-releases](https://llm-releases.com/models/mercury-2-5-preview), fetched
2 September 2026, files the same figures as claims: "vendor-reported figures
are claims until independently verified". This page records the claim; it
does not record a measurement of it.

OpenRouter's own page carries a different number for the same row: P50
throughput of {{fact:model/inception-mercury-2-5-preview#observed_throughput_p50}}
across its provider, with a P50 latency of
{{fact:model/inception-mercury-2-5-preview#observed_latency_p50}}, read off
the page fetched 2 September 2026. The two figures are not the same quantity
— a vendor capability claim against a traffic-derived median — and
OpenRouter computes them over a rolling 30-minute window of live traffic, so
the page reads differently from hour to hour.

The durable facts are the row's: released
{{fact:model/inception-mercury-2-5-preview#release_date}} as a preview, with
{{fact:model/inception-mercury-2-5-preview#context_window}} of context and a
max output of {{fact:model/inception-mercury-2-5-preview#max_output_tokens}};
API-only, via Inception's platform or the OpenRouter row, with no public
weights. Inception's models page prices Mercury 2.5 at
{{fact:model/inception-mercury-2-5-preview#list_price_input}} input and
{{fact:model/inception-mercury-2-5-preview#list_price_output}} output —
against Mercury 2's
{{fact:model/inception-mercury-2#price_input}} and
{{fact:model/inception-mercury-2#price_output}}.

The timing is the discount. OpenRouter's banner reads "Limited-time 80%
discount via Inception through September 8, 2026 at 07:00 UTC", and while
the window is open the row lists at
{{fact:model/inception-mercury-2-5-preview#price_input}} input and
{{fact:model/inception-mercury-2-5-preview#price_output}} output, an 80%
cut from the vendor's own list that the banner dates through
{{fact:model/inception-mercury-2-5-preview#introductory_pricing_ends}}. At
the promo rate the row undercuts its predecessor's current listing, so "the
cheapest diffusion tier" is a true reading of the snapshot while the promo
runs, and stops being one the day the window closes.

The positioning is Inception's, not measured. The listing's opening claim is
that Mercury 2.5 "is the fastest reasoning LLM"; it goes on to claim "a 10+
point jump in intelligence over Mercury 2" and "comparable quality to
cost-optimized frontier models like GPT-5.6 Luna (Low), Gemini 3.5
Flash-Lite, and Claude Haiku 4.5"; the models page repeats the comparison,
and the [vendor's homepage](https://www.inceptionlabs.ai/) adds "sub-300ms
time to first token, 5-7x higher throughput, and up to 70% lower cost per
task" — both fetched 2 September 2026. The snapshot carries no benchmark
indices for this row and the vendor publishes no scores, so nothing here is
independently verified. The listing names the production targets — search
agents, voice pipelines, and coding subagents — and the capabilities it
claims the architecture enables: tunable reasoning levels, parallel tool
calls, and schema-aligned JSON output, the last two checkable on the row,
which accepts `tools` and `response_format`.

Preview is the status, and it carries three caveats. The documented
developer path is text-only: the row's modalities are text-to-text, and the
[aimadetools explainer](https://www.aimadetools.com/blog/mercury-2-5-preview-explained/),
fetched 3 September 2026, is explicit that "the currently documented
developer path is a text model". The endpoint is OpenAI-compatible — the
same writeup shows the model called through the OpenAI SDK against
`https://api.inceptionlabs.ai/v1` — and Inception's homepage says its models are
"OpenAI API compatible and a drop-in replacement for traditional LLMs". And the
identifier is not a contract: the writeup tells developers to confirm the
direct model identifier in account documentation "before shipping; preview
aliases can change". It also states the pricing distinction this page's
arithmetic depends on, in plainer words: "OpenRouter's launch rates are an
80% promotional discount. They are not Inception's direct list price and may
change independently."
