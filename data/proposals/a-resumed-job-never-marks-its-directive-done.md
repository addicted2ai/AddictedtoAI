---
date: 2026-09-06
slug: a-resumed-job-never-marks-its-directive-done
type: machinery
summary: >
  Carry the directive's line number on the branch so a RESUMED job can still
  append the `[done <date> <job-id>]` marker when it merges. Today it cannot:
  `.job/source.json` records `source` and `issues` but no line number, and the
  resume path rebuilds the job object with `source: 'resumed'`, so the merge's
  guard `if (job.source === 'directive' && job.lineNumber)` fails on both
  halves. The directive stays unmarked, the selector picks the same line on the
  next run, and the work is done a second time by a job that cannot know it. The
  fix is small — write `lineNumber` into `.job/source.json` at selection, and
  restore it (with `source`) on the resume path — and it needs a test that
  resumes a directive job, merges it, and reads DIRECTIVES.md.
evidence: >
  Measured in this repository on 2026-09-06, on the job that IS the second
  selection. `DIRECTIVES.md` line 114 (the DESK-ORDER-001 §1 frontier backfill,
  beads addictedtoai-9c9t) was delivered by job j-20260906-17: it was resumed
  (commit 0a181ad, "job j-20260906-17 (verify): resume j-20260906-17"), its work
  merged as 78625a5, its reviewer returned `approve`
  (data/reviews/j-20260906-17.md), and data/ledger.jsonl records
  outcome "done". `grep j-20260906-17 DIRECTIVES.md` returns nothing, and line
  114 carries no `[done …]` marker, so `parseDirectives` selected it again and
  this job (j-20260906-18) was briefed on an outcome already in the tree — 20
  model-minutes on the first job's ledger line, and a full second job's budget
  authorised against a completed line. The code path is exact: `loop/run.mjs`
  1099-1117 writes `{job, type, source, slug, path, issues}` into
  `.job/source.json` with no `lineNumber`; `loop/run.mjs:963` rebuilds a resumed
  job as `{ type, source: 'resumed', title, detail }`; `loop/run.mjs:1402` gates
  the marker on `job.source === 'directive' && job.lineNumber`. Both conjuncts
  are false for every resumed directive job. `markDirectiveDone` itself is
  correct and idempotent (`loop/lib/directives.mjs:107-119`) and is covered by
  `loop/tests/resume-directives.test.mjs` — which tests the function, and a
  resumed job's SELECTION, but never a resumed job's MERGE.
proposed_by_job: j-20260906-18
proposed_by_type: verify
---

# A directive is marked done by the merge, and a resumed job's merge cannot reach it

`DIRECTIVES.md` is work source 1 and outranks the entire derived queue. The file
says what an unmarked line costs, in the section that parks unrunnable
directives: *"ONE unrunnable line starves every queue item on every run — it is
selected, it produces nothing, it is never marked done … and the next run does
it again."* That paragraph was written about a line whose precondition was
unmet. This proposal is about the same failure reached from the other end — a
line whose work is **finished**, merged and approved, and which is still
selected again because nothing wrote the marker.

## The mechanism, in three lines of the file

At selection the loop commits `.job/source.json` so that "the branch now carries
everything resumption needs" (`loop/run.mjs:1121`). It carries the job id, the
type, the source, a proposal slug and path, and the issues. It does not carry
the directive's line number, because until the resume path existed the line
number only had to survive inside one process.

On resume the job object is rebuilt from the branch:

```js
job = { type: typed.type, source: 'resumed', title: `resume ${jobId}`, detail: '' };
```

and at the merge:

```js
if (job.source === 'directive' && job.lineNumber) {
  const m = markDirectiveDone(ctx, job.lineNumber, jobId, localDate(now));
```

`source` is now `'resumed'`, and `lineNumber` was never written down. The guard
fails twice over, silently, on the one path where the loop's own record of
"this work is finished" gets made.

## Why the existing test does not catch it

`loop/tests/resume-directives.test.mjs` is the right file and it stops one step
short. It proves that a `[done …]`-marked line is skipped while an unmarked one
is selected; it proves `markDirectiveDone` is idempotent and that the marker
reaches a commit. What it never does is **resume** a directive job and then
**merge** it. Between those two covered halves sits the transition that drops
the line number, and a test suite can be green over both halves of a bridge
whose middle is missing.

The test to add is one sentence long in the describing: select a directive job,
resume it, merge it, and assert the line carries a marker naming the resumed
job's id. It fails today.

## What the job would do

1. **Write `lineNumber` into `.job/source.json`** at selection, beside `issues`,
   on exactly the reasoning already recorded there — "written down rather than
   remembered", because "a resumed run must not re-derive them from a directives
   file the maintainer may have edited in between". A line number recovered by
   re-parsing `DIRECTIVES.md` at merge time would be a guess: the maintainer and
   the orchestrator both edit that file between runs, and this repository has
   already watched a line move.
2. **Restore it on the resume path**, along with the original `source`. The
   merge guard needs `source === 'directive'`, so a resumed directive job must
   present as one. `source: 'resumed'` is currently doing two jobs — recording
   *how this invocation started* and standing in for *where the work came from*
   — and those are different facts. Whichever way the implementer splits them,
   the merge must be able to tell that this branch serves a directive.
3. **Add the merge-side resume test** described above, red first.
4. **Decide, and write down, what happens to a line number that no longer points
   at its directive.** `markDirectiveDone` indexes `DIRECTIVES.md` by line
   number and appends to whatever line it finds. If the file was edited between
   selection and merge, a stale index marks the wrong line done — which is worse
   than marking none, because it silently retires work nobody did. The honest
   minimum is to verify the target line still matches the directive's text
   before appending, and to log and skip rather than guess when it does not.

## The honest case against

The cheap alternative is what happened here: the orchestrator notices an
unmarked line and marks it by hand between runs, as `1df413d`
("DIRECTIVES.md: mark the radar line done") already shows being done. That
works, costs nothing, and needs no code.

It also depends on someone looking. Nobody looked between j-20260906-17's merge
and j-20260906-18's selection, and the loop is designed to run unattended
overnight — which is precisely when a directive line is worked twice with no
human in the loop to notice the repeat. The cost is not a wrong answer; it is a
whole job's budget spent on an outcome already in the tree, and the second job
cannot detect the duplication from inside, because its brief is
indistinguishable from the first one's.
