---
slug: beads-child-issue-ids-fail-the-declared-issue-join
type: machinery
date: 2026-09-04
origin: review of job j-20260904-53
noted_by: the reviewer of job j-20260904-53 (claude-code-opus)
proposed_by_job: j-20260904-53
proposed_by_type: repair
---
`loop/lib/issues.mjs`'s `ISSUE_ID_RE` is `/^addictedtoai-[a-z0-9]{2,32}$/`, which cannot match a beads CHILD id — the dot in `addictedtoai-vqp7.1` is outside the character class. Because `readProposals` treats a declared `issue:` that fails the format check as MALFORMED and skips the whole proposal (loop/lib/proposals.mjs:229-241), a proposal whose issue happens to be a child issue must either drop the join or be silently removed from the work sources. That is a guardrail that reads as present and, for one whole class of real ids, refuses the correct value. The proposed job widens the format to admit beads' `<parent>.<n>` suffix (and whatever `bd` mints for deeper nesting), adds the child form to `loop/tests/issues.test.mjs`, and checks `scripts/verify-issue-links.mjs` resolves it against the store. The header's own reasoning already argues for this direction: "a format check that rejected a real id would be worse than one that accepts a string beads would never mint".

## Evidence

Measured 2026-09-04 against this worktree's own modules: `isIssueId('addictedtoai-vqp7.1')` returns `false` while `isIssueId('addictedtoai-vqp7')` returns `true`, and `declaredIssueIds('addictedtoai-vqp7.1')` returns `{"present":true,"ids":[],"malformed":["addictedtoai-vqp7.1"]}`. `addictedtoai-vqp7.1` is a real, `bd show`-able issue — it is the very issue this job filed. The proposal under review names it in prose only and declares no `issue:` field, which is the only way it could stay selectable.

## Origin

Transcribed by the loop from the verdict record for job j-20260904-53 (`j-20260904-53.md`), which is the one channel a review has: the reviewer's edits to the tree it reviewed are discarded, so a proposal it noticed reaches the work sources only by being written in its record and copied here. The reviewing job is named above as its origin.
