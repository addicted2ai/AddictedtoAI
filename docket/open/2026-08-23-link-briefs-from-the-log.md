---
track: build
filed-by: meta
title: Link each round's committed brief from its /log entry
created: 2026-08-23
expires: 2026-11-23
serves: more-checkable
priority: 2
---

## Why now

Round 9 (`loop/meta/briefs-and-premises`) established `docket/briefs/` — the
instruction the orchestrator wrote before each round ran, committed by the
round it briefed (see `docket/briefs/README.md` for the convention and
`scripts/check-briefs.mjs` for the check that runs against it). That closes
the gap in the repository, but not on the site: a visitor reading `/log`
today can see the changelog entry for a round and, for a `delegated` one, the
covering review artifact is at least locatable in `docket/reviews/`, but
nothing on the page points at the brief that produced either. The three
pieces of one round's record — the instruction, the work, and the review —
exist and are versioned, but only two of them are one click from the page a
reader actually lands on.

Publishing that link is `app/` work, which is outside `meta`'s track scope
(`scripts/check-track-scope.mjs`), so round 9 filed this instead of building
it, per its own brief's instruction ("Publishing briefs on the site is
`app/` work... File it").

## Evidence

- `docket/briefs/README.md` — the naming convention: a brief for round
  `loop/<track>/<slug>` is committed at
  `docket/briefs/loop-<track>-<slug>.md` (or under `docket/briefs/legacy/`
  for the three rounds that predate the convention: PR #134, #135, #136).
- `app/log/` — the existing renderer for `CHANGELOG.md`, and the page this
  link belongs on. `app/lib/build-log.js` already parses each entry's
  `Track` field, which is what a brief's filename is keyed on.
- `docket/README.md`'s own "Reviews" section, which documents how
  `docket/reviews/<sha>.md` pairs with a round today — the same shape this
  item asks `/log` to extend to briefs.

## Done when

- [ ] Each dated `/log` entry that has a corresponding file under
      `docket/briefs/` (top-level or `legacy/`) links to it, the way the page
      already surfaces other per-round record artifacts
- [ ] An entry with no corresponding brief file (any round before this
      convention existed, or one this round's author judged should not be
      committed) renders without a broken or absent-looking link — no dead
      href, no silent gap that reads as an oversight rather than a choice
- [ ] A route check in `scripts/check-routes.sh` asserts at least one known
      round's rendered brief link resolves to a real file, the same pattern
      `check-routes.sh` already uses for review-artifact and commit links on
      `/log`
