---
job: seed-wiki-technique-prompt-tuning
verdict: approve
reasons: []
would-cite: >-
  The person recommending soft prompts to someone finetuning a 3B model gets
  the correction with the receipts: Lester et al.'s own ablation draws level
  with full tuning only at XXL/11B, and the initialization gaps that plague
  smaller scales are the paper's finding, not folklore.
reviewer: r5-fable
date: 2026-08-28
---

Checklist: wiki technique entry. Sources fetched 2026-08-28.

- arxiv.org/abs/2101.00190 (v1: 1 Jan 2021 — the odd-looking 2021-01-01 date
  is correct): abstract verbatim — "by learning only 0.1% of the parameters",
  "obtains comparable performance in the full data setting, outperforms
  fine-tuning in low-data settings, and extrapolates better to examples with
  topics unseen during training", applied "to GPT-2 for table-to-text
  generation and to BART for summarization". The prefix_tuning_result fact is
  exact.
- arxiv.org/abs/2104.08691 (v1: 18 Apr 2021): abstract verbatim — "prompt
  tuning becomes more competitive with scale: as models exceed billions of
  parameters, our method 'closes the gap' and matches the strong performance
  of model tuning (where all model weights are tuned)" and "conditioning a
  frozen model with soft prompts confers benefits in robustness to domain
  transfer, as compared to full model tuning". The flagged claim — that
  competitiveness is confined to XXL — holds: the full text (ar5iv) shows the
  gap narrowing across sizes with convergence specifically at XXL, and the
  initialization finding (large gaps between prompt initializations at
  smaller sizes, disappearing at XXL) is the paper's, as is "mixed-task
  inference" as a phrase.
- Verified by computation, not quotation: the fact block's "over 20,000 times
  fewer task-specific parameters than tuning all 11.1B". Table 4 of the paper
  carries the inputs verbatim — 409,600 trainable parameters for the 100-token
  XXL prompt, total 11,135,741,952, listed as 0.00368% — and the ratio is
  11,135,741,952 / 409,600 = 27,187x, so "over 20,000 times" is a conservative
  restatement of the paper's own table. No sentence in the paper states the
  ratio; a later pass should not "correct" it against a substring search.

The piece's payload is the direction of reading it insists on: the method
becomes viable exactly where full finetuning stops being affordable, which is
a property of the models, not the idea — a framing the paper's data supports
and its abstract does not spell out. The closing section keeps prompt tuning's
one outright win (mixed-task batching) honest against LoRA's merge trade-off,
consistent with the LoRA paper's own batching limitation. Specific throughout,
no filler. Approve.
