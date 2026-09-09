# BRIEF REVIEW — arch-e-brief-r2.md — VERDICT: DISPATCH

Note: this session ran under plan mode (read-only), so the review file at `C:/Users/BadBitch/.local/share/opencode/plans/brief-review-arch-e-brief-r2.md` was not written; the full review is this message.

## Findings

**1. Finding 2's prescribed command to resolve the `.job/brief.md` add-commit will likely return empty — the add is invisible to default path-limited history. (Reasoned from git semantics; NOT executed — no-write session.)**

- Brief sentence: "resolve the commit that ADDED it from the merged ancestry — `git -C <ctx.repoRoot> log -1 --format=%H --diff-filter=A <result.mergedSha> -- .job/brief.md`".
- Defect: the file is added on the job branch (run.mjs:1359-1360, staged and committed there), then **deleted before the merge** (run.mjs:1503-1504 `rm -r .job` + "remove job scaffolding before merge" commit), then the branch is merged `--no-ff` (git.mjs:216). The merge commit's tree has no `.job/brief.md`, and neither parent has it (main never had it; the branch tip is the removal commit). The merge is therefore TREESAME to both parents for that path, and default path-limited history simplification follows only the first (main) parent, whose history never touched the file — so `git log -1 --diff-filter=A <mergedSha> -- .job/brief.md` prints nothing, and `git show ""` then fails. Evidence: the command sequence at run.mjs:1359-1360, 1503-1504, and the merge at run.mjs:1586 via git.mjs:216, plus documented git default-mode history simplification (TREESAME merges collapse to the first parent when following a path). I could not probe this with a throwaway repo because this session forbids all writes.
- Smallest change to the brief: add `--full-history` to that log command. If my reading is wrong, the output is unchanged (the same single add commit is returned); if right, the worker is saved an unmutated-red diagnosis cycle. Note the brief's own preamble already lets a worker diagnose and fix a wrong arm and record it in RESULT2 §7, so even unpatched this stalls but does not derail the round.

**2. Finding 3's evidence sentence misnames `corrections.test.mjs` as a file that "plant[s] carry records for `transcribeCarriedFindings` directly".**

- Evidence: `Select-String` over both files: `discarded-proposal-retry.test.mjs:249,269,284` plant `carry:` records and call `transcribeCarriedFindings(...)` directly at :251/:271/:286; `corrections.test.mjs` contains only a comment at :99 (no `carry:` plant, no direct call). The claim's substance is unaffected — verified independently: `mock-executor.mjs:53-85` `writeVerdict` takes no carry parameter and no mode passes one, and the only carrying reviewer mode is `review-approve-carrying` at `mock-proposal-executor.mjs:269` whose `CARRIED` (109-116) deliberately has one malformed entry — so the brief's prescription (new `review-approve-carry` mode + optional `carry` block in `writeVerdict`) is still what the tree needs.
- Smallest change: drop `corrections.test.mjs` from that sentence.

**3. Ambiguity (check 8), two readings noted — neither blocks dispatch:**

- "an integration fixture whose REVIEWER writes a record carrying a non-empty `carry:` list … and an assertion that the `review1` phase records `carried: 2`, keeping the zero and the no-record cases." A worker could read "keeping the zero case" as editing the existing effort fixture at ledger.test.mjs:72-103 (whose `reviewerCommand` is `review-approve` and which asserts `carried === 0` at :97) — but repurposing it would break :97, which the same sentence forbids; the only consistent reading is a new fixture/test. Worth one explicit phrase ("in a new test beside the effort test") to save a churn cycle.
- Finding 2's fallback: "If what git returns differs from `briefText` … assert against the committed text's true length rather than loosening." Two readings of what to do if they genuinely differ: (a) the assertion target flips to the committed length while production's recorded `brief_chars` stays `briefText.length` (run.mjs:1484), leaving a permanent red needing a production fix; or (b) the worker is only being told not to loosen a length-assertion into `> 0`. Reading (a) is consistent with the brief's unmutated-red diagnosis rule and with `run.mjs` being in the Files list, so a careful worker converges either way; a sentence saying "if the committed text is not byte-identical to `briefText`, report the delta in RESULT2 §7 and fix the write at run.mjs:1359 so the committed text is the text received" would remove the fork.

