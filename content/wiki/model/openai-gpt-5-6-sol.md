---
id: model/openai-gpt-5-6-sol
kind: model
display_name: "OpenAI: GPT-5.6 Sol"
status: active
maintenance: living
aliases:
  - name: "OpenAI: GPT-5.6 Sol"
    class: manual
  - name: "GPT-5.6 Sol"
    class: exclusive
  - name: "openai/gpt-5.6-sol"
    class: exclusive
  - name: "Sol"
    class: manual
feeds:
  openrouter-models: openai/gpt-5.6-sol
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
  - field: tier_role
    source: cited
    value: "the highest reasoning ceiling in the family"
    source_url: "https://github.blog/changelog/2026-07-09-openais-gpt-5-6-sol-terra-and-luna-are-now-available-in-github-copilot/"
    accessed: "2026-08-28"
    volatility: slow
  - field: terminalbench_score
    source: cited
    value: "91.91% on TerminalBench 2.1 in ultra thinking mode, and 88.76% in max mode"
    source_url: "https://venturebeat.com/technology/openai-unveils-gpt-5-6-sol-terra-and-luna-models-but-only-accessible-to-limited-preview-partners-for-now-per-us-gov"
    accessed: "2026-08-28"
    volatility: dated
  - field: capture_the_flag_score
    source: cited
    value: "96.7% on OpenAI's internal capture-the-flag cybersecurity testing"
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
mentions:
  - org/openai
  - model/openai-gpt-5-6-terra
  - model/openai-gpt-5-6-luna
  - model/openai-gpt-5-6-sol-pro
  - model/openai-gpt-5-5
  - model/openai-gpt-5-5-pro
---

Sol did not launch straight to the public. On 26 June 2026, OpenAI put the
finished model in front of roughly 20 organisations "at the US
government's request" — thirteen days before anyone else could reach it.
General availability followed on
{{fact:model/openai-gpt-5-6-sol#release_date}}: OpenAI released the family
into its own API that day, and GitHub began rolling the three models out
in Copilot. The same
[VentureBeat report](https://venturebeat.com/technology/openai-unveils-gpt-5-6-sol-terra-and-luna-models-but-only-accessible-to-limited-preview-partners-for-now-per-us-gov)
on the preview carries two scores the GA announcements didn't repeat: this
row measured {{fact:model/openai-gpt-5-6-sol#terminalbench_score}}, and
{{fact:model/openai-gpt-5-6-sol#capture_the_flag_score}}.

This row's own record calls it {{fact:model/openai-gpt-5-6-sol#tier_role}},
and the scoreboard agrees against its two same-day siblings. The coding
index reads {{fact:model/openai-gpt-5-6-sol#coding_index}} here, against
{{fact:model/openai-gpt-5-6-terra#coding_index}} for Terra and
{{fact:model/openai-gpt-5-6-luna#coding_index}} for Luna; the agentic
index runs the same order: {{fact:model/openai-gpt-5-6-sol#agentic_index}}
against {{fact:model/openai-gpt-5-6-terra#agentic_index}} and
{{fact:model/openai-gpt-5-6-luna#agentic_index}}. Three models, one launch
day, one government-picked first audience — and Sol is the one OpenAI put
at the top of it.
