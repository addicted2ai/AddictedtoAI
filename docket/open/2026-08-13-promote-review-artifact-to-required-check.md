---
track: meta
filed-by: maintainer
title: Add the `review-artifact` check to the required status checks, in the GitHub settings UI
created: 2026-08-13
expires: 2026-11-11
serves: more-checkable
priority: 2
blocked-on: maintainer
---

## Why now

The `review-artifact` job in `.github/workflows/pr-checks.yml` verifies that a
round declaring `Origin: delegated` carries a review file at
`docket/reviews/<sha>.md` that approves and covers the merged tree. Right now
it is a *visible* check, not a gate: it is not on the branch-protection
required list, so GitHub's auto-merge ignores it. A delegated pull request
would auto-merge the moment `build-and-audit` went green, with `review-artifact`
sitting red and ignored.

The gate therefore lives in `scripts/round.mjs ship`, which runs the same
checker before it will arm auto-merge for a delegated round. That is where the
loop controls the merge, and it holds. But it is one layer: it stops `ship`
from *arming* auto-merge. It does not stop a delegated pull request from being
merged by the account's own admin rights past a red check — the same
`enforce_admins: false` hole round 81 documented for `human-owned-paths`.

## What it would buy

Adding `review-artifact` to the required status checks list makes the check
bind at GitHub's merge layer, not just at the arming layer. A delegated round
whose review artifact is missing, or does not cover the merged tree, would be
unmergeable on green. GitHub's auto-merge would then wait on it just as it
waits on `build-and-audit`.

It would not be a complete fix. `enforce_admins` is off and the only account
with admin rights is the owner — the account the loop operates as — so an
admin merge could still step over the check, exactly as it steps over
`human-owned-paths`. See `2026-08-11-branch-protection-does-not-require-review.md`
for the settings change that would close that. This item is the smaller,
cheaper layer: it makes the check bind at the same place `build-and-audit`
binds, which is where the sanctioned shipping path already is.

## This is a settings change, not a file change

`required_status_checks.contexts` is a GitHub repository setting. No track can
make it: `CHARTER.md` rule 14 confines the loop to this repository and its
deployment, and the change is made in Settings → Branches → the `main`
protection rule (or an equivalent API call made by the maintainer). The loop
can ship the check, file the case, and wait.

## Evidence

Internal — this is a property of this repository's own CI and the review
artifact the round's checker requires:

- `.github/workflows/pr-checks.yml` — the `review-artifact` job, added by the
  meta round of 2026-08-13.
- `scripts/check-review-artifact.mjs` — the rule, invoked by the CI job and by
  `scripts/round.mjs ship`.
- The branch-protection readout recorded in the 2026-08-13 round's entry:
  required contexts are `["build-and-audit","human-owned-paths"]`;
  `review-artifact` is not among them. (The round's own tool rules denied the
  `gh api` branch-protection read, so the list is recorded as the maintainer
  verified it, not re-measured by the round.)

## Done when

- [ ] The maintainer adds `review-artifact` to the required status checks list
      in the `main` branch protection rule (a settings change, made by hand).
- [ ] A delegated pull request with no covering approve review artifact cannot
      auto-merge, and the `review-artifact` check is what blocks it —
      demonstrated on a real pull request, not inferred from the settings page.
- [ ] The check is re-read from the API afterwards and the readout recorded, so
      the next round does not have to take the settings page's word for it.
