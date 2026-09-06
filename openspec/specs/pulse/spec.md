# pulse Specification

## Purpose
The Pulse is the deterministic, model-free engine: fetch, snapshot, hash,
diff, link-check, freshness, derived queue, rebuild. It runs on a clock,
costs HTTP and arithmetic, and keeps the site alive when no inference exists
at all.

## Requirements

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

#### Scenario: A refusal is recorded, not routed around

- **WHEN** a registered source starts returning 403
- **THEN** the Pulse marks it refusing with the date, stops fetching it at
  normal cadence (retrying at most daily), keeps serving its last snapshot
  with the snapshot's date visible, and files a repair finding in the
  derived queue

### Requirement: Every fetch is snapshotted, hashed, and diffed

For every registered source, each fetch SHALL store a dated snapshot, hash
it, and diff it against the previous snapshot. Only changed sources produce
findings; an unchanged source costs one fetch and nothing else. Detected
changes update the data layer (model rows, statuses, versions) and append to
a dated diff history from which the home page's changed feed and the
"what changed recently" tables render. Each material change entry SHALL
embed the relevant source row (or a minimal excerpt of it) alongside the
source URL and date — this embedded excerpt is the **archived source
reference**: it is what lets a lifecycle record (a retirement, a
deprecation) keep its evidence after the vendor deletes the page, since
only the latest and previous snapshots are retained.

#### Scenario: Unchanged source is a no-op

- **WHEN** a source's fetched body hashes identical to the previous snapshot
- **THEN** the Pulse records the check time and produces no finding and no
  data change

#### Scenario: A change becomes a dated, sourced feed line

- **WHEN** a model's price differs between consecutive snapshots
- **THEN** the diff history gains a dated entry naming the model, the field,
  the old and new values, and the source — and the next build shows it in
  the changed feed

### Requirement: The diff history is seeded so the launch feed is not empty

Diff history normally begins at first fetch, which would leave the changed
feed — the launch-day hero — nearly empty. At first ingestion of a source
whose rows carry their own dated historical records (release dates,
retirement dates, deprecation dates), the Pulse SHALL seed `changes.jsonl`
with those records as dated, sourced entries marked `seeded: true`, carrying
their original dates. Seeded entries render in the changed feed exactly like
observed ones (they are real, sourced history — not synthesized), and the
`seeded` marker keeps them distinguishable in the data. Seeding runs once
per source and never overwrites observed entries.

#### Scenario: Launch day shows real history

- **WHEN** the release/retirement source is ingested for the first time
- **THEN** `changes.jsonl` contains dated entries for its historical
  releases and retirements, each marked `seeded: true` with its original
  date and source, and the home changed feed renders them

#### Scenario: Seeding is idempotent

- **WHEN** the Pulse runs again after seeding
- **THEN** no duplicate seeded entries are appended

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

### Requirement: The work queue is derived, never accumulated

The Pulse SHALL recompute the loop's work queue from current state on every
run: overdue facts, overdue tutorials, failed verifications, broken links,
want-demand eligible mints, suspect sources, refusing sources, vanished
feed rows, material changes on price/licence/status fields from the
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

### Requirement: A surface's unmet declared coverage is queue input

Every other queue reason answers *the world changed* or *a timer elapsed*.
Neither can express that this site has declared an intention it has not met, so
nothing in the machinery has ever looked inward at the corpus's own stated
shape. Where a surface has a **curriculum of record** — a written enumeration of
the pages it intends to publish — the Pulse SHALL derive one queue item for each
enumerated page that `content/` does not publish.

- The item SHALL propose an `education` job and SHALL carry the reason
  `curriculum-gap`, ranked below every reason describing something broken or
  overdue and below `want-eligible-mint`. Nothing is wrong on any page because a
  page the site intends to write does not exist yet.
- The derivation SHALL be a set difference between two committed files and
  SHALL NOT score, rank, or otherwise judge either side. It is the same
  arithmetic a reader could do with two directory listings, and its result is
  falsifiable by doing so.
- The item SHALL retire by recomputation alone, like every other queue item:
  publishing the page removes it at the next run, with no close or archive
  action by anyone.
- The Pulse SHALL read the curriculum tolerantly. A curriculum that is absent,
  unreadable, or carries no catalog section SHALL yield no items and SHALL NOT
  halt the run — the engine must keep the data layer true on a day when the
  build would fail.

#### Scenario: A declared page nobody has written becomes work

- **WHEN** the curriculum enumerates a page whose slug has no file in
  `content/learn/`
