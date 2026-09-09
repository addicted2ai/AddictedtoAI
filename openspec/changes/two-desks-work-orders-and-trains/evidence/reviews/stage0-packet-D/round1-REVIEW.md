# Stage 0 packet D — round 1 — VERDICT: revise

## Sealing

This is the first review round. I checked for earlier `REVIEW*.md` files and
none existed. I opened no earlier review file and no earlier round's report.

## Findings

1. `loop/lib/select.mjs:158,176,190` — the required `topRanked: null`
   contract on the conformance, health, and lane-paused early returns has no
   test arm in `loop/tests/runner-policy.test.mjs`. I changed the conformance
   return at line 158 from `topRanked: null` to `topRanked: {}`; the relevant
   selector and health suites still passed 17/17 and 23/23. I repeated the
   same mutation for the health return (23/23) and lane return (20/20).
   This violates task 23(iii)'s explicit early-return shape and task 24's
   requirement that the new test file test task 23; a caller comparing the
   documented `null` value would regress while the tests stayed green.
   Add fixture arms that reach each early return and assert the exact
   `topRanked === null` result (and that no escalation target is produced),
   then show the mutation red. CLASS: TEST-COVERAGE.

2. `loop/lib/runners.mjs:86-88` — the non-empty-string validation for a
   declared `escalates_to` has no test arm in
   `loop/tests/runner-policy.test.mjs:184-237`. I disabled that guard; the
   policy and selector suites still passed 6/6 and 17/17. Task 23(iv) says
   that a present `escalates_to` must be a non-empty string, so an empty,
   whitespace-only, or non-string registry value must fail at load rather
   than silently disable escalation. Add load-time assertions for those
   malformed values and restore the mutation-red evidence. CLASS:
   TEST-COVERAGE.

The current implementation itself was restored and behaves correctly on
these paths; these are must-fix coverage defects under the review rule that a
changed line whose mutation remains green is a finding.

## The mutations I ran

I reran all six mutations named by the author, using the policy test file and
TAP output with an explicit test count. I also ran one additional floor-path
mutation of my own, plus the three early-return and registry-shape probes
above. Every mutation was restored immediately. The final SHA-256 values of
the four tracked packet files are:

- `loop/lib/select.mjs` — `6E4366B340D12C7AE0CE4423A06ECE5387DE6A5CCA77DA01013764AFF5BDED84`
- `loop/lib/runners.mjs` — `C59129CD78C973C6C7F31869EEF45E09CA01893451A7086356B9B3AB01BC2D9D`
- `loop/run.mjs` — `9F0462AC2D3886965CADE017908870E7C67AD454496781EB86FE91F4F9E0695E`
- `loop/tests/runner-policy.test.mjs` — `AB617700B40BBB45B05491317E78F662126CDC31B734D6B4A73EEC262429E9E5`

The temporary `.job/floor-probe.mjs` file used for the floor arm was deleted.
The attempt to remove its now-empty `.job` directory was rejected by policy;
I did not retry that blocked command, and it contains no probe file or Git
change.

## The mutation table, judged

All rows used `node --test --test-reporter=tap` and include the `# tests`
count. “Restored” is the green result after the immediate inverse mutation
and the matching baseline file hash.

| Mutation | Red or surviving result | Restored |
|---|---|---|
| `loop/run.mjs:1286`: gate escalation on `sel.selected === null` | 6 tests, 4 pass, 2 fail; the lower-ranked control and escalation-entry refusal failed | 6 pass, 0 fail; `run.mjs` hash `9F0462AC2D3886965CADE017908870E7C67AD454496781EB86FE91F4F9E0695E` |
| `loop/run.mjs:1293`: adopt any non-null escalated selection | 6 tests, 5 pass, 1 fail; the escalation-entry refusal adopted the frontier repair | 6 pass, 0 fail; `run.mjs` hash `9F0462AC2D3886965CADE017908870E7C67AD454496781EB86FE91F4F9E0695E` |
| `loop/lib/select.mjs:266`: `escalationTarget` returns `null` unconditionally | 6 tests, 3 pass, 3 fail | 6 pass, 0 fail; `select.mjs` hash `6E4366B340D12C7AE0CE4423A06ECE5387DE6A5CCA77DA01013764AFF5BDED84` |
| `loop/lib/runners.mjs:111`: accept a self-referencing destination | 6 tests, 5 pass, 1 fail; the self-target load assertion failed | 6 pass, 0 fail; `runners.mjs` hash `C59129CD78C973C6C7F31869EEF45E09CA01893451A7086356B9B3AB01BC2D9D` |
| `loop/run.mjs:1292`: do not rerun `selectJob` at the call site | 6 tests, 4 pass, 2 fail; both dry-run call-site controls failed | 6 pass, 0 fail; `run.mjs` hash `9F0462AC2D3886965CADE017908870E7C67AD454496781EB86FE91F4F9E0695E` |
| `loop/lib/select.mjs:233`: do not populate `topRanked` for candidate refusals | 6 tests, 2 pass, 4 fail | 6 pass, 0 fail; `select.mjs` hash `6E4366B340D12C7AE0CE4423A06ECE5387DE6A5CCA77DA01013764AFF5BDED84` |
| Own: `loop/lib/select.mjs:240`: never match the top candidate's upkeep-floor refusal | 1 test, 0 pass, 1 fail in the temporary floor probe | 1 pass, 0 fail; `select.mjs` hash `6E4366B340D12C7AE0CE4423A06ECE5387DE6A5CCA77DA01013764AFF5BDED84` |
| Surviving: `loop/lib/select.mjs:158`: conformance early return uses `{}` instead of `null` | selector rules 17/17 green and runner health 23/23 green | restored; `select.mjs` hash `6E4366B340D12C7AE0CE4423A06ECE5387DE6A5CCA77DA01013764AFF5BDED84` |
| Surviving: `loop/lib/select.mjs:176`: health early return uses `{}` instead of `null` | runner health 23/23 green | restored; `select.mjs` hash `6E4366B340D12C7AE0CE4423A06ECE5387DE6A5CCA77DA01013764AFF5BDED84` |
| Surviving: `loop/lib/select.mjs:190`: lane-paused early return uses `{}` instead of `null` | budget 20/20 green | restored; `select.mjs` hash `6E4366B340D12C7AE0CE4423A06ECE5387DE6A5CCA77DA01013764AFF5BDED84` |
| Surviving: `loop/lib/runners.mjs:86`: disable the non-empty-string guard | policy 6/6 green and selector rules 17/17 green | restored; `runners.mjs` hash `C59129CD78C973C6C7F31869EEF45E09CA01893451A7086356B9B3AB01BC2D9D` |

