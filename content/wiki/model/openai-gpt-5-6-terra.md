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
timeline:
  - date: "2026-06-26"
    event: "previewed to roughly 20 organisations at the US government's request, ahead of public release"
    source_url: "https://venturebeat.com/technology/openai-unveils-gpt-5-6-sol-terra-and-luna-models-but-only-accessible-to-limited-preview-partners-for-now-per-us-gov"
  - date: "2026-07-09"
    event: "generally available across ChatGPT, Codex, the OpenAI API and GitHub Copilot"
    source_url: "https://github.blog/changelog/2026-07-09-openais-gpt-5-6-sol-terra-and-luna-are-now-available-in-github-copilot/"
mentions:
  - org/openai
  - model/openai-gpt-5-6-sol
  - model/openai-gpt-5-6-luna
  - model/openai-gpt-5-5
---

Terra beats the pricier release right before it on every axis Artificial
Analysis measures. The intelligence index reads
{{fact:model/openai-gpt-5-6-terra#intelligence_index}} here against
{{fact:model/openai-gpt-5-5#intelligence_index}} for `openai/gpt-5.5`; the
coding index runs {{fact:model/openai-gpt-5-6-terra#coding_index}}
against {{fact:model/openai-gpt-5-5#coding_index}}; agentic runs
{{fact:model/openai-gpt-5-6-terra#agentic_index}} against
{{fact:model/openai-gpt-5-5#agentic_index}}. All three numbers favour this
row. The price does the opposite: Terra lists at
{{fact:model/openai-gpt-5-6-terra#price_input}} input against GPT-5.5's
{{fact:model/openai-gpt-5-5#price_input}} — well under half.

Terra shipped inside the same government-requested preview as Sol and
Luna — all three reached roughly 20 organisations on 26 June 2026,
thirteen days before this row's own
{{fact:model/openai-gpt-5-6-terra#release_date}} general availability.
