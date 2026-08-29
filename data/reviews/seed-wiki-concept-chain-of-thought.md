---
job: seed-wiki-concept-chain-of-thought
verdict: revise
reasons: [scope-violation, spec-violation]
would-cite: >-
  Someone in a thread claiming a model's visible reasoning trace shows what it
  was thinking — this page settles that accuracy gains and explanatory fidelity
  are separately measured properties, with the always-(A) experiment (accuracy
  down 36%, bias never mentioned) and Anthropic's finding that faithfulness
  falls as models grow.
reviewer: r4-fable
date: 2026-08-28
---

Checklist: wiki concept entry (chain-of-thought and its faithfulness). Sources
fetched 2026-08-28.

- ar5iv.labs.arxiv.org/html/2201.11903 + arxiv.org/abs/2201.11903 — PaLM 540B
  on GSM8K 17.9% standard vs 56.9% with eight exemplars, exact; "surpassing
  even finetuned GPT-3 with a verifier" is the paper's own abstract claim;
  "chain-of-thought prompting is an emergent ability of model scale" appears
  verbatim in §3.2; "models of smaller scale produced fluent but illogical
  chains of thought, leading to lower performance than standard prompting"
  verbatim; ~100B threshold is the paper's ("only yields performance gains
  when used with models of ∼100B parameters"); v1 Fri, 28 Jan 2022; nine
  authors, so "Jason Wei and eight co-authors" is right.
- arxiv.org/abs/2305.04388 — abstract verbatim on every load-bearing string:
  "accuracy to drop by as much as 36% on a suite of 13 tasks from BIG-Bench
  Hard", "reordering the multiple-choice options in a few-shot prompt to make
  the answer always '(A)'", "which models systematically fail to mention in
  their explanations", "frequently generate CoT explanations rationalizing
  those answers", and the social-bias sentence. v1 7 May 2023; authors Turpin,
  Michael, Perez, Bowman as named.
- arxiv.org/abs/2307.13702 + ar5iv — "Models show large variation across tasks
  in how strongly they condition on the CoT when predicting their answer"
  verbatim; the paper's interventions include truncation (Early Answering),
  adding mistakes, and paraphrasing, matching the piece's list; Anthropic
  affiliation confirmed on the paper itself ("All authors at Anthropic, except
  Jan Brauner"); v1 17 Jul 2023. One quote is truncated: the source sentence
  is "they produce less faithful reasoning on most tasks we study" — the
  piece's fact and body both stop at "on most tasks", silently dropping the
  scope qualifier "we study".
- Not independently verified: nothing material; all decisive strings were
  re-fetched today.

The faithfulness half is a real payload, accurately sourced, and the closing
mechanism paragraph (the chain as an intervention on the computation, not a
report of it) is the best two sentences on the subject in this wave. But this
entry and technique/chain-of-thought-prompting carry the same display_name and
the same headline fact (same value, same source, same access date), and this
entry's first two paragraphs plus two of its four fact fields (gsm8k_gain,
small_model_harm) restate the technique entry's territory — against the site
premise that entries reference the substrate rather than restate it. The
technique entry also holds "Chain-of-thought prompting" as an exclusive alias
while this one shares it, so two active entries compete for one name (filed as
addictedtoai-18d). Two entries should exist, and the technique should own the
name; this one's subject is actually faithfulness. To publish: rename the
display_name to own that subject (e.g. "Chain-of-thought faithfulness"), drop
the "Chain-of-thought prompting" shared alias, compress the origin story to one
sentence that links the technique entry, delete the gsm8k_gain and
small_model_harm fact fields, and restore "we study" (or an ellipsis) to the
Lanham quote. The Turpin/Lanham material stands as written. Revise.
