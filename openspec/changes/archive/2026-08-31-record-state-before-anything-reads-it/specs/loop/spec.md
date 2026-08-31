# loop — delta for record-state-before-anything-reads-it

Two requirements about **when a record is written relative to what reads it**.
Neither changes what a job is, what a job may cost, or where work comes from —
which is why both are added beside the requirements they concern rather than
folded into them. That is not a formatting preference: `make-the-blog-worth-
sending` already carries `MODIFIED` blocks for *"One job is one outcome with one
merge or discard"* and *"Work comes from three sources and cannot self-amplify"*,
and two unarchived changes modifying one heading is last-writer-wins with
nothing to catch it (this change's `design.md`, D1).

Every normative sentence below names, in `tasks.md`, what implements it and what
measures it.

## ADDED Requirements

### Requirement: A job's ledger line is written before anything recomputes the queue from it

Part of the Desk's work queue is a **function of the ledger** — some queue items
exist precisely because `data/ledger.jsonl` does *not* record a job of their kind
having run. So the order of two writes at the end of a run is load-bearing.

- When a job's outcome is settled, the loop SHALL append that job's ledger line
  **before** any recomputation of the derived tree or the work queue within the
  same run. A recomputation that ran first would derive the queue from a record
  of the world missing the job that had just finished, and re-advertise the work
  that job just did.
- The line SHALL be appended **exactly once** per job run, however many code
  paths in the run reach the append.
- Recomputing the queue SHALL remain a pure function of **recorded** state —
  the ledger file as it stands on disk, and the clock. The derivation SHALL NOT
  be taught about an in-flight job as an alternative to this ordering. The
  ledger is the file whose whole purpose is to record what happened, and a
  second notion of that beside it would drift from it. *Recorded*, not
  *committed*: the append and the recomputation happen within one run and the
  commit comes later, so a derivation that read only committed state would not
  see the line this ordering exists to put in front of it.

Measured, 2026-08-30, before the fix: the daily scout ran; the post-merge
recomputation still advertised its item, because the predicate reads the ledger
and the scout's line was not in it yet; and the very next Desk run selected the
scout again. 20.7 model-minutes on a duplicate daily sweep, and a once-per-day
guarantee violated by the mechanism that implements it.

#### Scenario: A merged job is on the record before the queue is recomputed

- **WHEN** a job merges and the loop recomputes the derived tree from the merged
  state
- **THEN** `data/ledger.jsonl` already carries that job's line, so the recomputed
  queue does not re-advertise the work the job just did

#### Scenario: The ordering suppresses today's item, not the mechanism

- **WHEN** a job of some other type merges on the same day, and no job of the
  once-a-day kind has run
- **THEN** the recomputed queue still offers that day's item — the ordering
  retires the record of what happened, never the derivation itself

#### Scenario: One line per run, not one per code path

- **WHEN** a run reaches its end through the merge path, which records the
  outcome early, and then through the common tail that records it too
- **THEN** exactly one ledger line exists for that job run

### Requirement: A proposal a merged job consumed is retired

A proposal that has been selected, written, reviewed and merged is finished
work. Left in `data/proposals/` it stays selectable, and the next run is
dispatched at a piece that already exists — every run, until its `expires:`
arrives. Observed 2026-08-30, with three retired by hand before there was a
mechanism.

- A proposal a job was selected from SHALL be retired when that job **merges**,
  to `data/proposals/consumed/`, with a note naming the job, the merge commit,
  and the artifacts the merge produced.
- Only a **merged, `done`** outcome SHALL consume a proposal. The proposal a
  **discarded** job was *selected from* SHALL remain selectable: what the
  reviewer rejected was the work, not the idea, and deleting a candidate on the
  strength of one bad attempt at it is not a judgment the loop is entitled to
  make. This concerns only the proposal a job was selected from; a proposal a
  discarded job *produced* dies with its branch, which is a different rule in a
  different requirement.
- A job drawn from the derived queue or from a directive SHALL retire nothing.
- `data/proposals/consumed/` SHALL be a **record and never a block**, on the same
  terms as `data/proposals/dropped/` and unlike `data/proposals/rejected/`: a
  slug appearing there SHALL NOT suppress a later proposal carrying the same
  slug. Being written about once is not a reason a subject may never be written
  about again.
- Retirement SHALL be **mechanical**: it invokes no model and spends no
  inference.
- Selection SHALL record on the job's branch what the job was selected from, as
  data rather than as prose to be parsed, using a repository-relative path so it
  survives being read from another worktree. Without it a **resumed** run — whose
  job object is rebuilt from the branch and cannot remember a selection made in
  an earlier run — would merge and leave its proposal live, which is the same
  defect through the resumption door. That record SHALL be removed with the rest
  of the job scaffolding before the merge, so it never reaches `main`.
- Both halves of the move — the removal and the addition — SHALL be committed
  together with the job's records, so the history never shows one proposal
  existing in two places.

#### Scenario: A consumed idea is not offered again

- **WHEN** a job selected from a proposal is approved and merged
- **THEN** the proposal moves to `data/proposals/consumed/` naming the job, the
  merge commit and what it produced, and the next run does not select it

#### Scenario: A discarded job does not consume its proposal

- **WHEN** a job selected from a proposal is discarded by the reviewer
- **THEN** the proposal is still in `data/proposals/` and still selectable — the
  work was rejected, the idea was not

#### Scenario: A retired subject may be proposed again

- **WHEN** a new proposal carries the same `slug` as one in
  `data/proposals/consumed/`
- **THEN** it is selectable on its own merits, unlike a slug matching one in
  `data/proposals/rejected/`, which is still auto-discarded

#### Scenario: An interrupted proposal job still retires its proposal

- **WHEN** a job selected from a proposal is interrupted and a later run resumes
  its branch, and that resumed run merges
- **THEN** the proposal is retired, because the branch carries the record of what
  the job was selected from

#### Scenario: A queue job retires nothing

- **WHEN** a job drawn from the derived queue merges
- **THEN** no proposal is moved and nothing in `data/proposals/` changes
