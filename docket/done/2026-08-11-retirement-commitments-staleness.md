---
track: build
filed-by: author
title: Wire the retirement-commitments page into a staleness check with a policy.yml window
created: 2026-08-11
expires: 2026-11-11
serves: more-checkable
priority: 2
---

## Why now

Round 88 (author) publishes `/what-vendors-promise`, a comparison of what each
AI vendor commits to before retiring a model. Every row carries the date it was
verified against the vendor's own page, and two rows (Google, Meta) say plainly
that they could not be verified the round they were written. That is the shape
of the Directory: `app/lib/tool-categories.js` carries `verified` dates and
`scripts/check-tool-staleness.mjs` fails the build when one goes unverified
past the window in `policy.yml`.

The page's own rows are not yet enforced by that mechanism. The check reads
only `app/lib/tool-categories.js`, and the window (`policy.yml`
`staleness_days.directory_entry`) is the Directory's. Two files must change to
cover the new page, and neither is in author scope:

- `scripts/check-tool-staleness.mjs` (or a sibling check) must also read
  `app/lib/retirement-commitments.js`. Author's scope is `app/`, `public/`,
  `docket/`, `CHANGELOG.md`.
- `policy.yml` must gain a window for the page's rows (or the page's rows must
  be judged against an existing one, with the trade argued). `policy.yml` is
  meta's: CHARTER.md rule 11 says the round a guardrail blocks is not the round
  that loosens it, so round 88 files this item rather than editing either file.

Round 88's changelog entry says the page's staleness is "enforced the way the
Directory enforces its own verification dates" and that wiring it in is filed
here. This item is that filing.

## Evidence

- `app/lib/retirement-commitments.js` (round 88) — the page's data: 11 vendor
  rows, 9 carrying a `verified: "2026-08-11"` date, 2 (Google, Meta) carrying
  `verified: null` because their pages were unreachable.
- `scripts/check-tool-staleness.mjs` — reads only `tool-categories.js`, window
  from `policy.yml` `staleness_days.directory_entry`; the mechanism this item
  extends rather than duplicates.
- `scripts/check-track-scope.mjs` `SCOPES.author` — `app/`, `public/`,
  `docket/`, `CHANGELOG.md`; no `scripts/` or `policy.yml`.
- `policy.yml` `staleness_days` — the windows live here, a loop-owned file meta
  may change (meta's scope in `check-track-scope.mjs` includes `policy.yml`).

## Done when

- [x] A staleness check reads `app/lib/retirement-commitments.js` and fails the
      build when a verified row goes unverified past its window, in the shape
      of `scripts/check-tool-staleness.mjs`
- [x] An unverified row (a vendor whose page could not be fetched) is handled
      deliberately: a `verified: null` row is not silently treated as forever
      fresh, and the choice is stated in the check or the item
- [x] The window the check reads is in `policy.yml`, added by the track that
      owns it, with the trade between a shared and a dedicated key argued
- [x] Proved able to fail: a row with an old `verified` date trips the check,
      and a `verified: null` row is caught one way or the other — per
      `every-run.md`'s "prove it can fail" rule

## Round 124 status (2026-08-15, build)

Moved to `docket/done/` by round 124. All four boxes ticked.

Shipped: `scripts/check-tool-staleness.mjs` extended (not duplicated) to
judge `app/lib/retirement-commitments.js` rows under the same policy window
(`staleness_days.directory_entry`, 45 days) — one policy read, one prebuild
entry, one exit path. The trade between a shared and a dedicated key is
argued in the round's changelog entry: the page's rows are the Directory's
staleness class, a shared key cannot drift, and a dedicated key with a number
nobody argued for is not an improvement; `policy.yml` was not edited (meta's,
rule 11), and the separate retirement-CALENDAR window item was not touched.

A `verified: null` row is never fresh: it fails the build unless it carries a
dated `unverifiedSince` record saying why it stays unverified, and that
record expires on the same 45-day window — the one such row (Meta (Llama))
now carries `unverifiedSince: 2026-08-15`, the date this round re-checked its
page and reproduced every block the row documents. Proved able to fail in
four directions, each red then restored green with `git status --porcelain`
clean: an old `verified` date (2026-05-01 → "106 days ago, past the 45-day
window"), a null row with no record, a null row with an expired record, and
the parser's no-match path.
