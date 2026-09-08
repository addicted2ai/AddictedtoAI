---
id: model/minimax-minimax-m2-7-free
kind: model
display_name: "MiniMax: MiniMax M2.7 (free)"
status: active
maintenance: living
aliases:
  - name: "MiniMax: MiniMax M2.7 (free)"
    class: manual
feeds:
  openrouter-models: minimax/minimax-m2.7:free
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
timeline: []
mentions: []
domains_seeded:
  - coding
---

The `minimax/minimax-m2.7:free` row left OpenRouter's model catalog after it
was last seen on 2026-09-07. A live fetch of
[`https://openrouter.ai/api/v1/models`](https://openrouter.ai/api/v1/models)
on 2026-09-08 does not include the row. The row-specific endpoint record still
exists at
[`/api/v1/models/minimax/minimax-m2.7:free/endpoints`](https://openrouter.ai/api/v1/models/minimax/minimax-m2.7:free/endpoints),
but its `endpoints` array is empty. That establishes that the free OpenRouter
route is no longer being served; it does not establish why it was withdrawn.

MiniMax's own model documentation still lists `MiniMax-M2.7` as a supported
model, but does not list a free tier
([model listing](https://platform.minimax.io/docs/api-reference/models/anthropic/list-models),
fetched 2026-09-08). The evidence therefore supports a router-specific
withdrawal of the free tier, not retirement or renaming of the underlying
MiniMax model. OpenRouter and MiniMax do not publish a reason for the empty
free route, so this page does not guess at one. The `feeds:` binding remains so
the entry can reconnect if the row is listed again.
