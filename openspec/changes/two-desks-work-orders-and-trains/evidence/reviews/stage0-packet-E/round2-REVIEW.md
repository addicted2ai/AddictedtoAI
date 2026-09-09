# Stage 0 packet E — round 2 (delta) — VERDICT: approve

## Sealing

This was an unsealed delta review. I read `REVIEW1.md` and was not sealed
from it. I also opened `RESULT1.md`, `RESULT2.md`, `.agent-brief.md`, and
`CLAUDE.md`; the current round diff and the named production/test files;
`portability.test.mjs`, `no-change-dir-refs.test.mjs`,
`verify-launch-build-reuse.test.mjs`, `worktree-cleanup.test.mjs`,
`branch-cleanup.test.mjs`, `issues.test.mjs`, `review.test.mjs`,
`paths.mjs`, `git.mjs`, `review.mjs`, `conformance.mjs`, `ledger.mjs`,
`runners.mjs`, `run.mjs`, `verify-launch.mjs`, and the current
`data/ledger.jsonl`.

## Findings

None. The round-2 diff is narrow, all three prior named finding mutations are
red, both closure pins are red when reverted, the standing checks are green,
and the author reports a completed final-tip suite at 1,784/1,784.

## The prior findings' arms, re-run

All three used this exact targeted command with TAP output:

```text
node --test --test-reporter=tap D:\addictedtoai-worktrees\fleet6-stage0-E\loop\tests\ledger.test.mjs
```

1. Finding 1: at `loop/run.mjs:1486`, changed
   `authority_sha: mergeBaseSha` to `authority_sha: 'a'.repeat(40)`.
   RED: `# tests 7`, `# pass 6`, `# fail 1`; the integration assertion saw
   the unrelated forty-character value. Restored immediately. The
   `loop/run.mjs` SHA-256 was
   `3F5193C17C2E886BCB1F5D4D6FDC869A47BA23757C13B3C6D7A3EBFC6433C048`.
   GREEN after restoration: `# tests 7`, `# pass 7`, `# fail 0`.

2. Finding 2: at `loop/run.mjs:1484`, changed
   `brief_chars: briefText.length` to `brief_chars: 1`.
   RED: `# tests 7`, `# pass 6`, `# fail 1`; the assertion reported
   `1 !== 13416`. Restored immediately to the same SHA-256
   `3F5193C17C2E886BCB1F5D4D6FDC869A47BA23757C13B3C6D7A3EBFC6433C048`.
   GREEN after restoration: `# tests 7`, `# pass 7`, `# fail 0`.

3. Finding 3: at `loop/run.mjs:678`, changed the parsed carry length to
   `carried: 0` for every parsed verdict. RED: `# tests 7`, `# pass 6`,
   `# fail 1`; the non-empty carry arm reported `0 !== 2`. Restored
   immediately to SHA-256
   `3F5193C17C2E886BCB1F5D4D6FDC869A47BA23757C13B3C6D7A3EBFC6433C048`.
   GREEN after restoration: `# tests 7`, `# pass 7`, `# fail 0`.

## The two pins, reverted and restored

- `loop/tests/breakers.test.mjs`: reverted the `varies` set to the round-1
  exact form `new Set(['ts', 'id', 'note', 'mm', 'phases'])`.
  Command: `node --test --test-reporter=tap D:\addictedtoai-worktrees\fleet6-stage0-E\loop\tests\breakers.test.mjs`.
  RED: `# tests 19`, `# pass 18`, `# fail 1`; `authority_sha` differed
  between the two independently-created repositories. Restored to SHA-256
  `B43F1ECBDC19E7289BE52C52EAF1E667A88932B82E39142AA441B8966EE9B32E`.
  GREEN: `# tests 19`, `# pass 19`, `# fail 0`.

- `loop/tests/gate-transport-retry.test.mjs`: reverted the exact additive-key
  expectation to `['phases']`.
  Command: `node --test --test-reporter=tap D:\addictedtoai-worktrees\fleet6-stage0-E\loop\tests\gate-transport-retry.test.mjs`.
  RED: `# tests 30`, `# pass 29`, `# fail 1`; the actual additive keys were
  `authority_sha`, `brief_chars`, and `phases`. Restored to SHA-256
  `A196A83DB595459C4C3AB3086ED7FCF062AE954A384356FFCCF05C3DA01E1378`.
  GREEN: `# tests 30`, `# pass 30`, `# fail 0`.

The restored breakers pin exempts only `authority_sha` and `gate_seconds` for
their stated per-run reasons; `brief_chars` remains compared exactly and the
line-shape assertion remains exact. The restored retry pin expects the exact
sorted set `['authority_sha', 'brief_chars', 'phases']`; its stub supplies no
`durationMs`, so `gate_seconds` is correctly absent there.

## The sweep, checked

The requested search over `loop/tests/`, `scripts/`, and `loop/lib/` found no
omitted pin.

- `loop/tests/portability.test.mjs:409` constructs an eight-key required line
  and compares its keys with `LEDGER_FIELDS`; it stands because task 26 keeps
  that required list unchanged.
- `loop/tests/issues.test.mjs:241-243` pins the same eight fields and the
  absence of additive `issues`; it is the backward-compatibility check.
- `loop/tests/ledger.test.mjs:37` is the constructor serialization
  round-trip; `:42-49` checks phase key presence in that constructed line.
  The production integration arm checks values against the registry, the
  committed brief, the fixture HEAD, and the reviewer record.
