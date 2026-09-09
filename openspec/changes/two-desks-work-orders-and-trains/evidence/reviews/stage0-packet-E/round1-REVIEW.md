# Stage 0 packet E — round 1 — VERDICT: revise

## Sealing

This is the first review. I opened no earlier `REVIEW*.md` file and no earlier
round report. A read-only filename sweep found no earlier review file before
this report.

## Findings

1. `loop/tests/ledger.test.mjs:102` checks only `authority_sha.length === 40`.
   Mutating `loop/run.mjs:1486` from `authority_sha: mergeBaseSha` to the
   wrong but well-shaped `'a'.repeat(40)` stayed green at 5/5. This leaves a
   world in which the ledger records a hash unrelated to the commit against
   which the brief was assembled. It violates task 25(v) and task 26's
   resolved exact round-trip requirement. Make the fixture assert the recorded
   value equals the actual authority/merge-base SHA, not merely its length, and
   keep the wrong-value mutation red. CLASS: TEST-GAP / AUDITABILITY.

2. `loop/tests/ledger.test.mjs:100` checks only `brief_chars > 0`. Mutating
   `loop/run.mjs:1484` from `briefText.length` to `1` stayed green at 5/5.
   The test therefore accepts an arbitrary positive count instead of the
   character count of the brief the author received. This violates task
   25(ii) and task 26. Make the integration arm compare the ledger value with
   the actual assembled/received brief length, not just positivity. CLASS:
   TEST-GAP / MEASUREMENT.

3. `loop/tests/ledger.test.mjs:97` exercises only an actual review carrying
   zero findings. Mutating `loop/run.mjs:678` so every parsed verdict writes
   `carried: 0` stayed green at 5/5; the manually constructed line carrying
   `2` does not exercise the production parser path. This violates task
   25(iv), task 26, and the review requirement that the parsed `carry:` count
   reaches the ledger. Add an integration fixture whose verdict carries a
   nonzero list and assert that the review phase records that exact length,
   while retaining the zero/no-record cases. CLASS: TEST-GAP / REVIEW-LEDGER.

The following two closure findings are recorded but are not charged to the
author: the dispatch explicitly kept these files outside the permitted list,
and the author reported both reds rather than hiding them.

4. `loop/tests/breakers.test.mjs:172-178` compares two throwaway jobs' ledger
   key sets field-for-field. The new required `authority_sha` differs because
   each throwaway repository has its own merge base, so the full-suite arm is
   stale. Update the comparison to account for the additive telemetry and the
   per-repository authority value. CLASS: BRIEF-CLOSURE / STALE-EXPECTATION.

5. `loop/tests/gate-transport-retry.test.mjs:876-880` still requires the
   outcome line's only additive key to be `phases`. Task 25 adds
   `brief_chars` and `authority_sha` (and `gate_seconds` when measurable), so
   this assertion must be updated outside packet E's author file list. CLASS:
   BRIEF-CLOSURE / STALE-EXPECTATION.

The known retry fixture's missing `gate_seconds` is not an additional finding:
its stubbed gate results contain no `durationMs`, while production `runGates`
results do. The implementation correctly refuses to invent seconds from a
fixture that supplied no duration; the packet's duration-bearing arm records
the last retry's measured values.

## The mutations I ran

I ran all four named mutations, mutations covering each changed implementation
function, and three assertion-strength mutations against the weakest ledger
arms. Every mutation was restored before the next probe. The final SHA-256
values matched the pre-mutation baselines for `ledger.mjs`, `runners.mjs`,
`git.mjs`, `run.mjs`, `review.mjs`, `conformance.mjs`, and `verify-launch.mjs`.

## The mutation table, judged

| # | Mutation | File and line | Targeted TAP result | Restored result |
|---|---|---|---|---|
| 1 | Add `gate_seconds` to `LEDGER_FIELDS` | `loop/lib/ledger.mjs:30` | `# tests 5` / `# pass 3` / `# fail 2` | 5/0 |
| 2 | Restore `--force` to worktree removal | `loop/lib/git.mjs:117` | `# tests 11` / `# pass 10` / `# fail 1` | 11/0 |
| 3 | Run `rmSync` unconditionally after a refused removal | `loop/run.mjs:929` | `# tests 11` / `# pass 9` / `# fail 2` | 11/0 |
| 4 | Remove `.beads` from root exclusions | `scripts/verify-launch.mjs:201` | `# tests 2` / `# pass 1` / `# fail 1` | 2/0 |
| 5 | Record phase effort as `null` | `loop/run.mjs:275` | `# tests 5` / `# pass 4` / `# fail 1` | 5/0 |
| 6 | Omit `carried` from review phases | `loop/run.mjs:678` | `# tests 5` / `# pass 4` / `# fail 1` | 5/0 |
| 7 | Disable optional effort validation | `loop/lib/runners.mjs:80` | `# tests 5` / `# pass 4` / `# fail 1` | 5/0 |
| 8 | Replace measured gate seconds with zero | `loop/run.mjs:267` | `# tests 5` / `# pass 4` / `# fail 1` | 5/0 |
| 9 | Remove the review caller's `{ok}` guard | `loop/lib/review.mjs:1216` | `# tests 11` / `# pass 10` / `# fail 1` | 11/0 |
| 10 | Skip conformance setup cleanup and retry | `loop/conformance.mjs:321` | `# tests 6` / `# pass 5` / `# fail 1` | 6/0 |
| 11 | Omit `authority_sha` in `makeLedgerLine` | `loop/lib/ledger.mjs:135` | `# tests 5` / `# pass 3` / `# fail 2` | 5/0 |
| 12 | Omit `brief_chars` from the outcome line | `loop/run.mjs:1484` | `# tests 5` / `# pass 4` / `# fail 1` | 5/0 |
| 13 | Skip the protocol-file unlink | `loop/run.mjs:1929` | `# tests 6` / `# pass 4` / `# fail 2` | 6/0 |
| 14 | Write an unrelated 40-character authority SHA | `loop/run.mjs:1486` | **GREEN**: `# tests 5` / `# pass 5` / `# fail 0` — finding 1 | 5/0 |
| 15 | Write `brief_chars: 1` | `loop/run.mjs:1484` | **GREEN**: `# tests 5` / `# pass 5` / `# fail 0` — finding 2 | 5/0 |
| 16 | Write `carried: 0` for every parsed verdict | `loop/run.mjs:678` | **GREEN**: `# tests 5` / `# pass 5` / `# fail 0` — finding 3 | 5/0 |

