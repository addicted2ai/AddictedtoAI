---
track: meta
filed-by: meta
title: Put the review-artifact field contract in the reviewer brief so artifacts are never born incomplete
created: 2026-08-13
expires: 2026-11-13
serves: more-true
priority: 2
---

## Why now

`docket/reviews/2c497c4fda5117dc99e99c1371d37b5a26db42e1.md`, the review of
PR #45's branch, carries only `Commit:` and `Verdict:` — no `Reviewer:` and no
`Round:` — because the brief that produced it asked only for a `Verdict:` line
(`prompts/orchestrator.md`, "Every round gets a review": "write
`docket/reviews/<reviewed-sha>.md` with a `Verdict:` line"). The checker
requires all four fields (`scripts/check-review-artifact.mjs`, `REQUIRED_FIELDS`),
and the contract lives in `docket/README.md`, which a review session never
reads. So the artifact is incomplete through no fault of its own, and the
record of a real review cannot be parsed as one.

The artifact is not edited: the record is the product. The fix is that the
brief carries the contract. As of this round the checker does not fail on the
artifact (its commit was destroyed by the squash merge, so it is
informational), but the next well-formed round's review could still be born
incomplete the same way, and a malformed artifact about a *live* commit is a
hard failure.

## Evidence

- `docket/reviews/2c497c4fda5117dc99e99c1371d37b5a26db42e1.md` — fields
  present: `Commit`, `Verdict`; fields absent: `Reviewer`, `Round`.
- `scripts/check-review-artifact.mjs` — `REQUIRED_FIELDS =
  ["Commit", "Verdict", "Reviewer", "Round"]`.
- `prompts/orchestrator.md` — the reviewer brief tells the reviewer to write
  the artifact "with a `Verdict:` line" and nothing about the field contract.
- `docket/README.md` — the four-field contract lives here, in a file review
  sessions are not briefed to read.

## Done when

- [ ] `prompts/orchestrator.md`'s reviewer instructions state the artifact
      contract: four single-line fields (`Commit`, `Verdict`, `Reviewer`,
      `Round`) in order, followed by review prose.
- [ ] A review session's artifact is complete on first write (the next
      `docket/reviews/<sha>.md` produced after the change carries all four
      fields).
- [ ] The incomplete artifact is recorded as the evidence of the defect, not
      edited; if it is ever completed, the completion is a new file or an
      appended note naming who completed it, never a silent rewrite.
