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

---

## Recheck, 2026-08-29 (b2-prices) — `addictedtoai-sdh`

Verdict unchanged: **approve**. The lede — a DeepSeek architecture and Moonshot
training data inside the Murati lab's debut — re-verified and is untouched. The
closing sentence was **false about its subject** and has been rewritten.

### What was wrong

The page ended: *"Batch pricing is a convention, not a guarantee, **and this lab
did not follow it**."* Thinking Machines does not price either row.

Measured 2026-08-29 against `https://openrouter.ai/api/v1/models/<row>/endpoints`,
headlines from `data/sources/openrouter-models/latest.json` (`date: 2026-08-29`):

- **`thinkingmachines/inkling`** — **3 endpoints, none of them Thinking
  Machines**: DeepInfra `0.00000095` / `0.00000405`, Together `0.000001` /
  `0.00000405`, BaseTen `0.000001` / `0.00000405`. Headline `0.00000095` is
  **DeepInfra's**.
- **`thinkingmachines/inkling:batch`** — **1 endpoint, Together**, `0.000001` /
  `0.00000405`. Headline is **Together's**.

The lab has no endpoint on either row, so it made no batch-pricing decision to
follow or break. And the sharper finding: **Together serves both rows, and
Together's rate is `0.000001` on each — identical.** The sole host of the batch
row charges exactly what it charges for the standard row. The "surcharge" is
`0.00000095` (DeepInfra, standard) against `0.000001` (Together, batch) — the
distance between two companies. At the one provider present on both rows there
is no batch premium at all.

### What changed in the body

Facts untouched; prose only.

- "and **asks** X for input" → "and **heads at** X for input". The
  vendor-attributing verb was doing the false work.
- "one of only two batch listings in the 388-row snapshot that costs more than
  the row it batches rather than less" — **deleted**. Two reasons: it framed a
  cross-provider gap as a property of the listing, and it is **now stale**. In
  `previous.json` (2026-08-28, 388 rows) exactly one batch row was dearer on
  both sides and one on a single side. In `latest.json` (2026-08-29, 396 rows)
  **ten** are dearer on both and **two** on a single side. Carrying the
  superlative forward would have published a false count.
- "and this lab did not follow it" — **withdrawn**. The page now says an
  inversion visible only across two separately ranked rows is a fact about who
  was listed first on each, not a decision the lab made.
- The hedge names **no provider**, on purpose: naming DeepInfra or Together
  pins a fact that rotates, which is the defect being fixed rather than a cure
  for it.

The observation that survives — the batch row lists above the row it batches,
where the convention is a discount — is kept, because it is true of the
listings and the page now says exactly that and no more.

### Note for a later pass

The `would-cite` above is unaffected (it cites the architecture-lineage
finding, not the price). The neighbouring `org/nvidia` entry carried the same
defect in the same shape and was corrected in this pass.
