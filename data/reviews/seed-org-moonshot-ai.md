---
job: seed-org-moonshot-ai
verdict: revise
reasons: [false-or-unsupported-claim]
would-cite: >-
  Anyone arguing that "open weights" has become a spectrum rather than a
  binary would cite the licence paragraph — a revenue-share clause above
  US$20M mirrored by Qwen's above US$50M, documented as a pattern across
  two Chinese labs; and the seven-month vendor-hosted life of a
  trillion-parameter flagship is the number for arguments about how fast
  frontier releases now depreciate.
reviewer: task-6.5 seed reviewer (fresh invocation, no authorship of any seed content)
date: 2026-08-28
---

Checklist: wiki entry. Sources fetched, catalog claims measured against
`data/sources/openrouter-models/latest.json` (2026-08-28, 388 rows).

**Verified by fetching:**
- en.wikipedia.org/wiki/Moonshot_AI — confirms founded March 2023, Haidian
  district HQ, US$35B valuation (30 July 2026 round), and "K3's custom
  license requires revenue sharing of up to 30% for inference providers
  generating over US$20 million annually."
- huggingface.co/moonshotai/Kimi-K3 — confirms "released under the Kimi K3
  License" (a custom licence file, not MIT), Total Parameters 2.8T,
  Activated Parameters 104B.
- huggingface.co/moonshotai/Kimi-K2.5 — confirms "Both the code repository
  and the model weights are released under the Modified MIT License."
- platform.kimi.ai/docs/models — confirms verbatim: "Following the Kimi K3
  launch, kimi-k2.5 and the moonshot-v1 series are no longer available to
  newly registered users (full platform sunset on August 31)", with kimi-k3
  as the directed migration.
- en.wikipedia.org/wiki/Qwen — confirms the transcluded Alibaba fact:
  revenue sharing required from providers generating more than US$50
  million annually. The two-lab pattern claim is therefore supported on
  both legs.
- siliconangle.com 2026/01/27 — confirms the 27 January 2026 K2.5 release
  and 1T parameters, but see the required change.

**Verified by measurement:**
- Exactly seven `moonshotai/` rows, spanning `kimi-k2` (2025-07-11) to
  `kimi-k3` (2026-07-16).
- `kimi-k2.5` expiration_date 2026-08-31 in the feed (transcluded, not a
  literal). Jan 27 → Aug 31 is seven months of vendor hosting, as written.
- `kimi-k3` ctx 1048576, II 59.7; `anthropic/claude-opus-5` II 63.1 is the
  highest intelligence_index among all 388 rows (measured: the top five are
  opus-5 and its batch row at 63.1, fable-5 and batch at 62.1, gpt-5.6-sol
  at 60.9) — "the highest-scoring row in the snapshot" is exact.
- Transclusions resolve; aliases sane.

**Required change (the revise):**
1. `false-or-unsupported-claim` — the timeline entry "2026-01-27 — Kimi
   K2.5 released with published weights under a Modified MIT License" cites
   only the SiliconANGLE article, which does not mention any licence
   (fetched and asked directly: "The article contains no reference to a
   Modified MIT License or any specific license type"). The claim itself is
   true — the Hugging Face model card confirms it — so the fix is to cite
   the HF page for the licence clause (or drop the licence words from this
   timeline event; the body's licence sentence can rest on the HF source).
   A true claim cited to a source that does not support it is still a
   sourcing defect under the entry checklist.

Everything else held. The closing arithmetic — a January flagship sunset in
August — is the piece's real contribution and survives measurement.
