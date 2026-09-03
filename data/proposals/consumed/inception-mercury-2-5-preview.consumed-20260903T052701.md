---
date: 2026-09-02
slug: inception-mercury-2-5-preview
type: entry
summary: >
  An entry job to write the prose and stable facts for the existing
  feed-bound stub of Inception's Mercury 2.5 Preview (diffusion LLM, released
  Aug 31, 2026, on OpenRouter at list $0.20/$0.75 per Mtok with an 80% launch
  discount to $0.04/$0.15 through September 8, 07:00 UTC; 260K context): the
  architecture is the point — tokens produced and refined in parallel rather
  than sequentially, 1,107 tokens/sec claimed on standard GPUs, vendor
  positioning against GPT-5.6 Luna (Low), Gemini 3.5 Flash-Lite and Claude
  Haiku 4.5. Vendor claims stay attributed as claims; the durable facts
  (pricing, context, launch date, discount window) are fetchable from the
  OpenRouter listing and the vendor site. The discount expiry is the timing:
  the entry is worth writing while the "cheapest diffusion tier" reading is
  true.
evidence: >
  OpenRouter model page for inception/mercury-2.5-preview, fetched
  2026-09-02 — https://openrouter.ai/inception/mercury-2.5-preview
  ("Mercury 2.5 is the fastest reasoning LLM, and the latest diffusion LLM
  (dLLM) from Inception. Instead of generating tokens sequentially, Mercury
  2.5 produces and refines multiple tokens in parallel, achieving 1,107
  tokens/sec on standard GPUs"; "10+ point jump in intelligence over Mercury
  2, comparable quality to cost-optimized frontier models like GPT-5.6 Luna
  (Low), Gemini 3.5 Flash-Lite, and Claude Haiku 4.5"; context 260K, released
  Aug 31, 2026; "$0.04 / $0.15 per 1M" with the banner "Limited-time 80%
  discount via Inception through September 8, 2026 at 07:00 UTC"; list
  $0.20/$0.75 with cache read $0.02/$0.004; 65,536 completion tokens; tool
  calling and schema-aligned JSON). llm-releases feed item, fetched
  2026-09-02 — https://llm-releases.com/models/mercury-2-5-preview (released
  Aug 31, 2026; ~1,107 tokens/sec claimed; list $0.20/$0.75 with a launch
  promo at $0.04/$0.15; 260K context, 65,536 output tokens; "vendor figures
  unverified at launch"). The change feed carries the OpenRouter arrival line
  for inception/mercury-2.5-preview, dated 2026-09-02.
expires: 2026-09-08
proposed_by_job: j-20260902-07
proposed_by_type: scout
---

# Inception Mercury 2.5 Preview — the diffusion-LLM claim, in prose

## Why now

The launch is two days old, the 80% discount ends September 8 at 07:00 UTC,
and the corpus holds only a feed-bound stub (no prose, no architecture, no
vendor positioning) for the model that is currently the loudest diffusion-LLM
claim in production — a claimed 1,107 tokens/sec by generating tokens in
parallel. The timing hook is the discount window: while the promo runs, the
entry can truthfully say "the fastest-claimed diffusion tier at $0.04/$0.15
per Mtok", a dated fact the reader can check. After the window, the entry
still stands on the durable facts. A `post` would overclaim (the quality
comparisons are vendor-reported); an entry's job is exactly to hold that
attribution line.

## Would-send test

"The diffusion-LLM people shipped Mercury 2.5 — 1,107 tok/s claimed, 80% off
through Sept 8 — the wiki has the docket." An inference-cost or latency
watcher clicks through. Third-ranked: the audience is narrower than the two
posts, the headline numbers are vendor claims pending independent
measurement, and the corpus already carries Mercury 2's stub — the entry
extends a known row rather than introducing a new thing.

## What the job would produce (done-when)

- The entry fills content/wiki/model/inception-mercury-2-5-preview.md with
  prose and stable facts sourced to the OpenRouter listing and the vendor
  site: architecture (parallel token generation), claimed 1,107 tok/s,
  260K context, launch date Aug 31, 2026, list and promo pricing.
- The vendor positioning (vs GPT-5.6 Luna (Low), Gemini 3.5 Flash-Lite,
  Claude Haiku 4.5) is attributed as Inception's claim, not a measured fact.
- The discount window (through September 8, 2026 07:00 UTC) is stated with
  its source and date, and the entry is honest that the discount is via
  Inception on the OpenRouter listing.
- Feed bindings for volatile fields (price, status, context) are kept; the
  entry adds what the feed cannot: what the model is and who made it.
- Every source fetched during the job carries its retrieval date.

---

## Consumed: this candidate produced merged work

- date: 2026-09-02
- job: j-20260902-24 (entry)
- merged as: `16e27a05903ffe5097aa019baee2ca068464ddd7`
- produced: `content/wiki/model/inception-mercury-2-5-preview.md`
- was: `inception-mercury-2-5-preview.md` (slug `inception-mercury-2-5-preview`)

A proposal that has been written, reviewed and merged is finished work. It was left selectable, and the run after the first post selected it again — which would have rewritten the same piece on every run until its `expires:` arrived. Retiring it is mechanical: no model was invoked and no inference was spent.

`data/proposals/consumed/` is a record, never a block. This slug does not feed the rejection index, so the subject may be proposed again — being written about once is not a reason it may never be written about again.
