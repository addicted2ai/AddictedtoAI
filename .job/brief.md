# Job j-20260907-29 — `repair`

You are working alone, unattended, in a git worktree checked out on branch
`job/j-20260907-29`. Everything you need is in this file and in the repository around
you. There is no prior conversation to recall and no session to resume.

- **Branch**: `job/j-20260907-29`
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
- **Work source**: queue

## The outcome

Clear the 3 carried findings on content/wiki/org/poolside.md

- **Target**: `content/wiki/org/poolside.md`

3 findings carried by reviewers against `content/wiki/org/poolside.md`, batched into one job because they concern the same file. Each is stated below in the reviewing reviewer's own words. Fix every one, or say in `RESULT.md` which you did not and why — a finding you leave standing must keep its file.

### "Not one of the eight rivals is in that class" overreaches — three publish no size

Carried in `data/carried/j-20260906-05-carry-1.md`.

The body asserts "Not one of the eight rivals in its own comparison table is in that class". The entry's own transcluded `comparison_table_sizes`, rendered in the next breath, says five rivals publish a size (Tencent Hy3 295B-A21B, Nemotron 3 Ultra 550B-A55B, Inkling 975B-A41B, DeepSeek-V4-Pro Max 1.6T-A49B, Kimi K3 2.8T-A50B) "and Qwen 3.7 Max, Muse Spark 1.1 and Claude Fable 5 carrying an em dash where a size would go". For those three the size is undisclosed, not known-to-be-larger, so the sentence claims more than the table shows. "Not one of the five that publishes a size is in that class, and three publish none" is exact and no weaker. Carried rather than blocked because the transclusion immediately below discloses the em dashes, so the reader can see the gap. Re-filed from the pass-1 record, confirmed here against the entry's own front matter.

### Restore the vendor's hedge to the weight-class quote

Carried in `data/carried/j-20260906-05-carry-2.md`.

`weight_class_claim` quotes "the most capable agentic coding model in its weight class by a wide margin" and labels it "the vendor's own bolded comparison", which is honest and not a misquotation. But the served sentence is "Laguna S 2.1 is, as far as we can measure, <strong>the most capable agentic coding model in its weight class by a wide margin</strong>." — confirmed by fetching https://poolside.ai/blog/introducing-laguna-s-2-1 on 2026-09-06 (HTTP 200, 465,772 bytes) and finding "as far as we can measure" twice, once in the rendered HTML and once in the Sanity block payload as a span reading "Laguna S 2.1 is, as far as we can measure, ". Dropping that clause makes Poolside sound more absolute than it was, in a paragraph whose whole argument is about the vendor's hedging. Adding it to the fact value costs nothing. Re-filed from the pass-1 record, confirmed here by my own fetch.

### Say "repository" on the two bare parenthetical dates in the licence paragraph

Carried in `data/carried/j-20260906-05-carry-4.md`.

The licence paragraph establishes a repository-creation frame ("Laguna XS.2's repository went up on 23 April 2026 ... Laguna M.1's on 15 June") and then drops the noun for the next two: "Laguna XS 2.1 (20 June) is openmdw-1.1 and Laguna S 2.1 (13 July) is ...". Both parentheticals are Hugging Face createdAt dates and both are correct, but a reader landing mid-paragraph reads them as release dates, and the announcements were 2 July and 21 July — dates the entry's own timeline carries three rows apart from these. Not a false claim; a dropped qualifier on a number the entry states twice under two different meanings. "XS 2.1's repository (20 June)" would close it.

### Retiring these findings

These files' presence is what puts the findings in the Pulse's derived queue. Delete the file for each finding you fixed, in the same diff as the fix — that is what removes the item, and a file left in place puts the same finding back on the next Pulse run:

- `data/carried/j-20260906-05-carry-1.md`
- `data/carried/j-20260906-05-carry-2.md`
- `data/carried/j-20260906-05-carry-4.md`

This is **one job with one outcome**. It ends in exactly one merge or one
discard. Do not widen it: a diff that exceeds the stated outcome is a
`scope-violation` at review and the whole job is rejected for it.

## Acceptance checks

- The specific broken thing is fixed, and the fix was verified by running the check that found it.
- The diff touches only what the repair needs.
- If the underlying resource is genuinely gone, record that as the finding rather than inventing a replacement.
- The branch still passes every gate the loop runs on it before review:
  `npm run test`, `npm run build`, `node scripts/verify-surfaces.mjs`, `node scripts/verify-design.mjs`. This list is
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
and a `repair` job's flagged proposal is counted exactly as before. A proposal on a branch that
is DISCARDED dies with the branch: ideas do not
outlive the rejection of the work that produced them. At merge the loop stamps
this job's type (`repair`) onto each kept proposal, overwriting whatever you
wrote there, and a proposal whose stamped origin type equals the type it proposes
is auto-discarded with a pointer to the self-amplification rule — so this job
cannot propose another `repair`. Noticing across types is the designed path.

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
this job type (targeted and truncated — the full files are in this worktree at the paths named below, read them if you need more).

### From `specs/pulse` (full text: `D:/AddictedtoAI/openspec/specs/pulse/spec.md`)

4 requirements omitted here: the pending amendment below restates them in full. Quoting both would spend the excerpt budget on superseded text and hand you two versions of one rule.

### Requirement: Freshness is computed, staleness cannot hide

The Pulse SHALL compute, every run: which cited facts are past their
volatility interval, which tutorials are past `reverify_days` (and past
2×, for demotion), which directory listings failed verification, which
links in the corpus are broken (rolling, every link at least every 30
days), and which declared feed rows have vanished (a row id an entry's
`feeds` map declares that is absent from the latest snapshot — the state
behind the last-known-value rendering in `wiki`). All staleness display
(overdue markers, tutorial banners, demotions, could-not-verify marks,
vanished-row as-of dates) derives from this computation at build time.

Additionally: a source or extractor that has reported "no change" for 3×
its registry-declared `expected_change_days` (not its fetch cadence — the
two are different fields) SHALL be flagged suspect, its dependent facts
switching from displaying "last checked" to "last changed", so a silently
broken fetcher cannot make the site look fresher than it is.

#### Scenario: A silent extractor is caught

- **WHEN** a source known to change roughly weekly reports no change for
  three weeks
- **THEN** its facts display "last changed <date>" instead of "checked
  <recent date>", a suspect flag renders on affected pages, and a repair
  finding enters the derived queue

### Requirement: A run's computed state is committed whether or not it is published

A Pulse run computes state — the changed feed, the source snapshots, the
link-check record, the derived tree, and the lifecycle appends it wrote into
entries — and the publish step is the only thing that commits any of it. That
state SHALL be committed on every run that produced it, **whatever `publish`
says and whether or not a `HOLD.md` stands**. Only the push and the deploy
verification are gated by the flag.

The reason is measured, not theoretical. With the flag held down — which this
repository's own guidance recommends while a larger change is in flight — a run
appended a line to `data/changes.jsonl` and left it uncommitted; the work queue
was derived from that working tree and offered a job for the new line; the Desk
branches from committed `main`, could not see the record, and correctly reported
itself blocked after 15.47 model-minutes. A run's state belongs in git the
moment it is computed.

- The commit SHALL stage **only what the run can attribute to itself**: paths
  the run declares as its own writes, plus paths with exactly one engine writer
  in this repository. A dirty path the run did not write SHALL NOT be staged,
  and SHALL be named in the log as skipped rather than silently dropped.
- A caller that **declares nothing** SHALL commit nothing outside a publishing
  run. An unattributable wholesale stage on every run would be a new hazard
  invented while fixing an old one, and a caller that cannot attribute its
  writes has no claim on this behaviour.
- **For a caller that declared its writes**, an uncommitted file under
  `content/` that the run did not write SHALL stop **both** the commit and the
  push, naming the files. The build gate catches work that is broken; it cannot
  catch work that is merely unfinished, so the step errs toward doing nothing
  rather than deciding for that file's author. A caller that declared nothing
  cannot tell that file from its own and SHALL NOT be refused on it: on a
  publishing run it stages wholesale exactly as it always has, and SHALL name
  each such file in a warning instead. That asymmetry is the standing cost of
  not declaring — it is the blast radius `addictedtoai-ps3` recorded, left
  deliberately unchanged rather than narrowed silently — and it is why the
  Pulse declares.
- A `HOLD.md` SHALL suspend the push and the deploy verification **only**, and
  SHALL NOT suspend the commit — the hold file's own text says the Pulse keeps
  running and only its deploy step is suspended. Nothing in this step SHALL
  remove the hold file; clearing a hold is the maintainer's.
- A commit the repository refuses — a hook, an unconfigured identity — SHALL be
  reported, SHALL leave the run's state in the working tree, and SHALL stop the
  push, because a run that could not commit its own state has nothing it can
  honestly publish. It SHALL NOT abort the run: this step now runs on every
  scheduled Pulse, and a refused commit is not a reason to take the pipeline
  down.
- A dry run SHALL commit nothing.
- The step SHALL run **after** the site rebuild, so a run that produced content
  the build rejects neither commits nor publishes it. This ordering is
  load-bearing for both halves and is the only thing standing between an
  unattended run and a broken live site.

#### Scenario: A run that does not publish still commits what it computed

- **WHEN** the Pulse runs with `publish: false` and the run wrote state of its
  own
- **THEN** that state is committed locally, nothing is pushed, and the work
  queue the run derived describes a tree the Desk can branch from

#### Scenario: A hold suspends the deploy, not the record

- **WHEN** `HOLD.md` stands and the Pulse runs
- **THEN** the run's own state is committed, no push is attempted, and `HOLD.md`
  is still there afterwards

#### Scenario: Somebody else's work in progress is still theirs

