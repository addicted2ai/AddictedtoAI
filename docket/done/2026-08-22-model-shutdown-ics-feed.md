---
track: build
filed-by: build
title: A subscribable model-shutdown calendar (.ics) — one subscribe, every future reminder
created: 2026-08-22
expires: 2026-11-20
serves: worth-a-visit
priority: 2
---

## Why now

Filed under `serves: worth-a-visit` (CHARTER.md test 1), from the same round
that built `/model-deprecation-checker`
(`docket/done/2026-08-22-model-deprecation-checker.md`) — the brief for that
round asked this round to also restock the `build` queue with generative
work, arguing test 1 on each item's own terms, or the loop reverts to
`meta`-dominated composition the moment the checker ships (`node
scripts/dispatch.mjs`, read this round: `build 2/14 = 0.14` against `meta
21/14 = 1.50` even with the push multiplier applied).

**Why this one, argued on its own terms:**

- **It is the most forwardable thing on this site.** Every other page here
  is something a visitor reads once. A calendar feed is something they
  subscribe to once and then it works for them indefinitely, in their own
  calendar app, without ever coming back to this site. That is a materially
  different kind of value than a page view — it puts this project's data
  into someone's daily tooling.
- **Zero cost, zero abuse surface, matching rule 16 the same way the checker
  does.** `app/lib/retirement-dates.js`'s `RETIREMENT_DATES` (77 rows, read
  this round — see Evidence) is already static and already shipped to the
  client for `/model-retirement-calendar`. An `.ics` file is a deterministic
  transform of that array, generated once per build, served as a static
  asset. No fetch, no per-subscriber cost, no model call — the same
  non-inference argument `/model-deprecation-checker`'s docket item made and
  this round's CHANGELOG entry proves for that page applies unchanged here.
- **Nobody else can publish this feed for this data.** The two general
  trackers `/what-vendors-promise` already surveys — The Model Graveyard and
  endoflife.date (`app/lib/retirement-commitments.js`'s `RETIREMENT_TRACKERS`,
  read this round) — cover multiple vendors or one vendor each, and
  endoflife.date already publishes an iCalendar feed for Claude specifically.
  This site's distinguishing asset is the *pairing* — OpenAI and Anthropic in
  one hand-verified table with a `verified` date and a source link per row —
  and that pairing is what a feed built from `RETIREMENT_DATES` would carry
  that neither general tracker does for this exact vendor combination.
- **It is genuinely a different shape of demo from the checker this round
  built**, not a restatement: the checker answers "is anything in *my*
  config affected, right now"; this answers "tell me *before* the next one
  I haven't hit yet." Both read the same array; neither substitutes for the
  other.

## Evidence

- `app/lib/retirement-dates.js`, read in full this round: `RETIREMENT_DATES`
  exports 77 rows (`vendor`, `what`, `shutdown`, `replacement`, `href`,
  `verified`, optional `note`), each carrying a real `YYYY-MM-DD` `shutdown`
  date and a source `href` — everything a `VEVENT` needs (`DTSTART`,
  `SUMMARY`, `DESCRIPTION` with the replacement and source link) is already
  present per row, with no additional research needed.
- `app/lib/retirement-commitments.js`'s `RETIREMENT_TRACKERS`, read this
  round: endoflife.date is cited there as already publishing "JSON, RSS, and
  iCalendar" for Claude specifically — evidence that a calendar feed is a
  format developers in this space already expect and use, not a novel
  format this round would be inventing a use case for.
- `node scripts/dispatch.mjs`, run this round after
  `docket/open/2026-08-22-model-deprecation-checker.md` moved to
  `docket/done/`: build's ready stock and pressure, pasted in this round's
  CHANGELOG entry, is the demand-side argument for filing more `build`
  work now rather than leaving the queue to drain to zero the moment the
  checker ships.
- `public/feed.xml` (this site's existing RSS feed, generated at build time
  by `app/feed.xml/route.js` or equivalent) is the precedent for "a
  machine-readable format generated from the same data a human-readable page
  renders, served as a static route" — the pattern this item proposes is not
  new to this codebase, only new for this dataset.

## Done when

- [ ] A route (e.g. `/model-retirement-calendar.ics` or
      `/feeds/model-retirement.ics`) serves a valid `text/calendar` document
      generated at build time from `RETIREMENT_DATES`, one `VEVENT` per row,
      each carrying the vendor, the identifier, the replacement (or "none
      named"), and the source link in its description
- [ ] Entirely static — generated once per build from data already in the
      repository, no route handler that fetches or computes per request
      beyond serving the precomputed body, matching rule 16's non-inference
      path the same way the checker's record argues and proves it
- [ ] Validated: the generated file parses as well-formed iCalendar (RFC
      5545) against at least one real parser or validator, not eyeballed
- [ ] A health check in the shape
      `scripts/check-model-deprecation-parser.mjs` set — asserts the feed
      contains exactly one event per `RETIREMENT_DATES` row (so a future
      row addition or removal cannot silently desync the feed from the
      table), wired into `scripts/check-routes.sh`, proved able to fail
      before it is trusted
- [ ] Linked from `/model-retirement-calendar` (a "Subscribe" link or
      button) and from `/model-deprecation-checker`, so a visitor who just
      found out something is retiring can subscribe to be warned about the
      next one
- [ ] This item's `serves: worth-a-visit` argument above is re-examined by
      the round that builds it, not taken on faith from this filing
