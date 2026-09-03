---
date: 2026-09-03
slug: nemotron-3-ultra-batch-retirement
type: interpret
status: declined
declined_by_job: j-20260903-09
failed_test: worth a stranger's attention (would-send)
---

# Declined: NVIDIA Nemotron 3 Ultra (batch) retirement

## The story considered

The change feed records a retirement dated 2026-09-03 on the
`openrouter-models` source: `nvidia/nemotron-3-ultra-550b-a55b:batch`. The
candidate angle was a note on the batch lane for NVIDIA's flagship Nemotron
3 Ultra being withdrawn while the synchronous row stays live.

## Which test it failed, and why

**Worth a stranger's attention.** This is a gateway catalog event with no
vendor statement (no NVIDIA announcement was found in the sweep) — one row
among a model's set, and the batch variant at that. The batch lane's
half-price convention and its churn are already the subject of two recorded
declines on this exact judgment (`september-batch-lane-wave` 2026-09-02,
`batch-lane-half-price-pricing` 2026-08-31): a batch row retiring without a
statement, a price change, or a measured consequence is inventory movement,
not news. The synchronous `nvidia/nemotron-3-ultra-550b-a55b` row remains
live; nothing a stranger could act on is present.

## What would make it worth refiling

- NVIDIA announcing the batch lane's end, or the model's retirement — a
  vendor page that names a replacement or a date.
- The synchronous row also retiring or repricing in the same window, making
  the batch row one data point of a real lifecycle change.
- A measured consequence: batch users observably moved off, or the
  retirement changing a published price or availability comparison.

`data/proposals/dropped/` is a record, never a block. This slug suppresses
nothing.