# BRIEF REVIEW — arch-c1-review-r1.md — VERDICT: REVISE

## Findings

1. The brief points its reviewer at the wrong delta file for THE REQUIREMENT, so a worker following the brief verbatim opens a file that does not contain the requirement.
   - The brief's sentence (What you judge against, item 1): "THE REQUIREMENT, read from the authority commit, read-only: in the loop delta, the subject, merge and brief bullets of *A reviewer's non-blocking finding reaches work without editing anything*. `git -C D:/AddictedtoAI show 3025c58:openspec/changes/two-desks-work-orders-and-trains/specs/loop/spec.md`"
   - Defect: the requirement does not live in `specs/loop/spec.md`. The loop delta at `3025c58` contains no such requirement; the requirement lives in `specs/review/spec.md`.
   - EVIDENCE — command run and what it printed:
     - `git -C D:/AddictedtoAI show 3025c58:openspec/changes/two-desks-work-orders-and-trains/specs/loop/spec.md | Select-String -Pattern "Requirement:" | Select-Object LineNumber, Line` printed 17 `### Requirement:` lines (One job is one work order…, Work comes from one intake…, …, Spending is budgeted…, Jobs have identities…, etc.) — none titled "A reviewer's non-blocking finding reaches work without editing anything". `Select-String -Pattern "without editing"` and `-Pattern "non-blocking"` against the same blob printed no output.
     - `git -C D:/AddictedtoAI ls-tree -r --name-only 3025c58 -- openspec/changes/two-desks-work-orders-and-trains/specs/` printed `specs/loop/spec.md`, `specs/pulse/spec.md`, `specs/review/spec.md`.
     - `git -C D:/AddictedtoAI show 3025c58:openspec/changes/two-desks-work-orders-and-trains/specs/review/spec.md | Select-String -Pattern "Requirement:" | Select-Object LineNumber, Line` printed line `434 ### Requirement: A reviewer's non-blocking finding reaches work without editing anything`.
     - `git -C D:/AddictedtoAI show 3025c58:openspec/changes/two-desks-work-orders-and-trains/specs/review/spec.md | Select-Object -Skip 434 | Select-Object -First 80` printed the subject ("A `subject` SHALL be **required**…"), merge ("Where a finding's subject already carries standing findings, it SHALL merge…"), ledger/cap, verdict-independence, and brief ("The reviewer's brief SHALL document both fields and the required subject…") bullets plus the "A finding with no subject is refused" scenario — i.e. exactly the subject/merge/brief bullets the brief means.
   - Smallest change to the brief that makes it right: in item 1 replace "in the loop delta" with "in the review delta" and replace the path `specs/loop/spec.md` with `specs/review/spec.md` (both the prose and the `git show` command).
   - Class: wrong-file citation for the standard; the reviewer would follow the given command, fail to find the requirement, and judge against the wrong text. REVISE on this alone.

2. Not checked (no guess): full verbatim character comparison of every `>` block beyond the spot reads of tasks 13/14/15(i)–(vii) (check 1 remainder); exhaustive `Object.keys(`/`deepEqual`/snapshot/LEDGER_FIELDS closure sweep for exact pins (check 2 remainder); every cited `file:line` beyond the sampled ones (check 4 remainder); instruments behaving as claimed beyond existence-by-grep (check 6 behaviour); green-staying mutation candidate (check 7 remainder). Listed here as not checked per the budget rule, not as findings.

## Checked and sound

- Check 1 (partial): the quoted standard for tasks 13, 14 and 15(i)–(vii) matches the committed blob on spot reads — command `git -C D:/AddictedtoAI show 3025c58:openspec/changes/two-desks-work-orders-and-trains/tasks.md | Select-String -Pattern "^\s*-\s*\[\s*\]\s*13\." -Context 0,80` and `Select-Object -Skip 918 | Select-Object -First 120` reproduce the brief's task 13 (i)–(viii), task 14 (i)–(iv) and task 15 (i)–(vii) wording, including the bold "Resolved before C1's freeze" paragraphs; no dropped paragraph found in the sampled ranges.
- Check 2 (partial): closure spot sweep is consistent with the brief's Files list — `git -C D:/addictedtoai-worktrees/fleet6-stage0-C1 grep -n "carryWarnings" -- .` shows the only production consumer is `loop/lib/carry.mjs:85` with the producer in `loop/lib/verdict.mjs` and pins otherwise only in `loop/tests/carry.test.mjs` (both in the Files list); `grep -n "parseCarry"` shows definition/use only in `loop/lib/verdict.mjs` plus `loop/tests/carry.test.mjs`; `grep -n "carriedFindingItems"` shows definition in `pulse/lib/queue.mjs:424` with test pins in `pulse/tests/carry-queue.test.mjs` — both correctly RESERVED/out-of-edit-scope per the brief, with the brief explicitly instructing read-only read/run rather than edit. No changed-behaviour pin outside the four permitted files surfaced in these three sweeps.
- Check 4 (partial): sampled citations hold — `git -C D:/AddictedtoAI show 3025c58:loop/lib/review.mjs | Select-Object -Skip 680 | Select-Object -First 60` shows the `:685-686` prose ("`subject` is optional: the one content file…"), the `:693-694` worked-example `subject:` line, and the skeleton with only `title`/`detail` and no `subject`; `show 3025c58:loop/lib/verdict.mjs | Select-Object -Skip 55 | Select-Object -First 40` shows the JSDoc optionality and the `title`/`detail` guard shape the brief describes; `show 3025c58:loop/tests/mock-proposal-executor.mjs | Select-Object -Skip 100 | Select-Object -First 25` shows the deliberate entry with a `detail` but neither `title` nor `subject` and the comment saying it exists so the warning path runs for real.
- Check 5 (no contradiction found in scope checked): Files reasons match file contents sampled (verdict holds `parseCarry`, carry holds the consumer/record, review holds the three brief sites, carry.test holds the parser/transcription arms); "no edits to tracked files, targeted `node --test` only, blocked calls reported" is stated consistently in Hard limits and What-to-check 6.
- Check 9 (report contract): brief names the numbered `REVIEW1.md` ("This exact numbered name, never the bare un-numbered one"), lists its sections, and instructs blocked-call reporting ("A blocked or refused command is REPORTED, not routed around").
- Check 10 (ground rules): brief states no-`cd` (never uses the token itself except to forbid it), absolute paths, no build/no full suite/no verify-scripts-as-a-whole, targeted `node --test <absolute path>` only, no writes under `data/`, no worktree removal, no push/merge/commit, SHA-256 restore discipline, and local-date sourcing.

