# Stage 0 packet C1 — round 1 — VERDICT: approve

## Sealing

I opened no earlier `REVIEW*.md` file, no earlier round's report, and no parallel reviewer's output. No `REVIEW*.md` existed at dispatch per the brief; I did not search for one (`Glob` for `REVIEW*` deliberately not run) and encountered none. I read `RESULT1.md` only as a hypothesis. Local date for this report: 2026-09-09 (from `node -p "new Date().toLocaleString('sv-SE')"` → `2026-09-09 22:58:02`).

## Findings

No must-fix findings. The implementation satisfies tasks 13–15 and the requirement's subject/merge/brief bullets as read at the authority commit. One defect is reported against the brief, not the author (see "Was the brief faithful"), and two changed lines have no distinguishing assertion by construction — both are required dead-code removals whose indistinguishability I demonstrate below; demanding a red for them would demand the impossible.

## The seven, judged one by one

Architect measured seven reds, all in `loop/tests/carry.test.mjs`. My count agrees: seven. No disagreement with the measurement, which outranks all else — there is none.

1. `parseCarry: a well-formed entry is read whole, with subject optional` — REWRITTEN to `...with subject required` (`loop/tests/carry.test.mjs:44`). Both entries now carry subjects; old assertion `assert.equal(carry[1].subject, '', 'subject defaults to empty, never undefined')` replaced by `assert.equal(carry[1].subject, 'content/wiki/model/y.md')`. Correct: repairing it would leave a name asserting the reversed property. Trap handled.
2. `parseCarry: a single mapping (not a list) is accepted the same way a list of one would be` (`:72-76`) — repaired with `subject: 'content/x.md'`. Correct.
3. `parseCarry: one bad entry among good ones is skipped without discarding the rest` (`:95-105`) — repaired by adding subjects only to the two good entries (`content/good-one.md`, `content/also-good.md`); middle `{title:'', detail:'no title here'}` left with neither title nor subject. Correct and order-preserving: with the guard third, it still reports "no title" (`assert.equal(carryWarnings.length, 1)` plus `assert.deepEqual(carry.map(...), ['good one','also good'])` proves ENTRY dropped, record kept).
4. `parseVerdict carries carry: and carryWarnings alongside the existing fields, unchanged` (`:117-126`) — repaired with `subject: content/x.md`. Correct.
5. `two carry entries become two files, each named for the job and numbered, with real titles` (`:207-234`) — repaired: second entry gains `subject: content/b.md`; old `assert.equal(two.data.subject, undefined, 'no subject key at all...')` replaced by `assert.equal(two.data.subject, 'content/b.md')`. Correct: old assertion pinned absence and had to die.
6. `a malformed entry inside an otherwise-valid carry: list is skipped and reported, the rest still transcribe` (`:252-267`) — repaired: valid entry gains `subject: content/good.md`; malformed `detail: no title, dropped` retained (neither title nor subject, so title guard fires first); new `assert.ok(r.warnings[0].startsWith(`${p}: `), 'the warning names its verdict record')` added. Correct.
7. `transcribing twice does not overwrite an existing file — a retry does not clobber a finding already written` (`:269-281`) — repaired with `subject: content/x.md`, preserving `assert.match(r.skipped[0].why, /already exists/)` and sentinel check. Correct: without the subject the first transcription would create nothing and the test would fail with `ENOENT`, not an assertion — the natural wrong response (fix the path) was not taken.

## The skeleton test — would a pasted skeleton be accepted?

YES. Assembled brief at tip (`loop/lib/review.mjs:734-737`):

```
# carry:                    # optional, zero or more — omit the key entirely
#   - title: ...             # if you are carrying nothing forward
#     detail: ...
#     subject: ...           # required repository path this concerns
```

