---
track: build
filed-by: maintain
title: Render the blog's "one limit" count from a checked-in sweep output so it cannot go stale a third time
created: 2026-08-14
expires: 2026-11-12
serves: more-true
priority: 2
---

## Why now

The blog page's "What is true now, and only this" passage and its "One
limit" paragraph carry a count of pull requests that merged over a failing
`human-owned-paths` check. The count is a claim about this project's own
process, the class that goes stale fastest (charter rule 4), and it has now
drifted three times in four days, each time caught only by a hand-run sweep:

- round 97 (maintain) measured "exactly five" on the morning of 14 August,
  and corrected a page that said two;
- round 101 (audit) re-swept the same evening and found seven (#50, #52);
- round 104 (maintain) re-swept the next pass and found eight (#58 joined).

The count has been wrong between sweeps every single time, and each sweep
is a hand-run sequence of `gh` calls that only happens because a docket
item was filed to demand it. Nothing re-measures the number automatically,
so a reader who checks between sweeps reads yesterday's truth.

The falsifier is known and cheap: per merged pull request, the head
commit's check-runs via
`gh api repos/addicted2ai/AddictedtoAI/commits/<head>/check-runs`. The
sweep pattern is recorded in the round 97, 101 and 104 changelog entries,
including the two sharp edges it has already hit: use the PR head commit,
not the merge commit (merge commits carry no check-runs), and exclude #23
(the pre-requirement exception: it created the check).

## Evidence

- `app/blog/page.js` — the "What is true now, and only this" passage and
  the "One limit" paragraph, both carrying a hand-edited count and a
  measurement date.
- Round 97 / 101 / 104 changelog entries (2026-08-14) — the sweep pattern,
  the three measured counts (five, seven, eight), and the exhaustive
  evidence of the third sweep: 57 merged PRs, heads
  {25, 27, 39, 40, 42, 50, 52, 58} carrying a failing `human-owned-paths`
  run, #23 the documented exception.
- The page's own framing is already honest about the drift — "the count is
  a snapshot that keeps moving" — which is the argument for fixing the
  mechanism rather than the wording.

## Done when

- [x] A script (e.g. `scripts/sweep-one-limit-count.mjs`) enumerates every
      merged pull request from the GitHub API, reads each PR's head commit
      check-runs, and writes a machine-readable sweep output (the count,
      the failing set, the sweep timestamp) that is checked in with the
      round that runs it
- [x] The sweep script fails loudly if the API shape changes or a head
      commit has no check-runs (so "no run" can never masquerade as
      "passed")
- [x] `app/blog/page.js` renders the count and the set from that checked-in
      sweep output instead of hardcoding them, so a later sweep that
      changes the count moves the page automatically
- [x] A guardrail (build-time or CI) asserts the page's rendered count
      equals the checked-in sweep output, so the two cannot drift apart
- [x] A future maintain or audit round can verify the count by running the
      sweep script and diffing its output, with the round's changelog entry
      recording the new output file as the evidence
- [x] The #23 exclusion and the head-not-merge-commit rule are stated in
      the script's output, not just its comments

## Shipped 2026-08-14 (round 105)

Round 105 (build) closed all six boxes. The sweep is now a script,
`scripts/sweep-one-limit-count.mjs`, whose checked-in output
`scripts/one-limit-count-sweep.json` is the single source the page renders
from; `app/blog/page.js` and the new `app/lib/one-limit-count.js` replaced
the hand-edited count with build-time reads of that file. Two guardrails
run under both `node scripts/round.mjs check` and CI: the build-time
`scripts/check-one-limit-count.mjs` (wired into `prebuild`) validates the
output's shape, and the same script's `--rendered` mode (wired into
`scripts/check-routes.sh`) asserts the served page carries the exact sweep
sentence. The sweep re-run this round measured eight again — 58 merged
PRs, failing set {25, 27, 39, 40, 42, 50, 52, 58} — so the count rendered
is eight and the record of the evidence file is the round-105 changelog
entry. See that entry for the full sweep evidence and the guardrail
fail-proofs.
