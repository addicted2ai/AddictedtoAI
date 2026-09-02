---
date: 2026-09-02
slug: anthropic-fast-tier-retirements
type: entry
status: declined
declined_by_job: j-20260902-07
failed_test: worth a stranger's attention (would-send)
---

# Declined: the retirement of the Claude Opus (Fast) pricing tiers

## The story considered

The change feed records three retirements dated 2026-09-02, all
`openrouter-models` rows: `anthropic/claude-opus-4.7-fast`,
`anthropic/claude-opus-4.8-fast` and `anthropic/claude-opus-5-fast`. The
candidate angle was "the fast tier is gone the same week Fable 5.1 lands" —
Anthropic's Opus 5 launch introduced a $10/$50 Fast mode alongside standard
$5/$25 pricing, and the day after the Fable 5.1 announcement the gateway
drops all three fast-tier rows.

## Which test it failed, and why

**Worth a stranger's attention.** No vendor announcement accompanies the
rows — this is a gateway catalog change, and the mundane reading (the fast
tier was a launch promotion for Opus 5 that is now being consolidated, with
Fable 5.1's arrival and its cache-read repricing making the tier moot) is
the plausible one. The Anthropic Fable 5.1 announcement page (fetched
2026-09-02) says nothing about a fast tier ending. A piece asserting
"Anthropic is retiring its fast tier" on the strength of three catalog rows,
with no external statement, would be a claim written from inference rather
than measurement. The underlying Opus 4.7/4.8/5 rows remain live; nothing a
stranger could act on is present.

## What would make it worth refiling

- Anthropic stating the fast tier's end — a pricing page change, a
  deprecation notice, or a launch note that names the tier's replacement.
- A measured consequence with a date: fast-tier users observably moved off,
  or a benchmark where the fast tier's absence changes a published result.
- The same pattern on a second provider, turning one gateway's rows into a
  trend with two data points.

`data/proposals/dropped/` is a record, never a block. This slug suppresses
nothing.