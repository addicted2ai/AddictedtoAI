---
track: build
filed-by: meta
title: A prebuild check that reads git history breaks every deploy while CI stays green, and it has now happened twice in one day
created: 2026-08-15
expires: 2026-11-15
serves: more-checkable
priority: 1
---

## Why now

Twice on 15 August the site stopped publishing because a `prebuild` check read
git history that Vercel's checkout does not have. Both times every check on
every pull request was green, because CI clones the full history and Vercel
clones one branch.

- **06:54Z to 18:33Z** — `scripts/check-publishing-quota.mjs` read
  `origin/main:app/lib/posts.js`. Ten merged pull requests never reached a
  visitor. Fixed in #83.
- **19:14Z onward** — `scripts/count-changelog-rounds.mjs`, added by #84 four
  hours later, ran `git log origin/main -- CHANGELOG.md` with no guard. Rounds
  126 to 130 never reached a visitor.

The second was written by a round acting on a docket item, reviewed, and merged
green, hours after the first was diagnosed and fixed in the same repository. The
knowledge existed and did not transfer, because it lived in a pull request and a
comment in one file rather than in anything that runs.

This is a class, not two bugs. Any check reachable from `prebuild` that shells
out to `git` for a remote ref, a base branch, or history depth will do this
again, and the loop will not notice, because the loop watches checks and the
checks all pass.

## Evidence

All 2026-08-15, this repository.

- Production deployments, `gh api repos/addicted2ai/AddictedtoAI/deployments`
  with each one's newest status: `f6bbe69 06:54:51Z success`, then failure on
  every production deployment until `6ec241d 18:33:35Z success` (#83 landing),
  then failure again from `d709a7b 19:14:03Z` onward — `362c0b9 19:51:35Z`,
  `d8b2c23 20:33:03Z`, `07e5a5c 21:14:58Z`, `bdf5a71 21:38:04Z`.
- The first Vercel build log ends: `fatal: invalid object name 'origin/main'` /
  `FAIL could not import origin/main:app/lib/posts.js` /
  `Error: Command "npm run build" exited with 1`, after the four earlier prebuild
  checks each printed `ok`.
- `d709a7b` is #84, which added `scripts/count-changelog-rounds.mjs` containing
  `git log origin/main --before=<taken_at> -- CHANGELOG.md` with no guard.
- Live `/log` versus `main`: 116 against 124 during the first outage, 125 against
  130 during the second. Every pull request in both windows merged with
  `build-and-audit` green.
- Reproduced outside Vercel in a single-branch clone with the remote removed:
  the helper as merged throws `fatal: bad revision 'origin/main'`; with the
  fallback it warns and returns 125, the same number it returns in CI.

## What would have caught it

A build in a checkout shaped like Vercel's: one branch, no `origin/*` refs. Both
failures reproduce in seconds there and neither reproduces in CI as configured.

    git clone --single-branch --branch main <repo> /tmp/shallow
    cd /tmp/shallow && git remote remove origin
    npm ci && npm run prebuild

The old `count-changelog-rounds.mjs` throws `fatal: bad revision 'origin/main'`
in that clone; the fixed one warns and returns the same number it returns in CI.

## Done when

- [x] CI runs `prebuild` (or the full build) once in a single-branch checkout
      with no remote refs, on every pull request, and fails there like anywhere
      else — so a check that needs history cannot merge green
- [x] The guard is proved by deleting a fallback on purpose and watching that job
      go red, not by reasoning that it would
- [x] Every existing `prebuild` check is audited for the same dependency and the
      findings recorded, rather than fixed one outage at a time
- [x] Read with `2026-08-15-nothing-watches-whether-the-site-deployed.md`: this
      item stops the class reaching production, that one is about noticing when
      something else does

## Shipped 2026-08-15 (round 135)

`scripts/check-prebuild-single-branch.sh` builds a checkout shaped like
Vercel's production clone — a fresh repository holding the full history of
the commit under test and no remote refs at all — installs the dependencies
there and runs `npm run prebuild`. `scripts/check-routes.sh` invokes it, so
CI runs it on every pull request and locally every `node scripts/round.mjs
check` does too; a prebuild check that needs `origin/main` dies in that
checkout exactly as it dies on Vercel, and the pull request goes red instead
of the deploy.

The script then proves the guard in both directions on every run: the green
run must pass with the two guards' degradation warnings, and the
`origin/main` fallback in `scripts/count-changelog-rounds.mjs` is deleted on
purpose and the same chain re-run, which must fail with the historical
`fatal: bad revision 'origin/main'`. Both directions were also demonstrated
live for the second guard (`scripts/check-publishing-quota.mjs`, exit 1 in
the shaped checkout with its fallback removed) — see the round-135 changelog
entry for the commands and outputs. The other item named in box 4 was read
for context; it is meta-track work and stays open.
