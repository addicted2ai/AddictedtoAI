# Job j-20260906-11 — `interpret`

You are working alone, unattended, in a git worktree checked out on branch
`job/j-20260906-11`. Everything you need is in this file and in the repository around
you. There is no prior conversation to recall and no session to resume.

- **Branch**: `job/j-20260906-11`
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
- **Work source**: proposal (proposal `org-directives-demand-a-feeds-map-that-cannot-exist`)

## The outcome

All eight `entry` directives written so far for the uncovered catalog providers — seven of them still unrun — carry the sentence "WHAT THE ENTRY MUST CARRY OR THE ROW IS BLANK: its `feeds` map, which is the join the board relies on", and the population they are drawn from is 34. Measured against the code, that premise is false in both halves: the board joins an org to its catalog rows by ALIAS (`matchProviders`, `lib/render/frontier.mjs:50`), not by `feeds`, and no registered source yields organisation-keyed rows for an org `feeds` map to bind to (`data/sources/registry.json` — both sources are keyed on a model id). A job that complies literally writes a wrong join, which the same directive forbids in its next sentence. This job would settle the question in the record and correct the remaining directive lines: state what the board's org join actually is, state that an org entry carries no `feeds` map, and say where the brand-domain half belongs now that `publishes_from` is specified but unimplemented.



All eight `entry` directives written so far for the uncovered catalog providers — seven of them still unrun — carry the sentence "WHAT THE ENTRY MUST CARRY OR THE ROW IS BLANK: its `feeds` map, which is the join the board relies on", and the population they are drawn from is 34. Measured against the code, that premise is false in both halves: the board joins an org to its catalog rows by ALIAS (`matchProviders`, `lib/render/frontier.mjs:50`), not by `feeds`, and no registered source yields organisation-keyed rows for an org `feeds` map to bind to (`data/sources/registry.json` — both sources are keyed on a model id). A job that complies literally writes a wrong join, which the same directive forbids in its next sentence. This job would settle the question in the record and correct the remaining directive lines: state what the board's org join actually is, state that an org entry carries no `feeds` map, and say where the brand-domain half belongs now that `publishes_from` is specified but unimplemented.



The cost is per-job and it accrues on a schedule, which is why this carries an
expiry rather than cooling. Seven `entry` directives for uncovered catalog
providers are still queued in `DIRECTIVES.md`, each repeating the same two
instructions verbatim, and 26 more providers have no directive written yet —
so the sentence will be copied again unless it is corrected at the source. A
job that reads it literally has three exits and two of them are bad: invent an
org `feeds` entry pointing at one of its own model rows (a wrong join, and one
that two other subsystems act on); add `publishes_from` and fail the build; or
work out for itself, as this one did, that the sentence describes a mechanism
the repository does not have — which costs a chunk of every job's budget to
rediscover, once per job.

The ruling worth recording is narrow and mechanical. The board's org join is
the alias join; an org entry declares no `feeds`; and the brand-domain
requirement is real but currently unlandable, so until
`separate-a-claim-from-a-fact` tasks 12 and 15 land, an org's own domain
reaches the vendor test only through the name-token half of `isVendorSourced`.
That half works for `minimax.io` and fails for `hailuoai.video` and
`talkie-ai.com`, both linked from MiniMax's own front page — so the FM-N6 gap
the directives correctly worry about is real, it is just not addressable from
an entry today.

Where the ruling should live is part of the job, exactly as it was for
`j-20260905-25`: the directive text itself is the place the next author meets
it, and `lib/render/frontier.mjs`'s block comment is the place the next
implementer does.

This is **one job with one outcome**. It ends in exactly one merge or one
discard. Do not widen it: a diff that exceeds the stated outcome is a
`scope-violation` at review and the whole job is rejected for it.

## Acceptance checks

- The annotation is appended as a NEW line keyed to the change it interprets — `data/changes.jsonl` stays append-only, and no existing line is edited.
- The annotation says what the change means and whether it matters, in one or two sentences, and cites the change record it annotates.
- No number in the annotation is stated without the source row that carries it.
- The repository still builds (`npm run build`) and `npm test` still passes.
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
`data/proposals/dropped/` with a note naming them. A proposal on a branch that
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

---

### PENDING AMENDMENT to `specs/pulse` — in-flight change `separate-a-claim-from-a-fact`
(full text: `D:/AddictedtoAI/openspec/changes/separate-a-claim-from-a-fact/specs/pulse/spec.md`)

