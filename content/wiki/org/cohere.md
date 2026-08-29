---
id: org/cohere
kind: org
display_name: Cohere
status: active
maintenance: stable
aliases:
  - name: Cohere
    class: shared
  - name: Cohere Labs
    class: shared
  - name: Cohere For AI
    class: shared
  - name: Command
    class: manual
  - name: North
    class: manual
facts:
  - field: founded
    source: cited
    value: "2019, by Aidan Gomez, Ivan Zhang and Nick Frosst"
    source_url: "https://en.wikipedia.org/wiki/Cohere"
    accessed: "2026-08-28"
    volatility: static
  - field: headquarters
    source: cited
    value: "Toronto, Ontario, Canada"
    source_url: "https://en.wikipedia.org/wiki/Cohere"
    accessed: "2026-08-28"
    volatility: slow
  - field: market
    source: cited
    value: "finance, healthcare, manufacturing, energy and the public sector"
    source_url: "https://en.wikipedia.org/wiki/Cohere"
    accessed: "2026-08-28"
    volatility: slow
  - field: valuation
    source: cited
    value: "US$7 billion (September 2025)"
    source_url: "https://en.wikipedia.org/wiki/Cohere"
    accessed: "2026-08-28"
    volatility: dated
  - field: revenue
    source: cited
    value: "US$240 million (February 2026)"
    source_url: "https://en.wikipedia.org/wiki/Cohere"
    accessed: "2026-08-28"
    volatility: dated
  - field: newest_model_license
    source: cited
    value: "Apache License 2.0, credited to Cohere and Cohere Labs"
    source_url: "https://huggingface.co/CohereLabs/North-Mini-Code-1.0"
    accessed: "2026-08-28"
    volatility: slow
timeline:
  - date: "2025-03-13"
    event: "Command A listed — an open-weights 111B model at the same list price as Command R+"
    source_url: "https://openrouter.ai/cohere/command-a"
  - date: "2026-04-24"
    event: "Cohere and Aleph Alpha announced a merger in which Cohere would acquire Aleph Alpha"
    source_url: "https://en.wikipedia.org/wiki/Cohere"
  - date: "2026-06-17"
    event: "North Mini Code listed — optimized for agentic software engineering and released open-weight under the Apache 2.0 license"
    source_url: "https://openrouter.ai/cohere/north-mini-code:free"
mentions:
  - model/cohere-command-a
  - model/cohere-command-r-plus-08-2024
  - model/cohere-command-r-08-2024
  - model/cohere-command-r7b-12-2024
  - model/cohere-north-mini-code-free
---

Cohere's list price did not move while its model did. `cohere/command-r-plus-08-2024`,
listed 30 August 2024, and `cohere/command-a`, listed 13 March 2025, carry
identical input and output figures in the OpenRouter snapshot of 28 August
2026 — {{fact:model/cohere-command-a#price_input}} and
{{fact:model/cohere-command-a#price_output}} — and that is where the
similarity stops. The newer row doubled the advertised window to
{{fact:model/cohere-command-a#context_window}} and, unlike its predecessor,
came with downloadable weights: an
[open-weights 111-billion-parameter model](https://openrouter.ai/cohere/command-a).
Six and a half months, twice the window, weights included, same number on the
invoice.

Then fifteen months of nothing, and a return that looks nothing like the
company that left. `cohere/command-a` stayed Cohere's newest listing until
17 June 2026, when `cohere/north-mini-code:free` appeared: the first free
Cohere row in the catalog, the first coding model, and the first row from the
North product line. It is a 30-billion-parameter mixture-of-experts with 3
billion active, published under
{{fact:org/cohere#newest_model_license}} at
[CohereLabs/North-Mini-Code-1.0](https://huggingface.co/CohereLabs/North-Mini-Code-1.0)
— a different Hugging Face namespace from the `CohereForAI` account that
still hosts Command A. A company that sells into
{{fact:org/cohere#market}} re-entered the public catalog with a free agentic
coding model on a new account.

The gap was not idleness. Cohere's revenue was reported at
{{fact:org/cohere#revenue}}, and on 24 April 2026 it
[announced it would acquire the German lab Aleph Alpha](https://en.wikipedia.org/wiki/Cohere),
in a deal that one anonymous individual told the New York Times would make
the combined companies worth twenty billion dollars, with six hundred million
dollars invested in Cohere by Schwarz Gruppe. One structural
detail separates Cohere from nearly every vendor in the catalog:
ninety-one of the 388 rows carry the router's `is_moderated` flag, spread
across eight provider prefixes, and Cohere is one of only two vendors with
five or more rows flagged on every single one. The other is Amazon. Selling
to banks and hospitals shows up in the metadata before it shows up anywhere
else.
