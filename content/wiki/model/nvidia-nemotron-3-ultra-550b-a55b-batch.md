---
id: model/nvidia-nemotron-3-ultra-550b-a55b-batch
kind: model
display_name: "NVIDIA: Nemotron 3 Ultra (batch)"
status: active
maintenance: living
aliases:
  - name: "NVIDIA: Nemotron 3 Ultra (batch)"
    class: manual
feeds:
  openrouter-models: nvidia/nemotron-3-ultra-550b-a55b:batch
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

The `nvidia/nemotron-3-ultra-550b-a55b:batch` row left the OpenRouter catalog
in the 2026-09-03 snapshot, a day after it was last listed, active and without
an expiry date. A live fetch of the catalog the same day
(`https://openrouter.ai/api/v1/models`) confirms the delisting: no batch
variant for this model, while the parent `nvidia/nemotron-3-ultra-550b-a55b`
and `:free` rows remain. The bound facts above render their last-known values
as of 2026-09-02.

The model is not retired and was not renamed. NVIDIA still serves Nemotron 3
Ultra on its own NIM API
([build.nvidia.com](https://build.nvidia.com/nvidia/nemotron-3-ultra-550b-a55b),
live on 2026-09-03), OpenRouter still lists the standard and free rows, and the
batch row was the only change in the `nvidia/` namespace in the 2026-09-03
snapshot — no successor slug has appeared.

What is not published is why the batch variant specifically was withdrawn.
OpenRouter's batch offering is alive as a whole: 66 `:batch` rows remain in the
same catalog, and the [Batch API
quickstart](https://openrouter.ai/docs/batch-quickstart) documents an async
batch endpoint that takes a standard model slug. But this model's batch page
([`nvidia/nemotron-3-ultra-550b-a55b:batch`](https://openrouter.ai/nvidia/nemotron-3-ultra-550b-a55b:batch))
resolves with no providers, no pricing and no deprecation notice, and the
standard model's page carries no mention of a batch option or its removal.
NVIDIA's own pages say nothing about batch availability through OpenRouter. The
sources settle that this router delisted the row while the model is served on
the standard and free rows and on NVIDIA's own platform; they do not settle
whether the withdrawal was a fold into another tier or the retirement of batch
access for this model, so this page records the delisting rather than guessing.

No `:batch` variant for this model remains in the catalog. Whether the
router's async batch endpoint — which takes standard model slugs — will accept
the standard row is not published, and this page does not claim it. The binding
is kept, so a re-listing of this row would re-mint against this entry.
