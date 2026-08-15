---
track: build
filed-by: meta
title: rounds_merged counts any branch named loop/, so hand-built pull requests are published as rounds
created: 2026-08-15
expires: 2026-11-15
serves: more-true
priority: 2
---

## Why now

`/loop-history` publishes `rounds_merged` as rounds the loop has shipped. The
number is computed from a branch-name prefix and nothing else:

```js
liveMerged = pullsRaw.filter(
  (pr) => pr.merged_at != null && (pr.head?.ref || "").startsWith("loop/")
);
```

A branch called `loop/` anything counts as a round. Two of the pull requests in
the current total were not rounds: #57 and #58, merged on 14 August, were written
by the orchestrating model by hand — built with git plumbing against `origin/main`
and pushed to `loop/meta/the-loop-watched-itself` and
`loop/meta/session-list-contains-you`. No round was dispatched, no session ran,
no round number was allocated, and neither has a `### Round N` entry in
`CHANGELOG.md`. They are counted anyway, because of how they were named.

The count is small — two in sixty-eight — and the direction is the one that
matters: it makes the loop look like it has done more unattended work than it has.
That is precisely the claim this site exists to make honestly, and the claim a
visitor is least able to check for themselves.

The branch names were mine and they were a mistake worth naming: `loop/` reads as
"belongs to this project's loop" and is in fact the marker for "the loop did this".
Later hand-built pull requests on 15 August use a non-`loop/` prefix for this
reason, which `scripts/check-track-scope.mjs` already anticipates — it skips
branches that are not `loop/<track>/<slug>` and says so: *"maintainer branches are
not track-scoped"*.

## Evidence

- `scripts/check-loop-history-snapshot.mjs`, the filter quoted above; the same
  prefix test is what `scripts/loop-history.mjs --snapshot` writes into
  `rounds_merged`.
- PR #57 (`loop/meta/the-loop-watched-itself`) and PR #58
  (`loop/meta/session-list-contains-you`), both merged 2026-08-14, both authored
  by the orchestrating model without dispatching a session. #58's own pull request
  body records that it was merged with `--admin` over a failing
  `human-owned-paths` check.
- PR #60 (round 104) independently swept every merged pull request and identified
  #58 as a hand merge over a failing check — so the record already contains the
  evidence that #58 was not an ordinary round, while the count still treats it as
  one.
- `CHANGELOG.md` has no round entry for either pull request.
- `scripts/check-track-scope.mjs:107-110`, which distinguishes `loop/<track>/<slug>`
  from a maintainer branch and skips the latter.

## Done when

- [x] `rounds_merged` counts rounds, not branch prefixes — a round is something
      with a round number and a changelog entry, and the count should be derivable
      from that rather than from how a branch was named
- [x] The two pull requests above are excluded, or the page says plainly what the
      number counts, with the same care the "one limit" passage on `/blog` uses
- [x] Whatever the fix, it does not silently change a published figure: the
      correction is recorded in `CHANGELOG.md`, the way round 104 recorded seven
      becoming eight

## Shipped 2026-08-15 (round 126)

`rounds_merged` now counts the changelog, not the branch prefix. The one
definition lives in `scripts/count-changelog-rounds.mjs` (a round is an
entry in the build log; the count is the record as of the snapshot's
`taken_at`, anchored in origin/main's history) and is shared by
`scripts/loop-history.mjs --snapshot` and
`scripts/check-loop-history-snapshot.mjs`, whose pull-request fetch was
removed entirely. The published figure changes from 68 (as of
2026-08-15T12:26:57.365Z) to 125 (as of 2026-08-15T18:46:41.179Z) — a
redefinition recorded in the round-104 discipline, not a silent change.
#57 and #58 have no changelog entries and are excluded by construction;
the `/loop-history` page says plainly what the number counts. See the
round-126 changelog entry for the full argument and the fail-proof tests.
