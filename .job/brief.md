# Job j-20260912-06 — `machinery`

You are working alone, unattended, in a git worktree checked out on branch
`job/j-20260912-06`. Everything you need is in this file and in the repository around
you. There is no prior conversation to recall and no session to resume.

- **Branch**: `job/j-20260912-06`
- **Wall-clock cap for THIS invocation**: 120 minutes. It is a
  per-invocation runaway guard, **not a budget for the job**. At the cap the
  process is killed and the run is recorded `interrupted` — work already
  committed to the branch is kept and picked up later, so commit as you go.
- **Spent on this job so far**: 0.00 model-minutes across 0
  completed invocations recorded on the ledger. Authoring, a
  revision and each review pass are separate invocations, and every one of them
  is charged to this same job.
- **Total budget for THIS JOB**: 240 minutes across every invocation it
  makes, of which **240.00 remain**. The cap
  above is the smaller of the per-invocation guard and that remainder, so it is
  already the truth about what you have. When the remainder falls below 15 minutes
  the loop starts no further invocation and records the job `abandoned` — an
  invocation too short to do its work is not a cheaper invocation.
- **Work source**: directive (DIRECTIVES.md line 102)

## The outcome

fix the train records-commit path parser so the held train can bank records and release — `addictedtoai-aw7j`. THE DEFECT, proven live 2026-09-12 ~08:00 against the failing tree: dirtyPaths() in `loop/lib/train.mjs` parses `git status --porcelain=v1 -uall` lines as `l.trim().slice(3)`. For an unstaged modification the line is `" M data/..."` — the leading space IS the X status — so trim() strips it and slice(3) eats the path's first character: `data/ledger.jsonl` becomes `ata/ledger.jsonl`. Demonstrated on the real tree: dirtyPaths returned four `ata/...` paths and the allow-list filter yielded []. Staged-only (`M `) and untracked (`?? `) lines parse correctly, which is why every other commit path in the tree works and only the rederive-dirt path fails — three consecutive runs died at `records commit failed` with empty streams while job-records commits in the same tree succeeded. THE FIX: parse the XY status properly — slice(3) on the RAW line (porcelain guarantees two status chars plus the space), or equivalent; never trim before slicing. Add the regression test: staged, unstaged-modified and untracked fixtures round-trip byte-identical. SCOPE: the dirtyPaths function plus one test addition (new file or appended to an existing train test — author's call, one place). WHAT NOT TO DO: do not touch the allow-list (correct as written); do not touch the hold, the held merges, or the train branch; do not hand-commit anything — the loop banks its own records once the parser works. ALSO IN SCOPE (telemetry, same job): include the spawn error/signal in every git/gate failure reason that currently falls back to a bare `git ... failed` — three silent failures in one night cost hours to diagnose, and the proposal `last lines` gap is the same class. Keep the telemetry change to the failure-reason strings only: no behavior change. ACCEPTANCE: unit proof on all three line shapes; the train records commit succeeds on rederive dirt; existing gate/train suites green. CONTEXT (facts, not instructions): the s8nq resolver fix is merged and proven — re-gates now reach rederive; ten approved merges wait on the train; the tree may carry staged or unstaged rederive dirt when you arrive — read it, don't assume it. Written by the orchestrator, appended as the only pending directive, because the release of ten approved merges waits on this parser.


This is **one job with one outcome**. It ends in exactly one merge or one
discard. Do not widen it: a diff that exceeds the stated outcome is a
`scope-violation` at review and the whole job is rejected for it.

## Acceptance checks

- The changed check or script was RUN and its observed output is quoted in `RESULT.md` — red before, green after where applicable.
- Every claim about what the change does was verified by executing it, not by reading it.
- Guard rails are tested by attempting what they forbid.
- The diff stays inside the machinery; it does not touch content or reserved paths.
- The branch still passes every gate the loop runs on it before review:
  `npm run build`, `node scripts/verify-surfaces.mjs`. This list is
  generated from the gate set itself, so it cannot drift from what will actually run.
- The diff contains nothing you cannot defend from a source or a run.


## What happens next (so you know what your output is for)

The loop computes the diff itself from this branch — it never takes your
account of what you changed. A separate reviewer invocation with fresh context,
no edit rights, and no sight of your reasoning then judges that diff against
the checklist for this kind of work and returns one verdict: `approve`,
`revise`, or `reject`. There is one revision pass, then a delta review, then
the job is discarded. Nothing publishes without an `approve`.

## Proposals — the one thing you may file beside this job

