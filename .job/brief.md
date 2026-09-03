# Job j-20260902-24 — `entry`

You are working alone, unattended, in a git worktree checked out on branch
`job/j-20260902-24`. Everything you need is in this file and in the repository around
you. There is no prior conversation to recall and no session to resume.

- **Branch**: `job/j-20260902-24`
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
- **Work source**: proposal (proposal `inception-mercury-2-5-preview`)

## The outcome

An entry job to write the prose and stable facts for the existing feed-bound stub of Inception's Mercury 2.5 Preview (diffusion LLM, released Aug 31, 2026, on OpenRouter at list $0.20/$0.75 per Mtok with an 80% launch discount to $0.04/$0.15 through September 8, 07:00 UTC; 260K context): the architecture is the point — tokens produced and refined in parallel rather than sequentially, 1,107 tokens/sec claimed on standard GPUs, vendor positioning against GPT-5.6 Luna (Low), Gemini 3.5 Flash-Lite and Claude Haiku 4.5. Vendor claims stay attributed as claims; the durable facts (pricing, context, launch date, discount window) are fetchable from the OpenRouter listing and the vendor site. The discount expiry is the timing: the entry is worth writing while the "cheapest diffusion tier" reading is true.



An entry job to write the prose and stable facts for the existing feed-bound stub of Inception's Mercury 2.5 Preview (diffusion LLM, released Aug 31, 2026, on OpenRouter at list $0.20/$0.75 per Mtok with an 80% launch discount to $0.04/$0.15 through September 8, 07:00 UTC; 260K context): the architecture is the point — tokens produced and refined in parallel rather than sequentially, 1,107 tokens/sec claimed on standard GPUs, vendor positioning against GPT-5.6 Luna (Low), Gemini 3.5 Flash-Lite and Claude Haiku 4.5. Vendor claims stay attributed as claims; the durable facts (pricing, context, launch date, discount window) are fetchable from the OpenRouter listing and the vendor site. The discount expiry is the timing: the entry is worth writing while the "cheapest diffusion tier" reading is true.



# Inception Mercury 2.5 Preview — the diffusion-LLM claim, in prose

## Why now

The launch is two days old, the 80% discount ends September 8 at 07:00 UTC,
and the corpus holds only a feed-bound stub (no prose, no architecture, no
vendor positioning) for the model that is currently the loudest diffusion-LLM
claim in production — a claimed 1,107 tokens/sec by generating tokens in
parallel. The timing hook is the discount window: while the promo runs, the
entry can truthfully say "the fastest-claimed diffusion tier at $0.04/$0.15
per Mtok", a dated fact the reader can check. After the window, the entry
still stands on the durable facts. A `post` would overclaim (the quality
comparisons are vendor-reported); an entry's job is exactly to hold that
attribution line.

## Would-send test

"The diffusion-LLM people shipped Mercury 2.5 — 1,107 tok/s claimed, 80% off
through Sept 8 — the wiki has the docket." An inference-cost or latency
watcher clicks through. Third-ranked: the audience is narrower than the two
posts, the headline numbers are vendor claims pending independent
measurement, and the corpus already carries Mercury 2's stub — the entry
extends a known row rather than introducing a new thing.

## What the job would produce (done-when)

- The entry fills content/wiki/model/inception-mercury-2-5-preview.md with
  prose and stable facts sourced to the OpenRouter listing and the vendor
  site: architecture (parallel token generation), claimed 1,107 tok/s,
  260K context, launch date Aug 31, 2026, list and promo pricing.
- The vendor positioning (vs GPT-5.6 Luna (Low), Gemini 3.5 Flash-Lite,
  Claude Haiku 4.5) is attributed as Inception's claim, not a measured fact.
- The discount window (through September 8, 2026 07:00 UTC) is stated with
  its source and date, and the entry is honest that the discount is via
  Inception on the OpenRouter listing.
- Feed bindings for volatile fields (price, status, context) are kept; the
  entry adds what the feed cannot: what the model is and who made it.
- Every source fetched during the job carries its retrieval date.

