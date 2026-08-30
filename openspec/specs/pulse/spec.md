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
data-layer update (including mechanical stub minting and lifecycle
timeline appends, defined below), rolling link check, freshness
computation, derived-queue recomputation, site rebuild, and — when
publishing is enabled — **publish** (the deploy step defined below). It SHALL contain no model invocation on any
path and SHALL run to completion on a machine with no model credentials of
any kind. It SHALL be safe to run on any schedule (idempotent between world
changes) and SHALL never prompt interactively. The zero-model property is
verified by running it in an environment with all model-related environment
variables unset: `node pulse/run.mjs` completes with exit code 0.

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
  and confirming, within 10 minutes and with retries, that the stamp
  advanced to the just-built value. A stamp that does not advance is a
  deploy failure: the Pulse SHALL write `HOLD.md` naming the failure
  (breaker 2 in `loop`) and suspend further publish attempts until the hold
  clears. Detection is by fetching the live page only — no hosting-provider
  API, no GitHub API.
- **When `publish` is `false`** (the build phase, while the no-push rule
  stands — and any time the maintainer wants a local-only mode): the Pulse
  SHALL skip the publish step entirely and print one line stating that
  publishing is disabled. Nothing else in the pipeline changes. The launch
  checklist is what flips the flag to `true`.

Without this step the site would rebuild locally forever while the live
domain stayed frozen; a Pulse run that completes without the live site
changing is not a success when publishing is enabled.

#### Scenario: An operating-phase run reaches the live site

- **WHEN** the Pulse runs with `publish: true` and the rebuild succeeds
- **THEN** the changes are committed and pushed, and the run's final step
  confirms the live build stamp now carries the new build's value

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
feed rows, and material changes on price/licence/status fields from the
trailing 14 days that lack an interpretation annotation (the source
`interpret` jobs draw from — see `loop`). The queue is a ranked snapshot
(a generated file), not a ledger: nothing is ever "filed" into it, it has no
history, and it cannot backlog — an item leaves the queue the moment the
underlying state is fixed, and the queue's size is bounded by the size of
the site, not by time passing. Discovered work that needs human judgment or
does not map to site state (a bug, an idea, a follow-up) goes to beads
(`bd`) instead, filed by whoever discovers it — the two never mirror each
other.

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
  cited `card_parameters` declaring `corroborates: parameters` says `304B params`
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
