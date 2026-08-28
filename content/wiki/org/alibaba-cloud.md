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
  - model/qwen-qwen3-8-27b
  - model/qwen-qwen3-7-max
---
