---
id: model/anthropic-claude-opus-4-8-fast
kind: model
display_name: "Anthropic: Claude Opus 4.8 (Fast)"
status: active
maintenance: living
aliases:
  - name: "Anthropic: Claude Opus 4.8 (Fast)"
    class: manual
feeds:
  openrouter-models: anthropic/claude-opus-4.8-fast
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

The `anthropic/claude-opus-4.8-fast` row disappeared from the OpenRouter
catalog in the 2026-09-02 snapshot, a day after it was last listed, active
and without an expiry date. The bound facts above still render their
last-known values as of 2026-09-01. The same snapshot also dropped the fast
rows for Claude Opus 5 and Claude Opus 4.7.

This was a consolidation, not a retirement. Anthropic's
[fast-mode documentation](https://platform.claude.com/docs/en/build-with-claude/fast-mode)
still lists Claude Opus 4.8 as a fast-mode model — a research preview, up
to 2.5 times the output tokens per second at twice the base price — and
OpenRouter sells the option on the standard row rather than as a separate
slug. Its own notice on the old slug's page dates the change to September
1, 2026: the dedicated fast model is deprecated, and fast mode is now
served by the fast service tier endpoint on Claude Opus 4.8 — request it
with `service_tier: "fast"` or `speed: "fast"`. "Requests to this model
keep working and are served by the same fast tier capacity, so no action is
required, but new integrations should target the regular model"
([model page](https://openrouter.ai/anthropic/claude-opus-4.8-fast);
[service-tier docs](https://openrouter.ai/docs/guides/features/service-tiers)).

So the old slug still answers and still serves; what changed is the name to
build against. The row left the router's model list between the 2026-09-01
and 2026-09-02 snapshots, which is why the facts above freeze at 2026-09-01.
For new work, call `anthropic/claude-opus-4.8` with `service_tier: "fast"`
or `speed: "fast"` — the fast endpoint on that row prices at $10 / $50 per
million tokens, the same rates this row's last-known facts record, twice the
standard $5 / $25. On Anthropic's own API, send `speed: "fast"` with the
`fast-mode-2026-02-01` beta header, per its
[fast-mode documentation](https://platform.claude.com/docs/en/build-with-claude/fast-mode).
What changed is the tier flag, not the capability.
