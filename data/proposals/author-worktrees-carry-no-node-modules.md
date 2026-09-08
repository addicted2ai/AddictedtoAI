---
date: 2026-09-04
slug: author-worktrees-carry-no-node-modules
type: machinery
summary: >
  Keep `node_modules` available before author and revision executors run. The
  author/revision calls to `linkNodeModules(worktree, ctx.repoRoot)` have
  already landed at `loop/run.mjs:300` and `:712`; the gate-time call remains at
  `loop/lib/gates.mjs:300`. The helper is already idempotent (`already present`
  is returned at `loop/lib/gates.mjs:157`), so that gate-time call needs no
  change. The remaining work is teardown safety: `unlinkNodeModules` must
  distinguish a junction it created from a real directory a job installed,
  rather than calling `unlinkSync` on a directory and swallowing the throw.
evidence: >
  Measured in this job's own worktree on 2026-09-04. `npm --prefix
  D:/addictedtoai-worktrees/j-20260904-56 test` reported "91 test file(s)" and
  then failed every one of them with "Error [ERR_MODULE_NOT_FOUND]: Cannot find
  package 'fast-glob' imported from ...\lib\corpus.mjs"; the worktree had no
  `node_modules` at all. After `npm ci` in the worktree the same command
  returned 1227 pass / 0 fail and `npm run build` completed. The targeted
  `rg -n 'linkNodeModules\\(' loop/run.mjs loop/lib/gates.mjs` check reports
  calls at `loop/run.mjs:300`, `loop/run.mjs:712`, and
  `loop/lib/gates.mjs:300`; the helper's idempotence is directly confirmed by
  `loop/lib/gates.mjs:157`. The targeted `rg -n 'unlinkNodeModules\\('
  loop/run.mjs` check reports callers at `loop/run.mjs:327`, `:728`, `:1272`,
  and `:1336`, not the older line references. At `loop/lib/gates.mjs:170-178`,
  the teardown still tests `st.isSymbolicLink() || st.isDirectory()`, calls
  `unlinkSync(link)`, and swallows the catch — the remaining hazard.
  Related but not the same case: `data/proposals/review-worktrees-carry-no-node-modules.md`
  (2026-09-01) covers the REVIEW worktree, whose remedy would not reach the
  authoring one.
proposed_by_job: j-20260904-56
proposed_by_type: repair
---

A job whose acceptance checks say "the repository still builds (`npm run
build`) and `npm test` still passes" is being asked to run two commands that
cannot succeed in the tree it was given. The failure mode is the bad kind: not
an error that names its cause, but 91 test files reporting `'test failed'` in a
tail of output that looks exactly like a repository someone broke. A job that
trusts the first run and writes `blocked:` has reported a red gate that is
green; a job that trusts it and reports `done` anyway has skipped the check.

The fix is small because the machinery is already almost right.
`linkNodeModules` exists, documents its own reasoning ("A worktree has no
`node_modules` — it is gitignored, so `git worktree add` does not bring it"),
uses a Windows junction so it needs no elevated rights, and is paired with an
`unlinkNodeModules` that `loop/run.mjs` calls at all four teardown sites. The
author and revision calls now happen immediately before their executor
invocations, and the existing helper's idempotent `already present` result
means the gate-time call does not need to change. The remaining fix is to make
teardown safe when a real directory occupies the path.

The second half is the hazard the workaround creates. A job that notices the
missing tree and runs `npm ci` — the obvious move, and the one this job made —
leaves a real directory where the teardown expects a junction.
`unlinkNodeModules` then reaches `unlinkSync` on a directory, throws, and
swallows the throw in a `catch` whose comment assumes the leftover is "a
junction that will not unlink". Linking at creation removes the reason to
install; teaching the unlink to tell a junction from a directory removes the
consequence when someone does anyway. This job deleted its own installed
`node_modules` before finishing, precisely so the teardown would meet the tree
it expects — that manual step is what should not be a job's responsibility.
