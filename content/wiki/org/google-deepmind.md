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
    source_url: "https://9to5google.com/2026/08/13/gemini-3-7-flash-launch/"
  - date: "2026-08-13"
    event: "Gemini 3.7 Flash released; introductory pricing declared to run through 2026-12-31"
    source_url: "https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-3-7-flash/"
mentions:
  - model/google-gemini-3-7-flash
  - model/google-gemini-3-6-flash
  - model/google-gemini-3-5-flash
  - model/google-gemini-3-1-pro-preview
---

Google's cheap tier has overtaken its expensive one. In the OpenRouter
catalog on 28 August 2026, the newest Gemini row on the Pro line is
`google/gemini-3.1-pro-preview`, listed on 19 February 2026 and still
carrying `preview` in its name. The Flash line has shipped three times since:
`google/gemini-3.5-flash` in May, `google/gemini-3.6-flash` on 21 July,
`google/gemini-3.7-flash` on 13 August — the last two
[three weeks apart](https://9to5google.com/2026/08/13/gemini-3-7-flash-launch/).

The scoreboard now reads backwards. The Artificial Analysis intelligence
index the catalog carries puts `google/gemini-3.7-flash` at
{{fact:model/google-gemini-3-7-flash#intelligence_index}} against
{{fact:model/google-gemini-3-1-pro-preview#intelligence_index}} for the Pro
preview, and the Flash row lists at
{{fact:model/google-gemini-3-7-flash#price_input}} input against the Pro
row's {{fact:model/google-gemini-3-1-pro-preview#price_input}}. Google's
own numbers for the release are about coding and agents rather than the
Pro comparison: DeepSWE at 65.3% against 49.0% for the previous Flash, and
FrontierCode at 43.6% against 34.4%.

Rising version numbers did not mean rising scores along the way. The July
release, `google/gemini-3.6-flash`, sits at
{{fact:model/google-gemini-3-6-flash#intelligence_index}} on that index —
fractionally below the
{{fact:model/google-gemini-3-5-flash#intelligence_index}} of
`google/gemini-3.5-flash` from May, and at half its listed input price. That
release bought its buyers cost, not capability. The jump came twenty-three
days later.

The price on the current row is dated in a way vendors rarely publish:
Google's launch post calls it introductory pricing, names 31 December 2026
as the day it ends, and states the regular price that follows — double the
introductory one on both input and output. A screenshot of today's price
sheet is wrong from 1 January 2027 onward, and says nothing about it.
