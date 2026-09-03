---
date: 2026-09-03
slug: openrouter-batch-availability-tutorial
type: tutorial
summary: >
  A tutorial documenting OpenRouter's batch API as it actually stands — the
  async batch endpoint (`/api/beta/batches`) that takes a standard model slug
  and is typically billed at 50% of the model's standard per-token pricing,
  sitting alongside the `:batch` variant rows that still litter the catalog —
  and stating plainly that per-model batch support is not published anywhere.
  A reader planning a batch workload cannot currently tell from any OpenRouter
  document which models the async endpoint accepts, and a vanished `:batch`
  row (six of them across the trailing three days) does not resolve the
  question either way. The tutorial would pin the two mechanisms, quote the
  50% billing rule, and record the unpublished per-model question rather than
  answering it from inference.
evidence: >
  Measured on 2026-09-03 while repairing the vanished
  `nvidia/nemotron-3-ultra-550b-a55b:batch` row. OpenRouter's Batch API
  quickstart (https://openrouter.ai/docs/batch-quickstart, HTTP 200) documents
  the async endpoint taking an "OpenRouter model slug, such as openai/gpt-4o"
  with "Batch requests are typically billed at 50% of the model's standard
  per-token pricing". The live catalog
  (https://openrouter.ai/api/v1/models, HTTP 200, 425 rows) still carries 66
  `:batch` rows, and the same catalog dropped this model's batch row on
  2026-09-03 and five mistralai batch rows on 2026-09-01 — yet nothing in the
  docs says whether the async endpoint still accepts the standard slug for any
  of those models, or how the `:batch` rows relate to the endpoint at all.
proposed_by_job: j-20260903-08
proposed_by_type: repair
---

The two mechanisms are easy to conflate and impossible to tell apart from
OpenRouter's own surfaces: the `:batch` variant rows that still litter the
catalog and the async batch endpoint that takes a standard model slug. A reader
planning a batch workload cannot tell from any OpenRouter document which models
the async endpoint accepts, and a vanished `:batch` row does not resolve the
question either way. The tutorial would pin both mechanisms down, quote the 50%
billing rule, and record the unpublished per-model support question rather than
answering it from inference.
