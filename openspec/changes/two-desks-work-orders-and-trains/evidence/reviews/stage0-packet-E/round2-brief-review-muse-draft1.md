# BRIEF REVIEW — arch-e-brief-r2-draft1.md — VERDICT: REVISE

## Findings

1. Wrong code citation — Finding 2 parenthetical names the wrong lines for the brief write.
   - Brief: "That text is committed verbatim as `.job/brief.md` on the job branch (`run.mjs:1326-1327` writes `briefText` and adds it)"
   - Defect: at `db10eac` `:1326-1327` is a log string about phases, not the write. The write is `:1359-1360`.
   - EVIDENCE — command: `git -C D:/addictedtoai-worktrees/fleet6-stage0-E show db10eac:loop/run.mjs | ForEach-Object -Begin {$n=0} -Process {$n++; if (($n -ge 1324 -and $n -le 1329) -or ($n -ge 1357 -and $n -le 1362)) { Write-Output ("{0}: {1}" -f $n, $_) } }` printed:
     `1326: '{role, runner, mm, killed, code, outcome} per invocation...'`
     `1359: writeFileSync(join(worktree, '.job', 'brief.md'), briefText, 'utf8');`
     `1360: gitTry(worktree, ['add', '.job/brief.md']);`
     Same at HEAD (`1359-1360` per `grep -n "briefText|\.job/brief" -- loop/run.mjs`).
   - Smallest change: replace ``run.mjs:1326-1327`` with ``run.mjs:1359-1360`` in Finding 2.

2. Files-list closure / contradiction — Finding 3 orders an edit to a file the brief forbids.
   - Brief Finding 3: "if none fits, add ONE mode to `loop/tests/mock-executor.mjs` (`review-approve-carry`, beside `review-approve` at `:262`)"
   - Brief Files: "Work only in these files. Every other path is out of scope." List has `ledger.mjs`, `runners.mjs`, `run.mjs`, `ledger.test.mjs`, `git.mjs`, `review.mjs`, `conformance.mjs`, `worktree-cleanup.test.mjs`, `verify-launch.mjs`, `verify-launch-build-reuse.test.mjs`, `breakers.test.mjs`, `gate-transport-retry.test.mjs`, `RESULT2.md` — no `mock-executor.mjs`. Ground rules: "Do not edit ... any file outside the Files list."
   - Defect: worker that needs the mode must either violate ground rules or stop leaving Finding 3 unfixed.
   - EVIDENCE — command: `git -C D:/addictedtoai-worktrees/fleet6-stage0-E show db10eac:loop/tests/mock-executor.mjs | ForEach-Object -Begin {$n=0} -Process {$n++; if ($n -ge 261 -and $n -le 268) { Write-Output ("M:{0}: {1}" -f $n, $_) } }` printed `M:262: case 'review-approve':` then `M:267: case 'review-approve-blank-cite':` — no `review-approve-carry` at `db10eac`, so the add is required, not optional. `corrections.test.mjs` has only a comment mentioning `carry:` (`:99`), no reviewer mode; `discarded-proposal-retry.test.mjs` writes records directly, not via a reusable reviewer mock.
   - Smallest change: add `loop/tests/mock-executor.mjs — the one `review-approve-carry` mode beside `:262`, only if no reusable pattern fits` to the Files list.

3. Ambiguity — "keeping the zero and the no-record cases" presupposes state absent at `db10eac`.
   - Brief Finding 3: "an assertion that the `review1` phase records `carried: 2`, keeping the zero and the no-record cases."
   - Defect: at `db10eac` there is a `carried: 0` (`review1`) and `carried: undefined` (`author`), but no review-without-record arm. Worker can reasonably read `author/...carried, undefined` as the "no-record case" and omit the genuine `review-nothing → absent` arm Task 25(iv) requires ("absent when there was no record").
   - EVIDENCE — command: `git -C D:/addictedtoai-worktrees/fleet6-stage0-E show db10eac:loop/tests/ledger.test.mjs | ForEach-Object -Begin {$n=0} -Process {$n++; if ($n -ge 90 -and $n -le 110) { Write-Output ("{0}: {1}" -f $n, $_) } }` printed `:97: carried, 0`, `:98: carried, undefined`, `:100: brief_chars > 0`, `:102: authority_sha.length, 40`, then `:105: test('a registry effort is optional...` — no `review-nothing` test.
   - Smallest change: replace with "keep `:97` carried 0 and `:98` author-absent, and add a review-without-verdict arm asserting `Object.hasOwn(review,'carried')==false`."

4. Stale tip premise (not REVISE-driving alone, record for accuracy).
   - Brief: "whose tip is `db10eac` (two commits on top of `9c1d980`)"
   - EVIDENCE — command: `git -C D:/addictedtoai-worktrees/fleet6-stage0-E log --oneline main..HEAD` printed `ce59b3a test: close ledger telemetry coverage`, `db10eac loop: clear result protocol...`, `2808f42 loop: record ledger telemetry...`; `rev-parse HEAD` → `ce59b3a...`. At HEAD `breakers.test.mjs:182-183` and `gate-transport-retry.test.mjs:880` already carry the brief's prescribed fixes.
   - Smallest change: update tip to `ce59b3a` or add "at dispatch; if HEAD moved, the pin fixes may already be present — still perform the revert-to-round-1 red check."

