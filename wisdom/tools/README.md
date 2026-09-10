# wisdom/tools — the verification instruments, rescued from a session temp directory

**Every file here was written in a session scratchpad and would have died with
that session.** They were committed on 2026-09-10 at handoff, which is §7w
("the cleanup is where the evidence dies") arriving as the handoff itself. If
you write a new instrument, put it here on the day you write it, not on the day
you leave.

They were renamed on the way in — the `arch-` prefix is gone — and their
relative imports were repaired. Two of them read `ARCH_SCRATCH` from the
environment where they used to hard-code a session path, and **both refuse
rather than default**, because an empty directory scanned by
`relocate-evidence.mjs` reads exactly like a complete plan.

## What each one is for

| File | What it does | Why it exists |
|---|---|---|
| `suite.mjs` | Runs a test file in a named worktree and returns `{tests, pass, fail, failed}` read from the runner's own counters. | **The denominator has to come from outside the run.** A report saying "39/39" is the author's arithmetic; this is the runner's. `makeRunner({tree, file, expectTests})` refuses when the collected count changes unless `allowCountChange` is passed — a suite that quietly collects fewer tests is the failure that looks like success. First argument to `run()` is an ARRAY; passing `{}` spreads into argv and surfaces as "nothing was measured". |
| `worktree-guard.mjs` | Refuses to verify a worktree carrying undeclared modified tracked files. | Written after a verification ran against a tree with someone else's edits in it. Carries the §7r repair: path matching is `p === base \|\| p.startsWith(base + '/')`, never bare `startsWith` — `.agents` must not match `.agentsfoo`. The defect was present TWICE in one file and was found by a peer reading a copy. |
| `guard-prefix-proof.mjs` | 8 arms proving the above, including the live defect arm. | §7r: every prefix the guard had ever been proved with ended in a separator or was a complete path, so **no proof in the pool exercised a mid-name prefix**. A proof pool can be skewed with nobody skewing it. |
| `main-quiet-guard.mjs` | Refuses to touch `main` while a gate run is in flight. Two OR'd signals: a lock file at `D:/addictedtoai-coord/GATE-RUNNING`, and gate-shaped processes in the process table. Both injectable. | §7u. The process table is **blind for the ~3m36s of setup** at the front of every gate run, which is exactly when a run looks idle. The lock covers that window; the table covers the other party forgetting the lock. **Its known asymmetry, unfixed: it answers "is the other session running?" and not "am I running?"** — and the second question is the one that bit twice. Guard that direction next. |
| `main-quiet-proof.mjs` | 8 arms, both directions reachable via a decoy lock path and decoy patterns. | The quiet-tree arms **cannot be evaluated while the tree is not quiet**, so injection is what makes the ALLOW direction provable at all. "I could not reach that branch" is a standing excuse until somebody makes the branch reachable, and making it reachable is usually a parameter. |
| `early-snapshot.mjs` | Watches for a report file and copies its first sighting, so a report's ordering can be checked later. `armDecision()` returns code 3 if the anchor exists, **code 5 if the watched file already exists at arm time**. | Code 5 is the whole point: "the anchor matched" and "there was nothing to match against" are the same green from outside. Several authors write their report in one final write, and the instrument must say so rather than report a match. |
| `snapshot-decoy.mjs` | 5 arms including the mutation where the old code copies stale bytes and calls them the anchor. | Its first run died on the module's own usage message, because importing it ran the CLI — **that was the reason the branch had never been tested**. The `import.meta.url` entry guard is the fix. |
| `relocate-evidence.mjs` | Moves round reports out of a branch root into `evidence/reviews/<packet>/round<N>-{RESULT,REVIEW,BRIEF}.md` at merge. | Named by the **round**, not the report serial — `REVIEW2.md` is the second review and reviews round three. Both populations are enumerated **from the world** (git ls-tree, directory scan) and anything neither mapped nor declared-ignored-with-a-reason refuses, because an unlisted file is silent and silence reads exactly like completeness. |
| `teardown-worktrees.mjs` | Removes finished packet worktrees safely. | Junction FIRST via `rmdirSync` (never `recursive: true`, which walks the reparse point into the main tree's `node_modules`), then the worktree, **never `--force`**, never `worktree prune`. Counts the main dependency tree either side of every removal. Requires each untracked file to have a byte-identical committed twin before deleting it — "untracked" is not "not work". |
| `lint-brief.mjs` | Runs a tree's own `scripts/brief-lint.mjs` with `cwd` set to that tree. | Linting a branch's brief from `main` reported a missing path that exists on the branch. **A check run against the wrong tree is not a looser check, it is a check of a different subject.** |
| `main-suite.mjs` | Runs the whole suite on `main` under the shared `GATE-RUNNING` lock and reports the counters. | Writes the lock because **a protocol only one party keeps is a courtesy, not a mechanism**. Accepts both `ℹ tests N` and `# tests N`; its first version matched only `#` and returned null for every counter — honest only because null stayed visible. A counter that defaults to 0 on a parse miss reports a green suite of no tests as a green suite. |

## How to run them

Nothing here is wired into `npm test` on purpose — these are operator
instruments, not repository tests. Run them by absolute path with `node`, and
set `ARCH_SCRATCH` when using `relocate-evidence.mjs` or when you want
`main-suite.mjs` to keep its raw output somewhere specific.

The two guards that live in `scripts/` rather than here —
`shell-token-guard.mjs` and `output-shortener-guard.mjs` — are different: they
are `PreToolUse` hooks registered in `.claude/settings.json`, they have real
test suites under `scripts/`, and they run on every command. Do not move them.