- **WHEN** the run's own derived output and an unrelated half-finished edit are
  both dirty in the same tree
- **THEN** only the run's own output is committed, and the other file is left
  unstaged and uncommitted

#### Scenario: An undeclared caller commits nothing

- **WHEN** a caller that declared no writes of its own invokes the step on a run
  that is not publishing
- **THEN** nothing is staged and nothing is committed

#### Scenario: Unfinished prose stops both halves for a caller that declared its writes

- **WHEN** a run that declared its own writes finds a file under `content/`
  uncommitted that it did not write
- **THEN** neither the run's own state nor that file is committed, nothing is
  pushed, the refusal names the file, and the disabled line still prints if the
  flag is false

#### Scenario: An undeclared caller is warned about it, not refused

- **WHEN** a caller that declared no writes publishes with the same foreign
  file under `content/` uncommitted
- **THEN** the file is named in a warning and the wholesale stage and push
  proceed, because a caller that cannot attribute its own writes has no ground
  to refuse on somebody else's

#### Scenario: A refused commit is reported, not fatal

- **WHEN** the repository refuses the run's commit
- **THEN** the step says so, the state stays in the working tree, no push is
  attempted, and the run continues to its end

#### Scenario: A failed build reaches neither half

- **WHEN** the site rebuild fails
- **THEN** the publish step does not run at all: nothing is committed and
  nothing is pushed

### Requirement: A row whose slug is already taken is a finding, not a silent refusal

Minting is how a live feed row becomes a stub the corpus can carry. It refuses,
correctly, when the slug it would mint at is already occupied by an entry that
does not declare that row — two different things must never collapse into one
page. But a refusal that only ever declines leaves one case permanently
invisible: an entry retired when its row vanished has had its `feeds:` binding
removed, and if that row later re-lists, the mint refuses forever and nothing
ever says so. The row is live in the world, absent from the site, and silent in
every report.

- The queue SHALL produce a finding for a row that is **live in a minting
  source's latest snapshot**, **undeclared** by any entry, and whose **expected
  mint path is occupied** by an entry that does not declare it. All three
  conditions SHALL hold; any one of them alone is an ordinary state that must
  not fire. Implemented by `findSlugCollisions` in `pulse/lib/mint.mjs`,
  threaded as `slug_collisions` through `pulse/lib/freshness.mjs`, and produced
  as reason `slug-collision` in `pulse/lib/queue.mjs`; measured by
  `pulse/tests/mint.test.mjs`, `pulse/tests/freshness.test.mjs` and
  `pulse/tests/queue.test.mjs`.
- The Pulse SHALL NOT edit the corpus in response, and SHALL NOT choose between
  the two readings of the collision — "the binding was removed and should be
  restored" and "these are genuinely two different things" — which is a
  judgment about the world that belongs to a repair job with a reviewer, not to
  a model-free engine. The finding SHALL carry what was observed and stop there.
- A row that is genuinely still absent SHALL NOT produce this finding. The
  distinction is the occupied path: a row with nowhere to land is an ordinary
  unminted row, and reporting it here would bury the real case in the noise of
  every row the corpus has not yet chosen to carry. Measured as the negative
  case in `pulse/tests/mint.test.mjs`.

#### Scenario: A re-listed row whose entry was retired becomes work

- **WHEN** a row absent long enough for its entry to be retired — its `feeds:`
  binding removed — re-appears in the latest snapshot, and the slug it would
  mint at is that retired entry's
- **THEN** the queue holds a `slug-collision` item naming the row, the source
  and the occupying entry, and nothing in the corpus has been edited

#### Scenario: An ordinary unminted row is not a collision

- **WHEN** a live undeclared row's expected mint path is free
- **THEN** no `slug-collision` finding is produced, and the row is treated as
  the ordinary unminted row it is

#### Scenario: A declared row is not a collision

- **WHEN** a live row's expected mint path is occupied by an entry that DOES
  declare that row
- **THEN** no finding is produced — that is the normal bound state, not a
  collision

### Requirement: The Pulse runs to completion with zero model access

The Pulse SHALL be a single ordinary command (`node pulse/run.mjs`) that
performs, in order: stop-file check, source fetching, snapshot/hash/diff,
data-layer update (including mechanical stub minting and lifecycle timeline
appends, defined below), rolling link check, freshness computation,
derived-queue recomputation, site rebuild, and the **commit-and-publish** step
(defined below), whose commit half runs on every run and whose push and deploy
verification run only when publishing is enabled. **Every step in that list runs
on every run**: none is conditional on the `publish` flag, which governs the
second half of the last step and nothing else. It SHALL contain no model
invocation on any path and SHALL run to completion on a machine with no model
credentials of any kind. It SHALL be safe to run on any schedule (idempotent
between world changes) and SHALL never prompt interactively. The zero-model
property is verified by running it in an environment with all model-related
environment variables unset: `node pulse/run.mjs` completes with exit code 0.

#### Scenario: No credentials, full run

- **WHEN** the Pulse runs on a machine with no model provider credentials
  configured
- **THEN** it completes every step and exits 0

#### Scenario: The stop file halts everything

- **WHEN** a file named `STOP` exists at the repository root
- **THEN** the Pulse exits immediately, doing nothing, and prints that the
  stop file is present

### Requirement: A carried finding is queue state, and its file is the state

A reviewer cannot fix what it finds — its worktree is discarded, as a
mechanism. `specs/review` therefore has it write non-blocking findings into the
verdict record. This requirement is the other end of that path: what turns a
recorded finding into work the Desk can actually select.

The queue is derived and never accumulates, and a carried finding does not
weaken that. The finding's **file is the state**: `data/carried/` holds one file
per carried finding, the queue reads that directory every run, and the item
exists for exactly as long as the file does. Nothing accumulates in the queue
itself, which is still recomputed from scratch on every run.

The unit of STORAGE is one finding; the unit of WORK is one **subject**. A
reviewer reads one file closely and notices several things about it at once, so
findings arrive in clusters by construction — measured 2026-09-03, 27 standing
findings on 16 subjects, the largest holding four. Dispatched one per file that
is four jobs rebuilding the same context around the same page and four review
passes over the same paragraphs. Batching them changes neither the state nor
its retirement, only how many jobs the same backlog costs to drain.

- On merging a job whose verdict record carries `carry:` entries, the loop SHALL
  write one file per entry into `data/carried/`. Implemented by
  `transcribeCarriedFindings` in `loop/lib/carry.mjs`, called from
  `loop/run.mjs`.
- The derived queue SHALL read `data/carried/` on every run and produce one item
  per **subject**, holding every finding that names it. A finding declaring no
  subject keys on its own path and therefore groups with nothing. Implemented by
  the carried-finding class in `pulse/lib/queue.mjs`.
- A batched item SHALL state each finding in the reviewing reviewer's own words,
  name the file that carries it, and name every file to delete. A finding whose
  file survives the job is still a finding: a partially-fixed subject reappears
  next run holding exactly the findings whose files remain, which is the same
  presence-is-the-state rule applied to a group.
- A carried finding SHALL rank **below** every finding derived from the world or
  from the corpus's own declarations. It is one reviewer's judgment about
  something it chose not to block on, which is the weakest evidence any queue
  item rests on, and ranking it with measured staleness or a broken link would
  let opinion outrank observation. Implemented as rank 25 in
  `pulse/lib/queue.mjs`. The carried block SHALL NOT be ordered by how many
  findings an item holds: putting the largest batch permanently at the head of
  the block is how an item that cannot retire starves everything beneath it.
- Retirement SHALL be by **deletion of the file**, performed by the fixing job's
  own diff, and SHALL NOT require any merge-step bookkeeping. A retirement that
  depended on a separate step recording "this one is done" is how a high-rank
  item becomes permanently un-retirable and blocks everything beneath it
  forever; that failure has happened here and is not to be repeated.
- A carried finding SHALL NOT be a second route to publication. The job that
  takes it is an ordinary job under every ordinary rule: selection, budget, and
  the review gate on whatever it produces.

#### Scenario: A carried finding becomes selectable work

- **WHEN** a merged job's verdict record carried a `carry:` entry and the next
  Pulse run recomputes the queue
- **THEN** the queue holds one item for that finding's subject, ranked below the
  world-derived and declaration-derived findings

#### Scenario: Several findings on one file are one job

- **WHEN** four verdict records have carried findings all naming the same
  subject and the next Pulse run recomputes the queue
- **THEN** the queue holds one item for that subject, stating all four findings
  and naming all four files to delete — not four items against the same page

#### Scenario: The fixing job's own diff retires it

- **WHEN** a job takes a carried finding, fixes it, and its merged diff deletes
  that finding's file
- **THEN** the next run's queue simply does not contain the item, with no
  retirement step having recorded anything

#### Scenario: A batch is fixed in part

- **WHEN** a job takes a subject holding three findings, fixes two, and deletes
  only those two files
- **THEN** the next run's queue holds that subject's remaining finding alone,
  under its own title, with nothing recording that the other two were done

#### Scenario: An unfixed finding is still there tomorrow

- **WHEN** no job has taken a carried finding and its file is still present
- **THEN** the item is produced again by the next run's recomputation, at the
  same rank, having accumulated nothing

# pulse Specification

## Purpose
The Pulse is the deterministic, model-free engine: fetch, snapshot, hash,
diff, link-check, freshness, derived queue, rebuild. It runs on a clock,
costs HTTP and arithmetic, and keeps the site alive when no inference exists
at all.

## Requirements

### Requirement: Sources live in a registry and refusals are data

