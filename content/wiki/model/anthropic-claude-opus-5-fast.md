---
id: model/anthropic-claude-opus-5-fast
kind: model
display_name: Claude Opus 5 (Fast)
status: active
maintenance: living
aliases:
  - name: Claude Opus 5 (Fast)
    class: manual
feeds:
  openrouter-models: anthropic/claude-opus-5-fast
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
---

The `anthropic/claude-opus-5-fast` row was dropped from the OpenRouter
catalog in the 2026-09-02 snapshot. It was active, without an expiry date,
in the 2026-09-01 snapshot before it, and the bound facts above still
render their last-known values as of that day. The router withdrew the fast
rows for Claude Opus 4.8 and Claude Opus 4.7 in the same snapshot.

Fast mode is still on sale for this model. Anthropic's
[Opus 5 launch post](https://www.anthropic.com/news/claude-opus-5) describes
the model as "also offered in Fast mode, where it runs around 2.5 times the
default speed" at twice the base price, and its
[fast-mode documentation](https://platform.claude.com/docs/en/build-with-claude/fast-mode)
still names Opus 5 as a supported model. OpenRouter now serves the option
as an "Anthropic Fast" provider on the standard `anthropic/claude-opus-5`
row, at $10 / $50 per million tokens — the rates this row's last-known
facts above record.

The old `anthropic/claude-opus-5-fast` slug is deprecated, not broken.
OpenRouter's notice on its page dates the change to September 1, 2026: the
dedicated fast model is deprecated, and fast mode is now served by the fast
service tier endpoint on Claude Opus 5 — "Requests to this model keep
working and are served by the same fast tier capacity, so no action is
required, but new integrations should target the regular model"
([model page](https://openrouter.ai/anthropic/claude-opus-5-fast);
[service-tier docs](https://openrouter.ai/docs/guides/features/service-tiers)).
So the slug still answers, and existing requests still serve; what you call
for new work is `anthropic/claude-opus-5` with `service_tier: "fast"` or
`speed: "fast"`, or on Anthropic's own API `speed: "fast"` with the
`fast-mode-2026-02-01` beta header, per its
[fast-mode documentation](https://platform.claude.com/docs/en/build-with-claude/fast-mode).
The tier was folded into the parent row, not retired.