This is **one job with one outcome**. It ends in exactly one merge or one
discard. Do not widen it: a diff that exceeds the stated outcome is a
`scope-violation` at review and the whole job is rejected for it.

## Acceptance checks

- The entry validates against the front-matter schema for its kind; the build passes.
- Every cited fact carries a reachable source and an accessed date, and the source says what the fact says.
- Volatile values are transclusions or feed-bound, never literals.
- Aliases are classed sanely (exclusive / shared / manual).
- If the entry carries prose, the prose adds something the data alone does not.
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
this job's type (`entry`) onto each kept proposal, overwriting whatever you
wrote there, and a proposal whose stamped origin type equals the type it proposes
is auto-discarded with a pointer to the self-amplification rule — so this job
cannot propose another `entry`. Noticing across types is the designed path.

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

### Requirement: Entries are tiered, and only worthy pages are indexed

Every entry is either a **stub** (structured data only, no prose body) or
**full** (has a prose body). Stubs SHALL exist freely at zero inference cost:
they render a page from their data (identity, facts, timeline, backlinks),
they appear in the client-side name search (defined in `site`) and in the
open dataset, but they carry `noindex` and appear in no browse listing.

An entry SHALL be indexed (no `noindex`, present in browse listings) only if
at least one of:

- it has a prose body that passed review, or
- it has 2 or more facts and at least one recorded timeline event, or
- its status is `deprecated`, `retired`, or `dead` (an obituary with dated
  lifecycle facts is worth indexing: the vendor deletes theirs).

The indexability decision SHALL be derived at build time from these rules,
never authored by hand.

#### Scenario: A stub exists without being publishable noise

- **WHEN** ingest creates an entry with only identity and one fact
- **THEN** its page renders, is findable through the client-side name
  search, carries `noindex`, and appears in no browse listing

#### Scenario: A dead thing's entry is indexed

- **WHEN** an entry's status becomes `retired` with a dated, sourced
  timeline event
- **THEN** the entry is indexed and appears in the deprecations/retirements
  listings even if it has no prose body

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

A transclusion whose target entry or field does not exist SHALL fail the
build. Enforcement of the no-hard-coding rule is the reviewer's named
checklist item for every prose piece (see `review`); the build additionally
warns on currency-shaped literals (a number adjacent to `tokens`, `context`,
`$`, `/month`, or a version pattern) in prose outside the wiki data layer.

#### Scenario: Correcting a fact corrects every surface

- **WHEN** a fact value is corrected on its owning entry
- **THEN** every page that transcludes it shows the corrected value at the
  next build, with no other file edited

#### Scenario: Broken transclusion fails the build

- **WHEN** a prose file transcludes `model/foo · price_input` and no such
  entry or field exists
- **THEN** the site build fails naming the prose file and the missing
  reference

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

---

### From `specs/editorial` (full text: `D:/AddictedtoAI/openspec/specs/editorial/spec.md`)

### Requirement: Every published prose piece must earn its reader

Before any prose piece (wiki entry body, education page, tutorial, blog
post) publishes, it MUST satisfy all three:

1. **It gives an enthusiast something.** At least one of: a thing they
   likely did not know; scattered things assembled in one place for the
   first time; a live, derived view no one else shows. A piece that a
   daily AI-follower would skim and learn nothing from has not earned
   publication.
2. **It is specific.** Dates, numbers, names, sources, mechanisms — never
   "many believe", "rapidly evolving", "in recent years". Every paragraph
   survives the question "what exactly is this telling me?"
3. **It would be worth a stranger's attention.** The judge is a stranger
   who does not know or care that an AI made this site; the novelty of the
   site's construction counts for nothing in this judgment. Two
   operational forms, and passing either satisfies this clause:
   - the **would-cite test**: a reasonable person arguing about this topic
     online could paste this URL as support — pages that answer a question
     completely pass; pages that gesture at a topic fail;
   - the **would-send test**: a reader who follows this topic would send
     this piece to a specific person with no more explanation than "look
     at this" — the test that selects stories, where would-cite selects
     references.
   A surface's own spec MAY require one form in particular (the blog
   requires would-send — see `blog`); this clause sets the floor, not the
   assignment.

