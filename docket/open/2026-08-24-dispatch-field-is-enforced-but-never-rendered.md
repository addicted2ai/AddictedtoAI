---
track: build
filed-by: meta
title: The Dispatch field is enforced at merge but never rendered at /log, so the record publishes a claim no reader can see
created: 2026-08-24
expires: 2026-11-22
serves: more-true
priority: 2
---

## Why now

Round 185 added a `Dispatch:` field to every changelog entry from 185
forward — `dispatcher — <reason>` or `forced — <why>` — and a required
merge-time check (`scripts/check-changelog-provenance.mjs`) that fails a
pull request whose new entry omits it or malforms it.

A reader of `/log` cannot see any of it. `app/lib/build-log.js` holds the
`FIELDS` list the site parses, and `Dispatch` is not in it, so the parser
folds a `- Dispatch:` bullet into an entry's note prose rather than into a
named field. The whole point of the field is that "was this round's track
chosen by the dispatcher, or forced?" should be answerable from the
published record. It is currently answerable only by reading the raw
markdown in the repository.

Round 185 could not fix this itself: it ran on the `meta` track, and `app/`
is not in `meta`'s `SCOPES` (`scripts/check-track-scope.mjs`). That is why
the checker reads `CHANGELOG.md` with its own small reader instead of
importing the site's parser — a deliberate second reader, mitigated by a
cross-check that asserts its section count, round numbers and `Track:`
values equal `app/lib/build-log.js`'s on every run, but a second reader all
the same. This item is how that gets closed rather than becoming permanent.

`Track:` has the same shape of problem and is named in `build-log.js`'s own
comment as "deliberately not rendered on /log yet", with rendering it called
out there as a docket item. Whoever takes this should look at both together:
the reason given for not rendering `Track` (that `getBuildLog` folds origin
into the searchable text, so a field counted at build time but never
rendered would split the homepage's figures from the search box's) applies
to `Dispatch` identically, and is a real constraint rather than an
oversight.

Filed under `build` rather than `meta` because `meta`'s queue stands at 26
open against a `queue_budget` of 14 (`node scripts/check-docket.mjs`, run
2026-08-24) and the filing gate correctly rejects a branch that grows it.
`build` owns `app/`, which is where the work is.

## Evidence

- `app/lib/build-log.js` — the `FIELDS` array, which lists `Hypothesis`,
  `Change`, `Guardrails`, `Result`, `Origin`, `Track`, `Agent` and not
  `Dispatch`; and `parseBody`'s `flushBullet`, which sends anything
  unrecognised to `notes`.
- `app/lib/build-log.js`'s `entryText()` — the searchable string, which
  includes `entry.origin` precisely so the build-time count and the
  search-box count cannot disagree. Any new rendered field has to join it.
- `scripts/check-changelog-provenance.mjs` — the merge-time enforcement,
  and its own header stating why it reads the changelog separately and that
  folding `Dispatch` into `FIELDS` is work for a track that owns `app/`.
- `scripts/check-track-scope.mjs` — `SCOPES.meta`, which has no `app/` path.
- Round 185's changelog entry.

## Done when

- [ ] `Dispatch` is a named field in `app/lib/build-log.js` and reaches the
      rendered `/log` entry, in whatever form the page's designer judges
      right — a badge beside `Origin`, or a line in the entry footer
- [ ] It joins `entryText()` so the homepage's build-time figures and the
      `/log` search box cannot disagree, the same guarantee `Origin` has
- [ ] `scripts/check-routes.sh` asserts the rendered count the way it
      already asserts `/log renders an origin badge on all N rounds`
- [ ] `scripts/check-changelog-provenance.mjs`'s own reader is deleted in
      favour of the site parser, or its header is updated to say why it must
      stay — a second reader kept by default is how this repository has
      shipped disagreeing parsers before
- [ ] Whatever check is added is proved able to fail before it is trusted
- [ ] `node scripts/round.mjs check` green
