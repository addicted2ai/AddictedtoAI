---
job: seed-wiki-org-thinking-machines-lab
verdict: approve
reasons: []
would-cite: >-
  Against the claim that top American labs are architecturally independent
  of Chinese open-source work: the Murati lab's debut model drew its
  architecture from DeepSeek-V3 and its post-training synthetic data from
  Kimi K2.5, per the cited record, with Apache-licensed weights on Hugging
  Face for anyone who wants to check.
reviewer: r6-fable
date: 2026-08-28
---

Checklist: wiki org entry on a five-row vendor, with catalog censuses and a
lineage claim. Censuses re-run by script against
`data/sources/openrouter-models/latest.json` (2026-08-28, 388 rows); sources
fetched 2026-08-28.

Verified by measurement (r6-fable-census.mjs):
- Exactly five thinkingmachines rows; created dates 2026-07-17 (inkling,
  batch, free) and 2026-07-30 (inkling-small, free) — "inside thirteen
  days", nothing since. Exact.
- All five rows carry Hugging Face ids; both free rows serve the full
  1,048,576 window; the batch row halves it to exactly 524,288 and asks
  $1.00/M input against $0.95 on the standard row. It is one of exactly two
  batch listings in the snapshot dearer than the row it batches (the other
  is nvidia/nemotron-3-ultra-550b-a55b:batch) — the "only two" claim re-ran
  clean across all 31 batch rows.

Verified by fetching:
- en.wikipedia.org/wiki/Thinking_Machines_Lab — founded February 2025 by
  Mira Murati, former OpenAI CTO; HQ 2300 Harrison St, Mission District;
  the July 2025 $2B-at-$12B round led by Andreessen Horowitz with Nvidia,
  AMD, Cisco and Jane Street; Tinker announced October 1, 2025; and the
  lineage sentence — "The model drew from Chinese open weights models
  DeepSeek-V3 for its architecture and Moonshot AI's Kimi K2.5 for
  post-training synthetic data" — verbatim. The article also calls Inkling
  Small "a distilled 276-billion parameter model", supporting the piece's
  "distillation".
- huggingface.co/thinkingmachines/Inkling — "License: apache-2.0"; "975B
  total, 41B active"; "A 66-layer decoder-only transformer ... each token is
  routed to 6 of 256 experts, plus 2 shared experts active on every token."
  Verbatim.
- openrouter.ai/thinkingmachines/inkling-small — 12B active of 276B total;
  listed Jul 30, 2026; live values match the snapshot.

Not independently verified / noted for a later tidy (none blocking):
Wikipedia dates the releases July 15 and July 31 where the catalog lists
July 17 and July 30; the piece consistently says "listed" and matches the
catalog, so there is no conflict — but the timeline entries cite the HF
page and the inkling-small OpenRouter page for listing dates and for the
word "distillation", which those pages do not themselves carry (the
snapshot carries the dates; Wikipedia carries "distilled"). The claims are
true; the pointers are one document off.

The lede finding — a Chinese architecture and Chinese training data inside
the debut of the most-funded American startup of 2025, given away under
Apache — is exactly the assembled-in-one-place material the bar asks for,
and the batch-row anomaly is measured, not asserted. approve