Every external source the Pulse fetches SHALL be declared in a checked-in
source registry recording: URL, what fields it yields, which of its fields
is the row id (the join key entries declare — see `wiki`), fetch cadence
(`fetch_every_days`), expected change cadence (`expected_change_days` — how
often the source's content actually changes, the input to the
suspect-source computation), and its robots/terms status (checked before
the source entered the set). A source
that refuses (403, 429, terms) SHALL be recorded as refusing with the date —
never routed around, never retried aggressively, never scraped through a
side door. The registry at launch SHALL include at least the OpenRouter
models API and one release/retirement tracker; adding or removing a source is
an ordinary data change, not an OpenSpec change.

A source entry MAY additionally declare a **companion fetch**: a second URL,
templated from a row of that source's own snapshot and fetched once per covered
**key** — the value the template is keyed on, which may cover several rows —
with its own cadence, its own snapshot, under the source's robots/terms record
re-checked as the third bullet requires. It exists for the case where the
row-level feed carries a value whose referent is only recoverable per row.

- A companion fetch SHALL declare: its URL template, its cadence, the rule that
  computes which rows it covers, the snapshot it writes, **the local date it was
  declared on (`declared_on`)**, **which service tier of the companion listing is
  canonical for this source**, **the field of a companion-listing row that
  carries the provider identity (`provider_field`)**, and **an author-identity
  map giving, for each author segment of this source's row ids, the provider
  slug that author posts under in the companion listing, each entry carrying the
  local date it was declared on**. A declaration missing any of these SHALL fail
  the build naming the source and the missing field. `declared_on` is what the
  robots re-check is dated against; the canonical tier is what a bound rate is
  resolved at, and a companion with none declared can bind nothing.
  `provider_field` exists because a bare provider slug is not a field this
  source's own listing carries: measured on this source's `/endpoints` response
  (`data/reviews/j-20260902-01.md:93`), an endpoint is
  `{"provider_name":"Anthropic","tag":"anthropic/fast", ...}` — no field named
  a slug alone — while `provider_slug`/`service_tier` exist only in a different
  fetch (the model page's embedded payload) and disagree with the tag's own
  suffix there on the same endpoint (`service_tier: "priority"` against a tag
  ending `/fast`), so that field is not read here. **A `provider_field` value
  SHALL be read as the provider slug and the tier by splitting it on its first
  `/`: the text before the `/` is the provider slug and the text after it is
  the tier; a value with no `/` names the provider slug alone and denotes that
  provider's own standard tier** — the reading this site's own measured tier
  spread already uses the word for
  (`data/price-attribution-debt.json`'s `residual_hazard`: `openai` bare priced
  at 1×, `openai/flex` at 0.5×, `openai/fast` at 2×). The identity map is what
  stops an attribution resting on two namespaces happening to spell a vendor the
  same way: both sides of every map entry SHALL be machine keys — an author
  segment and a provider slug as read by that rule — never a display name, and
  the map SHALL NOT be consulted for anything but that comparison.
- A companion fetch SHALL declare its covered rows as a rule over the source's
  own snapshot — a field test and a key — and the covered set SHALL be
  computable from the snapshot alone rather than being a list somebody maintains
  by hand. The build SHALL refuse a declaration that enumerates row ids: a
  hand-maintained list silently stops covering rows the feed adds, and a coverage
  gap that nothing can detect is how an absent value becomes indistinguishable
  from an unasked question.
- A companion fetch SHALL NOT be enabled until the source's robots/terms record
  has been **re-checked at the new volume**: re-fetched, re-dated, and stating
  the request rate the site will actually make as a number the build can compare
  — `robots.requests_per_day`, an integer. The build SHALL refuse a companion
  declaration whose source's `robots.checked_on` is earlier than the
  declaration's `declared_on`, whose `robots.requests_per_day` is absent, or
  whose `robots.requests_per_day` is less than the number of companion requests
  the coverage rule yields from the latest snapshot — one per distinct key, not
  one per covered row. A number no smaller than what the site will actually
  request is the only form of this claim a build can check; prose in
  `robots.detail` stating a volume is a sentence, and no test can tell a true
  one from a stale one.
- A companion fetch's failures SHALL be per **key** and SHALL NOT fail the run: a
  key whose companion fetch errors or refuses SHALL yield an absent value,
  recorded with its date, for every row that key covers — on the same terms as
  any other absence — and every row under a different key SHALL be unaffected.
  A key covers however many rows share it, and the fetch that failed was the
  one call made on that key's behalf; there is no per-row fetch beneath it to
  fail independently.

#### Scenario: A refusal is recorded, not routed around

- **WHEN** a registered source starts returning 403
- **THEN** the Pulse marks it refusing with the date, stops fetching it at
  normal cadence (retrying at most daily), keeps serving its last snapshot
  with the snapshot's date visible, and files a repair finding in the
  derived queue

#### Scenario: A companion fetch cannot be switched on behind an old robots check

- **WHEN** a source declares a companion fetch and its robots record's
  `checked_on` is earlier than the declaration's `declared_on`, or carries no
  `robots.requests_per_day`, or carries one smaller than the number of distinct
  keys the coverage rule yields from the latest snapshot
- **THEN** the build fails, naming the source and which of the three it failed,
  and no companion request is made

#### Scenario: A companion declaration missing a required field is refused

- **WHEN** a companion declaration omits any one of its URL template, its
  cadence, its coverage rule, the snapshot it writes, `declared_on`, its
  canonical tier, its `provider_field`, or its author-identity map
- **THEN** the build fails, naming the source and the missing field, and no
  companion request is made

#### Scenario: A hand-maintained coverage list is refused

- **WHEN** a companion declaration expresses its covered rows as a list of row
  ids rather than as a rule over the snapshot
- **THEN** the build fails, naming the source, and no companion request is made

#### Scenario: A bare `provider_field` value denotes the standard tier

- **WHEN** an endpoint's `provider_field` value carries no `/`
- **THEN** it is read as the provider slug alone, at that provider's own
  standard tier, on the same terms as `openai` bare in the site's own measured
  tier spread

#### Scenario: A different fetch's field is never read for identity

- **WHEN** a companion-listing endpoint carries `provider_slug`/`service_tier`
  fields that disagree with its own declared `provider_field` value
- **THEN** the identity and the tier are read from `provider_field` alone, and
  the disagreeing fields are not consulted

#### Scenario: One key's companion failure is every row that key covers, absent

- **WHEN** a companion fetch returns an error for one covered key and succeeds
  for the rest
- **THEN** every row that key covers has an absent companion value with its
  date, every row under another key is unaffected, and the run completes

### Requirement: The Pulse publishes what it builds

A local rebuild is not publication. Publishing is a named pipeline step,
controlled by the `publish` flag in `data/config.json`:

- **When `publish` is `true`** (the operating phase): after a successful
  rebuild, the Pulse SHALL commit its data and content changes and push
  `main` to the remote (deploy = push; the host builds and serves). It SHALL
  then verify the deploy by fetching the live site's build stamp (see `site`)
  and confirming that the stamp identifies **the commit this run pushed, or a
  commit that contains it** — the pushed SHA read from the repository *after*
  that commit exists, the stamp read as a hexadecimal abbreviation, resolved
  through the local repository to a commit object, and accepted only when the
  pushed commit is that commit or an ancestor of it. The step MAY perform one
  read-only `git fetch origin main` before resolving, so that a stamp naming a
  commit another actor pushed can be resolved at all: a fetch reads the git
  remote it has just pushed to and is neither a hosting-provider call nor a
  GitHub API call, and it changes nothing outside the local object store. A
  stamp still unresolvable after that fetch SHALL fail closed. The question the
  check asks is whether the bytes this run pushed are being served; a later
  commit that contains them serves them. The
  expected value SHALL NOT be read from the local build's own `status.json`:
  that file is written during the rebuild, which happens before the commit, so
  it names the *previous* commit and a check against it confirms the previous
  run's deploy forever. A stamp that merely changed SHALL NOT satisfy the check,
  and neither SHALL one that resolves to no commit the local repository can
  name: an unresolvable stamp is not evidence of anything and the check SHALL
  fail closed on it.
- **The first budget is not the verdict.** The Pulse SHALL poll for at least 10
  minutes, and where that budget elapses with no match it SHALL poll a **second,
  confirmation window of at least three times the first** before treating the
  deploy as failed. A commit that is not live after ten minutes and is live
  after thirty is a slow deploy, not a missed one, and the two SHALL NOT be
  recorded as the same fact. Only when the confirmation window also elapses is
  the deploy a failure: the Pulse SHALL then write
  `HOLD.md` naming the failure (breaker 2 in `loop`) and suspend further publish
  attempts until the hold clears. Detection is by fetching the live page only —
  no hosting-provider API, no GitHub API; the read-only `git fetch` above
  resolves a stamp against the git remote and is not part of that detection.
- **The hold SHALL name which failure it is**, from a closed and exhaustive set
  computed from the stamps the run actually read. A **reading** is one read of
  the live build stamp taken during the two polling windows — that is, after the
  push. The pre-push baseline is not a reading: it is the value the readings are
  compared against, and a run that read the baseline and then read nothing
  afterwards observed nothing at all about its own deploy. The classifications
  are decided in this order: `unreadable` — no reading succeeded; `never-advanced`
  — at least one reading succeeded and every reading that succeeded returned the
  stamp that was live before the push; and `advanced-elsewhere` — every other
  outcome. The third is written as the complement on purpose: a stamp that was
  unreadable before the push and readable after, one that moved to `unknown` or
  a bare timestamp, and a run whose readings disagreed with each other are each
  neither of the first two, and a classification with a gap in it hands its
  reader a hold that says nothing. The hold SHALL carry the pushed commit, the
  last stamp read, both window durations, and the classification. The three have
  different causes and different recoveries, and a hold that does not say which
  one it is makes its reader re-measure what the run already knew.
- **A deploy hold SHALL be machine-identifiable as one.** The publish step SHALL
  write into `HOLD.md`, on its own line, a marker naming the commit the hold is
  about and the classification. `HOLD.md` has other writers — the Desk's
  consecutive-failure, red-build, review-bypass and reserved-path breakers all
  write it and not one of the four is about a commit — and a re-test that could
  not tell them apart would be asking whether a commit is served on a hold that
  names no commit.
- **A standing deploy hold SHALL be re-tested, and the re-test SHALL take no
  outward action.** On every invocation of the publish step that finds a standing
  hold **carrying that marker**, the Pulse SHALL read the live build stamp once —
  no push, no commit to the remote, nothing that changes the world beyond the
  read-only resolution above — and SHALL append one dated observation to
  `HOLD.md` recording whether the commit the marker names is now served, under
  the same containment test the check uses. It SHALL append at most one
  observation per invocation and SHALL NOT rewrite an earlier one, so the file
  records how long the condition persisted. A standing hold carrying no such
  marker SHALL NOT be re-tested and SHALL NOT be appended to: it was written by
  another brake, about something else. **A dry run SHALL append nothing.** Where
  the publish step is invoked in dry-run mode and a marked hold stands, it SHALL
  read the live build stamp and print the observation it would otherwise append,
  and SHALL leave `HOLD.md` byte-identical — a dry run that mutates a guardrail
  file has contradicted the only thing it promises, and the hold branch is
  reached before the dry-run branch, so the exemption has to be stated where the
  re-test is. Under `publish: false` no re-test is performed and nothing is
  printed or appended for the hold: the disabled line is the whole of that run's
  report, and the re-test is part of deploy verification, which that mode
  performs none of.
- **The re-test SHALL NOT clear, weaken or rewrite the hold**, and SHALL NOT
  resume publishing. Breaker 2 keys on the file's existence and this appends to
  it; a brake that releases itself is not a brake, and clearing a diagnosed halt
  stays what it already is — a decision taken by the maintainer, or by an
  orchestrator between runs, on the record the file now carries.
- **When `publish` is `false`** — a local-only mode: the flag stood at `false`
  for the whole build phase, the launch checklist flipped it to `true` on
  2026-08-29, and the maintainer may hold it down at any time while a larger
  change is in flight. The Pulse SHALL push nothing, SHALL perform no deploy
  verification, and SHALL print **exactly one line** stating that publishing is
  disabled. That line SHALL be printed on every such run, including a run that
  also had to refuse something else, so a stray dirty file cannot suppress it.
  Nothing else in the pipeline changes — **and the commit is part of "nothing
  else"**: it is a separately governed step which this flag does not gate (see
  "A run's computed state is committed whether or not it is published").

