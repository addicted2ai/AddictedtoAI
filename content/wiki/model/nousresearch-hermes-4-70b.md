---
id: model/nousresearch-hermes-4-70b
kind: model
display_name: "Nous: Hermes 4 70B"
status: active
maintenance: living
aliases:
  - name: "Nous: Hermes 4 70B"
    class: manual
feeds:
  openrouter-models: nousresearch/hermes-4-70b
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
timeline: [ { date: "2026-09-10", event: retired, source_url: https://openrouter.ai/api/v1/models } ]
mentions:
  - model/nousresearch-hermes-4-405b
---

The `nousresearch/hermes-4-70b` row left the OpenRouter catalog without a date
of its own. The row carried no `expiration_date`, was last seen 2026-09-09,
and is absent from the catalog snapshots of 2026-09-12 and 2026-09-14, with
the departure recorded 2026-09-10. A listing stopped listing; the catalog
gives no reason beyond the absence. That is the whole of what the catalog
says.

What did not happen is a retirement of the model. The
[Hermes-4-70B weights](https://huggingface.co/NousResearch/Hermes-4-70B),
fetched 2026-09-14, remain published under the vendor's own account with the
full model card — hybrid reasoning mode on Llama-3.1-70B, inference examples,
and links to FP8 and GGUF variants — and the vendor's
[releases page](https://nousresearch.com/releases), fetched 2026-09-14, still
lists Hermes-4-Llama-3.1-70B dated 08/26/25 with no retirement note. The only
newer Hermes the vendor positions near it, Hermes-4.3-Seed-36B, is listed
alongside it as a separate smaller model ("Roughly equivalent performance to
Hermes-4-70B at half the model size") with its own weights — a sibling, not a
rename, and nothing on either page calls it a successor to this row.

OpenRouter's own records agree the listing is over and the family is served.
Fetched 2026-09-14,
[openrouter.ai/nousresearch/hermes-4-70b](https://openrouter.ai/nousresearch/hermes-4-70b)
answers 404, while
[`…/models/nousresearch/hermes-4-70b/endpoints`](https://openrouter.ai/api/v1/models/nousresearch/hermes-4-70b/endpoints)
returns the old record with `"endpoints":[]` — the record survives, the
supply behind it does not. The larger sibling never left:
`nousresearch/hermes-4-405b` is still in the catalog snapshots, and its
[endpoints record](https://openrouter.ai/api/v1/models/nousresearch/hermes-4-405b/endpoints),
fetched 2026-09-14, holds one live Nebius endpoint. Nothing on OpenRouter says
the 70B row will return, and nothing names a replacement row — no new
`nousresearch/` row arrived in the window, and the catalog's remaining Hermes
entries are Hermes 3 and the 405B.

The withdrawn row's last-known listing carries
{{fact:model/nousresearch-hermes-4-70b#price_input}} in /
{{fact:model/nousresearch-hermes-4-70b#price_output}} out at
{{fact:model/nousresearch-hermes-4-70b#context_window}} of context. With no
successor listing there is no weights-identity question to settle — no second
listing claims these weights under another name.

The `feeds:` binding is kept. If `nousresearch/hermes-4-70b` is ever a catalog
row again it binds straight back to this entry. The served sibling is carried
separately as Nous: Hermes 4 405B.
