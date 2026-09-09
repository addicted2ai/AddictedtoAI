# RESULT2

## 1. Commits

Command:

```text
git -C D:/addictedtoai-worktrees/fleet6-stage0-E log --oneline main..HEAD
```

Output:

```text
ce59b3a test: close ledger telemetry coverage
db10eac loop: clear result protocol before worktree removal
2808f42 loop: record ledger telemetry and refuse forced worktree cleanup
```

## 2. Findings, each with its class and every instance fixed

1. **Finding 1 — TEST-GAP / AUDITABILITY.** The integration arm in
   `loop/tests/ledger.test.mjs:87-114` reads the fixture repository's HEAD
   before `runLoop` and compares `authority_sha` with that exact SHA. The old
   unit arm at lines 32-40 still uses a hand-built forty-character value, but
   its exact `appendLedger`/`readLedger` round-trip is deliberately a
   serialization arm; the production-source value is asserted by the
   integration arm. There are no other authority-value assertions in this
   file. The unrelated-authority mutation went red.

2. **Finding 2 — TEST-GAP / MEASUREMENT.** The same integration arm resolves
   the commit that added `.job/brief.md` with `log -1 --full-history
   --diff-filter=A <mergedSha>^2`, reads that blob, and asserts
   `brief_chars === committedBrief.length` at `loop/tests/ledger.test.mjs:101-112`.
   The unit literal at lines 30 and 38 remains an exact round-trip value, not
   a production measurement. The old positivity assertion is gone and there
   are no other positivity assertions for `brief_chars` in the file. The
   `brief_chars: 1` mutation went red.

3. **Finding 3 — TEST-GAP / REVIEW-LEDGER.**
   `loop/tests/mock-executor.mjs:53` now accepts an optional `carry` block, and
   `review-approve-carry` at lines 267-283 writes the same approve record plus
   two well-formed entries containing `title`, `detail`, and `subject`.
   `loop/tests/ledger.test.mjs:117-135` runs that reviewer through the real
   parser and asserts `review1.carried === 2`. The existing zero-record case
   remains at lines 72-114, and the new no-verdict case at lines 138-156
   asserts that `carried` is absent. The hand-built unit arm retains review
   counts 2 and 0 as exact round-trip values. The forced-zero production
   mutation went red.

4. **Round-1 closure class — BRIEF-CLOSURE / STALE-EXPECTATION.** The
   field-for-field comparison in `loop/tests/breakers.test.mjs:176-183` now
   varies `authority_sha` for task 25(v) and `gate_seconds` for task 25(iii),
   with one-line reasons. `brief_chars` remains compared exactly because both
   jobs receive the same brief. The additive-key pin in
   `loop/tests/gate-transport-retry.test.mjs:874-880` now expects the exact
   sorted set `['authority_sha', 'brief_chars', 'phases']`; its comment records
   that the stub has no `durationMs`, so `gate_seconds` is absent in that
   fixture. Both original pin mutations went red.

**Required exact-shape sweep.**

- `loop/tests/portability.test.mjs:409` builds an eight-key line from
  `ledgerSchemaLine` and compares it with `LEDGER_FIELDS`. It intentionally
  stays exact: it tests the dry-run required schema, not an outcome line, and
  task 25/26 require `LEDGER_FIELDS` to remain unchanged.
- `loop/tests/issues.test.mjs:241-243` pins the same eight required fields and
  the absence of additive `issues` from `LEDGER_FIELDS`; it stands for the
  same backward-compatibility property.
- `loop/tests/ledger.test.mjs:36-40` has the exact constructed-line
  round-trip, while lines 47-61 check phase-key shape. Those checks stand
  because the unit arm is the constructor/validator shape test; the
  integration arm supplies independent registry, committed-brief, reviewer,
  fixture-HEAD, and measured-gate sources.
- `loop/tests/breakers.test.mjs:172-186` and
  `loop/tests/gate-transport-retry.test.mjs:874-884` are the two stale outcome
  pins fixed above. No third stale outcome pin was found.