Without this step the site would rebuild locally forever while the live
domain stayed frozen; a Pulse run that completes without the live site
changing is not a success when publishing is enabled.

#### Scenario: An operating-phase run reaches the live site

- **WHEN** the Pulse runs with `publish: true` and the rebuild succeeds
- **THEN** the changes are committed and pushed, and the run's final step
  confirms the live build stamp now carries the commit this run pushed

#### Scenario: A later commit that contains this one is a landed deploy

- **WHEN** the live build stamp resolves to a commit that has the pushed commit
  as an ancestor — another publisher pushed on top while this run was polling
- **THEN** the check passes, because the bytes this run pushed are being served,
  and no hold is written

#### Scenario: The stamp has to name the commit, not merely differ

- **WHEN** the live build stamp changes to a value that is not a hexadecimal
  abbreviation of the pushed commit or of any commit containing it — an
  unrelated commit, `unknown` from a builder with no git, or a bare timestamp
- **THEN** the check does not pass, and the run treats the deploy as not landed

#### Scenario: A slow deploy is not a missed one

- **WHEN** the live stamp does not carry the pushed commit within the first
  polling budget and does carry it during the confirmation window
- **THEN** the deploy is reported as landed, no `HOLD.md` is written, and the run
  records that it took the confirmation window

#### Scenario: A deploy that does not land is a halt, not a shrug

- **WHEN** the push succeeds and neither the first budget nor the confirmation
  window sees a stamp carrying the pushed commit
- **THEN** the Pulse writes `HOLD.md` naming the deploy failure and makes
  no further publish attempts until the hold is cleared

#### Scenario: The hold says which failure it is

- **WHEN** every stamp read during both windows is the value that was live
  before the push
- **THEN** the hold records the classification `never-advanced`, the pushed
  commit and the last stamp read — distinguishably from a hold whose stamp moved
  to some other commit

#### Scenario: A run that read nothing after the push says so

- **WHEN** the stamp live before the push was read, and every reading taken
  during both polling windows failed
- **THEN** the hold records the classification `unreadable`, and does not report
  the stamp as unchanged since before the push

#### Scenario: A standing hold records that its cause has passed

- **WHEN** a deploy hold stands, a later push by another actor has deployed, and
  the publish step is invoked again
- **THEN** the step takes no outward action, appends one dated observation to
  `HOLD.md` saying the held commit is now served, and the hold file is still
  there afterwards

#### Scenario: A hold another brake wrote is left alone

- **WHEN** the Desk's reserved-path breaker has written `HOLD.md`, that file
  carries no deploy marker, and the publish step is invoked
- **THEN** no live stamp is read for it, nothing is appended, and the file is
  byte-identical afterwards

#### Scenario: A dry run observes a standing hold without touching it

- **WHEN** the publish step is invoked in dry-run mode while a marked deploy
  hold stands
- **THEN** the observation is printed, `HOLD.md` is byte-identical afterwards,
  and nothing is pushed

#### Scenario: The re-test does not resume publishing

- **WHEN** the re-test observes that the held commit is now served
- **THEN** nothing is pushed, the hold is not removed or altered apart from the
  appended observation, and the Desk still refuses to start

#### Scenario: Build phase publishes nothing

- **WHEN** the Pulse runs with `publish: false`
- **THEN** no push occurs, and the run log contains one line stating
  publishing is disabled

### Requirement: Registry ingest mints stubs and appends lifecycle events, mechanically

This is how "everything about AI" becomes payable: breadth arrives in the
data layer at zero inference cost. Two deterministic behaviors, both part
of the data-layer update step:

**Stub minting.** A source registry entry MAY declare a `mints` mapping
(the `kind` its rows become, and the deterministic slug derivation from
the row id — at launch exactly one source, `openrouter-models`, declares
one, with `kind: model` and the slug derived by normalizing the row id).
On each ingest of a minting source, every row whose row id is declared by
no entry's `feeds` map SHALL mint a stub entry file: deterministic id from
the mapping, `display_name` from the row, a `feeds` binding to that row,
the source's standard fact bindings (price, context, status), maintenance
class `living`, and every alias classed `manual` — an automatic process
never claims `exclusive`, so mechanical minting can never create a wrong
link (upgrading an alias class is entry-editing work for the Desk).
Minting **creates a new record; it never modifies an existing entry** —
that is the division of labor with the rule in `wiki` that an undeclared
row never touches an entry. A row whose id is already declared (by a stub
or a hand-authored entry) SHALL never mint again; a source without a
`mints` mapping feeds the catalog and changed feed only.

**Lifecycle timeline appends.** When a diff shows a **status** change for
a row that some entry declares, the Pulse SHALL append the dated, sourced
timeline event to that entry's front matter mechanically. Status changes
only — prices and other field changes live in the diff history, not the
timeline. This is deterministic data maintenance by reviewed machinery; no
model writes it, so it publishes under the review exemption.

#### Scenario: A new row becomes a stub, safely

- **WHEN** a minting source's snapshot gains a row no entry declares
- **THEN** the next data-layer update creates a stub entry with a `feeds`
  binding to that row and only `manual`-classed aliases, and a second run
  mints nothing further for that row

#### Scenario: Non-minting sources stay in the catalog

- **WHEN** a non-minting source's snapshot gains a new row
- **THEN** the row appears in the catalog and (if material) the changed
  feed, and no entry file is created or modified

#### Scenario: A status flip lands on the entry's timeline

- **WHEN** a declared row's status moves from `active` to `deprecated`
  between snapshots
- **THEN** the joined entry gains exactly one dated timeline event citing
  the source, appended mechanically, and a re-run appends no duplicate

### Requirement: Once per day, the Pulse queues the scout

- On each run, the Pulse SHALL derive a **scout item** into the work queue
  exactly when `data/ledger.jsonl` records no `scout` job started on the
  current local date — at most one item, computed from the ledger and the
  clock alone, so the derivation stays a pure function of current state
  and a re-run on the same day with a scout already recorded derives
  nothing.
- The item SHALL carry mechanically assembled context: the change feed's
  event lines from the trailing 7 days that no published post's `covers:`
  declarations include — a deterministic join, not a judgment, and an
  input to the scout rather than a bound on it (the scout's charge is the
  world beyond this repository; see `loop`).
- The scout item SHALL rank below confirmed-breakage repairs and
  corroboration disagreements and above routine timer-driven
  re-verifications: the site's claim to be true outranks discovery, and
  discovery outranks re-checking things that were true last week. The
  upkeep floor in `loop` keeps this ordering from starving upkeep — rank
  decides within a run; the floor guarantees upkeep's share across runs.

#### Scenario: One scout a day, mechanically

- **WHEN** the Pulse runs twice on one local date and the ledger records a
  `scout` job started that day before the second run
- **THEN** the second run derives no scout item, and the next local date's
  first run derives one

#### Scenario: The context is a join, not a judgment

- **WHEN** the trailing 7 days hold four event lines and a published post's
  `covers:` names one of them
- **THEN** the scout item carries the other three, with no score, no
  ordering beyond the feed's own, and no model invoked

#### Scenario: The Pulse still never judges

