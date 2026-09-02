---
date: 2026-09-02
slug: zai-glm-flash-latest-alias
type: entry
status: declined
declined_by_job: j-20260902-07
failed_test: worth a stranger's attention (would-send)
---

# Declined: Z.ai's GLM Flash Latest alias arrival

## The story considered

The change feed records an arrival dated 2026-09-02 on the
`openrouter-models` source: `~z-ai/glm-flash-latest` (1.31M context, active,
$0.075/$0.25 per Mtok) — an "latest" alias row for Z.ai's flash tier,
alongside the existing `~z-ai/glm-latest` alias and the GLM 5.3 Flash
arrival recorded on 2026-08-29. The candidate was a note on Z.ai
standardising its "latest" aliasing across the fast tier.

## Which test it failed, and why

**Worth a stranger's attention.** An alias row is a router convenience: it
names a pointer that already resolves to a live model, with no vendor
announcement, no new capability, and no price or licence change attached
to the arrival itself. The sendable form — "Z.ai added a flash-latest
alias" — has no "look at this" in it for anyone who is not already
watching the alias list. The GLM-5.3-Flash model the alias points to was
already covered on 2026-08-29 (`z-ai/glm-5.3-flash` arrival), so the
underlying story is recorded; the alias adds naming, not news.

## What would make it worth refiling

- Z.ai announcing a policy around "latest" aliases — a documented contract
  for what the pointer tracks, which would be a checkable change for
  API consumers.
- The alias pointing at a NEW model that the feed has not already recorded,
  making the row carry the substance rather than the name.
- A price or licence change arriving through the alias, which would be an
  event the corpus can compare against the pinned rows.

`data/proposals/dropped/` is a record, never a block. This slug suppresses
nothing.