# analytics — delta for build-initial-site

## Purpose

Visitor analytics is the measurement the improvement loop has always lacked —
the previous site rendered a GA script tag for months while no event ever
arrived. This capability wires GA4, proves events actually arrive, and states
what the loop does with the signal.

## ADDED Requirements

### Requirement: Every page reports a pageview to GA4

Every page SHALL load the GA4 tag (gtag.js) configured with a measurement ID
supplied by the environment variable `NEXT_PUBLIC_GA_MEASUREMENT_ID`, and
SHALL send a `page_view` event on load. When the variable is absent, pages
SHALL render with no analytics markup at all (local development stays
silent). No event SHALL carry any personally identifying payload; no custom
events are required beyond `page_view` at launch. The measurement ID is
configuration, not code: it appears in the environment and in rendered HTML
(where GA IDs are inherently public), and the contents of `.env.local` are
never printed by any tool or script.

#### Scenario: Configured build emits the tag

- **WHEN** the site is built with `NEXT_PUBLIC_GA_MEASUREMENT_ID` set
- **THEN** every rendered page contains the gtag loader for that ID and
  sends `page_view` on load

#### Scenario: Unconfigured build is silent

- **WHEN** the site is built with the variable unset
- **THEN** no page contains any analytics markup or makes any analytics
  request

### Requirement: Event delivery is verified by behavior, not by markup

There SHALL be an automated verification, `node scripts/verify-analytics.mjs
<base-url>`, that:

1. loads at least the home page and one content page in a real browser
   context,
2. captures outgoing network requests to the GA collection endpoint
   (`google-analytics.com` / regional equivalents, path containing
   `/g/collect`),
3. asserts at least one collect request per page whose `tid` parameter
   equals the configured measurement ID,
4. asserts the collect response status is 2xx,
5. prints one line per page: URL, collect endpoint hit yes/no, tid match
   yes/no, HTTP status — and exits nonzero if any assertion fails.

A rendered script tag SHALL never be accepted as evidence that analytics
works; only this check (and the launch confirmation below) counts. The check
SHALL run against a local production build before launch and against the
live site at launch.

#### Scenario: The check fails when events do not arrive

- **WHEN** the tag renders but requests to the collect endpoint are blocked
  or absent
- **THEN** `verify-analytics.mjs` exits nonzero and its output names which
  assertion failed for which page

#### Scenario: The check passes only on accepted delivery

- **WHEN** each tested page produces a collect request with the configured
  `tid` and a 2xx response
- **THEN** the check exits zero and prints the per-page evidence lines

### Requirement: Launch confirmation is observed in GA4 Realtime

At launch (after the maintainer lifts the push prohibition and the site
deploys), the launch checklist SHALL include a maintainer step with exactly
this procedure: open the GA4 property → Reports → Realtime, then visit
`https://www.addictedtoai.net/` in a normal browser; within 5 minutes the
Realtime report MUST show at least 1 active user and a `page_view` for the
visited page. The result (pass, with the date) SHALL be recorded in the
launch record. Until this step passes, analytics is not "working", whatever
the markup says.

#### Scenario: Realtime shows the visit

- **WHEN** the maintainer visits the live site with Realtime open
- **THEN** Realtime shows an active user and the `page_view` within 5
  minutes, and the launch record notes the confirmation date

### Requirement: The loop uses the signal as aggregate input, never as a target

What the loop does with analytics: **accumulate until there is enough to
read, then read it as prioritization input.** Concretely:

- The loop SHALL only ever see aggregate, per-page/per-section data placed
  in a checked-in file (`data/analytics/summary.json`) — produced by the
  maintainer (export or, later, an API integration the maintainer sets up;
  API credentials are reserved to the maintainer). Absent file, absent
  signal: the loop runs normally without it.
- When present, the signal MAY steer upkeep and topic selection (what to
  maintain, deepen, or prune).
- The signal SHALL NEVER be a per-piece target or a quality verdict: no
  piece is written to move a number, no piece is judged good because a
  number moved. Traffic-chasing is the slop the editorial bar exists to
  prevent.
- Raw or per-visitor data never enters the loop.

#### Scenario: No summary file, normal operation

- **WHEN** `data/analytics/summary.json` does not exist
- **THEN** every part of the loop operates normally with no error and no
  degraded behavior

#### Scenario: Signal steers selection, not verdicts

- **WHEN** the summary file shows a section drawing sustained interest
- **THEN** the loop may weight that section's upkeep and growth higher, and
  no review verdict anywhere references traffic
