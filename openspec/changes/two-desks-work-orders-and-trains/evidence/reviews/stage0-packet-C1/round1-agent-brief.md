# Packet C1 — tasks 13, 14 and 15 of `two-desks-work-orders-and-trains` (author brief, round 1)

authority: two-desks-work-orders-and-trains@3025c58

You are a codex worker, alone and unattended, in the git worktree
`D:/addictedtoai-worktrees/fleet6-stage0-C1` on branch `stage0/c1-carry-subject`,
checked out at `3025c58`. `node_modules` is a junction to the main checkout —
do not run `npm install`. This brief is everything you have: no prior
conversation, no session to resume. The standard you implement is quoted
verbatim below from `openspec/changes/two-desks-work-orders-and-trains/tasks.md`
at the authority commit; where this brief's prose and the quoted text differ,
the quoted text wins. Its bold "Resolved before C1's freeze" paragraphs are the
architect's resolution of every quantifier in the tasks — **they are the spec,
not commentary**, and they were written against the code at this commit rather
than beside it.

Tasks 16 and 17 are NOT yours. They are packet C2 and are dispatched
separately; `scripts/lint-deferrals.mjs` does not exist and you do not create it.

## Ground rules (non-negotiable)

- Never use the token `cd` anywhere — not in a command, a comment, or a
  script, and not as a shell function name: the approval guard matches the
  token, not the intent. Run everything by absolute path; git is
  `git -C D:/addictedtoai-worktrees/fleet6-stage0-C1 ...`.
- Keep shell commands short; put anything multi-step in a `.mjs` file under
  `D:/addictedtoai-worktrees/fleet6-stage0-C1/.job/` and run that. The same
  goes for `node -e` — write a `.mjs` and run it.
