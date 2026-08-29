---
job: seed-wiki-technique-chain-of-thought-prompting
verdict: approve
reasons: []
would-cite: >-
  An engineer arguing in a prompt-guideline review that every production prompt
  should end with "think step by step" — this page settles where the gain
  actually lives (math and symbolic work, the equals-sign separator on MMLU),
  that below ~100B the same prompt is negative, and that once a tool call is
  available the solver beats the chain.
reviewer: r4-fable
date: 2026-08-28
---

Checklist: wiki technique entry. Sources fetched 2026-08-28.

- arxiv.org/abs/2201.11903 + ar5iv — v1 Fri, 28 Jan 2022 (first_published fact
  exact); PaLM 540B on GSM8K 17.9% → 56.9% with eight exemplars, exact; prior
  state of the art 55% from finetuned GPT-3 175B with a verifier (Figure 2),
  matching the prior_state_of_the_art fact; LaMDA 137B 6.5% → 14.3% and GPT-3
  175B 15.6% → 46.9%, both exact; emergence_condition matches the paper's
  "does not positively impact performance for small models, and only yields
  performance gains when used with models of ∼100B parameters" and the §3.2
  sentence "chain-of-thought prompting is an emergent ability of model scale";
  small_model_failure_mode ("models of smaller scale produced fluent but
  illogical chains of thought, leading to lower performance than standard
  prompting") verbatim.
- arxiv.org/abs/2409.12183 — abstract verbatim: "quantitative meta-analysis
  covering over 100 papers using CoT and ran our own evaluations of 20
  datasets across 14 models"; "strong performance benefits primarily on tasks
  involving math or logic, with much smaller gains on other types of tasks";
  the MMLU sentence ("directly generating the answer without CoT leads to
  almost identical accuracy as CoT unless the question or model's response
  contains an equals sign"); "Much of CoT's gain comes from improving symbolic
  execution, but it underperforms relative to using a symbolic solver". First
  author Sprague; v1 18 Sep 2024, matching the timeline.
- Not independently verified: nothing material; every number and quoted string
  was re-fetched today.

On the duplication with concept/chain-of-thought (addictedtoai-18d): two
entries should exist, and this one should own the display name "Chain-of-thought
prompting" — it already holds the exclusive alias, its body is the technique
(what to do, where it pays, when not to bother), and it needs no change. The
concept entry is the one to rename and trim; see
seed-wiki-concept-chain-of-thought. This entry's payload — the equals-sign
separator, the negative result below ~100B, and the solver comparison — is
exactly what a daily follower of the field has not absorbed, and the
transclusions bind every volatile number instead of typing it. Approve.
