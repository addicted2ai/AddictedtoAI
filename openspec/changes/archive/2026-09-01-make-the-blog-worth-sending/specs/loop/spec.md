# loop — delta for make-the-blog-worth-sending

Four modified requirements and one added. The job-type list gains `scout`;
the scout's own requirement defines the daily outward sweep the maintainer
asked for; work source 3 gains its producing side — specified since the
founding change as three MAYs and never tasked (`addictedtoai-6ov`:
`loop/lib/proposals.mjs` exports four functions, three readers and one
mover, and none of them creates a proposal) — plus the expiring-candidate
rules the scout needs; the budget table and the degradation order place
`scout` in the new-writing category and shed it first. Deliberate edits
inside restated blocks are exactly four, disclosed here and re-counted by
word-diff against the live text on 2026-08-30: the side-output sentence
gains the scout exception; the proposal front-matter list gains an
optional `expires:`; the degradation lists (the shed-order sentence, the
level-1 list, and their scenario) gain `scout`; and the budget requirement
gains one rationale sentence — `scout` spends from the new-writing share —
beside the table row that places it there.

One comparison lives here rather than in any requirement body, because it
names a predecessor that requirement text should not anchor to: the
predecessor site's docket showed a 57% kill rate that was legible only
because every kill was filed, and the drop-record discipline below adopts
that form. What the records can and cannot prove is stated in the
requirement itself.

## MODIFIED Requirements

### Requirement: One job is one outcome with one merge or discard

The unit of Desk work SHALL be a **job**: one stated outcome with acceptance
checks, executed on its own branch, ending in exactly one merge or one
discard. Every job type carries a wall-clock cap: `data/config.json` maps
each job type to its cap, with defaults keyed by the type's tier (cheap-tier
types 30 minutes, frontier authoring types 60) — the caps are per-type, the
defaults are merely tier-derived; an executor still running at its
cap is killed and the job becomes `interrupted`. Nothing is ever
half-published: visitors SHALL only see merged, built work, and a job that
dies mid-run leaves a branch, not a broken page. After a merge, when
publishing is enabled, the loop SHALL publish through the same publish step
the Pulse uses (push, then live build-stamp verification — see `pulse`); if
it does not publish, the merged work reaches the live site at the next
Pulse run. Job types form a closed list:

- `interpret` — a Pulse-detected change needs judgment (what it means,
  whether it matters, how the changed line should read). Drawn from the
  derived queue's uninterpreted material changes (price/licence/status,
  trailing 14 days — see `pulse`); its output is an annotation line
  appended to the diff history (`data/changes.jsonl` stays append-only:
  the annotation is a new line keyed to the change it interprets), which
  the changed feed renders alongside the mechanical line.
- `verify` — re-verify a tutorial or a cited fact by actually executing or
  re-fetching.
- `entry` — mint a demanded wiki entry (identity, aliases, sourced facts —
  a stub for a thing no registry carries) or write/substantially revise an
  entry's prose. Registry ingest is not an `entry` job: the Pulse creates
  those stubs mechanically at zero inference cost.
- `tutorial` — write a new tutorial (subordinate to `verify` per
  `education-dynamic`).
