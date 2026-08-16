---
track: meta
filed-by: maintainer
title: The supervisor's per-iteration checkout switches the branch out from under review sessions working in the shared checkout
created: 2026-08-16
expires: 2026-11-14
serves: more-checkable
priority: 1
---

## Why now

Round 145 (build, disclosure-map merged tree, PR #104) needed a review before its
delegated Origin could merge. Two separate review sessions were dispatched and both
died mid-verification without writing an artifact:

- 12:05–13:20Z, session `ses_ff5892ccc` ("Round 145 disclosure-map merged-tree
  review"), 137k output tokens — its log ends: "A concurrent process is actively
  working — a new commit d818f92 just landed on origin/main and something checked
  out main again. Let me investigate."
- 15:57–16:52Z, session `ses_ff4b5361` ("Round 145 PR review: disclosure-map merged
  tree"), 102k output tokens — its transcript ends mid-verification of the CI
  merge-ref edge case.

Both transcripts record the same event, repeatedly: "HEAD moved to `main` during my
session", "The branch got switched back to `main` — a concurrent process is active",
each followed by the reviewer restoring `git checkout loop/build/disclosure-map-merged-tree`
and trying again. A third dispatch was aborted before launch.

## The mechanism

`scripts/orchestrate.sh` starts every iteration with:

```
git checkout main --quiet 2>/dev/null || note "warning: could not check out main"
git pull --ff-only --quiet 2>/dev/null || note "warning: could not fast-forward main"
```

(line 266-267). Review sessions are dispatched as nested `opencode run` processes
from inside an orchestrator iteration and work in the same checkout on the round
branch. The supervisor considers the iteration "completed" when the orchestrator's
client exits — but the nested review session keeps running, attached to the server.
The next iteration then checks out `main` and pulls, switching the working tree and
branch ref out from under the still-working reviewer. Nothing mechanical prevents it:
the supervisor watches session liveness, not who is using the checkout.

The round's own changelog entry was verified independently after the fact (review
artifact `docket/reviews/c7e0214e8843587716c470832883efa4768d94e7.md`); the fix was
sound. The reviews died before they could say so.

## Evidence

All 2026-08-16, this repository and the loop logs under
`~/.addictedtoai-loop-logs/`:

- `orchestrator-20260816T112420Z.log` — the dispatching iteration; its tail shows the
  brief being written and "Dispatching the review session now." followed by
  `Error: Aborted` when the supervisor's hard timeout killed it at 12:54:23Z
  (`supervisor.log`: "iteration exceeded hard timeout of 5400s -- stopping it").
- `C:/Users/BadBitch/AppData/Local/Temp/opencode/review-145.log` and
  `review145.json` — first review session transcript; branch-switch events at the
  end of the log.
- `C:/Users/BadBitch/AppData/Local/Temp/opencode/review145b.json` — second review
  session transcript; same branch-switch events, ends with `"finish":"unknown"`.
- `supervisor.log` lines `git checkout main` + `git pull` at each iteration start
  (orchestrate.sh lines 266-267), including 12:56:06Z and 13:01:21Z — the iterations
  that killed the first review — and 16:01:30Z/16:13:25Z for the second.

## The fix path

`scripts/orchestrate.sh` and `scripts/orchestrate-liveness.sh` are inside meta's
scope (`scripts/` is the first path in meta's scope list in
`scripts/check-track-scope.mjs`). A meta round can fix the supervisor directly:
the change is a loop branch named `loop/meta/<slug>`, and it does not touch any
human-owned path. The `human-owned-paths` guard does not apply to `scripts/`
itself — only to `CHARTER.md`, `.github/`, `prompts/` and
`scripts/check-track-scope.mjs`. The likely fix shapes: do not `git checkout
main` / `git pull` at iteration start while any session for this project is
still advancing; or dispatch review sessions into a clone the supervisor never
touches. A correction round for this item must also fix the dead supervisor.pid
(still 53242 from a process that was replaced), because the supervisor is stopped
and a stale pid is how a future supervisor's own liveness bookkeeping goes wrong.

## Done when

- [x] A review session can run to completion in the shared checkout without its
      branch being switched underneath it — either the supervisor does not check
      out `main` while any session for this project is still advancing, or review
      sessions run in a clone the supervisor never touches
- [x] The record shows which review sessions were killed by this and that the
      round they were reviewing was eventually reviewed and merged (round 145,
      PR #104, merged 2026-08-16T18:16:31Z, merge commit 253ade4)
- [x] A check or convention makes a branch switch while another session is
      advancing visible rather than silent — the reviewers saw it but had no way
      to stop it, and the supervisor never knew it was the cause

## Closed

Round 146 (meta, PR #107) chose Shape A with launch-time attribution and a hard
bound: `wait_for_checkout_free` in `scripts/orchestrate-liveness.sh` defers the
iteration-start checkout while sessions created after the supervisor's own
launch are still advancing, bounded at 3600s with the overrun noted loudly in
`supervisor.log`; sessions that predate the launch (the maintainer's, the
supervising model's, an orchestrator session that outlived its iteration) never
block it. Proved in both directions and both boundaries against a stub session
API (`scripts/test-orchestrate-checkout.mjs`), including the two mutation runs
(attribution removed; bound removed) that made the test fail. The dead
`supervisor.pid` (53242) mentioned in the fix path lives outside the repository
in the loop-log directory and was left to the orchestrator, not this round.
