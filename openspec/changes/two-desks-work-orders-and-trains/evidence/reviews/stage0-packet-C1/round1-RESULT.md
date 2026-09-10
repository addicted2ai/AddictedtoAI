# RESULT1

## 1. Commits

~~~~text
1aae621 loop: require subjects on carried findings
~~~~

The output of git -C D:/addictedtoai-worktrees/fleet6-stage0-C1 log --oneline main..HEAD was the line above.

## 2. What changed, per file

### loop/lib/verdict.mjs

The carry parser keeps the existing empty-string default for subject, checks it after the title and detail guards, and drops entries whose trimmed subject is empty. Its exact new warning template is:

~~~~text
${at} ${JSON.stringify(title)}: no non-empty `subject` — skipped
~~~~

For example, the parser reports:

~~~~text
carry[0] "no path": no non-empty `subject` — skipped
~~~~

The JSDoc now says the repository path is mandatory. No cap was added.

### loop/lib/carry.mjs

Warnings returned by transcription are now prefixed with the exact verdict-record path:

~~~~text
${verdictPath}: ${warning}
~~~~

The loop's existing log line therefore reads end to end as:

~~~~text
the verdict record's carry: block ${verdictPath}: carry[i] "title": no non-empty `subject` — skipped
~~~~

The discard-only orphan check now tests every accepted entry without the old entry.subject && guard. The emitted front matter always writes the required subject field. No queue grouping was added here.

### loop/lib/review.mjs

All three reviewer-brief sites were changed.

The prose before was:

~~~~text
you found and what would fix it. `subject` is optional: the one content file
the finding concerns, when there is one.
~~~~

It is now:

~~~~text
you found and what would fix it. `subject` is required: the repository path
the finding concerns.
~~~~

The worked example before was:

~~~~text
subject: <optional — the content file this concerns, e.g.
             "content/wiki/model/example.md">
~~~~

It is now:

~~~~text
subject: <required — the repository path this concerns, e.g.
             "content/wiki/model/example.md">
~~~~

The pasted front-matter skeleton before ended its carry example with only:

~~~~text
#   - title: ...             # if you are carrying nothing forward
#     detail: ...
~~~~

It now also contains:

~~~~text
#     subject: ...           # required repository path this concerns
~~~~

### loop/tests/carry.test.mjs

The seven pre-existing cases that the architect measured as turning red under the subject guard were updated as follows:

1. The case named “with subject optional” was rewritten to “with subject required”; both accepted entries now have subjects. Its old name asserted the reversed property.
2. The single-mapping fixture was repaired with a subject.
3. The mixed-good-entry fixture was repaired by adding subjects to both valid entries; the no-title entry remains the order-pin.
4. The parseVerdict fixture was repaired with a subject.
5. The two-file transcription fixture was repaired by adding a subject to the second entry and asserting that it is emitted.
6. The malformed-list fixture was repaired by giving its valid entry a subject; it also now asserts that the warning names the verdict record.
7. The retry fixture was repaired with a subject, preserving its no-overwrite assertion.

New arms cover absent and whitespace-only subjects, five entries in one record, warning provenance, and all three brief documentation sites. The second-finding/one-item queue property was not duplicated: it remains in pulse/tests/carry-queue.test.mjs.

The queue-side merge was inspected before implementation at carriedFindingItems and its call site. It still groups files by subject and still keys subject-less files by their own data/carried path. No second grouping or read-side fallback change was made.

## 3. Tests run

The output tails below are copied from each run.

### Baseline before edits

Command:

~~~~text
node --test D:/addictedtoai-worktrees/fleet6-stage0-C1/loop/tests/carry.test.mjs D:/addictedtoai-worktrees/fleet6-stage0-C1/loop/tests/corrections.test.mjs D:/addictedtoai-worktrees/fleet6-stage0-C1/loop/tests/discarded-proposal-retry.test.mjs D:/addictedtoai-worktrees/fleet6-stage0-C1/pulse/tests/carry-queue.test.mjs
~~~~

~~~~text
ℹ tests 57
ℹ suites 0
ℹ pass 57
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 19258.5408
~~~~

### Portability and unarchived-path enforcement before edits

Command:

~~~~text
node --test D:/addictedtoai-worktrees/fleet6-stage0-C1/loop/tests/portability.test.mjs D:/addictedtoai-worktrees/fleet6-stage0-C1/scripts/no-change-dir-refs.test.mjs
~~~~

~~~~text
ℹ tests 19
ℹ suites 0
ℹ pass 19
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 937.7142
~~~~

### Targeted implementation run

Command:

~~~~text
node --test D:/addictedtoai-worktrees/fleet6-stage0-C1/loop/tests/carry.test.mjs D:/addictedtoai-worktrees/fleet6-stage0-C1/loop/tests/corrections.test.mjs D:/addictedtoai-worktrees/fleet6-stage0-C1/loop/tests/discarded-proposal-retry.test.mjs D:/addictedtoai-worktrees/fleet6-stage0-C1/pulse/tests/carry-queue.test.mjs
~~~~

