# Stage 0 packet F — round 2 — VERDICT: revise

## Sealing

I opened all four permitted files: `REVIEW1.md`, `RESULT1.md`, `RESULT2.md`,
and `.agent-brief.md`. I was sealed from the architect's reasoning. The
round-1 review was intentionally opened so its five mutations could be
rerun.

## Findings

1. `RESULT2.md:25` records the final affected-file run as `56` tests,
   `56` pass, `0` fail. The four affected test files named by the round-2
   scope run to `55` tests, `55` pass, `0` fail on the final restored tip:
   conformance `16`, portability `15`, runner policy `20`, and the
   change-directory detector `4`. Correct the report to `55/55/0`, or name
   the additional test target and include its TAP totals. CLASS:
   REVIEW-EVIDENCE / COUNT-RECORD. This is a report defect, not a production
   behavior defect; the packet's count rule makes it a must-fix before approval.

## Notes carried, non-blocking

- The round-1 generic conformance-refusal string mutation remains green by
  design: the count is now a separate returned field. It is not a production
  defect, and the count-field mutation is red.
- No additional green mutant was found in the three independent sweep probes.

## Round 1's five mutations, re-run

All runs used `node --test --test-reporter=tap` with an absolute path. Every
mutation was restored immediately. The restored hash is the final hash of the
mutated file.

1. Finding 1, generic-string arm: changed the selector's conformance refusal
   reason from `conformance.reason` to `conformance failure`. Command:
   `node --test --test-reporter=tap D:/addictedtoai-worktrees/fleet6-stage0-F/loop/tests/runner-policy.test.mjs`.
   GREEN: `# tests 20`, `# pass 20`, `# fail 0`. This green result is by
   design. The required count mutation then removed `conformanceEntries` from
   the conformance-refusal return. RED: `# tests 20`, `# pass 19`, `# fail 1`.
   Restored GREEN: `20/20/0`. Restored SHA-256 for
   `loop/lib/select.mjs`:
   `4356D81ACB47568E02A51D9483A780DBB9992707BF928E4588094D4A5575B1CC`.

2. Finding 2: changed `/?` in `BAD_REFERENCE` to `/`, removing terminal-name
   recognition. Command:
   `node --test --test-reporter=tap D:/addictedtoai-worktrees/fleet6-stage0-F/scripts/no-change-dir-refs.test.mjs`.
   RED: `# tests 4`, `# pass 3`, `# fail 1`. Restored GREEN: `4/4/0`.
   Restored SHA-256 for `scripts/no-change-dir-refs.test.mjs`:
   `96A86B1144FEF1452C46329692F8408B8A8615B7CCF77C0529835ECBD1350D5B`.

3. Finding 3: changed `seen.has(check.name)` to `seen.size > 0`, so only
   the first failed check name was collected. Command:
   `node --test --test-reporter=tap D:/addictedtoai-worktrees/fleet6-stage0-F/loop/tests/conformance.test.mjs`.
   RED: `# tests 16`, `# pass 15`, `# fail 1`. Restored GREEN: `16/16/0`.
   Restored SHA-256 for `loop/lib/runners.mjs`:
   `D46721C90B239F3FDC9B66E25406DA82EDEA50293F102A0642F4C7D7DBDCB706`.

4. Finding 4: made an absent named check fall back to the first available
   check in the entry. The same conformance command was used. RED: `# tests
   16`, `# pass 15`, `# fail 1`. Restored GREEN: `16/16/0`. Restored SHA-256
   for `loop/lib/runners.mjs`:
   `D46721C90B239F3FDC9B66E25406DA82EDEA50293F102A0642F4C7D7DBDCB706`.