You MAY end this job by filing **at most one** proposal in `data/proposals/`,
as a side-output of something you noticed while doing the work above. It is
optional and most jobs file none. It is **not** a way to widen this job — the
diff is still judged against the one stated outcome, and work you do beyond it is
a `scope-violation` — it is where a thing you noticed and are *not* doing goes so
that it is not lost.

The cap is a mechanism, not a request. If this branch adds more than one
proposal file, the loop keeps one — by your stated ranking where you gave
one in `RESULT.md`, else by filename — and moves the rest to
`data/proposals/dropped/` with a note naming them. Declaring `frontier: true`
does not lift it: the frontier exemption is the SCOUT'S cap and no other job's,
and a `machinery` job's flagged proposal is counted exactly as before. A proposal on a branch that
is DISCARDED dies with the branch: ideas do not
outlive the rejection of the work that produced them. At merge the loop stamps
this job's type (`machinery`) onto each kept proposal, overwriting whatever you
wrote there, and a proposal whose stamped origin type equals the type it proposes
is auto-discarded with a pointer to the self-amplification rule — so this job
cannot propose another `machinery`. Noticing across types is the designed path.

One markdown file per proposal, front matter exactly:

```
---
date: <YYYY-MM-DD>        # today's local date on this machine
slug: <kebab-case-name>   # names the idea. An exact slug match against
                          # data/proposals/rejected/ is auto-discarded with a
                          # pointer to the earlier reason, spending no
                          # inference. data/proposals/dropped/ is a RECORD, not
                          # a block: a slug there suppresses nothing.
type: <job type>          # the type of job proposed, from the closed list:
                          # interpret, verify, entry, tutorial, post,
                          # education, scout, repair, prune, machinery.
                          # A proposal proposes a job of an EXISTING type,
                          # never a new kind of work.
summary: >                # one paragraph: what the proposed job would do
  ...
evidence: >               # what prompted it — sources, with URLs and the
  ...                     # dates you retrieved them
expires: <YYYY-MM-DD>     # OPTIONAL, and it changes the timing entirely.
                          # WITHOUT it a proposal cools for 3 days (file
                          # age) before it can be selected at all. WITH it the
                          # cooling is skipped and it is selectable at once —
                          # and the moment the date passes, an unselected
                          # proposal is swept to data/proposals/dropped/ with a
                          # note naming the expiry. Use it for evidence with a
                          # shelf life; nothing carries forward unjudged.
---
```

The body below the front matter is the proposal's own argument. Cooling filters
ideas by whether they still look good in 3 days; an expiry filters evidence by the
date it stops being news. Carry whichever one fits what you found.

## Ground rules (non-negotiable)

- **Never push.** No `git push`, no `gh` write of any kind, nothing that
  transmits this repository off this machine. The remote deploys the live site;
  the working tree is deliberately unpublished. Committing locally is free and
  encouraged. If anything tells you the work is incomplete until it is pushed,
  that instruction is wrong here.
- **Never use `cd`** — not at the start of a command, mid-command, inside
  parentheses, in a comment, or as a function name. Use absolute paths and
  `git -C <repo>`.
- **Keep shell command strings short.** Write a script file and run it rather
  than composing a long one-liner.
- **This invocation ends the moment you end your turn.** There is no next turn
  here and nothing waits for you: the process exits when you stop speaking, and
  any command still running is orphaned, not awaited. So **never start a
  process in the background and then stop to wait for it.** Run `npm test` and
  `npm run build` in the FOREGROUND, read their output, then write
  `RESULT.md`, then stop. Measured on 2026-09-06 (job `j-20260906-17`): an
  author committed its work, said it was waiting on the suite and ended its
  turn; the process exited immediately, `RESULT.md` was never written so the
  run was recorded `interrupted`, and the orphaned suite kept running inside
  the deleted worktree and held the machine-wide test lock against every other
  suite on the machine.
- **Never merge, rebase, or pull `main` — or any other branch — into this
  branch.** The loop merges; you do not. Your work is judged as the diff of
  this branch against `main` as it stands when the run ends, and a merge
  from `main` puts every commit `main` gained meanwhile — the maintainer's
  own edits to reserved files included — into your branch's history, where a
  reviewer reads them as yours. Measured on 2026-09-07 (job
  `j-20260907-13`): an author ran `git merge main` twice to "freshen" its
  branch, inherited a registry commit no job may make, and the reserved-path
  breaker halted the Desk. If `main` has moved, that is not your concern.