This is a **delta**, not a capability spec: `## ADDED Requirements` and `## MODIFIED Requirements` blocks, restating only the requirements the change touches. It is not archived into the constitution above and does not replace it. Treat it as the pending intent for the requirements it names — where it MODIFIES one that also appears above, the amendment is the newer text.

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

# pulse — delta for separate-a-claim-from-a-fact

Three requirements added. Nothing here changes the fetch/snapshot/hash/diff
cycle, the append-only nature of `data/changes.jsonl`, the zero-model property,
the stop-file behaviour, or the publish step. `data/derived/` stays a pure
function of state, and the new derived file is held to the same byte-identity
property as every other file under it.

The order is `loops/ui-loop/graph/knowledge/DESK-ORDER-001.md` §4; the mechanism
is `loops/ui-loop/graph/knowledge/frontier-plan.md` §2.3 and §6; the reason each
clause exists is `loops/ui-loop/graph/knowledge/SPEC-REVIEW-GUIDE.md` §4 rows 53
and 54.

## ADDED Requirements

---

### From `specs/wiki` (full text: `D:/AddictedtoAI/openspec/specs/wiki/spec.md`)

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

### Requirement: Entries carry structured, sourced, dated facts

Each entry SHALL carry zero or more facts in its structured front matter.
Every fact MUST declare:

- a field name (for example `context_window`, `price_input`, `license`,
  `status`),
- a value,
- a source: either `feed` (the value is bound to a named field of a named
  Pulse data source and rendered from the data layer at build time) or
  `cited` (a manual value with a `source_url` and an `accessed` date),
- a volatility class: `fast` (re-check within 14 days), `slow` (re-check
  within 120 days), `static` (not re-checked), or `dated` (true as of its
  date, displayed with the date, never re-checked).

A `cited` fact whose `accessed` date is older than its volatility interval
SHALL be rendered with a visible overdue marker. A fact MUST never render
without its source being reachable from the rendered page (a link for
`cited`, the named source for `feed`).

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

### Requirement: Entries carry lifecycle status and maintenance class

Every entry SHALL carry a status from: `active`, `preview`, `announced`,
`deprecated`, `retired`, `dead`. Status changes SHALL be recorded as dated,
sourced timeline events. Dead and retired things SHALL be kept, never
deleted — the lifecycle record is a differentiator, not an embarrassment.

Every entry SHALL carry a maintenance class:

- `living` — has feed-bound or `fast` facts; the Pulse re-checks on cadence.
- `stable` — `slow` facts only; re-checked on the slow cadence.
- `dormant` — explicitly stamped on its page: "A record as of <date>. No
  longer actively maintained." Costs nothing to keep, forever.

An entry whose subject dies SHALL settle to `dormant` once its final
lifecycle events are recorded. Upkeep burden tracks the living frontier of
the field, not the total corpus size.

#### Scenario: A dormant entry costs nothing and says so

- **WHEN** an entry is classed `dormant`
- **THEN** its page renders a visible "record as of <date>, no longer
  actively maintained" stamp injected by the build, and no re-check work is
  ever generated for it

#### Scenario: Status change becomes a timeline event

- **WHEN** the Pulse's data layer shows a model's status moved from `active`
  to `deprecated`
- **THEN** the entry gains a dated timeline event with the source, and the
  change appears in the home page's changed feed

---

### PENDING AMENDMENT to `specs/wiki` — in-flight change `separate-a-claim-from-a-fact`
(full text: `D:/AddictedtoAI/openspec/changes/separate-a-claim-from-a-fact/specs/wiki/spec.md`)

This is a **delta**, not a capability spec: `## ADDED Requirements` and `## MODIFIED Requirements` blocks, restating only the requirements the change touches. It is not archived into the constitution above and does not replace it. Treat it as the pending intent for the requirements it names — where it MODIFIES one that also appears above, the amendment is the newer text.

### Requirement: A vendor claim is its own record, filed beside the entry

A **vendor claim** is a thing a party said about itself or its product. A
**fact** is a value the site records with a source. The corpus has had only the
second shape, and the cost of that was paid twice: both finalist builds of
`/frontier` rendered organisation founding dates and founders under
"claimed · unverified", independently, because the only structure available for
"what this vendor says" was "any cited fact"
(`loops/ui-loop/graph/knowledge/implementer-ledger.md` rows 2 and 4). A founding
date is not a vendor claim and SHALL never render as one — and measured on
2026-09-05, all thirteen of the `founded` facts that a first-cited-fact rule
selects are cited from `en.wikipedia.org`, so what shipped was an
encyclopaedia's account of an incorporation presented as a company's own words.

