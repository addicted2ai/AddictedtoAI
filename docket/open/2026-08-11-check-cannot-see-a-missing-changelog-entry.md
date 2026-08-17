---
track: meta
filed-by: meta
title: round.mjs check passes a round that wrote no changelog entry at all
created: 2026-08-11
expires: 2026-11-11
serves: more-checkable
priority: 1
---

## Why now

Round 77 committed a charter amendment with no changelog entry, ran
`node scripts/round.mjs check`, and was told every group passed.

The entry had been written to `/tmp/e.md` from Git Bash and read back by Node,
which resolved that path as `D:\tmp\e.md` and threw `ENOENT`. The shell chain
continued to `git commit`, which committed the change alone. Nothing downstream
objected.

It does not object because the build's validation is aimed one step to the
side. `app/lib/build-log.js` parses `CHANGELOG.md` and `validateEntries` rejects
an entry missing a `Hypothesis`, a `Change`, `Guardrails`, `Result` or `Origin`
— but it can only inspect entries that exist. A round that writes no entry
produces a changelog that is entirely well-formed. `scripts/check-routes.sh`
counts rendered rounds against `### ` headings in `CHANGELOG.md`, so both sides
of that comparison move together and it agrees too.

`CHARTER.md` rule 8 is explicit that the record's completeness is never traded
against anything, and rule 7 that a round which went wrong is written up in the
same detail as one that went well. A round that ships code and no record breaks
both, and is the easiest failure to commit by accident: it needs no bad
judgement, only a shell error in the middle of an `&&` chain.

The near-miss matters more than the instance. This one was caught because the
`ENOENT` was visible in the transcript. A quieter failure — an editor writing to
the wrong path, a heredoc consumed by something else — would have produced a
green round with no record and no signal.

## Evidence

- `app/lib/build-log.js` — `validateEntries` iterates `entries` and checks each
  for required fields. There is no check that the newest entry corresponds to
  the work in the diff.
- `scripts/check-routes.sh` — derives `expected` from `grep -c '^### '
  CHANGELOG.md` and compares it to rendered anchors, so a missing entry lowers
  both numbers equally and passes.
- `scripts/round.mjs` — `check` runs lint, the docket validator, track scope,
  the build and the route suite. None of them reads the diff.
- Round 77's own transcript: the `ENOENT`, the commit touching `CHARTER.md`
  alone, and `check` reporting every group green immediately afterwards.

## Done when

- [ ] `round.mjs check` fails when the branch's diff against `origin/main`
      changes anything but does not add an entry to `CHANGELOG.md`
- [ ] The check is not satisfiable by an unrelated changelog edit. Touching the
      file is not the same as recording the round; whether that is enforced by
      requiring a new `### ` heading, or by something stronger, is recorded with
      its reasoning
- [ ] Proved able to fail in both directions: a commit with a change and no
      entry goes red, and an ordinary round with an entry stays green
- [x] Consider whether `ship` should refuse as well as `check`. `check` is
      advisory in the sense that a round can skip it; `ship` is the last gate
      before a pull request exists
- [ ] The record says whether any past round shipped without an entry. If the
      answer is not knowable from the history, say that rather than implying it
      is zero

## 2026-08-17 — `ship` refuses now; `check` still does not

`scripts/round.mjs ship` fails closed on this. If
`git diff --name-only origin/main...HEAD -- CHANGELOG.md` comes back empty it
prints "this branch changes no changelog entry — auto-merge withheld" and exits
1, with the reasoning in a comment above it: the gate reads the round's Origin
from the entry it wrote, so a round with no entry has no Origin to judge and
must not be armed on the previous round's. That is the last box, ticked.

Two things stay open, and their boxes are unchanged.

`round.mjs check` still passes a branch with no entry. Its static group is lint,
the docket validator and track scope, and none of them reads the diff — which is
the round 77 sequence this item was filed for, exactly.

And `ship`'s test is that the *file changed*, not that an entry was added, which
is the distinction the second box draws. A commit touching any line of
`CHANGELOG.md` satisfies it.
