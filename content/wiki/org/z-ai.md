---
id: org/z-ai
kind: org
display_name: Z.ai
status: active
maintenance: stable
aliases:
  - name: Z.ai
    class: exclusive
  - name: Zhipu AI
    class: exclusive
  - name: 智谱
    class: shared
  - name: GLM
    class: manual
facts:
  - field: founded
    source: cited
    value: "2019"
    source_url: "https://en.wikipedia.org/wiki/Zhipu_AI"
    accessed: "2026-08-28"
    volatility: static
  - field: headquarters
    source: cited
    value: "Beijing, China"
    source_url: "https://en.wikipedia.org/wiki/Zhipu_AI"
    accessed: "2026-08-28"
    volatility: slow
  - field: former_name
    source: cited
    value: "Zhipu AI, until the 2025 rebranding"
    source_url: "https://en.wikipedia.org/wiki/Zhipu_AI"
    accessed: "2026-08-28"
    volatility: static
  - field: weights_license
    source: cited
    value: "MIT License, since July 2025"
    source_url: "https://en.wikipedia.org/wiki/Zhipu_AI"
    accessed: "2026-08-28"
    volatility: slow
  - field: listing
    source: cited
    value: "Hong Kong Stock Exchange, 8 January 2026 — the first major Chinese LLM company to IPO"
    source_url: "https://en.wikipedia.org/wiki/Zhipu_AI"
    accessed: "2026-08-28"
    volatility: dated
timeline:
  - date: "2026-01-08"
    event: "IPO on the Hong Kong Stock Exchange"
    source_url: "https://en.wikipedia.org/wiki/Zhipu_AI"
  - date: "2026-02-12"
    event: "GLM-5 released"
    source_url: "https://en.wikipedia.org/wiki/Zhipu_AI"
  - date: "2026-04-07"
    event: "GLM-5.1 released as open source"
    source_url: "https://en.wikipedia.org/wiki/Zhipu_AI"
  - date: "2026-06-16"
    event: "GLM-5.2 released with a one-million-token context window"
    source_url: "https://en.wikipedia.org/wiki/Zhipu_AI"
  - date: "2026-08-14"
    event: "GLM-5.3 released"
    source_url: "https://en.wikipedia.org/wiki/Zhipu_AI"
mentions:
  - model/z-ai-glm-5-3
  - model/z-ai-glm-5-3-flash
  - model/z-ai-glm-5-2
  - model/z-ai-glm-5-1
  - model/z-ai-glm-5
  - model/z-ai-glm-5-turbo
  - model/z-ai-glm-5v-turbo
  - model/z-ai-glm-4-5
  - model/z-ai-glm-4-5v
---

Z.ai published weights for fourteen of its sixteen rows in the OpenRouter
catalog, as observed on 31 August 2026. The two it did not are both
called Turbo, and a checkpoint with no
published weights has no third party able to host it — so on those two rows
the listed price is Z.ai's own, and on the open rows it need not be.
`z-ai/glm-5`, listed 11 February 2026, carries a Hugging Face id and heads
at {{fact:model/z-ai-glm-5#price_input}} for input;
`z-ai/glm-5-turbo`, listed a month later on 15 March, carries no weights and
lists at {{fact:model/z-ai-glm-5-turbo#price_input}}. `z-ai/glm-5v-turbo`,
the multimodal one listed 1 April, matches it to the digit. The open row's
figure is the top listed provider's rate rather than necessarily Z.ai's own,
so the distance between the two is not a measure of what this company
charges to keep a checkpoint to itself: it is a closed price quoted against
whichever host happens to head an open row.

The other field Z.ai fills in that almost nobody does is the death date. Of
the 396 rows in the catalog, as observed on 31 August 2026, six carried a
non-null expiration date and five of them were Z.ai's; no other vendor
carried more than one. It uses the
field two ways. `z-ai/glm-4.5`, one half of the July and August 2025 pair
that carried the company's reputation abroad, reads
{{fact:model/z-ai-glm-4-5#expiration_date}}, a real retirement seventeen
months after listing; its sibling `z-ai/glm-4.5v` no longer carries a
non-null expiration date in this snapshot, so the pair no longer agrees.
The four current rows, both Turbos plus
`z-ai/glm-5.3` and `z-ai/glm-5.3-flash`, read
{{fact:model/z-ai-glm-5-3#expiration_date}}: a sentinel seventy-two years
out, meaning nothing is planned. Neither date is printed on the listing page
a buyer reads. Both sit in the API row behind it.

The cheap row is the capable one. `z-ai/glm-5.3`, listed 18 August 2026, is
text-only and lists at {{fact:model/z-ai-glm-5-3#price_input}} for input.
`z-ai/glm-5.3-flash`, listed eight days later, takes text, images and video,
advertises the identical window of
{{fact:model/z-ai-glm-5-3-flash#context_window}}, and lists at
{{fact:model/z-ai-glm-5-3-flash#price_input}} — around a nineteenth as much.
Z.ai credits a
["hybrid sparse and linear attention architecture"](https://openrouter.ai/z-ai/glm-5.3-flash)
for holding long-context behaviour down there. Within one week the company
shipped a model that reads more kinds of input, over the same window, on the
cheaper row.
