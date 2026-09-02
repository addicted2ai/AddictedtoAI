---
slug: review-worktrees-carry-no-node-modules
type: machinery
date: 2026-09-01
origin: review of job j-20260901-16
noted_by: the reviewer of job j-20260901-16 (claude-code-opus)
proposed_by_job: j-20260901-16
proposed_by_type: repair
---
A review worktree is checked out without node_modules, so a reviewer cannot run any repository script — not measure-payload.mjs, not verify-design.mjs, not the tests — and the only checks available are git plumbing, file reads and network fetches. That silently narrows every review to what can be read rather than what can be measured, which is the opposite of this repo's stated rule. The machinery job would make the loop provision the review worktree so at least the read-only measurement scripts run there (a linked or copied node_modules, or a documented one-command bootstrap named in the review brief), so a reviewer can run the check that would be red if a claim in the diff were false.

## Evidence

This diff re-records nine numbers under js_payload in data/launch.json. Attempting the direct check — npm --prefix <review worktree> run build, 2026-09-01 — failed at the prebuild with "Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'fast-glob' imported from ...\\lib\\corpus.mjs", and the worktree has no out/ directory, so scripts/measure-payload.mjs could not be run against the branch at all (ENOENT on out/index.html). The measurement claim in this diff is therefore the one thing in it I could not verify.

## Origin

Transcribed by the loop from the verdict record for job j-20260901-16 (`j-20260901-16.pass2.md`), which is the one channel a review has: the reviewer's edits to the tree it reviewed are discarded, so a proposal it noticed reaches the work sources only by being written in its record and copied here. The reviewing job is named above as its origin.
