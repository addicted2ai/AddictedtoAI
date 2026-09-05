---
id: org/deepseek
kind: org
display_name: DeepSeek
status: active
maintenance: stable
aliases:
  - name: DeepSeek
    class: exclusive
  - name: 深度求索
    class: shared
  - name: High-Flyer
    class: shared
facts:
  - field: founded
    source: cited
    value: "2023-07-17"
    source_url: "https://en.wikipedia.org/wiki/DeepSeek"
    accessed: "2026-08-28"
    volatility: static
  - field: headquarters
    source: cited
    value: "Hangzhou, Zhejiang, China"
    source_url: "https://en.wikipedia.org/wiki/DeepSeek"
    accessed: "2026-08-28"
    volatility: slow
  - field: owner
    source: cited
    value: "High-Flyer, a Chinese hedge fund"
    source_url: "https://en.wikipedia.org/wiki/DeepSeek"
    accessed: "2026-08-28"
    volatility: slow
  - field: weights_license
    source: cited
    value: "MIT License (since January 2025); earlier models used the proprietary DeepSeek License"
    source_url: "https://en.wikipedia.org/wiki/DeepSeek"
    accessed: "2026-08-28"
    volatility: slow
  - field: v4_sizes
    source: cited
    value: "V4-Flash 284B parameters, V4-Pro 1.6T parameters, both with a one-million-token context window"
    source_url: "https://en.wikipedia.org/wiki/DeepSeek"
    accessed: "2026-08-28"
    volatility: slow
timeline:
  - date: "2026-04-24"
    event: "V4 series previewed"
    source_url: "https://en.wikipedia.org/wiki/DeepSeek"
  - date: "2026-07-31"
    event: "DeepSeek-V4-Flash-0731 released with MIT-licensed weights on Hugging Face"
    source_url: "https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731"
  - date: "2026-08-13"
    event: "V4-Pro released"
    source_url: "https://en.wikipedia.org/wiki/DeepSeek"
mentions:
  - model/deepseek-deepseek-v4-flash-0731
  - model/deepseek-deepseek-v4-pro-0813
  - model/deepseek-deepseek-r1
  - model/openai-gpt-5-4
  - model/google-gemini-3-5-flash
---

DeepSeek sets the floor other price sheets are read against. On 31 July 2026
it published `deepseek-ai/DeepSeek-V4-Flash-0731` on Hugging Face under
[the MIT License](https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731) —
weights, commercial use, no threshold clause. The OpenRouter row for it lists
at {{fact:model/deepseek-deepseek-v4-flash-0731#price_input}} input with an
Artificial Analysis intelligence index of
{{fact:model/deepseek-deepseek-v4-flash-0731#intelligence_index}}.

Put that next to what the same catalog charges on the other side of the
price sheet. OpenAI's `openai/gpt-5.4`, its flagship in March 2026, lists at
{{fact:model/openai-gpt-5-4#price_input}}; Google's
`google/gemini-3.5-flash`, from May, at
{{fact:model/google-gemini-3-5-flash#price_input}}. Same snapshot, and both
are more than an order of magnitude above the DeepSeek row. Simon Willison,
who runs models against his own tasks rather than against leaderboards, wrote
that the release's pricing means this
["may currently be the best value-per-intelligence model out there"](https://simonwillison.net/2026/Jul/31/deepseek-v4-flash-0731/).

There is a stated mechanism behind the number, not just a price decision.
The Flash model is a sparse mixture of experts: OpenRouter's own listing
describes roughly 13 billion parameters active out of 284 billion total, so
what a request costs to serve tracks the active path rather than the
published size. DeepSeek's V4
line arrived as a preview on 24 April 2026, went final for Flash on 31 July,
and for Pro on 13 August — three months from preview to two shipped sizes,
with the weights of both published rather than described.
