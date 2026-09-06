# Job j-20260905-18 — `interpret`

You are working alone, unattended, in a git worktree checked out on branch
`job/j-20260905-18`. Everything you need is in this file and in the repository around
you. There is no prior conversation to recall and no session to resume.

- **Branch**: `job/j-20260905-18`
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
- **Work source**: directive (DIRECTIVES.md line 76)

## The outcome

draft the OpenSpec change for DESK-ORDER-001 §4's vendor-claim record and the `lead-change` event kind, referencing addictedtoai-eb4l. ITS OWN CHANGE, NOT FOLDED INTO addictedtoai-9c9t (ui-loop K44): 9c9t is about the scout and posts and should land without waiting on a schema debate, while this one adds a content record type, a `lib/schema.mjs` field, and a member to `changes.jsonl`'s closed kind list — "adding a content field means editing lib/schema.mjs by design" is exactly what the change process exists to route. THE RECORD SITS BESIDE THE ENTRY, NOT ON IT, and the two reasons are mechanism rather than taste: a review record binds the entry's bytes, so a claim arriving — or a verification landing later on a claim already filed — would dirty the hash and demand a re-review of prose nobody touched; and a claim ages on its source's clock, not the entry's, so putting it in the entry's front matter makes one file answer to two freshness regimes. SHAPE: verbatim quote, source URL, accessed date, the ability or field named, and `verified` as a THREE-state value — absent, `false`, or `{by, url, date}` — because the board renders the words "not verified" only for the `false` case and must render nothing for absent. The record must also carry the source URL's HOST, so the board's vendor-sourced test (the registrable domain of the cited source equals the vendor's own; RULES.md R13 round-4/5 addenda, invariant S22(e)) can run from the record directly rather than re-parsing a URL at render time. THE MOTIVATING DEFECT, so the change knows what it is fixing: both Frontier finalist builds rendered organisation FOUNDING DATES and FOUNDERS as "claimed · unverified", independently, because the only structure the corpus offers is "any cited fact" — a founding date is not a vendor claim and must never render as one. Written by the orchestrator, not the maintainer. THE DRAFT IS NOT FINAL UNTIL THE UI-LOOP SESSION HAS READ IT, AND THAT IS AN INSTRUCTION FROM THE MAINTAINER (2026-09-05): "Run the specs by the other sessions before finalizing, since it has additional context to their origin." THE CONTEXT IS REAL AND IT IS NOWHERE IN THIS REPOSITORY. These requirements are the residue of six judged rounds, two finalist builds, a red team and an order-swapped jury; the artifacts here record WHAT was decided and the ui-loop session holds WHY — which round produced a clause, which red-team finding forced it, and what both finalist builds got wrong that the clause exists to prevent. A requirement whose reason is lost gets re-litigated or quietly dropped by whoever implements it, which is the failure this whole handoff was built to avoid. SO: draft the change in full, validate it with `openspec validate <name> --type change --strict --no-interactive`, and STOP THERE. Do NOT archive it — a change with no implemented tasks is not archivable anyway, so this does not bend the archive-promptly rule. Do NOT treat this job's merge as the change being settled. The orchestrator relays the drafted delta to that session between runs and folds the corrections back in; only after that is the implementation line below correct to run. Say in RESULT.md which requirements you were least sure about, because that is the list the review is most useful on. READ loops/ui-loop/graph/knowledge/SPEC-REVIEW-GUIDE.md BEFORE YOU DRAFT A LINE OF IT, and draft against the REASON rather than the clause. That file is a table, one row per requirement, giving what the round decided, the ruling or finding that produced it, and the implementer-ledger row or build lesson the requirement exists to prevent — the "why" that exists nowhere else in this repository and that a delta cannot carry on its own. It was written by the ui-loop session specifically so that whoever drafts these has it, and it is also the rubric your draft will be reviewed against, so there is no reason to work without it. Where the guide and this line disagree about substance, the guide is closer to the decision and wins; say so in RESULT.md rather than silently picking one. PUT THE UNCERTAINTY LIST IN `proposal.md`, NOT IN `RESULT.md`, AND THIS CORRECTS AN EARLIER INSTRUCTION OF MINE THAT WOULD HAVE THROWN IT AWAY. `loop/run.mjs:1062` runs `git rm -r --ignore-unmatch .job RESULT.md` before the merge — RESULT.md is the loop's control channel, its first line is the run's status, and deleting it at merge is correct rather than a defect. What is wrong is using it as a durable record: anything said only there survives just long enough for the reviewer to read it and is then gone from git forever, which is precisely the "a thought that exists only inside something finished is already lost" failure this repository keeps paying for. So give the proposal a section — "What I was least sure about" — naming the requirements you would most want a second reader to check and why, and put any disagreement with the guide or with this line there too. The proposal is the right home on its own merits, not just for durability: the precedent is `openspec/changes/let-the-site-see-its-own-gaps`, whose proposal opens by recording what was re-measured and which prior claims had stopped holding, and the next person to read this change needs your doubts far more than the reviewer did.


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

### Requirement: Author-written front matter is prose for the volatile-literal check

*"Volatile facts travel by transclusion, never by restatement"* is unchanged by
this requirement; what changes is where its build-time warning can see. The
warning scans bodies. Deltas are almost entirely front matter — only 6 of 29
have a prose body over 40 characters — so the check is **vacuous on 23 of
them**, and the same shape holds anywhere front matter carries author sentences.

Two measurements shape this requirement and are recorded so nothing acts on the
wrong one. First: **no delta currently carries an unanchored literal.** Eight
front-matter currency literals exist across four files and every one sits inside
a delta end, which `lib/schema.mjs` requires to carry an ISO `date` — a delta end
is a dated historical claim by construction and a dated observation does not
rot. Nothing is burning; those four files are correct as written. Second: the
exposure is structural. Nothing forces a front-matter field to be scanned, and
nothing forces a *new* front-matter field to be classified at all, which is the
vector by which this recurs.

- Every string-valued field in every content schema SHALL be classified, in one
  declared place in `lib/`, as either **author prose** or **not author prose**,
  and the build SHALL fail when a string-valued field exists that is neither.
  This is the mechanism; the scan below is only its consequence. It is the same
  discipline that makes adding a content field an edit to `lib/schema.mjs` by
  design: `alias:` where `aliases:` was meant parses cleanly and nothing
  downstream notices.
- The build SHALL run the volatile-literal scan over every field classified
  author prose, reporting a hit in the same form and at the same severity as a
  body hit — a warning naming the file, the field, the literal and the rule.
  Severity matches the body scan deliberately: enforcement of the no-hard-coding
  rule is the reviewer's named checklist item, and a build that failed here would
  break every historical rebuild the moment a legitimate quoted price appeared.
- A hit SHALL be exempt when the object that directly contains the field carries
  a sibling key whose value is an ISO date. The exemption is mechanical, not a
  list of blessed fields: a delta end carries `date`, a blog correction carries
  `date`, a tool listing carries `last_verified`, and each of those is displayed
  with its date, so the value is a record of that date rather than a claim about
  now. A field with no dated sibling is an undated claim and is scanned.
- The build SHALL report, per content type, how many documents had at least one
  author-prose field scanned and how many had none. A check that runs on nothing
  reports the same clean result as a check that runs on everything, and that
  indistinguishability is the actual defect being fixed here; the count is what
  makes a future vacuum visible on the screen instead of in an audit.

#### Scenario: An undated front-matter literal is warned about

- **WHEN** a static education page's `outcome` states a price literal and no
  sibling key in that object carries an ISO date
- **THEN** the build warns, naming the file, the field, the literal and the
  rule, and does not fail

#### Scenario: A dated observation stays legal

- **WHEN** a delta's `routine` end states a price in its `metric` and that end
  carries its required ISO `date`
- **THEN** the build produces no warning for it

#### Scenario: A new field cannot arrive unclassified

- **WHEN** a string-valued field is added to a content schema and is listed in
  neither classification
- **THEN** the build fails naming that field

#### Scenario: Vacuity is visible

- **WHEN** the build completes
- **THEN** its summary states, per content type, the number of documents with at
  least one author-prose field scanned and the number with none

### Requirement: A fact may declare the fact it corroborates

An entry can carry a feed-bound fact and a cited fact that measure the same
quantity and disagree, and nothing notices. It happened: an entry carried `284B`
parameters from OpenRouter while the checkpoint's own model card and an
independently cited post both said `304B` — OpenRouter publishes the identical
sentence on the preview row and the release row. Transcribing the feed verbatim
was correct behaviour and stays correct; a verbatim fact cannot be wrong. The
prose built an argument on the count being unchanged, and that argument was
refuted by a change two other sources record.

The comparison is cheap. What is missing is a way to say *these two facts
measure the same thing* — field names differ by necessity, since the repair for
that entry named its cited facts `repository_tensor_total` and `preview_parameters`
precisely so they would not collide with the feed-bound `parameters`.

- A fact MAY declare `corroborates: <field>`, naming another fact on the same
  entry that measures the same quantity. The join is declared, never inferred:
  name normalisation, prefix stripping and fuzzy matching are guessing, and this
  design does not guess — the same reason `feeds` binds on a declared row id.
- The build SHALL fail, naming the entry and the field, when a `corroborates`
  value names a field no fact on that entry declares, or names the declaring
  fact itself.
- `corroborates` SHALL NOT change how either fact renders, which of them is
  authoritative, or whether either is re-checked. Declaring that two sources
  disagree is not adjudicating between them, and a feed-bound fact remains what
  its source says, verbatim.

#### Scenario: A declared pair binds

- **WHEN** an entry carries a feed-bound `parameters` fact and a cited
  `repository_tensor_total` fact declaring `corroborates: parameters`
- **THEN** the build accepts both and renders each exactly as it would without
  the declaration

#### Scenario: A corroboration that names nothing fails the build

- **WHEN** a fact declares `corroborates: parameters` and the entry has no
  `parameters` fact
- **THEN** the build fails naming the entry and the field

---

### PENDING AMENDMENT to `specs/wiki` — in-flight change `tag-the-corpus-by-domain`
(full text: `D:/AddictedtoAI/openspec/changes/tag-the-corpus-by-domain/specs/wiki/spec.md`)

This is a **delta**, not a capability spec: `## ADDED Requirements` and `## MODIFIED Requirements` blocks, restating only the requirements the change touches. It is not archived into the constitution above and does not replace it. Treat it as the pending intent for the requirements it names — where it MODIFIES one that also appears above, the amendment is the newer text.

### Requirement: A domain says what a thing is for, and it cuts across kinds

`kind` says what a thing **is** — `model`, `org`, `tool`, `technique`,
`benchmark`. It is a partition: exactly one value, closed, permanent, never
reused. That is the right shape for identity and the wrong shape for the
question a reader actually arrives with. "What is happening in video
generation" has no answer inside any partition by kind, because the answer is a
model, an org, a tool and a technique at once.

`domain` is that second axis. An entry MAY declare the domains it belongs to.
The facet SHALL be:

- **set-valued** — a thing may be in several domains at once, and a
  multimodal model routinely is. There is deliberately no `multimodal` value:
  that is the union of several domains, not a member of the list.
- **optional, with the empty set legal and common** — "general" is the
  **unmarked default**. There is no `general` value to declare and no `text`
  value. An entry carrying no domain is not untagged-and-pending; it is
  general, and that is a complete answer.
- **orthogonal to `kind`** — it neither replaces `kind` nor is derivable from
  it. Every kind may bear it.

The vocabulary is these eight values and no others:

`coding`, `agents`, `image`, `video`, `audio`, `research`, `science-math`,
`robotics`.

**`text` is not a value, and the reason is a measurement.** Read from
`data/sources/openrouter-models/latest.json` on 2026-09-05 (`fetched_at`
`2026-09-05T06:00:04.599Z`, `row_count` 431): every one of the 431 rows takes
text in, out, or both. A facet value carried by every member of the set it is
meant to divide discriminates nothing, and a filter that selects everything is
a filter a reader learns to distrust. Absence carries the same meaning at no
cost.

**The vocabulary SHALL have exactly one definition in the source tree.** That
definition is `lib/domains.mjs`, created by the change
`flag-what-moved-the-frontier` for the post-level frontier gate, and read
unchanged by every other surface that reads a domain — this facet included.
This specification names the eight values so that the requirement is readable
and a reviewer can check it; that is not a second definition, and a build in
which this text and `lib/domains.mjs` disagree has a defect in one of them.
Two closed lists of the same eight strings drift, and the moment they do, the
post gate and the entry gate are two different checks wearing one name — which
is the reads-as-present-and-does-nothing shape this repository keeps catching.

**A value outside the vocabulary SHALL fail the build**, naming the file, the
field, the offending value and the values that are allowed. This is the
treatment an unknown `kind` and an unknown tool `category` already receive, for
the same reason: an open field drifts into `coding` / `code` / `Coding` and the
grouping stops being a partition. It is also what keeps the ordering guarantee
in `directory` honest — an order that is a pure function of the domain ids is
only a guarantee if the set of ids is closed.

The facet is **declared data, never inferred from prose.** No heuristic over an
entry's title, body, aliases or URL may assign a domain. A domain that arrives
mechanically arrives from a named feed field under the seeding requirement
below, and from nowhere else.

#### Scenario: A domain outside the vocabulary stops the build

- **WHEN** an entry declares a domain value of `legal`
- **THEN** the build fails naming the entry file, the field, the value `legal`
  and the eight allowed values, and no page is published

#### Scenario: `text` is not a domain

- **WHEN** an entry declares a domain value of `text`
- **THEN** the build fails exactly as it does for any other value outside the
  vocabulary — general is the unmarked default, and it is expressed by carrying
  no domain rather than by carrying a value every entry would qualify for

#### Scenario: An untagged entry is general, not incomplete

- **WHEN** an entry declares no domain at all
- **THEN** it validates, it publishes, and no marker, warning or work-queue
  item treats the absence as a defect to be repaired

#### Scenario: One thing is in several domains

- **WHEN** a model takes text, image and video input and its entry declares
  `image` and `video`
- **THEN** both values validate, and the entry appears under both domains on
  any surface that groups by domain

#### Scenario: A domain does not displace a kind

- **WHEN** a `technique` entry for computer use declares the domain `agents`
- **THEN** its `kind` remains `technique`, its id is unchanged, and nothing
  about the domain makes `agents` a kind — the two axes are read independently

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

**A `domains_excluded` value that is not currently seeded SHALL be legal and
inert** — not a build error and not a warning. The opposite rule would couple
an editorial key to the feed's current contents, so a publisher dropping a
signal would turn a green build red on an entry nobody touched, which is the
coupling this whole requirement exists to prevent.

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
  nothing, and any removal is made editorially through `domains_excluded`

#### Scenario: An editorial exclusion suppresses a seeded value

- **WHEN** an entry has `image` in `domains_seeded` and `image` in
  `domains_excluded`
- **THEN** the effective set omits `image`, the entry does not appear under
  that domain on any surface, and `domains_seeded` is left as the machine wrote
  it

#### Scenario: An exclusion that suppresses nothing is inert

- **WHEN** an entry declares `domains_excluded: [video]` and no run has ever
  seeded `video` on it
- **THEN** the build passes with no error and no warning, and the key stays in
  place against a future seed

#### Scenario: Asserting and excluding the same domain fails the build

- **WHEN** an entry declares `audio` in both `domains` and `domains_excluded`
- **THEN** the build fails naming the entry and the value, rather than
  applying a precedence rule that would hide the mistake

#### Scenario: A post cannot carry the machine key

- **WHEN** a blog post declares `domains_seeded`
- **THEN** the build fails on the unknown key, because the post schema does not
  accept it — a post's `domains` is editorial and must stay inside the reviewed
  surface

# wiki — delta for tag-the-corpus-by-domain

Two requirements added. Nothing here changes what an entry is, how it is
identified, how its facts are sourced, or how it is reviewed. `kind` is
untouched and still a closed partition; `domain` is a second, orthogonal axis
that sits beside it.

The vocabulary and the two-field split are transcribed from
`loops/ui-loop/graph/knowledge/DESK-ORDER-001.md` §3 (keeper-signed 2026-09-05)
and its K44 amendment, with the three open questions answered as §3 records
them. They are not re-decided here. The research behind the vocabulary is
`loops/ui-loop/graph/knowledge/EN-domain-facet.md`; the round-by-round reason
for each clause is `loops/ui-loop/graph/knowledge/SPEC-REVIEW-GUIDE.md`, the
rubric this draft was written against.

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

### Requirement: Missing, unbound, and mismatched are three findings, not one

`lib/reviews.mjs`'s header already reasons that "unreviewed" and "named
something the join does not recognise" are the same observation from the join's
position, and that absence must therefore be reported rather than acted on.
Reviewed-then-changed is the third member of that family, and a check unable to
tell it from the other two would report a page whose approved text had since
moved as though it had never been reviewed at all — the one reading that loses
both the record and the change.

- The join SHALL classify every reviewable piece into exactly one of four
  states: **recorded** (a record joins and its recorded hash equals the piece's
  current reviewed-surface hash), **mismatched** (a record joins, carries a hash
  for that path, and the hashes differ), **unbound** (a record joins and carries
  no hash for that path), and **missing** (no record joins).
- Every path that reports on reviews — `scripts/verify-launch.mjs` and the
  prebuild's summary line — SHALL report the four states separately and SHALL
  NOT collapse mismatched into missing. They are opposite findings: missing
  means unreviewed, mismatched means reviewed and then changed, and only the
  second identifies both a specific record and the specific bytes that moved.
- `scripts/verify-launch.mjs` SHALL fail on any **mismatched** piece, naming the
  piece, the record, and the fact that the reviewed surface changed after the
  verdict.
- **Unbound** SHALL be counted and reported and SHALL NOT fail anything. Every
  record written before the merge began binding hashes is unbound, so failing on
  unbound would refuse the whole corpus of records that predate the mechanism —
  and an unbound record is exactly as informative as a record was before binding
  existed, no worse. The number to watch is that it only ever falls.
- A **mismatched** state SHALL NOT change a page's indexability. The build's
  review gate continues to read the verdict alone. Suppressing a page because
  its bytes moved would silently de-index approved work over a whitespace edit,
  which is the response `lib/reviews.mjs` already refuses to give to absence,
  for the same reason.

#### Scenario: An edited approved page is a named finding

- **WHEN** an approved entry's prose is edited after its verdict and the launch
  check runs
- **THEN** the check fails, naming that piece as mismatched against its record,
  and does not report it as missing a review

#### Scenario: A pre-existing record is unbound, not broken

- **WHEN** a seed record carrying no `reviewed:` key joins its piece
- **THEN** the piece reports as unbound, the count of unbound pieces is printed,
  and nothing fails

#### Scenario: A mismatch does not unpublish anything

- **WHEN** a piece is mismatched against its record
- **THEN** its rendered page's indexability is exactly what the verdict alone
  would produce, and no page is de-indexed by the mismatch
