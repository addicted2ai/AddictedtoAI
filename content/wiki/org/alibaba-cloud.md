---
id: org/alibaba-cloud
kind: org
display_name: Alibaba Cloud
status: active
maintenance: stable
aliases:
  - name: Alibaba Cloud
    class: exclusive
  - name: Tongyi Qianwen
    class: exclusive
  - name: Qwen
    class: manual
  - name: Alibaba
    class: manual
facts:
  - field: model_family
    source: cited
    value: "Qwen, launched in beta April 2023 as Tongyi Qianwen and opened to the public in September 2023"
    source_url: "https://en.wikipedia.org/wiki/Qwen"
    accessed: "2026-08-28"
    volatility: static
  - field: weights_license
    source: cited
    value: "Apache License 2.0 for open releases; a source-available Qwen License on larger models"
    source_url: "https://en.wikipedia.org/wiki/Qwen"
    accessed: "2026-08-28"
    volatility: slow
  - field: license_revenue_share
    source: cited
    value: "revenue sharing required from providers generating more than US$50 million annually"
    source_url: "https://en.wikipedia.org/wiki/Qwen"
    accessed: "2026-08-28"
    volatility: slow
  - field: app_users
    source: cited
    value: "234 million (May 2026)"
    source_url: "https://en.wikipedia.org/wiki/Qwen"
    accessed: "2026-08-28"
    volatility: dated
  - field: derivative_models
    source: cited
    value: "over 200,000 Qwen variants listed on Hugging Face"
    source_url: "https://en.wikipedia.org/wiki/Qwen"
    accessed: "2026-08-28"
    volatility: slow
timeline:
  - date: "2026-08-03"
    event: "Qwen3.8-Max released in its cloud version — about 95B parameters active per forward pass, one-million-token context"
    source_url: "https://en.wikipedia.org/wiki/Qwen"
  - date: "2026-08-14"
    event: "Qwen3.8-27B released under the Apache License 2.0"
    source_url: "https://en.wikipedia.org/wiki/Qwen"
mentions:
  - model/qwen-qwen3-8-max
  - model/qwen-qwen3-8-2-4t-a95b
  - model/qwen-qwen3-8-27b
  - model/qwen-qwen3-8-flash
  - model/qwen-qwen3-7-flash
  - model/qwen-qwen3-7-max
---

Qwen tells you its licence in the model's name, and the tier vocabulary has
never once broken the rule. Alibaba Cloud has 52 rows in the OpenRouter
snapshot of 28 August 2026, second only to OpenAI's 58. Seventeen carry no
Hugging Face id — and every one of those seventeen is named `max`, `plus` or
`flash`. The tier-named rows and the closed rows are the same seventeen: not
a single `max`, `plus` or `flash` row is downloadable, and not a single row
without one of those three words is withheld. Thirty-three of the other
thirty-five are named by parameter count as well, but that half of the
convention does break — `qwen/qwen3-coder` carries its 480B only in its
display name, and `qwen/qwen3-coder-next` carries no parameter count in its
id, display name or slug at all. Both publish weights, which is what the
tier test predicts for a row with no tier word in it. The tier vocabulary
Alibaba uses for marketing is doing double duty as the open-source policy,
which means you can settle the question about any Qwen row in the snapshot
by looking for one of three words.

That makes the pair listed in August worth reading together.
`qwen/qwen3.8-max` went up on 3 August 2026 as the closed flagship of the
series. Nine days later Alibaba listed `qwen/qwen3.8-2.4t-a95b`, described
on its own page as
["the open-weight variant of Qwen3.8 Max"](https://openrouter.ai/qwen/qwen3.8-2.4t-a95b)
— 95 billion active parameters out of 2.4 trillion — at
{{fact:model/qwen-qwen3-8-2-4t-a95b#price_input}} for input, the same figure
the closed row carries at {{fact:model/qwen-qwen3-8-max#price_input}}, with a
marginally larger window:
{{fact:model/qwen-qwen3-8-2-4t-a95b#context_window}} against
{{fact:model/qwen-qwen3-8-max#context_window}}. Publishing the weights of the
flagship cost the hosted flagship nothing on the price sheet, which is not
how the trade-off is usually described.

The tier names hold still; what they cost does not. `qwen/qwen3.7-flash`,
listed 27 July 2026, lists at {{fact:model/qwen-qwen3-7-flash#price_input}}.
Its successor `qwen/qwen3.8-flash`, listed 26 August, lists at
{{fact:model/qwen-qwen3-8-flash#price_input}} — in the 28 August 2026
snapshot, five times as much thirty days later, on the tier whose whole name
is a promise about cost. Both are
closed, both take text, images and video, and both advertise the same
window, so the increase is not paying for a longer context or a new
modality.
