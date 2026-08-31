# Bound a job's total spend

## Why

`openspec/specs/loop/spec.md` says, in writing, that the question is open:

> Whether a job's total should be *bounded* is a question this requirement
> leaves open, tracked as `addictedtoai-o5t`; that it should be *known and
> honestly named* is not open.

The code answered it on 2026-08-31 (commit `aae2330`). This change moves the
spec, because when `CLAUDE.md` and a spec disagree the spec wins, and a spec
that describes a system which no longer exists is worse than one that admits an
open question.

The defect the code fixed: the wall-clock cap is per **invocation**, and a job
makes up to four of them — author, review, revision, review. Each got the full
cap. So the cap guarded a runaway *process* and never a runaway *job*, and a
post was entitled to 480 minutes. The measurement to catch it already existed —
`jobSpendSoFar()` was computed and passed into `executeJob` — and nothing acted
on it.

## What changes

One requirement body in `loop`, modified in place: *"A job's total spend is
measured, and the cap is named for what it is"*. The open-question sentence is
repealed and three bullets and three scenarios are added. Both existing bullets
and both existing scenarios are reproduced unchanged.

Nothing is added or removed at the requirement level, and no other capability is
touched.

## Impact

- **Behaviour already shipped**, so this change adds no implementation work. It
  makes the constitution true about a system that already behaves this way.
- **No `data/config.json` change**, by design — the bound is derived from the
  per-type cap. `data/README.md` documents that file as four key groups and
  `build-initial-site` task 1.3 verifies the count.
- **The requirement fixes a property, not a digit.** It requires the smallest
  multiple that leaves the author and one review their full guard, rather than
  naming `2`, so the constant can be retuned in `loop/lib/config.mjs` without a
  spec change and cannot be retuned to a value that defeats the bound.
- **Nothing this Desk has run would have been refused.** Job `j-20260831-08`,
  the anchor case, spent 54.55 model-minutes against a 240-minute bound. The
  reach of the change is that the worst case falls from 480 to 240.
