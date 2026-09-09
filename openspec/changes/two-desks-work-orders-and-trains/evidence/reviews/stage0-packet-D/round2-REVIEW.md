# Stage 0 packet D — round 2 (delta) — VERDICT: revise

## Sealing

I read `REVIEW1.md` and was not sealed from it: this is a delta review that
uses the previous review's two named findings. I also opened `RESULT2.md`,
`.agent-brief.md`, the round diff, `loop/lib/select.mjs`,
`loop/lib/runners.mjs`, `loop/run.mjs`, and the complete
`loop/tests/runner-policy.test.mjs`.

## Findings

1. `RESULT2.md:43-81` claims to be the complete sweep of the round-1
   implementation diff, but it omits six non-comment, non-blank code lines:
   `loop/lib/runners.mjs:88, 110, 113`, `loop/lib/select.mjs:265, 269`, and
   `loop/run.mjs:1291`. The report lists other syntax-only closing lines
   (`runners.mjs:118-119` and `run.mjs:1314-1315`), so these omissions do not
   qualify as an unstated convention. The sweep must list all six lines and
   explicitly give the reason no distinct behavioral arm can cover each
   syntax-only closure, or provide an arm if a behavioral mutation is
   intended. CLASS: TEST-COVERAGE (sweep/report completeness).

## The prior findings' arms, re-run

The command for each arm was:

```text
node --test --test-reporter=tap D:\addictedtoai-worktrees\fleet6-stage0-D\loop\tests\runner-policy.test.mjs
```

| Prior finding and mutation | Red result against current production code | Immediate restoration |
|---|---|---|
| `loop/lib/select.mjs:158`, `topRanked: null` → `{}` | `# tests 13`, `# pass 12`, `# fail 1`, `# cancelled 0`; the conformance arm failed | `# tests 13`, `# pass 13`, `# fail 0`; selector SHA-256 `6E4366B340D12C7AE0CE4423A06ECE5387DE6A5CCA77DA01013764AFF5BDED84` |
| `loop/lib/select.mjs:176`, `topRanked: null` → `{}` | `# tests 13`, `# pass 12`, `# fail 1`, `# cancelled 0`; the health arm failed | `# tests 13`, `# pass 13`, `# fail 0`; selector SHA-256 `6E4366B340D12C7AE0CE4423A06ECE5387DE6A5CCA77DA01013764AFF5BDED84` |
| `loop/lib/select.mjs:190`, `topRanked: null` → `{}` | `# tests 13`, `# pass 12`, `# fail 1`, `# cancelled 0`; the paused-lane arm failed | `# tests 13`, `# pass 13`, `# fail 0`; selector SHA-256 `6E4366B340D12C7AE0CE4423A06ECE5387DE6A5CCA77DA01013764AFF5BDED84` |
| `loop/lib/runners.mjs:86-88`, disable the non-empty-string guard | `# tests 13`, `# pass 9`, `# fail 4`, `# cancelled 0`; empty, whitespace-only, numeric, and bare-key arms failed on the later unknown-destination errors | `# tests 13`, `# pass 13`, `# fail 0`; runners SHA-256 `C59129CD78C973C6C7F31869EEF45E09CA01893451A7086356B9B3AB01BC2D9D` |

The round-1 six mutations and `REVIEW1.md`'s floor mutation were not rerun.
The round diff confirms that `8f5e14f..HEAD` changes only
`loop/tests/runner-policy.test.mjs`; the three production files are unchanged.
`REVIEW1.md` already reproduced those mutations on the prior tip.

## The sweep, checked

I read the source diff directly:

```text
git -C D:\addictedtoai-worktrees\fleet6-stage0-D diff --unified=0 5414899..8f5e14f -- loop/lib/runners.mjs loop/lib/select.mjs loop/run.mjs
```

The author's behavioral attributions cover the other added code lines: the
malformed-value guard, destination validation branches, early returns,
top-candidate capture, refusal and upkeep-floor tracking, returned field,
the pure helper's three branches, the import and mutable bindings, and the
escalation call-site branches. The six lines named in Findings are the only
omissions I found in the report's list. They are syntax-only closures, so the
right report entry is a reason-none-can entry rather than a new production
test arm.

I spot-checked three non-round-1-six behavioral lines, one mutation at a time,
with the same TAP command above:

| Spot check | Result | Restored |
|---|---|---|
| `loop/lib/select.mjs:202`, `candidates[0]` → `candidates[1]` | `# tests 13`, `# pass 9`, `# fail 4`, `# cancelled 0` | selector SHA-256 `6E4366B340D12C7AE0CE4423A06ECE5387DE6A5CCA77DA01013764AFF5BDED84`; final policy run `13/13` |
| `loop/lib/select.mjs:247`, returned `topRanked` → `null` | `# tests 13`, `# pass 9`, `# fail 4`, `# cancelled 0` | selector SHA-256 `6E4366B340D12C7AE0CE4423A06ECE5387DE6A5CCA77DA01013764AFF5BDED84`; final policy run `13/13` |
| `loop/run.mjs:1294`, `runner = escalation` → `runner = runner` | `# tests 13`, `# pass 12`, `# fail 1`, `# cancelled 0` | run SHA-256 `9F0462AC2D3886965CADE017908870E7C67AD454496781EB86FE91F4F9E0695E`; final policy run `13/13` |

The changed test arms use strict `assert.equal(..., null)` for the early
returns, exact error-message regular expressions for malformed registry
values, a scout first in every early-return queue, and `selection()` or
`runLoop()` paths that reach the real selector. I found no loose-null,
throw-only, candidate-free, or hand-built gate arm in the round-2 additions.

## Carried, non-blocking

None found. The six omitted sweep entries are blocking report-completeness
findings, not carried green mutants.

## What I checked that was sound

- The current round's tracked diff is exactly one file:
  `loop/tests/runner-policy.test.mjs`. No production file, registry, or other
  tracked path changed in `8f5e14f..HEAD`.
- All four named prior mutations went red, and every inverse mutation restored
  the original production hash and a green policy run. No production defect
  appeared against the unmutated code.
- The conformance, health, and paused-lane fixtures put the scout in the queue
  before the early return; each now proves no ranked candidate and no
  escalation target. The four malformed registry fixtures distinguish the
  non-empty-string guard from the later unknown-target check.
- The machinery-name property passed: portability `13/13`. The
  unarchived-change-reference property passed: `3/3`. The selector-rules
  property passed `17/17`, including loading the shipped registry through
  `loadRunners` and enforcing every declared clearance.
- `RESULT2.md` reports the required completed final-tip suite as
  `1,797` tests, `1,797` pass, `0` fail, which meets the `1,790` floor. I did
  not rerun that prohibited full suite.

## What I ran

Scope and whitespace checks:

```text
git -C D:\addictedtoai-worktrees\fleet6-stage0-D diff --name-status 8f5e14f..HEAD
M       loop/tests/runner-policy.test.mjs

git -C D:\addictedtoai-worktrees\fleet6-stage0-D diff --check 8f5e14f..HEAD
exit 0, no output
```

Baseline and final targeted commands, all with TAP counts:

```text
node --test --test-reporter=tap D:\addictedtoai-worktrees\fleet6-stage0-D\loop\tests\runner-policy.test.mjs
# tests 13
# pass 13
# fail 0

node --test --test-reporter=tap D:\addictedtoai-worktrees\fleet6-stage0-D\loop\tests\selector-rules.test.mjs
# tests 17
# pass 17
# fail 0

node --test --test-reporter=tap D:\addictedtoai-worktrees\fleet6-stage0-D\loop\tests\budget.test.mjs
# tests 20
# pass 20
# fail 0

node --test --test-reporter=tap D:\addictedtoai-worktrees\fleet6-stage0-D\loop\tests\runner-health.test.mjs
# tests 23
# pass 23
# fail 0

node --test --test-reporter=tap D:\addictedtoai-worktrees\fleet6-stage0-D\loop\tests\portability.test.mjs
# tests 13
# pass 13
# fail 0

node --test --test-reporter=tap D:\addictedtoai-worktrees\fleet6-stage0-D\scripts\no-change-dir-refs.test.mjs
# tests 3
# pass 3
# fail 0
```

Restoration hashes:

```text
Get-FileHash -Algorithm SHA256 -Path D:\addictedtoai-worktrees\fleet6-stage0-D\loop\lib\select.mjs,D:\addictedtoai-worktrees\fleet6-stage0-D\loop\lib\runners.mjs,D:\addictedtoai-worktrees\fleet6-stage0-D\loop\run.mjs

select.mjs  6E4366B340D12C7AE0CE4423A06ECE5387DE6A5CCA77DA01013764AFF5BDED84
runners.mjs C59129CD78C973C6C7F31869EEF45E09CA01893451A7086356B9B3AB01BC2D9D
run.mjs     9F0462AC2D3886965CADE017908870E7C67AD454496781EB86FE91F4F9E0695E
```

The author's full-suite evidence, read but not rerun because this packet
forbids it, was:

```text
npm --prefix D:/addictedtoai-worktrees/fleet6-stage0-D test
# tests 1797
# pass 1797
# fail 0
```

I did not run the full suite, build, verifier scripts, Pulse, Desk, or any
write/publish command. No command was blocked or refused.
