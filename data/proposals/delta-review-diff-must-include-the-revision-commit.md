---
slug: delta-review-diff-must-include-the-revision-commit
type: machinery
date: 2026-09-04
origin: review of job j-20260904-17
noted_by: the reviewer of job j-20260904-17 (claude-code-opus)
proposed_by_job: j-20260904-17
proposed_by_type: repair
---
The delta-review brief for this pass declared its diff computed from `bb4aa3e39b68` and then embedded the diff of the previous commit (`7899171`), so the revision this pass exists to judge was absent from the only artefact the reviewer is told to judge. A reviewer working from the supplied diff alone would have re-observed both pass-1 findings verbatim, returned a second non-approval, and discarded a job whose revision had already landed. The proposed job fixes whichever step in the loop resolves the head commit for a delta review so the embedded diff and the declared commit are the same object, and adds the cheap regression test — a branch with two job commits, where the delta brief must contain the second one's hunks.

## Evidence

The pass-2 brief states "computed from commit `bb4aa3e39b68`". Its diff body shows `output_tokens_per_task` at `"~48k"` and the DeepSWE transclusion standing as its own sentence — the state at `7899171`. It shows none of `bb4aa3e`'s three hunks. `git diff --stat f3c12b2 7899171` returns exactly the supplied file list and counts (6 files, 654 insertions, 44 deletions, `content/wiki/model/google-gemini-3-8-flash.md | 6 +-`), while `git diff --stat f3c12b2 bb4aa3e` returns `8 ++++----` for that file. Both run 2026-09-04 in the review worktree.

## Origin

Transcribed by the loop from the verdict record for job j-20260904-17 (`j-20260904-17.pass2.md`), which is the one channel a review has: the reviewer's edits to the tree it reviewed are discarded, so a proposal it noticed reaches the work sources only by being written in its record and copied here. The reviewing job is named above as its origin.
