---
id: org/tencent
kind: org
display_name: Tencent
status: active
maintenance: stable
aliases:
  - name: Tencent Hunyuan
    class: shared
  - name: Tencent
    class: manual
  - name: Hunyuan
    class: manual
  - name: 腾讯
    class: shared
facts:
  - field: founded
    source: cited
    value: "7 November 1998"
    source_url: "https://en.wikipedia.org/wiki/Tencent"
    accessed: "2026-08-28"
    volatility: static
  - field: headquarters
    source: cited
    value: "Tencent Binhai Mansion, Nanshan District, Shenzhen, Guangdong, China"
    source_url: "https://en.wikipedia.org/wiki/Tencent"
    accessed: "2026-08-28"
    volatility: slow
  - field: model_family
    source: cited
    value: "Hunyuan, debuted September 2023"
    source_url: "https://en.wikipedia.org/wiki/Tencent"
    accessed: "2026-08-28"
    volatility: static
  - field: open_weight_release
    source: cited
    value: "Hy3 was made available under the Apache License in July 2026, following an April 2026 preview"
    source_url: "https://en.wikipedia.org/wiki/Tencent"
    accessed: "2026-08-28"
    volatility: slow
  - field: translation_model_license
    source: cited
    value: "Apache License 2.0, covering translation among 33 languages"
    source_url: "https://huggingface.co/tencent/hy-mt2-7b"
    accessed: "2026-08-28"
    volatility: slow
  - field: newest_model_parameters
    source: cited
    value: "770B total, 49B active — mixture-of-experts, weights not published"
    source_url: "https://openrouter.ai/tencent/hy4-preview"
    accessed: "2026-08-28"
    volatility: slow
timeline:
  - date: "2026-04-22"
    event: "Hy3 preview listed, with published weights at preview stage"
    source_url: "https://openrouter.ai/tencent/hy3-preview"
  - date: "2026-07-06"
    event: "Hy3 listed generally available, under the Apache License and priced below the preview it replaced"
    source_url: "https://openrouter.ai/tencent/hy3"
  - date: "2026-08-19"
    event: "the Hy-MT2 translation family listed — the shortest context windows of any 2026 row in the catalog"
    source_url: "https://huggingface.co/tencent/hy-mt2-7b"
  - date: "2026-08-28"
    event: "Hy4 preview listed — Tencent's first catalog row with no published weights"
    source_url: "https://openrouter.ai/tencent/hy4-preview"
mentions:
  - model/tencent-hy4-preview
  - model/tencent-hy3
  - model/tencent-hy3-preview
  - model/tencent-hy-mt2-7b
  - model/tencent-hy-mt2-30b-a3b
  - model/tencent-hy-mt2-1-8b
  - model/tencent-hunyuan-a13b-instruct
---

In nine days in August 2026 Tencent listed both the shortest context windows
in the year's catalog and one of the longest. `tencent/hy-mt2-7b`,
`tencent/hy-mt2-30b-a3b` and `tencent/hy-mt2-1.8b`, listed on 19 and
20 August, are translation models under
{{fact:org/tencent#translation_model_license}}, each advertising
{{fact:model/tencent-hy-mt2-7b#context_window}} — smaller than any other row
listed in 2026, in a snapshot where the next smallest is exactly twice that.
On 28 August the same vendor listed `tencent/hy4-preview` at
{{fact:model/tencent-hy4-preview#context_window}}; it is
{{fact:org/tencent#newest_model_parameters}}. That is a factor of 128
between two rows from one company inside a fortnight, and it is what a
purpose-built model looks like next to a general one: a translator does not
need to hold a codebase in mind.

Tencent's release pattern is preview first, then weights and a cheaper row.
`tencent/hy3-preview` went up on 22 April 2026; `tencent/hy3` followed on
6 July, heading at {{fact:model/tencent-hy3#price_input}} for input against
{{fact:model/tencent-hy3-preview#price_input}} on the preview, which is still
listed beside it — the generally available row listing below the preview it
replaced — and Wikipedia records that
{{fact:org/tencent#open_weight_release}}. Both are the top listed provider's
rate for their row rather than necessarily Tencent's own, so this is a gap
between two listings and not between two prices Tencent set. The preview is
the expensive way to use the same generation, and it stays on the shelf after
the cheap one arrives.

As of the 31 August 2026 snapshot, `tencent/hy4-preview` is the only one of
Tencent's seven rows with no Hugging
Face id. The other six all have one, `tencent/hy3-preview` included, which
means Tencent shipped downloadable weights at preview stage last generation
and has not this time. It is also the only Tencent row listing above a dollar
per million output tokens:
{{fact:model/tencent-hy4-preview#price_output}} against
{{fact:model/tencent-hy3#price_output}} for the generally available third
generation. The first of those is Tencent's own rate — with no published
weights there is no third party to host the row — while the second is
whichever provider currently heads a row several other companies also serve.
The oldest row in the set, `tencent/hunyuan-a13b-instruct` from 8 July 2025,
is still listed and still carries its weights.
