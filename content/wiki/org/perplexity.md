---
id: org/perplexity
kind: org
display_name: Perplexity AI
status: active
maintenance: stable
aliases:
  - name: Perplexity AI
    class: shared
  - name: Perplexity
    class: manual
  - name: Sonar
    class: manual
facts:
  - field: founded
    source: cited
    value: "August 2022, by Aravind Srinivas, Denis Yarats, Johnny Ho and Andy Konwinski"
    source_url: "https://en.wikipedia.org/wiki/Perplexity_AI"
    accessed: "2026-08-28"
    volatility: static
  - field: headquarters
    source: cited
    value: "San Francisco, California"
    source_url: "https://en.wikipedia.org/wiki/Perplexity_AI"
    accessed: "2026-08-28"
    volatility: slow
  - field: valuation
    source: cited
    value: "US$21.21 billion, after a Series E-6 round in early 2026"
    source_url: "https://en.wikipedia.org/wiki/Perplexity_AI"
    accessed: "2026-08-28"
    volatility: dated
  - field: underlying_models
    source: cited
    value: "Sonar is based on Meta's Llama; the product also routes to models from OpenAI, Anthropic, Google and Moonshot AI"
    source_url: "https://en.wikipedia.org/wiki/Perplexity_AI"
    accessed: "2026-08-28"
    volatility: slow
  - field: reasoning_model_base
    source: cited
    value: "\"a premier reasoning model powered by DeepSeek R1 with Chain of Thought\""
    source_url: "https://openrouter.ai/perplexity/sonar-reasoning-pro"
    accessed: "2026-08-28"
    volatility: slow
  - field: input_token_definition
    source: cited
    value: "\"Prompt tokens (user prompt) + Citation tokens (these are processed tokens from running searches)\""
    source_url: "https://openrouter.ai/perplexity/sonar-deep-research"
    accessed: "2026-08-28"
    volatility: slow
  - field: crawling_finding
    source: cited
    value: "Cloudflare reported in August 2025 that Perplexity used undeclared \"stealth\" web crawlers to bypass web application firewalls and ignored robots.txt"
    source_url: "https://en.wikipedia.org/wiki/Perplexity_AI"
    accessed: "2026-08-28"
    volatility: static
timeline:
  - date: "2025-10-30"
    event: "Sonar Pro Search listed as exclusive to the OpenRouter API — the newest Perplexity row in the 28 August 2026 snapshot"
    source_url: "https://openrouter.ai/perplexity/sonar-pro-search"
mentions:
  - model/perplexity-sonar
  - model/perplexity-sonar-pro
  - model/perplexity-sonar-pro-search
  - model/perplexity-sonar-deep-research
  - model/perplexity-sonar-reasoning-pro
---

Thirty rows in the OpenRouter snapshot of 28 August 2026 bill the model's own
reasoning tokens as a separate line item. Twenty-nine of them are Google's
Gemini family. The thirtieth is `perplexity/sonar-deep-research`, which
charges {{fact:model/perplexity-sonar-deep-research#price_internal_reasoning}}
for thinking, on top of input, output and a per-search charge. Outside
Google's family, no vendor in the catalog bills reasoning separately at all.
Its listing also defines what
"input" covers: {{fact:org/perplexity#input_token_definition}}. The material
the model retrieves on your behalf is billed back to you as prompt. On the
newest row, `perplexity/sonar-pro-search`, the per-search rate is the highest
of the 123 rows in the snapshot that carry one — above Google's, and nearly
twice what OpenAI and Anthropic charge.

None of the five rows is Perplexity's own model.
`perplexity/sonar-reasoning-pro` is described on its listing as
{{fact:org/perplexity#reasoning_model_base}} — a Chinese open-weight model
doing the reasoning for an American search company's premier reasoning
product. {{fact:org/perplexity#underlying_models}}. Not one of the five
carries a Hugging Face id, and there is no reason it should: there is no
Perplexity checkpoint to publish. The newest listing is
`perplexity/sonar-pro-search`, dated 30 October 2025 and described as
["Exclusively available on the OpenRouter API"](https://openrouter.ai/perplexity/sonar-pro-search).
Ten months without a new row is unremarkable for a company whose product
improves when other laboratories ship.

What Perplexity does own is the index, which is where its record is
contested. {{fact:org/perplexity#crawling_finding}}, and The New York Times,
the BBC, Dow Jones and Japanese newspaper publishers have filed copyright
suits against it. In February 2026 the company dropped its advertising
business for subscriptions. A search product assembled entirely from other
labs' weights competes on retrieval rather than on training, which is exactly
why its disputes are about crawling and not about datasets — and why the
citation tokens on that bill are the part of the product it actually made.
