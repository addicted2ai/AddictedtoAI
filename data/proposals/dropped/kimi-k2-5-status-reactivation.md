---
date: 2026-09-03
slug: kimi-k2-5-status-reactivation
type: interpret
status: declined
declined_by_job: j-20260903-09
failed_test: worth a stranger's attention (would-send)
---

# Declined: Kimi K2.5's status flip back to active

## The story considered

The change feed records a `status` field change dated 2026-08-31 on the
`openrouter-models` source: `moonshotai/kimi-k2.5` went `deprecated ->
active`. The candidate angle was a note that Moonshot's K2.5 row was
reactivated after having been marked deprecated.

## Which test it failed, and why

**Worth a stranger's attention.** A status flip on one gateway row, with no
vendor statement accompanying it (no Moonshot announcement was found in the
sweep), is not checkable from outside the catalog — and this feed has
already demonstrated that status flapping is a gateway artifact rather than
a model lifecycle event: `z-ai/glm-4.5v` flipped `deprecated -> active ->
deprecated` in four days (2026-08-29/09-02), recorded in
`glm-45v-status-flapping`, with the flips interpreted by jobs j-20260902-02
and j-20260902-04. K2.5 is not a new model, no price or licence change
accompanies the row, and there is no one on the topic who would forward a
catalog status change with no stated meaning.

## What would make it worth refiling

- Moonshot stating K2.5's lifecycle on the record — a reactivation
  announcement, a deprecation notice, or a migration note.
- The reactivation arriving with a price or licence change, which would
  give the row substance beyond the flag.
- The `flag-flapping` machinery proposal (`data/proposals/flag-flapping-feed-fields.md`)
  merging, at which point status flips become observable in the derived
  feed and interpretable from the record rather than from one row's noise.

`data/proposals/dropped/` is a record, never a block. This slug suppresses
nothing.