> **PROVENANCE, AND IT IS NOT THE ORIGINAL FILE.** Round 1's sealed review, run
> by a second `muse-spark` session at `xhigh` in a DISPOSABLE detached worktree
> holding a copy of the author's four files, with edit rights on that copy
> deliberately: a reviewer that can only describe a mutation is guessing whether
> the test would catch it, and one that applies it and watches is not.
>
> **The file it wrote is gone.** It lived in the disposable tree, and that tree
> was refreshed for round 2 with the file still in it. The word "disposable"
> described the TREE; its product inherited the word without anyone deciding it
> should. This copy was recovered on 2026-09-10 from the session event log
> (`arch-w1-review-r1.log.events.json`), by taking the longest logged candidate
> carrying the report's own headings, and it is complete: verdict `revise`, all
> eight sections. Recorded as a recovery rather than presented as the original,
> because a recovered artifact that reads as primary is exactly the defect this
> plan is about.

---

# WISDOM PHASE 0 — REVIEW1

## VERDICT
revise

## 1. The move — what I diffed and what I found

Local date: 2026-09-10.

I ran `git -C "D:\addictedtoai-worktrees\wisdom-w1-review" diff --no-index -- brief-lint.source.mjs scripts\brief-lint.mjs` with no truncation. The output shows exactly three hunks and nothing else:

- `scripts/brief-lint.mjs:43-44`: two added imports (`dirname, resolve` from `node:path`; `fileURLToPath` from `node:url`).
- `scripts/brief-lint.mjs:53-56`: `const REPO` now derives from script location (`resolve(dirname(fileURLToPath(import.meta.url)), '..')`); `brief` loads before `TASKS`; new `_changeName` read from the brief authority line; `TASKS` built from that name with placeholder `openspec/changes/<unknown-change>/tasks.md` when absent.
- `scripts/brief-lint.mjs:133,136,138-139,143-144,152-153`: authority pattern generalised from the single hard-coded change to any `name@sha`, with reachability and equality now reading the sha group; quotes fetch now records `tasksMissing` and refuses with `task file does not resolve: <path>@<sha>` naming the path.

Every other line is byte-identical. In particular:

- The usage string still names the old `arch-brief-lint.mjs` verbatim.
- All check comments survive verbatim, including the LIMIT note on instruments (`scripts/brief-lint.mjs:18-22`), the two-directional scope rationale (`scripts/brief-lint.mjs:202-217`), the sentence-vs-line notes (`scripts/brief-lint.mjs:103-111`, `:160-165`, `:247-249`), the case note on check 6 (`scripts/brief-lint.mjs:253-258`), the revision widening note (`scripts/brief-lint.mjs:285-293`), and the pointer-check history (`scripts/brief-lint.mjs:300-319`). No stated limit was dropped.
- Every `report(...)` name and detail outside the hunks above is untouched.

Self-enrolment holds and I did not take the brief for it. `scripts/run-tests.mjs:55` searches `['app', 'lib', 'loop', 'pulse', 'scripts', 'tests']` with `IS_TEST = /\.test\.(mjs|cjs|js)$/` (`scripts/run-tests.mjs:57`). I ran a discovery replica over the same walk: 129 files found, including `scripts/brief-lint.test.mjs`, with `TARGET_PRESENT=true` and `TARGET_EXISTS=true`. The new file therefore reaches `npm test` and the release gates with no registration step.

Baseline: `node --test "D:\addictedtoai-worktrees\wisdom-w1-review\scripts\brief-lint.test.mjs"` gives 28 pass, 0 fail, matching `RESULT1.md` section 3.

## 2. What this test would still pass on

I kept an untouched copy at `C:\Users\BadBitch\AppData\Local\Temp\opencode\brief-lint.orig.mjs` and restored it between mutations. After every restore I re-ran the suite and it was green again (28 pass, 0 fail each time).

Caught (the suite binds these):

- M1 — `once` made constant (`scripts/brief-lint.mjs:250` replaced with `const onceBad = [];`). Suite: 27 pass, 1 fail. The `once: bare once refuses` twin goes green (`BRIEF OK`, status 0 vs expected 1). Bound.
- M2 — refusal path kept but exit no longer carried (`scripts/brief-lint.mjs:60` changed to `fails += 0`). Suite: 13 pass, 15 fail. Every red twin still prints its `FAIL` line yet exits 0 with `BRIEF OK`, so each `assert.equal(status, 1)` fails. Bound.

Missed (suite stays 28 pass, 0 fail despite broken behaviour):

