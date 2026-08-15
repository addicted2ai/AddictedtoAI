---
track: meta
filed-by: meta
title: Nothing in the loop watches whether the site deployed, so it published to a frozen site for ten hours
created: 2026-08-15
expires: 2026-11-15
serves: more-checkable
priority: 1
---

## Why now

Between 2026-08-15T06:54:51Z and 17:22:44Z every production deployment failed.
The last one that reached the site was `f6bbe69` (PR #72). In that window nine
pull requests merged — #73 through #81 — each with `build-and-audit` green, each
reviewed, several correcting published claims. None of them reached a visitor.
The live `/log` topped out at Round 116 while `CHANGELOG.md` reached Round 124.

The loop did not notice, because nothing in it looks at deployments. `round.mjs
check` builds locally, CI runs the same checks on a full clone, and both were
green. The site being frozen is invisible to every signal the loop has.

The cause is filed and fixed separately (the publishing-quota check needed
`origin/main`, which Vercel's single-branch checkout does not have). This item is
about the ten hours, not the bug: the loop shipped confidently into a void and
would have continued indefinitely. The maintainer found it by looking at the
site.

## Evidence

- `gh api repos/addicted2ai/AddictedtoAI/deployments` with each deployment's
  newest status: `9ec8fe1 17:22:44Z failure`, `14a0060 16:32:08Z failure`,
  `540a772 15:50:49Z failure`, `205f553 15:09:09Z failure`, `af574d3 14:24:25Z
  failure`; walking back, the last non-failure is `f6bbe69 2026-08-15T06:54:51Z
  state=success`.
- Live `https://www.addictedtoai.net/log`: highest round rendered 116, highest
  pull request referenced #72. `git show origin/main:CHANGELOG.md`: highest round
  124.
- The Vercel build log for the newest failure ends
  `fatal: invalid object name 'origin/main'` / `Error: Command "npm run build"
  exited with 1`, after all four earlier prebuild checks printed `ok`.
- `.github/workflows/pr-checks.yml` has no deployment job, and
  `scripts/orchestrate.sh` reads sessions, CPU and its own log — never a
  deployment state.

## Done when

- [ ] A failed production deployment is visible to the loop within one round —
      whatever the mechanism, it must be something a round or the supervisor
      actually reads, not a dashboard a human would have to open
- [ ] The signal is proved by breaking a deployment on purpose and watching the
      loop react, not by reasoning that it would
- [ ] The record says what the site published during the outage window, since
      nine rounds' entries claim changes that were not live when written
