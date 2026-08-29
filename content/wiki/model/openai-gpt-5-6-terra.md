---
id: model/openai-gpt-5-6-terra
kind: model
display_name: "OpenAI: GPT-5.6 Terra"
status: active
maintenance: living
aliases:
  - name: "OpenAI: GPT-5.6 Terra"
    class: manual
feeds:
  openrouter-models: openai/gpt-5.6-terra
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
  - field: vendor_role
    source: cited
    value: "The balanced default. A strong all-round choice for everyday interactive and agentic coding."
    source_url: "https://github.blog/changelog/2026-07-09-openais-gpt-5-6-sol-terra-and-luna-are-now-available-in-github-copilot/"
    accessed: "2026-08-28"
    volatility: slow
  - field: capture_the_flag_score
    source: cited
    value: "91.84% on OpenAI's internal capture-the-flag cybersecurity testing"
    source_url: "https://venturebeat.com/technology/openai-unveils-gpt-5-6-sol-terra-and-luna-models-but-only-accessible-to-limited-preview-partners-for-now-per-us-gov"
    accessed: "2026-08-28"
    volatility: dated
  - field: terminalbench_comparison
    source: cited
    value: "outpaced GPT-5.5's 83.4% on TerminalBench"
    source_url: "https://venturebeat.com/technology/openai-unveils-gpt-5-6-sol-terra-and-luna-models-but-only-accessible-to-limited-preview-partners-for-now-per-us-gov"
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
    event: "input and output pricing cut by 20%"
    source_url: "https://developers.openai.com/api/docs/changelog"
mentions:
  - org/openai
  - model/openai-gpt-5-6-sol
  - model/openai-gpt-5-6-luna
  - model/openai-gpt-5-5
---

OpenAI's own positioning for this row, in GitHub's launch note, is
{{fact:model/openai-gpt-5-6-terra#vendor_role}} — the middle tier, not the
frontier one. The catalog disagrees about what that middle buys. As
observed on 28 August 2026, Terra beats the pricier release right before
it on every axis Artificial Analysis measures: the intelligence index
reads {{fact:model/openai-gpt-5-6-terra#intelligence_index}} here against
{{fact:model/openai-gpt-5-5#intelligence_index}} for `openai/gpt-5.5`, the
coding index {{fact:model/openai-gpt-5-6-terra#coding_index}} against
{{fact:model/openai-gpt-5-5#coding_index}}, agentic
{{fact:model/openai-gpt-5-6-terra#agentic_index}} against
{{fact:model/openai-gpt-5-5#agentic_index}}. The intelligence margin is
the thin one, a fraction of a point; the price margin is not, with Terra
listing {{fact:model/openai-gpt-5-6-terra#price_input}} input against
GPT-5.5's {{fact:model/openai-gpt-5-5#price_input}}.

Off the catalog's own scoreboard the gap looks wider than that thin index
margin suggests. Reporting from the June preview carries two figures the
catalog does not. The first: Terra
{{fact:model/openai-gpt-5-6-terra#terminalbench_comparison}} — beating, on
that benchmark, the same model it undercuts on price. The second:
{{fact:model/openai-gpt-5-6-terra#capture_the_flag_score}}, enough to put
the mid-tier model across the same "High" cyber threshold all three
GPT-5.6 models crossed. That preview reached roughly 20 organisations on 26 June 2026 at
the US government's request, thirteen days before this row's own
{{fact:model/openai-gpt-5-6-terra#release_date}} general availability.
