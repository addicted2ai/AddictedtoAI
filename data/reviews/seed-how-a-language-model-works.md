---
job: seed-how-a-language-model-works
verdict: approve
reasons: []
would-cite: >-
  The canonical link for "why can't it count the letters in strawberry" —
  it derives tokenizer blindness, uneven digit splits, and unequal language
  billing from one frozen-vocabulary fact, plus the
  attention-is-the-only-sideways-channel invariant.
reviewer: seed-review-6.5
date: 2026-08-28
---

Checklist: education page.

- **No perishable literals**: full-text check — no model names, versions,
  prices, or benchmark scores. Mechanisms stated timelessly ("attention
  computes a weighted mixture" register throughout).
- **Prerequisites and outcome honest**: declares what-a-model-is as its one
  prerequisite (correct — it leans on the weights/product split); the
  outcome statement (trace one word through tokenisation, attention,
  sampling; name the only cross-position operation; explain
  token-blindness) is precisely what the page delivers.
- **Mechanism claims checked against the architecture**: the
  query/key/value description is the standard scaled-dot-product account;
  "attention is the only operation in the stack that moves information
  between positions" is true of the transformer stack the page describes
  (feed-forward, normalisation, activations are all position-wise); causal
  masking and the no-revision property are correctly derived; the
  greedy/temperature/top-k/top-p description is accurate and correctly
  placed outside the model; the embedding-layer point (one vector per token
  id regardless of sense) is correct.
- **The three tokenizer consequences** are real, correctly reasoned, and
  the page's distinctive assembly — letter-counting failures, digit
  splitting, and unequal per-language token costs traced to one design
  fact. This is the clarity-of-mechanism win over the reader's obvious
  alternative (Wikipedia's Transformer article is math-first and does not
  serve this reader; explainer blog posts don't carry the invariant).
- Cut list: clean. No filler, no superlatives, no self-reference.

Approve.

## Recheck 2026-08-29 (addictedtoai-flh) — holds, verdict unchanged

As with `what-a-model-is`, this page cites no source and names no model,
vendor, version, price or benchmark, so the defect class this pass targets —
a claim contradicted by the primary document it rests on — has no surface
here. Full-text re-read confirms that.

The one claim worth adversarial attention is the page's own load-bearing
superlative, since "the only" is on the high-yield list:

> "attention is the only operation in the stack that moves information
> between positions."

It holds for the architecture this page describes and describes carefully.
The block it defines is attention followed by "a position-wise feed-forward
network", and the page states the complement explicitly — "The feed-forward
layers, the normalisations and the activations all act on one position at a
time, in isolation." That is right: a feed-forward layer applies the same map
independently per position; LayerNorm and RMSNorm normalise across the
feature dimension within a position, not across positions; activations are
elementwise. The claim would fail for an architecture using batch
normalisation across the sequence, or a convolutional or state-space mixing
layer — none of which this page claims to cover. The superlative is scoped by
the stack the page has just defined, which is what makes it safe.

Two other mechanism claims spot-checked: "there is no operation in the
architecture that edits a token once emitted" is correct for the causal
decoder the page has set up (it derives it from the mask, in the right
order); and the greedy / temperature / top-k / top-p descriptions are
accurate and correctly placed outside the model.

**One simplification noted, not a defect.** "Position information is added
too" describes additive positional encoding. Rotary embeddings, which most
current models use, apply a rotation to queries and keys inside attention
rather than adding to the token vector. At `level: foundations`, teaching the
additive form is the standard and defensible pedagogical choice, and the
page's actual claim — that position must be supplied because "nothing later
in the network is inherently ordered" — is true under either scheme.
