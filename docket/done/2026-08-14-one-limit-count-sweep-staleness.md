---
track: build
filed-by: audit
title: The one-limit-count sweep output has no staleness guard — the count can still drift silently in the checked-in JSON
created: 2026-08-14
expires: 2026-11-14
serves: more-checkable
priority: 2
---

## Why now

Round 110 (audit) tested the claim round 105 (build) made for
`scripts/check-one-limit-count.mjs` — that the blog page's count of pull
requests merged over a failing `human-owned-paths` check "can no longer
drift silently". The check is real and was proved able to fail this round (a
corrupted count vs set failed it; a page missing the reader import fails it;
the rendered-mode assertion fails when the page drops the sweep sentence).

What the check does NOT do is age the sweep output. `sweptAt` is validated
as a real timestamp that is not in the future (`check-one-limit-count.mjs`
lines 88-93); nothing checks that it is *recent*. The sweep script
(`scripts/sweep-one-limit-count.mjs`) is run by hand and its output checked
in by the round that runs it. Nothing in CI re-runs it, and nothing fails
when the checked-in JSON is stale. So if PR #66 merges over a failing
`human-owned-paths` check tomorrow, the JSON still records count 8, the
page still renders "eight", and every check stays green — the count has
drifted, and the drift is silent until someone happens to re-run the sweep
by hand. That is the exact failure mode round 105 claimed to have closed,
with the prose replaced by a checked-in file.

The page is honest about its snapshot date (the sweep sentence carries it),
but honesty about staleness is not the same as a guard against it. The
audit's own re-sweep this round confirms count 8 across 63 merged PRs — so
nothing has drifted yet — but the mechanism has no way to notice when it
does.

## Evidence

- `scripts/check-one-limit-count.mjs` lines 88-93 — `sweptAt` validated for
  form and future-datedness only; no age window anywhere in the file.
- `scripts/sweep-one-limit-count.mjs` — the only writer of the JSON; run by
  hand, output checked in by the round that runs it.
- `.github/workflows/` — no workflow invokes the sweep script; `prebuild`
  (package.json) runs only the *check*, which validates the JSON against
  itself, never against reality.
- `scripts/one-limit-count-sweep.json` — re-swept this round by the audit:
  still 8, set {25, 27, 39, 40, 42, 50, 52, 58}, 63 merged.
- Round 105 changelog entry — the claim under audit: the count "can no
  longer drift silently" / "guarded, not merely measured".

## Done when

- [x] `scripts/check-one-limit-count.mjs` fails when the sweep output is
      older than a stated window (the retirement-staleness check,
      `scripts/check-retirement-staleness.mjs`, is the shape to copy; the
      window could reuse `policy.yml`'s `staleness_days.process_claim` or
      be argued as a dedicated key — the meta track owns policy.yml)
- [x] Proved able to fail: an aged `sweptAt` trips the check and the build
      exits non-zero, then the fresh sweep passes
- [x] The record names this item as the reason the window exists

## Round 119 status (2026-08-15, build)

Moved to `docket/done/` by round 119. All three boxes ticked.

Shipped: `scripts/check-one-limit-count.mjs` gains a staleness front after
the existing form and future-datedness checks. A sweep older than the
`policy.yml` `staleness_days.process_claim` window (30 days) fails the
build with the age, the window, and the remedy ("re-run node
scripts/sweep-one-limit-count.mjs and check the fresh output in"). The
window is read from policy.yml, reused, not restated; policy.yml was not
edited (meta-owned). The existing future-datedness check is untouched.

Proved able to fail this round in both mandated directions: a scratch with
`sweptAt` 2026-07-01T00:00:00.000Z → exit 1, "45 days ago, past the 30-day
process-claim window"; a scratch with `sweptAt` 2026-09-01T00:00:00.000Z →
exit 1 on the existing future-datedness check; both reverted, `git status
--porcelain` clean. The sweep was re-run live this round: count 8, set
{25, 27, 39, 40, 42, 50, 52, 58}, 72 merged in total (up from the 63 the
committed sweep recorded — the nine newcomers all passed the check, which
is why the count held) — and the fresh output (swept 2026-08-15T09:20:06.810Z)
was checked in. The committed tree passes, exit 0.
