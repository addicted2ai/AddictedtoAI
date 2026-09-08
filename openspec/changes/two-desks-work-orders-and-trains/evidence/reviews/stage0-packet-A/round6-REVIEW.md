# Stage 0 packet A round 6 — VERDICT: approve

## Findings

No MUST-FIX findings.

The round-6 diff is limited to the requested default-clock arm in
`scripts/tests/verify-launch.test.mjs`. The arm omits `now`, forces the build
path, and the returned `checked.ok` value is the floor-enforced decision. The
required mutation therefore tests the decision path itself.

## The mutations I re-ran myself

### Mutation H

I recorded the pre-mutation SHA-256 of `scripts/verify-launch.mjs` as:

```text
80164640691704A38C185877C6C2D3CD3A702519374178FE4335029A52901ACC
```

I changed `scripts/verify-launch.mjs:949` from `now = Date.now` to
`now = () => 0`, then ran:

```text
node --test D:\addictedtoai-worktrees\fleet6-stage0-A\scripts\tests\verify-launch.test.mjs
```

The real red result was exit 1:

```text
✖ without an injected clock, checkBuild measures a positive build duration
ℹ tests 13
ℹ pass 12
ℹ fail 1
AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
false !== true
at scripts/tests/verify-launch.test.mjs:163:10
```

The first failing assertion was `assert.equal(checked.ok, true)`, not the
later duration assertion. With the constant clock, `durationMs` is zero; the
one-millisecond floor makes `enforceGateFloor` return `ok: false`, so this is
the expected proof that the default clock reaches the floor decision.

I restored `now = Date.now` immediately. The restored SHA-256 was:

```text
80164640691704A38C185877C6C2D3CD3A702519374178FE4335029A52901ACC
```

The hash is byte-identical. The restored run was exit 0:

```text
ℹ tests 13
ℹ pass 13
ℹ fail 0
```

Exactly 1 of 13 launch arms moved under Mutation H.

### My own mutation

The weakest adjacent guard is the floor threshold. I changed
`loop/lib/gates.mjs:370` from:

```js
result.durationMs >= floorMs(floor)
```

to the plausible threshold mistake:

```js
result.durationMs > 0
```

The new default-clock arm alone stayed green:

```text
node --test --test-name-pattern='without an injected clock' D:\addictedtoai-worktrees\fleet6-stage0-A\scripts\tests\verify-launch.test.mjs
Exit code 0
✔ without an injected clock, checkBuild measures a positive build duration
ℹ tests 1
ℹ pass 1
ℹ fail 0
```

Thus 0 of 1 new arms moved in isolation. The complete launch file under the
same mutation was exit 1 with 13 tests, 11 pass and 2 fail; the two failures
were the existing omitted-floor and below-floor-build arms. This green
isolated result is informative about the new arm's narrow purpose, but it is
not a hole in the complete floor coverage: the pre-existing floor arms reject
the weakened threshold. I restored the comparison immediately; the restored
`loop/lib/gates.mjs` SHA-256 was the original
`0F3928004A1367BE818F6D7FD79D0E8E0546A18A53BD9AA5F91468DEE01A99FD`.
The restored launch and gate suites were green at 13/13 and 8/8.

## The declaration, checked against the signature

The signature at `scripts/verify-launch.mjs:946-956` is:

```text
runBuild,
root = ROOT,
spawn = spawnSync,
now = Date.now,
localNow = () => new Date(),
isCurrent = hasCurrentBuild,
floorSet = GATE_FLOORS,
floors,
write = out,
report = record
```

The declaration in `RESULT.md` is complete:

- `now`, `isCurrent`, and `floorSet` are decision-carrying and each has an arm
  that omits the option and reaches the production default.
- `root = ROOT` is declared, because its default is the live repository and
  the sealed tests use temporary fixture trees.
- `spawn = spawnSync` is declared, because its default launches a live
  `npm run build`, which the sealed limits forbid.
- `localNow = () => new Date()` is declared as record-timestamp plumbing;
  deterministic fixture dates are appropriate for the record-byte assertions.
- `write = out` and `report = record` are declared as output/report seams;
  fixture capture makes the returned decision deterministic.
- `floors` is declared as the optional alias. It has no independent default;
  `floors ?? floorSet` selects it only when explicitly supplied.
- `runBuild` is the explicit control argument, not an injected option
  dependency.

No seam in the actual signature is missing from either the armed set or the
declaration.

## The mutation table, judged

The round diff is one insertion hunk in
`scripts/tests/verify-launch.test.mjs`; the table's single row names that
arm, the competent constant-clock mutation, the exact failing assertion, and
the restored hash. The mutation is plausible rather than an absurd
always-fail alteration, and my independent run confirms the reported red
behavior and arm count. The added setup, callback, and assertions are all part
of the one behavior-bearing arm; the separator after the arm is non-behavioral
formatting and has no independent mutation.

## What I checked that was sound

- The authoritative tasks and requirement were read from commit `658625d` in
  the shared checkout; the superseded local `openspec/` text was not used.
- `git diff dc62d39..b820031` contains only the requested test-file insertion.
  `git diff main...HEAD` shows the expected four-file branch scope, with no
  `package.json` change and no round-6 production-code change.
