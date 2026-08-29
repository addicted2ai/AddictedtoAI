---
job: seed-learn-what-a-benchmark-measures
verdict: approve
reasons: []
would-cite: >-
  Someone in a leaderboard argument insisting a one-point MMLU gap between two
  models is meaningless — this page hands them the harness receipt (same model,
  63.6 vs 48.8 across implementations) and the 6.49% label-noise floor that
  together settle it.
reviewer: r7-fable
date: 2026-08-28
---

Checklist: education page (mechanics). Sources fetched 2026-08-28.

- https://huggingface.co/blog/open-llm-leaderboard-mmlu: fetched; the post
  describes exactly three scoring conventions (original compares probabilities
  "on the four answers only"; HELM generates and parses; the harness scores
  "the full answer sequence... normalised"), and the largest single-model gap
  is LLaMA 65B at 0.636 vs 0.488 — 14.8 points, matching "nearly fifteen
  points apart depending only on which harness ran it".
- https://arxiv.org/abs/2309.03882: fetched; abstract attributes selection
  bias to "token bias, where the model a priori assigns more probabilistic
  mass to specific option ID tokens (e.g., A/B/C/D)" — matches "traced to
  token-level bias on the option identifiers".
- https://arxiv.org/abs/2406.04127: fetched; "6.49% of MMLU questions contain
  errors" (≈ one in fifteen) and "57% of the analysed questions in the
  Virology subset contain errors" — matches "in one subject, a majority of
  the questions the authors sampled".
- Transclusion {{fact:technique/reinforcement-learning-with-verifiable-rewards#pass_at_k_finding}}:
  anchor exists in the wiki page; its value ("RLVR-trained models beat their
  base models at small k, and the base models score higher at large k") is
  sourced to https://arxiv.org/abs/2504.13837, which I fetched — abstract says
  exactly that, so the page's pass@1/pass@k reading is faithful.
- No perishable literals: read every line — no model names, prices, context
  windows or version strings; ILSVRC 2012 is historical. Prerequisite
  (how-models-are-trained) exists; every idea used (probabilities, decoding,
  loss, scaling) is taught on or below that rung.
- Not independently verified: the claim that string-overlap contamination
  checks miss paraphrases/translations (standard and mechanically argued, no
  figure asserted); standard-error reasoning (arithmetic, not a citation).

Clears the bar. The payload an enthusiast lacks is the assembled mechanism:
the scoring rule, prompt format, label noise and run variance each moving a
score by margins the field reports as progress, with a receipt for each. The
closing rule — same runner, same harness, same items, or you are not
comparing — is the usable prediction the obvious alternatives never state.
Approve.
