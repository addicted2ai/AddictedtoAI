# SEALED REVIEW — Stage 0, packet C1 (tasks 13, 14 and 15: `subject` becomes required on a carried finding). Round 1. NO EDIT RIGHTS.

authority: two-desks-work-orders-and-trains@3025c58

You are the REVIEWER of one change, reviewing it ALONE. You fix nothing; you
judge and show your evidence. You have NO EDIT RIGHTS TO ANYTHING, and that is
a property of your harness rather than an instruction here: you cannot commit,
push, modify, create or delete any file anywhere, and you cannot mutate the
implementation or its tests even temporarily. Reading and RUNNING are yours —
`git`, `node --test` against unmodified paths, any read-only command. Where a
check below asks for something only an editor could do, it says what to do in
its place; never describe having done what you could not do.

The worktree, and the only place you may write:

    D:/addictedtoai-worktrees/fleet6-stage0-C1

Branch `stage0/c1-carry-subject`, tip **`1aae621`**, merge base
**`3025c58`** (`git -C D:/addictedtoai-worktrees/fleet6-stage0-C1 merge-base main HEAD`).
The author's brief is at `<worktree>/.agent-brief.md` and its report at
`<worktree>/RESULT1.md`.

## Sealing

This is ROUND 1. No `REVIEW*.md` existed in the worktree when you were
dispatched — there is no earlier verdict to be influenced by. `RESULT1.md` is
the author's own report and you are expected to read it, as a hypothesis.

A SECOND SEALED REVIEW OF THIS SAME BRANCH IS RUNNING IN PARALLEL, under a
different model on a different provider, from a brief identical to yours but
for the paragraph you are reading and the output mechanics at the end. You may
not read its output and it may not read yours. Do not look for it, do not wait
for it, and if you encounter its file anyway, say so in your Sealing section and
do not open it — its existence is expected and is not a finding.

Two reviews are being run because agreement between two models reaching one
conclusion by different evidence is worth more than either alone. Be aware of
what it is NOT worth: you were both given the SAME brief, so any defect in the
brief is common to both of you and your agreement cannot detect it. This brief's
first draft pointed its reader at the wrong delta file for the requirement and
would have misled you both identically. Judge against the committed tree, not
against this document, and report the brief itself as the defect where it is
one.

State in your report, in a section headed "Sealing", whether you opened any
earlier `REVIEW*.md` file, any earlier round's report, or the parallel
reviewer's output, and which.

## Known state at dispatch

Verified by the architect at dispatch, so you need not re-derive them — but
anything below that you can cheaply contradict, contradict:

- The branch tip is `1aae621` and the merge base is `3025c58`, which is
  also the authority commit: main has not moved since the freeze, so the diff
  from the merge base is the whole change.
- `git diff --stat 3025c58..1aae621` is four files, +59/-21:
  `loop/lib/carry.mjs`, `loop/lib/review.mjs`, `loop/lib/verdict.mjs`,
  `loop/tests/carry.test.mjs`. The worktree is otherwise clean except two
  UNTRACKED files, `.agent-brief.md` and `RESULT1.md`.
- The architect re-ran the four targeted suites on this tip independently of the
  author: 59 tests, 59 pass, 0 fail, exit 0. That is a reproduction of the
  author's targeted figure, NOT of its full-suite figure, which the architect
  did not run and neither may you.
- `pulse/lib/queue.mjs` and `data/carried/README.md` are absent from the diff.
  Their absence is correct; confirm it rather than assuming it.
- The author's report declares one deliberate no-red mutation arm (the orphan
  guard) and gives a reason. Judge that reason. A declared no-arm is still a
  no-arm, and the standing rule on this change is that a changed line with no
  arm is a finding until the reason for it is demonstrated, not merely stated.
- THE AUTHOR'S OWN BRIEF CARRIED THE WRONG SPEC POINTER — the same one this
  brief's first draft carried, sending its reader to the loop delta for a
  requirement that lives in the review delta. The author therefore worked from
  the task text, which the brief names as the standard, and may never have
  opened the requirement at all. **You are the first reader of this packet who
  is pointed at the actual requirement. Judge the diff against it directly and
  do not assume the author did.**

## What you judge against, in this order

