---
id: model/minimax-minimax-m2
kind: model
display_name: "MiniMax: MiniMax M2"
status: active
maintenance: living
aliases:
  - name: "MiniMax: MiniMax M2"
    class: manual
feeds:
  openrouter-models: minimax/minimax-m2
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
  - field: status
    source: feed
    feed: openrouter-models
    path: $status
    volatility: fast
  - field: license
    source: cited
    value: "Modified MIT License — commercial products or services with more than 100 million monthly active users, or more than US$30 million in annual recurring revenue, must prominently display \"MiniMax M2\" in the user interface"
    source_url: "https://github.com/MiniMax-AI/MiniMax-M2/blob/main/LICENSE"
    accessed: "2026-08-28"
    volatility: slow
  - field: parameters
    source: cited
    value: "230B total, 10B active"
    source_url: "https://huggingface.co/MiniMaxAI/MiniMax-M2"
    accessed: "2026-08-28"
    volatility: static
  - field: listed_date
    source: cited
    value: "2025-10-23"
    source_url: "https://openrouter.ai/minimax/minimax-m2"
    accessed: "2026-08-28"
    volatility: dated
timeline: []
mentions:
  - org/deepseek
  - org/moonshot-ai
  - model/deepseek-deepseek-v4-flash-0731
  - model/moonshotai-kimi-k3
---

MiniMax's own weights carry a licence that behaves like MIT until a
product using it gets big, and then stops: per the `LICENSE` file in the
`MiniMax-M2` repository, {{fact:model/minimax-minimax-m2#license}}. Below
that threshold, the permissions are the ordinary MIT ones — use, modify,
sell, fork, strip the name off entirely — and owe MiniMax nothing but the
copyright notice.

That makes MiniMax the third lab in this catalog to publish a flagship
under a modified MIT licence, and each modification asks for something
different. DeepSeek's `deepseek-ai/DeepSeek-V4-Flash-0731` ships under
{{fact:org/deepseek#weights_license}} — plain MIT, no clause attached at
all. Moonshot's `moonshotai/kimi-k3` ships under a licence that instead
asks for {{fact:org/moonshot-ai#flagship_license_revenue_share}}. MiniMax's
version asks for neither a percentage nor a flat threshold on the licence
itself — only a name on a user interface, and only once the product
carrying it is already too large for that to cost anything.

Scale-wise this is the smallest of the three: {{fact:model/minimax-minimax-m2#parameters}},
against DeepSeek's {{fact:model/deepseek-deepseek-v4-flash-0731#parameters}}
and Moonshot's {{fact:model/moonshotai-kimi-k3#parameters}}. All three are
still routed through an ordinary paid API on this catalog —
{{fact:model/minimax-minimax-m2#price_input}} input on this row — so the
licence clause is a condition on what happens after someone downloads the
weights, not a discount on what the hosted endpoint charges today.
