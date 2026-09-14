---
id: model/nex-agi-nex-n2-mini
kind: model
display_name: "Nex AGI: Nex-N2-Mini"
status: active
maintenance: living
aliases:
  - name: "Nex AGI: Nex-N2-Mini"
    class: manual
feeds:
  openrouter-models: nex-agi/nex-n2-mini
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
timeline: [ { date: "2026-09-01", event: deprecated, source_url: https://openrouter.ai/api/v1/models }, { date: "2026-09-09", event: retired, source_url: https://openrouter.ai/api/v1/models } ]
mentions:
  - model/nex-agi-nex-n2-5-mini-free
domains_seeded:
  - image
---

The `nex-agi/nex-n2-mini` row left the OpenRouter catalog on the expiry date
its own listing gave it. The row carried `expiration_date` 2026-09-08, was
last seen 2026-09-08, and is absent from the catalog snapshots of 2026-09-12
and 2026-09-14, with the departure recorded 2026-09-09. A paid listing
reached its stated date and stopped listing. That is the whole of what the
catalog says.

In the same window the catalog gained the next generation.
`nex-agi/nex-n2.5-mini:free` and `nex-agi/nex-n2.5-pro:free` were created
eleven seconds apart on 2026-09-08T17:54Z, and their entries record arrival
in the 2026-09-09 fetch — the same fetch that stopped carrying this row.

Nex AGI calls the arrivals a new family, not a rename. Its
[Nex-N2.5 repository](https://github.com/nex-agi/Nex-N2.5), fetched
2026-09-14, opens "Today, Nex-AGI officially introduces Nex-N2.5, its
next-generation family of agentic models," and says "Nex-N2.5-mini and
Nex-N2.5-Pro continue to build on the multimodal foundations of Nex-N2, with
focused improvements in computer use, web browsing, and visually grounded
agentic capabilities." The
[Nex-N2.5-mini model card](https://huggingface.co/nex-agi/Nex-N2.5-mini),
fetched 2026-09-14, carries the same text and links hosted access on
OpenRouter for the mini and the Pro. The listings point at different
weights: the withdrawn row names `nex-agi/Nex-N2-Mini` and calls it "the
smaller sibling in the Nex-N2 series"; the new rows name
`nex-agi/Nex-N2.5-mini` and describe "an agentic model built to turn goals
into working, verified outcomes."

OpenRouter's own records agree the old listing is over and the new one is
served. Fetched 2026-09-14,
[openrouter.ai/nex-agi/nex-n2-mini](https://openrouter.ai/nex-agi/nex-n2-mini)
answers 404, while
[`…/models/nex-agi/nex-n2-mini/endpoints`](https://openrouter.ai/api/v1/models/nex-agi/nex-n2-mini/endpoints)
returns the old record with `"endpoints":[]` — the record survives, the
supply behind it does not. The `:free` successor's
[endpoints record](https://openrouter.ai/api/v1/models/nex-agi/nex-n2.5-mini:free/endpoints)
holds one live Nex AGI endpoint. Nothing on OpenRouter says the paid N2
entries will return, and nothing says paid N2.5 entries are coming.

What did not happen is a retirement of the model. The
[Nex-N2-Mini weights](https://huggingface.co/nex-agi/Nex-N2-mini), fetched
2026-09-14, remain published under the Apache licence with their full model card,
and neither the vendor's N2.5 announcement nor any OpenRouter record fetched
for this job announces an end to Nex-N2. The withdrawn row's last-known
listing carries {{fact:model/nex-agi-nex-n2-mini#price_input}} in /
{{fact:model/nex-agi-nex-n2-mini#price_output}} out at
{{fact:model/nex-agi-nex-n2-mini#context_window}} of context; its successor
lists {{fact:model/nex-agi-nex-n2-5-mini-free#price_input}} /
{{fact:model/nex-agi-nex-n2-5-mini-free#price_output}} at
{{fact:model/nex-agi-nex-n2-5-mini-free#context_window}}. Whether the two
listings ever ran the same weights is answered by neither publisher — the
vendor calls N2.5 a next-generation family with focused improvements, which
claims difference, not identity — so it is not answered here.

The `feeds:` binding is kept. If `nex-agi/nex-n2-mini` is ever a catalog row
again it binds straight back to this entry. The successor family is carried
separately as Nex AGI: Nex-N2.5-Mini (free).
