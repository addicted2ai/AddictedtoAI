# analytics Specification

## Purpose
Visitor analytics is the measurement the improvement loop has always lacked —
the previous site rendered a GA script tag for months while no event ever
arrived. This capability wires GA4, proves events actually arrive, and states
what the loop does with the signal.

## Requirements

### Requirement: Every page view reports to GA4, however the visitor navigates

Every page SHALL load the GA4 tag (gtag.js) configured with a measurement ID
supplied by the environment variable `NEXT_PUBLIC_GA_MEASUREMENT_ID`, and a
`page_view` event SHALL be sent both on full page load **and on every
client-side route change**. The chosen stack navigates client-side after
first load, so "on load only" counts one page per visit and undercounts
everything a visitor clicks — the exact trickle-of-single-page-sessions
failure this capability exists to prevent. The route-change `page_view` MUST
carry the new page's path and title. **Exactly one** `page_view` SHALL be
sent per full page load: gtag's automatic send and the route-change tracker
MUST NOT both fire on initial load (disable one), because double-counted
landings corrupt the signal as surely as uncounted clicks. When the variable is absent, pages
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

#### Scenario: A click is a counted page view

- **WHEN** a visitor lands on the home page and clicks an internal link that
  navigates client-side without a full reload
- **THEN** a second `page_view` is sent carrying the new page's path

#### Scenario: Unconfigured build is silent

- **WHEN** the site is built with the variable unset
- **THEN** no page contains any analytics markup or makes any analytics
  request

### Requirement: Event delivery is verified by behavior, not by markup

There SHALL be an automated verification, `node scripts/verify-analytics.mjs
<base-url>`, that:

1. loads the home page and one content page directly in a real browser
   context,
2. captures outgoing network requests to the GA collection endpoint
   (`google-analytics.com` / regional equivalents, path containing
   `/g/collect`),
3. asserts **exactly one** `page_view` collect request per directly loaded
   page whose `tid` parameter equals the configured measurement ID (zero is
   the dead-tag failure; two is the double-fire failure),
4. asserts the collect response status is 2xx,
5. **clicks an internal link from the home page without a full reload
   (client-side navigation) and asserts a further collect request arrives
   carrying the new page's path** — this is the assertion that catches the
   single-page-session undercount,
6. prints one line per assertion: URL or action, collect endpoint hit
   yes/no, tid match yes/no, HTTP status — and exits nonzero if any
   assertion fails.

A rendered script tag SHALL never be accepted as evidence that analytics
works; only this check (and the launch confirmation below) counts. The check
SHALL run against a locally served production (exported) build before
launch and against the
live site at launch.

#### Scenario: The check fails when events do not arrive

- **WHEN** the tag renders but requests to the collect endpoint are blocked
  or absent
- **THEN** `verify-analytics.mjs` exits nonzero and its output names which
  assertion failed for which page

#### Scenario: The check passes only on accepted delivery

- **WHEN** each tested page produces a collect request with the configured
  `tid` and a 2xx response, and the click-through navigation produces its
  own collect request with the new path
- **THEN** the check exits zero and prints the per-assertion evidence lines

#### Scenario: Soft navigation that goes uncounted fails the check

- **WHEN** the tag fires on first load but no collect request follows the
  client-side click
- **THEN** the check exits nonzero naming the click-through assertion

### Requirement: Response headers may never silently block collection

The site sets no Content-Security-Policy at launch. If any CSP or other
security header is ever introduced (in the app, in `vercel.json`, or in
host configuration), it MUST permit the GA origins —
`https://www.googletagmanager.com` (script) and
`https://www.google-analytics.com` plus its regional collect endpoints
(connect) — and the change MUST NOT publish until
`scripts/verify-analytics.mjs` passes against a build carrying the new
headers. The behavioral check is the guard: headers are never assumed
compatible by reading them, only proven by observing delivery.

#### Scenario: A header change re-proves delivery

- **WHEN** a change introduces or edits any security header
- **THEN** `verify-analytics.mjs` is run against the changed build and the
  change publishes only on its exit 0

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