- **WHEN** the scout item is derived on any state
- **THEN** no model runs, and nothing in the item says which events are
  worth writing about — that question belongs to the scout job it triggers

---

### PENDING AMENDMENT to `specs/pulse` — in-flight change `keep-the-map-describing-the-territory`
(full text: `D:/AddictedtoAI/openspec/changes/keep-the-map-describing-the-territory/specs/pulse/spec.md`)

This is a **delta**, not a capability spec: `## ADDED Requirements` and `## MODIFIED Requirements` blocks, restating only the requirements the change touches. It is not archived into the constitution above and does not replace it. Treat it as the pending intent for the requirements it names — where it MODIFIES one that also appears above, the amendment is the newer text.

### Requirement: A surface's unmet declared coverage is queue input

Every other queue reason answers *the world changed* or *a timer elapsed*.
Neither can express that this site has declared an intention it has not met, so
nothing in the machinery has ever looked inward at the corpus's own stated
shape. Where a surface has a **curriculum of record** — a written enumeration of
the pages it intends to publish — the Pulse SHALL derive one queue item for each
enumerated page that `content/` does not publish.

- The item SHALL propose the job type that writes the surface — `education` for
  the learn surface, `tutorial` for the tutorial surface — and SHALL carry the
  reason `curriculum-gap`, ranked below every reason describing something broken
  or overdue and below `want-eligible-mint`. Nothing is wrong on any page because
  a page the site intends to write does not exist yet. One reason and one rank
  serve every surface: a missing walkthrough and a missing explainer are the same
  event, and a second reason for it would need a second argument for the same
  position in the rank table.
- The derivation SHALL be a set difference between two committed files and
  SHALL NOT score, rank, or otherwise judge either side. It is the same
  arithmetic a reader could do with two directory listings, and its result is
  falsifiable by doing so.
- Where a surface's own specification subordinates new work to upkeep, the
  derivation SHALL compute that subordination rather than leave it to whatever
  selects next. For the tutorial surface, no `curriculum-gap` item SHALL be
  derived while any published tutorial stands demoted for staleness and its
  subject entry is not `retired` or `dead`: a walkthrough the map merely intends
  is not work while a published walkthrough is telling readers it has gone
  unverified. A demoted tutorial whose subject is dead SHALL NOT suppress
  anything — archival is that tutorial's correct end state, so its demotion is
  not upkeep waiting to be done.
- The item SHALL retire by recomputation alone, like every other queue item:
  publishing the page removes it at the next run, with no close or archive
  action by anyone.
- The Pulse SHALL read the curriculum tolerantly. A curriculum that is absent,
  unreadable, or carries no catalog section SHALL yield no items and SHALL NOT
  halt the run — the engine must keep the data layer true on a day when the
  build would fail. This holds for every surface's map independently: an
  unreadable map on one surface SHALL NOT suppress the items derived from
  another's.

#### Scenario: A declared page nobody has written becomes work

- **WHEN** the curriculum enumerates a page whose slug has no file in
  `content/learn/`
- **THEN** the next queue carries one `education` item with reason
  `curriculum-gap` naming that slug

#### Scenario: A declared tutorial nobody has written becomes work

- **WHEN** the tutorial map enumerates a walkthrough whose slug has no file in
  `content/tutorials/`, and no published tutorial stands demoted
- **THEN** the next queue carries one `tutorial` item with reason
  `curriculum-gap` naming that slug, at the same rank the learn surface's items
  carry

#### Scenario: A demoted tutorial suppresses the surface's growth

- **WHEN** the tutorial map enumerates three unwritten walkthroughs and one
  published tutorial stands demoted for staleness with a live subject
- **THEN** the queue carries no `curriculum-gap` item of type `tutorial`, and it
  still carries the `tutorial-demoted` item for the demoted one

#### Scenario: A dead subject does not suppress growth

- **WHEN** the only demoted tutorial's subject entry has status `dead`
- **THEN** the tutorial gap items are derived normally, because re-verifying that
  tutorial is not the upkeep the subordination protects

#### Scenario: Writing the page empties the item

- **WHEN** that page is published
- **THEN** the next Pulse run's queue no longer contains the item, with no
  close or archive action by anyone

#### Scenario: A full map produces no work

- **WHEN** every enumerated page is published
- **THEN** the queue carries no `curriculum-gap` item, and that is a complete
  and healthy run rather than a failure to find work

#### Scenario: A missing curriculum is not a halt

- **WHEN** the curriculum of record is absent from the tree the Pulse is
  running against
- **THEN** the run completes, the queue carries no `curriculum-gap` item, and
  nothing is reported as broken

#### Scenario: One unreadable map does not silence the other

- **WHEN** the tutorial map is absent and the learn curriculum is intact
- **THEN** the run completes, the learn surface's `curriculum-gap` items are
  derived as usual, no `tutorial` gap item is derived, and nothing is reported
  as broken

---

### PENDING AMENDMENT to `specs/pulse` — in-flight change `let-the-queue-see-a-judgment`
(full text: `D:/AddictedtoAI/openspec/changes/let-the-queue-see-a-judgment/specs/pulse/spec.md`)

This is a **delta**, not a capability spec: `## ADDED Requirements` and `## MODIFIED Requirements` blocks, restating only the requirements the change touches. It is not archived into the constitution above and does not replace it. Treat it as the pending intent for the requirements it names — where it MODIFIES one that also appears above, the amendment is the newer text.

### Requirement: The work queue is derived, never accumulated

The Pulse SHALL recompute the loop's work queue from current state on every
run: overdue facts, overdue tutorials, failed verifications, broken links,
want-demand eligible mints, suspect sources, refusing sources, vanished
feed rows, pieces whose recorded review no longer matches the file, material
changes on price/licence/status fields from the
trailing 14 days that lack an interpretation annotation (the source
`interpret` jobs draw from — see `loop`), and the daily scout item (see the
scout requirement). The queue is a ranked snapshot (a generated file), not
a ledger: nothing is ever "filed" into it, it has no history, and it cannot
backlog — an item leaves the queue the moment the underlying state is
fixed, and the queue's size is bounded by the size of the site, not by
time passing. Discovered work that needs human judgment or does not map to
site state (a bug, an idea, a follow-up) goes to beads (`bd`) instead,
filed by whoever discovers it — the two never mirror each other.

#### Scenario: Fixing the state empties the queue

- **WHEN** an overdue fact is re-verified
- **THEN** the next Pulse run's queue no longer contains it, with no
  close/archive action by anyone

#### Scenario: The queue cannot grow monotonically

- **WHEN** the Pulse runs on a site whose state has not changed
- **THEN** the queue is identical to the previous run's — recomputation
  produces no accumulation

### Requirement: A review that no longer describes its file is work the queue can see

`lib/reviews.mjs` resolves every piece of content to the review record that
approved it and reports one of four states. `mismatched` — a record binds,
carries a hash for that path, and the file's reviewed surface now hashes to
something else — means a piece that was approved has since been edited outside
the review gate, and it fails the launch minimums.

- The Pulse SHALL derive one queue item for each piece whose review state is
  `mismatched`, reading that state from the **single** piece-to-record join
  `lib/reviews.mjs` exposes. It SHALL NOT compute a second resolution of pieces
  to records and SHALL NOT compute a second reviewed hash: one join is a
  standing invariant here, and a second one would disagree with the launch gate
  on the exact condition both are measuring.
- The item SHALL propose a `verify` job carrying the reason `review-mismatch`
  — a type already on the closed list of what the queue may produce, and a
  reason string `specs/loop`'s merge exception ("A review-mismatch job's
  merge binds by the item it was dispatched at, not by its diff") keys on
  verbatim — and SHALL name the piece, the record that binds it, and that
  record's date. The work is re-establishing that an approved surface still
  says what was approved, which is a check against a record rather than an
  authoring pass; typing it as `entry` would put it in the authoring budget
  category and shed it with authoring, on a condition that blocks every
  publish.
- The item SHALL rank above the corroboration disagreement, below every finding
  that reports a page already rendering something wrong — a demoted tutorial, a
  drifted reference — and below every finding that reports a dead or unreachable
  resource. The band is stated at both ends because it is not empty between them,
  and a rank chosen anywhere inside it would silently invert an ordering the rank
  table already declares. A lapsed approval is worse than two sources disagreeing
  about a number and less urgent than a page whose reader can see the defect or a
  resource that is gone.
- The item SHALL retire by recomputation alone: a newer record whose recorded
  hash equals the file's current reviewed hash removes it at the next run, with
  no close or archive action by anyone and no durable record of its own. This is
  the property that distinguishes it from a withdrawn feed row — that condition
  is permanent and needs a record of the answer, this one is repairable by the
  job that takes it, and inventing a store for it would create exactly the
  un-retirable high-rank item this spec twice says not to create.
- The states `unbound` and `missing` SHALL NOT produce this item, and the `no`
  is written rather than left as an omission. `unbound` means a record that
  predates byte-binding: it fails nothing, it is informative exactly as it was
  before, and turning every one of them into an item would flood the queue's cap
  with work nobody asked for. `missing` is the opposite finding — unreviewed
  rather than reviewed-then-changed — and has its own gate; a producer for it is
  a separate decision and is not taken here.
- Nothing in this requirement SHALL invoke a model or edit a piece of content.
  Comparing a recorded hash to a computed one is arithmetic, and which of the
  two is right is the job's question, not the engine's.

#### Scenario: An approval that stopped applying becomes selectable work

- **WHEN** a piece carrying a bound review record is edited so its reviewed
  surface hashes differently, and the Pulse recomputes the queue
- **THEN** the queue holds one `verify` item naming the piece and the record,
  ranked above the corroboration disagreement and below both the
  already-visibly-wrong findings and the dead-resource findings