RD-004 states the confusion exactly, and the requirement exists to make the
sentence mechanically true: *`source: cited` records that a value carries a
citation, never that the citation is the vendor's own assertion.*

**The record is a content record of its own, and it is NOT a field on the
entry.** Two mechanisms, not a preference:

- A review record binds a piece's **reviewed surface** — its body plus its front
  matter minus the mechanically-maintained keys, matched by key **name** across
  every content kind. A claim carried in an entry's front matter would either sit
  on that mechanical list, publishing a model-transcribed quotation unreviewed
  and exempting the same key name on every other kind that ever declares it; or
  sit off it, so that a claim arriving — or a verification landing months later
  on a claim already filed — marks the entry mismatched and demands a fresh
  verdict on prose nobody touched.
- A claim ages on **its source's** clock. An entry's cited facts are re-checked
  on the entry's volatility cadence, and the Pulse computes overdue facts every
  run. "Anthropic said this on 2026-08-27" is true forever and re-checking it
  means nothing; what moves is whether anyone has verified it, on the verifier's
  clock. One file cannot answer to two freshness regimes.

Therefore:

- A claim SHALL be a single file under `content/claims/`, validated by its own
  schema, loaded by the same corpus loader as every other content type, and
  classified field-by-field as author prose or not — the exhaustiveness rule in
  "Author-written front matter is prose for the volatile-literal check" applies
  to it in full, and a new string field on it that is classified in neither list
  SHALL fail the build.
- Each record SHALL declare, and the build SHALL fail naming the file and the
  field when any is missing or malformed:
  - **`subject`** — the entry id the claim is about, in the `<kind>/<slug>` form,
    resolved against the corpus exactly as `mentions` is. A subject naming no
    entry SHALL fail the build. The join is **declared, never inferred**: no
    name match, no host match, no title match, for the reason `feeds` binds on a
    declared row id.
  - **`field`** — a snake_case name for the ability or field the claim is about.
    It names what the claim is *about* and SHALL NOT be resolved against the
    subject's `facts`: a claim record and a cited fact sharing a name is exactly
    the collapse this requirement exists to prevent, and a build that joined them
    would rebuild the defect out of the repair.
  - **`quote`** — the claim in the source's own words, verbatim. Classified
    **not author prose**, for the reason `facts[].value` already is: it is the
    data layer, transcribed, and a verbatim record cannot be wrong.
  - **`source_url`** — the document the quote was read from.
  - **`source_host`** — the host component of `source_url`, lowercased. The build
    SHALL fail when it does not equal the host parsed from `source_url`. It is
    redundant on purpose: it is the input to the vendor test below, so carrying
    it puts that input in the file a reviewer reads instead of behind a URL parse
    at render time.
  - **`accessed`** — the local date the source was read, as every dated record in
    this repository uses local dates.
  - **`verified`** — optional, and **three-valued** (below).
- A claim SHALL be treated as `dated` by construction. No re-check work SHALL
  ever be generated for a claim record, and no overdue marker SHALL render on
  one. What can go stale is its verification state, not the claim.
- Several claims MAY name the same `subject` and `field` — a vendor repeating
  itself, or two sources for one assertion — and a surface orders them by
  `accessed`, newest first. Two records sharing all of `subject`, `field`,
  `source_url` and `accessed` are a duplicate and SHALL fail the build naming
  both files.
- A claim record SHALL NOT mint a route of its own. Its rendered home is its
  subject's entry page, at a stable fragment, and it SHALL NOT appear in the
  sitemap or the search index as a document in its own right.
- **No surface SHALL construct a claim from an entry's `facts`**, whatever those
  facts are named and whatever their `source_url` says. A claim surface with no
  claim records renders empty. That empty state is the honest one, and it is the
  state the corpus is in on the day this lands.

**`verified` is three states and they are not two.** The distinction is the
whole point, and the defect it prevents is the one this requirement opens with —
a default that reads as a finding:

- **absent** — nobody has looked. A surface SHALL render **no statement about
  verification at all**. It SHALL NOT say "unverified", "not verified",
  "unconfirmed" or anything else that asserts a check which never happened.
