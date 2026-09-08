# Job j-20260908-11 — `interpret`

You are working alone, unattended, in a git worktree checked out on branch
`job/j-20260908-11`. Everything you need is in this file and in the repository around
you. There is no prior conversation to recall and no session to resume.

- **Branch**: `job/j-20260908-11`
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

openrouter-models z-ai/glm-4.7-flash status: deprecated -> active on 2026-09-08

- **Target**: `data/changes.jsonl`
- **Subject**: `openrouter-models|519168ec44b8a2c3|c445d17afde865af|z-ai/glm-4.7-flash|status`

This is **one job with one outcome**. It ends in exactly one merge or one
discard. Do not widen it: a diff that exceeds the stated outcome is a
`scope-violation` at review and the whole job is rejected for it.

## Acceptance checks

- The annotation is appended as a NEW line keyed to the change it interprets — `data/changes.jsonl` stays append-only, and no existing line is edited.
- The annotation says what the change means and whether it matters, in one or two sentences, and cites the change record it annotates.
- No number in the annotation is stated without the source row that carries it.
- The branch still passes every gate the loop runs on it before review:
  `npm run test`, `npm run build`, `node scripts/verify-surfaces.mjs`, `node scripts/verify-design.mjs`. This list is
  generated from the gate set itself, so it cannot drift from what will actually run.
- The diff contains nothing you cannot defend from a source or a run.
- A reviewer with fresh context, seeing only your diff, can check every claim in it.

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
and a `interpret` job's flagged proposal is counted exactly as before. A proposal on a branch that
is DISCARDED dies with the branch: ideas do not
outlive the rejection of the work that produced them. At merge the loop stamps
this job's type (`interpret`) onto each kept proposal, overwriting whatever you
wrote there, and a proposal whose stamped origin type equals the type it proposes
is auto-discarded with a pointer to the self-amplification rule — so this job
cannot propose another `interpret`. Noticing across types is the designed path.

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
  anywhere downstream. This is the state both finalist builds were in on
  day one, and the state in which one of them hard-wired an empty element instead
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

The decision of record is that `post`, `prune` and `machinery` are
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

`tutorial` SHALL be on the list. The condition its exclusion rested on was the
absence of a curriculum of record for that surface, and `education-dynamic`
requires one: a surface with a map is a surface whose unmet declarations are a
set difference between two committed files, which is the same falsifiable
derivation the learn surface already runs. The distinction that keeps the other
three off the list survives intact — a map can enumerate walkthroughs and pages,
and nothing can enumerate the posts a blog is due or the defects a codebase has.

#### Scenario: A queue item of an undeclared type fails the suite

- **WHEN** a queue producer emits an item whose type is not on the declared
  list
- **THEN** the test suite fails, naming the type and the item's reason

#### Scenario: The list states its own exclusions

- **WHEN** a reader asks why the queue cannot produce a `prune` job
- **THEN** the answer is in the declared list beside the decision, not
  inferred from the absence of a producer

#### Scenario: A surface that gains a map gains a producer

- **WHEN** a surface acquires a curriculum of record and a producer is written
  for it
- **THEN** its job type appears on the declared list in the same change as the
  producer, and the test that measures every emitted item against the list
  passes without being relaxed

# pulse — delta for keep-the-map-describing-the-territory

Two requirements modified, each in the narrowest way that carries the tutorial
surface's new map of record (`education-dynamic`) into the machinery that reads
maps.

**"A surface's unmet declared coverage is queue input."** The requirement was
written generically — *"Where a surface has a curriculum of record"* — and one
bullet was not: the item always proposes an `education` job, which is the job
type that writes the learn surface and not the one that writes a tutorial. That
bullet is generalised to the job type that writes the surface in question. A
second bullet is added, and it is not new policy: `education-dynamic` already
states that a new tutorial SHALL NOT be started while an existing tutorial
stands demoted for staleness with a live subject. Today that sentence has no
mechanism because nothing can start a new tutorial at all; the moment a producer
exists, the subordination has to be computed rather than hoped for. The set
difference itself, the no-scoring rule, retirement by recomputation and the
tolerant read are unchanged.

**"Which job types the queue may produce is a stated decision."** `tutorial`
moves from the exclusion list to the producible list. Its exclusion rested on
one stated condition — *"no curriculum of record exists for that surface"* — and
`education-dynamic` now requires one. `post`, `prune` and `machinery` stay
excluded on exactly the reasoning already recorded for them, which the new
tutorial map does not touch: "the corpus is due a post" and "the machinery is
deficient" are not enumerations of anything, so no map can ever make them a set
difference.