*Dull, derivative, padded, obvious,* and *self-referential* are real defect
names, usable as-is in review. Rejecting a piece as boring requires no
disguise as a factual objection. **Correct, sourced, and forgettable is a
failure of this requirement, not a near miss**: a piece failing only clause
3 SHALL be treated exactly as one failing any other clause — being true and
checkable earns no publication by itself, and a scrupulously honest site
nobody visits is the named outcome this clause exists to prevent.

#### Scenario: Accurate but empty

- **WHEN** a draft post correctly summarizes an announcement every newsletter
  already covered, adding no assembly, no data, and no angle
- **THEN** it is rejected as `not-worth-reading` — accuracy alone does not
  publish

#### Scenario: The would-cite test in review

- **WHEN** a reviewer can articulate neither who would link the piece and in
  what argument, nor who would send it and to whom
- **THEN** that is sufficient grounds for a `not-worth-reading` rejection,
  recorded in those words

#### Scenario: Sendable carries a piece that citable would not

- **WHEN** a short dated piece is one nobody would paste as support in an
  argument, but any follower of its subject would send to a colleague it
  affects
- **THEN** clause 3 is satisfied by the would-send test and the piece is not
  rejected for failing would-cite alone

### Requirement: Breadth lives in the data layer; the bar applies to prose

"Everything about AI" and "only publish what is worth reading" coexist by
construction, not by compromise:

- **Breadth is delivered by the structured layer.** Records, facts,
  timelines, catalog rows, and stubs MAY exist for anything real, cost no
  reader anything, and SHALL be exempt from the prose bar — a stub publishes
  data, not claims on a reader's time (its indexing is governed by `wiki`).
- **The bar applies to every page that asks to be read.** Prose SHALL be
  published only when it clears the Requirement above.

Neither rule bends toward the other: the corpus may be vast while the read
surface stays sharp. "Everything, badly" — broad thin prose to simulate
coverage — is the named failure this split exists to prevent.

#### Scenario: Coverage without slop

- **WHEN** the corpus holds a stub for an obscure library nobody has written
  about
- **THEN** the stub renders its data and no prose is generated for it merely
  to look covered

### Requirement: The cut list is enforced, not aspirational

The following SHALL be cut wherever found, by authors before review and by
reviewers on sight:

- filler openers and closers ("In the rapidly evolving world of AI…", "In
  conclusion…", "It remains to be seen…");
- hedging boilerplate that conveys no probability ("it could be argued");
- restating in prose what an adjacent table or transclusion already shows;
- listicle padding — enumeration without judgment;
- self-reference outside the colophon (the site discussing its own process,
  machinery, or history);
- unsupported superlatives ("game-changing", "revolutionary") — a
  superlative requires a measurement or a source;
- any sentence written to fill space rather than to inform.

#### Scenario: Filler is a defect, not a style choice

- **WHEN** a draft opens with a paragraph that could open any AI article
- **THEN** review names it under the cut list and the piece does not publish
  until it is gone

### Requirement: The subject carries the awe; the voice stays plain

The site's wonder comes from what the field actually contains — capability
shifts, dated deltas, things that were research results becoming commodity
calls — demonstrated with receipts, never asserted with adjectives. There
SHALL be no "does this make AI look good" consideration anywhere: a story
about a failed promise or a safety incident is exactly as in-mission as a
capability story. Enthusiasm without evidence and cynicism without evidence
are the same defect.

#### Scenario: Awe as a finding

- **WHEN** a piece wants to convey that progress is fast
- **THEN** it shows dated evidence (what was impossible on date A, routine
  on date B, with sources) rather than intensifiers

# editorial Specification

## Purpose
The quality bar. Content carries no per-item change artifact, so this spec is
the only place the standard for "is this worth publishing" lives. The
previous site's review contract had no word for *boring* and produced a site
that was accurate and unread. This one does.

## Requirements

---

### From `specs/review` (full text: `D:/AddictedtoAI/openspec/specs/review/spec.md`)

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
