---
id: model/moonshotai-kimi-k3
kind: model
display_name: "MoonshotAI: Kimi K3"
status: active
maintenance: living
aliases:
  - name: "MoonshotAI: Kimi K3"
    class: manual
  - name: "Kimi K3"
    class: exclusive
  - name: "moonshotai/kimi-k3"
    class: exclusive
feeds:
  openrouter-models: moonshotai/kimi-k3
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
  - field: status
    source: feed
    feed: openrouter-models
    path: $status
    volatility: fast
  - field: parameters
    source: cited
    value: "2.8T total, 104B activated"
    source_url: "https://huggingface.co/moonshotai/Kimi-K3"
    accessed: "2026-08-28"
    volatility: static
  - field: license
    source: cited
    value: "Kimi K3 License — bespoke, with a revenue-sharing clause for large inference providers"
    source_url: "https://huggingface.co/moonshotai/Kimi-K3"
    accessed: "2026-08-28"
    volatility: slow
  - field: listed_date
    source: cited
    value: "2026-07-16"
    source_url: "https://openrouter.ai/moonshotai/kimi-k3"
    accessed: "2026-08-28"
    volatility: dated
timeline:
  - date: "2026-07-16"
    event: "listed as an open-weight 2.8T-parameter multimodal reasoning model; migration target for the retiring Kimi K2.5"
    source_url: "https://openrouter.ai/moonshotai/kimi-k3"
mentions:
  - org/moonshot-ai
  - model/moonshotai-kimi-k2-5
---

Scale, not the licence, is the plainest thing that changed between
Moonshot's last two flagships. K2.5 published at
{{fact:model/moonshotai-kimi-k2-5#parameters}}; K3, listed
{{fact:model/moonshotai-kimi-k3#listed_date}}, at
{{fact:model/moonshotai-kimi-k3#parameters}}. Total parameters grew by a
factor of nearly three; the activated path — the fraction of the model
that actually runs per token — grew faster still, by a factor of just
over three. Whatever else changed between the two releases, the successor
is not a trimmed-down or cheaper-to-serve version of the model it
replaces.

The two flagships also overlap on the calendar rather than handing off
cleanly. K3's listing date is 46 days ahead of
{{fact:model/moonshotai-kimi-k2-5#api_sunset}} — for that stretch, both
were live on Moonshot's own platform at once. What actually disappears at
the end of it is the hosted endpoint, not the older model itself: K2.5's
weights ship under {{fact:model/moonshotai-kimi-k2-5#license}}, which keeps
them downloadable and rerunnable on someone else's hardware regardless of
what Moonshot does with its own.

Whether the bigger model is also the better one is a question this
catalog answers directly rather than by press release. On the Artificial
Analysis intelligence index, K3 scores
{{fact:model/moonshotai-kimi-k3#intelligence_index}} against K2.5's
{{fact:model/moonshotai-kimi-k2-5#intelligence_index}} in the same
snapshot — both the parameter increase above and whatever it bought sit in
the same table, checkable against each other rather than taken on either
model's word.