Measured 2026-09-06, and the reason the interlock is stated in semantic terms
rather than as a state name: `lib/tutorials.mjs` derives `archived` from the
subject entry's status and decides it before `demoted`, while
`pulse/lib/corpus.mjs` reads `archived` from the tutorial's own front matter, so
the Pulse's `demoted` today includes a dead-subject tutorial whose file does not
declare itself archived. Aligning those is implementation work, not a
requirement.

Serves `addictedtoai-kat1`.

## MODIFIED Requirements

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

# pulse — delta for let-the-queue-see-a-judgment

Two requirements modified and one added. The queue stays derived and stays
incapable of accumulating; nothing here files anything into it, and every item
this change adds retires by recomputation.

Two judgments the engine already has in front of it are invisible to the queue,
in opposite directions. A review verdict that has stopped applying to the file it
approved fails the launch gate and cannot become work: nothing under `pulse/lib/`
reads review state at all today, so no queue item can exist for it, no Desk job
can select one, and the gate has no mechanical route back to green — the only
route is a person writing a directive by hand (`addictedtoai-ccky`). A declared
corroboration that two people have already adjudicated cannot be marked settled —
so the mechanism is safe only on pairs that agree, which is the opposite of the
pairs it was built for, and no entry declares one (`addictedtoai-cct`).

Both are the same shape: the queue can see the world and the corpus, and cannot
see a judgment about either. Neither is fixed by letting the queue remember
anything — the fix in both directions is a committed record the recomputation
reads, which is the shape `A carried finding is queue state, and its file is the
state` and `A withdrawn feed row is recorded once and retires when the site
answers it` already established here.

## ADDED Requirements

---

### From `specs/wiki` (full text: `D:/AddictedtoAI/openspec/specs/wiki/spec.md`)

2 requirements omitted here: the pending amendment below restates them in full. Quoting both would spend the excerpt budget on superseded text and hand you two versions of one rule.

### Requirement: Feed binding joins on declared ids, never on names

A feed-bound fact is joined to its source row by an **explicitly declared
row id**, never by name matching — name matching is guessing, and this
design never guesses. Concretely:

- An entry that binds any fact to a feed SHALL declare, in a `feeds` map in
  its front matter, the row id it corresponds to in each source, using that
  source's own id field (for OpenRouter, the row's `id` such as
  `anthropic/claude-opus-5`; each source's registry entry names which field
  is its row id).
- Each feed-bound fact declares the source id and the field path within the
  joined row (dot notation, e.g. `pricing.prompt`).
- A feed row whose id is declared by no entry feeds the model catalog and
  the changed feed; it SHALL never modify any existing entry. For a source
  with a `mints` mapping it additionally mints a **new** stub record per
  the ingest-minting rule in `pulse` — creating a new record and touching
  an existing entry are different operations, and only the first is ever
  automatic.
- A declared row id that is absent from the current snapshot SHALL cause
  the fact to render its last-known value with a visible as-of date, and a
  repair finding enters the derived queue. It never renders as current.

**The worked example** — the complete front matter of one entry, normative
for field names and shapes (prose body follows the closing delimiter):

```yaml
id: model/claude-opus-5
kind: model
display_name: "Claude Opus 5"
status: active            # active | preview | announced | deprecated | retired | dead
maintenance: living       # living | stable | dormant
aliases:
  - name: "Claude Opus 5"
    class: exclusive
  - name: "Opus 5"
    class: shared
  - name: "Claude"
    class: manual
feeds:
  openrouter-models: "anthropic/claude-opus-5"   # this source's row id
facts:
  - field: price_input
    source: feed
    feed: openrouter-models
    path: pricing.prompt
    volatility: fast
  - field: context_window
    source: feed
    feed: openrouter-models
    path: context_length
    volatility: fast
  - field: release_date
    source: cited
    value: "2026-05-01"
    source_url: "https://www.anthropic.com/news/claude-opus-5"
    accessed: "2026-08-27"
    volatility: dated
timeline:
  - date: "2026-05-01"
    event: released
    source_url: "https://www.anthropic.com/news/claude-opus-5"
mentions: []
```

#### Scenario: A declared join updates the entry

- **WHEN** the snapshot row `anthropic/claude-opus-5` changes its
  `pricing.prompt` value
- **THEN** the entry above renders the new `price_input` at next build,
  because the join was declared — not inferred

#### Scenario: An undeclared row never modifies an existing entry

- **WHEN** a new row appears in a feed and no entry declares its id
- **THEN** it appears in the model catalog and (if material) the changed
  feed, no existing entry's facts change, and — only if the source
  declares a `mints` mapping — a new stub record is created per `pulse`

