---
job: seed-wiki-concept-embeddings
verdict: approve
reasons: []
would-cite: >-
  Someone deploying man-is-to-computer-programmer-as-woman-is-to-homemaker as
  settled proof of embedding bias — this page settles that the analogy code
  was forbidden to return the input word and answers "doctor" when the
  constraint is lifted, while also blocking the counter-overreach that bias
  was thereby disproven.
reviewer: r4-fable
date: 2026-08-28
---

Checklist: wiki concept entry. Sources fetched 2026-08-28.

- ar5iv.labs.arxiv.org/html/1905.09866 + arxiv.org/abs/1905.09866 — the
  exclusion sentence verbatim: "In the default implementation of word2vec
  (Mikolov et al. 2013), gensim (Řehůřek and Sojka 2010) as well as the code
  from Bolukbasi et al. 2016, the input terms of the analogy query are not
  allowed to be returned" (the piece elides the inline citations, fairly);
  Google Analogy accuracy 0.74 → 0.21 for 3CosAdd and 0.75 → 0.47 for
  3CosMul when input terms are allowed, exact; Table 2 confirms "man is to
  doctor as woman is to X" returns gynecologist constrained and doctor
  unconstrained; the paper indeed does not claim biases are absent, matching
  the piece's "the finding cuts both ways and the paper says so"; v1 Thu,
  23 May 2019, matching the timeline.
- arxiv.org/abs/2403.05440 — abstract verbatim: "cosine-similarity can yield
  arbitrary and therefore meaningless 'similarities'" and "For some linear
  models the similarities are not even unique, while for others they are
  implicitly controlled by the regularization"; the setting is regularized
  linear models with closed forms, and the extension to deep models with
  combined regularizations is the paper's own discussion, not the piece's
  extrapolation; Steck, Ekanadham, Kallus; v1 Fri, 8 Mar 2024, matching the
  timeline.
- Not independently verified: nothing material; all decisive strings and
  numbers were re-fetched today.

The payload is the exclusion constraint — the standard exhibit for both what
embeddings do and what is wrong with them turns out to have a helper-function
rule in it that nobody quotes, and the entry states precisely what survives
(the paper exaggerates neither direction). The cosine section pairs it with
the same shape of finding for the other universal operation. The closing
question — "what was the retrieval step forbidden to return?" — is a usable
instrument, not a flourish. Approve.
