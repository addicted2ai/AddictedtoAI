---
id: model/z-ai-glm-5-2-free
kind: model
display_name: "Z.ai: GLM 5.2 (free)"
status: active
maintenance: living
aliases:
  - name: "Z.ai: GLM 5.2 (free)"
    class: manual
feeds:
  openrouter-models: z-ai/glm-5.2:free
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
  - model/z-ai-glm-5-2
---

The `z-ai/glm-5.2:free` row left the OpenRouter catalog in the 2026-09-06
snapshot, a day after it was last listed — active, priced at zero, with no
expiry date and no warning in the row itself. Nothing arrived to take its place,
and the changed feed is where that would show: the withdrawal is the only
OpenRouter line it recorded that day, and it records arrivals as readily as
retirements. A live fetch of the catalog on 2026-09-07
([`https://openrouter.ai/api/v1/models`](https://openrouter.ai/api/v1/models))
carried 430 rows as observed on 7 September 2026, and confirmed the withdrawal.
It also showed how narrow the withdrawal was: eighteen `:free` rows survived
across nine other authors, and `z-ai/glm-5.2` itself was still listed. The bound facts above render as not published, with no as-of date
to show, rather than a dated last-known value — the row has left both the
current and the previous snapshot, so the data layer holds no as-of date for
it, and the values it carried on its last day are pinned in
`data/vanished/answered/` instead.

The model is not retired, and the withdrawn row was never a model of its own. It
and the surviving `z-ai/glm-5.2` row carry the same canonical slug,
`z-ai/glm-5.2-20260616`, and the same creation timestamp: two variants of one
model, of which one is gone. The router still lists 34 endpoints for GLM 5.2
from twenty-four providers — Z.AI's own among them, alongside Alibaba,
DeepInfra, Fireworks, Mistral, Together and Cloudflare — and not one of them is
priced at zero
([`…/models/z-ai/glm-5.2/endpoints`](https://openrouter.ai/api/v1/models/z-ai/glm-5.2/endpoints),
fetched 2026-09-07). Z.ai still publishes the weights: the Hugging Face
repository [`zai-org/GLM-5.2`](https://huggingface.co/zai-org/GLM-5.2) is
public, ungated, not disabled and MIT-licensed, and the Hub API reports it last
modified 2026-09-01 (fetched 2026-09-07).

It was not renamed either. OpenRouter's own page for the withdrawn slug still
resolves, names `https://openrouter.ai/z-ai/glm-5.2` as its canonical URL, and
carries `aliasTarget: null` and `deprecationDate: null` in its embedded model
data (fetched 2026-09-07) — the router neither pointed the slug at a replacement
nor published a deprecation for it.

What went is the free route, not the model. The withdrawn slug still resolves at
[`…/models/z-ai/glm-5.2:free/endpoints`](https://openrouter.ai/api/v1/models/z-ai/glm-5.2:free/endpoints)
and returns its metadata with an empty `endpoints` array (fetched 2026-09-07).
That is the delisting signature: the record survives, the supply is gone.
OpenRouter documents the suffix as access to "free versions of models" that "may
have different rate limits or availability compared to paid versions"
([Free Variant](https://openrouter.ai/docs/guides/routing/model-variants/free),
fetched 2026-09-07), and availability is the half that moved here. The free
route was the smaller one while it lasted, too: its last-known context window
was 256,000 tokens against the surviving row's 1,048,576.

Which provider served the free endpoint, and why it stopped, neither party
publishes. The empty `endpoints` array is a current state and not a history,
nothing on OpenRouter's page for the row explains the withdrawal, and the
release tracker this site follows carries no GLM 5.2 deprecation of any kind. So
this page records one router's withdrawal of a zero-cost serving tier for a
model that is otherwise widely served and openly published, and does not guess
at a cause. The `feeds:` binding is kept: if the row ever re-lists, it binds
straight back to this entry.
