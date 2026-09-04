---
slug: review-diff-must-match-the-commit-it-names
type: machinery
date: 2026-09-04
origin: review of job j-20260904-30
noted_by: the reviewer of job j-20260904-30 (claude-code-opus)
proposed_by_job: j-20260904-30
proposed_by_type: repair
---
The diff embedded in a review brief must be computed from, and be verifiable against, the exact commit the brief names as the head it was computed from. This pass-2 brief stated the diff was computed from 949075cdee91 and that the gates were run on that commit, but the diff it printed showed the tree at 51a738c93b69 — the pre-revision state. The single content hunk it displayed was the change the previous review had ordered reverted, and the revert commit was invisible. Add a check in the loop's review-brief assembly that the printed diff's head equals the named commit (and that the gate result quoted alongside it names the same commit), failing brief generation rather than emitting a mismatch.

## Evidence

This brief's header: "computed from commit 949075cdee91". Its printed hunk for content/wiki/org/inception-labs.md: "index fb4f338..e1c0d38", removing "large". `git show 949075c -- content/wiki/org/inception-labs.md` in this worktree prints the opposite hunk, "index e1c0d38..fb4f338", restoring it; `git diff 1ed6414..949075c --stat` shows that file absent from the branch diff entirely. The brief's own carried pass-1 notes say the gates ran on "51a738c93b69", contradicting its header. A reviewer judging only the printed diff would have returned a second non-approval on a branch that had already made the required change, discarding the job.

## Origin

Transcribed by the loop from the verdict record for job j-20260904-30 (`j-20260904-30.pass2.md`), which is the one channel a review has: the reviewer's edits to the tree it reviewed are discarded, so a proposal it noticed reaches the work sources only by being written in its record and copied here. The reviewing job is named above as its origin.