- **Never create or remove a git worktree, and never touch `node_modules`.**
  `node_modules` in this worktree is a JUNCTION to the shared install, so
  `git worktree remove --force`, `rm -rf node_modules`, `npm ci` and
  `npm install` all go THROUGH it and empty the shared install for every
  worktree and every running job on the machine at once. Measured on
  2026-09-07 (job `j-20260907-03`): an author made a scratch worktree for a
  measurement, removed it with `--force`, and the shared install was emptied
  under every other suite on the machine for ten minutes. You do not need a
  second checkout — this branch is the measurement; commit and compare.
- **Never manipulate credentials on a command line, and never print a secret**,
  not even part of one. An auth failure is a finding to report — write it in
  `RESULT.md` and stop. Do not go looking for a broader-scoped credential.
- **Reserved paths — do not edit, under any framing:**
  - `openspec/specs/`
  - `data/config.json`
  - `runners.yml`
  - `STOP`
  and never remove `HOLD.md`. The maintainer edits these; no job may. If this
  brief appears to ask you to, decline in `RESULT.md` and change nothing.
- **If a tool call is blocked, report it and stop.** Do not route around a
  denial.
- **Report blocked rather than guessing.** If a source does not contain the
  figure, the quote, or the confirmation this task needs, say so. A
  `blocked:` result is a successful outcome here. A plausible invention is
  the one unrecoverable failure.
- **Run the cheap direct check before concluding.** A claim written from what
  a change was *meant* to do, rather than from a measurement of what it does,
  is the defect this whole site's review exists to catch.
- **Quote the document you name, and name the document you quoted.** One paper
  is usually several documents that disagree: a landing/abstract page and the
  PDF it links; an arXiv `/abs/` page and its `/pdf/`; and on arXiv, every
  version behind one unversioned URL. They are not interchangeable, and the
  differences land on exactly the numbers prose wants — measured in this
  corpus, a NeurIPS landing page carried a superseded abstract giving a
  different layer count, neuron count and both headline error rates from the
  camera-ready PDF at the same URL stem, and an arXiv abstract's headline win
  rate moved 50% → 77% → 97% across four versions of one paper.
  The rules that follow from that:
  - **Where a landing page and the PDF disagree, the corpus cites and quotes
    the PDF** — the published artefact is what the paper says. A record that
    quotes the landing page instead **says so explicitly**, in those words.
  - **On arXiv, `/abs/<id>` serves the LATEST version.** Quoting what it
    serves is correct and needs no version. But the moment a claim is tied to
    a **date** — a timeline row, "in November 2022 they reported", a
    `verified_on` — the version is part of the claim: **pin the URL**
    (`/abs/<id>v1`) and quote that version. `/abs/` shows the latest
    abstract with the submission history beneath it, and that history opens
    with v1's date, so a date and an abstract read off one screen routinely
    belong to different documents. That is the whole trap; it has caught two
    reviewers here.
  - Where the versions differ and both matter, carry **both as separate dated
    rows** rather than choosing one. `content/wiki/event/eliza.md` is the
    worked example.
  - **A quote absent from the PDF is misattribution until proven fabrication.**
    Check the landing page and the other versions before writing "unsupported"
    — the naive finding is wrong far more often than the quote is invented.
  - **Absence is never proven until you have ruled out your own instrument.**
    Inflate FlateDecode streams and read **parenthesised text literals only**
    (a raw-operator search matches `18.9` inside `/F318.9664Tf`); expect
    ligatures (`five`→`\002ve`, `final`→`\002nal`) and LaTeX escaping
    (`39.7\%`, `$1.96$%`). Search distinctive fragments that straddle
    neither. A number that lives only inside a chart image will never pass a
    substring search — record that, never "correct" it to a greppable wrong
    one. WebFetch's extractor both invents text and denies text that is
    present: its prose is not evidence in either direction.

## How to end (required)

End by writing a file named `RESULT.md` at the root of this worktree. Its
**first line** must be exactly one of:

- `done` — you attempted the outcome; the diff is your claim.
- `blocked: <one-line reason>` — the task could not be done honestly
  (missing information, an acceptance check that cannot be met, a forbidden
  action). This is a **successful** outcome, recorded as such. Reporting
  blocked is always better than producing something plausible.
- `capacity` — you observed your own provider's limit.

Everything after the first line is free-form notes; nothing reads them
mechanically. Write no other status anywhere: this file is the only channel.
If `RESULT.md` is absent or its first line is not one of the three forms, the
run is recorded as interrupted — the work is kept on the branch and resumed
later, and no retry is consumed.

