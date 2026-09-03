---
date: 2026-09-03
slug: inception-mercury-2-5-diffusion-llm
type: entry
summary: >
  An entry job minting the org/inception-labs wiki entry (the corpus has no
  Inception Labs entry at all) and writing prose on the Pulse-minted
  inception-mercury-2-5-preview stub: Inception's Mercury 2.5 Preview, a
  diffusion LLM (dLLM) released Aug 31, 2026 (OpenRouter and llm-releases
  both date it Aug 31; the site's feed rows landed 2026-09-02/03) — parallel
  token generation at ~1,107 tokens/sec on standard GPUs, positioned by
  Inception as "the fastest reasoning LLM" with a claimed 10+ point
  intelligence gain over Mercury 2 and quality comparable to cost-optimized
  frontier models (GPT-5.6 Luna Low, Gemini 3.5 Flash-Lite, Claude Haiku
  4.5); 260K-token context, 65,536 output; $0.20/$0.75 per Mtok list pricing
  with an 80% launch promo ($0.04/$0.15) running through September 8, 2026
  07:00 UTC; preview-status caveats (text-only documented path, OpenAI-
  compatible API, preview aliases may change).
evidence: >
  OpenRouter listing, fetched 2026-09-03 —
  https://openrouter.ai/inception/mercury-2.5-preview ("Mercury 2.5 is the
  fastest reasoning LLM, and the latest diffusion LLM (dLLM) from Inception.
  Instead of generating tokens sequentially, Mercury 2.5 produces and refines
  multiple tokens in parallel, achieving 1,107 tokens/sec on standard GPUs.
  It delivers a 10+ point jump in intelligence over Mercury 2, comparable
  quality to cost-optimized frontier models like GPT-5.6 Luna (Low), Gemini
  3.5 Flash-Lite, and Claude Haiku 4.5"; "Released Aug 31, 2026"; "Context
  260K"; "80% off $0.04 / $0.15 per 1M"; "Limited-time 80% discount via
  Inception through September 8, 2026 at 07:00 UTC"). Inception homepage,
  fetched 2026-09-03 — https://www.inceptionlabs.ai/ ("Mercury 2.5 (Preview)
  is live on OpenRouter"; "Our most intelligent reasoning LLM, at our lowest
  price. Ideal for the most complex applications where quality and speed
  matter. Input $0.20 per 1M tokens Output $0.75 per 1M tokens"; "sub-300ms
  time to first token, 5-7x higher throughput, and up to 70% lower cost per
  task"; "Mercury is a new class of diffusion LLMs"). llm-releases catalog
  page, fetched 2026-09-03 — https://llm-releases.com/models/mercury-2-5-preview
  ("The latest diffusion large language model (dLLM) from Inception, released
  Aug 31, 2026"; "reaching ~1,107 tokens/sec on standard GPUs"; "fastest
  reasoning LLM"; "10+ point intelligence gain over Mercury 2"; "quality
  comparable to cost-optimized frontier models (GPT-5.6 Luna Low, Gemini 3.5
  Flash-Lite, Claude Haiku 4.5)"; "tunable reasoning levels, parallel tool
  calls, and schema-aligned JSON output"; 260K context, up to 65,536 output
  tokens; "List pricing is $0.20/$0.75 per Mtok input/output (a launch promo
  ran at $0.04/$0.15)"). Independent writeup, fetched 2026-09-03 —
  https://www.aimadetools.com/blog/mercury-2-5-preview-explained/ (published
  Sep 2, 2026; "OpenRouter's launch rates are an 80% promotional discount.
  They are not Inception's direct list price and may change independently";
  preview/early-access status; "The currently documented developer path is a
  text model"). The site's change feed carries the OpenRouter arrival row for
  inception/mercury-2.5-preview dated 2026-09-02 and the llm-releases arrival
  dated 2026-09-03; the llm-releases feed pubDate for the item is
  Mon, 31 Aug 2026.
expires: 2026-09-08
---

# Mercury 2.5 Preview — Inception's diffusion LLM, and the first Inception entry the site would own

## Why now

The diffusion architecture is the story the change feed cannot carry: the
rows say only that a model named inception/mercury-2.5-preview arrived. The
corpus has no Inception Labs org entry — a lab that has shipped the
commercially most visible diffusion LLMs (Mercury, Mercury 2, now Mercury
2.5) is unrepresented while far smaller labs have entries. The launch promo
prices expire September 8, 2026 07:00 UTC — a dated why-now that gives the
candidate a natural deadline and makes the promo-pricing distinction (list
vs. promotional) a checkable fact while it is still live.

## Would-send test

"Inception previewed Mercury 2.5 — a diffusion LLM, so it generates tokens
in parallel instead of left-to-right: ~1,100 tok/s on standard GPUs,
positioned as the fastest reasoning LLM, 260K context at $0.20/$0.75 — 80%
off until Sep 8." Anyone who pays for inference or watches model
architecture forwards that; a diffusion LM is a genuinely different object
from the autoregressive models every other row on this feed names, and the
site has nothing on the class yet.

## What the job would produce (done-when)

- A new org/inception-labs entry: identity (diffusion LLM builder;
  founders from Stanford, UCLA, Cornell, Google DeepMind, Meta AI,
  Microsoft AI, OpenAI, as the homepage states), the diffusion-not-
  autoregressive description, and a timeline row for Mercury 2.5 Preview
  dated per the sources (Aug 31 release per OpenRouter and llm-releases;
  feed detection Sep 2-3).
- The inception-mercury-2-5-preview model entry gains prose carrying: the
  1,107 tok/s parallel-generation claim, the "fastest reasoning LLM"
  positioning and the three quality-comparison anchors (GPT-5.6 Luna Low,
  Gemini 3.5 Flash-Lite, Claude Haiku 4.5), the 260K/65,536 context, list
  pricing $0.20/$0.75 with the 80% promo ($0.04/$0.15) through
  September 8, 2026 07:00 UTC, tunable reasoning levels / parallel tool
  calls / schema-aligned JSON, and the preview-status caveats (text-only
  documented path, OpenAI-compatible endpoint, promo-vs-list distinction).
- All speed, quality and benchmark claims are labeled vendor-reported with
  the page each came from; the aimadetools article's warning that the
  promotional rate is not the list price is carried, not elided.

---