## Checked and sound

- Check 1 verbatim quotes: PASS — `git -C D:/AddictedtoAI show 9c1d980:.../tasks.md | Select-String -Pattern "^- \[ \] (25|26|27|3b)"` found 3b/25/26/27; ranges `400-430`, `990-1010`, `1010-1110` match the `>` blocks including all Resolved (i)-(vii)/(i)-(iv)/(i)-(v) paragraphs.
- Check 2 pins that stay green: PASS except Finding 2 — `git -C D:/addictedtoai-worktrees/fleet6-stage0-E grep -n "LEDGER_FIELDS"` finds only `issues.test.mjs:243` exact pin (stays green, `LEDGER_FIELDS` unchanged per 25(vi)) and `portability.test.mjs:409` (own eight-key line, brief correctly says stays green); `grep -n "Object.keys(line"` finds only `gate-transport-retry:879` + `portability:409`; `grep -n "BUILD_INPUT_EXCLUSIONS"` finds only `verify-launch.mjs:195,292`; `grep -n "varies"` finds only `breakers.test.mjs:176` (+ unrelated prose). Round-1 forms confirmed at `db10eac`: `breakers:176 const varies = new Set(['ts','id','note','mm','phases'])`, `gate-transport:876-878 expected ['phases']`.
- Check 3 quantifiers: PASS — "every phase/every line/other callers" resolved by Resolved enumerations (`run.mjs:261-273`, `:979/:1050` no keys, `review.mjs:1194`, `conformance.mjs:321,370`, `phases author/review1/revision/review2`).
- Check 4 other lines: PASS except Finding 1 — `db10eac:loop/run.mjs:1484-1486` (`brief_chars/gate_seconds/authority_sha`), `:678` (`carried = ...carry.length`), `ledger.test.mjs:97/100/102`, `mock-executor.mjs:262 review-approve`, `git.mjs:116-118` refusing form all hold.
- Check 5 other contradictions: PASS except Finding 2 — no other Files reason names a missing function.
- Check 6 instruments: PASS — brief says "find what enforces each, and run it"; enforcers exist (`pulse/verify-zero-model.mjs`, `loop/tests/portability.test.mjs` per `shell-token-guard.test.mjs:147`, `scripts/shell-token-guard.mjs`).
- Check 7 mutations: PASS — `run.mjs:1486 → 'a'.repeat(40)`, `:1484 → 1`, `:678 → carried:0` each go red against value-equality arms (`authority_sha equals HEAD`, `brief_chars equals committedBrief.length`, `carried==2`); reverting pins to round-1 forms (`varies` 5-set, `['phases']`) goes red on fixed tip.
- Check 9 report contract: PASS — `RESULT2.md` numbered, §§1-7 in order, blocked calls verbatim-or-none, unfixed findings with file/line/reason-or-none.
- Check 10 ground rules: PASS — no-`cd`-token + absolute `git -C`, no build/full-verify/Pulse/Desk/push/`bd close`, no edits outside Files, one final `npm --prefix ... test` (600s), blocked-calls-stop rule, LOCAL dates all present.

## What I ran

