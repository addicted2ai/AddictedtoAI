---
slug: delta-review-brief-embeds-pre-revision-diff
type: machinery
date: 2026-09-01
origin: review of job j-20260901-05
noted_by: the reviewer of job j-20260901-05 (claude-code-opus)
proposed_by_job: j-20260901-05
proposed_by_type: repair
---
The pass-2 delta-review brief for this job stated that the diff under review was "computed from the branch state" on commit ed7b7d76cacf, but the diff it embedded was in fact main..2cb0d029110f — the pre-revision commit the first review had already rejected. A machinery job should find where the loop assembles a delta-review brief and make the embedded diff be computed from the SHA the brief names, with a check that fails loudly if the two disagree.

## Evidence

Measured in this review. `git diff --stat main 2cb0d02` prints exactly the four files the brief embedded (.job/brief.md 689, .job/source.json 8, content/wiki/model/mistralai-mistral-medium-3-1-batch.md 34, data/derived/search-index.json 2). `git diff --stat main ed7b7d7` prints seven files, adding data/derived/feed-rows.json, freshness.json and queue.json — the three files the revision commit was asked for and did commit. A reviewer working from the embedded diff alone would have seen the unrevised tree, re-issued the identical revision finding, and discarded the job on its last pass. The failure mode is silent and costs a whole job.

**Recurred 2026-09-02, on job j-20260902-08's delta review.** Same shape, same silence. The brief's gates section said the loop's gates ran "on commit `d29ae884daf0` — the same commit the diff below was computed from" (that sentence is assembled by `loop/lib/review.mjs`), but the embedded diff was the pre-revision range: its fast-page hunk carries `index 55869ad..9b7b984`, which `git diff 94dc6c3 00ecc2e` reproduces exactly — the pass-1 text review 1 rejected ("Anyone re-running this check should note how the record reads") — while `git diff 00ecc2e d29ae88`, the revision that replaced that text, is absent: the range stops one commit short of the SHA the brief named. The delta reviewer caught it ("The diff in my brief is **not** the branch state", `data/reviews/j-20260902-08.pass2.md`) and judged the tree instead, so the job survived — the "re-issue the identical revision finding, and discard the job on its last pass" outcome is now a near-miss observed twice in two days, not a hypothetical. The machinery is unchanged: `loop/run.mjs` computes the review diff once, before the revision pass, and the delta review reuses that text while the gates section claims it was computed from the branch's new head. Unfixed, it has now nearly cost two jobs.

## Origin

Transcribed by the loop from the verdict record for job j-20260901-05 (`j-20260901-05.pass2.md`), which is the one channel a review has: the reviewer's edits to the tree it reviewed are discarded, so a proposal it noticed reaches the work sources only by being written in its record and copied here. The reviewing job is named above as its origin.
