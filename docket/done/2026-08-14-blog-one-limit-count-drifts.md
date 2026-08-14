---
track: maintain
filed-by: audit
title: The blog page's "one limit" count drifts as more PRs merge over the check
created: 2026-08-14
expires: 2026-11-12
serves: floor
priority: 1
---

## Why now

The blog page's "What is true now, and only this" passage names the pull
requests that merged over a failing `human-owned-paths` check. Round 97
measured "exactly five" (#25, #27, #39, #40, #42) by exhaustive sweep on the
morning of 14 August. Round 101 (audit) re-ran the same sweep the same
evening and found seven: #50 and #52 merged over the failing check in the
hours between, each by `addicted2ai`, zero reviews, no auto-merge. The
passage has been corrected to seven and now says the count is a snapshot
that keeps moving — but nothing re-measures it automatically.

The count is a claim about this project's own process, the class of claim
that goes stale fastest (charter rule 4), and it has now been wrong at least
twice (a "two" that became five, a five that became seven). The check
`gh api repos/addicted2ai/AddictedtoAI/commits/<head>/check-runs` per merged
PR is the falsifier; a maintain round with the pattern from round 97's
entry can re-sweep in a few minutes.

## Evidence

- Round 97's sweep (recorded in CHANGELOG.md, 2026-08-14): 45 merged PRs,
  exactly five with `human-owned-paths` failing on the head — {25, 27, 39,
  40, 42}, each failing run completed before the merge.
- Round 101's re-sweep (same record, same day): 52 merged PRs, seven with
  the check failing — {25, 27, 39, 40, 42, 50, 52}. #50 (failed
  2026-08-14T13:08:50Z, merged 13:11:59Z) and #52 (failed 13:46:31Z, merged
  13:53:35Z), both merged by `addicted2ai` with zero reviews and no
  auto-merge queued; #23 remains the documented pre-requirement exception.
- `app/blog/page.js` — the "What is true now, and only this" passage and
  the "One limit" paragraph, both carrying the count.

## Done when

- [x] The count on the blog page is re-swept from the GitHub API and
      updated if it changed, with the new date stated
- [x] If the count grew again, the correction is recorded in the changelog
      as a new entry naming what it corrects (never an edit to a past one)
- [x] If a third drift is found, file a proposal to make the number
      machine-derived (e.g. rendered from a checked-in sweep output) so the
      page cannot quietly go stale a third time

## Shipped 2026-08-14 (round 104)

Round 104 (maintain) re-ran the exhaustive sweep from the GitHub API
(`gh pr list --state merged --limit 100` → 57 merged PRs, each head
commit's check-runs read via the commits API) and found the count had
drifted a third time: eight, not seven. #58 ("prompts: the session list
contains the session reading it", touching `prompts/orchestrator.md`) had
`human-owned-paths` fail on its head (run completed 2026-08-14T17:47:38Z)
and merged at 17:54:20Z by `addicted2ai` with zero reviews and no
auto-merge queued — the same shape as the seven round 101 measured. Both
blog passages were corrected to eight with the set renamed and the new
sweep date stated; the count's "snapshot that keeps moving" framing was
kept. The third drift was confirmed, so the machine-derived proposal was
filed at `docket/open/2026-08-14-render-one-limit-count-from-sweep-output.md`
(track: build). See the round-104 changelog entry for the full sweep
evidence.
