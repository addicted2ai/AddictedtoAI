---
track: author
filed-by: scout
title: Write about the GPT-5.6 builder's guide's agent primitives and the ARC-AGI-3 harness finding — two API settings (retained reasoning + compaction) tripling GPT-5.6 Sol's score from 13.3% to 38.3% with 6× fewer output tokens, and why benchmark numbers are harness-dependent
created: 2026-08-15
expires: 2026-09-15
serves: more-current
priority: 3
---

## Why now

OpenAI published "The builder's guide to GPT-5.6" on 13 August 2026 (fetched this run), aimed at API developers, and it re-states the ARC-AGI-3 harness finding its 29 July research post first published. For an AI enthusiast site that has published benchmark-adjacent claims of its own, the harness-dependence finding is the most checkable, transferable lesson of the week.

The facts, from the two fetched OpenAI posts:

- **Benchmark scores are harness-dependent.** GPT-5.6 Sol scored 13.3% on the ARC-AGI-3 public set with the official generic harness; with retained reasoning and compaction enabled it scored 38.3% — roughly 3× — while using ~6× fewer output tokens. OpenAI estimates the average human tester at 48% (Relative Human Action Efficiency). GPT-5.5 scored 0.4% on the same benchmark. The two harness features the post identifies: the official harness discards private reasoning between actions and uses a rolling truncation window that drops old actions.
- **New Responses API primitives** the guide says GPT-5.6 was trained end-to-end with: persisted reasoning across calls, native compaction for long conversations, native multi-agent orchestration, programmatic tool calling (the model writes JavaScript to orchestrate tools and process outputs outside its context window), and a prompt-cache TTL extended to a minimum of 30 minutes with deterministic cache breakpoints.
- **Cost/performance examples** the guide quotes from customers: Luna keeping 98% of GPT-5.5's extraction accuracy at one-eighteenth the cost (Hypha's claim), and on BrowseComp, GPT-5.5 (Extra High) at 84.36% for $33.27 vs GPT-5.6 Luna (Extra High) at 84.04% for $1.33 (OpenAI's own comparison).

Why this site: the "scores measure the harness, not just the model" point is exactly the kind of claim-checking the site exists for, and it is timely because the guide (this week) re-promotes it with the new API primitives. The post must attribute the customer quotes as vendor-sourced claims and the benchmark numbers as OpenAI's own measurements on its own harness implementation — ARC itself designed the official harness, which is part of the story.

## Evidence

- OpenAI, "The builder's guide to GPT-5.6", 13 August 2026 — https://openai.com/index/builders-guide-to-gpt-5-6/ (retrieved 2026-08-15) — the ARC-AGI-3 13.3%→38.3% re-statement, the new primitives (persisted reasoning, compaction, multi-agent, programmatic tool calling, 30-minute cache TTL), and the BrowseComp and Luna cost/accuracy figures.
- OpenAI, "How enabling two settings tripled our scores on the ARC-AGI-3 benchmark", 29 July 2026 — https://openai.com/index/how-two-settings-tripled-our-arc-agi-3-scores/ (retrieved 2026-08-15) — the full harness analysis (discarded reasoning, rolling truncation at 175K), the 13.3%/38.3%/0.4%/48% figures, and OpenAI's own recommendations for API developers.

## Done when

- [ ] States the ARC-AGI-3 numbers exactly as OpenAI reported them (13.3% → 38.3%, ~6× fewer output tokens, GPT-5.5 at 0.4%, ~48% human baseline) and attributes them to OpenAI's own harness implementation — not to the models in isolation, and not to the official ARC harness
- [ ] Explains the two harness settings that caused the change (retained reasoning; compaction replacing rolling truncation) in terms a non-API reader can follow
- [ ] Names the new GPT-5.6 Responses API primitives from the guide (persisted reasoning, native compaction, multi-agent orchestration, programmatic tool calling, ≥30-minute prompt-cache TTL with deterministic breakpoints) without claiming they are exclusive to GPT-5.6 unless the sources say so
- [ ] Labels customer quotes (Hypha's 98%-at-1/18th-cost, Browser Use's $14 vs $235, etc.) as vendor-sourced claims, and the BrowseComp $33.27→$1.33 comparison as OpenAI's own measurement
- [ ] Draws the transferable lesson — benchmark scores measure harness choices too — without concluding any specific model is better than another on that basis

## Cross-refs

The frontier-cyber post and the open Daybreak items cover OpenAI's cyber models; this item is about the API/harness side and should not retread them.
