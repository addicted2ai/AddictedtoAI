---
track: audit
filed-by: audit
title: Re-read the deprecation cluster in ten rounds and say whether it stopped growing
created: 2026-08-24
expires: 2026-11-22
serves: floor
priority: 2
---

## Why now

This is the drift finding round 186 was required to look for, filed so a later
audit has something specific to check rather than having to rediscover it.

Between 2026-08-22 and 2026-08-24 the loop shipped four new routes over one
dataset: `/model-deprecation-checker` (round 168),
`/model-retirement-calendar.ics` (round 180), `/model-migration-chains` (round
181) and `/promise-vs-practice` (round 182). Round 186 withdrew the last two.
The pattern in the two that were withdrawn is precise and worth naming, because
it will recur: both took a **true observation about the shape of the data** and
built a route out of it, without first checking whether the observation applied
to anything a reader currently has.

- `/promise-vs-practice` was built because two numbers can be subtracted. There
  were no numbers: its comparison table was empty on the day it shipped and had
  been for eighteen days.
- `/model-migration-chains` was built because a named replacement can itself be
  dated. It is, for 4 of 77 rows, all four of them models switched off in May.

Neither round did anything careless. Both wrote careful code, real health
checks and honest prose. That is what makes this drift rather than a mistake:
no single round was bad, and the trajectory was wrong. The site went from a
homepage nav of six links to eleven, five of them the same 77-row table, in
under a week — and the two additions that a stranger could get least from were
the two most recent.

A later audit should check whether this stopped.

## Evidence

Internal, and deliberately so — this is a claim about this project's own
trajectory, which `CHARTER.md` rule 2 makes this repository the only valid
source for. Re-derivable from the tree:

- `git log --diff-filter=A --format="%h %ad %s" --date=short -- app/promise-vs-practice/page.js app/model-migration-chains/page.js app/model-retirement-calendar.ics/route.js app/model-deprecation-checker/page.js`
  — four routes added, 2026-08-22 and 2026-08-24.
- `app/Nav.js` before round 186: eleven links, five of them the deprecation
  cluster.
- The counts behind each withdrawal are in round 186's `CHANGELOG.md` entry and
  in `docket/open/2026-08-24-mark-replacements-that-are-themselves-dated.md`.

The maintainer said the same thing independently on 2026-08-24, in the working
session that dispatched round 186: "It feels like we are just creating
different ways of conveying the same information." Recorded as corroboration of
the direction, not as the evidence — the counts above are the evidence.

## Done when

- [ ] An audit round at least ten shipped rounds after 186 re-counts the routes
      reading `app/lib/retirement-dates.js` or
      `app/lib/retirement-commitments.js`, and the entries in `app/Nav.js`.
- [ ] It states plainly whether the cluster grew, held, or shrank, with the
      numbers, and whether any route added since 186 could be reached by a
      reader who had a problem rather than by one browsing the nav.
- [ ] If it grew, it names which addition a stranger would have missed, and
      either withdraws it or argues why not.
- [ ] If it held or shrank, it says so and withdraws nothing — an audit that
      finds the drift stopped is a real outcome under rule 20.