- **`false`** — someone looked and did not confirm it. A surface renders
  "not verified" (or the equivalent it has chosen) for this case and **only**
  this case.
- **`{ by, url, date }`** — someone looked and confirmed it, naming who, the
  document that supports the confirmation, and the local date.

`verified: true` SHALL fail the build, naming the file: a confirmation with no
verifier, no document and no date is a claim about a check rather than a record
of one, which is the `intent-not-measurement` defect written into the schema.

**The worked example** — a complete claim record, normative for field names and
shapes:

```yaml
---
subject: org/moonshot-ai
field: agentic_task_completion
quote: "Kimi K2 completes multi-step engineering tasks end to end, without a human in the loop."
source_url: "https://platform.kimi.ai/blog/k2-launch"
source_host: platform.kimi.ai
accessed: "2026-09-05"
verified: false
---
```

#### Scenario: A founding date cannot render as a vendor claim

- **WHEN** a surface renders what an organisation says about itself, and the
  organisation's entry carries a cited `founded` fact — sourced, as all thirteen
  in this corpus are, from an encyclopaedia — and no claim record
- **THEN** the surface renders its empty state, because a claim is read from a
  claim record and from nowhere else — and the founding date renders where it
  always did, as a sourced fact on the entry

#### Scenario: An unlooked-at claim says nothing about verification

- **WHEN** a claim record carries no `verified` key
- **THEN** every surface rendering it renders no verification statement of any
  kind — not "unverified", not "unconfirmed", not an empty verification slot
  that reads as a negative finding

#### Scenario: A negative finding is recorded, not implied

- **WHEN** a verifier fetched the source and could not confirm the claim, and
  records `verified: false`
- **THEN** the surface renders "not verified", and the record shows that a check
  happened and failed rather than that no check happened

#### Scenario: A confirmation must name its evidence

- **WHEN** a claim record declares `verified: true`
- **THEN** the build fails naming the file, because a confirmation carries
  `by`, `url` and `date` or it is not a confirmation

#### Scenario: A claim's subject is a declared entry

- **WHEN** a claim record names a `subject` that no entry declares
- **THEN** the build fails naming the file and the id, exactly as an unresolved
  `mentions` id does

#### Scenario: A verification does not re-review the entry

- **WHEN** a `verified` block is added to an existing claim record whose subject
  entry carries an approved review record
- **THEN** the entry's review record still reports the entry as matching, and the
  claim record itself reports mismatched until a fresh verdict is recorded
  against its changed bytes

#### Scenario: A claim never goes overdue

- **WHEN** a claim record's `accessed` date is a year old
- **THEN** no overdue marker renders on it and no re-check work enters the
  derived queue, because a claim is a dated statement about the day it was made

# wiki — delta for separate-a-claim-from-a-fact

Three requirements added. Nothing here changes what an entry is, how it is
identified, how its facts are sourced, classed for volatility, or reviewed.
`facts` is untouched: a `cited` fact stays exactly what it is, and this delta
adds no key to `entrySchema` except the optional `publishes_from` in the second
requirement.

The shape is transcribed from `loops/ui-loop/graph/knowledge/DESK-ORDER-001.md`
§4 and its K44 amendment (keeper-signed 2026-09-05); the vendor test and the
display contract are the round-4 and round-5 addenda to `loops/ui-loop/RULES.md`
R13, enforced there as invariant `S22` clause (e). The round-by-round reason for
each clause is `loops/ui-loop/graph/knowledge/SPEC-REVIEW-GUIDE.md` §4, the
rubric this draft was written against. None of it is re-decided here.

## ADDED Requirements

---

### PENDING AMENDMENT to `specs/wiki` — in-flight change `tag-the-corpus-by-domain`
(full text: `D:/AddictedtoAI/openspec/changes/tag-the-corpus-by-domain/specs/wiki/spec.md`)

This is a **delta**, not a capability spec: `## ADDED Requirements` and `## MODIFIED Requirements` blocks, restating only the requirements the change touches. It is not archived into the constitution above and does not replace it. Treat it as the pending intent for the requirements it names — where it MODIFIES one that also appears above, the amendment is the newer text.

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
seeding signal for `coding` and `agents` — one line each — against the 182 lines
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

---

### PENDING AMENDMENT to `specs/review` — in-flight change `separate-a-claim-from-a-fact`
(full text: `D:/AddictedtoAI/openspec/changes/separate-a-claim-from-a-fact/specs/review/spec.md`)

