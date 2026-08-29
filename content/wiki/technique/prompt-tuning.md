---
id: technique/prompt-tuning
kind: technique
display_name: "Prompt tuning"
status: active
maintenance: stable
aliases:
  - name: "Prompt tuning"
    class: shared
  - name: "Prefix-Tuning"
    class: exclusive
  - name: "Soft prompts"
    class: shared
facts:
  - field: prefix_tuning_published
    source: cited
    value: "2021-01-01"
    source_url: "https://arxiv.org/abs/2101.00190"
    accessed: "2026-08-28"
    volatility: dated
  - field: prefix_tuning_result
    source: cited
    value: "learning only 0.1% of the parameters, prefix-tuning obtains comparable performance in the full data setting, outperforms fine-tuning in low-data settings, and extrapolates better to examples with topics unseen during training"
    source_url: "https://arxiv.org/abs/2101.00190"
    accessed: "2026-08-28"
    volatility: dated
  - field: prompt_tuning_published
    source: cited
    value: "2021-04-18"
    source_url: "https://arxiv.org/abs/2104.08691"
    accessed: "2026-08-28"
    volatility: dated
  - field: task_parameter_count
    source: cited
    value: "409,600 trainable parameters for a 100-token prompt on T5-XXL — 0.00368% of the model, over 20,000 times fewer task-specific parameters than tuning all 11.1B"
    source_url: "https://arxiv.org/abs/2104.08691"
    accessed: "2026-08-28"
    volatility: dated
  - field: scale_condition
    source: cited
    value: "prompt tuning becomes more competitive with scale: as models exceed billions of parameters the method closes the gap and matches the strong performance of tuning all model weights"
    source_url: "https://arxiv.org/abs/2104.08691"
    accessed: "2026-08-28"
    volatility: static
  - field: small_scale_behaviour
    source: cited
    value: "at smaller model sizes there are large gaps between the different prompt initializations, and once the model is scaled to XXL those differences disappear"
    source_url: "https://arxiv.org/abs/2104.08691"
    accessed: "2026-08-28"
    volatility: dated
  - field: mixed_task_inference
    source: cited
    value: "enables mixed-task inference using the original pre-trained model, so one generalist model can simultaneously serve many tasks"
    source_url: "https://arxiv.org/abs/2104.08691"
    accessed: "2026-08-28"
    volatility: static
  - field: domain_transfer
    source: cited
    value: "conditioning a frozen model with soft prompts confers benefits in robustness to domain transfer, compared with tuning all model weights"
    source_url: "https://arxiv.org/abs/2104.08691"
    accessed: "2026-08-28"
    volatility: static
timeline:
  - date: "2021-01-01"
    event: "prefix-tuning published by Li and Liang at Stanford, optimizing continuous prefixes at every layer"
    source_url: "https://arxiv.org/abs/2101.00190"
  - date: "2021-04-18"
    event: "prompt tuning simplifies it to the input layer and reports that the gap to full tuning closes only at the largest scale"
    source_url: "https://arxiv.org/abs/2104.08691"
mentions:
  - technique/low-rank-adaptation
---

A soft prompt is not text. It is a short sequence of vectors living in the model's
embedding space, prepended to the real input and trained by backpropagation
through a frozen model. Because the vectors are not constrained to be embeddings
of actual vocabulary items, the search space is larger than any amount of prompt
engineering can reach, and because gradients flow only into those vectors, nothing
in the model moves.

Prefix-tuning (2021-01-01) came first and put learned vectors in every layer, not
just at the input, so later layers see a prefix too. Applied to GPT-2 for
table-to-text and BART for summarization, it reported that
{{fact:technique/prompt-tuning#prefix_tuning_result}}. That last clause is the one
to notice — the constraint is doing work, not just saving memory.

Prompt tuning (2021-04-18) stripped the method to input embeddings alone, and its
accounting is stark: {{fact:technique/prompt-tuning#task_parameter_count}}. A
task's entire specialization is a file you would not notice on disk.

**The finding is about scale, not about the method.** The paper's own title says
so: {{fact:technique/prompt-tuning#scale_condition}}. Read that in the direction
that costs something. On Small, Base, Large and XL, prompt tuning is substantially
behind tuning the weights; only at 11B does it draw level. The technique does not
make a small model cheap to adapt — it becomes viable exactly where full
fine-tuning stops being affordable, which is convenient, and is a property of the
models rather than of the idea.

The scale dependence shows up as a change in how much the details matter:
{{fact:technique/prompt-tuning#small_scale_behaviour}}. A method whose
hyperparameters stop mattering as the model grows is a method whose difficulty was
optimization difficulty all along.

**Where it still wins outright.** A learned prompt is part of the input, so
different tasks' prompts can travel in one batch through one set of weights —
{{fact:technique/prompt-tuning#mixed_task_inference}}. Low-rank adapters can only
match that by staying unmerged, which reintroduces the per-token overhead that
merging exists to remove. And the frozen-model constraint pays a second dividend
the authors measured rather than asserted:
{{fact:technique/prompt-tuning#domain_transfer}}.