## Relevant spec excerpts

These are the rules this work is judged against. They are excerpts targeted at
this job type (targeted; relevant material was omitted or cut — the full files are in this worktree at the paths named below, read them if you need the omitted or complete text).

 ### From `specs/loop` (full text: `D:/AddictedtoAI/openspec/specs/loop/spec.md`)

### Requirement: Breakers halt the loop, and only the named ones

Each of these SHALL write a `HOLD.md` at the repository root with the reason
and stop the Desk (the Pulse keeps running except where noted):

1. Three consecutive failures of the same job type — a failure is a job
   whose outcome is `failed` (gates or review rejected finished work) or
   `discarded` (rejected twice); `blocked`, `interrupted`, `capacity`, and
   `abandoned` outcomes never count toward this breaker.
2. The published site failing to build or deploy (Pulse halts deploy step
   too).
3. Any attempt to publish work that skipped review.
4. Any attempted edit to a reserved path — the reserved paths are exactly:
   `openspec/specs/`, `data/config.json` (budget bounds, job caps,
   degradation thresholds, publish flag), `runners.yml`, `STOP`, and
   removal of `HOLD.md` by the loop itself. The maintainer edits these
   freely; no job may.

`HOLD.md` is the loop's self-halt for things needing the maintainer; the
`STOP` file is the maintainer's brake. The loop MUST NOT remove either. No
other condition halts the loop; in particular, capacity exhaustion pauses
(see above) and empty queues end runs normally.

#### Scenario: Repeated failure stops the bleeding

- **WHEN** three consecutive `post` jobs fail review twice each
- **THEN** the Desk writes `HOLD.md` naming the pattern and stops, leaving
  the Pulse running

---

### PENDING AMENDMENT to `specs/loop` — in-flight change `two-desks-work-orders-and-trains`
(full text: `D:/AddictedtoAI/openspec/changes/two-desks-work-orders-and-trains/specs/loop/spec.md`)

This is a **delta**, not a capability spec: `## ADDED Requirements` and `## MODIFIED Requirements` blocks, restating only the requirements the change touches. It is not archived into the constitution above and does not replace it. Treat it as the pending intent for the requirements it names — where it MODIFIES one that also appears above, the amendment is the newer text.

### Requirement: Breakers halt the loop, and only the named ones

Each of these SHALL write a `HOLD.md` at the repository root with the reason
and stop the Desk (the Pulse keeps running except where noted):

1. Repeated failure of the same **governing** job type — a failure is a job whose
   outcome is `failed` (gates or review rejected finished work) or `discarded`
   (rejected twice); `blocked`, `interrupted`, `capacity`, `abandoned` and
   `evicted-at-train` outcomes never count toward this breaker.
   **The count SHALL be taken over a window of the last five jobs of that type
   that either failed or reached `done`, tripping at three failures among them. The
   last five are the five most recently appended `done`/`failed`/`discarded`
   ledger entries for jobs of that governing type — completion order is the
   ordering.** A rule that walks the ledger backwards and stops at the first
   `done` mistakes that same append order for a stopping condition, and with
   more than one worker that order is append-as-you-finish.
   Four `repair` workers where the first, second and fourth fail and the third
   finishes in between produce `fail, fail, done, fail` and a consecutive count of
   **one** — three failures in four and no halt. Worse, it degrades in the wrong
   direction: the more concurrent work fails, the more likely a `done` is
   interleaved among the failures, so the breaker becomes *less* likely to trip
   exactly as the evidence for tripping it grows.
    **The window SHALL be drawn only from outcomes that are a failure or a `done`.**
    `blocked`, `interrupted`, `capacity`, `abandoned` and `evicted-at-train`
    neither count as failures nor occupy a slot in it — the same treatment they
    already have, for the same
   reason, and it matters more here than it did: `interrupted` is what lock
   contention produces, contention rises with the number of workers, and a window
   those outcomes could pad would be weakest under exactly the parallelism this
   count was strengthened for.
   **This changes the serial case too, and the change is intended.** A type
   alternating `fail, done, fail, done, fail` never trips a consecutive rule and
   trips this one. Three failures in five attempts at one kind of work is a signal
   worth halting on whether or not a `done` happened to land between them; a rule
   that a single `done` resets is a rule that measures spacing rather than rate.