#### Scenario: A fresh approval retires it

- **WHEN** a job re-reviews that piece and merges a record whose recorded hash
  equals the file's current reviewed hash
- **THEN** the next run's queue no longer holds the item, with no close or
  archive action by anyone and nothing recording that it was done

#### Scenario: Unbound records produce nothing

- **WHEN** the corpus holds many review records written before byte-binding
  existed, none of which carries a hash for its piece
- **THEN** the queue holds no item for any of them, and the run reports the
  unbound count exactly as it did before

#### Scenario: The queue and the launch gate cannot disagree

- **WHEN** the launch minimums report a piece as `mismatched`
- **THEN** the derived queue holds an item for that same piece, because both
  read the same join and the same hash

## MODIFIED Requirements

### Requirement: Declared corroborations are compared every run, and disagreement becomes work

The Pulse treats a source as truth by construction: it fetches, hashes, diffs,
and never adjudicates. That is right, and it is why nothing noticed when two
sources disagreed and the feed was the wrong one. Comparing a feed-bound value
against a cited value for the same quantity on the same entry is arithmetic, not
judgment, and it costs nothing on top of a run that already resolves both.

- Every Pulse run SHALL compare each pair declared by `corroborates` (see
  `wiki`), resolving the feed-bound side from the latest snapshot through the
  entry's declared row id and the fact's field path, and the cited side from the
  fact's written value.
- Where either side does not resolve — no snapshot yet, a vanished declared row,
  a field path absent from the row — the Pulse SHALL make no comparison and
  SHALL produce no finding. Absence is not disagreement; the vanished-row case
  already has its own rendering and its own repair finding, and reporting it
  twice under two names would make both less legible.
- Two resolved values SHALL be compared by: trimming, collapsing internal
  whitespace, and case-folding both; then extracting from each the first numeric
  magnitude with its optional currency symbol and optional `K`/`M`/`B`/`T`
  suffix. When both sides yield a magnitude they agree exactly when the
  magnitudes are equal; otherwise they agree exactly when the normalised strings
  are equal. There is no tolerance: a tolerance is a policy nobody has set, and
  the observed case (`284B` against `304B`) needs none.
- A disagreement SHALL enter the derived work queue as an item proposing a
  `verify` job, naming the entry, both fields, both resolved values, and both
  sources — the feed's registry id for one side and the cited `source_url` for
  the other, so the job begins with the two things it has to compare in front of
  it.
- The Pulse SHALL NOT edit either fact, mark either source authoritative, or
  fail the build on a disagreement. It reports that two sources disagree; which
  one is right is judgment, and judgment is a job.
- The item SHALL leave the queue when the values agree again or the
  `corroborates` declaration is removed, with no close or archive action by
  anyone — it is derived state like every other queue item and SHALL NOT
  accumulate.
- **A disagreement MAY also be adjudicated, and an adjudication is a committed
  record.** It SHALL live at `data/adjudications/`, one flat file per adjudicated
  pair. Its name SHALL be `<entry>--<first field>--<second field>.md`, the two
  field names in the order the entry's `corroborates` declaration gives them and
  **each of the three components slugged** — lower-cased, every run of characters
  outside `a-z0-9` replaced by a single `-`, leading and trailing `-` trimmed —
  by the same rule `pulse/lib/vanished.mjs`'s `vanishedFileName` already applies
  to a source and a row id. The slugging is the rule and not a formatting note:
  an entry id is a kind and a slug joined by a slash
  (`model/deepseek-deepseek-v4-flash-0731`) and a field path carries an
  underscore, so the unslugged form names a path into a `model/`
  subdirectory rather than a file in a flat one. The record SHALL carry: the
  entry, both field names, the local date, the resolution in the adjudicator's
  own words, and **both resolved values as they stood when the adjudication was
  made**. A resolution with no pinned values is not an adjudication of anything,
  because nothing later can tell whether the disagreement it settled is the
  disagreement standing today. A record SHALL be bound to a pair by the entry and
  field names it carries, never by parsing its name — the name is a deterministic
  function of those three values, so a job can be told exactly what to create and
  a reader can find it, while the slugging loses nothing the record does not
  state outright.
- **The queue item for an unadjudicated disagreement SHALL state in its own
  detail how the record is written** — that directory, that file name computed in
  full for this pair, and every field above. A Desk job is one written prompt in and one diff out, so an
  instruction that is not in the item is an instruction the job does not have;
  this is the same stance the vanished-row record takes when it tells its own
  fixing job where to move the file.
- The Pulse SHALL suppress the queue item for a declared pair **exactly when** an
  adjudication record names that pair and both sides resolve today to the values
  that record pinned. Suppression is by equality with the pinned values and by
  nothing else — not by the record's existence, not by its date, and not by a
  tolerance.
- **If either resolved value differs from its pinned value, the Pulse SHALL
  produce the item again**, and the item SHALL name the adjudication it
  supersedes. A moved value is a new disagreement, not the acknowledged one, and
  the earlier resolution is context for the job rather than a reason not to run
  it.
- The Pulse SHALL NOT write, edit or delete an adjudication record. It still
  never adjudicates: the record is a fixing job's own diff, made under the review
  gate like any other content this repository publishes, and an engine that could
  write one could silence a disagreement it was built to report.
- **An adjudicated pair SHALL remain visible in the run's computed corroboration
  output, marked adjudicated, with both pinned values and both current ones.**
  Suppression is of the work item, never of the finding: a disagreement that
  disappears from the data the moment somebody explains it cannot be audited, and
  the explanation is the thing most worth auditing.

#### Scenario: Two sources disagree and a verify job is proposed

- **WHEN** an entry's feed-bound `parameters` resolves to `284B total` and its
  cited `repository_tensor_total` declaring `corroborates: parameters` says `304B params`
- **THEN** the next Pulse run's queue carries a `verify` item naming the entry,
  both fields, both values and both sources, and neither fact is changed

#### Scenario: The Pulse does not pick a winner

- **WHEN** a declared pair disagrees
- **THEN** the feed-bound fact still renders its source's value verbatim, the
  cited fact still renders its own, and the build succeeds

#### Scenario: A vanished row is not a disagreement

- **WHEN** a declared row id is absent from the latest snapshot, so the
  feed-bound side of a declared pair does not resolve
- **THEN** no corroboration finding is produced, and the existing vanished-row
  rendering and repair finding are what report it

#### Scenario: Agreement empties the item

- **WHEN** the source is corrected so both sides resolve to the same magnitude
- **THEN** the next run's queue no longer contains the corroboration item

#### Scenario: An adjudicated disagreement stops minting work

- **WHEN** a declared pair disagrees, an adjudication record names it and pins
  both values, and both sides resolve today to exactly those values
- **THEN** the queue carries no item for that pair, and the run's corroboration
  output still lists it, marked adjudicated

#### Scenario: The record's name is one flat, slugged file name

- **WHEN** an item is minted for the pair whose entry is
  `model/deepseek-deepseek-v4-flash-0731` and whose fields are `context_length`
  and `context_window`
- **THEN** the item's detail names `data/adjudications/` and the single file
  model-deepseek-deepseek-v4-flash-0731--context-length--context-window.md,
  which contains no slash and names no subdirectory

#### Scenario: A moved value revives it

- **WHEN** either side of an adjudicated pair resolves to a value the record did
  not pin
- **THEN** the queue carries the item again, naming the adjudication it
  supersedes, and no run has edited or deleted that record

#### Scenario: The engine writes no adjudications

- **WHEN** a disagreement stands for any length of time with no record naming it
- **THEN** the Pulse writes nothing, deletes nothing, and keeps producing the
  item — a settled disagreement is settled by a reviewed job, not by waiting

---

### From `specs/site` (full text: `D:/AddictedtoAI/openspec/specs/site/spec.md`)

### Requirement: Published URLs never break

No published URL SHALL ever 404. Renames and removals leave permanent
redirects. Removing content is allowed (pruning weak pages is healthy) but
the URL redirects to the nearest surviving parent with a notice. The build
SHALL verify every internal link resolves; a broken internal link fails the
build.

#### Scenario: A pruned page leaves a redirect

- **WHEN** a page is removed as not worth keeping
- **THEN** its URL permanently redirects to its section index and the
  redirect is recorded in a checked-in redirects file

### Requirement: The home page is a derived view that changes daily at zero inference

The home page SHALL lead with what changed: a dated feed of verified changes
(price moves, status changes, releases, retirements, notable timeline
events) derived from the Pulse's diff history, each line linking into the
owning wiki entry and carrying its source. It SHALL also surface: a recent
deprecations/retirements strip, the latest blog post and tutorial, and clear
doors into each surface. All of it renders from the data layer, so in a week
where no inference runs at all, the home page still changes every day the
world does. The home page serves someone already following AI daily;
education is a door they can take, not the framing of the page.

#### Scenario: The front page moves with zero inference

- **WHEN** the Pulse detects source changes and rebuilds on a day when no
  model was invoked
- **THEN** the home page's changed feed shows the new dated lines

### Requirement: Every build carries a visible build stamp

Every build SHALL embed a build stamp — the build's UTC timestamp and the
short commit hash — rendered in the site footer and served as JSON at a
stable status URL (`/status.json`). The stamp is how deploy success is
verified from outside (see `pulse`): a fetch of the live site reveals
whether a deploy landed, with no hosting-provider API involved. The stamp
changes on every build; two builds from different commits MUST carry
different stamps.

#### Scenario: The stamp betrays a frozen site

- **WHEN** two scheduled Pulse runs complete on a day the world changed,
  and the live site's `/status.json` stamp is fetched after each
- **THEN** the two fetched stamps differ; identical stamps mean publishing
  is broken regardless of what the runs' logs claim

