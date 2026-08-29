---
job: seed-impossible-routine-price-of-a-million-tokens
verdict: reject
reasons:
  - false-or-unsupported-claim
would-cite: >-
  Nobody should cite it as written: the page tells a reader the expensive end of
  OpenAI's price sheet fell from $60 to $20 per million output, when the dearest
  row on the sheet it cites is o1-pro at $600.
reviewer: rr3b
date: 2026-08-29
---

Round 2, sealed. Findings written before opening round 1. Sources fetched
2026-08-29, confirmed by literal substring match against raw bytes.

Method note, because it changed two of my conclusions: an HTML-normalising pass
reported `gpt-5-nano` absent from the pricing page and `$0.03 per 1,000 prompt
tokens` absent from TechCrunch. Both are present — nano lives inside a serialised
component payload, and TechCrunch writes `$0.03 per 1,000 &#8220;prompt&#8221;
tokens` with entity quotes inside the phrase. Every absence below was re-checked
against raw bytes before being asserted.

- https://techcrunch.com/2023/03/14/...state-of-the-art/: raw bytes carry
  "Pricing is $0.03 per 1,000 &#8220;prompt&#8221; tokens (about 750 words) and
  $0.06 per 1,000 &#8220;completion&#8221; tokens". End A's $30/$60 per million
  conversion is correct.
- https://techcrunch.com/2023/03/01/...enterprise-customers/: "Priced at $0.002
  per 1,000 tokens" verbatim — the $2/M figure the body quotes inline. 1 Mar to
  14 Mar 2023 is 13 days; "Thirteen days before GPT-4 shipped" is right.
- https://developers.openai.com/api/docs/pricing: parsed its serialised table
  rather than reading rendered prose. `["gpt-5-nano",0.05,0.005,0.4]` — end B's
  $0.05/$0.40 confirmed. `["gpt-5.6-sol",4,0.4,5,20]` — the $20.00 output figure
  is real, and independently corroborated by the changelog's Aug 21 entry:
  "GPT-5.6 Sol now costs $4 per million input tokens and $20 per million output
  tokens". $60 / $0.40 = 150, so "roughly 150-fold" is right.

**The defect, and it is fatal.** "the $20.00 per million output that the same 28
August 2026 sheet lists for gpt-5.6-sol, the dearest of the flagship models on
it" is false against that page. The page carries a literal `<h2>Flagship
models</h2>` (byte offset 265713; the next section heading, "Cyber models", is at
349459), and the standard text-token table sits inside it. Rows in that same
table dearer than sol's $20 output: o1-pro $150/$600, gpt-5.2-pro $21/$168,
gpt-5-pro $15/$120, o3-pro $20/$80, o1 $15/$60, gpt-4-0613 $30/$60,
gpt-4-turbo-2024-04-09 $10/$30. gpt-5.6-sol is the eighth-dearest row by output
price under the page's own "flagship" heading, not the dearest.

That inverts the piece's conclusion. It closes "Both pairings fall, and that
direction is the durable claim." Dearest-to-dearest — using this delta's own end
A, "$60 per million output tokens, the dearest tier on offer that day", against
the dearest row on the 28 August 2026 flagship sheet — is $60 against $600. The
expensive end rose roughly tenfold. The delta's whole corrective thesis, that the
naive 150x is a cross-tier artifact and honest like-for-like still falls, fails at
the expensive end on the sheet it cites.

Secondary, unresolved: end A's metric "the dearest tier on offer that day" is
unverified. GPT-4-32k launched the same day at $0.06/$0.12 per 1K ($120 per
million output); the cited article never mentions a 32k tier (raw-byte check:
"32k" and "32,768" both genuinely absent), so its own source neither supports nor
refutes the superlative.

Also noted, not blocking: OpenRouter's snapshot lists gpt-5.6-sol at $2/$10 while
OpenAI's sheet says $4/$20, so this delta and `model/openai-gpt-5-6-sol` will
render contradictory prices for the same model.

Round 1 (r2-opus) found: the ~150x compares a frontier launch price to a
budget-tier price, since gpt-3.5-turbo shipped 13 days earlier at $2/M
(`overclaiming-summary`); and end B is a typed literal against a live sheet —
**the first is fixed, and the fix imported a new false claim from the review
itself.** r2 offered the fixer two routes and the fixer took route (b), faithfully.
But r2's supporting arithmetic — "frontier to frontier is $60 to $20
(gpt-5.6-sol), about 3x" — was never checked against the sheet's dearest row, and
it is wrong. The fixer inherited that number and hardened it into an explicit
superlative r2 never wrote. The second finding is not fixed; I think it is largely
inapt, since a delta's `metric` fields are literal by schema and dated pairs are
the form's premise.

**Which kind of failure this is: not one fixable sentence.** The two dated ends
are sound and sourced, and paragraphs one and two are genuinely good — the $2
gpt-3.5-turbo correction is the most useful thing on the page. But the third
paragraph is the piece's reason to exist in its revised form, and its headline
conclusion is backwards. A delta has no stub, so this reject deletes it; I record
that the salvageable core is the cheapest-to-cheapest pair ($2 to $0.40) plus the
honest statement that the dearest tier on offer rose, and that a future delta
built on those two facts would clear the bar comfortably.
