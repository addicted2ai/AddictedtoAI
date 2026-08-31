---
job: seed-wiki-org-nvidia
verdict: approve
reasons: []
would-cite: >-
  Someone assuming a batch endpoint is always the cheaper way to buy the same
  model: NVIDIA's Nemotron 3 Ultra batch row is the only one in the 28 August
  2026 snapshot that costs more than its base on both input and output, while
  every Anthropic and Google batch row discounts.
reviewer: rr5b
date: 2026-08-29
corrections:
  - date: "2026-08-31"
    text: >-
      The `would-cite` above is wrong on two counts. It is stale as a count:
      the 28 August snapshot (`previous.json`) had exactly one batch row
      dearer on both meters, but the 29 August snapshot (`latest.json`) has
      ten, so "the only one" is no longer true even of the dated claim it
      names. It also attributes the inversion to NVIDIA: the standard and
      batch Nemotron 3 Ultra rows are headed by two different resellers
      (DeepInfra, Together) that never quote against each other, and NVIDIA
      prices neither. See "Recheck, 2026-08-29 (b2-prices)" below for the
      measurement. `would-cite` is left as originally written, per
      addictedtoai-4fo: a review record's front matter is append-only
      history, corrected by appending here rather than by editing the field.
---

Round 2, sealed. Findings written before opening round 1. Every census re-run
2026-08-29 by my own script over `data/sources/openrouter-models/latest.json`
(2026-08-28, 388 rows); sources fetched the same day and matched by literal
substring.

- All 10 nvidia rows carry a non-null `hugging_face_id`. Ranking every vendor
  whose rows *all* carry one: nvidia 10, meta-llama 8, moonshotai 7, then
  nothing above 5. So both halves hold — no vendor with more rows is fully
  open, and the next two are named correctly.
- 18 `:free` rows in the snapshot; NVIDIA holds 5, the next vendor 2. "Five of
  the eighteen ... more than any other vendor" is exact.
- I compared every `:free` row against its paid base. Exactly two in the whole
  snapshot advertise a *larger* window than the paid row, and both are NVIDIA:
  lightning 1,000,000 vs 262,144 and ultra 1,000,000 vs 262,144. super-120b
  runs the other way at 262,144 vs 1,000,000, as written.
- I compared every `:batch` row against its base. ultra:batch is the only one
  dearer on both meters (0.0000005→0.0000006 in, 0.0000022→0.0000036 out); the
  other overpriced batch row, thinkingmachines/inkling:batch, is dearer on
  input only — so "on both input and output" is load-bearing and correct. All
  11 Anthropic and all 10 Google batch rows discount on both meters. Batch
  window 512,288 against 262,144.
- Model card: "OpenMDW License Agreement, version 1.1" (exact); "LatentMoE -
  Mamba-2 + MoE + Attention hybrid with Multi-Token Prediction (MTP)", which
  `flagship_parameters` paraphrases rather than quotes; "The end-to-end
  training recipe is available in the [NVIDIA-NeMo/Nemotron repository]".
  Content-safety card: "uses Google's Gemma-3-4B-it as the base and is
  fine-tuned by NVIDIA", governed by OpenMDW "version 1.1 (OpenMDW-1.1), Gemma
  Terms of Use and Gemma Prohibited Use Policy" — the fact is exact and the
  prose consequence follows from it.
- Wikipedia: "On December 15, 2025, Nvidia announced the Nemotron 3 family of
  models consisting of Nano, Super and Ultra models, built on a hybrid
  mixture-of-experts (MoE) architecture", and "On April 7, 2025, Nvidia
  released the Llama-3.1-Nemotron-Ultra-253B-v1 ... under the Nvidia Open Model
  License". Both facts are cited to the right source; "OpenMDW" does not appear
  on Wikipedia and is not cited to it.
- `openrouter.ai/nvidia/nemotron-3.5-lightning:free` contains "1,000,000 token
  context window" and `"contextLength":1000000` → "a figure the public page
  repeats" confirmed. All fourteen transclusions resolve.

**A methodological note for whoever reads this next, so a correct claim is not
"corrected" into a wrong one.** The entry quotes "major portions of the
pre-training corpus are released" in lower case. A case-sensitive substring
search of the model card returns *nothing*, and I nearly filed that as a
fabricated quotation. Stripping tags shows the card reads "**Major** portions
of the pre-training corpus are released in the Nemotron-Pre-Training-Datasets
collection", with the counterpart sentence for the fine-tuning corpus. The
quotation is the card's own sentence with a sentence-initial capital lowered to
fit the surrounding clause. It is sound.

