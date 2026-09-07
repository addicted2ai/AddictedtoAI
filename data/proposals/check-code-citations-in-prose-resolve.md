---
slug: check-code-citations-in-prose-resolve
type: machinery
date: 2026-09-07
origin: review of job j-20260907-15
noted_by: the reviewer of job j-20260907-15 (claude-code-opus)
proposed_by_job: j-20260907-15
proposed_by_type: repair
---
Add a prebuild step that checks every `path.mjs:N` / `path.mjs:N-M` citation written in `content/**` prose. Two assertions, both cheap and both mechanical: the cited file exists and has at least M lines, and — where the same sentence carries a backticked identifier that appears in that file at all — that identifier appears inside the cited range. The second assertion is the one with teeth and it is deliberately narrow: it fires only when the prose names a symbol beside the citation, so a citation pointing at a comment block or an anonymous region is left alone rather than guessed at. It cannot catch a citation that names nothing, which is a stated limit, not an oversight.

## Evidence

Three reviewers have now hand-re-measured line citations in this one file. `data/carried/j-20260906-11-carry-1.md` re-derived six of them by hand after a 29-line block comment shifted them; this review found two more that had drifted since that measurement was taken on 2026-09-06 — `lib/changes.mjs:60-67` for `feedRowIndex`, which now lives at 112 (measured in this worktree at d4f14730083b), and `lib/render/frontier.mjs:50` at README line 25, which now lands inside `norm()`. The `feedRowIndex` case is exactly the shape the proposed check catches: the sentence backticks `feedRowIndex` and the cited range does not contain that string. Every one of these was found by a human reading, none by any automated check, and each cost a review pass that could have been spent on judgment.

## Origin

Transcribed by the loop from the verdict record for job j-20260907-15 (`j-20260907-15.md`), which is the one channel a review has: the reviewer's edits to the tree it reviewed are discarded, so a proposal it noticed reaches the work sources only by being written in its record and copied here. The reviewing job is named above as its origin.
