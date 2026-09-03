---
id: model/tencent-hy4-preview
kind: model
display_name: "Tencent: Hy4 preview"
status: active
maintenance: living
aliases:
  - name: "Tencent: Hy4 preview"
    class: manual
  - name: "Hy4 preview"
    class: exclusive
  - name: "Hy4"
    class: shared
  - name: "tencent/hy4-preview"
    class: exclusive
feeds:
  openrouter-models: tencent/hy4-preview
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
  - field: price_cache_read
    source: feed
    feed: openrouter-models
    path: pricing.input_cache_read
    volatility: fast
  - field: context_window
    source: feed
    feed: openrouter-models
    path: context_length
    volatility: fast
  - field: max_output_tokens
    source: feed
    feed: openrouter-models
    path: top_provider.max_completion_tokens
    volatility: fast
  - field: status
    source: feed
    feed: openrouter-models
    path: $status
    volatility: fast
  - field: parameters
    source: cited
    value: "770B total, 49B activated per token"
    source_url: "https://huggingface.co/tencent/Hy4-preview"
    accessed: "2026-09-02"
    volatility: static
  - field: architecture
    source: cited
    value: "78 backbone layers — the first dense, the remaining 77 with 256 routed experts and 1 shared expert, activating the top-8 routed experts per token — with Gated DeepSeek Sparse Attention and IndexCache, plus a native MTP layer (10B total, 0.7B activated) for speculative decoding"
    source_url: "https://huggingface.co/tencent/Hy4-preview"
    accessed: "2026-09-02"
    volatility: static
  - field: license
    source: cited
    value: "Apache License 2.0"
    source_url: "https://huggingface.co/tencent/Hy4-preview/blob/main/LICENSE"
    accessed: "2026-09-02"
    volatility: slow
  - field: release_date
    source: cited
    value: "2026-08-28"
    source_url: "https://www.tencent.com/tencent-releases-and-open-sources-tencent-hy4-preview/"
    accessed: "2026-09-02"
    volatility: dated
  - field: open_weights
    source: cited
    value: "instruct weights and an FP8 variant published on Hugging Face, ModelScope, GitCode and CNB on the release date"
    source_url: "https://huggingface.co/tencent/Hy4-preview"
    accessed: "2026-09-02"
    volatility: slow
  - field: internal_blind_eval
    source: cited
    value: "2.99/4.00 average in a blind, Tencent-internal evaluation of 163 experts over 203 engineering tasks — versus GLM-5.3 at 2.92/4.00 and Kimi K3 at 2.94/4.00"
    source_url: "https://www.tencent.com/tencent-releases-and-open-sources-tencent-hy4-preview/"
    accessed: "2026-09-02"
    volatility: dated
  - field: free_access_window
    source: cited
    value: "free on WorkBuddy and CodeBuddy for two weeks from the 2026-08-28 launch"
    source_url: "https://www.tencent.com/tencent-releases-and-open-sources-tencent-hy4-preview/"
    accessed: "2026-09-02"
    volatility: dated
  - field: hy3_free_extension
    source: cited
    value: "free access to Hy3 on WorkBuddy and CodeBuddy extended until September 30, 2026"
    source_url: "https://www.tencent.com/tencent-releases-and-open-sources-tencent-hy4-preview/"
    accessed: "2026-09-02"
    volatility: dated
timeline:
  - date: "2026-08-28"
    event: "released and open-sourced"
    source_url: "https://www.tencent.com/tencent-releases-and-open-sources-tencent-hy4-preview/"
  - date: "2026-08-28"
    event: "instruct weights and an FP8 variant published on Hugging Face, ModelScope, GitCode and CNB"
    source_url: "https://huggingface.co/tencent/Hy4-preview"
  - date: "2026-08-28"
    event: "licensed under the Apache License 2.0"
    source_url: "https://huggingface.co/tencent/Hy4-preview/blob/main/LICENSE"
  - date: "2026-08-28"
    event: "listed on OpenRouter as tencent/hy4-preview, hosted solely by Tencent Cloud"
    source_url: "https://openrouter.ai/tencent/hy4-preview"
mentions:
  - org/tencent
  - model/tencent-hy3
  - model/z-ai-glm-5-3
  - model/moonshotai-kimi-k3
---

Hy4 preview is Tencent's next-generation flagship, and it was open the day
it was announced. Tencent released and open-sourced the model on
{{fact:model/tencent-hy4-preview#release_date}}, listing it on OpenRouter the
same day. It is a mixture-of-experts model of
{{fact:model/tencent-hy4-preview#parameters}} with a context window of
{{fact:model/tencent-hy4-preview#context_window}} and a max output of
{{fact:model/tencent-hy4-preview#max_output_tokens}}. The weights were not
held back for a later general release: {{fact:model/tencent-hy4-preview#open_weights}}.

The licence is where this release stands apart from the week's other open
flagships. Hy4 preview is released under {{fact:model/tencent-hy4-preview#license}},
and this entry takes that from the LICENSE file in the repository rather than
from the banner on the model card. Kimi K3, the other open flagship in this
release window, ships under {{fact:model/moonshotai-kimi-k3#license}}. The
difference is what a user may do with the weights: Apache-2.0 lets a
downloader serve and sell against a model of this size with no
revenue-threshold agreement, and the Kimi licence conditions that same act on
who is doing it and how much they make.

Tencent's own evaluation of the model is recorded here as a claim, not a
measurement. The announcement reports a blind evaluation conducted
internally — 163 experts rating outputs on 203 engineering tasks — in which
Hy4 preview averaged {{fact:model/tencent-hy4-preview#internal_blind_eval}}.
The [model card](https://huggingface.co/tencent/Hy4-preview), fetched 2
September 2026, breaks the same result into 46.8% wins / 12.8% ties / 40.4%
losses against GLM-5.3 and 51.2% wins / 7.9% ties / 40.9% losses against Kimi
K3. The lead the announcement describes as "slightly ahead" is 0.05 points
over Kimi K3 and 0.07 over GLM-5.3, on a four-point scale, from raters who
work for the same company as the model's developers.
[llm-releases](https://llm-releases.com/models/hy4-preview), fetched 2
September 2026, files the result as "vendor-reported and unverified by
independent labs at launch".

The product push is dated. The launch offer: {{fact:model/tencent-hy4-preview#free_access_window}}.
Alongside it, {{fact:model/tencent-hy4-preview#hy3_free_extension}}.

Two claims in the announcement describe the model working on itself, and both
are Tencent's word, dated to the release. The first: Hy4 preview took part in
"the automated optimization of training methods, data strategies, evaluation
frameworks, and low-level operators", proposing approaches, running
experiments and iterating on the results, which the announcement calls "an
early-stage recursive self-improvement loop". The second: the model
autonomously analyzed its own inference system and optimized operator fusion
and communication, raising end-to-end throughput "by 31.8% compared with the
baseline". What is absent for both is the method, the identity of the
baseline, and any independent check, so both are recorded here as claims with
dates, not as facts.

On OpenRouter the row is served by a single provider, Tencent Cloud, so the
listed price is Tencent's own rate rather than a reseller's: the row lists at
{{fact:model/tencent-hy4-preview#price_input}} for input,
{{fact:model/tencent-hy4-preview#price_output}} for output and
{{fact:model/tencent-hy4-preview#price_cache_read}} for cache reads.