#### Scenario: A vanished row cannot pose as current

- **WHEN** an entry declares a row id that the latest snapshot no longer
  contains
- **THEN** the bound facts render their last-known values with a visible
  as-of date and a repair finding appears in the derived queue

### Requirement: A seeded domain and an editorial domain are separate fields

Some domain values are re-derivable from the feed on every Pulse run, and some
are judgments. **They SHALL be carried in separate front-matter fields, and
never in one field with two regimes.** The reason is mechanical, and it lands
as a red build rather than as an opinion.

A piece's **reviewed surface** is its prose body together with its front matter
minus the keys in `MECHANICAL_FRONT_MATTER_KEYS`, and that list is matched by
key **name** across every content kind, with no per-kind scoping. So a single
`domains` field carrying both regimes has exactly two possible fates and both
are defects: on the mechanical list, an editorial judgment publishes unreviewed
and a **post's** editorially-assigned `domains` is silently exempted from
review along with it; off the mechanical list, every mechanical re-seed marks
the entry's review record `mismatched` and demands a fresh verdict on prose
nobody touched. Measured 2026-09-05, this repository holds 544 wiki entry files
under `content/wiki/` (plus `content/wiki/README.md`, which is the directory's
own README and carries no entry front matter), so the second fate is not a
corner case.

Three fields, and only the first is machine-written:

- **`domains_seeded`** — machine-maintained. Written and extended only by the
  Pulse's data-layer update step, from named feed fields, with no model
  invocation. It SHALL be listed in `MECHANICAL_FRONT_MATTER_KEYS` beside
  `timeline`, so a re-seed is not an edit to what was reviewed. It publishes
  under the review exemption for deterministic outputs of already-reviewed
  machinery, exactly as a mechanical timeline append does.
- **`domains`** — editorial. A human or a reviewed job asserts that the thing
  belongs to a domain. `research`, `science-math` and `robotics` can only ever
  be this: no feed field carries them.
- **`domains_excluded`** — editorial. Suppresses a seeded value the editor
  judges wrong.

`domains` and `domains_excluded` SHALL NOT be listed in
`MECHANICAL_FRONT_MATTER_KEYS`. Adding or changing either on an entry that
carries a bound review record is an edit to the reviewed surface, that record
reports `mismatched`, and it is corrected by a fresh verdict rather than by an
exemption. Tagging an entry editorially is a review event and the cost is the
correct one — what a thing is for is a judgment, and a judgment that publishes
unreviewed is what `review` exists to stop.

No schema that accepts an editorially-assigned domain SHALL also accept
`domains_seeded`. Because the mechanical filter matches by name across kinds,
a content kind that could carry the seeded key would have that key exempted
from review whether or not a machine wrote it.

**The effective set** a surface renders is
`(domains_seeded ∪ domains) − domains_excluded`. A value appearing in both
`domains` and `domains_excluded` SHALL fail the build naming the entry and the
value: that is a contradiction, not a precedence question, and resolving it
silently in either direction would hide an editing mistake.

**A `domains_excluded` value that appears in neither `domains_seeded` nor
`domains` SHALL fail the build**, naming the entry file, the field and the
value. An exclusion that removes nothing is a **stale edit**: a value that was
seeded or asserted once, then stopped being either, leaving behind a
suppression nobody can see doing anything. It reads as deliberate and does
nothing, which is the shape this repository keeps catching, and this gate is
what keeps `domains_excluded` meaning what it says.

Stated over the union although one branch of it is already covered: a value in
both `domains` and `domains_excluded` fails as the contradiction above, so a
legal exclusion in practice names a value in `domains_seeded`. The union is the
form written down because it is the property that has to hold — an exclusion
suppresses something — rather than the leftovers of another rule, and it stays
true if the contradiction clause is ever restated.

**The gate does not couple an editorial key to the feed, and the append-only
rule below is what makes that true.** `domains_seeded` is an accumulated record
in the entry's own front matter, not a view of the current snapshot: a publisher
dropping a signal removes nothing from it, so no exclusion goes stale because a
feed moved, and no entry nobody touched turns from green to red. Both fields
this gate reads live in the file being validated, and the check is therefore a
pure function of that file.

The ordering it imposes is stated rather than discovered: an exclusion follows
the value it suppresses and never precedes it. Writing `domains_excluded`
against a seed that has not landed yet fails the build, and the remedy is to
write it after the seeding run — not to loosen the gate.

