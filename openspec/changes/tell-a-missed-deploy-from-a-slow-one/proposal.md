# Tell a missed deploy from a slow one

## What was re-measured before designing anything

`addictedtoai-k2y0` is a measurement taken on 2026-09-01 and last triaged on
2026-09-04. Everything it rests on was re-read in this worktree
(`D:/addictedtoai-worktrees/impl-spec-pulse`, cut from `main` at `e76fb30`) on
2026-09-06 before a line of this change was written.

**Still true.**

- `pulse/lib/publish.mjs:135` — `const POLL_BUDGET_MS = 10 * 60 * 1000;`, with
  `POLL_INTERVAL_MS = 20000`. One budget, no second window.
- One `writeHold` call site, at `pulse/lib/publish.mjs:705`, reached the moment
  the single deadline elapses. `grep -c writeHold` returns 2: the definition at
  `:381` and that one call.
- `stampMatchesCommit` (`:371`) is prefix equality against **one** SHA:
  `sha.startsWith(seen)` behind a `/^[0-9a-f]{7,40}$/` guard. Nothing in the
  file resolves a stamp to a commit object, and nothing asks whether one commit
  contains another.
- Under a standing hold the step returns at `:568–570` — `say(...)` and
  `return { published: false, reason: 'hold' }` — **before** any live read. A
  hold therefore suppresses the only observation that could show its cause had
  passed, which is the deadlock the issue names.
- `data/config.json`'s publish flag and breaker 2's semantics are unchanged, and
  nothing in `publish.mjs` removes `HOLD.md`.

**Not true as written, and the correction changed the delta.** The triage note
of 2026-09-04 says there is "no never-deployed vs deployed-older distinction in
the hold text". There is half of one. The hold string at `:705–711` appends
`' — unchanged since before the push'` when `lastSeen === baseline`, so the
never-advanced case is already distinguishable **when a baseline was readable
and the reader knows to look for that clause**. What is missing is a
classification: a named outcome the hold states outright and a test can assert,
covering the third case (`unreadable`, where `baseline` is null and the clause
silently disappears) as well as the two the issue names. The delta therefore
asks for a closed set of three named classifications rather than for "a
distinction", which is what the bead's option (d) would have produced.

**A second correction, and it is the one that reframes the whole change.**
The issue's own sequence rules out every explanation except the deploy never
being attempted, and records that the *next* push was live in under two minutes.
That means the condition the check measures — *is my exact commit the live
stamp* — was **permanently** false for `5b8c8726` and always would be: that
commit never deployed and never will. The halt did not outlive a transient
condition. It outlived the only thing anybody cares about, which is whether the
bytes that commit contained were being served — and from 12:59 they were, inside
`982ea30`, which contains it. Options (a) and (b) in the issue both address the
wrong axis: a longer wait would not have helped, because there was nothing to
wait for. Re-asking the question does.

**One measurement the issue does not carry, and it bounds what this change can
promise.** `.gitignore:68` ignores `/HOLD.md`, so the hold and anything appended
to it are local to one machine and are never committed or pushed. The re-test
below is therefore diagnostic evidence for whoever reads the file, not queue
state and not a durable record; a fresh clone sees no hold at all. Stated here
so nobody later reads the appended observations as a data layer.

## The findings

**1. The check asks a question narrower than its own purpose, and the narrowness
manufactures halts.** The requirement's stated purpose is that "a Pulse run that
completes without the live site changing is not a success". Its implementation
asks something stricter: that the live stamp be an abbreviation of *this exact
SHA*. Two publishers share this step — the Pulse and the Desk both reach it,
which `pulse/lib/publish.mjs`'s own comment says outright ("`loop/run.mjs`
publishes through this same step after a merge") — so a merge that pushes on top
of a Pulse commit while the Pulse is still polling makes the Pulse's check fail
on a deploy that is serving the Pulse's bytes. That is a false halt available
today, on ordinary concurrency, with no vendor fault required.

**2. Ten minutes is a verdict taken from one sample.** A single budget makes "not
live after ten minutes" and "never deployed" the same fact. They are different
facts with different recoveries, and the issue's own option (a) says so.

**3. A hold that does not classify itself makes its reader re-measure.** The
existing conditional clause is not a classification: it is absent whenever the
pre-push baseline was unreadable, and no test asserts it. `HOLD.md`'s value is
that it carried every fact needed to start the diagnosis — which the issue
praises and this change keeps — and a named outcome is one more such fact.

**4. The brake suspends the only action that could show the cause has passed.**
The step returns before reading the live stamp when a hold stands. Nothing in
the system can discover that the site is now serving what it was waiting for.

## The decision

Four changes to one requirement, in the order they take effect.

1. **Containment, not equality.** The deploy is landed when the live stamp
   resolves to the pushed commit **or to a commit that contains it**. Fail
   closed: a stamp that resolves to no commit the local repository can name does
   not pass, and neither does one that resolves to a commit the pushed commit is
   not an ancestor of. "A stamp that merely changed SHALL NOT satisfy the check"
   survives verbatim, because containment is not change — it is a stronger test
   than equality-against-a-changed-value and a weaker one than equality, and it
   is the test that matches the sentence about what the step is for.
2. **A confirmation window before the halt**, at least three times the first
   budget. Cheap, and it separates slow from missed.
3. **A named classification in the hold**: `never-advanced`, `advanced-elsewhere`,
   `unreadable`, computed from the stamps the run read, carried with the pushed
   commit, the last stamp, and both durations.
4. **A read-only re-test of a standing hold.** Every invocation that finds a
   deploy hold reads the live stamp once, appends one dated observation, and
   changes nothing else. It takes no outward action, so it is not "a second
   outward action to diagnose the first" — the risk the issue's option (b)
   correctly refuses.

**What is deliberately not done: the hold does not clear itself.** The issue's
option (c) — leave the halt as it is — is accepted for the halt itself. This
repository's rule that "a run blocked by a guardrail reports it and stops; it
does not loosen the guardrail to get past it" is not weakened by anything here,
and the standing authority to clear a *diagnosed* halt belongs to the maintainer
or to an orchestrator between runs, never to a run. What changes is that the
diagnosis is already in the file when they get there.

## What this change deliberately does not do

- **It does not touch breaker 2 or anything in `specs/loop`.** The Desk's
  refusal to start while `HOLD.md` exists is unchanged and is another
  capability's requirement. One consequence is worth naming rather than
  discovering: because the Desk will not start under a hold, the only caller
  that reaches the publish step while a hold stands is the Pulse, so the
  re-test's cadence is the Pulse's schedule. In the sequence
  `addictedtoai-k2y0` records, that is the next 06:00 run — better than nothing
  in the file at all, and not the same thing as a two-minute discovery. A
  faster re-test would have to be the Desk's health check reading the hold, and
  that is `specs/loop`'s to decide.
- **It does not re-push, re-trigger, or contact the host's API.** Detection
  stays "by fetching the live page only", verbatim.
- **It does not commit `HOLD.md`.** The file is git-ignored and stays so; the
  appended observations are local diagnostic text.
- **It does not change the ten-minute first budget**, the polling interval, or
  the IndexNow phase that runs on a landed deploy.
- **It does not make a missed deploy queue work.** A halt is a halt; routing it
  into the derived queue would make a guardrail into a backlog item, which is
  the failure `A withdrawn feed row is recorded once…` already names.

## Beads this change serves

- `addictedtoai-k2y0` — the whole of it. Options (a) and (d) are taken in a
  corrected form, (b) is refused with its own reason, and (c)'s defensible core
  — the halt stays a halt — is kept.
