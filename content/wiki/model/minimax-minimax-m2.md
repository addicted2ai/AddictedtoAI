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
  - model/moonshotai-kimi-k2-5
  - model/z-ai-glm-5-1
---

MiniMax's own weights carry a licence that behaves like MIT until a
product using it gets big, and then stops: per the `LICENSE` file in the
`MiniMax-M2` repository, {{fact:model/minimax-minimax-m2#license}}. Below
that threshold, the permissions are the ordinary MIT ones — use, modify,
sell, fork, strip the name off entirely — and owe MiniMax nothing but the
copyright notice.

That makes MiniMax the second lab in this catalog to publish weights under
a modified MIT licence rather than a plain one. The other is Moonshot,
whose `moonshotai/kimi-k2.5` ships under
{{fact:model/moonshotai-kimi-k2-5#license}}. The unmodified baseline both
depart from is the more common case here: DeepSeek's
`deepseek-ai/DeepSeek-V4-Flash-0731` ships under
{{fact:org/deepseek#weights_license}} — plain MIT, no clause attached at
all — and Z.ai's GLM 5.1 carries {{fact:model/z-ai-glm-5-1#license}}.
MiniMax's modification asks for neither a fee nor a share of revenue: only
a name on a user interface, and only once the product carrying it is
already too large for that to cost anything.

Moonshot has since left the family altogether. Its current flagship,
`moonshotai/kimi-k3`, dropped the modified MIT that K2.5 carried in favour
of {{fact:org/moonshot-ai#flagship_license}} — which is worth knowing
before treating "open weights from a Chinese lab" as one category of terms.

Scale-wise MiniMax's is the smallest of the three sets of weights named
here: {{fact:model/minimax-minimax-m2#parameters}}, against Kimi K2.5's
{{fact:model/moonshotai-kimi-k2-5#parameters}} and the
{{fact:model/deepseek-deepseek-v4-flash-0731#parameters}} OpenRouter records
for DeepSeek's V4 Flash. All three are also sold by the token on this
catalog — {{fact:model/minimax-minimax-m2#price_input}} input on this row in
the snapshot of 28 August 2026 — so the licence clause is a condition on
what happens after someone downloads the weights, not a discount on what
the hosted endpoint charges.
