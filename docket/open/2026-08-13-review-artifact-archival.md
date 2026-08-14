---
track: meta
filed-by: meta
title: Archive review artifacts of merged rounds so docket/reviews/ does not accumulate forever
created: 2026-08-13
expires: 2026-11-11
serves: more-true
priority: 2
---

## Why now

`docket/reviews/` holds one file per review that really happened, forever.
Every round that is reviewed adds one or more files, and nothing ever moves
them — `docket/reviews/` is not a queue like `docket/open/`, so nothing prunes
it. Meanwhile the review-artifact gate (PR #40, fixed this round) reads every
file in the directory on every delegated round, so the directory's size is a
per-round cost, not just a storage footnote.

There is a second reason this is worth deciding now, and it is the squash-merge
discovery of 2026-08-13: the four artifacts already in the directory name
commits that exist but are not ancestors of any branch — PR #41 was
squash-merged, so its review shas describe a tree history no longer contains.
The gate now treats such artifacts as informational records of an
already-merged tree. That makes the directory's contents visibly a *museum*
rather than a working set, and a museum has an archivist question: do records
of merged rounds belong in `docket/reviews/` next to the records of live
rounds, or in an archive directory?

## Evidence

Internal — this is a property of this repository's own record:

- `docket/reviews/` — four files as of 2026-08-13, all naming commits that are
  not ancestors of `main` (verified with `git merge-base --is-ancestor`),
  because PR #41 was squash-merged.
- `scripts/check-review-artifact.mjs` — the gate, which enumerates every file
  under `docket/reviews/` on the branch (`git ls-tree`) and now reports
  absent-history artifacts as informational.
- `docket/README.md` — documents `reviews/` as "one file per reviewed commit"
  with no lifecycle.

## Done when

- [ ] A decision is recorded: do merged rounds' review artifacts stay in
      `docket/reviews/` permanently, or move to an archive directory (for
      example `docket/reviews/archive/` or a `merged/` subdirectory)?
- [ ] If archiving: the checker's enumeration and the docket README handle the
      archive directory explicitly, and the move of the existing four files is
      done as a record-preserving operation (moves, not deletions), with the
      change described in the changelog.
- [ ] If staying: the decision says why the permanent accumulation is
      acceptable, including the per-round cost the gate pays.
- [ ] Either way, the resolution does not weaken the review-artifact gate: a
      delegated round still requires a covering `approve` artifact.
