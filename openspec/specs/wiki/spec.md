# wiki Specification

## Purpose
The wiki is the site's cornerstone substrate: one typed, sourced, dated record
per thing in AI. Every other surface references wiki entries rather than
restating their facts, so correcting a fact in one place corrects it
everywhere it appears.

## Requirements

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

### Requirement: Aliases are registered, classed, and collision-safe

Every entry SHALL declare its names as aliases. Every alias carries exactly
one link class:

- `exclusive` — claimed by exactly one entry and distinctive
  (`"Claude Opus 5"`, `"ComfyUI"`). Eligible for automatic linking.
- `shared` — claimed by more than one entry, or generic. Never automatically
  linked.
- `manual` — never automatically linked by any process. Single common words
  and bare brand tokens (`"Claude"`, `"Gemini"`, `"Llama"`) MUST be `manual`.

The alias registry SHALL be derived from entry front matter at build time,
never maintained as a separate hand-edited file. When two entries claim the
same alias as `exclusive`, the build SHALL fail; the resolution is to demote
the alias to `shared` or `manual` on both entries.

#### Scenario: Alias collision fails the build

- **WHEN** two entries both declare the alias `"Opus"` as `exclusive`
- **THEN** the site build fails naming both entries and the alias

#### Scenario: Bare ambiguous token is never auto-linked

- **WHEN** prose contains the word `Claude` and the alias `"Claude"` is
  classed `manual`
- **THEN** no automatic process ever wraps it in a link, regardless of
  context

### Requirement: The alias linker is wrap-only and deterministic

An automatic linker MAY wrap words already present in rendered prose in a
link to a wiki entry, under all of these rules simultaneously:

1. It only wraps existing text. It SHALL never insert, remove, or reword any
   text.
2. It links only an exact, case-sensitive match of an `exclusive` alias.
3. On any ambiguity (alias not `exclusive`, overlapping candidate matches),
   it SHALL refuse and leave the text plain.
4. It wraps at most the first occurrence per page.
5. It runs deterministically at build time with no model involved.
6. It never operates inside code blocks, headings, or existing links.

Under these rules a wrong link is structurally impossible: the worst failure
is a missing link, which is a non-event. The linker's behavior SHALL be
covered by fixture tests including at least: an exclusive match (wrapped), a
shared alias (left plain), a manual alias (left plain), a second occurrence
(left plain), and a match inside a code block (left plain). If any fixture
fails, the build fails.

#### Scenario: Exclusive alias is linked once

- **WHEN** a blog post mentions `ComfyUI` three times and `"ComfyUI"` is an
  `exclusive` alias of `tool/comfyui`
- **THEN** the first occurrence is rendered as a link to `tool/comfyui` and
  the later occurrences are plain text

#### Scenario: Ambiguity degrades to silence

- **WHEN** prose contains a string matching aliases of two different entries
- **THEN** the text is left plain and no link is produced

### Requirement: Connection lives in a metadata layer

Every prose page (wiki body, education page, tutorial, blog post) SHALL carry
a `mentions` list of entry ids in its front matter. The rendered page SHALL
show a "Referenced here" rail listing those entries; each entry page SHALL
show an "Appears in" backlink list of every page that mentions it. Backlinks
SHALL be computed at build time from the `mentions` lists, never hand
maintained. A `mentions` id that does not resolve to an entry SHALL fail the
build.

#### Scenario: Backlinks appear without editing the entry

- **WHEN** a new blog post lists `model/claude-opus-5` in its `mentions`
- **THEN** after the next build, the post shows the entry in its
  "Referenced here" rail and the entry page lists the post under
  "Appears in", with no edit to the entry file

### Requirement: Mentions never create work

A mention of a thing that has no entry SHALL render as plain text,
permanently, and SHALL create no task, no issue, no obligation — and no
record: the build does not scan prose for unregistered names (fuzzy mention
scanning is guessing, and it is deliberately not built). Demand is recorded
only when an author writes the explicit marker `{{want:Name}}`, which
renders as the plain text `Name` and increments the want counter for that
name (count of distinct referring pages). Wants are data, not a queue. New
entries are minted only:

- from registry ingest (the Pulse observing that the world produced a thing),
- from want demand (a name wanted by 3 or more distinct pages is eligible),
- or from a maintainer directive.

