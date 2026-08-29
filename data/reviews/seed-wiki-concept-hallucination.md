---
job: seed-wiki-concept-hallucination
verdict: approve
reasons: []
would-cite: >-
  Someone claiming the next model generation will simply train hallucinations
  away — this page settles that the singleton rate sets a floor that is a
  property of the corpus, not of the training run, and that the leaderboards
  deciding which model ships score an abstention identically to a wrong guess.
reviewer: r4-fable
date: 2026-08-28
---

Checklist: wiki concept entry. Sources fetched 2026-08-28.

- arxiv.org/abs/2509.04664 + arxiv.org/html/2509.04664v1 — abstract verbatim:
  "Hallucinations need not be mysterious -- they originate simply as errors
  in binary classification" and "If incorrect statements cannot be
  distinguished from facts, then hallucinations in pretrained language models
  will arise through natural statistical pressures"; the singleton-rate
  sentence confirmed in §1.1 as quoted ("the hallucination rate, after
  pretraining, should be at least the fraction of training facts that appear
  once"), with the paper's 20%-of-birthday-facts illustration beside it;
  Table 2 lists GPQA, MMLU-Pro and SWE-bench, all binary-graded with "None"
  for IDK credit, matching the benchmark_abstention_credit fact; the
  DeepSeek-V3 example verbatim ("returned '2' or '3' in ten independent
  trials" on how many Ds are in DEEPSEEK); the paper's proposed fix is
  adjusting the "numerous primary evaluations" rather than adding new
  hallucination benchmarks, as the piece says; the paper cites the reversal
  curse (Berglund et al.), so the piece's "it says so" about both
  out-of-scope error classes holds; authors Kalai, Nachum, Vempala, Zhang;
  v1 Thu, 4 Sep 2025, matching the timeline.
- Not independently verified: nothing material; all decisive strings were
  re-fetched today.

On the value shared with concept/tokenization (the DeepSeek-V3 ten-trial
letter-count): both entries bind the same primary-source fact for different
arguments — here as the representational error class outside the statistical
framing, there as the character-inaccessibility exhibit — and the entries
cross-mention. That is a legitimate cross-reference, not restating; no change
needed in either. The piece's payload is the floor-not-tendency argument plus
the incentive diagnosis, and the closing split of "reduce hallucinations"
into three separate engineering problems is precise and earned. Approve.
