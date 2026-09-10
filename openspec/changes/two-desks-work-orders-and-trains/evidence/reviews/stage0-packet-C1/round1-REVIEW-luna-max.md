# Stage 0 packet C1 — round 1 — VERDICT: revise

## Sealing

Review date: 2026-09-09, machine local date.

No earlier `REVIEW*.md` file existed when I began. I opened neither an earlier
round's report nor the parallel reviewer's output; I did not encounter a
parallel output file. I did read the same-round author files `RESULT1.md` and
`.agent-brief.md` as hypotheses.

The branch was `stage0/c1-carry-subject` at `1aae621`; the merge base was
`3025c58`. The tracked diff is the four permitted implementation/test files.

## Findings

1. `.agent-brief.md:207` points the reader at
   `openspec/changes/two-desks-work-orders-and-trains/specs/loop/spec.md` for
   the subject, merge, and brief requirement. The authoritative requirement is
   in the review delta at
   `openspec/changes/two-desks-work-orders-and-trains/specs/review/spec.md`.
   This violates the packet's requirement to guide the author to the actual
   requirement and is a broken reference even though the quoted task text led
   this implementation to the correct behavior. Replace the pointer with the
   review delta at the authority commit. **CLASS: `broken-reference` /
   `spec-violation`.**

This is the only must-fix. The implementation itself has no remaining
must-fix finding; the verdict is `revise` for the author brief defect.

## The seven, judged one by one

The final tree matches the architect's seven-case list; I found no different
count or missing case.

1. `parseCarry: a well-formed entry is read whole, with subject optional` was
   correctly **rewritten** as `with subject required`; its old name asserted
   the opposite property. Both accepted fixtures now carry subjects.
2. The single-mapping case was correctly **repaired** with a subject.
3. The mixed-good-entry case was correctly **repaired** by adding subjects only
   to the two valid entries. Its title-less entry remains without a subject so
   the title guard stays first.
4. The `parseVerdict` carry/carryWarnings case was correctly **repaired** with
   a subject and still checks the existing fields.
5. The two-file transcription case was correctly **repaired** by adding the
   second subject and asserting the emitted front matter contains it.
6. The malformed-list case was correctly **repaired** by adding a subject to
   the valid entry. Its malformed title-less entry remains, and it now checks
   that the warning starts with the verdict-record path.
7. The retry/no-overwrite case was correctly **repaired** by adding a subject;
   its sentinel assertion and transcription path remain intact. It was not
   “fixed” by changing the path.

The deliberate no-title/no-subject fixture in
`loop/tests/mock-proposal-executor.mjs:110-114` still takes the title path.
It produces a `carry[1]: no non-empty \`title\` — skipped ...` warning, not a
subject warning.

## The skeleton test — would a pasted skeleton be accepted?

Yes, after the reviewer fills the commented example with a real repository
path. The assembled brief now has all three required descriptions: prose at
`loop/lib/review.mjs:685-686`, the worked example at `:693-694`, and the pasted
front-matter skeleton at `:734-737`. The skeleton includes a required
`subject` line, and `parseCarry` accepts the filled entry. Removing that one
skeleton line made the documentation test fail 19/20, so the assertion is not
vacuous.

The wording says “repository path,” not “content file,” which matches the
orphan check's `existsSync(join(repoRoot, entry.subject))` behavior for any
tracked path.

## The mutations I ran

All tracked mutations were restored immediately. Restored hashes are in the
table below and match the hashes captured before probing.

- Deleted the `!subject` guard in `loop/lib/verdict.mjs:87`: 19/20 passed,
  1 failed; restored: 20/20 passed.
- Introduced `list.slice(0, 2)` in `loop/lib/verdict.mjs:70`: 18/20 passed,
  2 failed; restored: 20/20 passed.
- Removed the verdict-path prefix in `loop/lib/carry.mjs:85`: 19/20 passed,
  1 failed; restored: 20/20 passed.
- Restored `entry.subject &&` in `loop/lib/carry.mjs:98`: 33/33 passed,
  0 failed; restored: 33/33 passed. This no-red result is intentional: all
  accepted entries have already passed `parseCarry`, and transcription calls
  `parseVerdict` itself.
- Removed the required subject line from the skeleton at
  `loop/lib/review.mjs:737`: 19/20 passed, 1 failed; restored: 20/20 passed.

A throwaway subject probe also verified absent, `null`, empty, and whitespace
subjects; entry-only refusal; and title-before-detail-before-subject ordering.
The probe files were removed after the run.

## The mutation table, judged

| Mutation | Red result | Restored result and SHA-256 | Judgment |
|---|---:|---|---|
| Delete `!subject` guard; `verdict.mjs:87` | `# tests 20`, `# pass 19`, `# fail 1` | `# tests 20`, `# pass 20`, `# fail 0`; `verdict.mjs` `1C6219AA22272212D24B40A478D1C2C366DFD693E35B1D2778130CAEF3FB14C3` | The refusal arm is live. |
| Introduce a two-entry cap; `verdict.mjs:70` | `# tests 20`, `# pass 18`, `# fail 2` | `# tests 20`, `# pass 20`, `# fail 0`; same `verdict.mjs` hash | The five-entry arm proves no cap. |
| Remove record-name prefix; `carry.mjs:85` | `# tests 20`, `# pass 19`, `# fail 1` | `# tests 20`, `# pass 20`, `# fail 0`; `carry.mjs` `D40A50835B588BCEAE9E51CE05E8FAFBBF1FC6D2872740A3E7869A5BE98422AC` | Warning provenance is asserted. |
| Restore dead `entry.subject &&`; `carry.mjs:98` | `# tests 33`, `# pass 33`, `# fail 0` | `# tests 33`, `# pass 33`, `# fail 0`; same `carry.mjs` hash | Correct no-arm mutation: the invariant makes the branch unreachable. |
| Remove skeleton subject line; `review.mjs:737` | `# tests 20`, `# pass 19`, `# fail 1` | `# tests 20`, `# pass 20`, `# fail 0`; `review.mjs` `C8A24A38FD13BB856DC630715BD397B795DE938309D55D8D94EBB0E7691490BB` | The template documentation is tested. |

