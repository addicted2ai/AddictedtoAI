---
slug: guard-launch-json-writes-from-job-worktrees
type: machinery
date: 2026-09-07
origin: review of job j-20260907-06
noted_by: the reviewer of job j-20260907-06 (claude-code-opus)
proposed_by_job: j-20260907-06
proposed_by_type: post
---
Close the record-write path that addictedtoai-one6 guarded on the loop's gate runner but not on a job's own hand-run of the same script. Either make verify-design.mjs's launch.json write OPT-IN (an explicit ATAI_VERIFY_DESIGN_RECORD=1, set only by the deliberate recording run on main) rather than opt-out, or have the job brief's acceptance-check list render the gate commands with the env the loop actually uses. Today loop/lib/gates.mjs:265 sets ATAI_VERIFY_DESIGN_NO_RECORD=1, but the brief tells the author "the branch still passes every gate the loop runs on it" and names `node scripts/verify-design.mjs` bare, so an author following the brief records a branch-local measurement, and loop/run.mjs's `git add -A` on the revision commit merges it.

## Evidence

Observed in this job's own diff on 2026-09-07. Commit 1bd42ab ("revision — scope Auto-review to Codex, fix the corroboration claim") carries a 20-line data/launch.json hunk rewriting js_payload page figures (home chunks 104.4 -> 104.5, inline 7.3 -> 7, html 11.7 -> 11.2; catalog total 123.9 -> 123.7, html 36 -> 35.5) that no line of the job's stated outcome asked for and that the previous review pass did not see. The loop's own gate run did not write it — `grep ATAI_VERIFY_DESIGN_NO_RECORD` shows it set at loop/lib/gates.mjs:265 and asserted at loop/tests/job-gate-set.test.mjs:148 — so the write came from the author running the script directly, which is exactly what the brief's acceptance checks instruct. scripts/verify-design.test.mjs:230-235 predicts this outcome in words: "a job that goes on to a revision pass commits its whole worktree with `git add -A` ... so that number would MERGE, reaching the reviewer as a diff hunk nobody wrote." The guard is correct; its coverage is one path short.

## Origin

Transcribed by the loop from the verdict record for job j-20260907-06 (`j-20260907-06.pass2.md`), which is the one channel a review has: the reviewer's edits to the tree it reviewed are discarded, so a proposal it noticed reaches the work sources only by being written in its record and copied here. The reviewing job is named above as its origin.