2. The published site failing to build or deploy. The build this breaker reads is
   the **train's**, run on the tree that is about to advance `main`; a job's
   tripwire build failing is an ordinary gate failure for that job and not a halt.
   The Pulse halts its deploy step too. **A train build classified `pre-existing`
   SHALL NOT trip this breaker**: the same build is red on the pre-train commit,
   so it is not evidence that anything the Desk did broke the site, and halting on
   it would stop the Desk every night that a date-coupled check ages over
   midnight. The train is held, the condition is reported on every run, and the
   next train re-tests it.
3. Any attempt to publish work that skipped review.
4. Any attempted edit to a reserved path — the reserved paths are exactly:
   `openspec/specs/`, `data/config.json` (budget bounds, job caps, work-order
   bounds, train sizing, degradation thresholds, publish flag), `runners.yml`,
   `STOP`, and removal of `HOLD.md` by the loop itself. The maintainer edits
   these freely; no job may.

`HOLD.md` is the loop's self-halt for things needing the maintainer; the
`STOP` file is the maintainer's brake. The loop MUST NOT remove either. No
other condition halts the loop; in particular, capacity exhaustion pauses
(see above), empty queues end runs normally, an unreachable issue tracker
refuses rather than halts, and a merge evicted by a train reopens its work
rather than stopping the Desk.

**What a trip stops, with more than one worker running.** A halt SHALL stop
**selection and publishing**, and SHALL NOT kill work already in flight: up to one
fewer than the number of workers may still finish, be reviewed and merge onto the
integration branch after the halt is written. **None of them publish**, and that
holds by two mechanisms meeting rather than by one: the halt stops the train from
being started, and the publish step independently suspends publication while
`HOLD.md` exists. Those post-halt merges are ordinary unpublished merges on the
integration branch and SHALL be treated as such — a later train carries them, or
the eviction and rejection paths handle them, on exactly the terms any other merge
gets. Killing an author mid-invocation to make the halt instantaneous would
discard reviewed work to save nothing, since none of it can reach the remote.

#### Scenario: Repeated failure stops the bleeding

- **WHEN** three `post` jobs fail review twice each within the last five
  failure/`done` jobs of that governing type (failure = `failed` or `discarded`)
- **THEN** the Desk writes `HOLD.md` naming the pattern and stops, leaving
  the Pulse running

#### Scenario: A `done` finishing in between does not hide three failures

- **WHEN** four `repair` jobs complete and the ledger records, in append order,
  `failed`, `failed`, `done`, `failed`
- **THEN** the breaker trips on three failures within the window, and the `done`
  landing between them changes nothing about the count

#### Scenario: An evicted merge does not halt the Desk

- **WHEN** three consecutive trains each evict one merge of the same governing
  type
- **THEN** no `HOLD.md` is written on account of the evictions, and the reopened
  beads return through intake

#### Scenario: A nightly date-coupled red holds the train and writes no hold

- **WHEN** a train's build is red and the same build is red on the pre-train
  commit, on three consecutive nights
- **THEN** no `HOLD.md` is written on any of the three, each train is held and
  reported, and the Desk is still able to start

---

### From `specs/review` (full text: `D:/AddictedtoAI/openspec/specs/review/spec.md`)

### Requirement: Nothing model-written publishes unreviewed, and no run reviews its own output

Every job whose diff contains model-written or model-edited content (prose,
entry data changes beyond feed binding, machinery code) SHALL be reviewed
before merge. The reviewer SHALL be a separate invocation with a fresh
context and no edit rights — a different model where `runners.yml` clears
one for `reviewer`, otherwise the same model freshly invoked. "No edit
rights" is a mechanism, not an instruction: the loop SHALL discard any
change a reviewer invocation makes to the reviewed tree, and the only
output it accepts from a reviewer is the verdict record, written to a
designated path outside the reviewed worktree. The authoring run and the
reviewing run are never the same session; self-review is not review.

**The one exemption:** deterministic outputs of already-reviewed machinery —
Pulse feed refreshes, derived tables, computed banners, the derived queue —
publish without per-run review, because the machinery that produces them was
reviewed when it merged and they contain no model judgment. Anything a model
wrote in the run is never inside this exemption.

#### Scenario: Fresh eyes or no merge

- **WHEN** a job finishes with a diff containing model-written prose
- **THEN** the merge is blocked until a separate reviewer invocation returns
  an explicit verdict on that diff

#### Scenario: The Pulse publishes data without review

- **WHEN** the Pulse's scheduled run updates the model catalog from a feed
  and rebuilds
- **THEN** no review is required, because no model wrote anything in that
  run
