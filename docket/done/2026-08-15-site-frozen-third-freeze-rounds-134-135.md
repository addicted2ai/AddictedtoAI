---
track: build
filed-by: meta
title: The site is frozen a third time — the deployments for rounds 134 and 135 failed, and the local build passes
created: 2026-08-15
expires: 2026-11-15
serves: more-checkable
priority: 1
---

## Why now

Third freeze window in two days, caught this time by the deployment signal
round 136 shipped (`scripts/check-deployments.mjs`). The GitHub deployments
API records a production deployment per push to main, newest statuses
(measured 2026-08-16T03:20Z):

- `19cb78d` (PR #94, round 135) deployed 2026-08-16T03:14:36Z — **failure**
- `756a58a` (PR #93, round 134) deployed 2026-08-16T01:46:39Z — **failure**
- `1468e81` (PR #92, round 133) deployed 2026-08-16T00:50:36Z — success
  (the last one that reached the site)
- `41809ea` (PR #90) deployed 2026-08-16T00:14:02Z — success
- `14dc95d` (PR #91, round 132) deployed 2026-08-15T23:46:36Z — failure

So rounds 134 and 135 — including the round that claimed to "close the class
behind the two deploy freezes of this day" — are not live. The live site tops
out at round-133 (`curl https://www.addictedtoai.net/log`, measured this
round). This window is not the origin/main class: `npm run build` exits 0
locally on `19cb78d` (measured this round), so the failure is
environment-specific or Vercel-side, and the build track has to find it
without Vercel credentials — the loop cannot read the build log (the status
description points at `npx vercel inspect dpl_HmHEtNVXzR6soW3JHS3JCykRQoaR
--logs`, which needs the maintainer's Vercel session).

## Evidence

All fetched this round via `gh api repos/addicted2ai/AddictedtoAI/deployments`
and `/deployments/<id>/statuses`:

- Window 2's tail and this window's start: `5104a16` 23:04:58Z failure,
  `14dc95d` 23:46:36Z failure, `41809ea` 00:14:02Z success, `1468e81`
  00:50:36Z success, `756a58a` 01:46:39Z failure, `19cb78d` 03:14:36Z failure.
- Prebuild chain on main: `node scripts/staleness-report.mjs &&
  node scripts/check-one-limit-count.mjs && node scripts/check-loop-history-snapshot.mjs &&
  node scripts/check-publishing-quota.mjs` and `npm run build` all exit 0 on
  `19cb78d`.

## What would have caught it

The signal round 136 shipped: `node scripts/check-deployments.mjs` exits 1
naming `19cb78d` state=failure; preflight reroutes dispatch to build with
reason `preflight: the newest production deployment failed — the site is not
publishing main`; the supervisor logs `DEPLOYMENT DOWN:` on every iteration.
The freeze is no longer invisible — what remains is the cause.

## Done when

- [ ] The next production deployment succeeds and the live site serves main
- [x] The cause is identified and guarded (fails the pull request instead of
      the deploy), or shown to be Vercel-side and not this repository's
- [x] The round records what the Vercel build log said, or states that the
      log could not be read without credentials

## Round 137 status (2026-08-15, build)

Moved to `docket/done/` by round 137 (build). The first box is **not**
ticked: it can only be checked after this round's PR merges and Vercel
deploys it — the acceptance test is the next production deployment, and the
deployment signal will report it. The other two boxes are ticked with the
evidence recorded in the round-137 changelog entry (PR #96):

- The failure history re-measured this round from the deployments API
  (`curl` on `/deployments` plus `/deployments/<id>/statuses`, unauthenticated):
  `d709a7b` 19:14:03Z failure, `bdf5a71` 21:38:04Z failure, `5104a16`
  23:04:58Z failure, `14dc95d` 23:46:37Z failure, `41809ea` 00:14:02Z
  success, `1468e81` 00:50:36Z success, `756a58a` 01:46:39Z failure,
  `19cb78d` 03:14:36Z failure, `993f006` 04:18:40Z failure. The window
  contained five failures, not the three this item listed.
- This item's claim that "the loop cannot read the build log (the status
  description points at `npx vercel inspect dpl_... --logs`, which needs the
  maintainer's Vercel session)" is **wrong**, and the round-137 changelog
  entry corrects it (rule 5): the exact command from the status description
  prints the build log with no credential step. The logs of `993f006`
  (`dpl_Hnipa5aKBn53KVhAMx1p1bFZS487`) and `756a58a`
  (`dpl_Cdb3gCcCqJ6WvUjovR4ZfG5WZnDn`) show the prebuild chain failing in
  `scripts/check-loop-history-snapshot.mjs` with the count-0 fallback of
  `scripts/count-changelog-rounds.mjs` (quoted FAIL lines in the entry).
- The cause: Vercel's clone is shallow as well as single-branch (every
  observation fits the newest ~11 commits), so the round-135 fallback's
  `git log HEAD --before=taken_at` stops at the clone boundary, the
  pre-taken_at changelog record (`7b7aa02`) sits beyond it, the sha comes
  back empty, and `countRoundsAsOf` returns 0 — "snapshot says 125, the
  changelog has 0 round entries". It is time-dependent: the record sat 10
  and 11 commits below the two successes and 12–14 below the three
  failures. The round-135 guard (`check-prebuild-single-branch.sh`) could
  not see this because its shaped checkout carried the full history.
- The fix (PR #96): the anchored count is read from the public GitHub API
  when the checkout's history cannot reach taken_at, degrading to a loud
  WARN with only a working-tree bound when the API cannot answer either;
  the Vercel-shaped guard now clones `--shallow-since <taken_at>` (from the
  committed snapshot), asserts that the record at taken_at is not visible
  in the shape, and requires the snapshot check to verify rounds_merged or
  degrade loudly. Verified both directions — reproduced the FAIL lines in a
  `--depth=11` clone, green after the fix in the same shape, red when the
  fallback is deleted, full chain green (`npm run prebuild`, `npm run
  build`, `npm run lint` all exit 0).