**Seeding SHALL be append-only.** A signal appearing in the snapshot adds a
value to `domains_seeded`; a signal disappearing SHALL NOT remove one. This is
the treatment `timeline` already receives, and it is required by measurement
rather than by symmetry. Between the two committed OpenRouter snapshots —
`data/sources/openrouter-models/previous.json` (`fetched_at`
`2026-09-04T06:00:03.738Z`, `row_count` 427) and `latest.json` (`fetched_at`
`2026-09-05T06:00:04.599Z`, `row_count` 431) — the count of rows carrying a
numeric `benchmarks.artificial_analysis.agentic_index` fell from 166 to 99
across the publisher's own index rebase. Under a recomputing rule, one
publisher's rescoring would have silently deleted an `agents` tag from 67
entries overnight, with no editorial decision anywhere and nothing on any page
saying so. Removal of a seeded value is therefore an editorial act, spelled
`domains_excluded`, and it goes through review like any other judgment.

The consequence is stated rather than discovered: `domains_seeded` accumulates,
so it is a record of every signal ever observed and not a snapshot of the
current feed. A re-seed from an empty corpus would produce a smaller set than
the accumulated file. That is true of `timeline` for the same reason and is
accepted on the same terms.

**A disappearing signal writes no change line either.** The Pulse SHALL NOT
append a line to `data/changes.jsonl` on account of a feed field that once
seeded a domain ceasing to appear on a row. This governs seeding and nothing
else: a field the source registry independently declares material keeps
whatever change lines that declaration already produces, and what is forbidden
is a second emitter that fires on seeding signals.

The reason is that the source registry has already decided this exact block is
not an event, and a second emitter would overturn that decision without ever
reading it. `data/sources/registry.json` records, dated `2026-09-05`, that
`benchmarks.artificial_analysis` is *"not carried"* — *"Not a column, not a
fact, not an event"* — on the measurement that across the 2026-09-04 and
2026-09-05 fetches *"181 values went number->null with 0 going null->number"*
and that *"56 of the carrying row ids are `:batch`/`:free` twins of a
canonical_slug already counted"*. A disappearance line would re-admit one
publisher act to the changed feed through a second path that never reads that
decision, and `pulse/lib/diff.mjs:377-378` states the principle it would break:
a field *"is an event in one place or in neither"*. The volume is that one
publisher act counted directly: across those two snapshots there were 71
number→absent transitions on the two index fields whose presence is the proposed
seeding signal for `coding` and `agents`, 3 of them rows that left the snapshot
altogether — one line each — against the 182 lines
`data/changes.jsonl` held on 2026-09-05. Nothing is lost by the silence,
because seeding is append-only and the value stays on the entry.

Seeding SHALL derive values only from named feed fields, and SHALL derive them
from a field's **presence or contents**, never by republishing an index value
to a page. Reading that a row carries an index is not rendering what the index
says, so seeding is unaffected by the rights question that governs index
values; no index value renders anywhere in consequence of this requirement.

#### Scenario: A re-seed is not an edit

- **WHEN** the Pulse adds a value to an entry's `domains_seeded` and the entry
  carries an approved review record
- **THEN** the record still reports the entry as matching, because
  `domains_seeded` is outside the reviewed surface, and no re-review is
  demanded of prose nobody touched

#### Scenario: An editorial tag goes back through review

- **WHEN** `research` is added to the `domains` of an entry that already
  carries an approved review record
- **THEN** that record reports `mismatched` and the entry is not cleared until
  a new verdict is recorded against the changed bytes

#### Scenario: A publisher's rescoring does not untag the corpus

- **WHEN** a snapshot arrives in which a row no longer carries the feed field
  that seeded one of its domains
- **THEN** the entry keeps that value in `domains_seeded`, the Pulse removes
  nothing, no line is appended to `data/changes.jsonl` for the disappearance,
  and any removal is made editorially through `domains_excluded`

#### Scenario: An editorial exclusion suppresses a seeded value

- **WHEN** an entry has `image` in `domains_seeded` and `image` in
  `domains_excluded`
- **THEN** the effective set omits `image`, the entry does not appear under
  that domain on any surface, and `domains_seeded` is left as the machine wrote
  it

#### Scenario: An exclusion that suppresses nothing stops the build

- **WHEN** an entry declares `domains_excluded: [video]` and `video` appears in
  neither its `domains_seeded` nor its `domains`
- **THEN** the build fails naming the entry file, the field and the value,
  because an exclusion that removes nothing is a stale edit — it reads as a
  decision and enacts none

#### Scenario: Asserting and excluding the same domain fails the build

