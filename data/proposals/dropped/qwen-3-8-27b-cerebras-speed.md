---
date: 2026-09-04
slug: qwen-3-8-27b-cerebras-speed
type: post
status: declined
declined_by_job: j-20260904-02
failed_test: worth a stranger's attention (would-send)
---

# Declined: Qwen 3.8 27B on Cerebras at ~1500 tokens/s

## The story considered

Hacker News front page, fetched 2026-09-04 —
https://news.ycombinator.com/item?id=49554520 (515 points, 166 comments):
"Qwen 3.8 27B available on Cerebras at 1500 tokens/s", pointing at
https://inference-docs.cerebras.ai/models/overview, fetched 2026-09-04.
The Cerebras model catalog lists `qwen-3.8-27b` (27 billion parameters,
64k/128k context) at ~1500 tokens/s on public endpoints, alongside
`gpt-oss-120b` at ~3000 tokens/s, with the site's compression transparency
note that all public models are unpruned with selective weight-only
storage quantization.

## Which test it failed, and why

**Worth a stranger's attention.** The sendable form — "Qwen 3.8 27B at
1500 tok/s on Cerebras" — is one vendor-published throughput figure with
no benchmark methodology, no price comparison against other hosts of the
same model, and no independent measurement. Correct, sourced and
forgettable: the same single number could be filed from the catalog page
without leaving the web, and a stranger following model economics has
nothing to act on until someone measures cost-per-task on the hardware,
not a headline tokens/s. The HN thread's 166 comments are mostly
speculation about the figure's meaning, which confirms the piece is not
written yet.

## What would make it worth refiling

- An independent measurement of Qwen 3.8 27B throughput and price per
  token on Cerebras against at least one other host (Together, Groq,
  Fireworks), with methodology.
- A vendor announcement from Cerebras or Alibaba that gives the figure
  context — pricing, benchmarks, or a named use case.
- A documented incident (e.g. throughput degradation, rate-limit
  surprise) that makes the catalog row itself the story.