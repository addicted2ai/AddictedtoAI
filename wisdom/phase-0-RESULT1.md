> **PROVENANCE.** Round 1's author report. Its claims were checked rather than
> accepted, and the check was itself defective: the suite was mutated by
> neutering `report()` and by forcing the exit code, both of which are
> PLUMBING. The sealed review then mutated the CHECKS and found six the suite
> did not bind at all. **A green suite says the assertions held, not that they
> bind.**

---

# WISDOM PHASE 0 — RESULT1

## 1. What moved, and what changed in the move

Moved `brief-lint.source.mjs` (working-directory copy) to `scripts/brief-lint.mjs`,
then applied exactly two parameterisations. No check, message, or comment was
otherwise touched; the diff `git diff --no-index -- brief-lint.source.mjs
scripts/brief-lint.mjs` shows only the hunks below, and every other line is
byte-identical.

Parameterisation A — repository root from script location
(`scripts/brief-lint.mjs:43-44`, `:53`):

- Added `import { dirname, resolve } from 'node:path';` (`:43`) and
  `import { fileURLToPath } from 'node:url';` (`:44`).
- Replaced `const REPO = 'D:/AddictedtoAI';` with
  `const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..');`
  (`:53`). The script lives in `scripts/`, so its parent is the root under any
  worktree or host path.

Parameterisation B — change name from the brief under test
(`scripts/brief-lint.mjs:54-56`, `:133`, `:136`, `:138-139`, `:143-144`,
`:152-153`):

- `const brief` now loads before `TASKS` so the name can be read from it
  (`:54`).
- Added `const _changeName =
  (brief.match(/authority:\s*([A-Za-z0-9_.\-]+)@([0-9a-f]{7,40})/) || [])[1];`
  (`:55`) and `const TASKS = _changeName ?
  \`openspec/changes/${_changeName}/tasks.md\` :
  'openspec/changes/<unknown-change>/tasks.md';` (`:56`).
- Authority regex generalised from the single hard-coded change to any
  `name@sha` (`:133`); reachability and equality now read the sha group
  (`auth[2]` at `:136`, `:138-139`). The report detail still shows sha versus
  argument, so the message text is unchanged.
- Quotes fetch now records `tasksMissing` (`:143-144`). When the named task
  file does not resolve at the argument sha, the linter reports
  `FAIL quotes verbatim against ${TASKS}@${authority} — task file does not
  resolve: ${TASKS}@${authority}` (`:152`), naming the path rather than
  skipping. The old `WARN no > blocks` survives verbatim for the case where
  the file resolves and the brief simply quotes nothing (`:153`).

Assertion: nothing else changed. The usage string still names the old
`arch-brief-lint.mjs` filename verbatim; check comments naming the old change
(`:10`, the `two-desks-…` example in the 4b comment) survive verbatim as the
brief requires; every `report(...)` name and detail outside the hunks above is
untouched.

## 2. The checks, one row each

Vehicle: `# Test brief — base passing vehicle` with correct authority, one
good enforcement claim (`scripts/run-tests.mjs`), one scoped Files bullet with
reason, and numbered `RESULT1.md`; no quotes (WARN, exit 0), no pointers
(WARN), no `once`, no stray token. Each FAILING twin differs minimally as
named. Temp files under the OS temp area, fresh area per trial, removed after.