- **THEN** the next queue carries one `education` item with reason
  `curriculum-gap` naming that slug

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

### Requirement: Which job types the queue may produce is a stated decision

The loop can run ten job types and the queue produces a strict subset. Which
types are missing has never been recorded as a decision, so an absent producer
is indistinguishable from an unbuilt one — capacity with no trigger and no
record of why.

The Pulse SHALL declare, as a closed list in the queue's own source, every job
type the derived queue may produce, together with the reason the remaining types
are not on it. Every item the queue computes SHALL carry a type from that list,
and a violation SHALL fail the test suite. Adding a producer for a type not on
the list SHALL require amending the list in the same change.

The decision of record is that `tutorial`, `post`, `prune` and `machinery` are
**proposal- and maintainer-initiated by design**, not merely unbuilt:

- `prune` and `machinery` SHALL NOT become queue-producible while the only
  available trigger would be a model scoring the corpus or the codebase against
  a rubric. Removal is the one irreversible act here — a wrongly-fired `prune`
  404s a published URL, where every other queue item that fires wrongly merely
  wastes a job — and "the machinery is deficient" has no committed-state
  measurement at all. The channel that serves machinery work is evidence-driven
  and already exists: a reviewer naming a measured defect in its verdict record.
- `post` is excluded because a derived "a post is due" trigger is a cadence, and
  a cadence is what fills a blog with pieces nobody asked for.
- `tutorial` is excluded for a different and weaker reason: the declared-coverage
  shape above would fit it, but no curriculum of record exists for that surface.
  Writing one is an editorial decision about what the site should teach by
  doing, not a machinery decision.

#### Scenario: A queue item of an undeclared type fails the suite

- **WHEN** a queue producer emits an item whose type is not on the declared
  list
- **THEN** the test suite fails, naming the type and the item's reason

#### Scenario: The list states its own exclusions

- **WHEN** a reader asks why the queue cannot produce a `prune` job
- **THEN** the answer is in the declared list beside the decision, not
  inferred from the absence of a producer

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

### Requirement: A withdrawn feed row is recorded once and retires when the site answers it

A declared feed row that leaves its source does not come back on a schedule and
may never come back at all. The condition is therefore permanent, and a finding
computed directly from it can never retire: it is re-emitted on every
recomputation, forever, and at a high rank it starves every finding beneath it.
That is the failure `A carried finding is queue state, and its file is the
state` already names — a retirement that depends on anything other than the
fixing job's own diff is how a high-rank item becomes permanently un-retirable
— and it is why this class is specified separately from the level signal it is
derived from.

What is fixable here is not the world but the site's answer to it: whether the
corpus tells a reader what happened to the model. That is the state this
finding tracks.

A permanent condition needs a durable record of the ANSWER, not of the
question. This is the one place where the carried-finding analogy breaks and
must not be followed: a carried finding may be retired by deleting its file
because its source is a one-time verdict record, and once the file is gone
nothing recreates it. A withdrawn row's source is the continuing absence of a
row from a snapshot, so a deleted record is simply re-derived on the next run.
Retiring by deletion would leave the finding immortal — the original defect,
with extra steps.

- The Pulse SHALL write one durable record per declared row absent from its
  source's latest snapshot, under a directory at the data root, and SHALL write
  it **once**: a record that already exists SHALL NOT be rewritten. Idempotency
  is by presence, not by comparing dates, so a run cannot overwrite pinned
  evidence with a later, emptier reading.
- The derived queue SHALL produce its `vanished-feed-row` items from the
  **pending** records and SHALL NOT produce them from the computed absence
  itself. The computed list remains as reporting and as the input that decides
  which records to write.
- Retirement SHALL be by **moving the record into an answered store**,
  performed by the fixing job's own diff, and SHALL NOT be by deletion. A row
  named in the answered store SHALL NOT be recorded again, however long it
  stays absent from its source.
- The Pulse SHALL commit the records it writes. A record that is written and
  queued from but never committed is durable queue state that exists on one
  machine, invisible to a fresh clone and to every other actor.
- Each record SHALL pin the row's **last-known values** as of the moment it was
  written. A source's `previous` snapshot is only rotated when a fetch's rows
  differ from `latest`, so once rotation passes a withdrawal the row is present
  in neither snapshot and its last values are unrecoverable. A finding whose
  evidence expires before the finding does is not dispatchable work.
- A record that cannot be read as a finding — no front matter, or no title —
  SHALL be skipped rather than queued under a manufactured name, on the same
  terms as every other reader of a record directory.
