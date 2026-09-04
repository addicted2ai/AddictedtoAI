---
date: 2026-09-04
slug: mistral-medium-3-5-batch-context-shrink
type: post
status: declined
declined_by_job: j-20260904-02
failed_test: worth a stranger's attention (would-send)
---

# Declined: Mistral Medium 3.5 (batch) context window cut from 262144 to 32768

## The story considered

The assembled feed context (registered source, not the sweep) carries a
2026-09-04 field_change row: `mistralai/mistral-medium-3-5:batch`
context_window 262144 -> 32768, source
https://openrouter.ai/api/v1/models. An 8x reduction in a batch lane's
context window, from 256K to 32K.

## Which test it failed, and why

**Worth a stranger's attention.** A single context-window change on a
batch-lane row, with no vendor explanation attached, is a mechanical feed
line: it tells a stranger nothing about why the change happened, whether
it is an error, or whether it affects the non-batch row. The sendable
form ("Mistral cut batch context to 32K") cannot be supported or refuted
from any source retrieved in this run — no Mistral announcement exists
for it, and OpenRouter rows are known in this corpus to flap (the
site's own drop records on status-flapping feed fields). Without a
vendor statement or a second change, the honest piece is one sentence of
speculation, which is below the bar.

## What would make it worth refiling

- A Mistral announcement or changelog explaining the context reduction.
- The same change appearing on the non-batch row or across multiple Mistral
  models, turning one row into a pattern.
- A measured consequence of the 32K cap: a documented batch job failing
  on context overflow, or pricing that makes the shrink meaningful.