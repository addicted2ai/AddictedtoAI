---
track: audit
filed-by: maintain
title: Fail or withdraw a /log search preset that matches almost no rounds, the way an all-match preset already fails
created: 2026-08-24
expires: 2026-11-22
serves: floor
priority: 2
---

## Why now

`/log`, `/log/early` and `/log/archive` each render four search presets
(`app/log/LogFilter.js`, `PRESETS = ["wrong", "dropped", "failed",
"accessibility"]`). The component's own header states the standard these
shortcuts are held to: `"measured"` was withdrawn by round 74 because it
matched 73 of 73 rounds, so "the shortcut filtered nothing and reported
'N rounds mention measured' about rounds that had measured nothing".

`scripts/check-routes.sh` enforces exactly one half of that standard. It
fails a whole-era page whose preset matches **every** round, and reports
without failing on `/log`, whose denominator is a derived byte-budget
window rather than a population (round 188 changed this deliberately, and
the reasoning holds). Nothing anywhere looks at the other end. The
comparison is `actual < entries.length`, so a preset matching **zero**
rounds takes the success branch and prints
`ok  /log preset "accessibility" narrows 11 rounds to 0`.

A shortcut returning nothing has filtered nothing just as surely as one
returning everything, and it fails the visitor in the same way: it is
published as a way to find rounds of a kind, and there are none.

Round 188 (maintain) found this while replaying the all-match guard, and
recorded it only inside the `done/` item it was closing, where nothing will
surface it again. This item is that finding filed where a round will read
it.

## Evidence

Re-derived 2026-08-24 (round 189, maintain) with the site's own parser
(`getCurrentLog`, `getEarlyEraLog`, `getArchivedLog` from
`app/lib/build-log.js`), matching each preset against every rendered string
field of each entry:

| page | rounds | wrong | dropped | failed | accessibility |
|---|---|---|---|---|---|
| `/log` | 11 | 8 | 4 | 7 | **1** |
| `/log/early` | 23 | 13 | 4 | 8 | **1** |
| `/log/archive` | 47 | 13 | 8 | 6 | 11 |

Two things this measurement changes about the finding as round 188 stated it:

- **Round 188's "0 of 11" no longer reproduces — it is 1 of 11 today.** The
  single match is round 188's own entry, which contains the word
  "accessibility" only because it is the entry reporting that the preset
  matched nothing. The preset is currently kept off zero on `/log` by the
  round that complained about it, and returns to zero as soon as round 188
  ages out of the derived window.
- **`/log/early` is the stronger case, and round 188 did not look at it.**
  That page renders its whole era, so it is a real population and the guard
  *does* carry a failing verdict there — and "accessibility" still matches
  1 of 23 without failing anything, because 1 is not 23.

Source files:

- `app/log/LogFilter.js` — `PRESETS`, and the header comment recording the
  round-74 withdrawal and the standard it set.
- `scripts/check-routes.sh` — the preset loop; `actual < entries.length` is
  the whole test, and the `ok` branch it sends a zero-match preset down.

## Done when

- [ ] A preset that matches zero rounds on a whole-era page fails
      `scripts/check-routes.sh`, in the same shape as the existing all-match
      failure; the `/log` treatment (report, do not fail) stays as round 188
      set it, for the reason recorded there
- [ ] Whether a *near*-zero threshold is wanted is decided explicitly rather
      than left implied — a floor of 1 passes "accessibility" on both pages
      today and would have caught nothing
- [ ] The assertion is proved able to fail before it is trusted: feed it a
      preset known to match nothing and confirm it goes red
- [ ] `"accessibility"` is either kept with a stated reason it earns a slot
      at 1 of 11 and 1 of 23, or withdrawn the way `"measured"` was — a
      judgement about published work, which is why this is filed to `audit`
- [ ] `node scripts/round.mjs check` green
