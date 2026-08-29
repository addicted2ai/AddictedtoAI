---
id: org/nvidia
kind: org
display_name: NVIDIA
status: active
maintenance: stable
aliases:
  - name: NVIDIA Corporation
    class: shared
  - name: NVIDIA
    class: manual
  - name: Nvidia
    class: manual
  - name: Nemotron
    class: manual
facts:
  - field: founded
    source: cited
    value: "5 April 1993, by Jensen Huang, Chris Malachowsky and Curtis Priem"
    source_url: "https://en.wikipedia.org/wiki/Nvidia"
    accessed: "2026-08-28"
    volatility: static
  - field: headquarters
    source: cited
    value: "Santa Clara, California"
    source_url: "https://en.wikipedia.org/wiki/Nvidia"
    accessed: "2026-08-28"
    volatility: slow
  - field: model_license
    source: cited
    value: "the OpenMDW License Agreement, version 1.1"
    source_url: "https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16"
    accessed: "2026-08-28"
    volatility: slow
  - field: previous_model_license
    source: cited
    value: "the Nvidia Open Model License"
    source_url: "https://en.wikipedia.org/wiki/Nvidia"
    accessed: "2026-08-28"
    volatility: static
  - field: flagship_parameters
    source: cited
    value: "550B total and 55B active, on a Mamba-2, mixture-of-experts and attention hybrid with multi-token prediction"
    source_url: "https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16"
    accessed: "2026-08-28"
    volatility: static
  - field: released_artifacts
    source: cited
    value: "weights, major portions of the pre-training and fine-tuning corpora, and the end-to-end training recipe"
    source_url: "https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16"
    accessed: "2026-08-28"
    volatility: slow
  - field: guardrail_base_model
    source: cited
    value: "a fine-tune of Google's Gemma-3-4B-it, governed by OpenMDW plus the Gemma Terms of Use and Gemma Prohibited Use Policy"
    source_url: "https://huggingface.co/nvidia/Nemotron-3.5-Content-Safety"
    accessed: "2026-08-28"
    volatility: slow
timeline:
  - date: "2025-12-15"
    event: "Nemotron 3 family announced — Nano, Super and Ultra, on a hybrid mixture-of-experts architecture"
    source_url: "https://en.wikipedia.org/wiki/Nvidia"
  - date: "2026-06-04"
    event: "Nemotron 3 Ultra listed, with free and batch rows alongside the standard one"
    source_url: "https://openrouter.ai/nvidia/nemotron-3-ultra-550b-a55b"
  - date: "2026-08-11"
    event: "Nemotron 3.5 Lightning listed, its free row advertising a larger context window than the paid row"
    source_url: "https://openrouter.ai/nvidia/nemotron-3.5-lightning:free"
mentions:
  - model/nvidia-nemotron-3-ultra-550b-a55b
  - model/nvidia-nemotron-3-ultra-550b-a55b-batch
  - model/nvidia-nemotron-3-ultra-550b-a55b-free
  - model/nvidia-nemotron-3-5-lightning
  - model/nvidia-nemotron-3-5-lightning-free
  - model/nvidia-nemotron-3-super-120b-a12b
  - model/nvidia-nemotron-3-super-120b-a12b-free
  - model/nvidia-nemotron-3-5-content-safety-free
  - model/nvidia-nemotron-3-nano-30b-a3b
---

The company that sells the hardware gives away the parts of a model that are
usually the secret. The card for `nvidia/nemotron-3-ultra-550b-a55b` —
{{fact:org/nvidia#flagship_parameters}} — says that
["major portions of the pre-training corpus are released"](https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16)
as a public dataset collection, that major portions of the fine-tuning corpus
are released too, and that the end-to-end training recipe is published in
NVIDIA's developer repository. All ten of NVIDIA's rows in the OpenRouter
snapshot of 28 August 2026 carry a Hugging Face id, and no vendor with more
rows than that publishes weights for all of them: the next fully-open
listings belong to `meta-llama` with eight rows and MoonshotAI with seven.

The licence became a standard one as the models stopped being someone else's.
NVIDIA's April 2025 reasoning release was a Llama derivative under
{{fact:org/nvidia#previous_model_license}}; the Nemotron 3 family announced
15 December 2025 is NVIDIA's own hybrid architecture under
{{fact:org/nvidia#model_license}}, an off-the-shelf agreement rather than a
house one. The exception is the interesting row.
`nvidia/nemotron-3.5-content-safety`, the guardrail model that screens inputs
and responses for other systems, is
{{fact:org/nvidia#guardrail_base_model}}. NVIDIA's safety model inherits a
competitor's acceptable-use policy, and anyone deploying it to enforce
policy is bound by Google's.

Then there are the rows that argue with each other. Five of the fifteen free
listings in the whole snapshot are NVIDIA's, and two of them advertise a
larger window than the paid row of the same model:
`nvidia/nemotron-3.5-lightning` lists
{{fact:model/nvidia-nemotron-3-5-lightning#context_window}} while
`nvidia/nemotron-3.5-lightning:free` lists
{{fact:model/nvidia-nemotron-3-5-lightning-free#context_window}}, a figure
the public page repeats. Nemotron 3 Ultra does the same;
`nvidia/nemotron-3-super-120b-a12b` runs the other way, its free row a
quarter of the paid one. And `nvidia/nemotron-3-ultra-550b-a55b:batch` is the
only batch row in the snapshot dearer than the row it batches on both input
and output —
{{fact:model/nvidia-nemotron-3-ultra-550b-a55b-batch#price_input}} against
{{fact:model/nvidia-nemotron-3-ultra-550b-a55b#price_input}} in, and
{{fact:model/nvidia-nemotron-3-ultra-550b-a55b-batch#price_output}} against
{{fact:model/nvidia-nemotron-3-ultra-550b-a55b#price_output}} out. Every
Anthropic and Google batch row is a discount. This one is a surcharge, with
twice the context window attached to it.