Uncommented and filled (`title`/`detail`/`subject` non-empty), this yields exactly what `parseCarry` accepts: `if (!title)` → `:79-82`, `if (!detail)` → `:83-86`, `if (!subject)` → `:87-90` all pass. Before the change the skeleton listed only `title`/`detail` and would have produced entries this change refuses. All three task-14 sites are changed (prose `:685-686`, example `:693-694`, skeleton `:737`), all say "required" + "repository path", none says "optional" or "content". The second error rides fixed: `subjectMustExist` tests `existsSync(join(repoRoot, entry.subject))` (`loop/lib/carry.mjs:98`) — any tracked path — and the brief no longer narrows to "content file". `verdict.mjs:58-59` JSDoc likewise corrected to "`subject` is also mandatory: the repository path".

## The mutations I ran

NONE by execution. I have no edit rights (sealing property): I cannot commit, modify, create or delete any file, even temporarily. I did not simulate a mutation, did not describe one I did not run, and report no arm count I did not measure. What I did instead, per the brief's harder half:

Changed behavioural lines from `git diff 3025c58..1aae621` (four files, +59/−21, confirmed), each tied to a quoted assertion, all run unmodified (counts below prove they pass today, not that they would fail on reversal — I say so plainly):

- `verdict.mjs:87-90` guard `if (!subject) { carryWarnings.push(`${at} ${JSON.stringify(title)}: no non-empty `subject` — skipped`); return; }` — tied to `carry.test.mjs:66-69`: `assert.deepEqual(carry, []); assert.equal(carryWarnings.length, 2); assert.match(carryWarnings[0], /carry\[0\] "no path": no non-empty `subject`/);`. Deleting the guard would yield `carry.length 2`, `warnings 0`. Guard is third after title (`:79`) and detail (`:83`); empty-string default at `:78` (`entry.subject !== undefined && entry.subject !== null ? String(entry.subject).trim() : ''`) is byte-identical to the authority version (verified via `git show 3025c58:loop/lib/verdict.mjs`) — `!subject` behaves exactly as `!title`/`!detail`. No `?? null` tidy, no new parameter.
- `carry.mjs:85` `(v.carryWarnings ?? []).map((warning) => `${verdictPath}: ${warning}`)` — tied to `carry.test.mjs:263`: `assert.ok(r.warnings[0].startsWith(`${p}: `), 'the warning names its verdict record')`. Removing the prefix would fail that assertion. End-to-end shape via `run.mjs:1923` (`the verdict record's carry: block ${w}`) reads `the verdict record's carry: block <verdictPath>: carry[i] "title": ...` — record named by absolute verdict path, derivable from the log line alone.
- `review.mjs:685-686` prose, `:693-694` example, `:737` skeleton — tied to `carry.test.mjs:311-313`: `assert.match(brief, /`subject` is required: the repository path/); assert.match(brief, /subject: <required — the repository path this concerns/); assert.match(brief, /#\s+subject: \.\.\.\s+# required repository path this concerns/);`. Reverting any one site fails its line.
- `carry.mjs:98` removal of `entry.subject &&` — NO distinguishing assertion exists, by design (declared no-red). Reason DEMONSTRATED, not merely stated: `transcribeCarriedFindings` calls `parseVerdict` itself at `:84`; `parseCarry` drops every subject-less entry, so every entry reaching `:98` has non-empty `subject`. Restoring the conjunct changes nothing on any reachable input. Orphan tests still pass (see runs).
- `carry.mjs:114` conditional spread → unconditional `subject:` — likewise indistinguishable on reachable inputs (accepted subjects are always truthy), so no assertion can catch the revert. This is the second dead guard task 13(vii) requires removed; no red can exist. I name it as the untied line rather than hiding it.
- `verdict.mjs:58-59` JSDoc — docs, no direct assertion (no test pins JSDoc text); required by task 14(iv), correctly worded.

Wrong worlds I constructed and why they still fail: a guard testing `!entry.subject` without `trim()` would pass the absent case but fail the whitespace case (`subject: '   '` pinned at `:62,69`); a guard placed first would report "no subject" on the deliberate no-title entry (`mock-proposal-executor.mjs:110-116`, second entry `detail: no title...` with neither title nor subject) — the end-to-end test at `carry.test.mjs:346` (`assert.match(ctx.output(), /no non-empty `title`/`) still passes, proving order pinned; a warning naming only `carry[i]`+title without record would fail `:263`; a second grouping in `pulse` would pass its own tests but the diff contains none (see below).

