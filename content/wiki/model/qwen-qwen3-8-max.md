---
id: model/qwen-qwen3-8-max
kind: model
display_name: "Qwen: Qwen3.8 Max"
status: active
maintenance: living
aliases:
  - name: "Qwen: Qwen3.8 Max"
    class: manual
feeds:
  openrouter-models: qwen/qwen3.8-max
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
  - field: intelligence_index
    source: feed
    feed: openrouter-models
    path: benchmarks.artificial_analysis.intelligence_index
    volatility: fast
timeline: []
mentions:
  - model/qwen-qwen3-8-max-0902
---

The `qwen/qwen3.8-max` row left the OpenRouter catalog in the 2026-09-05
snapshot, and `qwen/qwen3.8-max-0902` arrived in the same fetch. That pairing is
the whole story, and it is neither of the things a withdrawn row usually means.
The model line was not retired, and it was not dropped by one router while
others kept serving it. Alibaba moved the undated name onto newer weights, and
OpenRouter stopped carrying the undated name as a row of its own.

The vendor said so three days in advance. Alibaba Cloud's Model Studio notice
[*[Model Studio] Update Notice for Qwen3.8-Max Models*](https://www.alibabacloud.com/en/notice/model_studio_update_notice_for_qwen38max_models_863),
dated Sep 02, 2026 and giving an affected time of 2026-09-05 10:00 (UTC+08),
states: "Effective September 5, 2026 (UTC+8), Model Studio will upgrade the
qwen3.8-max model. After the upgrade, the qwen3.8-max endpoint will
automatically transition to the snapshot version qwen3.8-max-0902, with billing
items and pricing remaining unchanged." The same notice fixes what the digits
mean — "Qwen3.8-Max-0902 is the September 2, 2026 snapshot of Qwen3.8-Max" —
and its effective moment, 2026-09-05T02:00Z, falls between the two fetches that
bracket the withdrawal recorded here: 2026-09-04T06:00:03Z, which still listed
the row, and 2026-09-05T06:00:04Z, which did not.

So the name survives and the weights behind it changed. Fetched 2026-09-05,
[`…/models/qwen/qwen3.8-max/endpoints`](https://openrouter.ai/api/v1/models/qwen/qwen3.8-max/endpoints)
returns HTTP 200 whose payload is the new row — `"id":"qwen/qwen3.8-max-0902"`,
one Alibaba endpoint serving `qwen/qwen3.8-max-20260902` — and
[openrouter.ai/qwen/qwen3.8-max](https://openrouter.ai/qwen/qwen3.8-max)
answers HTTP 307 to `/qwen/qwen3.8-max-0902`. The old slug still resolves. It
resolves somewhere else.

What stopped is the August 3 checkpoint this page's facts describe. Its record
is still reachable at
[`…/models/qwen/qwen3.8-max-20260803/endpoints`](https://openrouter.ai/api/v1/models/qwen/qwen3.8-max-20260803/endpoints)
and returns `"endpoints":[]` — the record survives, the supply is gone.
OpenRouter has also retitled it `"name":"Qwen: Qwen3.8 Max (0803)"`, where the
catalog carried it as plain `Qwen: Qwen3.8 Max` in the previous day's fetch; the
disambiguating suffix appeared exactly when the undated name stopped belonging
to it. Alibaba's own
[qwen3.8-max model page](https://www.alibabacloud.com/help/en/model-studio/qwen3-8-max)
lists a single entry under "Snapshot Versions", `qwen3.8-max-0902`, and the
string `0803` does not occur anywhere on that page.

Nothing about the substitution is visible in the catalog's own numbers. The
withdrawn row's last-known listing carries
{{fact:model/qwen-qwen3-8-max#price_input}} /
{{fact:model/qwen-qwen3-8-max#price_output}}, and the row that
replaced it lists {{fact:model/qwen-qwen3-8-max-0902#price_input}} /
{{fact:model/qwen-qwen3-8-max-0902#price_output}} at
{{fact:model/qwen-qwen3-8-max-0902#context_window}} of context. What the
redirect hides is the part that matters: code that called Model Studio's
`qwen3.8-max` before 2026-09-05 and calls it after runs on different weights,
by the notice's own account, with no error, no
version pin and nothing in the request or the reply to mark the change. A dated
slug is the only thing that holds a checkpoint still, and after this transition
there is one dated slug left to hold.

What neither publisher says is what became of the August 3 weights. The notice
addresses the endpoint's transition and declares no retirement; OpenRouter's
record for the checkpoint persists with no providers behind it, which is a
current state and not a history. Whether anyone still serves those weights under
some dated name is not answered by either source, so it is not answered here.

The `feeds:` binding is kept. If `qwen/qwen3.8-max` is ever a catalog row again
— which would take Alibaba pointing the name at a third snapshot and OpenRouter
carrying the undated form once more — it binds straight back to this entry. The
September 2 snapshot is carried separately as Qwen: Qwen3.8 Max (0902).
