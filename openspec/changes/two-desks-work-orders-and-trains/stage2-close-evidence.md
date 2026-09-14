# Stage-2 CLOSE evidence — change two-desks-work-orders-and-trains
Written 2026-09-13 23:5x LOCAL (the machine's zone is Mountain; the local date is 2026-09-13, read as its own command: `date` → Sunday, September 13, 2026 11:50:53 PM).

## The closing sha and what it is
`impl/stage2` head **aa57492** ("task 68c ticked") — the last CODE change sha; the six gates
ran its content green. The pushed head **4c86c12** adds only the gates' own outputs
(the launch measurement + counted-baseline regenerations recomputed BY the gate run),
which is the loop's own records-after-gates order observed live on j-01..j-05.
The `+dirty` suffix in verify-surfaces' footer reads at that moment is the
designed marker, not a defect (the same class is measured under bead 6dpk).

## The six gates, verbatim tails (all run 2026-09-13 23:4x local, on aa57492)
1. `npm test` — `tests 2553 / pass 2553 / fail 0 / cancelled 0 / skipped 0 / todo 0` (duration 1017.8s)
2. `npm run build` — prerendered static content + SSG; exit 0
3. `verify-launch` — `15 check(s) passed / The launch minimums are met.`; exit 0
4. `verify-design` — `46 check(s), 0 failure(s); recorded in data/launch.json`; exit 0
5. `verify-surfaces` — `/wiki footer matches /status.json — 2026-09-14T05:49:15Z · aa57492c960e+dirty` ×N; `all checks passed`; exit 0
6. `verify-analytics` — `4 assertion(s), 0 failure(s)`; exit 0

(Note on script names: AGENTS.md's `verify-launch` / `verify-design` /
`verify-surfaces` / `verify-analytics` are npm aliases that no longer exist;
package.json carries `verify:launch` / `verify:analytics` and the underlying
`scripts/verify-*.mjs` carry all four. The gates are the four scripts +
`npm test` + `npm run build`. The passage's names are the stale-alias class;
that finding belongs to the AGENTS.md second-source story, bead file
addictedtoai-mrld.)

## Row 68c — the last stage row before the accrual
- Fixture arm: `loop/tests/train.test.mjs` "row-68c: main advances mid-train
  while the Pulse is disabled" — green, 9.42s focused; commit 24c96f0.
- Council round 3/3 CONVERGENT: Muse root-caused the one transient red as a
  fixture checkout slip (the ordered run executes ON the train branch; the arm
  had checked out main for the pulse commit and never returned). Luna's probe
  chain validated the production ordering (commit-then-capture at
  refreezeManifestForMain is sound). Qwen's case-2 shape described the exact
  world (an unnamed post-refreeze committer = the pulse tip via the stranded
  checkout) and filed one latent hardening: bead addictedtoai-m4df (:2046's
  git commit takes no pathspec). Final disposition: FIXTURE-ONLY, no
  machinery change, no sealed dispatch — per all three seats.
- The live re-prove on the Pulse's re-enable remains the row's scheduled
  standing condition (row text), fired at the maintainer's flip.

## What remains open in stages 0–2
- **Row 31 only** ("after 20 merged jobs" accrual) — an honest accrual (the
  mechanism's letter), mechanism-noted in the bookkeeping commit 5e590e5.
- Bead addictedtoai-m4df (new tonight, P2) — Stage-3-adjacent hardening.
- The known dropped-file classes from the earlier rounds stand filed (dn44,
  1fnh) — dn44's defect class is exactly the one the no-change-dir guard
  measured tonight on e42978b's predecessor.

## Publish state and brakes
- `data/config.json` publish flag: NOT READ/WRITTEN tonight; the Desk needs
  it false for its overnight drain by MAINTAINER ACCOUNT, and the drain was
  granted on his standing authority (the overnight queue drain 2026-09-13).
- HOLD.md absent; STOP absent; publish stays wherever the file says; NO
  CI were touched; no job cleared any brake.
- The no-push rule is lifted with condition (AGENTS.md 2026-08-28): push
  gated on the six gates — PAST as of this file.

## The branch push
impl/stage2 pushed to origin after this commit per the gate rule: the gates
ran green on the code sha aa57492; docs-only records follow, as the loop's
own records gate has done on every live run this stage.
