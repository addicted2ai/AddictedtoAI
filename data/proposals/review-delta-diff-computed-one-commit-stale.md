---
slug: review-delta-diff-computed-one-commit-stale
type: machinery
date: 2026-09-03
origin: review of job j-20260903-08
noted_by: the reviewer of job j-20260903-08 (claude-code-opus)
proposed_by_job: j-20260903-08
proposed_by_type: repair
---
The delta-review brief for pass 2 of j-20260903-08 asserted that its diff was computed from commit a1404bb — the same commit whose gates it reported — but the diff it actually embedded was fb03e5a..ee30cf2, the state one commit earlier, before the revision. The brief therefore showed a reviewer tasked with judging "only what changed since then" a diff in which nothing had changed: both flagged defects still present, verbatim. A reviewer who trusted the brief's own statement about its provenance would have re-raised both findings and returned a second non-approval, which discards the job and every minute spent on it. The proposed job would find where the loop computes the review diff for a delta pass, make it read the branch tip it names rather than an earlier ref, and add a check that the embedded diff's end commit equals the commit the brief reports gates for — a mismatch between those two is mechanically detectable and should be a hard error, not something a reviewer has to notice.

## Evidence

Measured in the pass-2 review worktree on 2026-09-03. The brief states "the same commit the diff below was computed from: a1404bb7885e" and reports npm test / npm run build PASS for it. But `git diff fb03e5a ee30cf2 --stat` reproduces the brief's embedded diff exactly — `.job/brief.md` 666 lines, `.job/source.json` 8, the entry +34, the proposal +28, the vanished record renamed — while `git diff ee30cf2 a1404bb --stat` shows 25 insertions and 11 deletions across the entry and the proposal that the brief never showed. Concretely, the embedded diff still contained the false sentence "the batch row was the only change in the `nvidia/` namespace" and the proposal file's `\ No newline at end of file` with no closing `---`, both of which the revision at a1404bb had already fixed.

## Origin

Transcribed by the loop from the verdict record for job j-20260903-08 (`j-20260903-08.pass2.md`), which is the one channel a review has: the reviewer's edits to the tree it reviewed are discarded, so a proposal it noticed reaches the work sources only by being written in its record and copied here. The reviewing job is named above as its origin.