### Requirement: Citable assets are first-class

The site SHALL publish, from day one:

- RSS/Atom feeds for the blog, the tutorials, and the home changed feed,
- a sitemap,
- generic Open Graph metadata (no social handles, no platform widgets),
- **the open dataset**: the entire structured layer (entries, facts,
  timelines, model catalog, deprecations) downloadable as JSON and CSV at a
  stable URL, under the CC BY 4.0 license, with the license stated on the
  page and in the files,
- **structured data** on every page whose subject the corpus can describe from
  its own front matter, and
- **an `llms.txt`** at the root, pointing at the structured layer, the pages
  behind it, and the licence — what a model retrieving this site actually
  needs, never a restatement of what the site would say about itself.

Distribution is citability, not outreach. The system SHALL take no outward
action that speaks for the site: no posting, no comment, no email, no account
anywhere, no submission to a directory, and nothing that puts words in the
site's name where a human is expected to be the one speaking. That is a
standing rule, not a temporary posture, and it holds regardless of how
effective the forbidden action would be.

**Announcing that a URL changed is not speaking for the site**, and is the one
exception, permitted under all of the following conditions and no others:

- it SHALL carry no content, opinion or description — only URLs the site
  already publishes, and only URLs that are already live;
- it SHALL be sent to a machine-readable indexing protocol that requires no
  account and no credential issued by anyone;
- the set of URLs SHALL be derived from the site's own published freshness
  signal, so that a page the sitemap omits can never be submitted and no second
  definition of "changed" exists; and
- it SHALL be gated on the same publish flag that gates deployment, and SHALL
  run only after the deploy is confirmed live.

A failure of such an announcement SHALL NOT be treated as a failure of the
deploy: it SHALL be reported and the run SHALL continue.

#### Scenario: The dataset is fetchable and licensed

- **WHEN** a visitor fetches the dataset URL
- **THEN** they receive the structured layer as JSON (and CSV for tabular
  slices) with the CC BY 4.0 license named inside the payload

#### Scenario: A changed URL is announced, and nothing else is

- **WHEN** a deploy is confirmed live and the sitemap records that pages
  changed that day
- **THEN** exactly those URLs are submitted to the indexing protocol, carrying
  no text about them, and a page the sitemap omits is not submitted

#### Scenario: An indexing service is unreachable

- **WHEN** the submission fails or returns anything other than success
- **THEN** the failure is reported, the deploy stands, and no halt is written

#### Scenario: Publishing is held down

- **WHEN** the publish flag is off, or the run is a dry run
- **THEN** no submission is attempted and the reason is stated in the log

### Requirement: The crawler stance is a recorded decision

`robots.txt` SHALL state the site's position on crawlers as a decision that was
made, not as a default that was inherited.

- It SHALL name explicitly, one rule each, the AI training and retrieval
  crawlers the site has taken a position on, and SHALL carry, in the served
  file, the reasoning for that position and what each named token actually
  governs. A rule whose reasoning lives only in source is not a recorded
  decision to anyone who reads the file.
- Reversing the position for a crawler SHALL be a single-word change to
  declared data.
- `robots.txt` SHALL contain no `Disallow`. Pages the site does not want
  indexed express that in their own per-page directive; disallowing a crawler
  prevents it fetching the page and therefore reading that directive, which
  makes the site's indexability rules unenforceable.

#### Scenario: A reader opens robots.txt

- **WHEN** anyone fetches `robots.txt`
- **THEN** they find each named crawler with its rule and a note saying what
  that token governs, and the reason the site allows or refuses it

#### Scenario: A Disallow is introduced

- **WHEN** any `Disallow` line appears in `robots.txt`
- **THEN** verification fails, because per-page `noindex` can no longer be read

---

### From `specs/review` (full text: `D:/AddictedtoAI/openspec/specs/review/spec.md`)

### Requirement: The reviewer judges quality with full standing, from a named reason list

The reviewer SHALL return exactly one verdict — `approve`, `revise` (with
the required changes named), or `reject` — with one or more reasons from
this closed list:

- `false-or-unsupported-claim` — a claim the cited source does not support,
  or no source where one is required;
- `intent-not-measurement` — a claim written from what something was meant
  to do rather than a measurement of what it does;
- `not-worth-reading` — dull, derivative, padded, or otherwise not worth a
  reader's time (see `editorial`). **This is a complete rejection reason in
  its own right and never needs to be dressed up as a factual defect.**
- `reads-as-generated` — the prose reads machine-made: uniform rhythm and
  paragraph shape, structure signposted rather than felt, meta-commentary
  narrating its own method, no willingness to be blunt (see `blog` and the
  voice document it names). A complete reason in its own right, and the
  voice bar's one gate — the voice lint only advises, so this verdict is
  where machine-made prose actually stops;
- `overclaiming-summary` — title/excerpt claims more than the body proves;
- `spec-violation` — violates a named requirement in these specs;
- `broken-reference` — a transclusion, mention, or link that does not hold;
- `scope-violation` — the diff exceeds the job's stated outcome or touches
  paths it should not.

Verdicts are categorical, never numeric — scores drift and become targets.

**The quality question is asked, not merely available.** For every verdict
on a prose piece, the review record SHALL contain a required, non-empty
`would-cite` field: the reviewer's own-words answer to "who would link
this, and in what argument?" An `approve` whose `would-cite` field is
empty, or exactly identical (after whitespace trimming) to the
`would-cite` field of any existing review record, is not a valid verdict
and the merge SHALL refuse it. Both checks are exact and mechanical; a
reviewer writing a fresh-but-vacuous sentence each time passes them, which
is accepted — no mechanical check can compel judgment, and the field's job
is to make the question asked. Making the quality objection sayable fixed the
old failure; this field makes it asked — a reviewer that approves
everything without ever confronting the would-cite test produces the same
unread site as one that could not object at all.

**For a blog post, the voice question is asked the same way.** A verdict
on a `post` SHALL additionally contain a required, non-empty `reads-human`
field: the reviewer's own-words answer to "where does this read
machine-made, or why does it not?" The merge SHALL refuse a post verdict
whose `reads-human` field is empty or exactly duplicates an existing
record's, on the same terms and at the same point it refuses a blank
`would-cite`. Same mechanics, same honesty about their limit: the field
compels the asking, not the judgment.

**A later verdict that lands on a post SHALL settle the voice question rather
than inherit it.** A `reads-human` answers for the bytes its writer read. A
repair, a revision or any later job may rewrite those bytes and be approved by a
reviewer of its own, and the piece is then bound and clean while the only
reviewer that ever answered the voice question read an older version. **The job
type does not say whether that happened.** The type says what the job was for;
the merged subjects say what it touched, and a job of any type may touch a post.
So every **approving** verdict on a job whose merged subjects include a blog
post SHALL answer for **each such post**, in one of two ways, and a post among
those subjects that is left unanswered is refused exactly as a blank
`reads-human` is refused:

- **answer the question afresh**, in a non-empty, non-duplicated
  `reads-human`, as above. One such field answers for every post among the
  merged subjects that the record carries no carry-forward entry for — it is
  one reviewer's own-words judgment of the prose that reviewer read, and this
  requirement does not divide it per post; or
- **carry the prior answer forward**, in a `reads-human-from` entry naming the
  post it answers for, the earlier approving record it stands on, and the
  reviewer's own-words statement of why this diff did not move that post's
  voice.

`reads-human-from` SHALL be a **list of entries** — each naming its post, its
record and its statement — and not a single record-wide field. A job's merged
subjects may hold more than one blog post, each post's voice verdict lives in a
record of its own, and a single carry-forward could therefore approve one post
while leaving another bound and unanswered. An entry naming a path that is not
among the merged subjects is refused on the same terms as one whose record does
not hold up.

The two branches are not equally available to every job, and that is the point.
A `post` job is already held to the **fresh** answer by the paragraph above; the
choice is what this requirement adds for every **other** job whose diff reaches
a post.

The merge SHALL refuse a `reads-human-from` entry whose named record does not
exist, does not approve **the post that entry names**, or carries no non-empty
`reads-human` of its own, and SHALL refuse one whose statement is empty or
exactly duplicates the statement in any **other** record — on the same terms and
at the same point it refuses a blank `would-cite`. Two entries in the **same**
record may carry the same statement: one job making the same trivial correction
to two posts has one honest sentence to write about both, and the duplicate rule
is there to catch a sentence recycled across reviews. Any path that reports on a
post's voice SHALL resolve that post's own entry — the one naming it — to the
record that answered, and SHALL report a post whose entry reaches no such record
exactly as it reports one whose own record has none.

A post whose current approving record carries neither a `reads-human` nor a
`reads-human-from` entry naming it is not invalid where that record predates
this requirement — every record written before the merge
began asking the question is one, exactly as every record written before the
merge began writing `reviewed:` carries no `reviewed:` key. It is a distinct,
named state, and it is satisfied by any earlier approving record naming that
piece which carries a non-empty `reads-human`. A record written **after** this
requirement SHALL NOT enter that state: the merge refuses it at the point above,
so the reach-back reaches only records that could not have carried a
carry-forward. Reporting such a post as unanswered would redden a check over
records nobody may now write, which is a guardrail firing on its own history.

The two branches are not interchangeable, and neither collapses into the other.
Asking a repair reviewer to produce a voice verdict on a three-sentence licence
correction asks it of a diff with no voice in it, and the sentence it would
write is the forced-judgment field the duplicate rule already exists to catch.
Letting it write nothing is how an answer comes to speak for bytes that are
gone. Naming the record it stands on is answerable from what a repair reviewer
actually sees.