- `loop/tests/worktree-cleanup.test.mjs:259-315` pins cleanup call order,
  refusal names, and the `rmSync` refusal guard; these are the task-27
  behavior, not an obsolete whole-return-object shape. Its static caller pin
  at lines 325-342 keeps the review and conformance refusal guards. The
  `loop/tests/branch-cleanup.test.mjs` assertions pin branch/worktree
  lifecycle and do not pin the removal return object.
- `scripts/verify-launch.mjs:195-203` is the sole
  `BUILD_INPUT_EXCLUSIONS` definition and its use at line 292. The new
  `scripts/verify-launch-build-reuse.test.mjs` owns the two exact behavioral
  arms: a later `.beads/` write preserves reuse and a later `content/` write
  invalidates it. No other exclusion-set pin was found.
- No exact phase-entry or `removeWorktree`/`removeJobWorktree` whole-return
  shape pin outside the listed owning tests was found. The remaining
  `removeJobWorktree` assertions are intentional failure/call-order behavior
  checks.

## 3. Tests run

Initial focused ledger arm:

```text
node --test D:\addictedtoai-worktrees\fleet6-stage0-E\loop\tests\ledger.test.mjs
ℹ tests 7
ℹ suites 0
ℹ pass 7
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 28973.5312
```

Packet targeted list:

```text
node --test D:\addictedtoai-worktrees\fleet6-stage0-E\loop\tests\ledger.test.mjs D:\addictedtoai-worktrees\fleet6-stage0-E\loop\tests\worktree-cleanup.test.mjs D:\addictedtoai-worktrees\fleet6-stage0-E\scripts\verify-launch-build-reuse.test.mjs D:\addictedtoai-worktrees\fleet6-stage0-E\loop\tests\breakers.test.mjs D:\addictedtoai-worktrees\fleet6-stage0-E\loop\tests\gate-transport-retry.test.mjs D:\addictedtoai-worktrees\fleet6-stage0-E\loop\tests\ledger-order.test.mjs D:\addictedtoai-worktrees\fleet6-stage0-E\loop\tests\ledger-before-publish.test.mjs D:\addictedtoai-worktrees\fleet6-stage0-E\loop\tests\job-budget.test.mjs
ℹ tests 88
ℹ suites 0
ℹ pass 88
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 138545.5656
```

Naming and unarchived-path enforcement. `loop/tests/portability.test.mjs`
enforces the model/provider/harness and runner-id property;
`scripts/no-change-dir-refs.test.mjs` enforces the unarchived-path property:

```text
node --test D:\addictedtoai-worktrees\fleet6-stage0-E\loop\tests\portability.test.mjs D:\addictedtoai-worktrees\fleet6-stage0-E\scripts\no-change-dir-refs.test.mjs
ℹ tests 16
ℹ suites 0
ℹ pass 16
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1005.4724
```

Mutation commands and red tails are also summarized in section 4. Each
mutation was restored before the next probe. The committed-tip final suite
below is the final restored verification.

The mutation command terminal summaries; the TAP count lines below are
verbatim:

```text
node --test D:\addictedtoai-worktrees\fleet6-stage0-E\loop\tests\ledger.test.mjs
ℹ tests 7
ℹ suites 0
ℹ pass 6
ℹ fail 1
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 21904.6558
✖ a registry effort is copied to each phase, while absent effort remains null
  + 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
  - 'f5b6facb8c19c38e70d204f1b0e125b0d0ae2409'
```

```text
node --test D:\addictedtoai-worktrees\fleet6-stage0-E\loop\tests\ledger.test.mjs
ℹ tests 7
ℹ suites 0
ℹ pass 6
ℹ fail 1
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 21824.8511
✖ a registry effort is copied to each phase, while absent effort remains null
  1 !== 13416
```

```text
node --test D:\addictedtoai-worktrees\fleet6-stage0-E\loop\tests\ledger.test.mjs
ℹ tests 7
ℹ suites 0
ℹ pass 6
ℹ fail 1
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 21867.8013
✖ a parsed non-empty carry list reaches the review phase ledger entry
  0 !== 2
```