## Checked and sound

1. **Verbatim quotes** — pre-verified by the quoted-blob linter; spot-read the `tasks.md` regions around the four "Resolved before E's freeze" headings (they sit immediately under their task headings, tasks 25/26/27 and 3b, no gap where a dropped paragraph could hide). Sound.
2. **Files list is the closure** — `git grep` for `Object.keys(`, `LEDGER_FIELDS`, `varies`, `removeWorktree`, `BUILD_INPUT_EXCLUSIONS`, `.beads`, the four new keys across `loop/tests`, `loop/lib`, `scripts`: the only exact-pin sites that this round's change reddens are `breakers.test.mjs:172-178` and `gate-transport-retry.test.mjs:876-880` — both in the Files list. `portability.test.mjs:404-411` builds its own eight-key line from `LEDGER_FIELDS` and stays green (read: `assert.deepEqual(Object.keys(line), [...LEDGER_FIELDS])`); `issues.test.mjs:241-243` pins the `LEDGER_FIELDS` list itself, untouched; `worktree-cleanup.test.mjs` (removal shapes) and `branch-cleanup.test.mjs:86` (comment only) are owned or unaffected; no test pins the `BUILD_INPUT_EXCLUSIONS` set contents. No other exact-shape pin of a ledger line, phase-entry key set, `removeWorktree`/`removeJobWorktree` return, or exclusion set exists outside the Files list.
3. **Quantifiers** — task 25/26's "every phase entry" is resolved with a concrete enumeration (author/review1/revision/review2; `effort` on every phase, `carried` on review phases only — run.mjs:678 writes it only when `gate.verdict` exists); "every line" is resolved to the outcome line with the two abandon-sweep lines excluded by reason. Task 27(iii)'s "other callers" are named (review.mjs:1194, conformance.mjs:321/370) and are already implemented and enforced by source pins at worktree-cleanup.test.mjs:334-341.
4. **Line numbers and code claims** — all brief-prose citations verified on tip `db10eac`: run.mjs:1359-1360 (writes + `git add` of `.job/brief.md`), :1484 `brief_chars: briefText.length`, :1486 `authority_sha: mergeBaseSha`, :1503-1504 (scaffolding removal), :1956-1965 (merged-branch deletion at :1957), :678 (`carried` from `gate.verdict.carry.length`), :1391/2120 (`mergeBaseSha`, `mergedSha` in the returned result); git.mjs:115-126 (`removeWorktree` without `--force`, prune after), :216 (`--no-ff`); ledger.test.mjs:43/97/100/102 and the arm at :72-103 as described, unit-arm `carried: 2` at :26 hand-built (never through a parser); mock-executor.mjs `writeVerdict` :53-85 (no carry parameter), `review-approve` at :262; mock-proposal-executor.mjs `review-approve-carrying` at :269, `CARRIED` at :109-116 (first entry title/detail/subject, second malformed); verdict.mjs:64-90 `parseCarry` (two well-formed entries ⇒ `carried: 2`).
5. **Contradictions** — none of the load-bearing kind; only finding 2 above (a misnamed evidence file, substance intact).
6. **Instruments** — every test file the brief names exists and enforces what it claims; the two standing properties say "find what enforces each, and run it", and enforcers are real and discoverable: `scripts/no-change-dir-refs.test.mjs`, `loop/tests/portability.test.mjs`, `scripts/check-spec-deltas.test.mjs`, `scripts/shell-token-guard.test.mjs`.
7. **Mutations** — all four are realisable at the named lines and red against a correct implementation: `run.mjs:1486 → 'a'.repeat(40)` fails an equality assertion; `:1484 → 1` fails a length-equality assertion; `:678 → carried: 0` fails a `carried === 2` arm (and the existing `carried === 0` and author-phase absence arms pin the other directions); the two pin-revert mutations (round-1 `varies` set, round-1 `['phases']`) go red against the already-measured reds on this tip.
8. **Ambiguity** — finding 3 above; otherwise none that a careful worker could act on wrongly.
9. **Report contract** — `RESULT2.md` named exactly, numbered sections 1-7 listed, blocked calls and unfixed findings sections required.
10. **Ground rules** — all present: `cd` token ban, absolute paths/`git -C`, no build and no full suite except the one final iteration (600 s), no push, no edits outside the Files list, blocked calls reported not routed around.

