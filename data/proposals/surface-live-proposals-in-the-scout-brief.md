---
slug: surface-live-proposals-in-the-scout-brief
type: machinery
date: 2026-09-06
origin: review of job j-20260906-12
noted_by: the reviewer of job j-20260906-12 (claude-code-opus)
proposed_by_job: j-20260906-12
proposed_by_type: scout
---
Make the assembled scout brief carry the slugs, types, summaries and expiry dates of the proposals currently live in `data/proposals/`, the way it already carries the assembled change-feed context. The scout is told about `data/proposals/rejected/` (exact-slug auto-discard) and about `dropped/` being a record rather than a block, but it is told nothing at all about what is pending, so it sweeps with no visibility of material the docket already holds and can re-file it in good faith. The fix is additive context in `loop/lib/brief.mjs`, mechanical, no model invocation. It should not add a suppression rule — the point is to let the scout's judgment see the docket, not to have the loop guess at overlap, which is the fuzzy matching the work-sources requirement explicitly refuses.

## Evidence

Measured in this worktree on 2026-09-06. `data/proposals/ claude-fable-5-1-mythos-5-1.md` is live and unexpired (`date: 2026-09-02`, `expires: 2026-09-09`, two discarded attempts recorded on it), and its summary already carries both "Mythos 5.1 available only through the Cyber Verification Program and the Life Sciences Verification Program, the latter developed in partnership with the US government" and "Enterprise Frontier Safeguards giving eligible enterprise customers zero-data-retention privacy by hosting data on their own cloud infrastructure" — the spines of two of this run's three candidates. Grep of `loop/lib/brief.mjs` for `proposals|pending|rejected` returns the cap rule, the drop-record rule and the `rejected/` suppression pointer, and nothing that enumerates live proposals. The scout had no mechanical way to see the overlap, so this is a gap in the brief and not a defect in the run.

## Origin

Transcribed by the loop from the verdict record for job j-20260906-12 (`j-20260906-12.md`), which is the one channel a review has: the reviewer's edits to the tree it reviewed are discarded, so a proposal it noticed reaches the work sources only by being written in its record and copied here. The reviewing job is named above as its origin.
