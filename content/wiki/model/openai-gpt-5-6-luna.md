---
id: model/openai-gpt-5-6-luna
kind: model
display_name: "OpenAI: GPT-5.6 Luna"
status: active
maintenance: living
aliases:
  - name: "OpenAI: GPT-5.6 Luna"
    class: manual
feeds:
  openrouter-models: openai/gpt-5.6-luna
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
  - field: coding_index
    source: feed
    feed: openrouter-models
    path: benchmarks.artificial_analysis.coding_index
    volatility: fast
  - field: agentic_index
    source: feed
    feed: openrouter-models
    path: benchmarks.artificial_analysis.agentic_index
    volatility: fast
  - field: status
    source: feed
    feed: openrouter-models
    path: $status
    volatility: fast
  - field: release_date
    source: cited
    value: "2026-07-09"
    source_url: "https://github.blog/changelog/2026-07-09-openais-gpt-5-6-sol-terra-and-luna-are-now-available-in-github-copilot/"
    accessed: "2026-08-28"
    volatility: dated
timeline:
  - date: "2026-06-26"
    event: "previewed to roughly 20 organisations at the US government's request, ahead of public release"
    source_url: "https://venturebeat.com/technology/openai-unveils-gpt-5-6-sol-terra-and-luna-models-but-only-accessible-to-limited-preview-partners-for-now-per-us-gov"
  - date: "2026-07-09"
    event: "released in the OpenAI API on the Responses, Chat Completions and Batch endpoints"
    source_url: "https://developers.openai.com/api/docs/changelog"
  - date: "2026-07-09"
    event: "rolling out in GitHub Copilot"
    source_url: "https://github.blog/changelog/2026-07-09-openais-gpt-5-6-sol-terra-and-luna-are-now-available-in-github-copilot/"
  - date: "2026-07-30"
    event: "input and output pricing cut by 80%"
    source_url: "https://developers.openai.com/api/docs/changelog"
mentions:
  - org/openai
  - model/openai-gpt-5-6-sol
  - model/openai-gpt-5-6-terra
  - model/openai-gpt-5-4-nano
---

Luna's row lists identically to a much smaller, much older tier. As
observed on 28 August 2026, this row lists
{{fact:model/openai-gpt-5-6-luna#price_input}} input, the same number
`openai/gpt-5.4-nano` lists —
{{fact:model/openai-gpt-5-4-nano#price_input}} — despite arriving two
minor versions later. The match is recent rather than designed: OpenAI cut
Luna's price by 80% on 30 July 2026, six weeks before that reading, and
the two rows have only lined up since. Nothing else matches: Luna's
context window runs
{{fact:model/openai-gpt-5-6-luna#context_window}} tokens against Nano's
{{fact:model/openai-gpt-5-4-nano#context_window}}, and the scoreboard gap
is wider still — intelligence
{{fact:model/openai-gpt-5-6-luna#intelligence_index}} against
{{fact:model/openai-gpt-5-4-nano#intelligence_index}}, coding
{{fact:model/openai-gpt-5-6-luna#coding_index}} against
{{fact:model/openai-gpt-5-4-nano#coding_index}}, agentic
{{fact:model/openai-gpt-5-6-luna#agentic_index}} against
{{fact:model/openai-gpt-5-4-nano#agentic_index}}.

Luna is also the cheapest of the three GPT-5.6 models by a wide margin —
only its own `openai/gpt-5.6-luna-pro` sibling matches it. In the same
28 August 2026 reading its
{{fact:model/openai-gpt-5-6-luna#price_input}} input undercuts Sol's
{{fact:model/openai-gpt-5-6-sol#price_input}} — the number Terra's row
lists too — by a factor of ten, while its intelligence index
({{fact:model/openai-gpt-5-6-luna#intelligence_index}}) trails Sol's
({{fact:model/openai-gpt-5-6-sol#intelligence_index}}) by a far smaller
proportion than its price does. Both of those rates are the top listed
provider's for their row rather than necessarily OpenAI's own, and two
rows need not be headed by the same provider, so the ten-fold gap is one
between listings. It shipped inside the same government-requested
preview as its two pricier siblings, reaching roughly 20 organisations on
26 June 2026 before its own
{{fact:model/openai-gpt-5-6-luna#release_date}} general release.
