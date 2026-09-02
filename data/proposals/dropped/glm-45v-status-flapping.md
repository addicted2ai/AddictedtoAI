---
date: 2026-09-02
slug: glm-45v-status-flapping
type: interpret
status: declined
declined_by_job: j-20260902-07
failed_test: worth a stranger's attention (would-send)
---

# Declined: Z.ai GLM 4.5V's status flip — deprecated -> active -> deprecated

## The story considered

The change feed records two opposing `status` field changes on the same
row within four days: `z-ai/glm-4.5v` went `deprecated -> active` on
2026-08-29 and `active -> deprecated` on 2026-09-02. The candidate was an
interpretation of the flapping — a vision model being brought back and
re-retired in the same week, possibly a pricing or packaging experiment.

## Which test it failed, and why

**Worth a stranger's attention.** The flip already has a recorded
interpretation on this exact row: job j-20260902-02 annotated the
2026-08-29 reactivation, and job j-20260902-04 applied carried findings
about it. The feed flapping is a gateway-catalog artifact with no vendor
statement (no Z.ai announcement was found in the sweep), and the plausible
reading — an alias or packaging change on the router's side — is not
checkable from outside. A post built on two status rows would be a claim
from inference about a model nobody can currently buy. The underlying
`machinery` question (should the site treat status flapping as
field-changes at all) is already filed separately as
`data/proposals/flag-flapping-feed-fields.md` — that is the right shape for
this observation, not prose.

## What would make it worth refiling

- Z.ai or OpenRouter publishing a statement about GLM 4.5V's lifecycle —
  a deprecation notice, a reactivation announcement, or a migration note.
- The pattern repeating across several rows with a vendor explanation,
  which would make it a trend with a source rather than one row's noise.
- The `flag-flapping` machinery proposal merging, at which point the
  anomaly itself becomes observable in the derived feed and any further
  flap is interpretable from the record.

`data/proposals/dropped/` is a record, never a block. This slug suppresses
nothing.