- The default-clock arm omits `now`, uses a real elapsed callback, and its
  first mutation failure is the floor-enforced `checked.ok` decision.
- The existing reuse arm omits `isCurrent` and proves reuse by zero spawn
  calls. The existing omitted-floor arm reaches `GATE_FLOORS.build` and the
  below-floor arms leave no success record.
- The existing launch tests cover absent output, missing success record,
  another commit, stale output, equal mtimes, empty output, pre-spawn record
  removal, and the launch-side below-floor record behavior.
- `loop/tests/gates.test.mjs` covers the gate-side pre-spawn removal and
  floor-checked record behavior. Its production writer is shared with the
  launch path, and the production sweep found the one writer in
  `loop/lib/gates.mjs` with the two expected production call sites.
- The required `job-gate-set` canary passed with its trivial `node --version`
  fixture gates, so the repository floors do not false-fail that fixture.
- The portability test passed, and the round-6 insertion introduces no model,
  provider, harness, runner-id, or unarchived-change-path reference.
- I did not run any prohibited build, full-suite, verify, or Pulse command.

## Was the brief faithful to the task and the requirement?

Yes. It identified `658625d` as the authority, quoted the amended task 4(ii),
distinguished decision-carrying seams from declared exemptions, and asked for
the exact default-clock mutation. The implementation follows that scope.

## Did you read REVIEW.md, REVIEW2.md, REVIEW3.md, REVIEW4.md or REVIEW5.md?

- `REVIEW.md`: no — not before or after writing these findings.
- `REVIEW2.md`: no — not before or after writing these findings.
- `REVIEW3.md`: no — not before or after writing these findings.
- `REVIEW4.md`: no — not before or after writing these findings.
- `REVIEW5.md`: no — not before or after writing these findings.

## What I ran

Inspection and scope:

```text
git -C D:\AddictedtoAI show 658625d:openspec/changes/two-desks-work-orders-and-trains/tasks.md
git -C D:\AddictedtoAI show 658625d:openspec/changes/two-desks-work-orders-and-trains/specs/loop/spec.md
git -C D:\addictedtoai-worktrees\fleet6-stage0-A diff dc62d39..b820031 -- scripts/tests/verify-launch.test.mjs
git -C D:\addictedtoai-worktrees\fleet6-stage0-A diff --name-status main...HEAD
git -C D:\addictedtoai-worktrees\fleet6-stage0-A diff --check dc62d39..b820031
```

The round diff reported one modified file and 21 added lines; the whole branch
reported only the four permitted files; `diff --check` was empty.

Focused green suites:

```text
node --test D:\addictedtoai-worktrees\fleet6-stage0-A\scripts\tests\verify-launch.test.mjs
ℹ tests 13 / ℹ pass 13 / ℹ fail 0

node --test D:\addictedtoai-worktrees\fleet6-stage0-A\loop\tests\gates.test.mjs
ℹ tests 8 / ℹ pass 8 / ℹ fail 0

node --test D:\addictedtoai-worktrees\fleet6-stage0-A\loop\tests\job-gate-set.test.mjs
ℹ tests 7 / ℹ pass 7 / ℹ fail 0

node --test D:\addictedtoai-worktrees\fleet6-stage0-A\loop\tests\portability.test.mjs
ℹ tests 12 / ℹ pass 12 / ℹ fail 0
```

Mutation H:

```text
Get-FileHash -Algorithm SHA256 -LiteralPath D:\addictedtoai-worktrees\fleet6-stage0-A\scripts\verify-launch.mjs
before: 80164640691704A38C185877C6C2D3CD3A702519374178FE4335029A52901ACC
node --test D:\addictedtoai-worktrees\fleet6-stage0-A\scripts\tests\verify-launch.test.mjs
exit 1; tests 13; pass 12; fail 1; first failure at :163, false !== true
Get-FileHash -Algorithm SHA256 -LiteralPath D:\addictedtoai-worktrees\fleet6-stage0-A\scripts\verify-launch.mjs
after restore: 80164640691704A38C185877C6C2D3CD3A702519374178FE4335029A52901ACC
node --test D:\addictedtoai-worktrees\fleet6-stage0-A\scripts\tests\verify-launch.test.mjs
exit 0; tests 13; pass 13; fail 0
```

Own threshold mutation:

```text
node --test --test-name-pattern='without an injected clock' D:\addictedtoai-worktrees\fleet6-stage0-A\scripts\tests\verify-launch.test.mjs
exit 0; tests 1; pass 1; fail 0
node --test D:\addictedtoai-worktrees\fleet6-stage0-A\scripts\tests\verify-launch.test.mjs
exit 1; tests 13; pass 11; fail 2
Get-FileHash -Algorithm SHA256 -LiteralPath D:\addictedtoai-worktrees\fleet6-stage0-A\loop\lib\gates.mjs
before and after restore: 0F3928004A1367BE818F6D7FD79D0E8E0546A18A53BD9AA5F91468DEE01A99FD
```

The local machine date command returned `2026-09-08 15:16:23`. No build,
`npm test`, verify script, or Pulse command was run.