- **WHEN** an entry declares `audio` in both `domains` and `domains_excluded`
- **THEN** the build fails naming the entry and the value, rather than
  applying a precedence rule that would hide the mistake

#### Scenario: A post cannot carry the machine key

- **WHEN** a blog post declares `domains_seeded`
- **THEN** the build fails on the unknown key, because the post schema does not
  accept it — a post's `domains` is editorial and must stay inside the reviewed
  surface

### Requirement: Every entry is one typed record with a permanent identity

Every wiki entry SHALL be a single file whose identity is a typed id of the
form `<kind>/<slug>` (for example `model/claude-opus-5`, `org/anthropic`,
`concept/context-window`). Ids MUST be kebab-case, MUST be unique across the
corpus, and MUST never be reused or renamed. When an entry's canonical name
changes, the entry keeps its id and records the new name as an alias; if an
entry must genuinely move (wrong kind at creation), the old id SHALL become a
permanent redirect to the new id.

`kind` SHALL come from this closed list and no other value:
`model`, `org`, `tool`, `concept`, `technique`, `benchmark`, `dataset`,
`hardware`, `paper`, `event`.

There is deliberately no `person` kind. People appear in prose as plain text,
optionally with an external link. This removes the nastiest alias-collision
family (person vs. product) and the defamation-adjacent risk of maintaining
claims about living people. Adding a `person` kind requires an OpenSpec
change.

#### Scenario: Duplicate id is rejected at build time

- **WHEN** two entry files declare the same id
- **THEN** the site build fails with an error naming both file paths and the
  colliding id

#### Scenario: Unknown kind is rejected at build time

- **WHEN** an entry declares a kind outside the closed list
- **THEN** the site build fails with an error naming the file and the invalid
  kind

#### Scenario: A renamed thing keeps its id

- **WHEN** a product covered by an entry is renamed by its vendor
- **THEN** the entry's id is unchanged, the new name is added as an alias,
  the old name remains an alias, and the rename is recorded as a dated
  timeline event with a source

---

### PENDING AMENDMENT to `specs/wiki` — in-flight change `bind-what-the-catalog-knows`
(full text: `D:/AddictedtoAI/openspec/changes/bind-what-the-catalog-knows/specs/wiki/spec.md`)

This is a **delta**, not a capability spec: `## ADDED Requirements` and `## MODIFIED Requirements` blocks, restating only the requirements the change touches. It is not archived into the constitution above and does not replace it. Treat it as the pending intent for the requirements it names — where it MODIFIES one that also appears above, the amendment is the newer text.

### Requirement: A census counts the current snapshot, and prose transcludes it

A count of rows in a bound source's snapshot — how many rows a source carries,
how many belong to one provider, how many carry a field — SHALL be expressible
as a **census fact**: a fact whose value is computed at build time from the
same data layer every `{{fact:…}}` on the page renders from, and which
therefore names no date and can never be older than the page it sits on.

A census fact declares:

```yaml
facts:
  - field: catalog_rows          # a snake_case field name, as any fact
    source: census
    feed: openrouter-models      # a registered source id
    census: rows                 # an id from the closed census registry
    scope: aion-labs             # OPTIONAL: the declared provider prefix
```

It SHALL declare no `value`, no `source_url`, no `accessed` date and no
volatility class; a build finding any of those on a census fact SHALL fail,
naming the entry and the field. A census fact carries nothing an author could
have got wrong, which is the whole of its guarantee.

**The census registry is closed and has exactly one definition in the source
tree**, read by everything that resolves a census, so that two lists of the
same predicates cannot drift. A fact naming a census id the registry does not
carry SHALL fail the build, naming the entry, the field and the unknown id.

Each registered census names its source and exactly one predicate, drawn from
this closed list of predicate kinds:

- **every row** in the source's current snapshot;
- **a declared dotted path present** on a row — a value that is neither null
  nor empty;
- **a declared dotted path exactly true** on a row;
- **a row id ending in a declared literal**;
- **providers whose row count is at least a declared number** — a count of
  providers, not of rows, and the one kind that takes no scope.

The first four kinds accept the optional `scope`. A `scope` declared on a
census whose kind takes none SHALL fail the build, naming the entry, the field
and the scope — a declared value the predicate cannot use is an inert
declaration, and this build refuses those.

Adding a census over an existing predicate kind is an ordinary code change with
a test; adding a new predicate **kind** is a change to this specification,
because a predicate kind is a new shape of claim the corpus can make.

