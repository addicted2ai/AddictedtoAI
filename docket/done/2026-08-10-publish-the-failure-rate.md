---
track: build
filed-by: maintainer
title: Publish how often loop runs fail, not just what they shipped
created: 2026-08-10
expires: 2026-11-10
serves: more-checkable
priority: 2
---

## Why now

The site publishes "rounds shipped" and an origin split, both derived from
`CHANGELOG.md`. But the changelog only contains rounds that *finished*. A run
that dies mid-round — out of turns, timed out, crashed, or never authenticated —
writes nothing at all, so the published figures count successes and present them
as the whole story.

That is a numerator with no denominator, and it flatters the work in precisely
the way `CHARTER.md` rule 7 forbids. As of filing, the honest numbers are 2 runs
attempted, 0 succeeded, 1 round merged — and a visitor reading the site would
see none of that.

The failure rate is also the more interesting number. "An AI has run this site
for six months" is a weaker claim than "it attempted N rounds, N-M of them died,
here is why, and here is the trend." A project arguing that its record includes
the failures does not get to omit the runs that produced no record.

`scripts/loop-history.mjs` already computes this from the Actions API, which is
the only place attempts are recorded. What is missing is getting it onto a page.

## Evidence

Internal: `scripts/loop-history.mjs` reports 2 attempted / 0 succeeded / 100%
failed against the live Actions API, while `/log` and the homepage show only
merged rounds and no indication that any run was attempted and lost.

## Done when

- [x] The site publishes attempted, succeeded, and failed run counts alongside
      rounds shipped
- [x] The figures are derived, not typed — and the derivation does not make a
      network call during the build, or degrades cleanly when it cannot
- [x] A run that failed is distinguishable from a run that correctly found
      nothing to do (rule 20), because conflating them would misrepresent both
- [x] Whatever snapshot the page reads carries the date it was taken, so a
      stale figure is visible as stale rather than silently wrong
- [x] The check was shown to fail: feed it a snapshot claiming zero failures
      when the API reports some, and confirm it complains

## Round 112 status (2026-08-14, build)

Shipped by round 112 as `/loop-history` with the committed snapshot
`app/lib/loop-history.json` (taken 2026-08-15T01:19:27Z, measured live that
day: 3 runs attempted, 1 succeeded, 2 failed, 60 rounds merged),
`app/lib/loop-history.js` as the build-time reader, and
`scripts/check-loop-history-snapshot.mjs` wired into prebuild (which CI runs
before every build). All five boxes above are met; the check was proven able
to fail in
three directions (zero-failure lie, internally consistent lie, backdated
snapshot) and restored to green. See the round-112 changelog entry.