- Do NOT run `npm run build`, any `scripts/verify-*.mjs` as a whole, the
  Pulse, the Desk against the real repository, `git push`, or `bd close`. Do
  not edit `package.json`, `runners.yml`, `data/config.json`, `CLAUDE.md`,
  `AGENTS.md`, anything under `data/` (including `data/carried/README.md`,
  which is the orchestrator's at handover), or any file outside the "## Files"
  list below.
- Never manipulate credentials on a command line and never print a secret,
  including a partial token.
- The machinery names no model, provider, harness or runner id outside
  `runners.yml`, and no source under `lib/`, `loop/`, `pulse/`, `scripts/`,
  `app/` or `tools/` may reference an unarchived change directory. Both have
  enforcement in this tree — find what enforces each, and run it. Test
  fixtures use generic ids (`mock-…`), never a real one.
- Tests build throwaway repositories under the OS temp directory (`makeRepo`
  in `loop/tests/helpers.mjs`) and never touch this worktree's own `.git`,
  `data/`, or the real `D:/AddictedtoAI`.
- If a tool call is blocked or refused, record it in `RESULT1.md` and
  stop that step; do not route around it.
- All dates are the machine's LOCAL date.

## The standard (verbatim, `tasks.md` at the authority commit)

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

The requirement these implement, read-only, at the authority commit — the
subject, merge and brief bullets of *A reviewer's non-blocking finding reaches
work without editing anything*:

    git -C D:/AddictedtoAI show 3025c58:openspec/changes/two-desks-work-orders-and-trains/specs/loop/spec.md

## Files

Work only in these files. Every other path is out of scope; a diff that
touches one is a scope violation at review.

- `loop/lib/verdict.mjs` — `parseCarry`'s third guard (task 13), and the JSDoc
  at `:58-59` that today says `subject` is optional
- `loop/lib/carry.mjs` — the record named on each carry warning (task 13(iii)),
  and the two guards that die with this change: `:98`'s `entry.subject &&` and
  `:114`'s conditional `subject:` spread (task 13(vii))
- `loop/lib/review.mjs` — the reviewer brief's THREE sites (task 14): `:685-686`
  prose, `:693-694` worked example, `:734-736` front-matter skeleton
- `loop/tests/carry.test.mjs` — task 15's arms, and the seven existing cases
  the change turns red
- `RESULT1.md` — (new) your report, in the worktree root; see
  "## How to end"

**READ-ONLY — run these, never edit them.** They are the closure checks, and
the resolution paragraphs explain what each one is protecting:
`pulse/tests/carry-queue.test.mjs` (the queue-side merge, including the arm
task 15(iv) tells you to cite rather than rewrite),
`loop/tests/discarded-proposal-retry.test.mjs`, `loop/tests/corrections.test.mjs`,
`loop/tests/mock-executor.mjs`, `loop/tests/mock-proposal-executor.mjs`
(whose deliberate no-title entry PINS the guard order),
`loop/tests/review.test.mjs`, `loop/tests/review-blog-bar.test.mjs`,
`scripts/verify-launch-voice-carry.test.mjs`, and `pulse/lib/queue.mjs`.

If you believe a file outside the editable list must change, do not change it —
describe the need in `RESULT1.md` with the line and the reason, and
stop there.

## THE FOUR WAYS THIS PACKET GOES WRONG, named in advance

These are not hypotheticals. Each is a specific wrong turn the architect
measured while scoping this packet, and the resolution paragraph that closes
each is quoted above.

1. **BUILDING A SECOND MERGE.** The merge task 13 describes ALREADY SHIPS, at
   queue-derivation time in `pulse/lib/queue.mjs`'s `carriedFindingItems`, and
   is tested at `pulse/tests/carry-queue.test.mjs:189`, `:229`, `:243`, `:259`
   and `:302`. A second grouping written beside it would pass its own tests and
   be wrong. **Read `carriedFindingItems` and run `carry-queue.test.mjs` BEFORE
   you write anything**, and record in your report that you did.
2. **DELETING THE READ-SIDE FALLBACK.** `queue.mjs` keys a subject-less file on
   its own path. That fallback STAYS: a file under `data/carried/` may be
   hand-written or may predate this change. `queue.mjs` is not in your files.
3. **FIXING THE PROSE AND LEAVING THE SKELETON.** `review.mjs:734-736` is the
   front-matter block a reviewer PASTES, and it does not mention `subject` at
   all. Change `:685-686` alone and the documentation is correct while the
   template people use produces entries this packet refuses — with every test
   still green, because no test copies a skeleton.
4. **REPAIRING A TEST WHOSE NAME IS THE DEFECT.** One of the seven reds is
   `parseCarry: a well-formed entry is read whole, with subject optional`. Its
   NAME asserts the property this packet reverses. Give it a subject and you
   have a green test whose name says the opposite of the code.

## Properties (find what enforces each, and run it)

- **The queue-side merge still holds and is untouched** —
  `pulse/tests/carry-queue.test.mjs`, whole file, run twice: once as an
  iteration before you start, and once as an iteration at the end. Report both
  counts.
- **A subject-less file already on disk still becomes a dispatchable item** —
  the same file's `:73` and `:243`. These must stay green; if either goes red
  you have edited the read side.
- **The orphan check still refuses a subject that does not exist, and only on
  a discard** — `loop/tests/discarded-proposal-retry.test.mjs`, unedited, after
  you remove `carry.mjs:98`'s `entry.subject &&`.
- **The merge gate is unaffected in both directions by a `carry:` block** —
  the arms in `loop/tests/carry.test.mjs` around `:141`; `carry:` is purely
  additive and only `would-cite` / `reads-human` / `reviewed:` refuse.
- **The machinery names no model, provider, harness or runner id outside
  `runners.yml`, and no source references an unarchived change directory** —
  a test under `loop/tests/` enforces the first and a test under `scripts/`
  the second — find both and run both.

## Mutations (perform, observe red, restore; table in RESULT1.md)

The review takes the diff from the merge base as the list of changed
behavioural lines and expects at least one mutation per changed function, each
with its red run and its restored green run recorded. A changed line with no
arm is a finding.

THE QUOTED TASK TEXT IS THE ONLY LIST OF EXPECTED REDS. This section names the
mutations so none is forgotten; where this index and a "Resolved before C1's
freeze" paragraph could be read differently, the paragraph wins — it is the one
that was measured against the code.

- **Mutation A (task 15):** make `subject` optional again — delete the
  `!subject` guard from `parseCarry`. The new refusal arm must go red.
- **Mutation B (task 15), and read 15(vii) before performing it:** the task
  says "reinstate a cap of two". **There is nothing to reinstate** — no bound
  of any kind exists in `verdict.mjs` or `carry.mjs` at this commit. So
  INTRODUCE a cap of two in `parseCarry`'s loop, and the five-entry arm must go
  red. Report the discrepancy in §7 rather than silently reinterpreting it.
- **The record-naming (task 13(iii)):** drop the record's name from the warning
  in `carry.mjs` and confirm the arm asserting it goes red.
- **The dead guards (task 13(vii)):** restore `carry.mjs:98`'s `entry.subject
  &&` and confirm NOTHING goes red — that is the point, and a mutation with no
  red is a row in the table with "no arm" in its result, not a row omitted.
  Then say in §7 what an arm for it would have to assert, or why none can exist.
- **The skeleton (task 14):** revert `review.mjs:734-736` to its pre-packet
  wording and confirm whichever arm you added for it goes red. If none does,
  that is a finding about your own tests, and it belongs in §7.

For each row: the mutation in one line, the file and line, the command, the
red output's last lines verbatim (the `# pass` / `# fail` counts with the
`# tests` count), the restored output's counts and the restored file's SHA-256.