**A census joins on a declared value, never on an entry's name.** `scope`
carries the provider prefix the entry means, exactly as a feed-bound fact
carries the row id it means. Nothing infers the prefix from the entry's
`display_name`, its id or any alias, for the reason feed binding gives: name
matching is guessing. An entry needs no row of its own to carry a census — an
`org` entry has none — and no new `kind` is introduced to hold one.

**Zero and absent are different answers and SHALL render differently.** A
census whose predicate matches no row, on a scope the snapshot does contain,
renders `0`: nothing matched, and that is a fact. A census with no data layer
behind it — before the first Pulse run — renders as absent, never as `0`,
because `0` is a claim and "not fetched" is not. A `scope` value the current
snapshot matches on no row SHALL render as absent and SHALL put a repair
finding in the derived queue: a scope nothing matches is far likelier to be a
mistyped prefix than a provider that vanished overnight, and a wrong count is
worse than a missing one.

A census fact SHALL render its value with its source reachable from the page —
the named source, and the date of the snapshot it was counted in — and with no
overdue marker and no as-of hedge, because it cannot be stale. It is
transcluded by the transclusion syntax already normative in this
specification; no new marker is introduced, and the syntax stays closed.

#### Scenario: A count comes from the snapshot the page renders from

- **WHEN** an `org` entry declares a census fact scoped to its provider prefix
  and a prose sentence transcludes it
- **THEN** the rendered page states the number of rows that prefix has in the
  snapshot the page's other transclusions render from, with the source and the
  snapshot's date beside it

#### Scenario: The snapshot advances and nothing is edited

- **WHEN** the next fetch adds rows to the source and the site is rebuilt
- **THEN** every page transcluding a census over that source renders the new
  count, no file is edited, no date is updated, and no build error is raised —
  there was no date on the claim to fall out of step

#### Scenario: A predicate that matches nothing renders zero

- **WHEN** a census counts rows carrying a field, scoped to a provider the
  snapshot contains, and no row of that provider carries it
- **THEN** the fact renders `0` with its source and snapshot date

#### Scenario: No data layer renders absent, never zero

- **WHEN** a census fact is rendered before any Pulse run has produced a data
  layer
- **THEN** it renders as absent with its source named, and never as `0`

#### Scenario: A scope nothing matches is a repair finding

- **WHEN** an entry declares a census scoped to a provider prefix that no row
  in the current snapshot carries
- **THEN** the fact renders as absent, a repair finding enters the derived
  queue naming the entry and the scope, and no number is rendered

#### Scenario: An unknown census id fails the build

- **WHEN** an entry declares a census fact naming a census id the registry does
  not carry
- **THEN** the build fails naming the entry, the field and the unknown id,
  before any page renders

#### Scenario: A scope on a census that takes none fails the build

- **WHEN** an entry declares a census fact naming the providers-count census —
  the one predicate kind that takes no scope — and also declares a `scope`
- **THEN** the build fails naming the entry, the field and the scope, before any
  page renders

#### Scenario: A census fact carrying a typed value fails the build

- **WHEN** an entry declares a census fact that also declares a `value`, an
  `accessed` date or a volatility class
- **THEN** the build fails naming the entry and the offending key — a computed
  count with a typed value beside it is the restatement the binding removes

### Requirement: Entries carry structured, sourced, dated facts

Each entry SHALL carry zero or more facts in its structured front matter.
Every fact MUST declare:

- a field name (for example `context_window`, `price_input`, `license`,
  `status`),
- a value,
- a source: either `feed` (the value is bound to a named field of a named
  Pulse data source and rendered from the data layer at build time),
  `census` (the value is a count of the rows of a named Pulse data source that
  a named predicate matches, computed from that same data layer at build time)
  or `cited` (a manual value with a `source_url` and an `accessed` date),
- a volatility class: `fast` (re-check within 14 days), `slow` (re-check
  within 120 days), `static` (not re-checked), or `dated` (true as of its
  date, displayed with the date, never re-checked).

A `census` fact is the single exception to the volatility bullet: it SHALL
declare no volatility class, and a build that finds one on a census fact SHALL
fail naming the entry and the field. Nothing re-checks a count recomputed from
the current snapshot at every build, so an interval on one would describe a
staleness it cannot have.

A `cited` fact whose `accessed` date is older than its volatility interval
SHALL be rendered with a visible overdue marker. A fact MUST never render
without its source being reachable from the rendered page (a link for
`cited`, the named source for `feed` and for `census`).

#### Scenario: Feed-bound fact updates without editing the entry

