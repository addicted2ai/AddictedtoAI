---
slug: recompute-the-review-diff-for-each-pass
type: machinery
date: 2026-09-05
origin: review of job j-20260905-13
noted_by: the reviewer of job j-20260905-13 (claude-code-opus)
proposed_by_job: j-20260905-13
proposed_by_type: repair
---
`loop/run.mjs` computes the reviewed diff once, at line 412, BEFORE the `for(;;)` review loop it is used inside, and never recomputes it. A revision pass commits to the branch from within that loop, so the pass-2 reviewer is handed the pass-1 diff — the author's revision is invisible in the one artefact the brief calls authoritative ("The loop computed this diff itself from the branch state"). Move the `diffAgainst` call inside the loop, or recompute it before each `runReview`. The fix is one line and the failure it prevents is total: a delta reviewer who trusts the embedded diff re-issues findings against text that no longer exists, the verdict is a second non-approval, and `pass >= 2` discards the whole job.

## Evidence

Measured on this review's own brief, 2026-09-05. The brief states the diff "was computed from" commit 4319f60a11ee; its `google-deepmind.md` hunk is `730ffae`'s, still containing the by-effort sentence that 4319f60 exists to remove. `git diff --stat 730ffae 4319f60` reports 2 files changed, 12 insertions, 11 deletions — none of it present in the embedded diff. The cause is visible in the source: `loop/run.mjs:412` `const diffText = diffAgainst(ctx.repoRoot, base, branch);` sits above `let pass = 1;` and the `for(;;)` at line 415, while `runReview(..., diffText, ...)` is called at line 431 inside it. The same loop already knows the branch moves — the merge gate at line 455 re-reads it, commented "a revision pass can add a file after the author run, and the gate must compare the record against what is actually about to merge" (lines 451-454). The diff was not given the same treatment. Also inconsistent, and the tell that first exposed it: the header's gate-commit and spend figures ARE interpolated fresh, so the brief reports a PASS on 4319f60 beside a diff of 730ffae.

## Origin

Transcribed by the loop from the verdict record for job j-20260905-13 (`j-20260905-13.pass2.md`), which is the one channel a review has: the reviewer's edits to the tree it reviewed are discarded, so a proposal it noticed reaches the work sources only by being written in its record and copied here. The reviewing job is named above as its origin.
