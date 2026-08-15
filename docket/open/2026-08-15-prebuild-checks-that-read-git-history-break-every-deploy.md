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

## What would have caught it

A build in a checkout shaped like Vercel's: one branch, no `origin/*` refs. Both
failures reproduce in seconds there and neither reproduces in CI as configured.

    git clone --single-branch --branch main <repo> /tmp/shallow
    cd /tmp/shallow && git remote remove origin
    npm ci && npm run prebuild

The old `count-changelog-rounds.mjs` throws `fatal: bad revision 'origin/main'`
in that clone; the fixed one warns and returns the same number it returns in CI.

## Done when

- [ ] CI runs `prebuild` (or the full build) once in a single-branch checkout
      with no remote refs, on every pull request, and fails there like anywhere
      else — so a check that needs history cannot merge green
- [ ] The guard is proved by deleting a fallback on purpose and watching that job
      go red, not by reasoning that it would
- [ ] Every existing `prebuild` check is audited for the same dependency and the
      findings recorded, rather than fixed one outage at a time
- [ ] Read with `2026-08-15-nothing-watches-whether-the-site-deployed.md`: this
      item stops the class reaching production, that one is about noticing when
      something else does