## What I checked that was sound

- The implementation diff is exactly the ten permitted paths, with 481 added
  and 69 removed lines. No reserved registry edit was expected; absent
  registry effort correctly becomes phase `effort: null` until the
  orchestrator adds the four `runners.yml` entries.
- `LEDGER_FIELDS` remains the original eight keys, and old eight-key lines
  still append and read. `effort` is registry-owned, `carried` is review-only,
  and the outcome-only measurements are optional and additive.
- `gate_seconds` uses the final gate result after a retry and rounds
  `durationMs / 1000` to one decimal. A no-gates run omits it. The measured
  duration arm passed, and the legacy retry stub's absent duration explains
  its absent map without fabricating a number.
- `removeWorktree` refuses without `--force`, returns `{ ok, reason }`, and
  does not delete or force-retry. `removeJobWorktree` leaves a refused
  directory and its file intact, skips recursive removal, still prunes, and
  lets the run reach its ledger/records tail. The review and both conformance
  callers inspect the return and log refusals.
- Clearing `RESULT.md` before job-worktree removal is sound and narrow: the
  protocol was already read/classified, the real repository ignores it, and
  the change makes fixtures with a non-ignoring rule equivalent without
  weakening refusal for actual work. Its disabling mutation reddened the
  branch-cleanup arms.
- `.beads` is excluded only at the root walk level; `data/derived/` remains an
  input, and the throwaway fixture proves `.beads` writes preserve reuse while
  `content/` writes invalidate it.
- The registry-only machinery naming test, unarchived-change reference test,
  selector validation, ledger-order/before-publish/job-budget regressions,
  issue/ledger pin, review-code pin, and gate implementation tests all passed.
- The closure sweep found no third stale outcome-shape pin and no exact
  phase-entry or removal-return pin beyond the reviewed arms. The
  `portability.test.mjs:409` line builds its own eight-key line and remains
  green.

## Was the brief faithful to the tasks and the requirements? (and the closure)

The task quotations and the implementation file scope were substantially
faithful, and the author followed the brief correctly. The brief was not
faithful to the closure: it treated the task file list as the whole closure,
even though the additive ledger change necessarily reaches the two legacy
shape assertions above. The author explicitly reported the resulting full
suite reds, so this is a brief/coordination defect, not an author concealment
or an out-of-scope edit.

The author's completed final-tip full-suite iteration, which I did not rerun,
reported:

```text
# tests 1782
# pass 1780
# fail 2
```

Those are the two known closure reds in findings 4 and 5. The OpenSpec task
checkboxes and the reserved `runners.yml` effort half were correctly left for
the orchestrator.

## What I ran

All commands were targeted `node --test` runs with
`--test-reporter=tap`; each run asserted that the TAP plan matched `# tests`.
I did not run the full suite, a build, a whole verification script, Pulse, or
Desk.

- Authority specs: read-only `git show 9c1d980:.../loop/spec.md` and
  `.../review/spec.md`; diff/stat/name and closure scans against `9c1d980`.
- Packet baseline and final restored run: `ledger.test.mjs`,
  `worktree-cleanup.test.mjs`, `verify-launch-build-reuse.test.mjs`,
  `ledger-order.test.mjs`, `ledger-before-publish.test.mjs`, and
  `job-budget.test.mjs`: **37/37**.
- Property suites: `portability.test.mjs`, `no-change-dir-refs.test.mjs`,
  `selector-rules.test.mjs`: **33/33**.
- Closure/regression suites: `issues.test.mjs`, `review-blog-bar.test.mjs`,
  `gates.test.mjs`: **67/67**.
- Known full-suite red sites: `breakers.test.mjs` plus
  `gate-transport-retry.test.mjs`: **49 tests, 47 passed, 2 failed**, exactly
  the two reported closure assertions.
- Restored focused arms after mutation work: ledger **5/5**, cleanup **11/11**,
  launch reuse **2/2**, branch cleanup **6/6**, conformance **6/6**.
- Final audit: `git diff --check` clean; tracked diff still exactly ten
  permitted paths; no probe files remained; all seven mutated implementation
  files matched their recorded baseline SHA-256 values.

No guard-blocked or refused command occurred. One exploratory read-only search
returned no matches while checking for earlier review files; it created no
file and was not routed around by changing repository state.