5. Finding 5: removed `loop` from `RUNNER_SCAN_ROOTS`. Command:
   `node --test --test-reporter=tap D:/addictedtoai-worktrees/fleet6-stage0-F/loop/tests/portability.test.mjs`.
   RED: `# tests 15`, `# pass 14`, `# fail 1`. Restored GREEN: `15/15/0`.
   Restored SHA-256 for `loop/tests/portability.test.mjs`:
   `07A2D5C0A1372E3E4F0C5C31C9F1EA3F67B594BA8CE610BD895153B21E9FD6D6`.

## Every count in RESULT2.md, re-derived

- The report's historical generic-string figure, `19/19`, is the round-1
  test count. The final tip has one added runner-policy test, so the final-tip
  rerun is `20/20`; the mutation remains green.
- The report's historical conformance and omitted-check figures, `14/14`,
  are the pre-round-2 suite. The final tip has `16` conformance tests; the
  two current mutation reruns are each `16/15/1`, and the restored suite is
  `16/16/0`.
- The report's portability root-removal figure, `15/15` before the new
  expectation, becomes `15/14/1` on the final tip; the restored suite is
  `15/15/0`.
- The report's final affected total is `56/56/0`; the exact combined command
  over the four affected test files produced `# tests 55`, `# pass 55`,
  `# fail 0`, `# cancelled 0`, `# skipped 0`, `# todo 0`. This is the
  discrepancy in Findings.
- The report's `128` test-file count re-derived as `128` by file enumeration.
  I did not rerun its prohibited full-suite command, so I do not claim a new
  full-suite TAP total. Its `1,817` is arithmetically consistent with the
  earlier reported `1,814` plus the three net tests added in this round.
- The report's five `node --check` calls were not repeated because the packet
  permits targeted `node --test` only. `git diff --check` was independently
  rerun and exited successfully.
- The mutation-table red counts and all five restoration hashes match the
  reruns above. The selector count assertions for `0`, `1`, and `2`, the
  history counts, and the six-root fixture count all passed in the restored
  targeted run.

## The sweep, checked

The following changed lines were not named by the author's round-2 sweep. I
mutated each one separately and restored it immediately.

- `loop/conformance.mjs:415`: replaced append-with-history by overwrite.
  Conformance command: `16` tests, `13` pass, `3` fail. Restored SHA-256:
  `9885BACD9E4D4ECD68FD3B4E4488FB76792131EA9730B3CE0519900AE5268DCB`.
- `loop/lib/runners.mjs:179`: made an array history normalize to an empty
  history. Conformance command: `16` tests, `6` pass, `10` fail. Restored
  SHA-256:
  `D46721C90B239F3FDC9B66E25406DA82EDEA50293F102A0642F4C7D7DBDCB706`.
- `loop/lib/select.mjs:289`: returned a disabled escalation target instead
  of returning `null`. Runner-policy command: `20` tests, `19` pass, `1`
  fail. Restored SHA-256:
  `4356D81ACB47568E02A51D9483A780DBB9992707BF928E4588094D4A5575B1CC`.

The added arms pin exact count values, exact failed-check names, a different
check present beside an omitted one, every expected root independently, the
terminal and continued path forms, archived exclusion, and matched-span
allow-listing. Each of those wrong worlds went red under the named mutations.

## The standing properties

- The instrument for model/provider/harness-name and runner-id portability is
  `loop/tests/portability.test.mjs`. Its model scan covers `loop/` and
  `data/config.json`; its runner-id scan covers `loop/`, `pulse/`, `scripts/`,
  `lib/`, `app/`, `tools/`, and `data/config.json`, with the explicit scan
  floor, per-root contribution assertions, and nested `skipTests` arm. The
  targeted run reported `# tests 15`, `# pass 15`, `# fail 0`.
- The instrument for unarchived change-directory references is
  `scripts/no-change-dir-refs.test.mjs`. It scans the six machinery roots,
  matches the reference span, applies only the two justified generic
  allow-list entries, and tests terminal, path, archive, and same-line cases.
  The targeted run reported `# tests 4`, `# pass 4`, `# fail 0`.
