---
job: seed-how-models-are-trained
verdict: approve
reasons: []
would-cite: >-
  Someone claiming a behaviour change means the vendor retrained — the
  page's suspicion ordering (prompt, adapter, post-training, pretraining) is
  the argument you'd link, with LIMA as the capability-vs-behaviour receipt.
reviewer: seed-review-6.5
date: 2026-08-28
---

Checklist: education page.

- **No perishable literals**: full-text check — no model names (LIMA is a
  dated 2023 research citation, not a current-model example; the year is
  explicit in the sentence), no prices, no versions, no vendor rankings.
- **The one external claim was fetched**: arXiv abs/2305.11206 (LIMA,
  v1 18 May 2023). The abstract says the model was "fine-tuned with the
  standard supervised loss on only 1,000 carefully curated prompts and
  responses, without any reinforcement learning or human preference
  modeling", and contains the entry's quotation verbatim, including the
  spelling "learned": "almost all knowledge in large language models is
  learned during pretraining, and only limited instruction tuning data is
  necessary to teach models to produce high quality output." The page's
  framing ("treat that as a working hypothesis rather than a law") is more
  careful than most citations of this paper.
- **Mechanism claims checked**: the self-supervision description is
  correct; the reward-model failure mode (policy exploiting reward-model
  errors, hence KL-constrained training) is the standard, real
  characterization; the direct-preference tradeoff is fairly stated both
  ways; the adaptation section's retrieval-vs-fine-tuning distinction
  (behaviour vs facts) is honest and correctly reasoned.
- **Prerequisites and outcome honest**: builds on
  how-a-language-model-works as declared; the outcome (attribute a
  behaviour to a stage; know which changes need a training run) is what the
  final section delivers, with the priority order stated explicitly.
- **Beats the obvious alternative**: generic RLHF explainers describe the
  pipeline; this page's angle — which stage did a given behaviour come
  from, and what that implies about a Tuesday regression — is the useful
  question and is not what Wikipedia or vendor docs answer.
- Cut list: clean.

Approve.

## Recheck 2026-08-29 (wave addictedtoai-flh) — approve stands

Re-examined because this page was approved in the earlier seed round, which
the 2026-08-29 seed wave never revisited. The page has exactly one external
claim, and it was re-fetched: `arxiv.org/abs/2305.11206` (43,595 bytes,
"[Submitted on **18 May 2023**"). The quotation the page renders inside
quotation marks matched as a **raw substring**, in full and character for
character:

> "almost all knowledge in large language models is learned during
> pretraining, and only limited instruction tuning data is necessary to teach
> models to produce high quality output"

The abstract's surrounding claims that the page paraphrases also matched raw:
"1,000 carefully curated prompts and responses" (page: "about a thousand
carefully curated examples") and "without any reinforcement learning or human
preference modeling" (page: "with no preference training at all"). The page's
hedge — "Treat that as a working hypothesis rather than a law" — is still more
careful than the source warrants, which is the safe direction.

I also re-swept the page for the failure classes this wave was hunting: it
carries **no licence claim, no superlative, no vendor-page figure and no
cross-row arithmetic**. Every other sentence is mechanism description, and a
full-text pass turned up no model name, price, version or vendor ranking that
could rot. Nothing changed.
