---
id: org/mistral-ai
kind: org
display_name: Mistral AI
status: active
maintenance: stable
aliases:
  - name: Mistral AI
    class: exclusive
  - name: Mistral
    class: manual
  - name: Le Chat
    class: shared
facts:
  - field: founded
    source: cited
    value: "28 April 2023"
    source_url: "https://en.wikipedia.org/wiki/Mistral_AI"
    accessed: "2026-08-28"
    volatility: static
  - field: founders
    source: cited
    value: "Arthur Mensch, Guillaume Lample, Timothée Lacroix"
    source_url: "https://en.wikipedia.org/wiki/Mistral_AI"
    accessed: "2026-08-28"
    volatility: static
  - field: headquarters
    source: cited
    value: "Paris, France"
    source_url: "https://en.wikipedia.org/wiki/Mistral_AI"
    accessed: "2026-08-28"
    volatility: slow
  - field: valuation
    source: cited
    value: "€12 billion (September 2025), after a €2 billion round in which ASML invested €1.3 billion for an 11% shareholding"
    source_url: "https://en.wikipedia.org/wiki/Mistral_AI"
    accessed: "2026-08-28"
    volatility: dated
  - field: flagship_license
    source: cited
    value: "Apache License 2.0"
    source_url: "https://openrouter.ai/mistralai/mistral-large-2512"
    accessed: "2026-08-28"
    volatility: slow
  - field: flagship_parameters
    source: cited
    value: "a sparse mixture-of-experts with 675B total and 41B active parameters"
    source_url: "https://openrouter.ai/mistralai/mistral-large-2512"
    accessed: "2026-08-28"
    volatility: static
  - field: newest_listing
    source: cited
    value: "30 April 2026"
    source_url: "https://openrouter.ai/mistralai/mistral-medium-3-5"
    accessed: "2026-08-28"
    volatility: dated
timeline:
  - date: "2025-12-01"
    event: "Mistral Large 3 listed as the company's most capable model, under the Apache License 2.0"
    source_url: "https://openrouter.ai/mistralai/mistral-large-2512"
  - date: "2026-04-30"
    event: "Mistral Medium 3.5 listed — the newest Mistral row in the 28 August 2026 catalog snapshot"
    source_url: "https://openrouter.ai/mistralai/mistral-medium-3-5"
  - date: "2026-05-19"
    event: "acquisition of the Austrian industrial-simulation firm Emmi AI announced"
    source_url: "https://en.wikipedia.org/wiki/Mistral_AI"
mentions:
  - model/mistralai-mistral-large-2512
  - model/mistralai-mistral-large-2512-batch
  - model/mistralai-mistral-medium-3-5
  - model/mistralai-mistral-medium-3-5-batch
  - model/mistralai-mistral-small-2603
  - model/mistralai-devstral-2512
---

Mistral's most capable model is not its most expensive one, and the gap is
not small.
`mistralai/mistral-large-2512`, listed 1 December 2025, is described on its
own page as ["Mistral's most capable model to date"](https://openrouter.ai/mistralai/mistral-large-2512)
— {{fact:org/mistral-ai#flagship_parameters}}, under
{{fact:org/mistral-ai#flagship_license}} — and lists at
{{fact:model/mistralai-mistral-large-2512#price_input}} for input and
{{fact:model/mistralai-mistral-large-2512#price_output}} for output.
`mistralai/mistral-medium-3-5`, listed five months later on 30 April 2026, is
[a dense 128-billion-parameter model, also available under open weights](https://openrouter.ai/mistralai/mistral-medium-3-5),
and lists at {{fact:model/mistralai-mistral-medium-3-5#price_input}} and
{{fact:model/mistralai-mistral-medium-3-5#price_output}} — in the 31 August
2026 snapshot, three times the input and five times the output of the far
larger model above it in the range. Mistral's ladder runs backwards at the
top: the flagship is the
bargain, and the mid-tier is the premium product.

The `:batch` suffix is worth checking before you plan around it. As of the
31 August 2026 snapshot, every one of Anthropic's eleven batch rows prices
at exactly half its standard twin, and so do nine of Google's eleven, with
one at a quarter and one — `google/gemma-4-31b-it:batch` — listing above
its standard twin instead of below it. Mistral lists six
batch rows and five of them —
`mistralai/mistral-large-2512:batch`, `mistralai/codestral-2508:batch`,
`mistralai/ministral-8b-2512:batch`, `mistralai/mistral-medium-3.1:batch` and
`mistralai/mistral-small-2603:batch` — carry the same input and output prices
as the rows they batch, to the last digit. Only
`mistralai/mistral-medium-3-5:batch` is actually half price. A suffix that
reliably means a discount at two vendors means nothing at this one, five
times out of six.

Nothing has been listed since. Of the five vendors with more than twenty rows
in the catalog, Mistral's newest listing is the oldest by a wide margin:
{{fact:org/mistral-ai#newest_listing}}, against 9 July for OpenAI, 24 July for
Anthropic, 13 August for Google and 26 August for Alibaba Cloud. The company
itself was not still over those four months —
[the public record](https://en.wikipedia.org/wiki/Mistral_AI) has it buying
the Paris cloud startup Koyeb in February 2026 and the Austrian simulation
firm Emmi AI on 19 May, raising 830 million dollars in March for datacentres
near Paris and in Sweden, and expanding its Microsoft partnership in July
into a multibillion-dollar European infrastructure agreement. What Mistral
built in that window was capacity to serve models, not new ones to serve.