| check | passing fixture | FAILING fixture | red observed |
|---|---|---|---|
| 1 authority | base, real HEAD sha from `rev-parse` in both brief and argument | same base with brief sha `0×40` (sha-shaped, unresolving), argument real HEAD | exit 1, `FAIL authority line present, reachable, equals argument` |
| 2 quotes | base plus `> Stage 0 ships first and alone` (verbatim of `tasks.md`) | one word changed: `> Stage 0 ships first and lonely` | exit 1, `FAIL quotes verbatim against …`, `NOT VERBATIM` |
| 3 instruments | base (claim names existing `scripts/run-tests.mjs`) | claim path swapped to `scripts/does-not-exist-xyz.mjs`, no delegation word | exit 1, `FAIL every enforcement claim names …`, `NO INSTRUMENT` |
| 4 files | base bullet `- scripts/run-tests.mjs — the test runner` | reason deleted: `- scripts/run-tests.mjs` | exit 1, `FAIL every permitted file carries …`, `NO REASON` |
| 4b scope | base (no stray instruction) | added `Edit \`loop/run.mjs\` to fix the bug.` | exit 1, `FAIL no instruction directs an edit …` |
| 5 `once` | base (no `once`) | added `Run it once.` | exit 1, `FAIL "once" always says iteration or attempt` |
| 6 prohibition-line token guard (literal omitted here per job ground rule) | base (no token) | added line with token assembled at runtime via char codes 99, 100 | exit 1, `FAIL` tail `outside a prohibition line` (full line carries the literal; test matches the tail) |
| 7 revision (`--revision`) | base plus `The CLASS is carried findings.` and `Do a sweep of all files.` | sweep sentence swapped to `Do a review of all files.` | exit 1, `FAIL revision brief names a CLASS …` |
| 8 result name | base (`RESULT1.md`, no bare) | `RESULT1.md` reduced to bare `RESULT.md` | exit 1, `FAIL report file is a numbered …` |
| 8b review name (`--review`) | base plus ``REVIEW1.md`` | ``REVIEW1.md`` reduced to bare ``REVIEW.md`` | exit 1, `FAIL review output is a numbered …` |
| 9 pointers, synthetic | base plus italic `*Stage 0 ships first and alone*` and live `git show HEAD:tasks.md` | italic paraphrased to `*Stage 0 ships first and lonely*` (labelled synthetic) | exit 1, `FAIL every \`git show sha:path\` resolves …`, `does not contain` |
| 9 pointers, wild | — (banked file, not a temp vehicle) | `openspec/changes/two-desks-work-orders-and-trains/evidence/reviews/stage0-packet-C1/round1-agent-brief.md` run with the sha from its own authority line (`3025c58`) | exit 1, `FAIL every \`git show sha:path\` resolves … openspec/changes/two-desks-work-orders-and-trains/specs/loop/spec.md@3025c58 does not contain "A reviewer's non-blocking finding reaches work without editi"`, `BRIEF REFUSED: 1 check(s) failed` |
| 0 packet carry (`--packet`) | sealed header (22 lines) plus report marker, diff marker, 6 added lines | same with 2 added lines | exit 1, `FAIL packet carries the author report …` |
| 0 packet header (`--packet`) | same passing packet | same with 5-line header | exit 1, `FAIL packet header is substantive …` |
| quotes missing-file | base with existing change (WARN, exit 0) | authority change swapped to `no-such-change-xyz` (sha real HEAD) | exit 1, `FAIL quotes verbatim against …`, `task file does not resolve: openspec/changes/no-such-change-xyz/tasks.md@…`, names `no-such-change-xyz` |
| move (static) | linter contains `import.meta.url` and `_changeName` | — (asserts absence of `const REPO = 'D:/AddictedtoAI'` and the hard-coded `const TASKS = …`) | `node --test` asserts the absence/presence; no linter run |

## 3. The test run

Local date: 2026-09-09. Command (only command run against the suite):

`node --test "D:\addictedtoai-worktrees\wisdom-w1\scripts\brief-lint.test.mjs"`

Full tail, verbatim, untruncated:

```text
ℹ tests 28
ℹ suites 0
ℹ pass 28
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 7732.0771
```

No `npm install`, no `npm test`, no build, no verify script, no Pulse, no Desk.

## 4. Every check seen red — the counts, verbatim

Each failing twin above exited 1 with its `FAIL` name (asserted in
`scripts/brief-lint.test.mjs`; the 28/28 green run proves every `assert.equal
(status, 1)` held). The wild control was additionally run directly with
`node scripts/brief-lint.mjs <banked-round1-brief> 3025c58`; the refusing
lines below are verbatim. The run's `PASS` lines are not reproduced here
because one of them spells the guarded literal this job never writes; the
full transcript is reproducible with that command, and the test asserts the
refusal without spelling it (tail `outside a prohibition line`).

```text
FAIL  every `git show sha:path` resolves and holds what the sentence names — openspec/changes/two-desks-work-orders-and-trains/specs/loop/spec.md@3025c58 does not contain "A reviewer's non-blocking finding reaches work without editi"

BRIEF REFUSED: 1 check(s) failed
```

All other failing twins refuse with a single check (`BRIEF REFUSED: 1
check(s) failed` shape) and their `FAIL` names as tabled; the test asserts
status 1 plus the name in each case rather than reprinting fifteen nearly
identical transcripts here.

## 5. What I could NOT give a negative control, and why

Two narrow packet/review-mode branches share their refusal logic with checks
already seen red twice, and were exercised green but not run red separately:

- Packet header bare-name refusal (`packet header names no bare RESULT.md`).
  Packet vehicles exit 0, proving it passes when clean. Its only refusal is a
  bare name in the header — the same bare-name logic proven red by the normal
  (`RESULT.md`) and review (`REVIEW.md`) twins. A third packet vehicle for one
  shared `!bare` test would prove the plumbing, not the logic.
- Instruments with zero claims under `--review` (FAIL where the same brief is
  WARN without the flag). Review vehicles carry a good claim, so the stricter
  threshold is exercised green; the refusal path itself (a claim naming
  nothing existing and delegating nothing) is proven red by the normal-mode
  twin.

Everything else — authority, quotes, instruments, files, two-directional
scope, `once`, the token guard, revision, result name, review name, pointers
(synthetic and wild), both packet-structure branches, and the missing task
file — has a passing vehicle and a minimally-different failing twin with red
observed in the 28-test run.

## 6. Blocked or refused calls

none.

## 7. Where I disagreed with this brief

none. Two judgment calls, recorded as calls rather than disagreements: when
the authority line is absent the task path is the placeholder
`openspec/changes/<unknown-change>/tasks.md`, which then refuses with the
path named instead of skipping; and check 6 evidence in this report and in
test names uses the tail `outside a prohibition line` so neither file spells
the guarded literal — the test assembles it at runtime from char codes 99,
100.
