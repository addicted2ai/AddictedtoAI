---
date: 2026-09-04
slug: author-worktrees-carry-no-node-modules
type: machinery
summary: >
  Link `node_modules` into a job worktree when the worktree is created, not
  only inside `runGates`. Today `linkNodeModules` is called from exactly one
  place — `loop/lib/gates.mjs:177`, inside the gate run that happens AFTER the
  authoring invocation — so an authoring job that runs `npm test` or
  `npm run build`, which its own acceptance checks require it to do, gets a
  catastrophic false red instead of a result. The proposed job would move the
  link to worktree creation (`unlinkNodeModules` already runs on every teardown
  path in `loop/run.mjs`, so the symmetry is already there), and would make
  `unlinkNodeModules` distinguish a junction it created from a real directory a
  job installed, rather than calling `unlinkSync` on a directory and swallowing
  the throw.
evidence: >
  Measured in this job's own worktree on 2026-09-04. `npm --prefix
  D:/addictedtoai-worktrees/j-20260904-56 test` reported "91 test file(s)" and
  then failed every one of them with "Error [ERR_MODULE_NOT_FOUND]: Cannot find
  package 'fast-glob' imported from ...\lib\corpus.mjs"; the worktree had no
  `node_modules` at all. After `npm ci` in the worktree the same command
  returned 1227 pass / 0 fail and `npm run build` completed. `grep -n
  'linkNodeModules|unlinkNodeModules' loop/` returns one definition and one
  caller for the link (`loop/lib/gates.mjs:177`) against three callers for the
  unlink (`loop/run.mjs:275`, `:562`, `:980`) — the asymmetry is the bug.
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
`unlinkNodeModules` that `loop/run.mjs` already calls on all three teardown
paths. Only the call site is late: it sits inside `runGates`, so the link
appears after the authoring invocation has already exited.

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
