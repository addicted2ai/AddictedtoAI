---
id: model/ibm-granite-granite-4-1-8b
kind: model
display_name: "IBM: Granite 4.1 8B"
status: active
maintenance: living
aliases:
  - name: "IBM: Granite 4.1 8B"
    class: manual
feeds:
  openrouter-models: ibm-granite/granite-4.1-8b
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
mentions:
  - model/ibm-granite-granite-4-2-8b
---

The `ibm-granite/granite-4.1-8b` row left the OpenRouter catalog in the
2026-09-05 snapshot, one day after it was last listed — active, with no expiry
date and no warning in the row itself. A live fetch of the catalog the same day
([`https://openrouter.ai/api/v1/models`](https://openrouter.ai/api/v1/models),
431 rows) confirms the withdrawal: no `granite-4.1` row of any kind survives,
while `ibm-granite/granite-4.0-h-micro` and `ibm-granite/granite-4.2-8b` are
both still listed. The bound facts below render their last-known values as of
2026-09-04.

The model is not retired. IBM still publishes the weights: the Hugging Face
repository
[`ibm-granite/granite-4.1-8b`](https://huggingface.co/ibm-granite/granite-4.1-8b)
is public, ungated, not disabled and Apache-2.0 licensed, and the Hub API
reports it last modified 2026-05-04 (fetched 2026-09-05). Its model card names
no deprecation, no successor and no sunset date — it does not contain the string
"4.2" anywhere.

It was not renamed either, and that near-miss is worth naming because the slug
invites it. IBM: Granite 4.2 8B is a different model, not this one under a new
id. The two rows sat in the OpenRouter catalog beside each other on 2026-09-04;
their canonical slugs are `ibm-granite/granite-4.1-8b-20260429` and
`ibm-granite/granite-4.2-8b-20260831`; and Hugging Face records 4.2's
`base_model` as `ibm-granite/granite-4.1-8b-base` — a finetune of *this* model's
base, which makes it a successor generation rather than a new name for the same
thing. OpenRouter agrees on its own page for the withdrawn row
([openrouter.ai/ibm-granite/granite-4.1-8b](https://openrouter.ai/ibm-granite/granite-4.1-8b),
fetched 2026-09-05), whose embedded model data carries `"aliasTarget":null` and
`"deprecationDate":null` — the router neither pointed the slug at a replacement
nor published a deprecation for it.

What the disappearance records is that no provider serves the model through
this router any more. The model still resolves at
[`…/models/ibm-granite/granite-4.1-8b/endpoints`](https://openrouter.ai/api/v1/models/ibm-granite/granite-4.1-8b/endpoints)
and returns its metadata with an empty `endpoints` array. That is the delisting
signature: the record survives, the supply is gone. Granite is still served
through the router by Cloudflare (4.0 Micro) and by DeepInfra and CoreWeave
(4.2 8B), and DeepInfra's own catalog
([`https://api.deepinfra.com/models/list`](https://api.deepinfra.com/models/list),
fetched 2026-09-05) lists three Granite models — 4.2 3B, 4.2 8B and 4.2 30B —
with no 4.1 among them.

Which provider carried 4.1 8B before it went, and why it stopped, neither party
publishes. The empty `endpoints` array is a current state, not a history, and
nothing on OpenRouter's page for the row or in IBM's model card explains the
withdrawal. So this page records a delisting by one router of a model its
publisher still ships, and does not guess at a cause. The `feeds:` binding is
kept: if the row ever re-lists, it binds straight back to this entry.