~~~~text
ℹ tests 59
ℹ suites 0
ℹ pass 59
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 14532.8769
~~~~

### Portability and unarchived-path enforcement after implementation

Command:

~~~~text
node --test D:/addictedtoai-worktrees/fleet6-stage0-C1/loop/tests/portability.test.mjs D:/addictedtoai-worktrees/fleet6-stage0-C1/scripts/no-change-dir-refs.test.mjs
~~~~

~~~~text
ℹ tests 19
ℹ suites 0
ℹ pass 19
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 904.4726
~~~~

### Mutation runs

The individual red and restored tails are also tabulated in section 4.

~~~~text
Mutation A red — node --test D:/addictedtoai-worktrees/fleet6-stage0-C1/loop/tests/carry.test.mjs
ℹ tests 20
ℹ suites 0
ℹ pass 19
ℹ fail 1
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 10002.5609

Mutation A restored — same command
ℹ tests 20
ℹ suites 0
ℹ pass 20
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 9674.7734

Mutation B red — node --test D:/addictedtoai-worktrees/fleet6-stage0-C1/loop/tests/carry.test.mjs
ℹ tests 20
ℹ suites 0
ℹ pass 18
ℹ fail 2
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 9706.6553

Mutation B restored — same command
ℹ tests 20
ℹ suites 0
ℹ pass 20
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 10159.1614

Record-name mutation red — node --test D:/addictedtoai-worktrees/fleet6-stage0-C1/loop/tests/carry.test.mjs
ℹ tests 20
ℹ suites 0
ℹ pass 19
ℹ fail 1
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 9618.5628

Record-name mutation restored — same command
ℹ tests 20
ℹ suites 0
ℹ pass 20
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 9997.7462

Dead-guard mutation — node --test D:/addictedtoai-worktrees/fleet6-stage0-C1/loop/tests/carry.test.mjs D:/addictedtoai-worktrees/fleet6-stage0-C1/loop/tests/discarded-proposal-retry.test.mjs
ℹ tests 33
ℹ suites 0
ℹ pass 33
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 10725.44

Dead-guard mutation restored — same command
ℹ tests 33
ℹ suites 0
ℹ pass 33
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 14728.5276

Skeleton mutation red — node --test D:/addictedtoai-worktrees/fleet6-stage0-C1/loop/tests/carry.test.mjs
ℹ tests 20
ℹ suites 0
ℹ pass 19
ℹ fail 1
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 9602.0196

Skeleton mutation restored — same command
ℹ tests 20
ℹ suites 0
ℹ pass 20
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 9563.4638
~~~~

The two queue iterations were the queue-containing baseline (57/57 overall) and the final targeted run (59/59 overall). The standalone final queue iteration was:

Command:

~~~~text
node --test D:/addictedtoai-worktrees/fleet6-stage0-C1/pulse/tests/carry-queue.test.mjs
~~~~

~~~~text
ℹ tests 14
ℹ suites 0
ℹ pass 14
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 491.016
~~~~

The final enforcement rerun was:

~~~~text
node --test D:/addictedtoai-worktrees/fleet6-stage0-C1/loop/tests/portability.test.mjs D:/addictedtoai-worktrees/fleet6-stage0-C1/scripts/no-change-dir-refs.test.mjs
~~~~

~~~~text
ℹ tests 19
ℹ suites 0
ℹ pass 19
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 953.4553
~~~~

### Final full suite on the committed tip

Command:

~~~~text
npm --prefix D:/addictedtoai-worktrees/fleet6-stage0-C1 test
~~~~

~~~~text
ℹ tests 1819
ℹ suites 0
ℹ pass 1819
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 469937.1257
~~~~

Wall time was 472.3 seconds under the 660-second timeout.

## 4. Mutation table

