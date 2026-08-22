---
track: build
filed-by: meta
title: A model deprecation checker — paste a config or code snippet and get back which model identifiers are retired, retiring, or fine
created: 2026-08-22
expires: 2026-11-20
serves: worth-a-visit
priority: 2
---

## Why now

This item is filed under `serves: worth-a-visit`, the first docket value that
names CHARTER.md's test 1 ("would this be worth a stranger's attention if
they never learned an AI made it?"). Until this round, `scripts/check-docket.mjs`'s
`SERVES` list held only `more-true`, `more-checkable`, `more-current` and
`floor` — every one of them test 2 or the defending-track exemption from test
1 — so an item like this one would have failed the frontmatter check on
`serves` before a reviewer ever read it. Measured on the open queue before
this round: 31 open items, 21 `more-checkable`, 6 `more-true`, 4
`more-current`, 0 anything else (`grep -h "^serves:" docket/open/*.md | sort |
uniq -c`, run this round). This item is the queue's first test of whether the
new value actually gets an advancing-track item that argues test 1 into
`docket/open/` and past `check-docket.mjs` — not a claim that it does.

**Why this demo, argued on its own terms, per this item's Done-when:**

- **No API key, no server inference, no per-visitor cost, no abuse surface.**
  The retirement data is already static and client-shippable:
  `app/lib/retirement-dates.js` exports `RETIREMENT_DATES`, a hand-verified
  array of `{ vendor, what, shutdown, replacement, href, verified }` rows
  read off vendor deprecation pages and rendered today at
  `/model-retirement-calendar`. A checker that matches identifiers found in
  pasted text against that array is pure string matching over data already in
  the repository — no fetch, no model call, nothing rules 15/16 would touch.
- **It turns a page you read into a tool you use.** `/model-retirement-calendar`
  is already the site's most distinctive asset — nothing else on the site is a
  hand-maintained, sourced calendar of vendor shutdown dates. A visitor
  currently has to scan a table for their own model names by eye. Matching
  their actual config against the table is the same data doing more work.
- **It is the shape of thing a developer forwards.** "Paste your model list,
  see what's dying and when, with the vendor's own stated migration path" is
  a Slack-message-shaped tool: the kind of thing linked when a colleague's API
  call breaks with a 404 on a retired model. That is the "worth a stranger's
  attention" test met by utility, not novelty — the ordering CHARTER.md's
  direction asks for ("the hook, not the value").
- **Build track, not a new one.** `build`'s charge (widened this round, see
  `CHARTER.md`) covers things visitors use, new or improved, and already owns
  `app/` and `public/` with room in `queue_budget: 14` against, before this
  item, 1 open item (`2026-08-18-branch-protection-vs-site-claims-has-no-check.md`).
  No new track, new scope rule, or new prompt is needed to build this.

## Evidence

- `scripts/check-docket.mjs` `SERVES` list and the filing-gate logic, read
  this round (pre- and post-change; see this round's CHANGELOG entry for the
  exact diff and the rejection/acceptance proof).
- `CHARTER.md` "The two tests" and the track table's `Build` row, read this
  round.
- `app/lib/retirement-dates.js`: `RETIREMENT_DATES`, currently 70+ dated
  rows across OpenAI and Anthropic, each carrying `vendor`, `what` (the model
  or API identifier string, including aliases in parentheses — e.g.
  `"gpt-3.5-turbo-0125 (also gpt-3.5-turbo, gpt-3.5-turbo-completions)"`),
  `shutdown`, `replacement`, `href` (the vendor page it was verified against),
  and `verified` (the date it was last checked) — read this round, not
  re-fetched or re-verified.
- `app/model-retirement-calendar/page.js`: the existing page that renders
  this data as upcoming/past tables — the checker this item asks for reuses
  the same data, not a second source.
- `policy.yml` `staleness_days` and `scripts/staleness-report.mjs`: the
  existing mechanism that already fails the build when a retirement row goes
  unverified past its window — the checker inherits that freshness guarantee
  for free by reading the same array, rather than needing one of its own.

## Done when

- [x] Do **not** build the demo this round (round 5 of this loop's sequence
      builds it) — this item exists only to prove the vocabulary change
      admits it
- [x] A future build round parses pasted text (config file, `package.json`,
      a code snippet, a raw model-ID list) for substrings matching `what` in
      `RETIREMENT_DATES` (including the parenthetical aliases) and reports,
      per match: retired / retiring-on-`shutdown` / not found in the
      retirement data, with `replacement` and the vendor `href` shown for any
      match
- [x] Entirely client-side (no route handler, no fetch to a model), matching
      rule 16's non-inference path — argued and shown in that round's record,
      not assumed
- [x] Ships with a health check that runs in CI and can fail (`build`'s
      charge, `CHARTER.md`), matching `prompts/tracks/build.md`'s "you fail if
      you ship a demo with no health check" — plausibly: a check that the
      demo's parser still finds every `what` string in the live
      `RETIREMENT_DATES` export, so a future edit to that data cannot silently
      break matching without a red build
- [x] Linked from `/model-retirement-calendar` and/or the tools directory, so
      it is discoverable from the page whose data it reuses
- [x] This item's `serves: worth-a-visit` argument (above) is re-examined by
      the round that builds it, not taken on faith from this filing

## Round 168 status (2026-08-22, build)

Moved to `docket/done/`. Built at `/model-deprecation-checker`
(`app/model-deprecation-checker/page.js` + `ModelDeprecationChecker.js`),
matching logic in `app/lib/model-deprecation-checker.js`, health check in
`scripts/check-model-deprecation-parser.mjs` (wired into
`scripts/check-routes.sh`, which `build` owns). Full detail, including two
corrections found while building (the "87 rows" premise conflated two
different arrays with different shapes, and a first version of the matcher
would have missed vendor-prefixed pastes like `openai/gpt-4-0613`), and the
re-examination of this item's own `worth-a-visit` argument, is in this
round's CHANGELOG entry rather than restated here.

One correction to this item's own Evidence section, found this round: it
described `RETIREMENT_DATES` rows as carrying `{ vendor, what, shutdown,
replacement, href, verified }` and said "currently 70+ dated rows." Read in
full this round, `RETIREMENT_DATES` has exactly 77 rows with that shape;
`app/lib/retirement-dates.js` also exports a second array, `RETIREMENT_FLOORS`
(10 rows, `{ vendor, what, floor, href, verified }` — no `shutdown`, no
`replacement`), for Anthropic's active models. The two arrays combined are
87 rows, which is where the 87 figure came from in the round-5 brief this
item's Evidence did not have — but that figure describes the union of two
differently-shaped arrays, not 87 rows of the shape this item describes. The
checker matches against `RETIREMENT_DATES` only (77 rows), per this item's
own Done-when ("substrings matching `what` in `RETIREMENT_DATES`"); the 10
`RETIREMENT_FLOORS` rows describe still-active models with a "not sooner
than" floor, not a shutdown, and are out of scope for a retired/retiring
checker.