## What I checked that was sound

- The diff from merge base `5414899` to tip `8f5e14f` is exactly the four
  permitted tracked files, with no `runners.yml` change. `git diff --check`
  is clean. The only worktree changes after review are the pre-existing
  untracked `.agent-brief.md` and `RESULT1.md`; no implementation or test
  mutation remains.
- `selectJob` takes `candidates[0]` before any gate, records the first gate
  refusal, and only falls back to the upkeep-floor refusal by object identity.
  `applyUpkeepFloor` preserves candidate order and passes the same candidate
  objects through, so that identity check is sound. The extra floor mutation
  confirmed its arm.
- The second selection reads the same candidate sources. The only gathering
  write, duplicate disposal, operates on the separate `duplicates` bucket;
  rejected duplicates never enter `ripe`, so it cannot change the candidate
  list between selections. The adoption condition therefore preserves the
  top candidate, and the single call-site block never follows the escalation
  entry's own destination.
- The escalation-refusal log lookup by rule and candidate type is safe in the
  current selector: when `topRanked` is non-null, its matching refusal is
  pushed for the first candidate before any lower candidate of the same type.
  A same-type lower candidate can exist, but it cannot precede the top
  candidate in `refusals`.
- After adoption, the mutable `runner` is passed into `executeJob`, its phase
  entries, the dry-run schema, and `makeLedgerLine`; the outcome line uses the
  same variable. Thus the recorded runner is the escalation entry. Resumption
  remains outside the selection branch and does not escalate.
- The final targeted run covered 87 tests with 87 pass and 0 fail: policy 6,
  selector rules 17, budget 20, expiring-proposal precedence 5, runner
  health 23, portability 13, and no-change-directory references 3.
  The real registry loaded and its declared clearances were enforced. The
  portability scan found no model/provider/harness or real runner id in
  machinery, and the change-directory scan passed.
- The author's report states that the required completed full-suite iteration
  ran on tip `8f5e14f` and finished at 1,790 tests, 1,790 pass, 0 fail in
  477.5 seconds. I did not rerun the full suite, build, verifier scripts,
  Pulse, or Desk, as this packet forbids those runs.
- The reserved registry handover remains correct: the orchestrator, not this
  packet, adds `escalates_to: codex-gpt-luna` to `codex-gpt-luna-medium`.
  Until then, the real registry declares no escalation and the loop performs
  none.

## Was the brief faithful to the tasks and the requirement? (and the closure)

Yes on authority and scope. The brief quoted the task text and its resolved
quantifiers, identified the four tracked implementation/test files, kept
`runners.yml` reserved, and named the read-only selector, budget, and helper
dependencies needed for closure. Its six reported mutations reproduced with
the same red counts here. The closure search found no exact whole-result key
set pin outside the listed files; the only field-level comparison was
`deepEqual(sel.warnings, [])` in `selector-rules.test.mjs`, as described by
the dispatch. No external caller required a change.

The brief did not surface the two surviving coverage gaps above. Its
implementation claims were otherwise faithful; the gaps are findings against
the test obligation, not permission to broaden the packet.

## What I ran

- Read-only sealing, authority, branch, diff, source, and closure checks,
  including the authority spec at `5414899` and the tip diff. The tip and
  merge base resolved to `8f5e14f` and `5414899`.
- Baseline and restored policy runs:
  `node --test --test-reporter=tap D:\addictedtoai-worktrees\fleet6-stage0-D\loop\tests\runner-policy.test.mjs` — `# tests 6`, `# pass 6`, `# fail 0`.
- Regression/property runs, all with TAP counts: selector rules `17/17`,
  budget `20/20`, expiring-proposal precedence `5/5`, runner health `23/23`,
  portability `13/13`, and no-change-directory references `3/3`.
- Final serial targeted run over all seven files — `# tests 87`, `# pass 87`,
  `# fail 0`, `# cancelled 0`, `# skipped 0`, `# todo 0`.
- All mutation rows in the table, with immediate inverse patches and
  SHA-256 verification. The first exploratory `rg` used a nonexistent
  scripts path and returned an OS path-not-found error; the corrected path
  was the worktree's `scripts` directory and passed.
- The attempted removal of the empty temporary `.job` directory was rejected
  by policy and was not retried. The temporary probe file itself was removed;
  final Git status shows only `.agent-brief.md` and `RESULT1.md` untracked.
