---
job: seed-wiki-model-moonshotai-kimi-k3
verdict: approve
reasons: []
would-cite: >-
  Someone planning a migration off Kimi K2.5 before its 31 August platform
  sunset: this page dates the overlap at 46 days against K3's 16 July listing
  and shows the successor tripled its activated path rather than trimming it,
  so the handover is not a cost-down.
reviewer: rr5b
date: 2026-08-29
---

Round 2, sealed. Findings written before opening round 1. Sources fetched
2026-08-29, confirmed by literal substring match; catalog claims re-derived
from `data/sources/openrouter-models/latest.json` (2026-08-28, 388 rows).

- **The licence, checked against the licence document rather than a model card
  or an encyclopedia.** `huggingface.co/moonshotai/Kimi-K3/raw/main/LICENSE` is
  3,065 bytes and titled "Kimi K3 License". §2 defines "Model as a Service" and
  requires a separate agreement with Moonshot AI where "the aggregate revenue of
  the Licensee and its affiliates exceeds 20 million US dollars ... in total
  over any consecutive 12 months". §3 requires "Kimi K3" to be displayed
  prominently above "more than 100 million monthly active users, or more than 20
  million US dollars ... in monthly revenue". The `license` fact states both
  conditions with the right numbers and calls neither a revenue share. Neither
  "%" nor "revenue share" occurs anywhere in the file. The fact is accurate.
  (Note for a later pass: a search for the literal "100 million monthly active
  users" returns false because the licence wraps the line between "100 million"
  and "monthly active users". That is a line break, not an absence.)
- `huggingface.co/moonshotai/Kimi-K3`: "It is a 2.8T-parameter model"; the
  parameter table carries "104B". `huggingface.co/moonshotai/Kimi-K2.5`:
  "Activated Parameters 32B" and "... are released under the Modified MIT
  License". Both transcluded K2.5 facts and K3's `parameters` hold.
- 2.8T/1T = 2.8 ("nearly three"), 104B/32B = 3.25 ("just over three", "grew
  faster still"). Exact, and both are ratios over `volatility: static` facts,
  so they cannot rot.
- `openrouter.ai/moonshotai/kimi-k3`: "Released ... Jul 16, 2026" confirms
  `listed_date`; the page describes "a 2.8T parameter open-weight multimodal
  reasoning model from Moonshot AI", matching the timeline event's wording.
- 2026-07-16 → 2026-08-31 is 46 days exactly. k2.5's `expiration_date` is
  2026-08-31 and both rows are live in the 2026-08-28 snapshot, so "both rows
  are live in this catalog at once" is true as scoped. Index 59.7 against 36.0
  is anchored to "the same snapshot". All seven transclusions resolve.

Round 1 (r9-opus) found: the `license` fact claimed a "revenue-sharing clause"
the licence does not contain — fixed, and I confirmed the replacement against
the document itself before reading the record; the 46-day claim inferred that
both models were live on *Moonshot's own platform* from an OpenRouter listing
date — fixed, now narrowed to "live in this catalog"; and the endpoint-not-model
passage restated `model/moonshotai-kimi-k2-5`'s payload — trimmed to a
subordinate clause, though it remains the least original sentence on the page.

One line I argued with, and record as a weakness rather than a defect: the
opener, "Scale, not the licence, is the plainest thing that changed". The
licence did change materially — K2.5 ships a 1,465-byte Modified MIT with an
attribution clause only, K3 a bespoke 3,065-byte licence adding a
separate-agreement gate for large hosts — and the reader most likely to be here
is the one migrating off K2.5, for whom that gate is the operative fact. Round 1
endorsed ceding the licence angle to `org/moonshot-ai`, and the entry's own
facts table carries the real terms, so the page asserts nothing false and the
spec's rule against restating a table in prose cuts in its favour. Worth
flagging that the ceded angle now depends on a neighbour whose licence
paragraph was itself rewritten after its approval (`addictedtoai-zlq`), so
whoever holds that page should confirm the contrast still lands somewhere.
