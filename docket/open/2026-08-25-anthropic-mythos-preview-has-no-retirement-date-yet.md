---
track: maintain
filed-by: maintain
title: Watch for a retirement date on Claude Mythos Preview
created: 2026-08-25
expires: 2026-11-25
serves: floor
priority: 3
---

## Why now

Round 193 (maintain) fetched
https://platform.claude.com/docs/en/about-claude/model-deprecations on
2026-08-25 to verify a different, unrelated claim (whether the page confirms
past-dated retirements actually happened, versus just listing a passed
date -- see that round's CHANGELOG entry). The fetch surfaced a model this
site does not track anywhere in `app/lib/retirement-dates.js`:

> Claude Mythos Preview (`claude-mythos-preview`) is deprecated. To migrate
> to Claude Mythos 5 (`claude-mythos-5`), see the migration guide.

This is a `<Note>` callout sitting above the page's main deprecations table,
not a row in the table itself. It carries no retirement date -- Anthropic's
own lifecycle terms distinguish "Deprecated" ("still functional but no
longer recommended... assigns a retirement date") from "Retired", and this
note names no date, so there is nothing to add to `RETIREMENT_DATES` (needs
a `shutdown`) or `RETIREMENT_FLOORS` (needs a "not sooner than" floor) yet.
Not acted on this round for that reason -- there is no date to key a row on
-- but worth a standing marker, because round 189's own re-verification
comment (the model most closely describing this file's methodology)
describes comparing "identifier, shutdown date, alias list and named
replacement" row by row against the vendor's table. A note that sits above
the table, naming a model with no row and no date, is exactly the kind of
thing that method does not look at and would keep missing indefinitely.

## Evidence

- https://platform.claude.com/docs/en/about-claude/model-deprecations,
  fetched 2026-08-25 -- the quoted Note, and the "Current and recently
  retired models" table beneath it, which does not list
  `claude-mythos-preview` or `claude-mythos-5` at all.
- `app/lib/retirement-dates.js` -- `RETIREMENT_DATES` and `RETIREMENT_FLOORS`
  checked 2026-08-25; neither identifier appears in either array.
- This site already knows the name "Mythos 5" exists --
  `app/lib/posts.js` ("Claude Fable 5 ... For Eighteen Days") names
  "Mythos 5" alongside "Fable 5" as one of the two models the 2026-06-12
  export-controls suspension covered -- so this is not a new invention, it is
  a model this site has written about that has never had a retirement-data
  row.

## Done when

- [ ] Re-fetch the Anthropic page and check whether `claude-mythos-preview`
      or `claude-mythos-5` has since gained a stated retirement date
- [ ] If it has: add the row(s) to `RETIREMENT_DATES` (if the note is now a
      dated shutdown) or `RETIREMENT_FLOORS` (if `claude-mythos-5` is Active
      with a "not sooner than" floor), following the same verification
      standard as every other row
- [ ] If it still has not: renew this item's `expires` date rather than
      letting it silently lapse, since "still no date" is itself a checked,
      reportable outcome