- M3 — scope verb list narrowed: removed `rewrite|` from `EDIT_VERB` (`scripts/brief-lint.mjs:223`). Suite stays 28/28. Real shape now slips: `Rewrite ` + `` `loop/run.mjs` `` + ` to fix the bug.` exits 0 with scope `PASS` under the mutation, exits 1 with `FAIL no instruction directs an edit at a file outside the Files scope` after restore. The test that should have caught it: a twin using a verb other than `Edit` (for example `Rewrite`, `Modify`, `Replace in`). Only `Edit` is exercised.
- M4 — check 6 made case-sensitive: removed the `i` flag on line 259 (first `/i.test` to `/.test`). Suite stays 28/28 because the twin uses the lower-case form assembled via char codes 99, 100. Real shape now slips: upper-case form (char codes 67, 68) in `Run <UPPER> /tmp to inspect.` exits 0 under the mutation, exits 1 after restore. The test that should have caught it: an upper-case twin.
- M5 — check 6 exemption removed: deleted ` && !/never|token/i.test(l)` on line 259. Suite stays 28/28 because neither the clean vehicle nor the stray-token twin carries `never` or `token`. Real shape now breaks: `Never use <token> here.` exits 1 under the mutation, exits 0 after restore. The test that should have caught it: a passing vehicle with the token inside a prohibition line (using `never` and using the word `token`).
- M6 — packet threshold lowered: `changed >= 5` to `changed >= 3` (`scripts/brief-lint.mjs:124`). Suite stays 28/28 because green uses 6 and thin-diff uses 2. Real shape now slips: a packet with 3 added lines exits 0 under the mutation, exits 1 after restore. The test that should have caught it: boundary twins (for example 5 green and 4 red, in addition to the current 6 green and 2 red).
- M7 — revision second alternative removed: `hasClass` reduced to only `/\bclass\b/i` (`scripts/brief-lint.mjs:264`), dropping the `every ... in this file` arm. Suite stays 28/28 because both revision vehicles carry `CLASS`. Real shape now breaks: `Every property in this file must hold.` plus `Do a sweep of all files.` exits 0 before, exits 1 with `class=false sweep=true` after the cut. The test that should have caught it: a green twin using the `every ... in this file` form with no `class` word.
- M8 — result-name bare guard dropped: `pf(numbered && !bareResult)` to `pf(numbered)` (`scripts/brief-lint.mjs:297`). Suite stays 28/28 because green has numbered-only and red has bare-only. Real shape now slips: a brief naming both `RESULT1.md` and bare `RESULT.md` exits 0 under the mutation, exits 1 with `numbered=true bare=true` after restore. The test that should have caught it: a twin naming both forms.

## 3. Negative controls that do not control their own property

None. I rebuilt every twin from `scripts/brief-lint.test.mjs` and ran the linter directly. Each failing twin refuses with exactly one `FAIL`, and it is the named one:

- authority unknown sha: 1 `FAIL authority line present, reachable, equals argument`.
- quotes one-word change: 1 `FAIL quotes verbatim against ...` plus `NOT VERBATIM`.
- instruments missing path: 1 `FAIL every enforcement claim names ...` plus `NO INSTRUMENT`.
- files reason deleted: 1 `FAIL every permitted file carries ...` plus `NO REASON`.
- scope stray `Edit ` + `` `loop/run.mjs` ``: 1 `FAIL no instruction directs an edit ...`.
- `once` bare: 1 `FAIL "once" always says iteration or attempt`.
- check 6 stray token: 1 `FAIL` with tail `outside a prohibition line`.
- revision missing sweep: 1 `FAIL revision brief names a CLASS ...` with `class=true sweep=false`.
- result bare: 1 `FAIL report file is a numbered ...` with `numbered=false bare=true`.
- review bare (`--review`): 1 `FAIL review output is a numbered ...`.
- pointers synthetic paraphrase: 1 `FAIL every ` + `` `git show sha:path` `` + ` resolves ...` with `does not contain`.
- packet thin diff (`--packet`, 2 lines): 1 `FAIL packet carries the author report ...` with `changed-lines=2`.
- packet thin header (`--packet`, 5 lines): 1 `FAIL packet header is substantive ...` with `5 header lines`.
- tasks missing (`no-such-change-xyz`): 1 `FAIL quotes verbatim against ...` with `task file does not resolve: openspec/changes/no-such-change-xyz/tasks.md@...`, naming the change.

Two related behaviours also refuse rather than skip, as the author claims:

- Unknown change (`no-such-change-xyz@<real HEAD>`): authority `PASS`, quotes `FAIL` naming the path. A misspelled change therefore cannot vacate the quotes check.
- No authority line: 2 `FAIL` (authority `no authority line`; quotes `task file does not resolve: openspec/changes/<unknown-change>/tasks.md@...`). The placeholder path is named, not skipped.

I also verified the exemption the suite never exercises green: a line with `Never` plus the token, and a line naming the word `token` plus the token, both exit 0 on the unmutated linter.

## 4. The ninth check's wild fixture

Both requirements hold.

Banked, not reconstructed: `scripts/brief-lint.test.mjs:355-374` builds the path with `join(REPO, 'openspec', 'changes', CHANGE, 'evidence', 'reviews', 'stage0-packet-C1', 'round1-agent-brief.md')`, reads it with `readFileSync`, takes the sha from its own authority line (`wildText.match(/authority:\s*[A-Za-z0-9_.\-]+@([0-9a-f]{7,40})/)`), and runs the linter over that path. No twin text is embedded. The file exists, is tracked (`git ls-files --error-unmatch` succeeds), and has history (`git log` shows `95bb03e record: packet C1 merged on a SPLIT verdict, tasks 13-15 ticked`). The sha read from the file is `3025c58`, matching `RESULT1.md`.

