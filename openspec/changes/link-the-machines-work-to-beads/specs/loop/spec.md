# loop — delta for link-the-machines-work-to-beads

Every normative sentence below names, in `tasks.md`, the task that implements
it and the check that measures it.

## ADDED Requirements

### Requirement: The machine's work is joinable to the issue tracker

Beads is this project's persistent memory across models, providers and
harnesses, and the maintainer's standing rule for humans is that a deferral
lives in *its own issue with its own id*, because a thought that exists only
inside something finished is already lost. The machine had no equivalent: of 18
job lines in `data/ledger.jsonl`, **none** carried an issue id and no such field
existed, so *"what did the machine ever do about `addictedtoai-X`"* could not be
asked of any artifact.

- The loop SHALL define the beads id format in **exactly one place**, and that
  definition SHALL be a pure function of a string — no process, no filesystem,
  no network. Implemented by task 1.1; measured by `issues.test.mjs` cases
  1a–1b.
- Validation of an id SHALL split into a **format** check and an **existence**
  check, and the two SHALL NOT be conflated. The format check SHALL be usable
  anywhere, including inside `next build`; the existence check SHALL run only
  where `bd` is present. `next build` runs on Vercel, where the `bd` binary does
  not exist and the Dolt store is unreachable, so a build that resolved ids
  against the store would make the site unbuildable. Implemented by tasks 1.1
  and 4.1; measured by task 4.2's SKIP path.
- Nothing in the loop SHALL create, close, or synchronise a beads issue as a
  side effect of a run. `bd dolt push` is the maintainer's decision alone, and a
  gate that filed an issue to satisfy itself would manufacture the backlog it
  exists to keep honest. Implemented by task 4.1; measured by task 4.3.

#### Scenario: The join answers a question that was previously unanswerable

- **WHEN** a job that serves `addictedtoai-X` completes and the run appends its
  ledger line
- **THEN** that line carries `addictedtoai-X`, and every job the machine ever
  ran against that issue is one read of one file

### Requirement: An issue id declared in front matter is format-checked; prose is harvested

A **declared field** is a promise about its own shape. A line of **prose** makes
no such promise. The two SHALL therefore be read differently, and the asymmetry
is deliberate rather than an inconsistency.

- A proposal MAY declare `issue:` in its front matter, carrying one id or
  several. The loop SHALL validate its **format** at parse time, beside the
  existing `slug` and `type` checks. Implemented by task 2.1; measured by
  `issues.test.mjs` case 3a.
- A proposal whose declared `issue:` is not a well-formed id SHALL be treated as
  `malformed` and SHALL NOT be selectable, and the run SHALL report it naming
  the file and the offending value — on exactly the terms a bad `type:` already
  gets. An `issue: see the tracker` that parsed as *no issue* would be a link
  that reads as present and joins to nothing. Implemented by task 2.1; measured
  by `issues.test.mjs` case 3a and by the mutation test in task 5.2.
- A `DIRECTIVES.md` line SHALL NOT require a new syntax. The loop SHALL harvest
  ids from the line's text wherever they appear, so that a line naming an issue
  in ordinary prose is joined mechanically and every line already in the file
  stays valid. Implemented by task 3.1; measured by `issues.test.mjs` cases
  4a–4d.
- Harvested prose SHALL NOT produce a malformed result. A directive naming no
  issue is a normal directive, not a defect. Implemented by task 3.1; measured
  by `issues.test.mjs` cases 2c and 4c.
- The harvest SHALL survive the `[done <date> <job-id>]` completion marker the
  loop appends to a directive line. Implemented by task 3.1; measured by
  `issues.test.mjs` case 4b.

#### Scenario: A malformed declared id stops the proposal rather than being ignored

- **WHEN** a proposal declares `issue: see the tracker`
- **THEN** it is reported as malformed naming the file and the value, it is not
  selectable, and a sibling proposal declaring nothing at all is still selectable

### Requirement: The ledger line carries the join, as a list, additively

`data/ledger.jsonl` is append-only and is the durable record of what the machine
actually did. It is therefore where the join belongs, and the constraints on
changing it are unusually tight.

- A ledger line SHALL carry the issue ids its job served under an `issues` key
  whose value is a **list**. A job can serve more than one issue, and a scalar
  that later had to become a list would be a migration across an append-only
  file. Implemented by task 3.2; measured by `issues.test.mjs` cases 5a and 5d.
- The `issues` key SHALL be **omitted entirely** when a job serves no issue, and
  `LEDGER_FIELDS` SHALL NOT be extended to require it. Requiring an id per job
  would manufacture backlog noise: a `verify` job triggered by an overdue fact
  is routine upkeep with nothing behind it, and the requirement belongs where
  work would otherwise be lost, not everywhere. Every line written before this
  key existed SHALL remain valid. Implemented by task 3.2; measured by
  `issues.test.mjs` cases 5b and 5c, and by the mutation test in task 5.2.
- A job whose work spans more than one run SHALL serve the same issues in each,
  recovered from the branch rather than re-derived. A resumed run SHALL NOT
  recompute the join from a source file the maintainer may have edited in
  between. Implemented by task 3.3; measured by task 5.3.
- Where a proposal carrying an id is retired — consumed, or swept at its
  expiry — the retirement record SHALL name that id. This SHALL propagate an id
  the proposal already declared and SHALL NOT require one that it did not.
  Implemented by task 3.4; measured by task 5.3.

#### Scenario: Routine upkeep writes no key

- **WHEN** a `verify` job triggered by an overdue fact completes
- **THEN** its ledger line carries no `issues` key at all, and that absence is
  the mechanism working rather than a gap in it