- `loop/tests/breakers.test.mjs:172-186` and
  `loop/tests/gate-transport-retry.test.mjs:878-881` are the two stale
  outcome-shape pins moved and re-tested above.
- `loop/tests/worktree-cleanup.test.mjs:259-315` pins refusal, call order,
  and cleanup behavior, not an obsolete whole-return-object shape; `:332-342`
  pins the reviewer/conformance refusal guards.
- `loop/tests/branch-cleanup.test.mjs:79-80` uses a forced removal only to
  construct its branch-deletion control; it does not pin a removal return
  shape. The phase role/runner assertions in `review.test.mjs:602-603` and
  the retry phase-role assertion are likewise not whole phase-key-set pins.
- `scripts/verify-launch.mjs:195-202` is the sole
  `BUILD_INPUT_EXCLUSIONS` definition and `:292` is its use. The behavioral
  pins are the two arms in `scripts/verify-launch-build-reuse.test.mjs:57-88`.
- `loop/lib/git.mjs:116`, `loop/lib/review.mjs:1215`, and the two
  `conformance.mjs` callers are implementation/caller sites, not omitted
  test shape pins.

## Carried, non-blocking

These are green mutants of residual coverage, not production defects; the
unmutated code is correct and the exit condition makes this class non-blocking.

- At `loop/run.mjs:275`, changing `effort: who.effort ?? null` to
  `effort: who.effort` stayed GREEN at `# tests 7`, `# pass 7`, `# fail 0`.
  The round-2 integration fixture gives both production runners an effort, so
  it does not exercise the required `null` for an un-rung runner. Restored to
  the same run.mjs SHA-256 above, then GREEN again at 7/7.
- At `loop/run.mjs:678`, changing the parsed count to
  `Math.min(Array.isArray(gate.verdict.carry) ? gate.verdict.carry.length : 0, 2)`
  stayed GREEN at `# tests 7`, `# pass 7`, `# fail 0`; the fixture exercises
  only carry lengths 0 and 2. Restored to the same run.mjs SHA-256 above,
  then GREEN again at 7/7. The required named `carried: 0` mutation still
  goes RED as recorded above.

## What I checked that was sound

- `git diff db10eac..HEAD` names only the four permitted test files, and
  `git diff --check` is clean. `git diff --quiet HEAD -- loop/run.mjs` also
  passed after every production mutation was restored.
- The new ledger assertions compare `authority_sha`, `brief_chars`, and the
  non-zero parsed carry count with independent fixture evidence; the exact
  gate timing value arm remains intact.
- The two stale field-shape expectations now account for the additive values
  without weakening their exactness.
- The naming and unarchived-reference standing tests are green; the current
  data ledger's 244 lines also round-tripped through `appendLedger` and
  `readLedger` in a throwaway repository. Every cleanup test is green.
- `RESULT2.md` reports the required completed final-tip run on `ce59b3a`:
  `# tests 1784`, `# pass 1784`, `# fail 0`. I did not rerun the prohibited
  full suite.

## What I ran

Every test command below used `--test-reporter=tap`, and I checked the TAP
`# tests` count as well as pass/fail counts.

```text
node --test --test-reporter=tap D:\addictedtoai-worktrees\fleet6-stage0-E\loop\tests\ledger.test.mjs
# tests 7 / # pass 7 / # fail 0 (restored baseline)

node --test --test-reporter=tap D:\addictedtoai-worktrees\fleet6-stage0-E\loop\tests\breakers.test.mjs
# tests 19 / # pass 19 / # fail 0 (restored baseline)

node --test --test-reporter=tap D:\addictedtoai-worktrees\fleet6-stage0-E\loop\tests\gate-transport-retry.test.mjs
# tests 30 / # pass 30 / # fail 0 (restored baseline)

node --test --test-reporter=tap D:\addictedtoai-worktrees\fleet6-stage0-E\loop\tests\worktree-cleanup.test.mjs
# tests 11 / # pass 11 / # fail 0

node --test --test-reporter=tap D:\addictedtoai-worktrees\fleet6-stage0-E\loop\tests\portability.test.mjs D:\addictedtoai-worktrees\fleet6-stage0-E\scripts\no-change-dir-refs.test.mjs
# tests 16 / # pass 16 / # fail 0

node --test --test-reporter=tap D:\addictedtoai-worktrees\fleet6-stage0-E\scripts\verify-launch-build-reuse.test.mjs D:\addictedtoai-worktrees\fleet6-stage0-E\loop\tests\ledger-order.test.mjs D:\addictedtoai-worktrees\fleet6-stage0-E\loop\tests\ledger-before-publish.test.mjs D:\addictedtoai-worktrees\fleet6-stage0-E\loop\tests\job-budget.test.mjs
# tests 21 / # pass 21 / # fail 0

node D:\addictedtoai-worktrees\fleet6-stage0-E\.job\verify-existing-ledger.mjs
validated 244 pre-existing ledger lines
```

The temporary ledger probe was deleted with `apply_patch` and
`Test-Path ...\.job\verify-existing-ledger.mjs` returned `False`.

Author evidence, not rerun by me because of the packet hard limit:

```text
npm --prefix D:/addictedtoai-worktrees/fleet6-stage0-E test
# tests 1784
# pass 1784
# fail 0
# duration_ms 599172.8299
```

I did not run `npm run build`, the full test command, a whole `verify-*`
script, Pulse, Desk, `git worktree remove`, commit, merge, push, or any
beads status mutation. The final scope audit again showed only the four
permitted tracked paths; `runners.yml` was unchanged.