- `git diff ddbfd52ca16ccf5cff92633d0b571e1a4ce69c91..HEAD --name-status`
  reported exactly the nine-file merge-base list. The round-2 diff from
  `df448970490c7fe496317182417364a281c216ed` reported exactly the five
  permitted tracked files. No `runners.yml` or `data/` path changed.

## What I checked that was sound

- Append-only recording preserves the first entry; legacy single-object
  records normalize to one entry; the gate tracks each check name, resets on
  absence or non-PASS, and requires the default three consecutive PASSes.
  The legacy-record and real-registry closure command over
  `loop/tests/exit-code-refusal.test.mjs` and
  `loop/tests/selector-rules.test.mjs` reported `# tests 26`, `# pass 26`,
  `# fail 0`.
- Enablement is absent-means-enabled, validates present values as booleans,
  refuses disabled author and reviewer entries before later gates, skips a
  disabled default, and prevents disabled escalation targets. The restored
  runner-policy suite covered both enabled arms and passed `20/20`.
- The final restored affected command passed `55/55/0`. No production defect
  appeared against the unmutated code. The only blocking issue is the stale
  affected-suite number in `RESULT2.md`.
- `.job/` was empty after the work. No tracked mutation remained; the status
  showed only the four supplied untracked inputs before this review file.

## What I ran

Read-only scope and restoration checks:

```text
git -C D:/addictedtoai-worktrees/fleet6-stage0-F diff --name-status ddbfd52ca16ccf5cff92633d0b571e1a4ce69c91..HEAD
M loop/conformance.mjs
M loop/lib/ledger.mjs
M loop/lib/runners.mjs
M loop/lib/select.mjs
M loop/run.mjs
M loop/tests/conformance.test.mjs
M loop/tests/portability.test.mjs
M loop/tests/runner-policy.test.mjs
M scripts/no-change-dir-refs.test.mjs

git -C D:/addictedtoai-worktrees/fleet6-stage0-F diff --name-status df448970490c7fe496317182417364a281c216ed..HEAD
M loop/lib/select.mjs
M loop/tests/conformance.test.mjs
M loop/tests/portability.test.mjs
M loop/tests/runner-policy.test.mjs
M scripts/no-change-dir-refs.test.mjs

git -C D:/addictedtoai-worktrees/fleet6-stage0-F diff --check ddbfd52ca16ccf5cff92633d0b571e1a4ce69c91..HEAD
exit 0, no output

node -p "new Date().toLocaleString('sv-SE')"
2026-09-09 17:40:08
```

Final restored affected command:

```text
node --test --test-reporter=tap D:/addictedtoai-worktrees/fleet6-stage0-F/loop/tests/conformance.test.mjs D:/addictedtoai-worktrees/fleet6-stage0-F/loop/tests/runner-policy.test.mjs D:/addictedtoai-worktrees/fleet6-stage0-F/loop/tests/portability.test.mjs D:/addictedtoai-worktrees/fleet6-stage0-F/scripts/no-change-dir-refs.test.mjs
# tests 55
# pass 55
# fail 0
# cancelled 0
# skipped 0
# todo 0
```

Closure command:

```text
node --test --test-reporter=tap D:/addictedtoai-worktrees/fleet6-stage0-F/loop/tests/exit-code-refusal.test.mjs D:/addictedtoai-worktrees/fleet6-stage0-F/loop/tests/selector-rules.test.mjs
# tests 26
# pass 26
# fail 0
# cancelled 0
# skipped 0
# todo 0
```

The five round-1 mutation commands and the three sweep commands are listed
above with their real red totals and restored hashes. One static historical
count probe first exited `1` because of a malformed PowerShell regex; the
read-only probe was corrected with a literal match and produced the stated
round-1 test-file counts. No file was written by that probe.

I did not run `npm test`, any build or verify command, the Pulse, the Desk, a
real conformance run, a commit, a push, or any other publish operation.
