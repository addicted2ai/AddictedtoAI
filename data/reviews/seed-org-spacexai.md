---
job: seed-org-spacexai
verdict: approve
reasons: []
would-cite: >-
  Someone arguing that vendors quietly trade context length away would link
  the row-by-row 2M-to-500K contraction — no vendor announced it, this page
  measured it from listing dates; and the 4.20-before-4.3 versioning trap is
  the concrete citation for anyone arguing that catalogs must key on dates
  and ids rather than parsed version numbers.
reviewer: task-6.5 seed reviewer (fresh invocation, no authorship of any seed content)
date: 2026-08-28
---

Checklist: wiki entry. Sources fetched, catalog claims measured against
`data/sources/openrouter-models/latest.json` (2026-08-28, 388 rows).

**Verified by fetching:**
- en.wikipedia.org/wiki/SpaceXAI — confirms all five cited facts: founded
  9 March 2023 as xAI; Palo Alto HQ; "On February 2, 2026, SpaceX acquired
  xAI in an all-stock transaction that structured xAI as a wholly owned
  subsidiary"; "In July 2026, xAI was rebranded as SpaceXAI"; deal valued
  SpaceX at $1T and xAI at $250B.
- openrouter.ai/x-ai/grok-4.6 — the description reads "Grok 4.6 is
  SpaceXAI's smartest model with frontier performance on coding, knowledge
  work, and STEM." Also present verbatim in the snapshot row.

**Verified by measurement:**
- Context ladder: `grok-4.20` (2026-03-31) 2,000,000; `grok-4.3`
  (2026-04-30) 1,000,000; `grok-4.5` (2026-07-08) 500,000; `grok-4.6`
  (2026-08-12) 500,000. 2M → 500K is the stated three-quarters reduction,
  and the dates match the body to the day.
- The seven-vendor comparison holds: newest rows for anthropic/ (1,000,000),
  openai/ (1,050,000), google/ (1,048,576), deepseek/ (1,048,576), meta/
  (1,048,576), moonshotai/ (1,048,576), z-ai/ (1,310,720) — every one at a
  million tokens or more, as claimed.
- Index and price: 4.3 II 37.9 → 4.5 II 55.8 → 4.6 II 60.9; input
  0.00000125 → 0.000002. Both rises as written.
- `grok-4.6` is the newest x-ai row in the snapshot — "current frontier
  model" holds.
- 4.20 listed 31 March, 4.3 listed 30 April: the sequence really does read
  4.20 then 4.3, so numeric-suffix sorting misorders this vendor. Measured,
  not asserted.
- Transclusions resolve; volatile values feed-bound; aliases sane (Grok as
  manual is right — it names the model family).

Nothing in the piece is decoration: every paragraph is a measurement with a
reading attached, and the un-marketed context reduction is a finding a
skeptical reader would want to check and can, from the rows cited. Approve.

## Recheck 2026-08-29 (addictedtoai-flh) — holds, verdict unchanged

**The seven-vendor universal was the claim to attack**, since "all N vendors
do X" is the shape a recheck should be able to break with one counterexample.
I enumerated the newest-listed row per vendor namespace from the committed
2026-08-28 snapshot rather than trusting the round-one list:

| vendor | newest row | listed | context |
|---|---|---|---|
| Anthropic | `anthropic/claude-opus-5-fast` | 2026-07-24 | 1,000,000 |
| OpenAI | `openai/gpt-5.6-luna-pro` | 2026-07-09 | 1,050,000 |
| Google | `google/gemini-3.7-flash` | 2026-08-13 | 1,048,576 |
| DeepSeek | `deepseek/deepseek-v4-flash-vision-exp` | 2026-08-21 | 1,048,576 |
| Meta | `meta/muse-spark-1.2-contributor` | 2026-08-21 | 1,048,576 |
| Moonshot AI | `moonshotai/kimi-k3` | 2026-07-16 | 1,048,576 |
| Z.ai | `z-ai/glm-5.3-flash` | 2026-08-26 | 1,310,720 |

All seven at a million or more. **Meta is the one that needed care and is
worth writing down**: Meta occupies two namespaces, and if you read only
`meta-llama/`, its newest row is `meta-llama/llama-guard-4-12b` (2025-04-30)
at 163,840 — well under a million, which would falsify the sentence. Taking
both namespaces together, as "their current rows" requires, the newest Meta
row is `meta/muse-spark-1.2-contributor` at 1,048,576, and the claim holds.
(`meta-llama/llama-4-scout` also lists 1,310,720.) A later pass that checks
only `meta-llama/` will think it has found a counterexample; it has not.

Grok ladder re-measured, not repeated: `x-ai/grok-4.20` 2026-03-31 ctx
2,000,000; `x-ai/grok-4.3` 2026-04-30 ctx 1,000,000; `x-ai/grok-4.5`
2026-07-08 ctx 500,000; `x-ai/grok-4.6` 2026-08-12 ctx 500,000. 2,000,000 to
500,000 is a reduction of exactly three-quarters, and all four listing dates
match the body to the day. `grok-4.6` is still the newest `x-ai/` row, so
"current frontier model" holds. Rising index and price both confirmed:
II 37.9 -> 55.8 -> 60.9, input 0.00000125 -> 0.000002.

Description string re-matched in the snapshot row: "Grok 4.6 is SpaceXAI's
smartest model with frontier performance on coding, knowledge work, and
STEM." The body quotes the first four words; exact.

Five Wikipedia facts re-fetched (582,103 B) and matched literally: "Founded
March 9, 2023"; "Formerly X.AI Corp. (2023-2026)"; "Headquarters ... Palo
Alto, California"; "On February 2, 2026, SpaceX acquired xAI in an all-stock
transaction that structured xAI as a wholly owned subsidiary of SpaceX"; "The
acquisition valued SpaceX at $1 trillion and xAI at $250 billion"; "rebranded
as SpaceXAI in July". All five hold to the byte.

**Noted for honesty about the method**: all five facts here cite Wikipedia,
which is the exact shape of the defect that motivated this pass
(org/moonshot-ai held an approved record on a Wikipedia-checked licence claim
that the licence itself refuted). The mitigation is that these are corporate
formation, ownership and naming facts — the class Wikipedia sources well and
carries citations for — and none of them is a licence term, a benchmark
figure or a superlative. The claims that *could* have been overstated here
(the three-quarters contraction, the seven-vendor universal, the 4.20-before-
4.3 ordering) are all measured from the catalog, not taken from prose.