```text
node --test D:\addictedtoai-worktrees\fleet6-stage0-E\loop\tests\breakers.test.mjs
ℹ tests 19
ℹ suites 0
ℹ pass 18
ℹ fail 1
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 91966.5034
✖ breaker 1 — a marked twice-failed job records the same spend an unmarked one does
  AssertionError [ERR_ASSERTION]: field `authority_sha` differs with the classification
```

```text
node --test D:\addictedtoai-worktrees\fleet6-stage0-E\loop\tests\gate-transport-retry.test.mjs
ℹ tests 30
ℹ suites 0
ℹ pass 29
ℹ fail 1
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 96473.2575
✖ the ledger records that a retry happened and how it ended, without a new ledger field
  AssertionError [ERR_ASSERTION]: {"ts":"2026-09-09T15:20:09.163Z"...}
  + 'authority_sha'
  + 'brief_chars'
  + 'phases'
```

Final full-suite iteration, on commit `ce59b3a`, with a 720-second command
allowance:

```text
npm --prefix D:/addictedtoai-worktrees/fleet6-stage0-E test
ℹ tests 1784
ℹ suites 0
ℹ pass 1784
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 599172.8299
```

Tool wall time for that final iteration: `601.7 seconds`. No test command ran
after it.

## 4. Mutation table

| Finding or pin | Mutation | Command | Red result | Restored result |
|---|---|---|---|---|
| Finding 1 | `loop/run.mjs:1486`: replace `authority_sha: mergeBaseSha` with `'a'.repeat(40)` | `node --test D:\addictedtoai-worktrees\fleet6-stage0-E\loop\tests\ledger.test.mjs` | 7 tests, 6 pass, 1 fail; the exact assertion saw the unrelated `a…a` value instead of the fixture HEAD | Restored before the next probe; focused baseline 7/7 and final suite 1784/1784 |
| Finding 2 | `loop/run.mjs:1484`: replace `brief_chars: briefText.length` with `brief_chars: 1` | `node --test D:\addictedtoai-worktrees\fleet6-stage0-E\loop\tests\ledger.test.mjs` | 7 tests, 6 pass, 1 fail; `1 !== 13416` in the committed-brief length assertion | Restored before the next probe; focused baseline 7/7 and final suite 1784/1784 |
| Finding 3 | `loop/run.mjs:678`: replace parsed carry length with `carried: 0` | `node --test D:\addictedtoai-worktrees\fleet6-stage0-E\loop\tests\ledger.test.mjs` | 7 tests, 6 pass, 1 fail; the non-empty carry arm saw `0 !== 2` | Restored before the next probe; focused baseline 7/7 and final suite 1784/1784 |
| Pin: breakers | Restore the round-1 `varies` set without `authority_sha` or `gate_seconds` | `node --test D:\addictedtoai-worktrees\fleet6-stage0-E\loop\tests\breakers.test.mjs` | 19 tests, 18 pass, 1 fail; the field-for-field comparison rejected differing authority hashes | Restored before the next probe; packet targeted suite 88/88 and final suite 1784/1784 |
| Pin: gate retry | Restore the round-1 expected additive set to `['phases']` | `node --test D:\addictedtoai-worktrees\fleet6-stage0-E\loop\tests\gate-transport-retry.test.mjs` | 30 tests, 29 pass, 1 fail; actual additive keys were `['authority_sha', 'brief_chars', 'phases']` | Restored before final commit verification; packet targeted suite 88/88 and final suite 1784/1784 |

## 5. The registry half

Unchanged from RESULT1 §5. No `runners.yml` edit was made. The orchestrator
must add these exact lines under the corresponding four Codex entries:

```text
# under id: codex-gpt-luna
    effort: max
# under id: codex-gpt-luna-medium
    effort: medium
# under id: codex-gpt-luna-high
    effort: high
# under id: codex-gpt-luna-xhigh
    effort: xhigh
```

Until those reserved-file edits land, the implementation records
`effort: null` for those entries. Claude and OpenCode entries remain without
an effort rung until their harnesses expose one.

## 6. Blocked or refused calls

none

## 7. Findings not fixed

none
