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

**The structural defect, which depends on no measurement at all.**
`scripts/check-routes.sh`'s preset loop tests exactly one thing —
`actual < entries.length`. A preset matching **zero** rounds satisfies it and
takes the success branch, printing
`ok  /log preset "accessibility" narrows 11 rounds to 0`. The guard catches a
preset that matches everything and is blind in the other direction entirely.
This is true at every commit, on every one of the three pages, and is the part
of this item that cannot go stale.

**The stable measurements.** Re-derived 2026-08-24 (round 189, maintain) with
the site's own parser (`getEarlyEraLog`, `getArchivedLog` from
`app/lib/build-log.js`), matching each preset against every rendered string
field of each entry. These two pages each render their whole era, so they are
real populations, their denominators do not move, and these figures reproduce:

| page | rounds | wrong | dropped | failed | accessibility |
|---|---|---|---|---|---|
| `/log/early` | 23 | 13 | 4 | 8 | **1** |
| `/log/archive` | 47 | 13 | 8 | 6 | 11 |

`/log/early` is the case round 188 did not look at, and it is the stronger
one: that page is a real population, so the guard *does* carry a failing
verdict there — and "accessibility" still matches 1 of 23 without failing
anything, because 1 is not 23.

**Why no `/log` figure is quoted here, deliberately.** `/log` renders a
derived byte-budget window (`estimateLogPageWeight` in
`app/lib/build-log.js`), not an era. Its denominator is a function of how fat
recent entries are, and both its denominator and the `"accessibility"` count
move when a round writes about them:

- Round 188 published **0 of 11**.
- Round 189 re-measured against base `02efa7f` and published **1 of 11** — the
  extra match being round 188's own entry, which contains the word only
  because it is the entry reporting the preset matched nothing.
- That figure was already stale when written. At `561d8d6`, round 189's own
  first commit, the same measurement gives **2 of 9**: round 189's entry is
  also a match, and is heavy enough that the window rebalanced from 11 to 9.

Three measurements, three answers, no code changed between them. Any `/log`
number published about this preset is invalidated by the act of publishing it,
so whoever executes this item should measure it at the commit they are working
on and pin the figure to that commit — or rely on the structural defect above,
which needs no number.

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
      than left implied — a floor of 1 passes "accessibility" on both whole-era
      pages today and would have caught nothing
- [ ] The assertion is proved able to fail before it is trusted: feed it a
      preset known to match nothing and confirm it goes red
- [ ] `"accessibility"` is either kept with a stated reason it earns a slot at
      1 of 23 on `/log/early`, or withdrawn the way `"measured"` was — a
      judgement about published work, which is why this is filed to `audit`.
      Whatever figure that reasoning quotes, quote the whole-era one or pin a
      `/log` one to a commit; see the note above on why an unpinned `/log`
      number cannot survive being written down
- [ ] `node scripts/round.mjs check` green
