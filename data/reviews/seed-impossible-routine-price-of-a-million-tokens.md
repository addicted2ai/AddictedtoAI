---
job: seed-impossible-routine-price-of-a-million-tokens
verdict: revise
reasons:
  - overclaiming-summary
would-cite: >-
  Someone arguing inference prices fell 150x in three years: this page is the
  receipt they would reach for, and as written it does not survive the
  objection that it compares a frontier launch price to a budget-tier price.
reviewer: r2-opus
date: 2026-08-28
---

Checklist: Impossible-to-Routine delta, trade press at end A, live vendor
price sheet at end B. Sources fetched 2026-08-28.

- https://techcrunch.com/2023/03/14/openai-releases-gpt-4-ai-that-it-claims-is-state-of-the-art/:
  resolves, dated March 14, 2023. Observed verbatim: "Pricing is $0.03 per
  1,000 'prompt' tokens (about 750 words) and $0.06 per 1,000 'completion'
  tokens". The delta's conversion to $30 and $60 per million is arithmetically
  correct and the date matches.
- https://developers.openai.com/api/docs/pricing: resolves and is live. Under
  Standard pricing, gpt-5-nano is listed at "$0.05" input and "$0.40" output
  per million tokens — both of the delta's end-B figures verbatim. The page
  also lists gpt-5 at $1.25/$10.00, gpt-5.6-sol at $4.00/$20.00, and
  gpt-5.4-nano at $0.20/$1.25, which is what makes the defect below visible.
- The defect. The capability line is "Buying a million tokens of text
  generation from a commercial model API", and against that framing end A is
  not what a million tokens cost in March 2023 — it is what a million tokens
  cost *from the most expensive model available*. Checked this rather than
  asserting it: OpenAI released gpt-3.5-turbo on March 1, 2023 at $0.002 per
  1,000 tokens, i.e. **$2 per million**, thirteen days before the GPT-4 launch
  the delta uses as its impossible end. So on the very date of end A, a
  million tokens of commercial text generation cost $2, not $60.
- Consequence: the roughly 150x fall the two metric fields imply ($60 to
  $0.40) is largely an artifact of comparing the frontier tier at one date to
  the cheapest tier at another. Measured consistently, floor to floor is $2 to
  $0.40, about 5x; frontier to frontier is $60 to $20 (gpt-5.6-sol), about 3x,
  or $60 to $10 (gpt-5), about 6x. All three are real and none is 150x. The
  span as presented is not the span the capability sentence describes.
- Not independently verified, and this is the crux of the fix: whether
  gpt-5-nano is at or above the original GPT-4's capability. If it is, then
  "the price of GPT-4-*class* output fell ~150x" is the true and far more
  interesting claim, and the 150x survives. I searched for a like-for-like
  benchmark comparison between gpt-5-nano and the March 2023 GPT-4 and did not
  find one, so I am not asserting either way — I am recording that the delta
  needs a capability anchor it currently does not have.
- Source-provenance note for a later pass: the gpt-3.5-turbo price above comes
  from OpenAI's March 1, 2023 ChatGPT API announcement as reported in
  contemporaneous coverage, fetched today. It is evidence for the objection,
  not a proposed replacement value for any field in this delta.

What saves it, concretely. Either (a) anchor the comparison to capability —
re-frame end A as the price of frontier-class output and cite a benchmark
showing gpt-5-nano at or above GPT-4's level, which makes the large multiple
legitimate; or (b) keep the tier-agnostic capability sentence and compare like
with like, in which case the honest ends are $2 per million (gpt-3.5-turbo,
2023-03-01) to $0.40 (gpt-5-nano, today). Option (a) is the better page and
the one that keeps the striking number.

Also flag for whoever fixes it: end B is dated 2026-08-28 against a live price
sheet, so this delta silently rots every time OpenAI reprices. The rendered
value should be a bound fact with an as-of date rather than a literal, per the
project's own rule that volatile values are bound, never typed.

Worth saving — the underlying collapse in inference pricing is one of the most
citable facts in the field, and both ends are sourced to primary material.
What it cannot do in its current form is survive the first person who points
out that gpt-3.5-turbo existed. Revise.