## What I ran

1. `git -C D:/addictedtoai-worktrees/fleet6-stage0-E log --oneline -4 && git -C ... merge-base HEAD 9c1d980 && git -C ... rev-parse HEAD` — tip `db10eac`, base `9c1d980`.
2. `git -C <wt> grep -n -E "authority_sha|brief_chars|gate_seconds|carried|effort" -- loop/tests loop/lib scripts`
3. `git -C <wt> grep -n -E "Object\.keys\(|LEDGER_FIELDS|varies|removeWorktree|removeJobWorktree" -- loop/tests loop/lib scripts`
4. `git -C <wt> grep -n -E "parseCarry|review-approve|writeVerdict|BUILD_INPUT_EXCLUSIONS|\.beads|makeLedgerLine|readLedger" -- loop/tests loop/lib scripts loop/run.mjs`
5. Read `D:/addictedtoai-worktrees/fleet6-stage0-E/loop/tests/ledger.test.mjs` (168 lines).
6. Range read of run.mjs (655-700, 1350-1380, 1460-1520, 1945-1965) and git.mjs (94-125, 205-225).
7. Range read of mock-executor.mjs (30-100, 255-300), mock-proposal-executor.mjs (100-130, 260-290), verdict.mjs (54-99).
8. Range read of breakers.test.mjs (59-184) and portability.test.mjs (389-414).
9. Range read of gate-transport-retry.test.mjs (819-934).
10. `git -C <wt> grep -n -E "durationMs|function stub|const PASSING|const FAILING|function gateOutput" -- loop/tests/gate-transport-retry.test.mjs` — no `durationMs` in the file.
11-12. Two commands blocked by the environment (no `rg` on PATH); nothing routed around them.
13. `git -C <wt> ls-files -- "loop/tests/*" | Select-String -Pattern "corrections|discarded|mock-executor|ledger"` — all four named files exist.
14. `git -C D:/AddictedtoAI show 9c1d980:openspec/changes/two-desks-work-orders-and-trains/tasks.md | Select-String -Pattern "^ *- \[.\] *(25|26|27|3b|28)\.|Resolved before..."` — each of tasks 25/26/27/3b carries its "Resolved before E's freeze" paragraph directly beneath its heading.
15. `git -C <wt> grep -n -E "mergeBaseSha|mergedSha" -- loop/run.mjs loop/tests/ledger.test.mjs loop/tests/breakers.test.mjs`
16. `Select-String -Path <wt>/loop/tests/corrections.test.mjs,<wt>/loop/tests/discarded-proposal-retry.test.mjs -Pattern "transcribeCarriedFindings|carry:"`
17. `git -C <wt> grep -l -E "unarchived|conformance" -- scripts tools app` — found `check-spec-deltas*`, `no-change-dir-refs.test.mjs`, `shell-token-guard.test.mjs`.
18. Printed tasks.md spans around tasks 25-28 and 3b for a dropped-paragraph spot check.

## Out of scope, not pursued

- Did not re-run the suite or the two red tests to re-measure the "two reds in 1,782" claim (full-suite runs are forbidden to this review; the claim is consistent with the code read: differing `authority_sha` between the two breakers fixtures and the three new line keys breaking the `['phases']` pin).
- Findings 1-2 do not reach the REVISE bar: neither makes the worker build the wrong thing, and every file the changes touch is inside the brief's Files list; finding 1 is additionally self-healing under the brief's own unmutated-red diagnosis rule.
