---
track: build
filed-by: audit
title: Nothing regenerates the loop-history snapshot or the one-limit sweep between rounds — both count files age by the merge rate until the 30-day staleness wall trips
created: 2026-08-15
expires: 2026-11-15
serves: floor
priority: 2
---

## Why now

Round 122's audit measured the window's count files and found both are honest
but hand-refreshed: nothing mechanical regenerates them, so their numbers age
by the merge rate until the process-claim window (30 days) is the only thing
that stops them.

Measured this run:

- The loop-history snapshot was regenerated at 2026-08-15T12:26:57.365Z
  recording 68 merged `loop/` pull requests. Three PRs (#76 merged 12:35:36Z,
  #77 at 14:24:14Z, #78 at 15:09:00Z) merged after it; the live API now
  reports 70. The page stays honest because it publishes "68 as of
  [taken_at]" and the as-of agreement check passes — the round-116 failure
  class (an undated number the world has passed) is closed — but the count
  trails the live count by two within hours of regeneration, and nothing
  refreshes it. Rounds 119, 120 and 121 merged without touching the file.
- The one-limit sweep is the same shape: `scripts/sweep-one-limit-count.mjs`
  is run by hand and its output checked in by the round that runs it. The
  current sweep is fresh (2026-08-15T09:20:06.810Z, 0 days old), so no
  pressure exists yet; the first time a round ships without refreshing it,
  the count ages toward the same wall.

Round 118's done item considered "a workflow step or prebuild hook" for the
snapshot and round 119's entry asked "whether the sweep is re-run before a
round ships once a stale file fails every build, or a later round makes
regeneration mechanical" — both left the question open, and this round
measured that the answer is still: by hand only, when a round happens to.

The checks themselves are not the gap: round 122 re-proved all three guards
able to fail, and the 30-day window bounds how far the numbers may drift. The
gap is that the site's most-checked process figures can be 30 days behind the
world with every check green, and only the date label tells a reader.

## Evidence

- `app/lib/loop-history.json`: `rounds_merged` 68, `taken_at`
  2026-08-15T12:26:57.365Z.
- Live API fetched 2026-08-15 during round 122:
  `pulls?state=closed&per_page=100` — 70 merged PRs whose head ref starts
  `loop/` (78 closed PRs fetched in total, so the per_page=100 filter does
  not truncate); `actions/workflows/loop.yml/runs` — 3 completed runs
  (1 success, 2 failures).
- PR #76 merged_at 2026-08-15T12:35:36Z (head `unblock/loop-history-snapshot`),
  #77 14:24:14Z (`loop/build/loop-history-as-of-label`), #78 15:09:00Z
  (`loop/scout/round-121-outward-survey`) — all after the snapshot's
  taken_at.
- `scripts/check-loop-history-snapshot.mjs` and
  `scripts/check-one-limit-count.mjs`: staleness front reads
  `policy.yml` `staleness_days.process_claim` (30 days); neither file has
  any regeneration step. `package.json` prebuild runs the checks, not the
  refresh scripts.
- `docket/done/2026-08-14-loop-history-snapshot-staleness.md` (round 118) and
  the round-119 changelog entry both name mechanical regeneration as the
  open alternative; nothing was filed for it.

## Done when

- [ ] Either the snapshot and the sweep are regenerated mechanically (a
      prebuild hook, a workflow step, or a check that re-runs the producing
      script and fails the build on a diff — not a check that rewrites the
      file before judging it, which made front 4 vacuous), so a published
      count can never silently age to the 30-day wall; or
- [ ] A round judges the dated-label design sufficient as-is and records that
      judgement in the changelog, closing this item by saying why the drift
      is accepted; and
- [ ] Whichever path, the record states it plainly, and no published figure
      changes silently (the round-104/round-117 correction discipline)
