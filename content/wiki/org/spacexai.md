---
id: org/spacexai
kind: org
display_name: SpaceXAI
status: active
maintenance: stable
aliases:
  - name: SpaceXAI
    class: exclusive
  - name: xAI
    class: shared
  - name: Grok
    class: manual
facts:
  - field: founded
    source: cited
    value: "2023-03-09, as xAI"
    source_url: "https://en.wikipedia.org/wiki/SpaceXAI"
    accessed: "2026-08-28"
    volatility: static
  - field: headquarters
    source: cited
    value: "Palo Alto, California"
    source_url: "https://en.wikipedia.org/wiki/SpaceXAI"
    accessed: "2026-08-28"
    volatility: slow
  - field: ownership
    source: cited
    value: "wholly owned subsidiary of SpaceX since 2026-02-02"
    source_url: "https://en.wikipedia.org/wiki/SpaceXAI"
    accessed: "2026-08-28"
    volatility: slow
  - field: former_name
    source: cited
    value: "xAI; rebranded SpaceXAI in July 2026"
    source_url: "https://en.wikipedia.org/wiki/SpaceXAI"
    accessed: "2026-08-28"
    volatility: static
  - field: acquisition_valuation
    source: cited
    value: "all-stock deal valuing SpaceX at US$1 trillion and xAI at US$250 billion"
    source_url: "https://en.wikipedia.org/wiki/SpaceXAI"
    accessed: "2026-08-28"
    volatility: dated
timeline:
  - date: "2023-03-09"
    event: "founded as xAI"
    source_url: "https://en.wikipedia.org/wiki/SpaceXAI"
  - date: "2026-02-02"
    event: "SpaceX acquired xAI in an all-stock transaction; xAI became a wholly owned subsidiary"
    source_url: "https://en.wikipedia.org/wiki/SpaceXAI"
  - date: "2026-08-12"
    event: "Grok 4.6 listed on OpenRouter as the current frontier model"
    source_url: "https://openrouter.ai/x-ai/grok-4.6"
mentions:
  - model/x-ai-grok-4-6
  - model/x-ai-grok-4-5
  - model/x-ai-grok-4-3
  - model/x-ai-grok-4-20
---

The lab is now a division of a rocket company. SpaceX acquired xAI on
2 February 2026 in an all-stock transaction that made it a wholly owned
subsidiary, and in July 2026 the name, logo and handle changed to SpaceXAI.
The change has already reached the product listings: OpenRouter's
description of the current flagship reads
["SpaceXAI's smartest model"](https://openrouter.ai/x-ai/grok-4.6).

The interesting number is the one that went down. The catalog's Grok rows
run `x-ai/grok-4.20` (31 March 2026) at
{{fact:model/x-ai-grok-4-20#context_window}} of context, `x-ai/grok-4.3`
(30 April) at {{fact:model/x-ai-grok-4-3#context_window}}, then
`x-ai/grok-4.5` (8 July) at {{fact:model/x-ai-grok-4-5#context_window}} and
`x-ai/grok-4.6` (12 August) at
{{fact:model/x-ai-grok-4-6#context_window}}. Over four months and four
releases the advertised window shrank by three-quarters — while Anthropic,
OpenAI, Google, DeepSeek, Meta, Moonshot AI and Z.ai all list a
million-token window or more on their current rows in the same snapshot.
Nobody markets a context reduction; you find it by reading the rows in date
order.

What rose over those same four releases was capability and price. The
Artificial Analysis intelligence index went from
{{fact:model/x-ai-grok-4-3#intelligence_index}} on the April row to
{{fact:model/x-ai-grok-4-5#intelligence_index}} in July to
{{fact:model/x-ai-grok-4-6#intelligence_index}} in August, while the listed
input price moved from {{fact:model/x-ai-grok-4-3#price_input}} to
{{fact:model/x-ai-grok-4-6#price_input}}. Whatever the July architecture
change was, it was not sold as a trade — the shorter window was never a
headline.

One more thing the rows record: version numbers here are not decimals.
`x-ai/grok-4.20` was listed on 31 March and `x-ai/grok-4.3` a month later, so
the sequence reads 4.20 then 4.3. Sorting this vendor's models by parsing the
number after the dot puts them in the wrong order, which is a small, real
reason a catalog should key on listing dates and ids rather than on names.
