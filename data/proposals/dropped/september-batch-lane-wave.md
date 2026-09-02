---
date: 2026-09-02
slug: september-batch-lane-wave
type: post
status: declined
declined_by_job: j-20260902-07
failed_test: worth a stranger's attention (would-send)
---

# Declined: the September 1 batch-lane wave

## The story considered

The change feed records a coordinated batch-mode wave dated 2026-09-01:
twenty-one `:batch` arrivals from OpenAI (GPT-3.5 Turbo, GPT-4, GPT-4.1,
GPT-4o, GPT-5, GPT-5.1, GPT-5.2, GPT-5.4, GPT-5.5, GPT-5.6 family, o3, o3
Mini, o4 Mini) plus five `:batch` retirements from Mistral (Codestral 2508,
Ministral 3 8B 2512, Mistral Large 3 2512, Mistral Medium 3.1, Mistral Small
4) — the same sweep that brought Claude Fable 5.1 and DeepSeek V4
Flash/Pro 0731/0813 batch rows.

## Which test it failed, and why

**Worth a stranger's attention.** This is the same judgment already recorded
against the batch lane on 2026-08-31 (`batch-lane-half-price-pricing`): the
asynchronous lane's near-universal half-price convention is established
public knowledge, and a wave of rows appearing in one gateway's catalog is
an inventory event, not news. No provider in this wave broke the convention
(no non-half price, no withdrawn lane, no tiering). Writing it would be
restating a rate table — the failure the editorial bar exists to prevent.
The `derived-batch-vs-sync-price-view` machinery proposal
(`data/proposals/derived-batch-vs-sync-price-view.md`) remains the right
shape for this data: a live derived view, not prose.

## What would make it worth refiling

- A provider breaks the convention — a batch lane priced at something other
  than half, or tiered within itself.
- A provider publishes batch-lane latency or completion-rate figures that
  make the lane comparable against something other than itself.
- The wave acquires a vendor statement (an OpenAI or Mistral announcement
  about batch capacity) that gives the rows a party and a date.

`data/proposals/dropped/` is a record, never a block. This slug suppresses
nothing.