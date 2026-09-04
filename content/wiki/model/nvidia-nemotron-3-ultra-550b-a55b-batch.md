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
and `:free` rows remain. The bound facts above no longer render a dated
last-known value: the row has left both the current and previous snapshots,
so the data layer records no as-of date for it.

The model is not retired and was not renamed. NVIDIA still serves Nemotron 3
Ultra on its own NIM API
([build.nvidia.com](https://build.nvidia.com/nvidia/nemotron-3-ultra-550b-a55b),
live on 2026-09-03), and OpenRouter still lists the standard and free rows. No
`nvidia/` row was added and none other was removed in the 2026-09-03 snapshot,
so no successor slug has appeared — but the snapshot was not otherwise still in
that namespace: three of the nine `nvidia/` rows changed, as observed on
3 September 2026, including the standard row's price, whose prompt rate fell
from $0.625 to $0.60 and whose completion rate fell from $3.125 to $2.40 per
million tokens — a move the 2026-09-04 snapshot reversed, listing $0.625 /
$3.125 again.
<!-- The $0.60 / $0.625 / $2.40 / $3.125 literals in the paragraph above
are the standard row's dated price move — prompt $0.625→$0.60 and
completion $3.125→$2.40 as of the 2026-09-03 snapshot — not the vanished
batch row's (its own last-known pricing was $0.60 in / $3.60 out per
million tokens). A from-value of a dated move has no live binding by
construction, and the reversal clause repeats the $0.625 / $3.125 pair as
of the 2026-09-04 snapshot; the currency-literal warnings they produce are
deliberate, not rot. -->

What is not published is why the batch variant specifically was withdrawn.
OpenRouter's batch offering is alive as a whole: 66 `:batch` rows remained in
the same catalog, as observed on 3 September 2026, and the [Batch API
quickstart](https://openrouter.ai/docs/batch-quickstart) documents an async
batch endpoint that takes a standard model slug. But this model's batch page
([`nvidia/nemotron-3-ultra-550b-a55b:batch`](https://openrouter.ai/nvidia/nemotron-3-ultra-550b-a55b:batch))
still identifies itself as the batch variant — the slug and the page's own
variant state both name it — but its variant list now holds only the free and
standard groups, with no batch group and so no providers or pricing at all;
nothing anywhere on the page announces a deprecation, and the standard
model's page carries no mention of a batch option or its removal. NVIDIA's
own pages say nothing about batch availability through OpenRouter. The
sources settle that this router delisted the row while the model is served on
the standard and free rows and on NVIDIA's own platform; they do not settle
whether the withdrawal was a fold into another tier or the retirement of batch
access for this model, so this page records the delisting rather than guessing.

Whether the router's async batch endpoint — which takes standard model slugs —
will accept the standard row is not published, and this page does not claim it.
The binding is kept, so a re-listing of this row would re-mint against this
entry.