No second wild: the file has exactly one test with `wild banked` in its name. The other pointer red is plainly labelled `pointers: synthetic paraphrase refuses (one word)` (`scripts/brief-lint.test.mjs:343`). Nothing is labelled or implied as wild except the banked run.

Fidelity: direct run `node scripts/brief-lint.mjs <banked> 3025c58` gives status 1 with a single `FAIL every ` + `` `git show sha:path` `` + ` resolves and holds what the sentence names — openspec/changes/two-desks-work-orders-and-trains/specs/loop/spec.md@3025c58 does not contain "A reviewer's non-blocking finding reaches work without editi"`, matching `RESULT1.md` section 4 verbatim. The blob exists (the failure is `does not contain`, not `does not resolve`), which is the exact wild shape: the command ran and printed other requirements.

## 5. Findings, each with file and line

- F1 — scope verb coverage is one verb deep. `scripts/brief-lint.mjs:223` lists many verbs; `scripts/brief-lint.test.mjs:213-221` exercises only `Edit`. Removing `rewrite` leaves the suite green while `Rewrite ` + `` `loop/run.mjs` `` slips. Add twins for at least two more verbs.
- F2 — check 6 has no upper-case twin. `scripts/brief-lint.mjs:259` carries the `i` flag; `scripts/brief-lint.test.mjs:255-263` exercises only the lower-case form. Removing the flag leaves the suite green while the upper-case form slips. Add an upper-case twin.
- F3 — check 6 exemption has no passing twin. `scripts/brief-lint.mjs:259` exempts lines matching `never|token`; `scripts/brief-lint.test.mjs:246-263` has clean (no token) and red (stray token) but no green carrying the token inside a prohibition line. Deleting the exemption leaves the suite green while `Never use <token> here.` is refused. Add two green vehicles (one with `never`, one with the word `token`).
- F4 — packet diff threshold has no boundary twin. `scripts/brief-lint.mjs:124` uses `changed >= 5`; `scripts/brief-lint.test.mjs:388-395` uses 6 green and 2 red. Lowering to `>= 3` stays green while a 3-line diff passes. Add 5 green and 4 red.
- F5 — packet header threshold has the same gap. `scripts/brief-lint.mjs:127` uses header length `>= 20`; the test uses 22 green and 5 red. The same lowering argument applies. Add boundary twins.
- F6 — revision second arm has no twin. `scripts/brief-lint.mjs:264` allows `class` or `every ... in this file`; both revision vehicles use `CLASS`. Removing the second arm stays green while the `every ... in this file` form without `class` is refused. Add a green twin of that form.
- F7 — result-name conjunction has no twin. `scripts/brief-lint.mjs:297` requires `numbered && !bareResult`; the test has numbered-only green and bare-only red. Dropping the second half stays green while a brief naming both passes. Add a both-names red twin.
- F8 — `RESULT1.md` section 5 argument is convenient, not sound. Packet-header bare refusal (`scripts/brief-lint.mjs:277`) shares only the `!bare` sub-test with the normal and review twins; its header-only input and missing `numbered` requirement are unexercised red. Instruments zero-claims under `--review` (`scripts/brief-lint.mjs:180`) is a different branch (`instLines.length === 0`) from the proven red (`instBad > 0`), not shared logic. I verified both branches work (packet header with bare name refuses; zero claims under `--review` with a review name refuses with exactly the enforcement `FAIL`), but the suite does not bind either. Add those two reds.

## 6. What I could not determine

- Whether the 7-char prefix equality in authority (`scripts/brief-lint.mjs:138`) is intended to be prefix-only or full equality. The twin uses all-zero sha versus real HEAD, which fails under either reading, so the suite does not distinguish. I did not mutate this because any narrowing I tried still refused the twin and I could not construct a same-prefix-different-sha pair from this tree without inventing history.
- Whether the 20-char-plus-space phrase filter on pointers (`scripts/brief-lint.mjs:339-342`) has false-pass shapes in real briefs. Both pointer reds use one italic phrase each; backtick-only and multi-phrase shapes are unexercised. Mutating the filter stayed green in my early probes but I set those aside once F1-F7 were firm, so I do not claim a specific bound there.
- Why `RESULT1.md` section 2 quotes the wild refusal fully but paraphrases the other twins by name only. The names I observed match the table, so this is a reporting choice, not a defect.

## 7. Blocked or refused calls

none.

I did not run `npm install`, `npm test`, the build, any `verify-*` script, the Pulse or the Desk. `node_modules` is absent (`HAS_NODE_MODULES=false`). All suite runs were `node --test` on the author's file; all linter runs were direct `node scripts/brief-lint.mjs` invocations. Fixtures live under the OS temp area with one fresh area per trial and `rmSync` removal; temp holds zero `brief-lint-*` leftovers after the runs, and nothing here writes into the repository. No credential was handled or printed. No `git push`, no `gh`, no beads writes, no commits.
