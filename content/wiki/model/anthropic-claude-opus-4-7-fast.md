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
snapshot, as observed on 2 September 2026, and this one had been there
longest: OpenRouter's records date it
to 2026-05-12, ahead of `anthropic/claude-opus-4.8-fast` (2026-05-27) and
`anthropic/claude-opus-5-fast` (2026-07-24).

The other two fast pages carry a dated notice; this one carries none. As of
September 1, 2026, OpenRouter deprecated `anthropic/claude-opus-4.8-fast`
and `anthropic/claude-opus-5-fast`, folded their fast mode into a fast
service tier on the regular rows, and stated that requests to the old slugs
keep working. The page for `anthropic/claude-opus-4.7-fast` says nothing of
the kind — no deprecation, no successor, no statement about calls at the
old slug. In this cohort, 4.8 and 5 were migrated; 4.7 was dropped.

What the sources do establish is that fast mode is not available on Opus
4.7. Anthropic's [fast-mode documentation](https://platform.claude.com/docs/en/build-with-claude/fast-mode)
(fetched 2026-09-02) names Claude Opus 5 and Claude Opus 4.8 as the
supported models and says "Fast mode is not available on Claude Opus 4.7.
Requests to `claude-opus-4-7` with `speed: "fast"` return an error" — no
silent fallback, where Opus 4.6 would have run standard. OpenRouter's
current listing of `anthropic/claude-opus-4.7` agrees: the standard row
remains, with its usual providers and no fast endpoint among them. The row
this page describes nonetheless existed, and sold at premium pricing until
the end: its last-known values as of 2026-09-01, $30.00 in / $150.00 out
per million tokens against the standard row's
{{fact:model/anthropic-claude-opus-4-7#price_input}} /
{{fact:model/anthropic-claude-opus-4-7#price_output}} — six times the
base — which OpenRouter's own description, still live, calls "identical
capabilities with higher output speed at premium 6x pricing." Nothing
in either source records how those two fit together; the row simply
stopped listing.
<!-- The $30.00 in / $150.00 out per-million-token literals in the paragraph
above are the vanished row's own last-known prices, dated 2026-09-01. The
row is gone — data/derived/feed-rows.json holds no pricing key for
anthropic/claude-opus-4.7-fast — so they cannot be transcluded, and the
currency-literal warnings they produce are deliberate, not rot. -->

So the honest answer is that fast mode on Opus 4.7 is not available
anywhere today. Anthropic's own API errors on `speed: "fast"` for this
model, and OpenRouter has removed the row without a word about whether the
old slug still serves — do not build on it. The model itself remains at
standard speed as `anthropic/claude-opus-4.7`, and Anthropic's docs point
anyone who wanted the faster tier at Opus 5 or Opus 4.8, both of which are
live on this router as standard rows with a fast service tier.
