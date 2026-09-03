---
slug: delta-review-diff-recomputed-from-branch-head
type: machinery
date: 2026-09-02
origin: review of job j-20260902-24
noted_by: the reviewer of job j-20260902-24 (claude-code-opus)
proposed_by_job: j-20260902-24
proposed_by_type: entry
---
A machinery job to make the delta-review brief's "diff under review" a diff of the branch's current HEAD, not the diff that the previous review pass was given. On this job the pass-2 brief embedded the pre-revision diff: it still showed the two P50 figures, the moved quotation mark and the doubled `introductory_pricing_ends` value that the revision had already fixed, so a reviewer who judged the embedded diff rather than opening the worktree would have re-raised three findings that no longer exist and discarded the job on its last pass. The fix is to recompute the diff at review time from the branch head (and, if a delta review wants a narrower view, to diff the previous review's commit against the head rather than reusing the earlier payload), plus a check that the brief's diff blob ids match the branch.

## Evidence

Observed 2026-09-02 in the pass-2 brief for j-20260902-24. The embedded diff ends at blob d231d33 for content/wiki/model/inception-mercury-2-5-preview.md ("index bf0ee09..d231d33"), which is the blob at commit e949896 (the original entry). The branch head the brief itself names as reviewed, d56d8db04529, holds blob 2793b10 for that path — verified with `git rev-parse e949896:<path> d56d8db:<path> HEAD`, which printed d231d33db491..., 2793b1095dd2... and d56d8db04529... respectively. The revision commits 75951c6 and d56d8db are absent from the embedded diff entirely, including the derived-file updates they carry.

## Origin

Transcribed by the loop from the verdict record for job j-20260902-24 (`j-20260902-24.pass2.md`), which is the one channel a review has: the reviewer's edits to the tree it reviewed are discarded, so a proposal it noticed reaches the work sources only by being written in its record and copied here. The reviewing job is named above as its origin.
