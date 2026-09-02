---
id: model/anthropic-claude-opus-4-7-fast
kind: model
display_name: "Anthropic: Claude Opus 4.7 (Fast)"
status: active
maintenance: living
aliases:
  - name: "Anthropic: Claude Opus 4.7 (Fast)"
    class: manual
feeds:
  openrouter-models: anthropic/claude-opus-4.7-fast
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

The `anthropic/claude-opus-4.7-fast` row vanished from the OpenRouter catalog
in the 2026-09-02 snapshot. A day earlier it was still listed, active, with
no expiry date. All three Anthropic fast rows left the catalog in that same
snapshot; this one was the short-lived member. The bound facts above still
render their last-known values as of 2026-09-01.

The row is not coming back, because Anthropic's fast mode does not exist for
this model. Its [fast-mode documentation](https://platform.claude.com/docs/en/build-with-claude/fast-mode)
names Claude Opus 5 and Claude Opus 4.8 as the supported models and says
"Requests to `claude-opus-4-7` with `speed: "fast"` return an error" — no
silent fallback to standard speed, where Opus 4.6 would have run standard.
OpenRouter's current listing of `anthropic/claude-opus-4.7` agrees: the
standard row remains, with its usual providers and no fast endpoint among
them.

So this variant cannot be called, here or on Anthropic's own API. The model
itself is still there at standard speed as `anthropic/claude-opus-4.7`.
Anthropic's docs point anyone who wanted the faster tier at Opus 5 or Opus
4.8 instead, and both of those rows are live on this router.
