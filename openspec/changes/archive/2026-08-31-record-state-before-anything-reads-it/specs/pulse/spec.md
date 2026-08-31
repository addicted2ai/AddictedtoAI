# pulse — delta for record-state-before-anything-reads-it

The Pulse's publish step becomes two separately-governed halves. **Committing is
not publishing**: a run's computed state belongs in git the moment it is
computed, and whether the *remote* hears about it is a different decision — the
only one the `publish` flag governs. The pipeline gains no step, no fetch and no
judgment; one existing step stops conflating two things.

Every normative sentence below names, in `tasks.md`, what implements it and what
measures it. Three of them had no measurement until this change added one.

**Why two `MODIFIED` blocks and not one.** Repealing *"SHALL skip the publish
step entirely"* in *"The Pulse publishes what it builds"* is not enough on its
own: the pipeline enumeration in *"The Pulse runs to completion with zero model
access"* encodes the same model of the world one requirement up, naming `publish`
as a step that happens "when publishing is enabled". A literal implementer
building from that sentence writes a pipeline with no commit step at all and a
publish step that does not run when the flag is down — precisely the behaviour
this change removes. Repealing one and leaving the other would leave the
constitution saying two incompatible things and a later reader to guess
(`design.md`, D2). The second block therefore amends one clause and adds one
sentence foreclosing the misreading; the rest of that requirement is reproduced
unchanged, because a `MODIFIED` block replaces the whole body.

Both blocks are written in the constitution's own voice — what the system does,
not what this change did to it. A requirement body that narrates its own
amendment is meaningless to the reader who finds it a year from now, when the
change that wrote it is one of many in `openspec/changes/archive/`.

## MODIFIED Requirements

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

### Requirement: The Pulse publishes what it builds

A local rebuild is not publication. Publishing is a named pipeline step,
controlled by the `publish` flag in `data/config.json`:

- **When `publish` is `true`** (the operating phase): after a successful
  rebuild, the Pulse SHALL commit its data and content changes and push
  `main` to the remote (deploy = push; the host builds and serves). It SHALL
  then verify the deploy by fetching the live site's build stamp (see `site`)
  and confirming, within 10 minutes and with retries, that the stamp identifies
  **the commit this run pushed** — read from the repository *after* that commit
  exists, and matched as a hexadecimal abbreviation of that exact SHA. The
  expected value SHALL NOT be read from the local build's own `status.json`:
  that file is written during the rebuild, which happens before the commit, so
  it names the *previous* commit and a check against it confirms the previous
  run's deploy forever. A stamp that merely changed SHALL NOT satisfy the check.
  A stamp that does not advance is a deploy failure: the Pulse SHALL write
  `HOLD.md` naming the failure (breaker 2 in `loop`) and suspend further publish
  attempts until the hold clears. Detection is by fetching the live page only —
  no hosting-provider API, no GitHub API.
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

#### Scenario: The stamp has to name the commit, not merely differ

- **WHEN** the live build stamp changes to a value that is not a hexadecimal
  abbreviation of the pushed commit — another commit, `unknown` from a builder
  with no git, or a bare timestamp
- **THEN** the check does not pass, and the run treats the deploy as not landed

#### Scenario: A deploy that does not land is a halt, not a shrug

- **WHEN** the push succeeds but the live build stamp has not advanced
  after 10 minutes of polling
- **THEN** the Pulse writes `HOLD.md` naming the deploy failure and makes
  no further publish attempts until the hold is cleared

#### Scenario: Build phase publishes nothing

- **WHEN** the Pulse runs with `publish: false`
- **THEN** no push occurs, and the run log contains one line stating
  publishing is disabled

## ADDED Requirements

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