- Nothing in this requirement SHALL cause an entry or its `feeds:` binding to be
  removed. A binding removed after its row vanishes is what makes that row
  permanently unmintable if it re-lists, which is the condition `A row whose
  slug is already taken is a finding, not a silent refusal` exists to report.

#### Scenario: The finding survives recomputation until it is answered

- **WHEN** a declared row is absent from its source's latest snapshot and its
  record is still pending
- **THEN** every recomputation produces exactly one `vanished-feed-row` item for
  it, never more, and the item does not duplicate across runs

#### Scenario: The fixing job's own diff retires it

- **WHEN** a job dispatched against a withdrawn row moves that row's record into
  the answered store in the same change as its fix
- **THEN** no later recomputation produces an item for that row, and no later
  run re-records it, even though the row remains absent from the latest
  snapshot indefinitely

#### Scenario: Deleting a record does not retire it

- **WHEN** a pending record is deleted without being answered and the row is
  still absent from the latest snapshot
- **THEN** the next run records it again, and the item returns — deletion is not
  a retirement path

#### Scenario: Absence alone is not a finding

- **WHEN** a row is absent from the latest snapshot and no record exists for it
  in either store
- **THEN** no `vanished-feed-row` item is produced

#### Scenario: The evidence outlives the snapshots

- **WHEN** a row's record is written and the source is later fetched with
  changed rows, rotating `previous` past the withdrawal
- **THEN** the row's last-known values are still readable from the record,
  though they are no longer present in either snapshot

### Requirement: A change line's kind comes from a closed list with one home

`data/changes.jsonl` is the append-only history everything downstream reads: the
home changed feed, `/catalog/changed`, the RSS feed, the sitemap's
`lastModified` join, a blog note's `covers:` anchor, the scout's assembled
context, and the `interpret` job's work source. What a line *is* travels in its
`kind`, and that field is currently unchecked in both directions.

Measured on 2026-09-05: the file holds **182 lines** in five kinds — `arrival`
77, `release` 60, `field_change` 23, `retirement` 14, `annotation` 8. Those five
are the kinds the system means to have. Nothing declares them. They are string
literals at their emission sites and every consumer tests equality against a
literal of its own, so a misspelled kind would be written, committed, rendered
through the changed feed's catch-all, and caught by nothing.

Worse, the tree already carries a constant that *looks* like the list —
commented as the material change kinds "in the order specs/pulse names them" —
which is imported nowhere, and three of whose five values are not kinds at all
but material **field** names carried on a line's `field`, appearing as a `kind`
on zero of the 182 lines. A list that reads as authoritative, is consulted by
nobody, and disagrees with the data is worse than no list: the obvious way to
add a new kind is to add it there, which changes nothing anywhere.

- The kinds a change line may carry SHALL be a **closed list declared in exactly
  one place** in the source tree, and every producer and consumer SHALL read that
  declaration rather than restating a literal.
- **`lead-change` SHALL be a member of that list**, alongside `arrival`,
  `release`, `field_change`, `retirement` and `annotation`.
- The Pulse SHALL **refuse to append** a line whose kind is not a member, naming
  the kind and the caller. This is the point the mistake is made, and a refusal
  there costs a failing test rather than a corrupt history.
- The build SHALL **report** the number of lines on disk carrying an unrecognised
  kind, in its summary, and SHALL NOT fail on one. This is deliberately not
  symmetric with the write side: the file is append-only history, a corrupt line
  already committed cannot be removed, and the reader's existing stance is that a
  malformed line is the Pulse's problem to report rather than a reason to stop
  rendering the others. A build that failed here would let one bad historical
  line take the whole site down.
- Any constant that duplicates the list without being read SHALL be removed
  rather than updated, so there is one home and not two.
- `lead-change` lines SHALL NOT produce `interpret` work. The `interpret` source
  is material field changes, and a lead change is an event the site states
  outright rather than a movement needing interpretation. This SHALL be asserted
  by a test rather than left true by the current filter's incidental shape.

#### Scenario: An unknown kind cannot be written

- **WHEN** the Pulse is asked to append a line whose kind is not in the declared
  list
- **THEN** it refuses, naming the kind, and appends nothing

#### Scenario: An unknown kind already on disk is reported, not fatal

- **WHEN** the build reads a committed line carrying a kind the list does not
  contain
- **THEN** the summary reports how many such lines exist and the build completes,
  and the rest of the feed renders

#### Scenario: A lead change queues no interpretation

- **WHEN** a `lead-change` line is appended within the trailing interpretation
  window
- **THEN** the derived queue contains no `interpret` item for it