- **WHEN** the Pulse's data layer records a new value for a feed-bound fact
  (for example, a model's price changes at the source)
- **THEN** the next site build renders the new value on the entry page and on
  every page that transcludes that fact, with no edit to any entry or prose
  file

#### Scenario: Overdue cited fact is visibly overdue

- **WHEN** a `fast` cited fact's `accessed` date is more than 14 days old at
  build time
- **THEN** the rendered fact carries a visible marker stating when it was
  last verified, injected by the build, not authored by hand

#### Scenario: Fact without a source fails the build

- **WHEN** an entry declares a `cited` fact with no `source_url` or no
  `accessed` date
- **THEN** the site build fails naming the entry and the field

#### Scenario: A census fact declaring a volatility class fails the build

- **WHEN** an entry declares a `census` fact carrying `volatility: fast`
- **THEN** the build fails naming the entry and the field — a value recomputed
  at every build has no re-check interval

### Requirement: Volatile facts travel by transclusion, never by restatement

Prose anywhere on the site (wiki bodies, education pages, tutorials, blog
posts) SHALL state a volatile fact (any `fast` or `slow` fact: price, context
window, version, status, benchmark score) only by transcluding it from the
owning entry, rendered with its current value at build time. The normative
transclusion syntax is `{{fact:<kind>/<slug>#<field>}}` (for example
`{{fact:model/claude-opus-5#price_input}}`), chosen for grep-ability and
for being inert in any other Markdown renderer; the want marker's normative
syntax is `{{want:Name}}`. Prose MUST NOT hard-code a volatile value as
literal text.

**A count of rows in a bound source's snapshot is a volatile fact of exactly
this kind**, and it SHALL travel the same way. It changes whenever the snapshot
advances, which for a daily-fetched source is most days. Where a registered
census carries the predicate, prose states such a count only by transcluding it;
a count no registered census carries stays under the snapshot-census check and
its hedge. A date written beside a typed count does not exempt it from either:
dating a count makes it honest about the day it describes, it does not make it
current, and the page's own transclusions go on rendering from a newer snapshot
than the date names.

A transclusion whose target entry or field does not exist SHALL fail the
build. Enforcement of the no-hard-coding rule is the reviewer's named
checklist item for every prose piece (see `review`); the build additionally
warns on currency-shaped literals (a number adjacent to `tokens`, `context`,
`$`, `/month`, or a version pattern) in prose outside the wiki data layer.
The reviewer's checklist item SHALL name the census case explicitly, and a
prose piece that types a row count where a census fact could carry it SHALL be
rejected as `spec-violation` naming the census that would have carried it.

#### Scenario: Correcting a fact corrects every surface

- **WHEN** a fact value is corrected on its owning entry
- **THEN** every page that transcludes it shows the corrected value at the
  next build, with no other file edited

#### Scenario: Broken transclusion fails the build

- **WHEN** a prose file transcludes `model/foo · price_input` and no such
  entry or field exists
- **THEN** the site build fails naming the prose file and the missing
  reference

#### Scenario: A dated row count is still a restatement

- **WHEN** a draft states a provider's row count as a numeral with the
  snapshot's date beside it, and a census over that predicate is available
- **THEN** review rejects it as `spec-violation` naming the census fact that
  would have carried the number — the date makes the sentence honest about one
  morning, and the surrounding transclusions are rendering from another

# wiki — delta for bind-what-the-catalog-knows

Two requirements added and two modified. Nothing here changes what an entry
is, how a fact is sourced, how a transclusion is written, or what the reviewer
checks: it adds two bindings for values the corpus already states by hand — a
count of rows in a snapshot, and the date a catalog row was listed — so that
neither has to be typed, dated, or re-dated by anybody.

The two bindings are the same shape as the one already in the specification.
A feed-bound fact says *this value is a named field of a named row*; a census
fact says *this value is a count of the rows a named predicate matches*; a
feed-bound timeline event says *this date is a named instant on a named row*.
All three join on a declared id and none of them guesses.

Why the census half is here rather than left to the check that guards it: the
snapshot-census build check makes a typed count honest, and honest is not the
same as current. A count marked "as observed on 31 August 2026" stops being
wrong and starts being old, while the transclusions two paragraphs below it
render from the snapshot fetched this morning. On 2026-09-06, eighteen counts
across ten wiki pages are in that state and two more are one Pulse run away
from failing the build. A count that is computed cannot be in that state at
all.

## ADDED Requirements

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

### Requirement: Rejection has mechanics and an end

A `revise` or `reject` verdict SHALL name the reason(s) from the list and
the specific locations at issue. What happens next:

1. `revise`: the authoring side (same job, fresh or resumed run) gets
   exactly one revision pass against the named findings, then a delta
   review of only what changed.
2. A second non-approval SHALL discard the job: branch closed, one-line
   record of the reasons kept. No third pass, no indefinite loop.
3. A discarded piece may return only as a new job with new evidence or a
   changed approach; the record of the prior rejection travels with it.

Disagreement resolves in the reviewer's favor by default: the author never
overrules the reviewer, and nothing publishes on a tie. If the authoring
side believes the rejection itself violates these specs, it MAY file a beads
issue for the maintainer; the work stays unpublished meanwhile. Review is
bounded by construction — one review, one revision, one delta review — so it
can never become an unbounded gate that stops entries shipping; a review
that delays publication indefinitely has failed exactly as review skipped.

#### Scenario: Two strikes and the branch closes

- **WHEN** a revised draft fails its delta review
- **THEN** the job is discarded with reasons recorded, and the loop moves on

# review Specification

## Purpose
Mandatory review: every change the loop proposes and every piece of content
it produces is reviewed before it publishes. Review was the highest-value
part of the previous machinery — on one representative day nine review rounds
each found something real that no automated check had caught — and it is
designed here to be light enough that it never becomes the bottleneck that
stops entries shipping.

## Requirements

### Requirement: What is checked depends on what the work is

The reviewer SHALL work from the checklist for the job's kind — reviewing a
wiki entry, a tutorial, and a machinery change are not the same job:

- **Wiki entry**: every cited fact has a reachable source and the source
  says what the fact says (fetch and confirm — do not assume); volatile
  values are transclusions or feed-bound, not literals; aliases sanely
  classed; prose adds something beyond the data.
- **Tutorial**: evidence the steps were actually executed (transcript or
  reproduced outputs) — plausibility is not verification; `subjects`,
  `verified_against`, `verified_on` complete and honest; unexecuted steps
  disclosed; perishables all declared.
- **Blog post**: every external claim source-checked by fetching; title and
  excerpt read against the body for overclaim; company-conduct claims held
  to the news-fact-checking standard; dates explicit. Additionally, the
  reviewer SHALL identify the post's form (news note or synthesis — see
  `blog`) and apply that form's finish line: for a note, the declared
  anchor holds (external anchors fetched and confirmed to document the
  event and its date), the affected party is named where one exists, and
  brevity alone is never a defect; for a synthesis, the derivation method
  is stated and the evidence enumerable. The reviewer SHALL judge the
  prose against the voice document `blog` names, rejecting
  `reads-as-generated` where it reads machine-made — the advisory voice
  lint's build warnings MAY be cited as evidence, but the judgment is the
  reviewer's, not the count's — and SHALL answer the
  send question in the record's `would-cite` field — who would send this,
  and to whom — in its own words.
