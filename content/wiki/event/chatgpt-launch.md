---
id: event/chatgpt-launch
kind: event
display_name: "The ChatGPT Launch"
status: dead
maintenance: dormant
themes:
  - history
  - argument
aliases:
  - name: "ChatGPT"
    class: exclusive
  - name: "ChatGPT launch"
    class: shared
facts:
  - field: released
    source: cited
    value: "November 30, 2022"
    source_url: "https://web.archive.org/web/20221130211011/https://openai.com/blog/chatgpt/"
    accessed: "2026-09-08"
    volatility: dated
  - field: product_type
    source: cited
    value: "a model developed by OpenAI that interacts in a conversational way, released as a free research preview"
    source_url: "https://web.archive.org/web/20221130211011/https://openai.com/blog/chatgpt/"
    accessed: "2026-09-08"
    volatility: static
  - field: response_basis
    source: cited
    value: "supervised fine-tuning followed by reinforcement learning from human feedback, starting from a GPT-3.5-series model"
    source_url: "https://web.archive.org/web/20221130211011/https://openai.com/blog/chatgpt/"
    accessed: "2026-09-08"
    volatility: static
timeline:
  - date: "2022-11-30"
    event: "OpenAI releases ChatGPT to the public"
    source_url: "https://web.archive.org/web/20221130211011/https://openai.com/blog/chatgpt/"
mentions:
  - org/openai
  - event/gpt-2-staged-release
---

On 30 November 2022, OpenAI released ChatGPT: a chatbot that made a
research lineage feel like a public utility. The event was not the first
appearance of a large language model, and it was not even OpenAI's first
widely discussed release strategy. GPT-2 had already made staged disclosure
part of the field's vocabulary. ChatGPT changed the scale and texture of the
encounter: anyone could open a browser and address a language model directly.

The interface was the visible part of a specific training pipeline. OpenAI
started with supervised fine-tuning on conversations in which human trainers
played both sides. It then collected comparisons of two or more model
responses, trained a reward model from those rankings, and used that model for
reinforcement-learning fine-tuning. ChatGPT was fine-tuned from a GPT-3.5-series
model whose training had finished in early 2022.

That directness mattered. The interface made generation look conversational,
which invited people to treat a system trained to continue patterns as a
partner in inquiry. The same launch therefore exposed both sides of the new
era at once: astonishingly flexible assistance and confident answers that
could still be wrong. Public attention moved from models as research objects
to models as everyday interlocutors.

The date is a small fact with a large load. Later histories often start the
generative-AI boom here because this was when the capability became legible to
millions of non-specialists. The launch did not create transformers, scaling,
or conversational interfaces. It created a common public reference point for
their consequences.