### Requirement: A lead change and a rescoring are different events, and the difference is computed

A published index's leader can change because something new arrived, or because
the publisher re-scored the model that was already leading. Measured across the
committed snapshots: between 2026-09-03 and 2026-09-04 exactly one row's indices
moved and every one moved **down** — `qwen/qwen3.8-max`, 58.1 → 53.4
intelligence, 71.8 → 68.9 coding, 58.4 → 49.9 agentic. A leader can therefore
lose the lead without anything shipping, and a history line saying "X overtook Y"
when Y was marked down is false about an event that did not happen.

Both finalist builds shipped a lead-change element that was an empty state on
day one, because no such line has ever been written.

- A **`lead-change`** line SHALL record that the leader of a declared metric
  changed between two consecutive snapshots. It SHALL carry the metric, the
  snapshot date the change was observed in, the outgoing and incoming rows, the
  publisher, and the archived source excerpt every material change entry already
  carries.
- It SHALL carry a **`cause`**, drawn from a closed set — `arrival` (the new
  leader was absent from the previous snapshot, or present and unscored),
  `rescored` (both were present and a value moved), `withdrawn` (the previous
  leader left the snapshot). **`cause` SHALL be computed from the two snapshots
  and never judged.** A model invocation on this path would make the history a
  model's opinion about what happened.
- A change in the leader's **value** with no change in the leader's **identity**
  is a different event and SHALL be recorded as such, distinguishable by kind or
  by a declared field. It SHALL NOT be recorded as a lead change.
- The line's **key SHALL be a pure function of state** — the two snapshot row
  hashes, the metric, and the kind — so that a re-run over an unchanged pair
  recomputes the identical candidate and appends nothing. A clock rollover with
  no fetch SHALL append nothing.
- The module producing these lines SHALL never edit or delete a line. A
  correction is a new line keyed to the corrected one, which is the treatment the
  `annotation` kind already receives.
- Only the **leader** SHALL be recorded. Membership churn in a top-N table is
  noise against the question the history answers — *when did the lead change* —
  and belongs in the derived file, which is recomputed anyway.
- **`data/derived/frontier.json` SHALL be derived on every run** as a pure
  function of the latest snapshot and the registry: leaders per declared metric,
  the ranked eligible rows, and the counts behind them, each row joined to its
  entry by the **declared** feed row id and never by name. It SHALL carry the
  snapshot's own date and SHALL read no clock, so a re-run with no world change
  produces a byte-identical file — the property every file under `data/derived/`
  already holds. Ties SHALL all be leaders and the surface SHALL say so; no
  tie-break invents an order.
- **With zero declared metrics the file SHALL still be written**, carrying an
  empty `metrics` collection — no leaders, no ranked rows — and the snapshot's
  own date. It SHALL NOT be absent and SHALL NOT be stood in for by a placeholder
  anywhere downstream. This is the day-one state, and it is the state both
  finalist builds were in when each hard-wired an empty element instead
  (`implementer-ledger.md` row 6: a cell renderer that ignored both its arguments
  and returned the same string). A surface SHALL therefore be able to **look the
  metric up and then collapse**, so that declaring one cleared metric populates it
  with no edit to any renderer.
- Rows that are not distinct listed models — service variants of a base row,
  router pseudo-rows, alias rows redirecting elsewhere — SHALL be excluded by
  **declared** criteria in the registry rather than by a rule compiled into the
  code, so the exclusions are visible and reviewable. They are patterns over ids
  and the registry SHALL record that, rather than presenting them as facts.
- The history SHALL be **seeded once** from the snapshots already committed to
  this repository, as dated, sourced, `seeded: true` entries under the existing
  seeding rule, so the surface is not empty on the day it ships. Seeding SHALL be
  idempotent and SHALL never overwrite an observed entry. Its limits SHALL be
  stated on the surface rather than implied: the record begins when observation
  began, and a baseline line says *observation began here*, not *this model
  became the leader here*. **Recording a value in a history line is not rendering
  it**: the rights gate in the next requirement binds the surface, not the
  record, and `specs/pulse` already requires every material change entry to embed
  its archived source excerpt.

#### Scenario: A rescoring is not an overtaking

- **WHEN** the previous leader's index value falls between two snapshots and
  another row is now highest
- **THEN** the appended line carries `cause: rescored`, and nothing in the data
  says the new leader improved

#### Scenario: An arrival is named as one

- **WHEN** a row absent from the previous snapshot appears carrying the highest
  value for a declared metric
- **THEN** the appended line carries `cause: arrival`

#### Scenario: A re-run appends nothing

