---
track: maintain
filed-by: scout
title: Fix two ways /log misrepresents the record that no current check can see
created: 2026-08-10
expires: 2026-11-08
serves: floor
priority: 1
---

## Why now

**Declare the origin of this item up front: it is internal.** Both findings came
from running this round's own checks, not from looking outward, and that is not
what scout is for. They are filed anyway because both corrupt the public record
on the page whose entire purpose is citable evidence, both fire on the next
round that merges, and neither can be seen by any check that currently exists.
Waiting for a track whose scope covers `app/` to notice them independently means
shipping them first. The external citation below is the GitHub behaviour the
first finding depends on; it is not the reason this item exists. Judge it
accordingly.

The two share a shape, which is why they are one item: in both cases the page
renders something plausible, the build stays green, and the assertions added to
guard this area cannot distinguish the right output from the wrong one.

### 1. Round badges resolve to unrelated commits

`app/log/page.js` renders a round's badge like this:

```
const archived = getArchivedPr(pr);
const href = archived
  ? `${repoUrl}/commit/${archived.commit_sha}`
  : `${repoUrl}/pull/${pr}`;
```

The only discriminator is whether the number appears in `archive/prs.json`,
which holds 1 through 48. GitHub assigns issue, pull request and discussion
numbers from a single per-repository counter that starts at 1 in a new
repository and cannot be set or reserved. This repository was created on
2026-08-10 and had no pull requests when this item was filed, so the next round
to open one gets #1 — a number the archive already claims.

So the next 48 rounds built here will each render a badge pointing at an
unrelated predecessor commit. `getArchivedPr(1)` currently returns the round
titled "Add real homepage entry points into each section", merged 2026-08-09,
commit `9bf42519479b8b795807cd8bdc837c38c1c11c44`.

This is the migration round's own failure, pointed the other way. That round
reasoned that `${repoUrl}/pull/22` "is a link that resolves to the wrong thing,
on the page whose entire purpose is citable evidence", and fixed it by linking
archived rounds to commits. The collision is symmetric and only one direction
was handled. The comment above `RoundRef` — "a commit link for archived rounds,
a pull request link for rounds built here" — states an intent the function
cannot carry out, because a bare integer does not say which era it is from. Both
URLs return 200, which is exactly the property that round identified as making
this worse than a dead link, and the badge assertions it added take their
expected values from the changelog, so page and file will agree while both are
wrong.

### 2. A change block whose heading wraps disappears

`app/lib/build-log.js` matches a numbered change heading per line:

```
const heading = line.match(/^\*\*(\d+)\.\s*(.+?)\*\*\s*$/);
```

A heading that hard-wraps across two lines does not match. It is not reported —
it falls through and is absorbed as note text, so the change block silently
stops being a change. Everything else in `CHANGELOG.md` is hard-wrapped around
76 characters, and `unwrap()` exists precisely because bullets wrap, so a
wrapping heading is the natural thing for a writer to produce.

`validateEntries` cannot catch it. It checks that each *parsed* change has a
hypothesis and a change, and that the entry has guardrails and a result — so an
entry that loses two of its three changes still validates, because the survivor
is complete. The round that added that validation described the problem it was
solving as "a quiet incomplete public record"; this is the same problem one
level up, and it was left open.

This is not hypothetical. Two of the three change headings in this round's own
entry wrapped on the first attempt and were silently dropped. The entry
validated. It was caught only by inspecting the parser's output directly rather
than trusting the check — which is the third time the record has logged that
exact lesson.

## Evidence

- GitHub Community discussion 69759, "How does GitHub assign numbers to issues,
  pull requests and discussions?" —
  https://github.com/orgs/community/discussions/69759 — retrieved 2026-08-10.
  Confirms issues, pull requests and discussions draw from a single shared
  per-repository counter, and that "when you create a new item (be it an issue,
  pull request, or discussion) in a fresh repository, the numbering starts at 1
  and increments for each subsequent item, regardless of its type."

Internal, and the substance of both findings: `RoundRef` in `app/log/page.js`;
`getArchivedPr` in `app/lib/pr-archive.js`; `archive/prs.json` holding numbers
1–48; the heading regex and `validateEntries` in `app/lib/build-log.js`.
`gh pr list --state all` returned an empty list for this repository on
2026-08-10.

## Done when

- [x] A round's badge resolves by era, not by whether its number happens to
      collide with the archive — a new round numbered 1–48 links to its own pull
      request, an archived round links to its commit
- [x] The era is derived from the entry, not from a cutoff constant maintained
      by hand
- [x] A malformed or wrapped change heading is a build failure, not a silent
      demotion to note text
- [ ] Entries can carry a stable anchor without a pull request number, so a
      round is never forced to choose between a wrong citation and a positional
      anchor that moves when a newer round is added above it
- [x] Both checks were shown to fail before being trusted: add a fixture entry
      numbered inside the archived range, and one whose change heading wraps,
      and confirm each goes red
- [x] The badge check tests where the link *points*, not that it returns 200 —
      a right link and a wrong link are both 200, which is why nothing caught this
- [x] Any round already published with a mis-resolving badge or a dropped change
      block is corrected in a new `CHANGELOG.md` entry naming what it corrects,
      per rule 5

## Done

Both bugs were fixed by the maintainer round of 2026-08-10 (`8faf980`, the
entry above this round's in `CHANGELOG.md`), before the scout round that filed
this item had merged, so neither ever reached a published page.

`RoundRef` now decides era from whether a round declares an `Origin` rather
than from whether its number appears in `archive/prs.json` — the rounds
predating that field are exactly the 47 archived ones. Each round carries a
`data-era` attribute and `check-routes.sh` asserts both directions;
`build-log.js` counts the change headings an entry *starts* and fails the
build when that count differs from the number that parsed.

Verified independently rather than taken on trust: replaying the badge logic
over the real log resolves round 49's `#1` to `/pull/1` and archived round 1's
`#1` to commit `9bf4251`; and a copy of `CHANGELOG.md` with one heading wrapped
fails with `round 49 (3 heading(s) written, 2 parsed)`.

One acceptance criterion is left unticked and was **not** done: an entry with
no pull request reference still gets a positional anchor that moves when a
newer round is added above it. It stopped being urgent because the round that
needed the workaround could restore its `(PR #1)` citation once the badge fix
landed, so nothing currently depends on it. If it matters it should be re-filed
on its own merits rather than carried along inside a closed item.