1. THE REQUIREMENT, read from the authority commit, read-only: in the REVIEW
   delta at line 434, the subject, merge and brief bullets of *A reviewer's
   non-blocking finding reaches work without editing anything*. It is in the
   review delta and not the loop delta, which is where this change puts most
   of its requirements and is where the first draft of this brief wrongly sent
   you.

       git -C D:/AddictedtoAI show 3025c58:openspec/changes/two-desks-work-orders-and-trains/specs/review/spec.md

2. THE TASK TEXT — tasks 13, 14 and 15, quoted verbatim below, including their
   bold "Resolved before C1's freeze" paragraphs, which are the architect's
   resolution of every quantifier and ARE the standard.
3. The tree.

Never write anything under `D:/AddictedtoAI` — it is the shared checkout.

THE AUTHOR'S BRIEF IS EVIDENCE, NOT THE STANDARD. If the brief contradicts the
requirement or the task, the brief is the defect: report it against the brief,
and note that an author who did what a wrong brief said did its job. Most of
this change's review rounds were caused by the specification rather than by the
workers, and two packets lost a round to a brief whose file list was the tasks'
files rather than the CLOSURE over the change. **Check the closure yourself.**
For this packet that means: every constructor of a `carry:` entry anywhere in
the tree, every reader of `carryWarnings`, every reader of the parsed `carry`
array, and every place a `data/carried/` file's `subject` is read. Does an
exact pin on any of those live in a file the author's list did not reach? Name
what you searched and how. **The architect's own closure grew twice while
scoping this packet** — first from two files to four when task 14 was read
properly, and again when `run.mjs:678` turned out to count the parser's accepted
list. Assume it can grow again.

RESULT1.md IS A HYPOTHESIS. Every claim in it is unverified until you
verify it.

## The standard (verbatim, `tasks.md` at the authority commit)

Tasks 13, 14 and 15:

> - [ ] 13. `loop/lib/verdict.mjs` and `loop/lib/carry.mjs`: `subject` becomes
>       **required** on a `carry:` entry; an entry without one is refused and
>       reported naming the record. A finding whose subject already carries standing
>       findings merges into that subject's item. **No numeric cap** is added.
>       Implements: *A reviewer's non-blocking finding reaches work without editing
>       anything*, the subject and merge bullets.
>       **Resolved before C1's freeze (the architect's quantifier enumeration,
>       2026-09-09 22:01, from the code at `2c62454`):** (i) REQUIRED means
>       non-empty after `String(...).trim()` — the same test `title` and
>       `detail` already get at `loop/lib/verdict.mjs:79` and `:83`. `:78`'s
>       empty-string default STAYS: it is what makes `!subject` behave
>       identically to `!title` and `!detail`, and "tidying" it to `?? null`
>       changes the refusal's shape silently. (ii) REFUSED means the ENTRY is
>       dropped from the array `parseCarry` returns. The record is not refused,
>       the merge is not refused, no exit code moves. The guard is the THIRD in
>       `parseCarry`'s sequence, after title and after detail — and that order is
>       PINNED, not stylistic: `loop/tests/mock-proposal-executor.mjs:110-116`
>       carries a deliberate entry with neither a title nor a subject, whose
>       comment says it exists so the warning path runs for real, and it must go
>       on reporting "no title". (iii) REPORTED NAMING THE RECORD: the warning
>       itself is a `carryWarnings` string naming `carry[i]` and the title, as
>       the two existing ones do; **the RECORD is named in `loop/lib/carry.mjs`**,
>       which holds `jobId` and `verdictPath` and is the only consumer of
>       `carryWarnings` in the tree (`carry.mjs:85`). `parseCarry` takes no new
>       parameter — it parses front matter and cannot know which file the front
>       matter came from. (iv) THE MERGE IS ALREADY BUILT AND IS NOT THIS TASK'S
>       WORK. `pulse/lib/queue.mjs`'s `carriedFindingItems` (`:424`) already
>       groups on each file's `subject`, falling back to that file's own path
>       under `data/carried/` when it has none — so findings sharing a subject
>       are ONE item today and subject-less ones can never group, because their
>       key is unique by construction. `pulse/tests/carry-queue.test.mjs:189`,
>       `:229`, `:243`, `:259` and `:302`
>       already test it. NO SECOND GROUPING is written; NO MERGE AT
>       TRANSCRIPTION TIME, because one file per finding IS the retirement
>       mechanism (`loop/lib/carry.mjs:29-42`: "the fixing job's own diff deletes
>       the file it was dispatched against"). (v) THE READ-SIDE FALLBACK STAYS.
>       `pulse/lib/queue.mjs` is not in this packet's files. A file under
>       `data/carried/` with no `subject` may be hand-written or may predate this
>       change, and `carry-queue.test.mjs:73` and `:243` pin that it still
>       produces a dispatchable item and still never groups. Removing the
>       fallback's REASON TO EXIST is not permission to remove the fallback.
>       (vi) NO NUMERIC CAP bounds either the number of entries in one `carry:`
>       block or the number of files sharing one subject. Measured at this
>       commit: no bound of any kind exists in either file — the only `.length`
>       comparison in the two is `verdict.mjs:250`'s front-matter presence test.
>       (vii) TWO GUARDS DIE WITH THIS CHANGE AND ARE REMOVED HERE:
>       `carry.mjs:98`'s `entry.subject &&` (today a MISSING subject skips the
>       orphan check entirely, which is the hole this task closes) and `:114`'s
>       conditional `subject:` spread. Both become unreachable when (i)-(ii) land,
>       because `transcribeCarriedFindings` calls `parseVerdict` itself at
>       `carry.mjs:84` — every caller, production or direct-from-a-test, goes
>       through the parser. Dead defensive code around an invariant is
>       indistinguishable from doubt about the invariant. (viii) STATED, NOT
>       FIXED: `loop/run.mjs:678` counts `gate.verdict.carry.length` into
>       `reviewPhase.carried`, which is the parser's ACCEPTED list, so that
>       ledger figure changes meaning from "findings the reviewer wrote" to
>       "findings accepted" without a line in `run.mjs` changing. `run.mjs` is
>       outside this packet's files; the author records it in `RESULT<N>.md` and
>       the architect files it at handover.
> - [ ] 14. `loop/lib/review.mjs`: the reviewer's brief documents both fields and the
>       required subject. Implements the same requirement's brief bullet.
>       **Resolved before C1's freeze (the architect's quantifier enumeration,
>       2026-09-09 22:01, from the code at `2c62454`):** (i) "both fields" are
>       `title` and `detail`; the required `subject` is the third thing the brief
>       must document. (ii) THERE ARE THREE SITES IN `loop/lib/review.mjs` AND
>       ALL THREE ARE REQUIRED — line numbers at the authority commit:
>       `:685-686`, the prose sentence "`subject` is optional: the one content
>       file the finding concerns, when there is one"; `:693-694`, the worked
>       example's `subject: <optional — the content file this concerns, …>`; and
>       **`:734-736`, the front-matter SKELETON**, which today lists only
>       `title` and `detail` and does not mention `subject` at all. THE SKELETON
>       IS WHAT A REVIEWER PASTES. Change the prose and leave the skeleton and
>       the documentation is correct while the template people actually use
>       produces entries this change refuses — and every test stays green,
>       because no test copies a skeleton. (iii) A SECOND ERROR RIDES IN THE SAME
>       SENTENCE and is fixed with it: "the one CONTENT file" is narrower than
>       the mechanism. `carry.mjs:98`'s `subjectMustExist` tests
>       `existsSync(join(repoRoot, entry.subject))` — any tracked path, not a
>       content file. The replacement names the path the finding is about and
>       does not say "content". (iv) `loop/lib/verdict.mjs:58-59`'s JSDoc states
>       the same optionality and is corrected too; it is already in this
>       packet's files. (v) OUT OF SCOPE: `data/carried/README.md:9` carries
>       BOTH errors and is A2AI-Orch's at handover. Do not edit it. (vi) One
>       existing test pins this text — `loop/tests/carry.test.mjs:266-278`
>       asserts the reviewer brief documents `carry:` and matches on `/carry:/`,
>       so it stays green; an assertion on the new required wording belongs in
>       that test and nowhere else.
> - [ ] 15. `loop/tests/carry.test.mjs`: a subject-less entry is refused; a second
>       finding on a carried subject produces no second item; five entries in one
>       record are all accepted. **Mutation A**: make `subject` optional again and
>       confirm the refusal test fails. **Mutation B**: reinstate a cap of two and
>       confirm the five-entry test fails — the absence of a cap is a decision under
>       test, not an omission. Tests tasks 13–14.
>       **Resolved before C1's freeze (the architect's quantifier enumeration,
>       2026-09-09 22:01, from the code at `2c62454`):** (i) THE BLAST RADIUS IS
>       MEASURED, NOT ESTIMATED, so it is not discovered mid-implementation. The
>       architect applied the guard alone as a probe in a worktree and ran
>       `loop/tests/carry.test.mjs`, `loop/tests/corrections.test.mjs`,
>       `loop/tests/discarded-proposal-retry.test.mjs` and
>       `pulse/tests/carry-queue.test.mjs`: baseline **57 pass, 0 fail, exit 0**;
>       with the guard **50 pass, 7 fail, exit 1**; probe reverted, tree clean.
>       **SEVEN test cases go red, every one in `loop/tests/carry.test.mjs`:**
>       `parseCarry: a well-formed entry is read whole, with subject optional`;
>       `parseCarry: a single mapping (not a list) is accepted the same way a
>       list of one would be`; `parseCarry: one bad entry among good ones is
>       skipped without discarding the rest`; `parseVerdict carries carry: and
>       carryWarnings alongside the existing fields, unchanged`; `two carry
>       entries become two files, each named for the job and numbered, with real
>       titles`; `a malformed entry inside an otherwise-valid carry: list is
>       skipped and reported, the rest still transcribe`; and `transcribing twice
>       does not overwrite an existing file — a retry does not clobber a finding
>       already written`. (ii) TWO OF THE SEVEN ARE NOT WHAT THEY LOOK LIKE. The
>       first has the reversed property IN ITS NAME, so it is REWRITTEN, not
>       repaired — repairing it leaves a test whose name asserts the opposite of
>       the code. The last fails with an `ENOENT` rather than an assertion,
>       because it writes a file the first transcription was supposed to create;
>       that reads as a broken test, and the natural wrong response is to fix the
>       path. (iii) FILES THAT NEED NOTHING, with the counts that disarm a grep
>       for `subject:`, each cleared by RUNNING under the probe and not by
>       inspection: `loop/tests/review-blog-bar.test.mjs` (0 carry blocks, 30
>       unrelated `subject:` lines); `loop/tests/review.test.mjs` (0 and 9);
>       `scripts/verify-launch-voice-carry.test.mjs` (7 `carry:` hits and 29
>       `subject:` lines, ALL of them the `reads-human-from` carry-FORWARD's
>       `{subject, record, why}` — a different feature that shares two words);
>       `loop/tests/corrections.test.mjs` (its single `carry:` match is a comment
>       at `:99`); `loop/tests/discarded-proposal-retry.test.mjs` (three
>       fixtures, all three already carrying a subject);
>       `pulse/tests/carry-queue.test.mjs`; `loop/tests/mock-executor.mjs` and
>       `loop/tests/mock-proposal-executor.mjs` (both already carrying subjects).
>       **Textual counting of these fixtures is unreliable in BOTH directions** —
>       they are JavaScript object literals and YAML inside JS string literals,
>       not YAML blocks — so a line grep reads 32 where the answer is 7 and a
>       structural YAML walker reads 0. Neither number is evidence; the probe is.
>       (iv) "a second finding on a carried subject produces no second item" IS
>       ALREADY TESTED, at `pulse/tests/carry-queue.test.mjs:189` ("several
>       findings on ONE subject become ONE job, not one job each"), with `:229`,
>       `:243`, `:259` and `:302` covering the rest of the grouping. That arm is
>       CITED AND RUN, not rewritten inside `carry.test.mjs`: transcription
>       writes one file per finding whatever the subject is, so the same
>       assertion in the loop's test would pass vacuously and test nothing.
>       (v) "five entries in one record are all accepted" asserts FIVE
>       TRANSCRIBED FILES, so it goes red end-to-end under a cap wherever the cap
>       is placed. (vi) MUTATION A is the guard deleted — `!subject` removed from
>       `parseCarry` — and the new refusal arm must go red. (vii) MUTATION B SAYS
>       "REINSTATE" AND THERE IS NOTHING TO REINSTATE: measured at this commit,
>       no bound of any kind exists in `verdict.mjs` or `carry.mjs`, the only
>       `.length` comparison in the two being `verdict.mjs:250`'s front-matter
>       presence test. The mutation is INTRODUCE a cap of two, sited in
>       `parseCarry`'s loop, and the five-entry arm must go red. A mutation that
>       reinstates a bound no version of the file ever had cannot go red for the
>       reason the task states.

## Files

The author was permitted exactly these; a diff touching any other path is a
scope finding. Judge each against the reason it was in scope.

- `loop/lib/verdict.mjs` — `parseCarry`'s third guard and the JSDoc that said `subject` was optional (task 13)
- `loop/lib/carry.mjs` — the record named on each carry warning, and the removal of the two guards that die with the change (task 13)
- `loop/lib/review.mjs` — the reviewer brief's three sites: prose, worked example, front-matter skeleton (task 14)
- `loop/tests/carry.test.mjs` — task 15's arms and the seven pre-existing cases the change turns red
- `RESULT1.md` — (new) the author's report, uncommitted, in the worktree root
- `.agent-brief.md` — (new) the author's brief, uncommitted, in the worktree root

`pulse/lib/queue.mjs`, `data/carried/README.md` and everything else under
`data/` are RESERVED: the README's line 9 is the orchestrator's and lands at
the handover, not in this branch. A diff touching either is a scope finding;
their ABSENCE from the diff is correct.

## What to check

1. **DOES IT DO WHAT THE REQUIREMENT SAYS?** Ask of every guard, assertion and
   fixture: WHAT WRONG WORLD WOULD THIS STILL PASS ON? Construct it. In
   particular:
   - the guard refuses an entry whose `subject` is absent, `null`, empty, or
     whitespace only — check all four, and check that it refuses the ENTRY and
     not the record, the merge, or the exit code;
   - the guard is THIRD, after title and after detail. An entry with neither a
     title nor a subject must still report "no title". `loop/tests/mock-proposal-executor.mjs`
     carries exactly such an entry deliberately; find it and say what warning it
     now produces;
   - the warning NAMES THE RECORD. Which record, named how, and is the name
     derivable by a reader who has only the log line? A warning that names
     `carry[i]` and a title but not the record does not satisfy task 13(iii);
   - `verdict.mjs`'s empty-string default is still there, so `!subject`
     behaves exactly as `!title` and `!detail` do. If the author changed the
     parse instead of adding a guard, say so and say what it costs.
2. **THE MERGE MUST NOT HAVE BEEN REBUILT.** Task 13's merge already ships at
   queue-derivation time. A second grouping written anywhere in this diff is a
   blocking finding even if it passes its own tests, and passing its own tests
   is exactly what it would do. Read `pulse/lib/queue.mjs`'s
   `carriedFindingItems` and confirm the diff adds nothing beside it.
3. **THE READ-SIDE FALLBACK MUST STILL BE THERE.** A file under `data/carried/`
   with no `subject` still becomes a dispatchable item keyed on its own path,
   and subject-less findings still never group. Run
   `pulse/tests/carry-queue.test.mjs` whole and quote the counts. If the author
   removed the fallback because "the reason to exist" was gone, that is the
   blocking finding this packet was most likely to produce.
4. **TASK 14 IS THREE SITES, NOT ONE.** The prose, the worked example, and the
   FRONT-MATTER SKELETON a reviewer pastes. Read the assembled reviewer brief
   as a reviewer would receive it — not the source lines — and answer one
   question: **if I copied the skeleton verbatim and filled it in, would my
   entry be accepted?** If the answer is no, the packet has shipped
   documentation that contradicts the code it documents, and every test can
   still be green, because no test copies a skeleton.
5. **AND THE SAME SENTENCE'S SECOND ERROR:** the brief text must no longer call
   the subject "the one content file". `subjectMustExist` tests `existsSync`
   against any tracked path. If the author fixed the optionality and left the
   narrowing, say so.
6. **THE DIFF FROM THE MERGE BASE IS THE LIST OF CHANGED BEHAVIOURAL LINES —
   AND YOU CANNOT MUTATE, SO DO THE HARDER HALF INSTEAD.** You have no edit
   rights, so you may not change one character of the tree to see what breaks.
   Do not simulate it, do not describe a mutation you did not run, and do not
   report an arm count you did not measure. What you do instead:
   - enumerate EVERY changed behavioural line in the merge-base diff, by hand,
     from `git diff`;
   - for each, name the specific test that would fail if that line were
     reverted, and QUOTE the assertion that would catch it. Not "carry.test.mjs
     covers this" — the assertion, by line;
   - run those tests unmodified and quote their counts, which proves they pass
     today but not that they would fail on the reversal, and say so;
   - **a changed line you cannot tie to a quoted assertion is your finding**,
     and say plainly that you could not mutate it. The other reviewer can, and
     your naming it is what sends it there.
   Then judge the author's mutation table the same way: for each row, does the
   arm it names actually contain an assertion that the named mutation would
   break? A table row whose red you cannot explain from the test's own text is
   a row you should refuse to accept, even though it reports a red.
7. **THE SEVEN.** The architect measured, by applying the guard alone as a
   probe and running the suite, that exactly seven cases in
   `loop/tests/carry.test.mjs` go red, and named them in task 15(i). Check the
   author's account of each. Two are traps: the case whose NAME asserts the
   reversed property must have been REWRITTEN rather than given a subject, and
   the case that fails with `ENOENT` rather than an assertion must not have
   been "fixed" by changing a path. **If your own count differs from seven, that
   is a finding about the architect's measurement and it outranks everything
   else in your report.**
8. **THE COUNTING TRAP, so you do not repeat it.** These fixtures are
   JavaScript object literals and YAML inside JS STRING literals, not YAML
   blocks. A line grep for `carry:` reads 32 in that file where the answer is
   7; a structural YAML walker reads 0. **Do not settle any count in this
   review by grepping.** Run something.
9. **THE PROPERTIES** — find what enforces each and run it: the machinery names
   no model, provider, harness or runner id outside `runners.yml`; no source
   references an unarchived change directory; the merge gate is unaffected in
   both directions by a `carry:` block; the orphan check still refuses a
   non-existent subject and still only on a discard.
10. **THE FULL SUITE:** one completed author iteration on the final tip, counts
    quoted, 0 failed; a cut-off, a red, or an earlier commit's counts is a
    finding. Do not run it yourself.
11. WHEN YOU PARSE TEST OUTPUT, ASSERT THE TEST COUNT (`--test-reporter=tap`).

## Hard limits

- NEVER run `npm run build`, NEVER the full `npm test`, never any `verify-*`
  script as a whole (importing a function from one in a test is fine), the
  Pulse or the Desk against the real repository. Targeted
  `node --test <absolute path>` only.
- Never write into `D:/AddictedtoAI/data/carried/` or any other `data/` path.
  Exercise the transcriber on a throwaway context under the OS temp directory
  instead — `makeRepo` in `loop/tests/helpers.mjs` is how the tests do it.
- Never use the token `cd` anywhere in a command, including in a comment and
  including as a shell function name — a guard blocks the string. Absolute
  paths and `git -C <dir>`.
- A blocked or refused command is REPORTED, not routed around.
- NEVER `git worktree remove`, and never delete a `node_modules`: a forced
  removal follows the junction and, on this machine, deleted 177 packages in a
  single attempt. Probes use throwaway repositories under the OS temp directory.
- Keep commands short; write a `.mjs` under `<worktree>/.job/` and run it
  rather than `node -e`. Delete any probe file you create and say so.
- **Do not truncate the output of anything you are using as evidence.** No
  `| head`, no `| tail`, no `-First N` on a counting or enumerating command.
  Truncated output is indistinguishable from complete output, and three
  separate defects tonight came from exactly that — including one where a
  cwd-printing guard was piped through `tail -5` and the cwd line was the part
  that got cut.
- Every date you write is this machine's LOCAL date, read from
  `node -p "new Date().toLocaleString('sv-SE')"`.
- DO NOT RUN `bd close`, and do not run `bd update` on any bead.
- No `git push`, `git merge`, `git commit`, or `gh`.

## Output — YOUR FINAL MESSAGE IS THE REVIEW

You have no edit rights to any file, so there is nothing for you to write and
nothing to save. Your final message is the whole product; it will be filed as
`REVIEW1-muse.md`, that exact numbered name and never a bare
un-numbered one. Emit the report and nothing else — no plan, no offer to
proceed, no request to be switched to another mode. Begin it with the verdict
line below.

    # Stage 0 packet C1 — round 1 — VERDICT: approve | revise

    ## Sealing
    ## Findings
    (if revise: NUMBERED must-fix items, each with file and line, what is
     wrong, which requirement or task clause it violates, what would make it
     right, and its CLASS)
    ## The seven, judged one by one
    ## The skeleton test — would a pasted skeleton be accepted?
    ## The mutations I ran
    ## The mutation table, judged
    ## What I checked that was sound
    ## Was the brief faithful to the tasks and the requirement? (and the closure)
    ## What I ran

Be adversarial about correctness and fair about scope. Approve work that is
right even where you would have written it differently; refuse work whose
correctness you cannot demonstrate. **And state plainly what you did NOT
check** — a review that names its own boundary is worth more than one that
does not, and on this packet's brief review that disclaimer was the finding.
