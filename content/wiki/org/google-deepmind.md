---
id: org/google-deepmind
kind: org
display_name: Google DeepMind
status: active
maintenance: stable
aliases:
  - name: Google DeepMind
    class: exclusive
  - name: DeepMind
    class: shared
  - name: Google AI
    class: manual
facts:
  - field: founded
    source: cited
    value: "2010-11-15 (as DeepMind)"
    source_url: "https://en.wikipedia.org/wiki/Google_DeepMind"
    accessed: "2026-08-28"
    volatility: static
  - field: headquarters
    source: cited
    value: "London, England"
    source_url: "https://en.wikipedia.org/wiki/Google_DeepMind"
    accessed: "2026-08-28"
    volatility: slow
  - field: formed_by
    source: cited
    value: "merger of DeepMind and Google Brain, April 2023"
    source_url: "https://en.wikipedia.org/wiki/Google_DeepMind"
    accessed: "2026-08-28"
    volatility: static
  - field: flash_introductory_pricing
    source: cited
    value: "US$0.75 / US$3.75 per million tokens through 2026-12-31, then US$1.50 / US$7.50"
    source_url: "https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-3-7-flash/"
    accessed: "2026-08-28"
    volatility: dated
timeline:
  - date: "2014-01-26"
    event: "Google acquired DeepMind"
    source_url: "https://en.wikipedia.org/wiki/Google_DeepMind"
  - date: "2026-07-21"
    event: "Gemini 3.6 Flash released"
    source_url: "https://openrouter.ai/google/gemini-3.6-flash"
  - date: "2026-08-13"
    event: "Gemini 3.7 Flash released; introductory pricing declared to run through 2026-12-31"
    source_url: "https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-3-7-flash/"
  - date: "2026-09-02"
    event: "Gemini 3.8 Flash released"
    source_url: "https://openrouter.ai/google/gemini-3.8-flash"
mentions:
  - model/google-gemini-3-8-flash
  - model/google-gemini-3-7-flash
  - model/google-gemini-3-6-flash
  - model/google-gemini-3-5-flash
  - model/google-gemini-3-1-pro-preview
---

Google's Pro line has stopped shipping and its cheap line has not. In the
OpenRouter catalog on 3 September 2026, the newest Gemini row on the Pro
line is `google/gemini-3.1-pro-preview`, listed on 19 February 2026 and still
carrying `preview` in its name. The Flash line has shipped four times since:
`google/gemini-3.5-flash` in May, `google/gemini-3.6-flash` on 21 July,
`google/gemini-3.7-flash` on 13 August, `google/gemini-3.8-flash` on
2 September. [llm-releases](https://llm-releases.com/models/gemini-3-8-flash)
counts that run as Google's fourth Flash model in under four months;
[9to5Google](https://9to5google.com/2026/09/02/gemini-3-8-flash-launch/) read
it as the third Flash update in three months, with 3.8 rolling out three
weeks after 3.7.

The scoreboard moved with the shipping. The Artificial Analysis intelligence
index the catalog carries puts `google/gemini-3.8-flash` at
{{fact:model/google-gemini-3-8-flash#intelligence_index}}, against
{{fact:model/google-gemini-3-7-flash#intelligence_index}} for the August
release and {{fact:model/google-gemini-3-6-flash#intelligence_index}} for
July's — two climbs in six weeks.
[llm-releases](https://llm-releases.com/models/gemini-3-8-flash) published
its own split of the 3.8 Flash score by reasoning effort on 3 September:
{{fact:model/google-gemini-3-8-flash#intelligence_index_by_effort}}. The
Flash row lists at {{fact:model/google-gemini-3-8-flash#price_input}} input;
the Pro preview, six months older, lists at
{{fact:model/google-gemini-3-1-pro-preview#price_input}}.

The discount arrived before the capability did. `google/gemini-3.5-flash`
from May listed at {{fact:model/google-gemini-3-5-flash#price_input}};
`google/gemini-3.6-flash` in July halved that to
{{fact:model/google-gemini-3-6-flash#price_input}}, and the two releases
since have held it there. The jump on the index came twenty-three days after
the price cut, on a row that costs the same.

Google says the latest jump is a design choice: the
[launch post](https://blog.google/innovation-and-ai/models-and-research/gemini-models/3-8-flash-and-3-8-flash-cyber/)
explains that "3.8 Flash works harder", executing extra reasoning steps and
calling tools iteratively, and that "at times, the model might use more
tokens to maximize performance, especially at higher effort levels".
[llm-releases](https://llm-releases.com/models/gemini-3-8-flash) prices that
sentence: output tokens per task rose ~30%, to
{{fact:model/google-gemini-3-8-flash#output_tokens_per_task}}, lifting cost
per task to {{fact:model/google-gemini-3-8-flash#cost_per_task}} at high
reasoning even though the per-token price never moved.

The price on the current row is dated in a way vendors rarely publish:
Google's launch post calls it introductory pricing, names 31 December 2026
as the day it ends, and states the regular price that follows — double the
introductory one on both input and output. A screenshot of today's price
sheet is wrong from 1 January 2027 onward, and says nothing about it.
