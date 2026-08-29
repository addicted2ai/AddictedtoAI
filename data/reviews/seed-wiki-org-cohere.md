---
job: seed-wiki-org-cohere
verdict: revise
reasons: [false-or-unsupported-claim]
would-cite: >-
  For the argument that enterprise compliance is invisible in public API
  data: the is_moderated census — 91 of 388 rows flagged across eight
  prefixes, and only two vendors with five or more rows flagged on every
  one, Cohere and Amazon — is a checkable artifact of who sells to banks
  and hospitals.
reviewer: r6-fable
date: 2026-08-28
---

Checklist: wiki org entry built on price-identity and moderation censuses
over the OpenRouter snapshot. Censuses re-run by script against
`data/sources/openrouter-models/latest.json` (2026-08-28, 388 rows); sources
fetched 2026-08-28.

Verified by measurement (r6-fable-census.mjs):
- command-r-plus-08-2024 (created 2024-08-30) and command-a (2025-03-13):
  both $2.50/$10.00 per M, identical to the digit; window exactly doubled
  (128,000 → 256,000); command-a carries HF id
  CohereForAI/c4ai-command-a-03-2025, the predecessor none. Six and a half
  months apart — exact.
- north-mini-code:free created 2026-06-17, Cohere's newest row, its only
  free row, its only North row; the gap from command-a is 15 months.
- Moderation census exact: 91 rows with is_moderated across exactly eight
  prefixes (amazon, anthropic, cohere, meta, openai, writer, ~anthropic,
  ~openai); the only vendors with ≥5 rows all flagged are cohere (5) and
  amazon (5).

Verified by fetching:
- en.wikipedia.org/wiki/Cohere — founded 2019 by Gomez, Zhang, Frosst;
  Toronto HQ; the five named markets; ~$7B valuation September 2025; "In
  February 2026, CNBC reported Cohere's revenue as $240 million"; "On April
  24, Cohere and Aleph Alpha announced that a merger would go through in a
  deal which Cohere would acquire Aleph Alpha"; the $20 billion figure and
  the $600 million Schwarz Gruppe investment are both present — but see the
  required change on attribution.
- huggingface.co/CohereLabs/North-Mini-Code-1.0 — "License: apache-2.0",
  "Developed by: Cohere and Cohere Labs", "Model Size: 30B total; 3B
  active", namespace CohereLabs. All verbatim.
- openrouter.ai/cohere/command-a — "an open-weights 111B parameter model
  with a 256k context window" verbatim; listed March 13, 2025; live prices
  match the snapshot.

Required change (the revise):
1. `false-or-unsupported-claim` — "in a deal anonymous sources valued the
   combined entity at twenty billion dollars". The cited article attributes
   the figure to one person in one venue: "an anonymous individual told New
   York Times it would make the combined companies worth $20 billion".
   Pluralizing to "anonymous sources" overstates the corroboration, and the
   clause is also ungrammatical as it stands (missing "in which"). Rewrite
   the sentence to the source, e.g. "a figure one anonymous source gave the
   New York Times put the combined entity at twenty billion dollars, with
   six hundred million invested by Schwarz Gruppe."

Also noted for the same pass (not blocking alone): the timeline entry for
2026-06-17 cites the Hugging Face page for "Cohere's first free row and
first agentic coding model" — the HF card says neither; "first free row" is
a catalog measurement (true, re-run) and "Cohere's first agentic coding
model" is the OpenRouter listing's sentence. Point the citation at what
carries the claim.

The findings are strong — the price that did not move while the product
did, the return on a new namespace, and the moderation census that only two
vendors max out. One sentence misstates its source's sourcing; fix it and
this publishes. revise