## How to work

1. Read, in this order and before editing anything: `loop/lib/verdict.mjs:40-95`
   (the `parseCarry` doc comment and the whole function) and `:180-215` (the
   sibling `readsHumanFrom` refusal, whose shape yours copies);
   `loop/lib/carry.mjs` whole; `loop/lib/review.mjs:672-745`;
   `pulse/lib/queue.mjs`'s `carriedFindingItems` around `:424` and its call site
   at `:868`, with the comment above it at `:855-867`; `loop/tests/carry.test.mjs` whole;
   `pulse/tests/carry-queue.test.mjs` whole; `loop/tests/helpers.mjs`
   (`makeRepo`, `writeRecord`). Line numbers are at the authority commit.
2. Run the targeted tests BEFORE you change anything and record the counts —
   this is your baseline and the review compares against it:
   `node --test loop/tests/carry.test.mjs loop/tests/corrections.test.mjs loop/tests/discarded-proposal-retry.test.mjs pulse/tests/carry-queue.test.mjs`
   from the worktree root by absolute path. The architect measured
   **57 pass, 0 fail, exit 0** at this commit; if your baseline differs, stop
   and report it before implementing.
3. Implement task 13 (the guard, then the record's name on the warning, then
   the two dead guards), then task 14 (all three sites), then task 15's arms,
   running the targeted tests as many iterations as you need.
4. Run the enforcement for every property in "## Properties".
5. Perform the mutations and fill the table.
6. Commit ONLY the files named above (`git add` each by path; never
   `git add -A`). Do not add `RESULT1.md` or `.agent-brief.md`.
7. LAST, on the committed tip, ONE final iteration of the full suite:
   `npm --prefix D:/addictedtoai-worktrees/fleet6-stage0-C1 test`
   with a timeout of at least 600 seconds. A completed suite is required for
   merge; if the harness cut it off at a cap, that iteration was not an attempt
   that counts — run it again. Record its `# pass` / `# fail` counts and wall
   time.
8. Write `RESULT1.md`.

## How to end (required)

Write `D:/addictedtoai-worktrees/fleet6-stage0-C1/RESULT1.md` — this
exact name, numbered, never the bare un-numbered name — with these sections, in
this order:

1. **Commits** — each sha and its one-line message; the output of
   `git -C D:/addictedtoai-worktrees/fleet6-stage0-C1 log --oneline main..HEAD`.
2. **What changed, per file** — for each file, what it now does that it did
   not. For `verdict.mjs`, the guard's exact warning string. For `carry.mjs`,
   how the record is named and what the warning now reads end to end. For
   `review.mjs`, all three sites quoted before and after. For
   `carry.test.mjs`, which of the seven pre-existing cases you rewrote versus
   repaired, and why for each.
3. **Tests run** — every command and the last lines of its output verbatim
   (`# tests N`, `# pass N`, `# fail N`): the baseline from step 2, every
   property's enforcement before and after, and the final full-suite iteration
   with its wall time.
4. **Mutation table** — one row per mutation as described above, including the
   dead-guard row that produces no red.
5. **The seven** — the seven cases the architect measured as going red, each
   with what you did to it. If any of them did NOT go red for you, say so
   plainly: that is a disagreement with the architect's measurement and it is
   more valuable than a clean report.
6. **Blocked or refused calls** — each one, verbatim, or "none".
7. **Where you disagreed with a ruling, and findings not fixed** — every place
   this brief or a resolution paragraph told you something the code
   contradicted, with the file and line and what you did instead; and anything
   you saw that these files could not fix, with numbers. Or "none". **This
   section has caught a wrong architect ruling in two of the last three rounds**
   — it is not a formality, and an empty §7 on a packet this size will be read
   as a section you skipped.
