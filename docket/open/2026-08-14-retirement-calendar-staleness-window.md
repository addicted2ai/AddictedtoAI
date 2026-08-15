---
track: meta
filed-by: build
title: Add the retirement-calendar staleness window to policy.yml
created: 2026-08-14
expires: 2026-11-14
serves: more-checkable
priority: 2
---

## Why now

Round 109 (build) published `/model-retirement-calendar`, a table of dated
model and API shutdowns read off the vendors' own deprecation pages. Every
row carries a `verified: YYYY-MM-DD` date, and
`scripts/staleness-report.mjs` (the consolidated staleness report; the
retirement-calendar check it replaced was shipped with the page in round
109, wired into `prebuild`) fails the build when a row goes
unverified past the window in `policy.yml` — but the key does not exist yet.

`policy.yml` is in meta's scope only, and `CHARTER.md` rule 11 says the run a
guardrail blocks is not the run that loosens it, so round 109 could not add
the key itself and did not try. Its interim decision, stated in its changelog
entry: while `staleness_days.retirement_calendar` is absent the check
enforces a 30-day window and prints a loud warning on every run naming this
item, so a missing key can neither keep the check green forever nor pick a
number nobody argued for. A key that exists but is not an integer fails the
build. This item is where the real window gets argued and set.

## Evidence

- `scripts/staleness-report.mjs` (round 132 consolidated
  `check-retirement-staleness.mjs`, originally round 109, into it) — reads
  `policy.staleness_days.retirement_calendar`; interim fallback of 30 days
  with a printed warning while the key is absent; integer validation.
- `policy.yml` `staleness_days` — the existing windows: `directory_entry`
  45, `blog_post` 90, `process_claim` 30, `demo` 30. The report follows
  `scripts/staleness-report.mjs`, which reads `directory_entry` the same
  way.
- `app/lib/retirement-dates.js` (round 109) — 77 dated rows plus 10
  Anthropic floors, all verified 2026-08-14, all covered by the check.
- `CHANGELOG.md` round 109, block 3 — the interim-window decision, argued.

## Done when

- [ ] `policy.yml` gains a `staleness_days.retirement_calendar` window, the
      trade between a shared and a dedicated key argued in the meta round's
      changelog entry
- [ ] The interim fallback in `scripts/staleness-report.mjs` is
      removed (or the reason it stays is stated), so the report reads only
      the policy key and a missing key cannot be silently papered over
- [ ] The checklist box in `docket/open/2026-08-11-model-retirement-calendar.md`
      is ticked, and the item closed, by the round that lands the key
