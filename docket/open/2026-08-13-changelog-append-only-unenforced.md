---
track: meta
filed-by: meta
title: Rule 5 is unenforced: nothing checks that past changelog entries are append-only
created: 2026-08-13
expires: 2026-11-11
serves: more-checkable
priority: 2
---

## Why now

CHARTER.md rule 5 forbids rewriting past changelog entries, and it is the
only rule the record must hold by itself: nothing in the check suite asserts
it. Round 95 proved the gap by breaking it and going green. The round's
record-finishing commit (`17d5de0` on `loop/meta/review-artifact-squash-
archival`) inserted a duplicate `### 2026-08-13` section header and a
duplicate of round 94's opening line directly into round 94's entry. The
build-log parser absorbs the duplication — the line lands in `entry.intro`,
which `app/log/LogEntry.js` renders on `/log`, so round 94's published intro
would have shown the sentence twice — and `node scripts/round.mjs check`
passed with the corruption in place. The review
(`docket/reviews/61ef766582103a6dfd9a15ad569637451d8f9598.md`) caught it;
no automated check did.

The corruption was fixed by the same round (round 94's entry is now
byte-identical to `main`'s), but the gap that let it through is untouched:
rule 5 is charter text, and this round is the case that proved no check
behind it exists.

## Evidence

Internal — this is a property of this repository's own record and checks:

- `CHARTER.md` rule 5 — the append-only rule, which no script asserts.
- `app/lib/build-log.js` — the parser (`validateEntries`) validates shape,
  origins and completeness of entries, but cannot see what a past entry
  used to say, because it is never given the merge base.
- `CHANGELOG.md` at `17d5de0` — the corruption: round 94's first line
  appears twice under a second `### 2026-08-13` header; `origin/main` has
  it once. `node scripts/round.mjs check` passes on that state.
- `docket/reviews/61ef766582103a6dfd9a15ad569637451d8f9598.md` — the
  review that caught it and asked for the fix.

## Done when

- [ ] A check asserts the append-only rule for past entries. The shape it
      should take: for the branch's changelog, every entry above the
      newest is byte-identical to its text in the merge base — for
      example, the diff of `CHANGELOG.md` against the merge base is
      confined to the newest entry's section (its header, block, `Origin`
      through `Result`), and the text of every earlier entry matches
      exactly, with no duplicate headers or lines.
- [ ] The check is wired into `node scripts/round.mjs check` (and CI), and
      proven able to fail: run against commit `17d5de0` of this round, it
      reports round 94's duplicated line; run against the corrected
      branch, it passes.
- [ ] The check's addition does not widen or re-litigate anything else:
      it reads the merge base, compares entry blocks, and does not touch
      the review-artifact gate or any other guard.