- `git -C D:/AddictedtoAI show 9c1d980:openspec/changes/two-desks-work-orders-and-trains/tasks.md | Select-String -Pattern "^- \[ \] (25|26|27|3b)"`
- `git -C D:/AddictedtoAI show 9c1d980:openspec/changes/two-desks-work-orders-and-trains/tasks.md | Select-String -Pattern "Resolved before E" | Select-Object LineNumber, Line`
- `git -C D:/AddictedtoAI show 9c1d980:openspec/changes/two-desks-work-orders-and-trains/tasks.md | ForEach-Object -Begin {$n=0} -Process {$n++; if ($n -ge 1010 -and $n -le 1110) { Write-Output ("{0}: {1}" -f $n, $_) } }`
- `git -C D:/AddictedtoAI show 9c1d980:openspec/changes/two-desks-work-orders-and-trains/tasks.md | ForEach-Object -Begin {$n=0} -Process {$n++; if (($n -ge 990 -and $n -le 1010) -or ($n -ge 420 -and $n -le 470)) { Write-Output ("{0}: {1}" -f $n, $_) } }`
- `git -C D:/AddictedtoAI show 9c1d980:openspec/changes/two-desks-work-orders-and-trains/tasks.md | ForEach-Object -Begin {$n=0} -Process {$n++; if ($n -ge 400 -and $n -le 430) { Write-Output ("{0}: {1}" -f $n, $_) } }`
- `git -C D:/addictedtoai-worktrees/fleet6-stage0-E grep -n "LEDGER_FIELDS" -- loop/tests scripts loop/lib | Write-Output`
- `git -C D:/addictedtoai-worktrees/fleet6-stage0-E grep -n "Object.keys(line" -- loop/tests scripts loop/lib | Write-Output`
- `git -C D:/addictedtoai-worktrees/fleet6-stage0-E grep -n "varies" -- loop/tests | Write-Output`
- `git -C D:/addictedtoai-worktrees/fleet6-stage0-E grep -n "removeWorktree|removeJobWorktree" -- loop/tests scripts loop/lib | Write-Output`
- `git -C D:/addictedtoai-worktrees/fleet6-stage0-E grep -n "BUILD_INPUT_EXCLUSIONS" -- loop/tests scripts loop/lib | Write-Output`
- `git -C D:/addictedtoai-worktrees/fleet6-stage0-E grep -n "deepEqual.*LEDGER|LEDGER.*deepEqual|Object.keys(phase|phases.*deepEqual" -- loop/tests scripts loop/lib | Write-Output`
- `git -C D:/addictedtoai-worktrees/fleet6-stage0-E show HEAD:loop/run.mjs | ForEach-Object -Begin {$n=0} -Process {$n++; if (($n -ge 1482 -and $n -le 1488) -or ($n -ge 1324 -and $n -le 1329) -or ($n -ge 676 -and $n -le 680)) { Write-Output ("{0}: {1}" -f $n, $_) } }`
- `git -C D:/addictedtoai-worktrees/fleet6-stage0-E grep -n "briefText|\.job/brief" -- loop/run.mjs | Write-Output`
- `git -C D:/addictedtoai-worktrees/fleet6-stage0-E show HEAD:loop/run.mjs | ForEach-Object -Begin {$n=0} -Process {$n++; if (($n -ge 261 -and $n -le 273) -or ($n -ge 1365 -and $n -le 1372) -or ($n -ge 1428 -and $n -le 1434) -or ($n -ge 977 -and $n -le 981) -or ($n -ge 1048 -and $n -le 1052)) { Write-Output ("{0}: {1}" -f $n, $_) } }`
- `git -C D:/addictedtoai-worktrees/fleet6-stage0-E log --oneline main..HEAD | Write-Output; Write-Output "---"; git -C D:/addictedtoai-worktrees/fleet6-stage0-E rev-parse HEAD | Write-Output`
- `git -C D:/addictedtoai-worktrees/fleet6-stage0-E show db10eac:loop/tests/ledger.test.mjs | ForEach-Object -Begin {$n=0} -Process {$n++; if ($n -ge 90 -and $n -le 110) { Write-Output ("{0}: {1}" -f $n, $_) } }`
- `git -C D:/addictedtoai-worktrees/fleet6-stage0-E show db10eac:loop/run.mjs | ForEach-Object -Begin {$n=0} -Process {$n++; if (($n -ge 1324 -and $n -le 1329) -or ($n -ge 1357 -and $n -le 1362) -or ($n -ge 1482 -and $n -le 1488)) { Write-Output ("{0}: {1}" -f $n, $_) } }`
- `git -C D:/addictedtoai-worktrees/fleet6-stage0-E show db10eac:loop/tests/breakers.test.mjs | ForEach-Object -Begin {$n=0} -Process {$n++; if ($n -ge 172 -and $n -le 187) { Write-Output ("B:{0}: {1}" -f $n, $_) } }; git -C D:/addictedtoai-worktrees/fleet6-stage0-E show db10eac:loop/tests/gate-transport-retry.test.mjs | ForEach-Object -Begin {$n=0} -Process {$n++; if ($n -ge 872 -and $n -le 883) { Write-Output ("G:{0}: {1}" -f $n, $_) } }`
- `git -C D:/addictedtoai-worktrees/fleet6-stage0-E show db10eac:scripts/verify-launch.mjs | ForEach-Object -Begin {$n=0} -Process {$n++; if ($n -ge 190 -and $n -le 203) { Write-Output ("V:{0}: {1}" -f $n, $_) } }; git -C D:/addictedtoai-worktrees/fleet6-stage0-E show db10eac:loop/tests/mock-executor.mjs | ForEach-Object -Begin {$n=0} -Process {$n++; if ($n -ge 261 -and $n -le 268) { Write-Output ("M:{0}: {1}" -f $n, $_) } }`
- Read ranges (no shell): `ledger.test.mjs:70-115`, `breakers.test.mjs:168-192`, `gate-transport-retry.test.mjs:870-889`, `portability.test.mjs:400-414`, `git.mjs:95-124`, `ledger.test.mjs:110-222`, `mock-executor.mjs:250-289`, `verify-launch.mjs:185-314`, `branch-cleanup.test.mjs:75-104`, `worktree-cleanup.test.mjs:230-339`, `runners.mjs:1-40`, `run.mjs:271-300`, `ledger.test.mjs:1-70`, `corrections.test.mjs:90-109`, `shell-token-guard.test.mjs:140-169`; Grep `carry:` in `loop/tests`; Glob `verify-zero-model*`, `scripts/*guard*`.

## Out of scope, not pursued

- RESULT1/REVIEW1 contents beyond line citations the brief itself quotes.
- Full-suite green/red counts and wall time (no state-changing runs per hard limits).
- Whether `.beads` exclusion text at HEAD vs `db10eac` drift matters beyond the quoted standard.

