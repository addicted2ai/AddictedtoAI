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
