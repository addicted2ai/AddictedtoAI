---
id: org/openai
kind: org
display_name: OpenAI
status: active
maintenance: stable
aliases:
  - name: OpenAI
    class: exclusive
  - name: OpenAI Group PBC
    class: shared
  - name: OpenAI Foundation
    class: shared
facts:
  - field: founded
    source: cited
    value: "December 2015"
    source_url: "https://en.wikipedia.org/wiki/OpenAI"
    accessed: "2026-08-28"
    volatility: static
  - field: headquarters
    source: cited
    value: "San Francisco, California"
    source_url: "https://en.wikipedia.org/wiki/OpenAI"
    accessed: "2026-08-28"
    volatility: slow
  - field: corporate_form
    source: cited
    value: "OpenAI Group PBC, controlled by the OpenAI Foundation (26%); Microsoft holds 27%"
    source_url: "https://en.wikipedia.org/wiki/OpenAI"
    accessed: "2026-08-28"
    volatility: slow
  - field: valuation
    source: cited
    value: "US$852 billion post-money (April 2026)"
    source_url: "https://en.wikipedia.org/wiki/OpenAI"
    accessed: "2026-08-28"
    volatility: dated
  - field: tier_naming
    source: cited
    value: "the number identifies a model's generation, while Sol, Terra, and Luna identify durable capability tiers"
    source_url: "https://venturebeat.com/technology/openai-unveils-gpt-5-6-sol-terra-and-luna-models-but-only-accessible-to-limited-preview-partners-for-now-per-us-gov"
    accessed: "2026-08-28"
    volatility: slow
timeline:
  - date: "2025-10-28"
    event: "adopted the public benefit corporation structure after approval by the California and Delaware attorneys general"
    source_url: "https://en.wikipedia.org/wiki/OpenAI"
  - date: "2026-06-26"
    event: "GPT-5.6 previewed to roughly 20 organisations at the US government's request under the June 2026 frontier-model executive order"
    source_url: "https://venturebeat.com/technology/openai-unveils-gpt-5-6-sol-terra-and-luna-models-but-only-accessible-to-limited-preview-partners-for-now-per-us-gov"
  - date: "2026-07-09"
    event: "GPT-5.6 Sol, Terra and Luna became generally available, including in GitHub Copilot"
    source_url: "https://github.blog/changelog/2026-07-09-openais-gpt-5-6-sol-terra-and-luna-are-now-available-in-github-copilot/"
mentions:
  - model/openai-gpt-5-6-sol
  - model/openai-gpt-5-6-terra
  - model/openai-gpt-5-6-luna
  - model/openai-gpt-5-4
  - model/openai-gpt-5-5
---

OpenAI stopped naming models after their size. With the GPT-5.6 release on
9 July 2026 the suffixes `mini` and `nano` gave way to three names that are
meant to outlive the generation: "the number identifies a model's
generation, while Sol, Terra, and Luna identify durable capability tiers."
GitHub's Copilot changelog states the tiers plainly on the day of general
availability — Sol has
["the highest reasoning ceiling in the family"](https://github.blog/changelog/2026-07-09-openais-gpt-5-6-sol-terra-and-luna-are-now-available-in-github-copilot/),
Terra is "the balanced default," Luna is "a lightweight, cost-efficient
variant." If the naming holds, a future generation's Sol replaces this one
without renaming anything downstream.

The launch is also the first visible instance of a new gate. An executive
order signed 2 June 2026 set up a voluntary process for developers to give
federal agencies up to 30 days of pre-release access to "covered frontier
models" for national security and cybersecurity assessment — voluntary by
design, with
[no licensing requirement](https://www.wilmerhale.com/en/insights/client-alerts/20260602-new-executive-order-addressing-early-government-access-to-frontier-ai-models).
OpenAI said it had shared the models and its release plans with the
government ahead of launch and that, at the government's request, it was
"starting with a limited preview" — roughly 20 organisations, before the
public release two weeks later.

What the tiers cost is where the release gets interesting. Luna lists at
{{fact:model/openai-gpt-5-6-luna#price_input}} input in the OpenRouter
catalog with an Artificial Analysis intelligence index of
{{fact:model/openai-gpt-5-6-luna#intelligence_index}}. The `openai/gpt-5.4`
row, OpenAI's own flagship four months earlier, sits at
{{fact:model/openai-gpt-5-4#intelligence_index}} on the same index and
{{fact:model/openai-gpt-5-4#price_input}} input. The cheapest member of the
new family lands within a point of the previous flagship's score at roughly
a twelfth of its listed input price, 126 days later.

One oddity in the catalog, as observed on 28 August 2026: each tier's `-pro`
row lists at the same price as its base row — `openai/gpt-5.6-sol-pro`
matches `openai/gpt-5.6-sol` exactly — where the earlier `openai/gpt-5.2-pro`
and `openai/gpt-5.5-pro` rows listed at several times their base rows. Either
the pro premium moved into something other than per-token price, or the
listing is wrong; the catalog is what it is, dated.
