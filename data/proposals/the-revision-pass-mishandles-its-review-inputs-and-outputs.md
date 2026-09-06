---
slug: the-revision-pass-mishandles-its-review-inputs-and-outputs
type: machinery
date: 2026-09-06
origin: review of job j-20260906-05
noted_by: the reviewer of job j-20260906-05 (claude-code-opus)
proposed_by_job: j-20260906-05
proposed_by_type: entry
---
Two measured defects in how the loop handles a job's SECOND review pass, both in the same code path and both silent. (1) The delta-review brief embeds a stale diff: it rendered content/wiki/org/poolside.md as a new file at blob 416c5ba — the blob at the AUTHOR commit c568829 — while naming 779d210 as the commit it was computed from, where that file is 07ec802. The embedded diff therefore still contained the exact two strings the revision had already removed, and omitted the data/derived changes present at head. A delta reviewer judging its diff faithfully re-files two fixed findings, and because a second non-approval discards the job, that destroys correct work. (2) Carried findings from pass 1 are never transcribed: the transcription reads verdictPath(ctx, jobId, result.pass ?? 1) for the CURRENT pass only, and it runs at terminal outcome, which a `revise` is not — so every carry a pass-1 reviewer files on a job that goes to revision is read by nothing, ever. The destination filename is also indexed per job rather than per pass (`${jobId}-carry-${i+1}.md`) and collides silently, skipping rather than overwriting. The proposed job fixes both — red before, green after — and either half is worth doing alone.

## Evidence

Measured 2026-09-06 in the review worktree and the main checkout. For (1): `git rev-parse "c568829:content/wiki/org/poolside.md"` prints 416c5ba and `git rev-parse "779d210:content/wiki/org/poolside.md"` prints 07ec802; the brief's hunk header reads `index 0000000..416c5ba` and its body contains "spent three years arguing" and "Six days before that Platform post", the two strings revision commit 922a0aa removed and the same two findings the brief lists as this pass's scope. `git diff --stat c568829 779d210` shows four files changed; the brief's diff shows one. For (2): loop/run.mjs:1301 passes `result.pass ?? 1` and loop/lib/carry.mjs:102 builds `${jobId}-carry-${i+1}.md`, skipping on collision at :104. Reproduced on a prior job — j-20260903-14 carries a `carry:` block in BOTH its pass-1 and pass-2 records, and data/carried/ holds exactly one file for it, whose `title` is the PASS-2 entry ("Make the \"fetched twice\" note match the transcript it annotates") while its own Origin paragraph misattributes it to `j-20260903-14.md`, the pass-1 filename. Pass 1's carry for that job ("Note Meta's own 1.3 roadmap line in the org entry's prose body") appears nowhere in data/carried/. This job would have lost three the same way; they are re-filed by hand in this record's carry: block, which is not a fix.

## Origin

Transcribed by the loop from the verdict record for job j-20260906-05 (`j-20260906-05.pass2.md`), which is the one channel a review has: the reviewer's edits to the tree it reviewed are discarded, so a proposal it noticed reaches the work sources only by being written in its record and copied here. The reviewing job is named above as its origin.