- `post` — write a blog post.
- `education` — write or revise a static education page.
- `repair` — fix a broken link, failed listing, malformed record.
- `prune` — nominate and remove the weakest existing content.
- `machinery` — change the site's own code or the loop's own scripts.
- `scout` — the daily outward sweep (see "The scout looks outward, takes
  the best three, and records the rest"): find candidate stories in the
  world, rank them against the editorial bar, file at most three as
  expiring proposals, and record what was declined.

Adding a job type requires an OpenSpec change.

#### Scenario: A dead session leaves no visible damage

- **WHEN** a job's session is killed mid-work
- **THEN** the published site is unchanged; the branch remains for resumption
  or discard

### Requirement: Work comes from three sources and cannot self-amplify

Jobs are selected from, in priority order:

1. **The maintainer's directives** — a plain file (`DIRECTIVES.md`) the
   maintainer edits; always selectable first. Completion semantics: on
   completing a directive's job, the loop SHALL append a
   `[done <date> <job-id>]` marker to that directive's line and SHALL skip
   directives carrying one; removing finished lines is the maintainer's,
   at leisure. A directive is never silently re-run.
2. **The derived queue** — the Pulse's recomputed snapshot of what the site
   currently needs (see `pulse`). This source cannot backlog by construction.
3. **Proposals** — the only model-originated source. A proposal is one
   markdown file in `data/proposals/`, with front matter declaring: a date,
   a kebab-case `slug` naming the idea, the job type it proposes (from the
   closed list — a proposal proposes a job of an existing type, never a new
   kind of work), a one-paragraph summary, the evidence that prompted
   it, and optionally an `expires:` date for evidence that decays.
   Proposals come into existence three ways: a Desk run MAY end by
   writing at most one proposal as a side-output of whatever it noticed
   (the `scout` job is the exception: filing candidates is its outcome,
   governed by its own requirement and its own mechanical cap); a
   reviewer MAY note one in its verdict record (the loop transcribes it);
   the maintainer MAY drop one in directly. A proposal SHALL cool for at
   least 3 days (file age) before selection. A rejected proposal moves to
   `data/proposals/rejected/` with the rejection reason appended — that
   directory is the rejection index. Duplicate suppression is deterministic
   and exact: a new proposal whose `slug` equals a rejected proposal's
   `slug` SHALL be auto-discarded with a pointer to the earlier reason,
   spending no inference. That is the whole automatic mechanism —
   differently-worded resubmissions of a rejected idea are caught by the
   reviewer (the rejection index travels in the review checklist), not by
   fuzzy matching, because fuzzy matching is guessing.

"No qualifying job — do nothing" is a normal, healthy outcome and SHALL be
treated as such: a run that finds nothing worth doing ends without
manufacturing work.

**The producing side of source 3 is wired, not merely permitted:**

- Every brief the loop assembles SHALL state the proposal rule that binds
  its job — at most one, or the scout's own — restating the front-matter
  contract above, because a self-contained brief is the only channel a job
  has and an untold job cannot know.
- The review brief SHALL ask the reviewer to note a proposal where its
  review surfaced one, and the loop SHALL transcribe a noted proposal into
  `data/proposals/` as a well-formed proposal file naming the reviewing
  job as its origin.
- The caps SHALL be mechanisms: where a merged branch adds more proposal
  files than its job's rule allows, the loop SHALL keep the allowed number
  — by the job's own stated ranking where one exists, else by filename —
  and discard the rest with a note naming them. A proposal on a branch
  that is discarded dies with the branch: ideas do not outlive the
  rejection of the work that produced them.
- At merge, the loop SHALL stamp the proposing job's type onto each kept
  proposal, overwriting any value the executor wrote, and a proposal whose
  stamped origin type equals the type it proposes SHALL be auto-discarded
  on the same terms as a rejected-slug duplicate — with a pointer to this
  rule, spending no inference. The guard closes the tight loop, not every
  loop: a two-type cycle (`post` → `interpret` → `post`) remains possible,
  bounded by cooling at each hop and caught, where it is a re-tread, by
  the reviewer holding the rejection index. Cross-type noticing — an
  `interpret` job that has read three weeks of licence churn proposing a
  synthesis `post` — is the designed path. The maintainer's route is
  untouched: a file he drops in has no proposing job, so the rule cannot
  apply to it.
- A proposal declaring `expires:` SHALL be selectable without the 3-day
  cooling and SHALL NOT be selectable after its expiry; at expiry, an
  unselected expiring proposal SHALL be swept to `data/proposals/dropped/`
  mechanically, with a note naming the expiry. Cooling filters ideas by
  whether they survive three days; an expiry filters evidence by the date
  it stops being news — both are time-based honesty checks, and a
  candidate carries whichever one fits its evidence. No backlog carries
  forward: the sweep is what keeps the candidate directory from becoming
  the ten-weeks-of-backlog queue the predecessor's author track named as
  its own bottleneck.
- `data/proposals/dropped/` is a **record, never a block**: unlike
  `rejected/`, it SHALL NOT feed automatic slug suppression, so a story
  declined today may be refiled when its stated refile condition arrives.

#### Scenario: An empty run is not a failure

- **WHEN** the directives file is empty, the derived queue has no item above
  its floor, and no proposal is ripe
- **THEN** the run records "nothing qualified" and ends, and nothing anywhere
  treats that as an error

#### Scenario: A rejected idea stays rejected

- **WHEN** a new proposal file carries the same `slug` as a proposal in
  `data/proposals/rejected/`
- **THEN** it is discarded automatically with a pointer to the recorded
  rejection reason, spending no inference

#### Scenario: A job's noticing becomes ripe work

- **WHEN** an `interpret` job's merged branch includes one proposal for a
  synthesis `post`, with slug, summary and evidence and no `expires:`
- **THEN** the proposal is stamped with the interpret job's type, lands in
  `data/proposals/`, and is selectable once it has cooled 3 days

#### Scenario: A job cannot propose more of itself

- **WHEN** a `post` job's merged branch includes a proposal whose type is
  `post`
- **THEN** the proposal is auto-discarded with a pointer to the
  self-amplification rule, spending no inference, and the job's merge is
  otherwise unaffected

#### Scenario: Expired news is swept, not queued

- **WHEN** a scout-filed candidate's `expires:` date passes with the
  candidate unselected
- **THEN** the next run sweeps it to `data/proposals/dropped/` with a note
  naming the expiry, and nothing anywhere treats that as a failure

### Requirement: Spending is budgeted in model-minutes with floors and ceilings

The loop's cost unit is the **model-minute (MM)**: one minute of wall-clock
time during which a configured model was actively working, measured by the
loop itself from invocation to return, recorded per tier (`frontier` /
`cheap`) and never summed across tiers. Rationale: tokens are unobservable
across consumer subscriptions, and "rounds" ranged 200K–9M tokens on the
previous site; wall-clock per tier is measurable by the orchestrator alone,
comparable across providers, and readable by a non-programmer. Every job
records its MM actuals in a run ledger.

Shares SHALL be computed **within each tier separately**: a category's
share is its MM divided by that tier's total MM over the rolling 30 days,
and the bounds below SHALL hold in each tier independently (frontier shares
of the frontier total; cheap shares of the cheap total):

| Category | Bound |
|---|---|
| Upkeep (`interpret`, `verify`, `repair`, `prune`) | floor: ≥ 40% |
| New writing (`entry`, `tutorial`, `post`, `education`, `scout`) | ceiling: ≤ 45% |
| `machinery` | ceiling: ≤ 10% |

`scout` spends from the new-writing share deliberately: discovery is the
first stage of writing, and when writing is over its ceiling, finding more
to write is the first thing to stop. Review MM counts toward the job it
reviews. Each bound has its own
enforcement point: when a ceiling is reached, jobs of that category are not
selectable until the window rolls; when the upkeep share in a tier is below
its floor and any upkeep job is available in that tier, only upkeep jobs
are selectable in that tier until the floor is met — the floor binds on its
own, not merely as the arithmetic residue of the ceilings. The bounds, the
per-type wall-clock caps, and the degradation thresholds all live in
**`data/config.json`** — the one normative home for loop configuration;
changing the bounds requires an OpenSpec change. The
machinery ceiling exists because the previous site spent roughly seven lines
of process per line of site — the loop improving its own tooling is capped,
permanently, and the cap is enforced by the selector, not by good
intentions.

#### Scenario: Writing cannot crowd out upkeep

- **WHEN** new-writing MM reaches 45% of the rolling window
- **THEN** the selector refuses new-writing jobs and only upkeep, repair,
  prune, and (under its own cap) machinery jobs are selectable

#### Scenario: Machinery work hits its ceiling

- **WHEN** `machinery` MM reaches 10% of the rolling window
- **THEN** no further machinery job is selectable until the window rolls,
  regardless of how appealing the improvement looks

#### Scenario: The upkeep floor binds on its own

- **WHEN** upkeep MM in a tier is below 40% of that tier's rolling total
  and an upkeep job is available
- **THEN** the selector offers only upkeep jobs in that tier until the
  floor is met

### Requirement: Capacity exhaustion is a pause, and degradation is ordered

When a provider's allowance runs out mid-job, the job SHALL be marked
`interrupted` (branch kept, resumable — distinct from `failed`: `failed`
means the executor finished but its work was rejected by gates or review,
while `interrupted`/`capacity`/`blocked` are not failures) and the loop
SHALL pause that provider's lane. **A lane is the set of runners sharing a
`provider` value in `runners.yml`, and pause state is computed, not
stored**: every ledger line records the runner's provider; a lane is
paused exactly when its most recent ledger line is a `capacity`
classification and the backoff interval since that line has not yet
elapsed — 1 hour after the first `capacity` in a consecutive run of them,
doubling per consecutive `capacity` to a 6-hour maximum; any successful
completion on the lane resets the sequence. No pause file exists; the
predicate reads `data/ledger.jsonl` plus clock arithmetic — never a
prediction of the provider's window, which is unknowable for consumer
subscriptions. Exhaustion is
never an error, never triggers a retry storm, and never causes a hunt for
another credential or provider. As capacity tightens, work SHALL be shed in
this order: new `post`/`education`/`scout` first, then `entry`/`tutorial`
minting, then `interpret` on immaterial diffs — keeping `verify` (tutorial
and fact re-verification) and `repair` last. "Tightening" is deterministic,
read from the ledger: a tier's shed level equals the count of `capacity`
classifications recorded for that tier in the trailing 48 hours — at 1,
`post`, `education` and `scout` are not selectable in that tier; at 2,
`entry` and `tutorial` are also excluded; at 3 or more, only `verify`,
`repair`, and material-field `interpret` remain selectable. The Pulse never
pauses for capacity reasons: the site stays alive on zero inference.

#### Scenario: A window closes mid-job

- **WHEN** the provider hard-stops during a job
- **THEN** the branch is kept, the job is `interrupted` not `failed`, and it
  resumes when capacity returns, with no retry consumed

#### Scenario: Repeated capacity events shed the expensive extras

- **WHEN** a tier's ledger shows two `capacity` classifications within the
  trailing 48 hours
- **THEN** the selector refuses `post`, `education`, `scout`, `entry`, and
  `tutorial` jobs in that tier, while `verify` and `repair` remain
  selectable

## ADDED Requirements

### Requirement: The scout looks outward, takes the best three, and records the rest

The scout is the Desk job the daily queue item (see `pulse`) triggers. Its
charge, verbatim from the track that carried it on the predecessor site:
**bring back work the site could not have thought of by looking at
itself.**

- The scout SHALL sweep outward — the world beyond this repository and
  beyond the registered sources: vendor announcements and documentation,
  papers, incidents, pricing and licence pages, community signal — and MAY
  use the queue item's assembled feed context as one input among them. A
  scout run in which every filed candidate could have been written without
  leaving the repository SHALL be rejected in review as `spec-violation`
  naming this charge.
- The scout SHALL judge everything it found against the two-test bar
  (`editorial`: worth a stranger's attention; true, checkable, current)
  and SHALL file **at most three candidates per run — the most worthy
  three**, as expiring proposals. Each candidate SHALL carry the docket
  discipline: a kebab-case `slug`, a proposed job type from the closed
  list, an `expires:` date — at most 7 days out for an event-driven
  candidate, at most 14 for a synthesis — a why-now, externally retrieved
  evidence with URLs and retrieval dates, and done-when acceptance lines
  written at filing time.
- The cap SHALL be mechanical, not behavioral: at the scout's merge, the
  loop keeps at most three candidate files — by the scout's own stated
  ranking, else by filename — and every excess candidate is moved to the
  drop record rather than merged (the caps mechanism in the work-sources
  requirement).
- What the scout declines SHALL be recorded, never silently dropped: each
  considered-and-declined story becomes one record in
  `data/proposals/dropped/`, naming which test it failed and what would
  make it worth refiling. Stated honestly, the way this repository states
  it about `would-cite`: the records prove the **form** of the bar, not
  its **rate** — nothing measures how many stories the scout considered,
  so a scout that sweeps forty sources and writes three drop records is
  mechanically indistinguishable from one that considered six. The bar
  itself is an instruction to a model, checked by a model-run review from
  its checklist; the records are what make that check auditable after the
  fact, and that is all they are claimed to do.
- A day with no external story that clears the bar SHALL open the
  **synthesis branch**: the scout considers whether the accumulated
  recorded evidence — the change feed, the snapshots, the corpus's data
  layer — supports a synthesis candidate instead. The branch opens an
  avenue and never lowers the bar: it is an opportunity, not an
  obligation, and a floor reintroduced through it would be the exact
  failure the no-cadence rule exists to prevent.
- When nothing clears the bar on either branch, the scout SHALL end with
  `RESULT.md` first line `blocked: nothing cleared the bar` — an honest
  outcome the ledger records as such, and a success. Zero candidates on a
  quiet day is the bar working; a candidate manufactured to fill a day is
  the failure.
- **The blocked streak SHALL have a witness.** A `blocked:` scout outcome
  is a success everywhere it is counted — breakers exclude it, health
  streaks end on it — so nothing in the loop can distinguish a year of
  honest quiet from a bar nothing can clear. The build SHALL therefore
  derive, from `data/ledger.jsonl`, the count of consecutive scout runs
  ending `blocked:` (reset by any scout run that files a candidate) and
  record it in the published `/status.json` alongside the build stamp.
  Observability without obligation: no threshold, no floor, no breaker
  reads it — it exists so that a person or a later job can see the streak
  without excavating the ledger, and it obliges nothing.
- A scout run's diff — candidates and drop records, all model-written —
  SHALL pass the ordinary review gate before it merges, like every other
  Desk job's.

#### Scenario: A burst day is ranked, capped, and recorded

- **WHEN** a scout run finds five stories that each clear the bar
- **THEN** it files the three most worthy as expiring candidates, writes a
  drop record for each of the other two naming the judgment, and the merge
  enforces the cap mechanically if it files more

#### Scenario: An inward-looking scout is rejected

- **WHEN** a scout run's three candidates could all have been written from
  the repository's own contents, with no externally retrieved evidence
- **THEN** review rejects the run as `spec-violation` naming the charge —
  bring back what the site could not have thought of by looking at itself

#### Scenario: A quiet day opens the synthesis branch and still publishes nothing

- **WHEN** no external story clears the bar and the accumulated evidence
  supports no synthesis worth a stranger's attention either
- **THEN** the scout ends `blocked: nothing cleared the bar`, the ledger
  records it, no candidate is filed, and nothing anywhere treats the day
  as a failure

#### Scenario: A long quiet spell is visible without being punished

- **WHEN** fourteen consecutive scout runs end `blocked: nothing cleared
  the bar`
- **THEN** `/status.json` reports the streak of 14, no breaker trips, no
  floor opens, nothing selects differently — and anyone reading the
  published status can see the quiet without opening the ledger

#### Scenario: A quiet day yields a synthesis instead

- **WHEN** no single headline clears the bar but three weeks of recorded
  licence changes show a shape no single event shows
- **THEN** the scout files one synthesis candidate carrying the evidence
  set and an `expires:` at most 14 days out, through the same review gate
