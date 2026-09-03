# Unit-doubling sweep — drop record (j-20260903-07)

Sweep of every prose line where a unit-rendering `{{fact:…}}` transclusion
is directly followed by a literal, per the brief's done-when. The four
doublings found and fixed are in the diff itself (one word deleted per
page). This record names every line the sweep judged **not** a doubling,
with the reading, so the sweep's coverage is auditable.

## Fixed (4)

| File | Line | Rendering before → after |
|---|---|---|
| content/wiki/model/anthropic-claude-haiku-4-5.md | 45 | "it lists 200000 tokens **tokens**, the same" → "it lists 200000 tokens, the same" |
| content/wiki/model/anthropic-claude-opus-4-8.md | 74 | "still capped at 200000 tokens **tokens**, the same" → "still capped at 200000 tokens, the same" |
| content/wiki/model/openai-gpt-5-6-luna.md | 83 | "runs 200000 tokens **tokens** against Nano's" → "runs 200000 tokens against Nano's" |
| content/wiki/org/anthropic.md | 96 | "at … USD per token **per token**" → "at … USD per token" |

## Judged not a doubling (left alone)

- content/wiki/model/cohere-command-a.md:72 — "with a 200000 tokens
  context window" — the transclusion fills the adjective slot of the noun
  phrase "context window"; "window" as a noun is the brief's explicit
  fine case; the unit renders once.
- content/wiki/model/meta-muse-glimmer-30b.md:98 — "over a 1000000 tokens
  context window" — same reading as above.
- content/wiki/model/inception-mercury-2-5-preview.md:128 — "with 1107
  tokens of context" — "of context" is the noun the quantity modifies;
  the unit renders once.
- content/wiki/model/qwen-qwen3-8-27b.md:77 — "listed 262144 tokens of
  context; this row lists 262144 tokens." — both positions read clean.
- content/wiki/model/x-ai-grok-4-6.md:110 — "listed 1000000 tokens of
  context at 0.0000008 USD per token input" — "of context" as above;
  "input" is the price-side label, not a unit duplicate.
- content/wiki/model/z-ai-glm-5-1.md:80 — "listing 1000000 tokens of
  context — the largest single step" — reads clean.
- content/wiki/org/spacexai.md:71 — "at 200000 tokens of context" — reads
  clean.

## Checked and clean (no literal follows the transclusion)

- max_output_tokens transclusions: inception-mercury-2-5-preview.md:129
  ("a max output of 1107 tokens;") and tencent-hy4-preview.md:123
  ("{{fact:…}}." — nothing after). No doubling anywhere.
- price facts in the other unit-carrying fields
  (price_cache_read / price_cache_write / price_internal_reasoning):
  no transclusion of them anywhere in prose.
- learn / tutorial / blog / directory surfaces: only two learn pages
  carry transclusions (open-weights-and-closed-models.md,
  what-a-benchmark-measures.md), and none is followed by a unit literal.
- inception-mercury-2-5-preview.md:110 hard-codes "1,107 tokens" in
  prose; that is a currency-literal lint case (build advisory), not a
  transclusion doubling, and not this job's scope.