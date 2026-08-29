---
id: model/deepseek-deepseek-v4-flash-0731
kind: model
display_name: "DeepSeek: DeepSeek V4 Flash 0731"
status: active
maintenance: living
aliases:
  - name: "DeepSeek: DeepSeek V4 Flash 0731"
    class: manual
  - name: "DeepSeek-V4-Flash-0731"
    class: exclusive
  - name: "deepseek/deepseek-v4-flash-0731"
    class: exclusive
feeds:
  openrouter-models: deepseek/deepseek-v4-flash-0731
facts:
  - field: price_input
    source: feed
    feed: openrouter-models
    path: pricing.prompt
    volatility: fast
  - field: price_output
    source: feed
    feed: openrouter-models
    path: pricing.completion
    volatility: fast
  - field: context_window
    source: feed
    feed: openrouter-models
    path: context_length
    volatility: fast
  - field: intelligence_index
    source: feed
    feed: openrouter-models
    path: benchmarks.artificial_analysis.intelligence_index
    volatility: fast
  - field: coding_index
    source: feed
    feed: openrouter-models
    path: benchmarks.artificial_analysis.coding_index
    volatility: fast
  - field: status
    source: feed
    feed: openrouter-models
    path: $status
    volatility: fast
  - field: license
    source: cited
    value: "MIT License, repository and weights"
    source_url: "https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731"
    accessed: "2026-08-28"
    volatility: slow
  - field: parameters
    source: cited
    value: "284B total, 13B active per token (sparse mixture of experts)"
    source_url: "https://openrouter.ai/api/v1/models"
    accessed: "2026-08-28"
    volatility: static
  - field: terminal_bench_score
    source: cited
    value: "82.7 on Terminal Bench (2.1), per the model card"
    source_url: "https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731"
    accessed: "2026-08-28"
    volatility: dated
  - field: cybergym_score
    source: cited
    value: "76.7 on CyberGym, per the model card"
    source_url: "https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731"
    accessed: "2026-08-28"
    volatility: dated
  - field: preview_terminal_bench_score
    source: cited
    value: "61.8 on Terminal Bench (2.1) — the April preview checkpoint's score, per the same table on the July model card"
    source_url: "https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731"
    accessed: "2026-08-28"
    volatility: dated
  - field: preview_cybergym_score
    source: cited
    value: "38.7 on CyberGym — the April preview checkpoint's score, per the same table on the July model card"
    source_url: "https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731"
    accessed: "2026-08-28"
    volatility: dated
  - field: release_date
    source: cited
    value: "2026-07-31"
    source_url: "https://simonwillison.net/2026/Jul/31/deepseek-v4-flash-0731/"
    accessed: "2026-08-28"
    volatility: dated
timeline:
  - date: "2026-04-24"
    event: "V4 series previewed; this row is the re-post-trained revision of that preview checkpoint"
    source_url: "https://en.wikipedia.org/wiki/DeepSeek"
  - date: "2026-07-31"
    event: "released with MIT-licensed weights on Hugging Face"
    source_url: "https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731"
mentions:
  - org/deepseek
  - model/deepseek-deepseek-v4-pro-0813
---

The clearest evidence that this release is a re-post-training rather than a
re-training sits in its own benchmark table. DeepSeek's card for
`deepseek-ai/DeepSeek-V4-Flash-0731` scores the shipped model at
{{fact:model/deepseek-deepseek-v4-flash-0731#terminal_bench_score}} and at
{{fact:model/deepseek-deepseek-v4-flash-0731#cybergym_score}} — and, in the
same table, scores the checkpoint this row started from at
{{fact:model/deepseek-deepseek-v4-flash-0731#preview_terminal_bench_score}}
and
{{fact:model/deepseek-deepseek-v4-flash-0731#preview_cybergym_score}}.
[Terminal-Bench](https://www.tbench.ai/) grades an agent on tasks it
completes inside a live terminal; CyberGym grades it on security-exploit
tasks. Between the two checkpoints the terminal score rose by roughly a
third and the security score very nearly doubled. Nothing about the
architecture changed in between — this row's own timeline calls it a
"re-post-trained revision" of the April preview — so the entire gain on
both numbers came from further post-training against the same base model,
not from a bigger or different one.

That split is worth noticing for a second reason: the two pairs of numbers
on this row are vouched for differently. The Terminal-Bench and CyberGym
scores are self-reported, published by the lab that trained the model on a
card it wrote. The
{{fact:model/deepseek-deepseek-v4-flash-0731#intelligence_index}}
intelligence index and
{{fact:model/deepseek-deepseek-v4-flash-0731#coding_index}} coding index
sitting next to them are scored independently by Artificial Analysis,
which runs its own evaluation rather than reprinting the vendor's. Nothing
here says the self-reported pair is wrong — it says only that one pair is
checkable by someone else's methodology and the other is not.

It is checkable in a second, more literal way, too: the row's license is
{{fact:model/deepseek-deepseek-v4-flash-0731#license}}, so the exact
{{fact:model/deepseek-deepseek-v4-flash-0731#parameters}} weights that
produced the self-reported scores are the same weights anyone can download
and run against Terminal-Bench or CyberGym themselves. A self-reported
number attached to closed weights asks for trust; the same number attached
to a downloadable checkpoint only asks for compute.
