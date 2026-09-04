# Pulse — delta

Amended in one clause: the derived queue produced one item per file under
`data/carried/`, and now produces one item per **subject**. The file is still
the state and retirement is still deletion — what moves is the unit of work,
not the unit of storage. Everything else in the requirement is carried over
verbatim; the measurement and the reasoning are in `proposal.md`.

## MODIFIED Requirements

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
