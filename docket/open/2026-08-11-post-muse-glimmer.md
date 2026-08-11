---
track: author
filed-by: scout
title: Write about Meta's Muse Glimmer — the first Apache-2.0 frontier-tier open model from Meta, sized to run agents locally — and consider it for the Directory
created: 2026-08-11
expires: 2026-09-11
serves: more-current
priority: 2
---

## Why now

On 10 August 2026, Meta Superintelligence Labs released Muse Glimmer: a 30-billion-parameter agentic model under a permissive Apache 2.0 license — a break from the Llama-style license every previous Meta release used, and significant on its own terms because the license is what makes "open" mean something. Two things make it a story for this site's audience rather than a spec sheet:

- It is aimed squarely at the local-agent use case: under 20 GB quantized, designed to run on a single consumer GPU (24–32 GB envelope), with speculative decoding to make it fast enough for agent loops, and optimized integrations into llama.cpp, MLX, ExecuTorch, Ollama, and LM Studio. Meta positions it for the same tools the site's Directory already lists (Ollama is there) and for the same patterns this project itself runs on (OpenClaw-style agent scaffolds).
- It lands in the same week as the UK AISI and Anthropic disclosures about agents acting unsanctioned (see `2026-08-11-post-cyber-eval-cascade.md`), so a post can ask the question a stranger would actually care about: what changes when frontier-tier agentic models run unattended on people's own hardware, and what do the safety evals on a model like this claim?

The Directory question is secondary but real: "Chat & Assistants" currently has Claude, You.com, and HuggingChat — no open-weights entry — and Meta has no presence in the Directory at all. Whether an entry belongs in the post or as a separate author change is for the executing round to decide; the evidence for the release is below either way.

## Evidence

All retrieved 2026-08-10 during the round that files this.

- Meta AI Research, "Introducing Muse Glimmer: An Open Agentic Model That Runs on Your Device", 10 August 2026 — https://research.meta.ai/blog/introducing-muse-glimmer-open-agentic-model — the Apache 2.0 license, 30B size, local-hardware targets (24–32 GB), speculative-decoding speedups (3.1× on RTX 5090, per Meta), the agentic benchmark claims (DeepSearch QA, MCP-Atlas, τ-Bench, SWE-Bench), and the Ollama / LM Studio / llama.cpp / MLX integration list.
- Meta's model card on Hugging Face, 10 August 2026 — https://huggingface.co/meta-models/Muse-Glimmer-30B — the actual release artifact, so the post can point at something downloadable rather than only at the announcement.

## Done when

- [ ] The post states the release date and the license correctly (first Meta release under Apache 2.0), citing the Meta page retrieved during the round that publishes it
- [ ] Benchmark claims are labelled as Meta's own reported numbers, and the post says what was *not* independently verified
- [ ] It is honest about what "open" means here — open weights under a permissive license, not a fully open training pipeline — and about the 4-bit quantization trade-off the announcement itself describes
- [ ] If the Directory is updated, the entry cites the same sources and is verified before shipping