Stated with the same honesty this requirement states about `would-cite`: the
carry-forward compels the **form** — a reviewer named the record it stands on
and said why the prose did not move — and never the correctness of that
judgment. A reviewer that carries a verdict forward across a rewrite has
committed a `spec-violation` against this requirement, catchable by the next
reviewer of that piece and by nothing mechanical.

#### Scenario: An approve must answer the quality question

- **WHEN** a reviewer returns `approve` on a blog post with the
  `would-cite` field blank
- **THEN** the verdict is invalid, the merge refuses, and the reviewer must
  re-issue the verdict with the field answered

#### Scenario: Boring is a verdict

- **WHEN** a factually clean draft is judged not worth a reader's time
- **THEN** the reviewer rejects with `not-worth-reading` and the recorded
  reason says so plainly, with no manufactured factual objection

#### Scenario: A post verdict answers the voice question

- **WHEN** a reviewer returns `approve` on a post with the `reads-human`
  field blank
- **THEN** the merge refuses the verdict exactly as it would a blank
  `would-cite`, and the reviewer must re-issue it with the field answered

#### Scenario: A repair carries the voice verdict forward instead of inventing one

- **WHEN** a repair job corrects three licence sentences in an already-approved
  post and its reviewer approves the diff
- **THEN** the verdict carries a `reads-human-from` entry naming that post, the
  post's earlier approving record, and why the correction did not move the
  post's voice; the merge accepts it, and no reviewer is made to write a voice
  verdict about a diff

#### Scenario: A carry-forward that stands on nothing is refused

- **WHEN** an approving post verdict carries a `reads-human-from` entry whose
  named record does not approve the post that entry names, or carries no
  `reads-human` of its own
- **THEN** the merge refuses the verdict, naming the record it could not stand
  on, exactly as it refuses a blank `would-cite`

#### Scenario: A repair that lands on a post and answers neither way is refused

- **WHEN** a job whose type is not `post` merges an edit to a `content/blog/`
  post and its reviewer approves with neither a `reads-human` nor a
  `reads-human-from` entry naming that post
- **THEN** the merge refuses the verdict, because the obligation follows the
  merged subjects and not the job type, and the reviewer re-issues it naming the
  record it stands on

#### Scenario: A job that lands on two posts answers for both

- **WHEN** one job's merged subjects hold two `content/blog/` posts and its
  approving verdict carries a `reads-human-from` entry for the first post only,
  with no `reads-human` of its own
- **THEN** the merge refuses the verdict, naming the second post as the one left
  unanswered, and the reviewer re-issues it with an entry for that post too or a
  fresh `reads-human` covering it — and every path that reports on a post's
  voice resolves each of the two posts through its own entry, so the merge and
  the launch check agree post by post

#### Scenario: A post approved before the carry-forward existed is a named state

- **WHEN** a post's current approving record was written before this requirement
  and carries neither field, and an earlier approving record naming that post
  carries a non-empty `reads-human`
- **THEN** the voice question counts as answered by that earlier record, no
  check fails on the post, and a record written after this requirement in the
  same shape is refused at merge instead of joining that state

### Requirement: Missing, unbound, and mismatched are three findings, not one

`lib/reviews.mjs`'s header already reasons that "unreviewed" and "named
something the join does not recognise" are the same observation from the join's
position, and that absence must therefore be reported rather than acted on.
Reviewed-then-changed is the third member of that family, and a check unable to
tell it from the other two would report a page whose approved text had since
moved as though it had never been reviewed at all — the one reading that loses
both the record and the change.

- The join SHALL classify every reviewable piece into exactly one of four
  states: **recorded** (a record joins and its recorded hash equals the piece's
  current reviewed-surface hash), **mismatched** (a record joins, carries a hash
  for that path, and the hashes differ), **unbound** (a record joins and carries
  no hash for that path), and **missing** (no record joins).
- Every path that reports on reviews — `scripts/verify-launch.mjs` and the
  prebuild's summary line — SHALL report the four states separately and SHALL
  NOT collapse mismatched into missing. They are opposite findings: missing
  means unreviewed, mismatched means reviewed and then changed, and only the
  second identifies both a specific record and the specific bytes that moved.
- `scripts/verify-launch.mjs` SHALL fail on any **mismatched** piece, naming the
  piece, the record, and the fact that the reviewed surface changed after the
  verdict.
- **Unbound** SHALL be counted and reported and SHALL NOT fail anything. Every
  record written before the merge began binding hashes is unbound, so failing on
  unbound would refuse the whole corpus of records that predate the mechanism —
  and an unbound record is exactly as informative as a record was before binding
  existed, no worse. The number to watch is that it only ever falls.
- A **mismatched** state SHALL NOT change a page's indexability. The build's
  review gate continues to read the verdict alone. Suppressing a page because
  its bytes moved would silently de-index approved work over a whitespace edit,
  which is the response `lib/reviews.mjs` already refuses to give to absence,
  for the same reason.

#### Scenario: An edited approved page is a named finding

- **WHEN** an approved entry's prose is edited after its verdict and the launch
  check runs
- **THEN** the check fails, naming that piece as mismatched against its record,
  and does not report it as missing a review

#### Scenario: A pre-existing record is unbound, not broken

- **WHEN** a seed record carrying no `reviewed:` key joins its piece
- **THEN** the piece reports as unbound, the count of unbound pieces is printed,
  and nothing fails

#### Scenario: A mismatch does not unpublish anything

- **WHEN** a piece is mismatched against its record
- **THEN** its rendered page's indexability is exactly what the verdict alone
  would produce, and no page is de-indexed by the mismatch

### Requirement: A review record names the bytes it reviewed

A record that named only a *piece*, and never the *text* it judged, would leave
an approval surviving the thing it approved. The join in `lib/reviews.mjs`
matches a record to a piece by the canonical URL-derived filename, three
accepted alternates, or a front-matter subject key, and the merge gate then
checks that the record carries a verdict from the closed list and a non-empty,
non-duplicated `would-cite`. Every one of those checks would pass unchanged
after the reviewed text had been edited. Binding the record to the bytes is
what closes that gap.

Binding is done by the one step that already knows what landed — the loop's
merge step, which writes `subject:` for exactly this reason:

- On merging a job, the loop SHALL write into that job's verdict record a
  `reviewed:` mapping from each merged content path to the SHA-256 of that
  file's **reviewed surface**, derived from the same measurement of the branch
  that produces `subject:` — one measurement, two fields, so the two can never
  describe different diffs.
- A piece's **reviewed surface** SHALL be its prose body together with its front
  matter with every mechanically-maintained key removed, and the list of
  mechanically-maintained keys SHALL live in exactly one declared place in
  `lib/`. The exclusion is not a convenience: `pulse` appends dated lifecycle
  events to an entry's `timeline` mechanically, under the review exemption, so a
  hash over whole file bytes would mark every entry mismatched the first time
  the world changed a status — a guardrail that fires on its own machinery is
  noise, and noise is how a guardrail gets switched off.
- The set of paths in `reviewed:` SHALL equal the set of joinable content paths
  written to `subject:`, and the merge SHALL refuse a record where they differ,
  in the same place and on the same terms it refuses an `approve` with an empty
  `would-cite`.
- The value shape of `subject:` SHALL NOT change. It is read by nine accepted
  key names in `lib/reviews.mjs` and by hand-written records; carrying the hash
  inside it would break the join for every record that already exists, which is
  the opposite of the outcome this requirement is for.

- The set of pieces this binding covers SHALL be every wiki entry, **whether or
  not it has a prose body**, alongside the pieces the set already carries. A
  body-less entry's reviewed surface is its front matter, which is where its
  sourced facts live, so a fact-only edit to one moves that surface exactly as a
  prose edit moves a page's. Excluding it leaves that class of edit with no
  review-completeness signal at any layer: not missing, not unbound, not
  mismatched, absent from the count entirely. **Tool listings stay outside the
  set**, unchanged and deliberately: they are data rows rather than entry facts,
  the set has excluded them since it was written, and admitting every file the
  merge can hash — which is every `content/**.md` — would extend the binding
  past the class this requirement is about.
- Extending the binding SHALL NOT extend the requirement to **have** a record.
  Which pieces the launch check refuses to launch without a record is unchanged
  and is decided by its own prose bar; a body-less piece reporting **missing**
  SHALL fail nothing, on the same terms and for the same reason **unbound**
  fails nothing.

A record with no `reviewed:` key is not invalid — every record written before
the merge began writing that key is one. It is a distinct, reported state,
defined in the next requirement.

#### Scenario: The merge binds the record to what it merged

- **WHEN** a job merges `content/wiki/org/moonshot-ai.md` with an approving
  verdict
- **THEN** the verdict record carries both `subject:` naming that path and
  `reviewed:` giving that path's reviewed-surface hash, written from the same
  branch measurement

#### Scenario: A mechanical timeline append is not an edit to reviewed text

- **WHEN** the Pulse appends a dated status event to an approved entry's
  `timeline` and nothing else in the file changes
- **THEN** the entry's reviewed-surface hash is unchanged and the record still
  reads as bound

#### Scenario: A record that names one thing and hashes another does not merge

- **WHEN** a verdict record's `reviewed:` paths differ from the joinable paths
  the merge measured for `subject:`
- **THEN** the merge refuses the record and names both sets

#### Scenario: A fact-only edit to a body-less entry is a named finding

- **WHEN** a body-less wiki entry whose record binds its reviewed surface has a
  sourced fact's value changed, and the launch check runs
- **THEN** the check fails, naming that entry as mismatched against its record,
  exactly as it does for an edited prose body

#### Scenario: Body-less entries with no record fail nothing

- **WHEN** the join runs over a corpus whose body-less entries have no review
  records at all
- **THEN** they are counted and reported as missing, no check fails on them, and
  the set of pieces the launch check requires a record for is unchanged
