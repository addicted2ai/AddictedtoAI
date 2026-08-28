---
job: seed-org-meta-superintelligence-labs
verdict: approve
reasons: []
would-cite: >-
  Someone arguing Meta abandoned open weights at the frontier gets the
  receipts here — the last open frontier Llama dated, Muse Spark closed with
  the "hope[s] to open-source" hedge quoted; and the contributor-tier
  paragraph is the citable number for anyone arguing about what user prompts
  are worth to a lab: a 12.5x discount with the data-use condition quoted
  from the listing itself.
reviewer: task-6.5 seed reviewer (fresh invocation, no authorship of any seed content)
date: 2026-08-28
---

Checklist: wiki entry. Sources fetched, catalog claims measured against
`data/sources/openrouter-models/latest.json` (2026-08-28, 388 rows).

**Verified by fetching:**
- about.fb.com 2026/04 Muse Spark announcement — confirms 8 April 2026,
  "the first in a new series of large language models built by Meta
  Superintelligence Labs", and the exact wording "we hope to open-source
  future versions of the model". Weights closed is supported by the page
  offering API preview access plus that hedge (no weights release
  mentioned).
- huggingface.co/meta-llama/Llama-4-Maverick-17B-128E-Instruct — full
  Llama 4 Community License confirmed: the 700M-MAU separate-license
  clause, "prominently display 'Built with Llama'", and "include 'Llama' at
  the beginning of any such AI model name". Release date April 5, 2025 on
  the model card.
- huggingface.co/meta-models/Muse-Glimmer-30B — "License: apache-2.0";
  "distilled from Muse Spark and purpose-built for autonomous agentic tasks
  on consumer hardware" (under 20 GB, 24-32 GB envelope) — supports "sized
  to run on one consumer GPU". The card gives only "August 2026"; the
  10 August day is carried by the Wikipedia Muse Spark article, also
  fetched, which states it directly.
- en.wikipedia.org/wiki/Muse_Spark — confirms 1.1 launched 9 July 2026,
  1.2 released 5 August 2026, Glimmer released 10 August 2026.
- openrouter.ai/meta/muse-spark-1.2-contributor — the condition is on the
  listing verbatim: "Your prompts and outputs may be used to improve
  Meta's products", price $0.10/1M.

**Verified by measurement:**
- `meta-llama/` rows end 2025-04-30; `meta/` rows begin 2026-07-16 — the
  prefix change is in the data as described.
- `meta/muse-spark-1.2` input 0.00000125; contributor row 0.0000001; both
  ctx 1048576 ("same model, same million-token window") — the 12.5x gap is
  the "public number for what a prompt is worth".
- Transclusions resolve (including the org's own contributor_tier_terms
  fact); aliases sane (Meta and MSL as manual is right).

The licence-direction paragraph (weights got freer and smaller in the same
move) is a real assembled finding, not a restatement of the announcement.
Approve.
