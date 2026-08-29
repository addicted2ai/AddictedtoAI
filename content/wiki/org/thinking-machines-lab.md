---
id: org/thinking-machines-lab
kind: org
display_name: Thinking Machines Lab
status: active
maintenance: stable
aliases:
  - name: Thinking Machines Lab
    class: exclusive
  - name: Thinking Machines
    class: shared
  - name: Inkling
    class: manual
facts:
  - field: founded
    source: cited
    value: "February 2025, by Mira Murati, formerly OpenAI's chief technology officer"
    source_url: "https://en.wikipedia.org/wiki/Thinking_Machines_Lab"
    accessed: "2026-08-28"
    volatility: static
  - field: headquarters
    source: cited
    value: "2300 Harrison Street, Mission District, San Francisco"
    source_url: "https://en.wikipedia.org/wiki/Thinking_Machines_Lab"
    accessed: "2026-08-28"
    volatility: slow
  - field: funding
    source: cited
    value: "US$2 billion at a US$12 billion valuation (July 2025), led by Andreessen Horowitz with Nvidia, AMD, Cisco and Jane Street participating"
    source_url: "https://en.wikipedia.org/wiki/Thinking_Machines_Lab"
    accessed: "2026-08-28"
    volatility: dated
  - field: flagship_license
    source: cited
    value: "Apache License 2.0"
    source_url: "https://huggingface.co/thinkingmachines/Inkling"
    accessed: "2026-08-28"
    volatility: slow
  - field: flagship_parameters
    source: cited
    value: "975B total, 41B active — a 66-layer decoder-only transformer routing each token to 6 of 256 experts, plus 2 shared experts active on every token"
    source_url: "https://huggingface.co/thinkingmachines/Inkling"
    accessed: "2026-08-28"
    volatility: static
  - field: flagship_lineage
    source: cited
    value: "incorporated architecture from the Chinese model DeepSeek-V3 and synthetic data from Moonshot AI's Kimi K2.5"
    source_url: "https://en.wikipedia.org/wiki/Thinking_Machines_Lab"
    accessed: "2026-08-28"
    volatility: static
timeline:
  - date: "2025-10-01"
    event: "Tinker released — an API for fine-tuning open-weight models on the company's infrastructure"
    source_url: "https://en.wikipedia.org/wiki/Thinking_Machines_Lab"
  - date: "2026-07-17"
    event: "Inkling listed, with free and batch rows alongside the standard one"
    source_url: "https://huggingface.co/thinkingmachines/Inkling"
  - date: "2026-07-30"
    event: "Inkling Small listed — a 276B distillation, also with a free row"
    source_url: "https://openrouter.ai/thinkingmachines/inkling-small"
mentions:
  - model/thinkingmachines-inkling
  - model/thinkingmachines-inkling-batch
  - model/thinkingmachines-inkling-free
  - model/thinkingmachines-inkling-small
  - model/thinkingmachines-inkling-small-free
  - org/moonshot-ai
  - org/deepseek
---

The debut model from the lab founded by OpenAI's former chief technology
officer is built on a Chinese architecture, trained partly on another Chinese
lab's output, and given away under Apache. `thinkingmachines/inkling`, listed
17 July 2026, is {{fact:org/thinking-machines-lab#flagship_parameters}},
published under {{fact:org/thinking-machines-lab#flagship_license}}.
[Wikipedia's account of the release](https://en.wikipedia.org/wiki/Thinking_Machines_Lab)
records that it {{fact:org/thinking-machines-lab#flagship_lineage}}. So a
DeepSeek architecture and Moonshot AI training data sit inside the first
model shipped by an American company that raised
{{fact:org/thinking-machines-lab#funding}}.

Everything the lab has listed arrived inside thirteen days. Five rows —
`thinkingmachines/inkling`, its batch and free variants,
`thinkingmachines/inkling-small` and that model's free variant — carry listing
dates between 17 and 30 July 2026, and nothing has followed. Inkling Small is
a 276-billion-parameter distillation with 12 billion active. Every model this
lab has published is downloadable, and every one is also available at no
charge through the router: two models, five rows, no closed weights and no
paywall that cannot be walked around.

The three ways to call the same model do not rank the way the names suggest.
`thinkingmachines/inkling:free` serves the full window at no cost. The
standard row serves the same
{{fact:model/thinkingmachines-inkling#context_window}}. The batch row halves
it to {{fact:model/thinkingmachines-inkling-batch#context_window}} and heads
at {{fact:model/thinkingmachines-inkling-batch#price_input}} for input
against {{fact:model/thinkingmachines-inkling#price_input}} on the standard
row — a batch listing above the row it batches, where the convention is a
discount. Neither figure is necessarily this lab's, though: each is the top
listed provider's rate for its row, and two rows are not obliged to be headed
by the same provider. Batch pricing is a convention and not a guarantee, but
an inversion visible only across two separately ranked rows is a fact about
who was listed first on each, not a decision the lab made.
