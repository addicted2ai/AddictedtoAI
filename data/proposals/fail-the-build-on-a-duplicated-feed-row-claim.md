---
slug: fail-the-build-on-a-duplicated-feed-row-claim
type: machinery
date: 2026-09-06
origin: review of job j-20260906-01
noted_by: the reviewer of job j-20260906-01 (claude-code-opus)
proposed_by_job: j-20260906-01
proposed_by_type: entry
---
`feedRowIndex` in `lib/changes.mjs` builds a `${source}|${rowId}` -> doc map with a bare `index.set()` and no duplicate guard, so two entries declaring the same source row id collapse to one silently, and which one survives is decided by corpus iteration order. Every other declared join in this repo fails the build when it is ambiguous — a duplicate id, an exclusive alias collision, a `corroborates` naming nothing. This one does not, and the failure it produces is invisible: the changed feed attributes a price or context move to whichever entry happened to be loaded last. The job is to make a second claim on one row id a build error naming both files, the source and the row id, with a test that asserts red-before/green-after.

## Evidence

Measured 2026-09-06 by running `feedRowIndex` from `D:/AddictedtoAI/lib/ changes.mjs` against two docs both declaring `openrouter-models: bytedance-seed/seed-2-1-turbo`. Passing them model-first printed `row owned by: org/bytedance-seed`; passing the same two docs org-first printed `row owned by: model/bytedance-seed-seed-2-1-turbo`. Index size was 1 in both orders. The reviewed job's brief instructed the author to declare a `feeds` map on this org entry, whose six catalog rows are already claimed by the six `content/wiki/model/bytedance-seed-*.md` entries — so following the brief would have created exactly this collision, and nothing would have reported it.

## Origin

Transcribed by the loop from the verdict record for job j-20260906-01 (`j-20260906-01.md`), which is the one channel a review has: the reviewer's edits to the tree it reviewed are discarded, so a proposal it noticed reaches the work sources only by being written in its record and copied here. The reviewing job is named above as its origin.