Round 1 (r6-fable) found one blocking error — "five of the fifteen free
listings" where the snapshot holds eighteen — and, non-blocking, two ratios
stated as exact that were not ("a quarter of the paid one" at 0.262, "twice the
context window" at 1.95). The count is now eighteen and correct. Both ratios
were not softened but removed: the super row now states its two windows and
lets the reader do the division, and the batch row says "a longer window" with
both figures beside it. That is the ratio rule applied properly rather than
hedged around, and no new ratio was introduced anywhere in the rewrite.

It clears the bar comfortably, and it is the piece in my slice whose payload is
hardest to get any other way: four separate censuses over 388 rows, each of
which I re-derived independently and each of which came out exactly as written.

---

## Recheck, 2026-08-29 (b2-prices) — `addictedtoai-sdh`

Verdict unchanged: **approve**. The open-artifacts lede and the Gemma-derived
guardrail finding re-verified and are untouched. The batch-row paragraph was
**false twice over** — wrong about who set the prices, and now also wrong about
its census — and has been rewritten.

### What was wrong

The page called the Nemotron 3 Ultra batch row *"the only batch row in the
snapshot dearer than the row it batches on both input and output"*, then
contrasted it with *"Every Anthropic and Google batch row is a discount. This
one is a surcharge."*

Measured 2026-08-29 against `https://openrouter.ai/api/v1/models/<row>/endpoints`,
headlines from `data/sources/openrouter-models/latest.json` (`date: 2026-08-29`):

- **`nvidia/nemotron-3-ultra-550b-a55b`** — **3 endpoints, none of them
  NVIDIA**: DeepInfra `0.0000005` / `0.0000022`, BaseTen `0.0000006` /
  `0.0000024`, Venice `0.000000625` / `0.000003125`. Headline is **DeepInfra's**.
- **`nvidia/nemotron-3-ultra-550b-a55b:batch`** — **1 endpoint, Together**,
  `0.0000006` / `0.0000036`. Headline is **Together's**.

**No provider serves both rows.** Together is absent from the standard row and
DeepInfra from the batch row, so the "surcharge" cannot be computed at any
single host — it is the distance between two companies that never quote against
each other. NVIDIA prices neither.

The contrast made it worse by construction: `anthropic/claude-opus-4.5` and
`anthropic/claude-opus-4.8` both carry an **`anthropic` endpoint at the headline
rate** (`0.000005` / `0.000025`), so the Anthropic batch discounts really are
vendor decisions. The sentence set two third-party listings against a set of
vendor-set prices and read the difference as NVIDIA's behaviour.

**The superlative has also gone stale.** Counted over both committed snapshots:
in `previous.json` (2026-08-28, 388 rows) this was indeed the **only** batch row
dearer on both sides. In `latest.json` (2026-08-29, 396 rows) there are **ten** —
`deepseek-v4-flash-0731`, `deepseek-v4-pro-0813`, `gemma-4-31b-it`,
`muse-glimmer-30b`, this row, `gpt-oss-120b`, `gpt-oss-20b`, `qwen3.5-9b`,
`qwen3.8-2.4t-a95b` and `glm-5.3-flash`. Restating it would have shipped a
false count.

### What changed in the body

Facts untouched; prose only.

- "is the only batch row in the snapshot dearer than the row it batches on both
  input and output" → "heads higher than the row it batches on both input and
  output ... where the convention is a discount". The superlative is **deleted**,
  not re-counted, because a census over a snapshot that advances daily is the
  wrong shape for this sentence.
- "Every Anthropic and Google batch row is a discount. This one is a surcharge."
  — **deleted**. That was the apples-to-oranges contrast.
- Added the house hedge: neither figure is necessarily NVIDIA's, each is the top
  listed provider's rate for its row, and two rows are not obliged to be headed
  by the same provider — so the inversion sits between two listings rather than
  being a surcharge anyone levied.
- The longer-window observation is kept; it is a `context_length` claim and
  unaffected.

No provider is named in the prose, deliberately: DeepInfra and Together will
rotate, and pinning them would reintroduce the defect.

### Flagged rather than edited

**The `would-cite` in the front matter above still asserts the withdrawn
superlative** ("the only one in the 28 August 2026 snapshot that costs more than
its base on both input and output, while every Anthropic and Google batch row
discounts"). Front matter was out of scope for this pass, so it is recorded here:
that `would-cite` no longer matches the body and its census is now false against
`latest.json`.