The changed test file was not mutated; its final SHA-256 is
`1D8E28DEA812B34FDFF1CA4F863350D4975F1B93993F728DAA9CDFE162A0668E`.

## What I checked that was sound

- `parseCarry` retains the empty-string subject default, applies
  `String(...).trim()`, and runs the subject refusal third. A missing, `null`,
  empty, or whitespace value drops only that entry and leaves the record,
  accepted entries, merge verdict, and exit status intact.
- `carry.mjs` prefixes every parser warning with the exact `verdictPath`, so a
  complete warning is record-qualified and still contains `carry[i]` and the
  title. It always writes an accepted subject to carried-file front matter.
- No second grouping or transcription-time merge was added. The existing
  `pulse/lib/queue.mjs:424-468` groups by subject and falls back to each
  subject-less file's own `data/carried/` path. Its call site at `:868` is
  unchanged.
- The queue's subject-less-file fallback, same-subject grouping, separate
  subject-less items, retirement behavior, and deterministic ordering all
  passed the full 14-test queue suite.
- The discard-only orphan behavior remains correct: nonexistent subjects are
  orphaned on discard, existing subjects transcribe, and merge-path findings
  are not orphaned.
- The merge gate remains independent of `carry:` in both directions. The
  targeted suite also exercises the deliberate no-title warning fixture and
  the real loop wiring.
- The author changed all three task-14 documentation sites and the related
  optionality JSDoc in `verdict.mjs`; the stale
  `data/carried/README.md` wording was correctly left out of this packet.
- The diff is limited to the four permitted tracked files. Neither
  `pulse/lib/queue.mjs` nor `data/carried/README.md` appears in it.
- The runner/model/provider/harness scan and unarchived-change-path scan passed
  19/19. Existing `scripts/verify-launch-voice-carry.test.mjs` `carry` objects
  are the separate `reads-human-from` shape and were correctly left alone.
- A structural front-matter scan found historical subject-less carry entries in
  old review records; the new parser correctly refuses those entries. Already
  materialized subject-less files remain dispatchable through the preserved
  queue fallback.

## Was the brief faithful to the tasks and the requirement? (and the closure)

The task quotations and quantifier resolutions in the brief were faithful, and
the implementation satisfies the actual review-delta requirement. The brief
was not fully faithful because its sole requirement pointer at
`.agent-brief.md:207` names the loop delta instead of the review delta. That is
the finding above. The author followed the task text and produced correct code;
that does not make the pointer correct.

I checked closure by searching production readers and fixtures for
`parseCarry`, `parseVerdict`, `carryWarnings`, parsed `.carry` reads, and
`carry:` constructors; by opening the mock executors, discarded-proposal and
correction tests, review tests, voice-carry tests, `pulse/lib/queue.mjs`, and
the queue tests; and by structurally parsing front matter under the review,
proposal, and carried-data directories. The closure includes the unchanged
ledger reader at `loop/run.mjs:678`, which counts the parser's accepted list;
the task explicitly states this follow-up is outside this packet and the
author recorded it. No missed exact pin or second merge was found.

## What I ran

All test commands below used `--test-reporter=tap`, and I asserted the summary
counts rather than relying on truncated output.

- Targeted implementation/property run, before the mutation probes:
  `loop/tests/carry.test.mjs`, `corrections.test.mjs`,
  `discarded-proposal-retry.test.mjs`, and `pulse/tests/carry-queue.test.mjs`:
  `# tests 59`, `# pass 59`, `# fail 0`.
- The same four-suite command after all restorations:
  `# tests 59`, `# pass 59`, `# fail 0`.
- `pulse/tests/carry-queue.test.mjs` standalone before and during the review:
  twice `# tests 14`, `# pass 14`, `# fail 0`; final standalone rerun:
  `# tests 14`, `# pass 14`, `# fail 0`.
- `loop/tests/portability.test.mjs` plus
  `scripts/no-change-dir-refs.test.mjs`: `# tests 19`, `# pass 19`,
  `# fail 0`.
- The subject-value probe passed for all four invalid value classes and the
  guard-order/entry-only cases.
- `git diff --check 3025c58..1aae621` passed with no output. The final tracked
  hashes match the committed tip, and status shows only the two supplied
  author files plus this untracked review report.
- The author report states that, on the committed tip, the final full-suite
  command completed with `# tests 1819`, `# pass 1819`, `# fail 0`, and wall
  time 472.3 seconds. I did not run the full suite myself, per the sealed
  review hard limit.

I did not run the build, any whole `verify-*` command, the Pulse or Desk on the
real repository, or any network/publish operation. One cleanup call,
`Remove-Item -LiteralPath D:\addictedtoai-worktrees\fleet6-stage0-C1\.job -Force`,
was refused by policy; the throwaway probe files were deleted and the remaining
`.job` directory is empty. A separate malformed status call with an invalid
working-directory string returned `NotADirectory` and changed nothing.
