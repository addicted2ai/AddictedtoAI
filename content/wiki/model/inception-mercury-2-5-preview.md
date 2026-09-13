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
  - date: "2026-09-08"
    event: "Inception releases Mercury 2.5 as a production model; the OpenRouter row inception/mercury-2.5 is created the same day"
    source_url: "https://www.inceptionlabs.ai/blog/introducing-mercury-2-5"
  - date: "2026-09-09"
    event: "the preview listing leaves the OpenRouter catalog, superseded by inception/mercury-2.5"
    source_url: https://openrouter.ai/api/v1/models
mentions:
  - model/inception-mercury-2-5
  - model/inception-mercury-2
  - model/openai-gpt-5-6-luna
  - model/google-gemini-3-5-flash-lite
  - model/anthropic-claude-haiku-4-5
---

The `inception/mercury-2.5-preview` row left the OpenRouter catalog in the
2026-09-09 fetch, eight days after it arrived, and none of the usual reasons
apply. The model was not retired, no router dropped it, and nothing was folded
into a service tier. Inception released Mercury 2.5 as a production model on
2026-09-08, OpenRouter opened `inception/mercury-2.5` the same evening, and the
preview listing was withdrawn from under it. What this page describes is being
served right now under a shorter name.

Inception said so plainly. [*Introducing Mercury 2.5*](https://www.inceptionlabs.ai/blog/introducing-mercury-2-5),
filed under Product, dated Sep 8, 2026 and signed by CEO Stefano Ermon, opens
"Today, we’re releasing Mercury 2.5, our most capable production model yet."
The word *preview* survives twice in that post and neither time is about this
model: "Alongside Mercury 2.5, we’re announcing a preview of Mercury Voice and
Mercury Router." Inception's [models page](https://www.inceptionlabs.ai/models)
and its [platform documentation](https://docs.inceptionlabs.ai/get-started/models)
carry three models between them — Mercury 2.5, Mercury 2 and Mercury Edit 2 —
and the docs' own request example names the identifier `mercury-2.5`. Neither
page offers `mercury-2.5-preview` as an id, and neither uses the word preview
about this model at all. Both fetched 2026-09-13.

OpenRouter's records say the same thing more usefully, because they keep the two
listings apart instead of collapsing them. Fetched 2026-09-13,
[openrouter.ai/inception/mercury-2.5-preview](https://openrouter.ai/inception/mercury-2.5-preview)
answers HTTP 307 to `/inception/mercury-2.5`, and
[`…/models/inception/mercury-2.5-preview/endpoints`](https://openrouter.ai/api/v1/models/inception/mercury-2.5-preview/endpoints)
returns HTTP 200 whose payload is the successor's — `"id":"inception/mercury-2.5"`,
one Inception endpoint, `"name":"Inception | inception/mercury-2.5-20260908"`.
The preview's own dated record is still reachable at
[`…/models/inception/mercury-2.5-preview-20260831/endpoints`](https://openrouter.ai/api/v1/models/inception/mercury-2.5-preview-20260831/endpoints)
and answers `"id":"inception/mercury-2.5-preview"` with `"endpoints":[]`: the
record survives, the supply behind it does not. The catalog itself no longer
carries this row id in any form: as observed on 2026-09-12, its 445 rows hold
`inception/mercury-2` and `inception/mercury-2.5` and nothing under the preview
slug, and a direct fetch of the live catalog on 2026-09-13 found the same. This
entry keeps its binding to the withdrawn row regardless, so the name binds
straight back here if it is ever a catalog row again.

Whether the two listings ran the same weights is answered by neither publisher,
so it is not answered here. Their canonical slugs date them eight days apart,
`inception/mercury-2.5-preview-20260831` against `inception/mercury-2.5-20260908`,
while everything else the catalog publishes about them matches: the same context
length, the same output cap, the same parameter list, the same prices, and the
same description, which the successor's page carries word for word down to
"achieving 1,107 tokens/sec on standard GPUs". The copy did not change. It
changed rows.

The preview week is worth keeping on the record, because the mechanism is the
message. An autoregressive model emits one token at a time, while Inception's
listing says Mercury 2.5 "produces and refines multiple tokens in parallel".
That copy is the vendor's own — the OpenRouter description is Inception's text
— and [llm-releases](https://llm-releases.com/models/mercury-2-5-preview),
fetched 2 September 2026, files the same figures as claims: "vendor-reported
figures are claims until independently verified". This page records the claim;
it does not record a measurement of it. OpenRouter's page carried a different
number for the same row while the row existed: P50 throughput of
{{fact:model/inception-mercury-2-5-preview#observed_throughput_p50}} across its
provider, with a P50 latency of
{{fact:model/inception-mercury-2-5-preview#observed_latency_p50}}, read off the
page on 2 September 2026. The two figures are not the same quantity — a vendor
capability claim against a traffic-derived median — and OpenRouter computes the
median over a rolling 30-minute window of live traffic, so it never read the
same way twice.

The durable facts are the row's. It was released
{{fact:model/inception-mercury-2-5-preview#release_date}} as a preview, and its
last-known listing, as of 2026-09-08, carried 260,000 tokens of context and a
65,536-token maximum output, text in and text out — API-only, via Inception's
platform or the OpenRouter row, with no public weights. Inception's models page
prices Mercury 2.5 at
{{fact:model/inception-mercury-2-5-preview#list_price_input}} input and
{{fact:model/inception-mercury-2-5-preview#list_price_output}} output —
against Mercury 2's
{{fact:model/inception-mercury-2#price_input}} and
{{fact:model/inception-mercury-2#price_output}}.
<!-- The 260,000-token context and 65,536-token output literals above are the
vanished row's own last-known values, dated 2026-09-08 and pinned in
data/vanished/answered/openrouter-models--inception-mercury-2-5-preview.md. The
row is gone from both snapshots, so data/derived/feed-rows.json holds no
context_length or top_provider key for it and neither figure can be
transcluded. The currency-literal warning the context figure raises is
deliberate, not rot, and so are the four the price quotation below raises:
those are Inception's own published rates, quoted from its announcement. -->

The discount outlived the window that was supposed to end it. The preview
listing's banner, read on 2 September 2026, said "Limited-time 80% discount via
Inception through September 8, 2026 at 07:00 UTC", which this page records as
{{fact:model/inception-mercury-2-5-preview#introductory_pricing_ends}}. The
window closed on schedule and the listing did not outlast the day: OpenRouter
puts the successor row's creation at 2026-09-08T18:28:57Z, eleven and a half
hours after the stated expiry, and the discount moved across with it. Inception's
announcement states both rates — "Price: $0.20 per million input and $0.75 per
million output. At launch, Mercury 2.5 is 80% off at $0.04 per million input and
$0.15 per million output" — the same promotional pair the withdrawn row carried
when it was last seen. Fetched 2026-09-13, the successor's OpenRouter page shows
an "80% off" badge with the list rate struck through, its payload carries
`"discount":0.8`, and Inception's own models page and docs table show the same
strikethroughs. No end date accompanies any of them. Searched in full, the
markup of all three pages contains no "Limited-time", no "expires" and no
"until"; the only written-out date on the successor's page is its release date,
and the only one on Inception's models page is the Framer publish stamp in its
first line. An introductory window on a preview row and a standing rate on a
production row are different things to budget against, and this one quietly
became the second.

The positioning was Inception's, not measured. The listing's opening claim is
that Mercury 2.5 "is the fastest reasoning LLM"; it goes on to claim "a 10+
point jump in intelligence over Mercury 2" and "comparable quality to
cost-optimized frontier models like GPT-5.6 Luna (Low), Gemini 3.5
Flash-Lite, and Claude Haiku 4.5"; the models page repeats the comparison,
and the [vendor's homepage](https://www.inceptionlabs.ai/) adds "sub-300ms
time to first token, 5-7x higher throughput, and up to 70% lower cost per
task" — both fetched 2 September 2026. The snapshot carried no benchmark
indices for this row and the vendor publishes no scores, so nothing here is
independently verified. The listing named the production targets — search
agents, voice pipelines, and coding subagents — and the capabilities it
claimed the architecture enables: tunable reasoning levels, parallel tool
calls, and schema-aligned JSON output, the last two checkable on the row,
which accepted `tools` and `response_format`.

Preview was the status for eight days, and it carried three caveats. The
documented developer path was text-only: the row's modalities were
text-to-text, and the
[aimadetools explainer](https://www.aimadetools.com/blog/mercury-2-5-preview-explained/),
fetched 3 September 2026, is explicit that "the currently documented
developer path is a text model". The endpoint is OpenAI-compatible — the
same writeup shows the model called through the OpenAI SDK against
`https://api.inceptionlabs.ai/v1` — and Inception's homepage says its models are
"OpenAI API compatible and a drop-in replacement for traditional LLMs". And the
identifier is not a contract: the writeup told developers to confirm the
direct model identifier in account documentation "before shipping; preview
aliases can change". Five days later it changed. The old slug still resolves —
OpenRouter answers the model path under it, and Inception's own models page,
republished 2026-09-09, still links to it — but what it resolves to is the
successor's record, not a listing of its own. That is the distinction the caveat
was about, and it is the one worth carrying forward: a preview alias is a
pointer, and a pointer is not a promise about what sits behind it.
