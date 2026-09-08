---
id: model/minimax-minimax-m3-free
kind: model
display_name: "MiniMax: MiniMax M3 (free)"
status: active
maintenance: living
aliases:
  - name: "MiniMax: MiniMax M3 (free)"
    class: manual
feeds:
  openrouter-models: minimax/minimax-m3:free
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
  - agents
  - coding
  - image
  - video
---

The `minimax/minimax-m3:free` row left OpenRouter's model catalog after it
was last seen on 2026-09-07. A live fetch of
[`https://openrouter.ai/api/v1/models`](https://openrouter.ai/api/v1/models)
on 2026-09-08 lists `minimax/minimax-m3` and
`minimax/minimax-m3:batch`, but not this row. The row-specific endpoint
request for
[`minimax/minimax-m3:free`](https://openrouter.ai/api/v1/models/minimax/minimax-m3:free/endpoints)
returned an empty `endpoints` array; the standard M3 endpoint remains
populated. OpenRouter's human-facing page still renders a page for the free
slug, so that page is not evidence that the route is currently served.

This was a time-limited free offer, not a retirement or rename of MiniMax M3.
GMI Cloud's official MiniMax Week page dates the promotion to August 24
through September 6, 2026, says that M3 was free for fourteen days, and says
standard pricing applies afterward
([campaign terms](https://www.gmicloud.ai/minimax-week)). MiniMax's own model
page still lists M3 and its API access
([model documentation](https://www.minimax.io/models/text/m3)). The available
sources establish that the free OpenRouter route ended after the promotion;
they do not provide a more specific withdrawal notice. The entry therefore
keeps its active status and its `feeds:` binding, so it can reconnect if the
free row is listed again.