- **Scout run**: the charge's failure condition applied first — a run
  whose candidates could all have been written without leaving the
  repository fails it; evidence URLs spot-checked by fetching; every
  candidate carries slug, type, `expires:`, why-now, retrieval-dated
  evidence, and done-when lines; every declined story has a drop record
  naming the failed test and a refile condition; at most three candidates
  filed.
- **Education page**: no perishable literals; prerequisites and the
  "after this you will understand" statement honest; beats the obvious
  alternative.
- **Directory/curated data**: spot-check changed rows against their sources.
- **Machinery change**: run the changed check or script and confirm the
  claimed behavior — red before, green after where applicable; every claim
  about what the change does verified by executing, not by reading; guard
  rails tested by attempting what they forbid.

For a job that originated from a proposal, the checklist additionally
includes the rejection index (`data/proposals/rejected/`): the reviewer
confirms the piece is not a differently-worded re-tread of a rejected
proposal — this is the judgment half of duplicate suppression, whose
mechanical half is the exact slug match in `loop`.

In every kind, the reviewer's standing instruction is: **for every claim
about what something does, run the cheap direct check; for every sourced
claim, confirm the source supports it.** The defect class this review exists
to catch is the claim written from intent rather than measurement — found
repeatedly by skeptical readers on the previous site and never once by an
automated check.

#### Scenario: The reviewer measures instead of reading

- **WHEN** a machinery diff claims "this makes X impossible"
- **THEN** the reviewer attempts X against the changed code and the verdict
  cites the attempt's observed result, not the diff's description

#### Scenario: A scout run is checked against its charge

- **WHEN** a scout run's diff arrives for review with three candidates and
  two drop records
- **THEN** the reviewer verifies the candidates carry externally retrieved,
  retrieval-dated evidence, spot-fetches it, and rejects the run as
  `spec-violation` if everything filed could have been written from the
  repository alone
