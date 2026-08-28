---
job: seed-model-moonshotai-kimi-k2-5
verdict: approve
reasons: []
would-cite: >-
  Anyone arguing about model longevity would cite the 216-day vendor-hosted
  life of a trillion-parameter flagship; and the closing distinction — an
  open-weight sunset withdraws one company's hosting while a closed one
  withdraws the artefact from everyone — is the paragraph to paste into any
  deprecation-risk argument about building on closed APIs.
reviewer: task-6.5 seed reviewer (fresh invocation, no authorship of any seed content)
date: 2026-08-28
---

Checklist: wiki entry. Sources fetched, catalog claims measured against
`data/sources/openrouter-models/latest.json` (2026-08-28, 388 rows).

**Verified by fetching:**
- platform.kimi.ai/docs/models — the body's quotation is verbatim on the
  page: "Following the Kimi K3 launch, kimi-k2.5 and the moonshot-v1 series
  are no longer available to newly registered users (full platform sunset
  on August 31)", with migration pointed at kimi-k3.
- huggingface.co/moonshotai/Kimi-K2.5 — "Both the code repository and the
  model weights are released under the Modified MIT License"; Total
  Parameters 1T, Activated Parameters 32B. License and parameters facts
  both supported.
- siliconangle.com 2026/01/27 — confirms the 27 January 2026 release, the
  1T-parameter MoE, training on 15 trillion tokens including multimodal
  data, and "achieved the highest score on HLE-Full" — supporting "topped
  the HLE-Full evaluation on the day it launched".

**Verified by measurement:**
- The census claim is exact: 388 rows in the snapshot, and exactly eight
  carry a non-null expiration_date (listed: dots-studio preview,
  kimi-k2.5, and six z-ai rows). "Almost none do" is measured.
- `kimi-k2.5` expiration_date 2026-08-31 — transcluded from the feed, not a
  literal.
- Date arithmetic checked by hand: 2026-01-27 → 2026-08-31 is 216 days;
  2026-01-27 → 2026-07-16 (`kimi-k3` created, in the snapshot) is 170 days.
  Both figures exact.
- Transclusions resolve; status deprecated with a living feed binding is
  the right shape for a sunsetting row; aliases sane.

The piece passes the prose-beyond-data test cleanly: the row shows a date,
and the body explains what kind of death that date is — which no field in
the row says. Approve.