What I did NOT check by execution: `null` and `''` subjects (test pins absent + whitespace only), pasted-skeleton transcription, and any mutation red — all would require creating a probe file, which sealing forbids. By reading, `null`→`''` and `''`→`''` via `:78` then `!subject`, identical to the pinned branches; I state the gap rather than claiming it.

## The mutation table, judged

Author's five rows, each judged on whether the named arm contains an assertion the named mutation would break:

- A (delete `!subject` guard): would break `:66-69` (expects `[]` + 2 warnings). Red explainable. Accept.
- B (introduce cap of two via `list.slice(0,2)`): would break `:241` (`assert.equal(r.transcribed.length, 5)`) AND `:103` (three-entry list `[good,bad,good]` sliced to 2 yields 1 good, not 2) — author reports 2 fails, consistent. "Reinstate" is the known misnomer (no bound ever existed; only `.length` in the two files at tip are `verdict.mjs:254` presence test, `:274` reasons-empty, `carry.mjs:87` empty check — no cap). Author introduced rather than reinstated and said so in §7. Accept.
- Record-naming (drop `verdictPath` prefix): would break `:263` (`startsWith(`${p}: `)`). Accept.
- Dead orphan guard (restore `entry.subject &&`): no red by design, author reports `33 pass` (carry 20 + discarded 13) both ways. Accept as demonstrated no-arm (see above); a row with "no arm" is the correct reporting, not an omission.
- Skeleton (remove `:737` line): would break `:313` (`/#\s+subject: ... # required.../`). Accept; confirms an assertion on the new wording lives in that test and nowhere else per task 14(vi).

I did not re-run these mutations (no edit rights); reds are the author's hypothesis, but each red is explicable from the test's own text, so I accept the table as coherent.

## What I checked that was sound

- Branch/tip/base: `log --oneline main..HEAD` → `1aae621 loop: require subjects on carried findings`; `status --short` → only `?? .agent-brief.md`, `?? RESULT1.md`; `diff --stat 3025c58..1aae621` → four files +59/−21 as dispatched. `pulse/lib/queue.mjs` and `data/carried/README.md` absent from diff — correct. README `:9` still reads "optional `subject` (the one content file...)" — out of scope per task 14(v), correctly untouched.
- Requirement read directly at `3025c58:openspec/.../specs/review/spec.md` (review delta, subject/merge/brief bullets + scenarios "A finding with no subject is refused", "volume on ledger", "cannot become rejection"). Diff judged against it, not the brief.
- Guard refuses ENTRY not record/merge/exit: `:95-105` (rest kept) + `:154-180` (`a carry: block does not affect the merge gate...` asserts `ok true` with well-formed carry, `would-cite-empty` with blank cite regardless, `ok true` with malformed carry). `run.mjs:678` ledger (`gate.verdict.carry.length` = accepted list) unchanged, recorded in RESULT §7 per task 13(viii) — meaning change from "written" to "accepted" without a `run.mjs` line, correctly stated not fixed.
- No second grouping: `carriedFindingItems` (`pulse/lib/queue.mjs:424`) groups on `subject` falling back to `data/carried/${name}` (`:455-456`); diff touches no pulse file. No numeric cap: no `.length` bound in `verdict.mjs`/`carry.mjs` beyond presence/empty checks; five-entry arm (`:236-250`) asserts 5 files.
- Read-side fallback intact: `carry-queue.test.mjs:73` (`a carried-finding file with no subject still produces a dispatchable item` → `it.subject === 'data/carried/j-1-carry-1.md'`) and `:243` (`findings with NO subject never group` → 2 items keyed by own paths) both pass in the 14/14 run. Merge grouping intact: `:189` (`several findings on ONE subject become ONE job`) + `:229,:259,:302` pass.
- Orphan check still refuses non-existent subject only on discard: `discarded-proposal-retry.test.mjs:244-290` (orphaned / control-exists / without-flag) pass in the 59 run; `run.mjs:1912` wires `subjectMustExist: outcome === 'discarded'`.
- Properties: `portability.test.mjs` + `no-change-dir-refs.test.mjs` 19/19 pass (no model/provider/harness outside `runners.yml`; no unarchived change-dir refs). `review.test.mjs` + `review-blog-bar.test.mjs` 78/78 pass; `verify-launch-voice-carry.test.mjs` 10/10 pass — files needing nothing stay green (counts by running, never by grep).
- Full suite: author reports one completed iteration on committed tip `npm --prefix ... test` → `tests 1819, pass 1819, fail 0`, wall 472.3s under 660s timeout. Quoted, 0 failed, no cut-off/red/earlier-commit substitution. I did not run it (hard limit forbids full `npm test`).

