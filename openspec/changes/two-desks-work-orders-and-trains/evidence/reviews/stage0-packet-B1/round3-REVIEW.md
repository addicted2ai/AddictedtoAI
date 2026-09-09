# Stage 0 packet B1 round 3 — VERDICT: revise

## Findings

1. RESULT.md:156 records the marker-heading mutation as `pass 20, fail 1`, but the exact mutation at `loop/lib/specs.mjs:194-197` produced `tests 21`, `pass 19`, `fail 2`. The failing arms were both `the binding fixture is the artifact bound, not a live-tree assertion` (brief-excerpt-budget.test.mjs:275) and `a tight cap keeps every constitution marker in priority order` (:344). Because `cutMarker` is shared by constitution and pending markers, both failures are expected. Correct row 8 with the actual two-arm output and rerun it with restoration/hash evidence.

2. RESULT.md:84 says that reverting the guidance wording was mutation row 17, but row 17 at RESULT.md:165 is the unrelated `files: allFiles` mutation. The changed executor-facing line `loop/lib/brief.mjs:720` has no mutation row and is not covered by the non-behavioural declaration at RESULT.md:172-179; task 9 explicitly makes that wording behavioural. Add a distinct row for that line (or correct the numbering) with a real red run and restoration hash.

3. The first requested naming property has no discoverable check with its stated scope. `loop/tests/portability.test.mjs:85-112` scans registered model/provider/harness values only in `loop/` and `data/config.json`, and scans registered runner IDs only in `loop/`, `pulse/`, and `scripts/`; it does not cover root `lib/`, `app/`, or `tools/`, nor model/provider/harness values in `pulse/`, `scripts/`, `app/`, or `tools/`. `pulse/tests/zero-model.test.mjs:57-78` checks environment variables and inference endpoints, which is a different property. Extend or explicitly scope the enforcement before claiming the six-directory property is enforced. This gap predates the four-file B1 diff, but the sealed instructions require it to be reported.

## The tight cap

- Marker-only reservation: the pinned arm at `loop/tests/brief-excerpt-budget.test.mjs:344-356` uses three 9,000-character requirements and `maxChars: 600`, so it reaches the binding state. Replacing marker reservations with later full-content reservations produced `tests 21`, `pass 20`, `fail 1`, with the arm reporting actual marker count `1` instead of `3`.
- First-come priority: the same arm requires `PULSE_FIRST_CONTENT` before the pulse marker and checks pulse/site/review order. Reversing the floor loop produced `tests 21`, `pass 20`, `fail 1`; the arm failed at `:352` because `PULSE_FIRST_CONTENT` was absent. This confirms the fixture reaches the priority failure, not merely a live-tree case where all floors fit.
- A floor whose content does not fit gets its named marker: the clean arm saw all three `CUT: requirement "..."` markers in order, with the earlier pulse floor receiving the available content. The author’s cut-content mutation is recorded in row 7; the marker-heading mutation I reran also made the tight-cap and binding marker assertions red.
- Below the marker sum fails loudly: the same pinned fixture calls `maxChars: 1` at `:359-365`; the clean run raised the named `excerpt configuration error` with a positive marker shortfall. Changing the condition so the throw was unreachable produced `tests 21`, `pass 20`, `fail 1`, `Missing expected exception` at `:361`.

The clean tight-cap run reported `tests 21`, `pass 21`, `fail 0`; its live measurement was `largest=41043`, with `post,repair,prune` cut. The invalid case did not return a degraded excerpt.

## The mutations I re-ran myself

All runs below used the focused test and parsed `tests 21`; every mutation was red.

- Table row 5: changed `maxChars < markerMinimum` to `maxChars < 0`. Result: `pass 20`, `fail 1`; only `a cap below the constitution marker minimum fails with its shortfall` failed, with `Missing expected exception` at `brief-excerpt-budget.test.mjs:361`. One arm moved.
- Table row 8: removed `JSON.stringify(section.heading)` from `cutMarker`. Result: `pass 19`, `fail 2`; the binding fixture and tight-cap arms failed. Two arms moved. This is the table discrepancy in Finding 1.
- Table row 13: changed `subjects: []` to `subjects: job.subjects ?? []`. Result: `pass 20`, `fail 1`; only `Stage 0 passes no job-field fallback as a subject list` failed at `:216`. One arm moved.
- Table row 3: reserved later full requirement text instead of marker minimums. Result: `pass 20`, `fail 1`; the tight-cap arm failed with actual `1 !== 3` at `:347`. One arm moved.
- Table row 6: reversed the floor allocation loop. Result: `pass 20`, `fail 1`; the tight-cap arm failed its `PULSE_FIRST_CONTENT` assertion at `:352`. One arm moved.
- My mutation: changed `cutCandidates.size > 0` to `cutCandidates.size > 1`. Result: `pass 20`, `fail 1`; only `a bounded excerpt tells the executor that relevant material was omitted or cut` failed at `:376`. One arm moved.

Each mutation was restored immediately. The final SHA-256 hashes were identical to the pre-mutation hashes:

```text
106279FCA88E005223E3704BF4C36856E59F0C1657A5C57DE3C59ADC97B68FEF  loop/lib/specs.mjs
B3B1EA731CBDFD31C1903C364B70CF18F9F41FA564EC3A435F6401EB994B45FE  loop/lib/brief.mjs
F54F4E28F1604A5DCD55FBED1DBC81191DCCA185D9B7AF6AC2B960D6ABC9303C  loop/lib/config.mjs
A23205BA8773E9655271ACF652EECDFD5F6DCD111B1313C7CCD2A42197EC00CC  loop/tests/brief-excerpt-budget.test.mjs
```