## What I ran

- `git -C D:/AddictedtoAI log --oneline -1 3025c58` (plus a `Measure-Object -Line` line count of the tasks blob)
- `git -C D:/AddictedtoAI show 3025c58:openspec/changes/two-desks-work-orders-and-trains/tasks.md | Select-String -Pattern "^\s*-\s*\[\s*\]\s*13\." -Context 0,80`
- `git -C D:/AddictedtoAI show 3025c58:openspec/changes/two-desks-work-orders-and-trains/tasks.md | Select-String -Pattern "OUT OF SCOPE" -Context 4,30`
- `git -C D:/AddictedtoAI show 3025c58:openspec/changes/two-desks-work-orders-and-trains/tasks.md | Select-String -Pattern "15\. .loop.tests.carry" | Select-Object LineNumber, Line`
- `git -C D:/AddictedtoAI show 3025c58:openspec/changes/two-desks-work-orders-and-trains/tasks.md | Select-Object -Skip 918 | Select-Object -First 120`
- `git -C D:/AddictedtoAI show 3025c58:openspec/changes/two-desks-work-orders-and-trains/specs/loop/spec.md | Select-Object -First 80`
- `git -C D:/AddictedtoAI show 3025c58:openspec/changes/two-desks-work-orders-and-trains/specs/loop/spec.md | Select-String -Pattern "non-blocking" | Select-Object LineNumber, Line`
- `git -C D:/AddictedtoAI ls-tree -r --name-only 3025c58 -- openspec/changes/two-desks-work-orders-and-trains/specs/loop/`
- `git -C D:/AddictedtoAI show 3025c58:openspec/changes/two-desks-work-orders-and-trains/specs/loop/spec.md | Select-String -Pattern "without editing" | Select-Object LineNumber, Line`
- `git -C D:/AddictedtoAI show 3025c58:openspec/changes/two-desks-work-orders-and-trains/specs/loop/spec.md | Select-String -Pattern "Requirement:" | Select-Object LineNumber, Line`
- `git -C D:/AddictedtoAI ls-tree -r --name-only 3025c58 -- openspec/changes/two-desks-work-orders-and-trains/specs/`
- `git -C D:/AddictedtoAI show 3025c58:openspec/changes/two-desks-work-orders-and-trains/specs/review/spec.md | Select-String -Pattern "Requirement:" | Select-Object LineNumber, Line`
- `git -C D:/AddictedtoAI show 3025c58:openspec/changes/two-desks-work-orders-and-trains/specs/review/spec.md | Select-Object -Skip 434 | Select-Object -First 80`
- `git -C D:/addictedtoai-worktrees/fleet6-stage0-C1 grep -n "carryWarnings" -- . | Select-Object -First 40`
- `git -C D:/addictedtoai-worktrees/fleet6-stage0-C1 grep -n "carriedFindingItems" -- . | Select-Object -First 40`
- `git -C D:/addictedtoai-worktrees/fleet6-stage0-C1 grep -n "parseCarry" -- . | Select-Object -First 40`
- `git -C D:/AddictedtoAI show 3025c58:loop/lib/review.mjs | Select-Object -Skip 680 | Select-Object -First 60`
- `git -C D:/AddictedtoAI show 3025c58:loop/lib/verdict.mjs | Select-Object -Skip 55 | Select-Object -First 40`
- `git -C D:/AddictedtoAI show 3025c58:loop/tests/mock-proposal-executor.mjs | Select-Object -Skip 100 | Select-Object -First 25`

## Out of scope, not pursued

- None beyond the "not checked" items listed as Finding 2; no implementation, rewrite, test run against a modified tree, subagent, or out-of-check exploration was pursued.