Minting has exactly two paths: registry ingest creates stubs mechanically
in the Pulse at zero inference cost, and demand- or directive-driven
minting of things no registry carries runs as `entry` jobs under the
loop's new-writing budget (see `loop`). The corpus grows at the rate the
world produces things plus the rate capacity allows, never at the rate the
corpus talks about itself.

#### Scenario: Unknown mention costs nothing and records nothing

- **WHEN** a tutorial mentions a library that has no entry, with no want
  marker
- **THEN** the text renders plain and nothing is recorded anywhere as a
  result

#### Scenario: Demand is recorded only by the explicit marker

- **WHEN** two different pages each contain `{{want:vLLM}}`
- **THEN** both render the plain text `vLLM` and the want counter records
  the name with a count of 2 distinct referring pages

#### Scenario: Demand makes a want eligible, not mandatory

- **WHEN** a name is wanted by 3 distinct pages
- **THEN** it becomes eligible for minting under the new-writing budget and
  is minted only when the loop selects it; it never blocks anything by
  remaining unminted

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

### Requirement: A listed price is a property of a listing, not of a company

A `price_*` transclusion carries OpenRouter's headline rate for a row. That
number is documented as the **top listed provider's** rate for that row, and the
top provider is re-chosen on a rolling 30-second window. It is a property of a
listing at an instant, not a statement about what any company charges. Prose
that makes some party the setter or receiver of it is false about a number that
is itself perfectly accurate — which is why the repair is never to change the
value.

Two independent causes were measured. The top provider rotates: a headline of
`0.000000045` belonged to a reseller while the vendor's own endpoint posted
`0.00000022`, a factor of 4.9, and two rows compared on their headlines can
therefore invert. Separately, one provider lists a single row at several tier
prices — a flex tier at half, a fast tier at double — so even a row whose
endpoints are all the vendor's own can carry three different numbers.

- The build SHALL FAIL when a `price_*` transclusion appears in a sentence that
  makes some party the setter or receiver of the rate — *charges*, *billed*,
  *priced*, *asks*, *costs*, *sells*, *pays* — unless the surrounding section
  mentions the provider layer. Implemented by `lib/price-attribution.mjs`, wired
  into `lib/build-content.mjs`; measured by `lib/price-attribution.test.mjs`.
- Row-attributing verbs — *lists at*, *heads at*, *carries*, *sits at* — are the
  compliant form and SHALL NOT be flagged. The corpus's remedy idiom must not be
  the thing the check fires on.
- The exemption SHALL BE the remedy, not a suppression marker: the only way to
  silence the check is to write the clause that makes the sentence true. There
  is deliberately no ignore comment, because an ignore comment would make the
  cheapest response to a true finding be to hide it.
- Prose SHALL NOT name the top provider, because it rotates. A sentence naming
  it is accurate for as long as a thirty-second window and false afterwards,
  and nothing in the corpus would ever revisit it.
- The **fact itself SHALL NOT be edited** to resolve any of this. A fact records
  what the feed said at a stated moment and binds at build time; rewriting it
  would trade a true record and a false sentence for two false ones.
- Instances predating the check SHALL be recorded in
  `data/price-attribution-debt.json` and SHALL warn rather than fail. That list
  SHALL only ever shrink, and the build SHALL report its length and name entries
  that no longer fire, so a debt that has been repaid cannot sit in the file
  looking like a debt. Implemented in `lib/price-attribution.mjs`.

#### Scenario: An attributed price fails the build

- **WHEN** a page states that a named company *charges* the rate a `price_*`
  transclusion resolves, and its section says nothing about the provider layer
- **THEN** the build fails, naming the file and the sentence

#### Scenario: The hedge is the remedy

- **WHEN** the same sentence is rewritten to attribute the number to the row —
  or its section explains that the headline is the top listed provider's rate
  rather than necessarily the vendor's own
- **THEN** the build passes, and the fact's value is unchanged

#### Scenario: Pre-existing debt warns and only shrinks

- **WHEN** the build encounters an instance recorded in
  `data/price-attribution-debt.json`
- **THEN** it warns rather than failing, reports how many such instances remain,
  and names any recorded entry that no longer fires