| Mutation | File and line; command | Red result, verbatim tail | Restored result, verbatim tail and SHA-256 |
|---|---|---|---|
| A — delete the subject guard, making subject optional | loop/lib/verdict.mjs:87; carry.test.mjs | ℹ tests 20<br>ℹ pass 19<br>ℹ fail 1<br>ℹ cancelled 0<br>ℹ skipped 0<br>ℹ todo 0<br>ℹ duration_ms 10002.5609 | ℹ tests 20<br>ℹ pass 20<br>ℹ fail 0<br>ℹ cancelled 0<br>ℹ skipped 0<br>ℹ todo 0<br>ℹ duration_ms 9674.7734<br><br>verdict.mjs SHA-256: 1C6219AA22272212D24B40A478D1C2C366DFD693E35B1D2778130CAEF3FB14C3 |
| B — introduce a cap of two by changing list.forEach to list.slice(0, 2).forEach | loop/lib/verdict.mjs:70; carry.test.mjs | ℹ tests 20<br>ℹ pass 18<br>ℹ fail 2<br>ℹ cancelled 0<br>ℹ skipped 0<br>ℹ todo 0<br>ℹ duration_ms 9706.6553 | ℹ tests 20<br>ℹ pass 20<br>ℹ fail 0<br>ℹ cancelled 0<br>ℹ skipped 0<br>ℹ todo 0<br>ℹ duration_ms 10159.1614<br><br>verdict.mjs SHA-256: 1C6219AA22272212D24B40A478D1C2C366DFD693E35B1D2778130CAEF3FB14C3 |
| Record naming — remove the verdictPath prefix from carry warnings | loop/lib/carry.mjs:85; carry.test.mjs | ℹ tests 20<br>ℹ pass 19<br>ℹ fail 1<br>ℹ cancelled 0<br>ℹ skipped 0<br>ℹ todo 0<br>ℹ duration_ms 9618.5628 | ℹ tests 20<br>ℹ pass 20<br>ℹ fail 0<br>ℹ cancelled 0<br>ℹ skipped 0<br>ℹ todo 0<br>ℹ duration_ms 9997.7462<br><br>carry.mjs SHA-256: D40A50835B588BCEAE9E51CE05E8FAFBBF1FC6D2872740A3E7869A5BE98422AC |
| Dead orphan guard — restore subjectMustExist && entry.subject && ... | loop/lib/carry.mjs:98; carry.test.mjs plus discarded-proposal-retry.test.mjs | No red: ℹ tests 33<br>ℹ pass 33<br>ℹ fail 0<br>ℹ cancelled 0<br>ℹ skipped 0<br>ℹ todo 0<br>ℹ duration_ms 10725.44 | ℹ tests 33<br>ℹ pass 33<br>ℹ fail 0<br>ℹ cancelled 0<br>ℹ skipped 0<br>ℹ todo 0<br>ℹ duration_ms 14728.5276<br><br>carry.mjs SHA-256: D40A50835B588BCEAE9E51CE05E8FAFBBF1FC6D2872740A3E7869A5BE98422AC |
| Skeleton — remove the new required subject line from the pasted template | loop/lib/review.mjs:737; carry.test.mjs | ℹ tests 20<br>ℹ pass 19<br>ℹ fail 1<br>ℹ cancelled 0<br>ℹ skipped 0<br>ℹ todo 0<br>ℹ duration_ms 9602.0196 | ℹ tests 20<br>ℹ pass 20<br>ℹ fail 0<br>ℹ cancelled 0<br>ℹ skipped 0<br>ℹ todo 0<br>ℹ duration_ms 9563.4638<br><br>review.mjs SHA-256: C8A24A38FD13BB856DC630715BD397B795DE938309D55D8D94EBB0E7691490BB |

The dead-guard row has no red arm by design: the parser now refuses every subject-less entry before transcription, so the old condition is unreachable for accepted entries.

## 5. The seven

All seven cases named by the architect were handled; none disagreed with the measured list:

1. “a well-formed entry is read whole, with subject optional” — rewritten, including its name, because the name asserted the reversed property; both entries now carry subjects.
2. “a single mapping (not a list) is accepted the same way a list of one would be” — repaired with a subject on the mapping.
3. “one bad entry among good ones is skipped without discarding the rest” — repaired by adding subjects only to the two good entries; the title-less entry still tests guard order.
4. “parseVerdict carries carry: and carryWarnings alongside the existing fields, unchanged” — repaired by adding a subject to its valid entry.
5. “two carry entries become two files, each named for the job and numbered, with real titles” — repaired by adding a subject to the second entry and changing its front-matter assertion to require that field.
6. “a malformed entry inside an otherwise-valid carry: list is skipped and reported, the rest still transcribe” — repaired by adding a subject to the valid entry and retaining the malformed title-less entry; the record-path warning assertion was added here.
7. “transcribing twice does not overwrite an existing file — a retry does not clobber a finding already written” — repaired by adding a subject to its valid entry.

The two cases that looked like ordinary repairs were not silently renamed: only the first had a defective test name, so only that one was rewritten.

## 6. Blocked or refused calls

None.

## 7. Where I disagreed with a ruling, and findings not fixed

The only wording discrepancy was Mutation B: the task says to “reinstate” a cap, but the measured code at this authority has no cap. I introduced a cap of two solely for the mutation, observed two failures, and restored the uncapped loop. No production cap was added.

The subject-less read-side fallback remains intentionally present in pulse/lib/queue.mjs and remains green in the queue tests. The subject merge already shipped in carriedFindingItems, so no second merge was written.

Two findings are outside this packet and were not changed:

- data/carried/README.md:9 still contains the older optional/content-file wording; the brief explicitly reserves that file for the orchestrator at handover.
- loop/run.mjs:678 still counts the parser's accepted carry list in the ledger's carried field; the resolution explicitly leaves that follow-up to the architect because run.mjs is outside the allowed files.

Tasks 16 and 17 were not implemented, and scripts/lint-deferrals.mjs was not created. No task artifact or reserved configuration file was changed.
