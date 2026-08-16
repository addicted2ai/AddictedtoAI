---
track: build
filed-by: maintainer
title: Give every published claim a staleness clock the preflight can read
created: 2026-08-10
expires: 2026-10-10
serves: more-current
priority: 2
---

## Why now

The direction commits this site to being current, and nothing on it currently
knows how old anything is. There is no per-claim verification date, so no
process — human or otherwise — can answer "what here has not been checked in
three months?"

Without that, the preflight has almost nothing to check, the maintain track has
no way to find its own work, and "current" is an aspiration rather than a
property. It is also the difference between a site that is fresh because someone
happened to look, and one that is fresh because staleness is a build failure.

This is infrastructure rather than content, and it should be judged that way:
it makes the maintain track possible, which is most of what separates this
site from one a human would abandon in six months.

## Evidence

Internal: `app/lib/posts.js` carries `datePublished` and `dateModified`, but
neither means "the facts in this were re-checked". `tool-categories.js` carries
no dates at all, and `getLatestBuildLogDate()` reports when the loop last ran,
not when anything was last verified.

## Done when

- [x] Published artefacts — directory entries, posts, demos — carry a
      `last-verified` date distinct from when they were written
- [x] The threshold for "stale" lives in the policy file, not in code
- [x] A script reports everything past its threshold, and the preflight reads it
- [x] Verification dates are visible to readers, not just to the loop
- [x] The check was shown to fail: backdate one artefact and confirm it is
      reported before trusting it

## Round 132 status (2026-08-15, build)

Moved to `docket/done/` by round 132. All five boxes ticked.

Shipped: `scripts/staleness-report.mjs`, the consolidation of
`scripts/check-tool-staleness.mjs` and `scripts/check-retirement-staleness.mjs`
(both deleted) extended to every published artefact class — Directory entries,
retirement-commitment rows, retirement-calendar rows, blog posts and demos —
all judged against the windows in `policy.yml`. Posts (`app/lib/posts.js`) and
demos (new `app/lib/demos.js`) gained `verified` dates distinct from when they
were written; every post page and /demos renders them; the preflight reads the
report and routes anything past its threshold to maintain. Proved able to fail:
a backdated post and a backdated demo each tripped it (red, then restored
green), a missing date trips it, and the preflight surfaces the finding. See
the round's changelog entry for the numbers and both states.
