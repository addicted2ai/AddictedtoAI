# pulse — delta for catch-the-constitution-up-to-the-code

This change adds no behaviour. Every clause below describes something the code
already does and something an existing test already measures.

Both requirements are ADDED rather than folded into `The work queue is derived,
never accumulated`, following the precedent that requirement's own history set:
when corroboration became a queue finding it was given a dedicated section
rather than appended to that requirement's enumeration, because a finding with
its own trigger, its own refusals and its own scenarios does not fit in a list.

## ADDED Requirements

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

- On merging a job whose verdict record carries `carry:` entries, the loop SHALL
  write one file per entry into `data/carried/`. Implemented by
  `transcribeCarriedFindings` in `loop/lib/carry.mjs`, called from
  `loop/run.mjs`.
- The derived queue SHALL read `data/carried/` on every run and produce one item
  per file. Implemented by the carried-finding class in `pulse/lib/queue.mjs`.
- A carried finding SHALL rank **below** every finding derived from the world or
  from the corpus's own declarations. It is one reviewer's judgment about
  something it chose not to block on, which is the weakest evidence any queue
  item rests on, and ranking it with measured staleness or a broken link would
  let opinion outrank observation. Implemented as rank 25 in
  `pulse/lib/queue.mjs`.
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
- **THEN** the queue holds one item for that finding, ranked below the
  world-derived and declaration-derived findings

#### Scenario: The fixing job's own diff retires it

- **WHEN** a job takes a carried finding, fixes it, and its merged diff deletes
  that finding's file
- **THEN** the next run's queue simply does not contain the item, with no
  retirement step having recorded anything

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