No probe file was created, so there was no probe file to delete.

## The mutation table, judged

The mutations are plausible mistakes a competent author could make: restoring the old pending fallback, reserving content instead of markers, reversing priority, removing the loud error, forwarding a job field, losing marker identity, restoring per-capability division, and changing truncation or source-list handling. The selected rows were actually rerun; rows 3, 5, 6, and 13 matched their claimed red shape, while row 8 did not match its recorded count. I cannot certify the unrerun rows from a committed run log; their outputs remain the author’s report.

The table covers the major production seams and reasonably declares the filler and measurement-only printing non-behavioural. It is not complete as written: the changed guidance line at `loop/lib/brief.mjs:720` is missing, and the row-17 cross-reference is false. The row-8 red output is also inaccurate. Those are evidence defects even though the implementation arms themselves are sound.

## The properties, and what I found enforced them

- Naming/model portability: `node --test D:\addictedtoai-worktrees\fleet6-stage0-B1\loop\tests\portability.test.mjs` passed `tests 12`, `pass 12`, `fail 0`. `node --test D:\addictedtoai-worktrees\fleet6-stage0-B1\pulse\tests\zero-model.test.mjs` passed `tests 5`, `pass 5`, `fail 0`, but that suite checks Pulse imports, model environment variables, endpoints, and verifier flags—not the six-directory registered-name property. No complete enforcement for the stated property was discoverable; see Finding 3.
- Unarchived change-directory references: `node --test D:\addictedtoai-worktrees\fleet6-stage0-B1\scripts\no-change-dir-refs.test.mjs` passed `tests 3`, `pass 3`, `fail 0`. It scans the six source directories and permits only the narrowly justified operational readers; the B1 fixture now uses `fixture-amendments` and is not a live change-directory reference.
- Exact permitted files: the merge-base diff names exactly `loop/lib/brief.mjs`, `loop/lib/config.mjs`, `loop/lib/specs.mjs`, and `loop/tests/brief-excerpt-budget.test.mjs`. The round-3 diff names only the first, third, and fourth. `loop/run.mjs`, `package.json`, and `loop/tests/specs.test.mjs` are not in the diff.

## What I checked that was sound

The frozen task and requirement are correctly applied to the core implementation. The focused suite passed `21/21`, including the empty Stage 0 subject list, positive pending-only rejection, no surplus heading admission, all-capability fixture, source-list result, marker floors, loud failure, and corrected truncation guidance. The configured excerpt ceiling is 24,000, the excerpt result stays within that excerpt budget, and the pinned artifact assertions stay separate from the time-dependent live measurement. The change-directory fixture repair is effective, and the diff has no whitespace errors.

## Was the brief faithful to the task and the requirement?

Yes on the governing standard: the brief uses the frozen `047e9bf` text, states the tight-cap obligations, passes an empty Stage 0 subject list, removes the heuristic fallbacks, and requires the safe synthetic fixture root. The defect is in `RESULT.md`’s mutation evidence, not in those normative instructions.

## Did you read REVIEW.md or REVIEW2.md?

`REVIEW.md`: no. `REVIEW2.md`: no. I inspected only their filesystem metadata while confirming they existed; I did not read either file, before or after forming these findings, and did not compare against either verdict.

## What I ran

```text
git -C D:\addictedtoai-worktrees\fleet6-stage0-B1 rev-parse --short HEAD
cef399d
git -C D:\addictedtoai-worktrees\fleet6-stage0-B1 branch --show-current
stage0/b1-brief-diet
git -C D:\addictedtoai-worktrees\fleet6-stage0-B1 merge-base main HEAD
fbe13066d1458effcc76451dbea0ac6157fcd995
git -C D:\addictedtoai-worktrees\fleet6-stage0-B1 diff --name-only fbe13066d1458effcc76451dbea0ac6157fcd995..HEAD
loop/lib/brief.mjs
loop/lib/config.mjs
loop/lib/specs.mjs
loop/tests/brief-excerpt-budget.test.mjs
git -C D:\addictedtoai-worktrees\fleet6-stage0-B1 diff --check fbe13066d1458effcc76451dbea0ac6157fcd995..HEAD
exit 0
```

Read-only authority commands:

```text
git -C D:\AddictedToAI show 047e9bf:openspec/changes/two-desks-work-orders-and-trains/tasks.md
git -C D:\AddictedToAI show 047e9bf:openspec/changes/two-desks-work-orders-and-trains/specs/loop/spec.md
```

They yielded the Stage 0 task 5–9 text and `### Requirement: The brief carries the requirements the work order names, and nothing else`.

Final clean targeted commands and counts:

```text
node --test D:\addictedtoai-worktrees\fleet6-stage0-B1\loop\tests\brief-excerpt-budget.test.mjs
tests 21 / pass 21 / fail 0
node --test D:\addictedtoai-worktrees\fleet6-stage0-B1\loop\tests\portability.test.mjs
tests 12 / pass 12 / fail 0
node --test D:\addictedtoai-worktrees\fleet6-stage0-B1\pulse\tests\zero-model.test.mjs
tests 5 / pass 5 / fail 0
node --test D:\addictedtoai-worktrees\fleet6-stage0-B1\scripts\no-change-dir-refs.test.mjs
tests 3 / pass 3 / fail 0
```

I did not run the build, the full suite, any verify script, the Pulse, a merge, a push, or any beads status mutation.

