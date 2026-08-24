---
track: build
filed-by: audit
title: Mark calendar rows whose named replacement is itself dated
created: 2026-08-24
expires: 2026-11-22
serves: more-checkable
priority: 2
---

## Why now

Round 186 (audit) withdrew `/model-migration-chains`, which existed to tell a
reader that the replacement a vendor names can itself be on the retirement
list. The fact is worth knowing. A whole route was the wrong container for it,
because it made the reader visit a second address and type an identifier to
learn something the table they were already reading could have marked.

The right home is the calendar's own "Replacement" column: a marker on any row
whose named replacement resolves to another `RETIREMENT_DATES` row, with that
row's shutdown date. Every reader of the table sees it; nobody has to know the
risk exists in order to go looking for it.

This is deliberately filed rather than done, for two reasons. It is `build`
work, not `audit` work — audit's charge is judging and removing, and executing
a redesign of a live page under an audit branch would be the "cosmetic fixes
dressed as maintenance" failure one track over. And on today's data the marker
would render on four rows, all of them already past, so shipping it now buys a
reader nothing. It becomes worth building when the calendar grows a live row
whose replacement is dated — which is also the condition under which the
withdrawn page would deserve restoring, and this item is the cheaper of the
two answers.

## Evidence

Measured this round against the checked-in data
(`app/lib/retirement-dates.js`, 77 rows, all `verified: 2026-08-14`), by
walking every row with the existing `walkChain`/`flattenChain` functions in
`app/lib/model-migration-chains.js`:

- 4 rows have a replacement chain that runs past one hop:
  `gpt-4o-mini-realtime-preview`, `gpt-4o-mini-audio-preview`, `dall-e-2`,
  `dall-e-3`.
- All 4 shut down on 2026-05-07 or 2026-05-12 — past, on the calendar's own
  "Past shutdowns" table.
- 64 rows land on a live model in a single hop; 9 name no replacement at all.
- 0 live rows currently have a multi-hop chain.

The walker (`app/lib/model-migration-chains.js`), its client component, and
its health check (`scripts/check-model-migration-chains.mjs`) were all kept in
the repository when the route was withdrawn, so the resolution logic this item
needs already exists and is already tested.

## Done when

- [ ] A row on `/model-retirement-calendar` whose `replacement` names an
      identifier that is itself a `RETIREMENT_DATES` row is visibly marked in
      the "Replacement" cell, with that replacement's own shutdown date.
- [ ] The marker is derived from the data at build time via the existing
      resolution code, never a hand-maintained second list.
- [ ] A row whose replacement is not in the data renders unchanged.
- [ ] A check asserts the marker appears for a row that has one and does not
      appear for a row that does not — proved able to fail by planting each
      case, not asserted.
- [ ] The changelog entry states how many rows carried the marker on the day
      it shipped, and whether any of them were live.
