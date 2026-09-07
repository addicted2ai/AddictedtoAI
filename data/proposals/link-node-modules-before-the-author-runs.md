---
date: 2026-09-07
slug: link-node-modules-before-the-author-runs
type: machinery
summary: >
  Call `linkNodeModules(worktree, ctx.repoRoot)` in `loop/run.mjs` immediately
  before the executor is invoked, so a Desk job's author phase can run the four
  gates its own brief instructs it to run. Today the link is created only inside
  `runGates` (`loop/lib/gates.mjs:300`), which the loop runs AFTER the author,
  and it is torn down again in the `finally` at `loop/run.mjs:1288`. The
  worktree the author is handed therefore has no `node_modules` at all, so
  `npm test` fails all 111 test files with ERR_MODULE_NOT_FOUND and
  `npm run build` cannot start. The teardown at :1288 and the pre-delete unlink
  at :1228 both stay exactly as they are — they exist because a forced worktree
  removal follows a junction into the shared install, and this proposal does not
  touch that. It adds the matching link on the other side, and `linkNodeModules`
  is already idempotent (`already present` is one of its return values), so the
  gate-time call needs no change either.
evidence: >
  Measured on this branch, job j-20260907-08, 2026-09-07. The first `npm test`
  of the invocation reported `Cannot find package 'fast-glob' imported from
  lib/corpus.mjs` and `Cannot find package 'rss-parser'`, and every one of the
  111 test files failed; `ls` showed no `node_modules` entry in the worktree at
  all, while the shared install at D:/AddictedtoAI/node_modules held its usual
  175 entries and the two sibling worktrees each held a link to it. Reading the
  code path confirms the cause rather than inferring it: the worktree is created
  at `loop/run.mjs:1230`, the executor is invoked at `:1269`, and there is no
  `linkNodeModules` call between them — the only one in the file's reach is
  `loop/lib/gates.mjs:300`, inside `runGates`. Creating the junction by hand,
  with the same `symlinkSync(target, link, 'junction')` call the loop's own
  helper makes, was enough for the suite to pass 1569 / fail 0 and for all four
  gates to pass unchanged.
proposed_by_job: j-20260907-08
proposed_by_type: repair
---

Every Desk brief tells its author, in the ground rules, to "Run `npm test` and
`npm run build` in the FOREGROUND, read their output, then write `RESULT.md`",
and the acceptance checks list four gates the branch must pass before review.
The worktree the author is handed cannot run any of them.

That gap is invisible from either end. The loop is right: `runGates` links what
it needs before it needs it, and every gate the loop runs itself works. The
author is wrong in a way that looks like a broken branch — a hundred and eleven
test files failing at import is what a catastrophically broken change looks
like, not what a missing dependency install looks like, and the honest reading
of the brief's own instruction to report blocked rather than guess is to record
`blocked: the suite does not run on this branch`. A repair job that did that
would burn its budget, retire no finding, and leave a branch whose real content
was fine.

The fix is one line at one place, and the reason it is worth writing down rather
than just doing is that the two halves are not symmetric today. The unlink side
is careful and well-commented — `:1228` unlinks before the recursive delete,
`:1288` unlinks in a `finally`, `removeJobWorktree` refuses to remove a worktree
whose junction is still linked, and all three carry the measurement from job
j-20260907-03 that explains why. The link side exists only where the loop's own
code needed it. An author invocation is the one path that crosses the boundary
without a link ever having been made.

Two things this should not become. It should not install a second copy of
`node_modules` per job — the existing helper's comment already rejects that, and
it would multiply a 175-package install by every concurrent worktree. And it
should not weaken the teardown: the link must still be gone before anything
recursive touches the worktree, which is precisely why the idempotent helper is
the right thing to call rather than a new one.

Worth a test, in the shape `loop/tests/` already uses: build a throwaway
repository with a `node_modules` at its root, run the job scaffolding to the
point where the executor would be invoked, and assert the worktree has a link.
That assertion fails today.