- **WHEN** the Pulse runs twice over an unchanged pair of snapshots
- **THEN** the second run appends no line and rewrites `frontier.json`
  byte-identically

#### Scenario: A deleted line comes back

- **WHEN** an appended `lead-change` line is removed from the file by hand and
  the Pulse runs again over the same snapshot pair
- **THEN** the line is appended again, because the key is a function of state —
  deletion is not a retirement path

#### Scenario: The first day is not empty

- **WHEN** the surface renders for the first time after seeding
- **THEN** it shows the lead changes recoverable from the committed snapshots,
  each marked as seeded, and states that the record begins where observation
  began

### Requirement: An index is registered with its publisher and its rights, and the empty state is computed

The site does not run benchmarks. Every index it could show is somebody else's
aggregate, reaching the site through a republisher, read on one day — and
whether it may be reprinted at all is a question nobody has answered.

Measured from the source registry on 2026-09-05: both registered sources carry a
`robots` block with a checked date and a `verification` block with a fetch
result. **Neither carries any field about republication.** The registry records
*may we read this*; nothing records *may we reprint what it says*, and those are
different permissions. Meanwhile the three Artificial Analysis index paths are
declared in one source's `yields` and 29 live model pages already bind them as
facts, which is the exposure `addictedtoai-ego8` was filed for;
`addictedtoai-c563` is its Design Arena sibling.

- A published index SHALL be **declared as a metric** in the source registry
  before any surface reads it, recording at least: the field name the corpus uses
  for it, the path into the source row, the **publisher**, the publisher's URL,
  the party republishing it if the site does not read it from the publisher
  directly, the direction that counts as leading, and a display label.
- Each declared metric SHALL carry a **republication decision**: the URL of the
  terms that were read, the local date they were read, the outcome, and a
  verbatim excerpt of the terms the outcome rests on. An unanswered question
  SHALL be recorded as unanswered — a missing field and a cleared right SHALL NOT
  look the same.
- **No index value SHALL render on any surface until its metric is registered and
  its republication decision records the right as cleared.** A metric that is
  registered but not cleared is usable for ordering, for computing a leader, and
  for stating *that* a lead changed; it is not printable.
- **The absence SHALL be computed, never hard-wired.** A surface that would show
  an index value SHALL look up the registry, find no cleared metric, and collapse
  — so that registering a cleared metric populates it with no further edit. A
  renderer whose empty state is a constant is a picture of an empty state: it was
  shipped once, with a cell renderer that ignored both its arguments and returned
  the same string, and no data could ever have filled it. A test SHALL populate a
  cleared metric in a fixture and assert the same renderer produces the value —
  an assertion that a renderer *is* empty proves nothing about whether it can
  stop being empty.
- Reading whether a row **carries** an index is not reprinting what the index
  says, and this requirement SHALL NOT be read to restrict the former. A
  description of a publisher's own act — that it rebased an index, on a date, in
  a direction — is likewise not a value, and is permitted with no value, ratio,
  rank or per-model score in its copy. **This is the same rule as
  `flag-what-moved-the-frontier`'s `blog` requirement "An F2 record carries the
  publisher's act, never the publisher's numbers", stated here for a history line
  as it is stated there for a post's copy** — both are the K44 amendment
  resolving F2 against K24, and the cross-reference is written down so an edit to
  either is visibly an edit to both rather than the start of two copies drifting.
- A surface displaying a registered value SHALL name the publisher, name the
  republisher where there is one, and carry the snapshot date the value was read
  in. The strongest claim available is *the publisher's page says this, as
  republished by that party, in the snapshot of that date*, and no surface SHALL
  imply a measurement date the data does not carry.

#### Scenario: An unregistered index does not render

- **WHEN** a source row carries a benchmark index that no registry metric
  declares
- **THEN** no surface renders its value, and the row still appears wherever rows
  appear

#### Scenario: Registered but not cleared is not printable

- **WHEN** a metric is registered with its republication decision recorded as
  unresolved
- **THEN** no value renders, and the surface may still state that a lead changed
  on that metric, naming the publisher and the date

#### Scenario: The empty state is a lookup that came back empty

- **WHEN** a fixture registers a metric with rights recorded as cleared and the
  same renderer runs
- **THEN** it renders the value — proving the empty state was the result of the
  lookup rather than a constant in the template

#### Scenario: An unanswered question does not read as a cleared one

- **WHEN** a metric is declared with no republication decision at all
- **THEN** the build treats it as unregistered for rendering purposes and reports
  it, rather than defaulting to permitted
