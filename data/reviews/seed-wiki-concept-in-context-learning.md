---
job: seed-wiki-concept-in-context-learning
verdict: approve
reasons: []
would-cite: >-
  Someone citing Min et al. 2022 to argue the labels in few-shot examples can
  be garbage — this page settles that gold-label dispensability stopped
  holding at scale (flipped labels followed, foo/bar linear classification)
  and names the copying circuit that explains why both regimes exist.
reviewer: r4-fable
date: 2026-08-28
---

Checklist: wiki concept entry. Sources fetched 2026-08-28.

- arxiv.org/abs/2202.12837 — abstract verbatim: "randomly replacing labels in
  the demonstrations barely hurts performance on a range of classification
  and multi-choce tasks [sic in source], consistently over 12 different
  models including GPT-3"; the three things demonstrations supply are the
  abstract's own list ("the label space, the distribution of the input text,
  and the overall format of the sequence"); first author Sewon Min; v1 Fri,
  25 Feb 2022, matching the timeline.
- arxiv.org/abs/2303.03846 — "overriding semantic priors is an emergent
  ability of model scale" verbatim; the flipped-label contrast is the
  abstract's (small models "ignore flipped labels presented in-context",
  large models "can override semantic priors"); semantically-unrelated labels
  (foo/bar for positive/negative) and "large-enough language models can even
  perform linear classification in a SUL-ICL setting" confirmed; first author
  Jerry Wei; v1 Tue, 7 Mar 2023, matching the timeline.
- transformer-circuits.pub/2022/in-context-learning-and-induction-heads —
  published Mar 8, 2022, matching the timeline; both definition clauses
  verbatim ("The head attends back to previous tokens that were followed by
  the current and/or recent tokens"; "The head's output increases the logit
  corresponding to the attended-to token"); the bump claim is the article's
  own: the phase change "occurs early in training for language models of
  every size (provided they have more than one layer), and ... is visible as
  a bump in the training loss", which supports the piece's "every multi-layer
  model they trained"; the hypothesis quote verbatim ("might constitute the
  mechanism for the actual majority of all in-context learning in large
  transformer models").
- Not independently verified: nothing material; all decisive strings were
  re-fetched today.

The payload is the assembly: two famous results that circulate as
contradictory summaries, shown to be a scale-indexed pair, plus the circuit
that makes the pair intelligible — a copying head copies wrong labels
cheaply, until a model large enough to weight in-context evidence makes
scrambling expensive. The final paragraph does real work separating
what-demonstrations-supply from what-consumes-them. Nothing here is padding.
Approve.
