---
title: "Open weights, read line by line: seven licences, and no two draw the same line"
date: "2026-08-25"
mentions:
  - org/alibaba-cloud
  - org/z-ai
  - org/moonshot-ai
  - org/deepseek
  - org/meta-superintelligence-labs
  - org/spacexai
  - org/openai
  - model/qwen-qwen3-8-27b
  - model/qwen-qwen3-8-2-4t-a95b
  - model/z-ai-glm-5-3
  - model/z-ai-glm-5-3-flash
  - model/z-ai-glm-5-2
  - model/moonshotai-kimi-k3
  - model/moonshotai-kimi-k2-5
  - model/moonshotai-kimi-k2-6
  - model/mistralai-mistral-medium-3-5
  - model/mistralai-mistral-large-2512
  - model/meta-llama-llama-4-scout
  - model/openai-gpt-oss-120b
  - model/deepseek-deepseek-v4-flash-0731
---

In the last three weeks Qwen published open-weights models under three
different licences. `Qwen3.8-27B` (repository created 2026-08-05) is plain
[Apache-2.0](https://huggingface.co/Qwen/Qwen3.8-27B/raw/main/LICENSE).
`Qwen3.8-2.4T-A95B`, the 2.4-trillion-parameter flagship (2026-08-08), carries a
["Qwen3.8-Max License"](https://huggingface.co/Qwen/Qwen3.8-2.4T-A95B/raw/main/LICENSE)
with a revenue-gated clause. `Qwen3.8-Flash-Next` (2026-08-24) carries a
["Qwen Community License"](https://huggingface.co/Qwen/Qwen3.8-Flash-Next/raw/main/LICENSE)
with the same clause and the gate removed — it binds at any size. Three
fences from one lab in nineteen days, and every one of these releases is
called open weights.

That made it worth reading the current licences side by side, from the
files in the repositories rather than from the tag lines. What follows was
fetched from the canonical `LICENSE` files; repository dates are the
Hugging Face API's `createdAt`.

## The control group is real

Plain MIT or Apache-2.0, no added clauses, still covers much of the field:
[`DeepSeek-V4-Flash-0731`](https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731/raw/main/LICENSE)
and `DeepSeek-V4-Pro-0813` ship stock MIT — the file in both repositories
still says copyright 2023.
[`GLM-5.3-Flash`](https://huggingface.co/zai-org/GLM-5.3-Flash/raw/main/LICENSE)
is stock MIT. Mistral's 675-billion-parameter `Mistral-Large-3` line
declares Apache-2.0. Gemma is the quiet mover: every `gemma-4` repository
(the first are dated 2026-03-02) declares `apache-2.0`, where every
`gemma-3` repository sits under the bespoke `gemma` licence — Google
dropped its custom terms between generations without ceremony.

And OpenAI's `gpt-oss-120b` is Apache-2.0 with a
[usage policy](https://huggingface.co/openai/gpt-oss-120b/raw/main/USAGE_POLICY)
that is one sentence long — 201 bytes, quoted here in full: "We aim for our
tools to be used safely, responsibly, and democratically, while maximizing
your control over how you use them. By using OpenAI gpt-oss-120b, you agree
to comply with all applicable law."

## Seven licences, seven different lines

Each of the restricted licences is short — most are a modified MIT with one
or two operative conditions. The conditions never match.

**Kimi K3** ([licence](https://huggingface.co/moonshotai/Kimi-K3/raw/main/LICENSE),
repository 2026-06-13): display "Kimi K3" prominently in your UI once your
product passes 100 million monthly active users or `US$20,000,000` in
monthly revenue — and, new in K3, any "Model as a Service" business whose
aggregate revenue exceeds `US$20,000,000` over twelve months "must enter
into a separate agreement with Moonshot AI" before commercial use. Kimi
K2.5 (2026-01-01) and K2.6 (2026-04-14) have only the display clause; the
revenue gate appeared between April and June. There is also a carve-out for
use "through Moonshot AI's official products or certified inference
partners" — a certified-channel written into the licence itself.

**Qwen3.8-Max** (2026-08-08): the same display clause, plus a separate
licence required at `US$50,000,000` of twelve-month revenue for any "Model
as a Service **or AI Work Assistant** business". The licence defines the
second term: "an independent AI-powered product primarily designed for
AI-assisted coding or office productivity (e.g., Qoder and QwenWork)" —
and both examples are Alibaba's own:
[Qoder](https://www.alibabacloud.com/blog/introducing-qoder-agentic-coding-platform-for-real-software_603349)
is its agentic coding platform, QwenWork its workplace agent
product. A translation tool, a shopping
assistant, or an AI feature inside a non-AI product are expressly outside
the definition; a coding assistant is expressly inside it.

**Qwen Community License** (`Qwen3.8-Flash-Next`, 2026-08-24): the same two
categories, no revenue threshold. Any MaaS or AI-work-assistant business,
of any size, "shall obtain a separate license from Qwen" before commercial
use. The licence with the smallest model attached is the strictest of the
three.

**GLM-5.3** ([licence](https://huggingface.co/zai-org/GLM-5.3/raw/main/LICENSE),
2026-08-25): MIT-shaped until clause 2, which binds only a Model-as-a-Service
business whose aggregate revenue exceeds ten billion US dollars over twelve
months — such a licensee "must pass Z.AI's security review before using the
Software or its derivative works for any commercial purpose", where "the
scope and method of the security review shall be reasonably determined by
Z.AI." A threshold five hundred times Moonshot's, reaching only
hyperscaler-sized resellers. Ten weeks earlier, `GLM-5.2` (2026-06-16)
shipped under stock MIT; the flagship left MIT on the same day its Flash
sibling stayed.

**`Mistral-Medium-3.5`**
([licence](https://huggingface.co/mistralai/Mistral-Medium-3.5-128B/raw/main/LICENSE),
2026-03-31): not a display rule and not a gate on one business model — an
authorization cut-off. "You are not authorized to exercise any rights under
this license if the global consolidated monthly revenue of your company (or
that of your employer) exceeds `$20 million`... for the preceding month",
with the remedy being a commercial licence granted "at its sole discretion"
or Mistral's own hosted service. Note two oddities: the clause says "this
restriction in (b)" though the licence contains no "(b)", and the test
covers *your employer* — an engineer at any large company is outside the
licence at work regardless of what the model is used for. Meanwhile the
bigger `Mistral-Large-3-675B` declares Apache-2.0: within one vendor, the
restricted model is not the largest one but the one closest to its paid API
tier.

**Llama 4** ([licence](https://www.llama.com/llama4/license/), effective
2025-04-05): Meta's community licence still has the strangest
threshold — it binds you only if your products exceeded 700 million monthly
active users *on the Llama 4 release date*, a test frozen in time. It also
requires derivative model names to begin with "Llama", "Built with Llama"
attribution, and compliance with an acceptable-use policy "incorporated by
reference". The newest repository under the `meta-llama` organization is
dated 2025-04-28: sixteen months, as of this writing, without a new open
release from the vendor that defined this licence style.

**Grok 2** ([xAI Community License](https://huggingface.co/xai-org/grok-2/raw/main/LICENSE),
last updated 2025-11-04): the outlier in kind, not degree. The grant is
"revocable"; commercial use is conditional on an acceptable-use policy; and
uniquely in this set, it restricts what outputs may be used for: "You may
not use the Materials, derivatives, or outputs (including generated data)
to train, create, or improve any foundational, large language, or
general-purpose AI models". It caps xAI's aggregate liability at `$100`,
and disputes go to Tarrant County, Texas. The `xai-org` account has
published no model weights since `grok-2` (2025-08-22).

## What the lines have in common

Laid side by side: a display-your-brand rule at 100M users, a separate
agreement at twenty million dollars a year, a separate licence at fifty
million, an unconditional one for two product categories, a security review
at ten billion, an outright cut-off at twenty million a month, a
user-count test frozen on release day, and a ban on training models with
outputs. The revenue thresholds alone span a factor of five hundred. Each
licence in the restricted set is triggered by a different kind of company —
a coding-assistant product, a hyperscale reseller, a modestly profitable
API business, any large employer, a consumer giant, a model trainer — and
no two of them describe the same one.

Two absences are as legible as the clauses. None of the Chinese-lab
licences read here restricts what the model's outputs may be used for — of
the full texts read for this piece, only xAI's does. And none of them
incorporates an acceptable-use policy — the mechanism at the center of
Llama-style licensing since 2023 simply is not there; conduct clauses have
been replaced by commerce clauses.

## Method and limits

Every characterization above comes from the licence file at the linked URL
(or, for Llama 4, Meta's licence page) as fetched when this was written;
repository creation dates are from the Hugging Face API
(`/api/models?author=...`). Limits: a repository's `createdAt` is when the
repo was made, which can precede public release; the Llama 4 licence was
read on Meta's page rather than raw from a gated repository; and Gemma 4's
`apache-2.0` declaration links a Google licence page that carries the
Apache text alongside Google's separately-published Gemma use policies —
how those interact for Gemma 4 is a question the declaration does not
answer. Licence files can change in place, which is what the dates in this
piece are for.
