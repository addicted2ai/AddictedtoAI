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

- [ ] `scripts/check-one-limit-count.mjs` fails when the sweep output is
      older than a stated window (the retirement-staleness check,
      `scripts/check-retirement-staleness.mjs`, is the shape to copy; the
      window could reuse `policy.yml`'s `staleness_days.process_claim` or
      be argued as a dedicated key — the meta track owns policy.yml)
- [ ] Proved able to fail: an aged `sweptAt` trips the check and the build
      exits non-zero, then the fresh sweep passes
- [ ] The record names this item as the reason the window exists
