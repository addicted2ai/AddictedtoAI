---
id: org/moonshot-ai
kind: org
display_name: Moonshot AI
status: active
maintenance: stable
aliases:
  - name: Moonshot AI
    class: exclusive
  - name: Moonshot
    class: shared
  - name: 月之暗面
    class: shared
facts:
  - field: founded
    source: cited
    value: "March 2023"
    source_url: "https://en.wikipedia.org/wiki/Moonshot_AI"
    accessed: "2026-08-28"
    volatility: static
  - field: headquarters
    source: cited
    value: "Haidian district, Beijing, China"
    source_url: "https://en.wikipedia.org/wiki/Moonshot_AI"
    accessed: "2026-08-28"
    volatility: slow
  - field: valuation
    source: cited
    value: "US$35 billion (July 2026)"
    source_url: "https://en.wikipedia.org/wiki/Moonshot_AI"
    accessed: "2026-08-28"
    volatility: dated
  - field: flagship_license
    source: cited
    value: "Kimi K3 License — bespoke, not MIT"
    source_url: "https://huggingface.co/moonshotai/Kimi-K3"
    accessed: "2026-08-28"
    volatility: slow
  - field: flagship_license_commercial_trigger
    source: cited
    value: "a separate agreement with Moonshot AI, required before commercial use once a Model-as-a-Service operator's revenue passes US$20 million over any consecutive 12 months"
    source_url: "https://huggingface.co/moonshotai/Kimi-K3/blob/main/LICENSE"
    accessed: "2026-08-28"
    volatility: slow
  - field: flagship_license_attribution_trigger
    source: cited
    value: "the Kimi K3 name displayed prominently in the interface of any product above 100 million monthly active users or US$20 million in monthly revenue"
    source_url: "https://huggingface.co/moonshotai/Kimi-K3/blob/main/LICENSE"
    accessed: "2026-08-28"
    volatility: slow
  - field: flagship_negotiated_revenue_share
    source: cited
    value: "up to 30% revenue sharing in the commercial agreement that hosters above the threshold must negotiate"
    source_url: "https://en.wikipedia.org/wiki/Moonshot_AI"
    accessed: "2026-08-28"
    volatility: slow
  - field: predecessor_license_condition
    source: cited
    value: "one modification to MIT — the Kimi K2.5 name displayed prominently in the interface of any product above 100 million monthly active users or US$20 million in monthly revenue"
    source_url: "https://huggingface.co/moonshotai/Kimi-K2.5/blob/main/LICENSE"
    accessed: "2026-08-28"
    volatility: slow
  - field: flagship_parameters
    source: cited
    value: "2.8T total, 104B activated"
    source_url: "https://huggingface.co/moonshotai/Kimi-K3"
    accessed: "2026-08-28"
    volatility: static
timeline:
  - date: "2026-01-27"
    event: "Kimi K2.5 released with published weights under a Modified MIT License"
    source_url: "https://huggingface.co/moonshotai/Kimi-K2.5"
  - date: "2026-07-16"
    event: "Kimi K3 listed — 2.8T parameters, open weights under the bespoke Kimi K3 License"
    source_url: "https://openrouter.ai/moonshotai/kimi-k3"
  - date: "2026-08-31"
    event: "Kimi K2.5 and the moonshot-v1 series sunset on Moonshot's own platform"
    source_url: "https://platform.kimi.ai/docs/models"
mentions:
  - org/alibaba-cloud
  - model/moonshotai-kimi-k3
  - model/moonshotai-kimi-k2-5
  - model/moonshotai-kimi-k2-7-code
  - model/moonshotai-kimi-k2
---

Moonshot's weights are still published; the terms attached to them are not
what they were, though the shift is narrower than the headline version of it.
Kimi K2.5 shipped in January 2026 under a Modified MIT License carrying
exactly one condition:
{{fact:org/moonshot-ai#predecessor_license_condition}}. Kimi K3, listed on
16 July, comes under a bespoke document, the
[Kimi K3 License](https://huggingface.co/moonshotai/Kimi-K3/blob/main/LICENSE).
It keeps that credit requirement almost verbatim —
{{fact:org/moonshot-ai#flagship_license_attribution_trigger}} — and adds a
second that bites a far smaller company first:
{{fact:org/moonshot-ai#flagship_license_commercial_trigger}}.

What the licence does not contain is a price. It sets no fee and takes no
percentage, and the words "revenue share" appear nowhere in its five
sections; above the threshold it withholds permission rather than charging
for it, and sends the licensee away to negotiate. What that negotiation
costs is not public. Reporting puts it at
{{fact:org/moonshot-ai#flagship_negotiated_revenue_share}} — a claim about
the commercial agreement, not a term of the licence. Alibaba Cloud attaches
a comparable condition to its larger Qwen releases —
{{fact:org/alibaba-cloud#license_revenue_share}} — so metered commerce on
published weights is a pattern across at least two Chinese labs rather than
one lab's experiment.

The thing being licensed is large enough to explain the interest.
`moonshotai/kimi-k3` publishes at
{{fact:org/moonshot-ai#flagship_parameters}} — a mixture-of-experts model
where the served path is a fraction of the whole — with a million-token
context window and an Artificial Analysis intelligence index of
{{fact:model/moonshotai-kimi-k3#intelligence_index}} in the OpenRouter
catalog — against {{fact:model/anthropic-claude-opus-5#intelligence_index}}
for Claude Opus 5, the highest-scoring row in the snapshot of 28 August
2026. Weights at that scale, published, are a different proposition from a
hosted endpoint with the same score.

The cadence underneath is brutal on the models themselves. The catalog holds
seven Moonshot rows spanning `moonshotai/kimi-k2` in July 2025 to
`moonshotai/kimi-k3` a year later, and the platform's own model list already
sunsets `kimi-k2.5` — a January flagship — on
{{fact:model/moonshotai-kimi-k2-5#expiration_date}}, directing migrations to
K3. Seven months of vendor hosting is the working life this lab currently
gives a frontier release.