This is a **delta**, not a capability spec: `## ADDED Requirements` and `## MODIFIED Requirements` blocks, restating only the requirements the change touches. It is not archived into the constitution above and does not replace it. Treat it as the pending intent for the requirements it names — where it MODIFIES one that also appears above, the amendment is the newer text.

### Requirement: A claim record is judged against the bytes of the source it quotes

A claim record is a verbatim quotation, a host, a date and a verification state,
transcribed by a model from a page the reviewer can fetch. Every one of those is
checkable, and each has a failure mode that a reader of the diff alone would
miss. Where a diff contains claim records, the reviewer SHALL additionally:

**The build can check every field of this record except the one that matters.**
`source_host` is a string comparison, `subject` is a corpus lookup, `accessed` is
a date, `verified: true` is a shape — all of them gates. `quote` is none of them:
verbatim-ness is a comparison against a document the build never fetches, and a
build that did fetch it would make every rebuild depend on a third party's
uptime and on the page not having changed since. So this one clause belongs to
the reviewer and to nobody else, and there is no gate to fall back on if the
reviewer skips it.

- **Fetch `source_url` and confirm `quote` is present in the fetched bytes,
  verbatim.** Plausibility is not verification. The instrument SHALL be ruled out
  before absence is concluded — inflate compressed streams and read
  parenthesised text literals, expect ligatures and escaping, and search
  fragments that straddle neither. A quote that is genuinely absent from the
  document is `false-or-unsupported-claim`; a quote absent from one representation
  of a document is a misattribution to be traced before it is called anything
  worse.
- **Confirm `source_host` equals the host of `source_url`,** and judge the vendor
  test's *input* rather than its output: is this host really a place the subject
  publishes from? The check itself is mechanical, but what it compares against is
  a declaration somebody made, and a wrong `publishes_from` value attributes a
  stranger's words to a named company. Where the diff adds a `publishes_from`
  value, the reviewer SHALL confirm the domain independently and say how.
- **Read `verified` for what it asserts.** A record claiming more than was done
  is `intent-not-measurement`: `verified: {by, url, date}` requires that the named
  document actually supports the confirmation, fetched and confirmed, not
  described. A `verified: false` requires that a check happened and failed, and
  the reviewer SHALL reject a `false` written as a placeholder for "nobody
  looked" — absence is how that is spelled, and the difference is the whole point
  of the three states.
- **Check that nothing in the diff turns a fact into a claim.** A cited fact
  moved into a claim record, or a claim record filed for a value that is a
  measurement by a third party rather than an assertion by the subject, is
  `spec-violation` against the requirements in `wiki` — and it is the specific
  defect this record type was created to end, found twice in shipped work by two
  independent builders.

The standing instruction is unchanged and applies here in its sharpest form: for
every claim about what something does, run the cheap direct check; for every
sourced claim, confirm the source supports it. A claim record is the one content
shape in this corpus whose entire content is a sourced claim.

#### Scenario: The quote is confirmed against the document, not the diff

- **WHEN** a diff files a claim record quoting a vendor's launch post
- **THEN** the reviewer fetches that post and the verdict cites the fetch and
  what was found in it, not the record's own description of the source

#### Scenario: A verification state that outruns the work is rejected

- **WHEN** a record declares `verified: {by, url, date}` and the named URL does
  not support the claim
- **THEN** the reviewer returns a non-approval citing `intent-not-measurement`,
  naming the record and the URL

#### Scenario: A placeholder negative is not a finding

- **WHEN** a record declares `verified: false` and nothing in the diff or the
  job's evidence shows that a check was attempted
- **THEN** the reviewer requires the key removed rather than left, because absent
  means nobody looked and `false` means somebody looked and failed

#### Scenario: A measurement filed as a claim is a spec violation

- **WHEN** a diff files a claim record whose source is a third party's
  measurement of the subject's product rather than the subject's own statement
- **THEN** the reviewer returns a non-approval citing `spec-violation`, naming
  the requirement in `wiki` that a claim is the subject's own only when the
  source is

# review — delta for separate-a-claim-from-a-fact

One requirement added. Nothing here changes the verdict list, the closed reason
list, the `would-cite` and `reads-human` fields, the revision mechanics, the
hash binding, or the four-state join. The existing checklist requirement, "What
is checked depends on what the work is", is left untouched: this adds a
checklist for a record type that did not exist when it was written, rather than
restating it.

## ADDED Requirements
