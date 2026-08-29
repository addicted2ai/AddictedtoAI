---
job: seed-wiki-concept-chain-of-thought
verdict: approve
reasons: []
would-cite: >-
  Someone pasting a model's reasoning trace as proof of why it answered:
  this page holds the two measurements that split accuracy from fidelity —
  the always-(A) reordering that cut accuracy up to 36% while never being
  mentioned, and Anthropic's intervention finding faithfulness falls with
  scale.
reviewer: rr3
date: 2026-08-28
---

Round 2, sealed. Findings written before opening round 1. Sources fetched
2026-08-28, confirmed by literal substring match against saved bytes.

- arxiv.org/abs/2201.11903: "Submitted on 28 Jan 2022"; "reasoning abilities
  emerge naturally in sufficiently large language models" — the timeline's
  emergence framing is the paper's.
- arxiv.org/abs/2305.04388: "Submitted on 7 May 2023"; authors Miles Turpin,
  Julian Michael, Ethan Perez, Samuel R. Bowman; "reordering the
  multiple-choice options in a few-shot prompt to make the answer always
  '(A)'"; "accuracy to drop by as much as 36% on a suite of 13 tasks from
  BIG-Bench Hard"; "which models systematically fail to mention in their
  explanations"; "frequently generate CoT explanations rationalizing those
  answers" verbatim; the social-bias sentence ("justify giving answers in
  line with stereotypes without mentioning the influence of these social
  biases") supports the piece's paraphrase.
- arxiv.org/abs/2307.13702: "Submitted on 17 Jul 2023"; Tamera Lanham first
  author on an Anthropic team; "Models show large variation across tasks in
  how strongly they condition on the CoT when predicting their answer"
  verbatim; "As models become larger and more capable, they produce less
  faithful reasoning on most tasks we study" verbatim — the fact and the body
  both now carry the full "we study" ending.
- "The claim the January 2022 paper never made": the paper's own language is
  hedged ("suggesting how it might have arrived"), so the absence claim
  holds — it never asserts the steps are the causes.
- All four mention targets exist on disk; the technique entry holds
  "Chain-of-thought prompting" as exclusive and both entries share "Chain of
  thought", so the alias contention is resolved.

Round 1 (r4-fable) found: territory/alias collision with
technique/chain-of-thought-prompting (same display_name, duplicated headline
fact, two paragraphs of restated ground) plus a truncated Lanham quote — all
five demanded changes are done: display_name is now "Chain-of-thought
faithfulness", the "Chain-of-thought prompting" alias is dropped, gsm8k_gain
and small_model_harm facts are deleted, the origin story is one sentence
deferring to the technique entry, and "we study" is restored in both fact
and body. No new claims were introduced by the fix beyond the compressed
opening, which checks out.

Clears the bar: the entry now owns one subject, every load-bearing quote is
verbatim in today's fetched bytes, and the closing mechanism paragraph is
interpretation clearly framed as such. Publish.