## Was the brief faithful to the tasks and the requirement? (and the closure)

NO — the author's brief (`.agent-brief.md:207`) points at `.../specs/loop/spec.md` for a requirement that lives in `.../specs/review/spec.md` (`A reviewer's non-blocking finding reaches work without editing anything`, subject/merge/brief bullets). Same wrong pointer as this review brief's first draft. I judge the diff against the committed review-delta requirement directly. The author worked from the verbatim task text (which the brief correctly quotes and which names the standard) and the implementation matches the requirement — an author who did what a wrong brief's quoted tasks said did its job. Defect is against the brief, not a must-fix on the code.

Closure: I searched `carryWarnings` (only `verdict.mjs` producer, `carry.mjs:85` sole consumer via `parseVerdict`, `carry.test.mjs`), `parseCarry` (only `verdict.mjs:64,285`), `.carry` readers (`verdict.mjs:65`, `carry.mjs:86`, `run.mjs:678` ledger), `transcribeCarriedFindings` (only `run.mjs:1904` + `carry.test.mjs` + `discarded-proposal-retry.test.mjs`), `entry.subject` (only `verdict.mjs:78,197` — latter is `readsHumanFrom`, different feature — and `carry.mjs:98-99,114`), `data/carried` subject reads (`queue.mjs:455` carried; `:577` is vanished-feed-row `source:row_id`, not carried), `subjectMustExist` (`carry.mjs`, `run.mjs:1912`, discarded tests). Method: `Grep` scoped by directory + `Read` + `git diff`, never a line-grep count as evidence. No exact pin lives in a file the author's list did not reach, except the ledger pin `run.mjs:678` — outside packet files by design, but the author reached it anyway (RESULT §7 records it per task 13(viii)). Closure holds; the architect's growth via `run.mjs:678` is accounted for.

## What I ran

All `node --test <absolute path>`, targeted only, unmodified tree:

- `node --test .../loop/tests/carry.test.mjs .../loop/tests/corrections.test.mjs .../loop/tests/discarded-proposal-retry.test.mjs .../pulse/tests/carry-queue.test.mjs` → `tests 59, pass 59, fail 0` (reproduces architect's 59/59; author's targeted figure matches).
- `node --test --test-reporter=tap .../loop/tests/carry.test.mjs` → `tests 20, pass 20, fail 0` (asserts count; TAP `1..20`, `ok 1..20`).
- `node --test .../pulse/tests/carry-queue.test.mjs` → `tests 14, pass 14, fail 0`.
- `node --test .../loop/tests/portability.test.mjs .../scripts/no-change-dir-refs.test.mjs` → `tests 19, pass 19, fail 0`.
- `node --test .../loop/tests/review.test.mjs .../loop/tests/review-blog-bar.test.mjs` → `tests 78, pass 78, fail 0`.
- `node --test .../scripts/verify-launch-voice-carry.test.mjs` → `tests 10, pass 10, fail 0`.
- `git -C ... log/status/diff --stat/diff/show` (read-only) for sealing, scope, requirement, authority-file comparison.

Not run: full `npm test` (forbidden; author's 1819/0 taken as hypothesis with wall-time/cut-off checks above), any `verify-*` as a whole, any mutation (no edit rights), any probe writing under `data/` or `.job/` (sealing forbids creation; I created and deleted nothing).

