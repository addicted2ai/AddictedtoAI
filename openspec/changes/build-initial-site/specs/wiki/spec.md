# wiki — delta for build-initial-site

## Purpose

The wiki is the site's cornerstone substrate: one typed, sourced, dated record
per thing in AI. Every other surface references wiki entries rather than
restating their facts, so correcting a fact in one place corrects it
everywhere it appears.

## ADDED Requirements

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

### Requirement: Volatile facts travel by transclusion, never by restatement

Prose anywhere on the site (wiki bodies, education pages, tutorials, blog
posts) SHALL state a volatile fact (any `fast` or `slow` fact: price, context
window, version, status, benchmark score) only by transcluding it from the
owning entry with an explicit reference (entry id + field name), rendered
with its current value at build time. Prose MUST NOT hard-code a volatile
value as literal text.

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
permanently, and SHALL create no task, no issue, and no obligation. The build
records it only as a want: a counter of (name, distinct referring pages).
Wants are data, not a queue. New entries are minted only:

- from registry ingest (the Pulse observing that the world produced a thing),
- from want demand (a name wanted by 3 or more distinct pages is eligible),
- or from a maintainer directive.

Minting is budgeted under the loop's new-writing budget (see `loop`). The
corpus grows at the rate the world produces things plus the rate capacity
allows, never at the rate the corpus talks about itself.

#### Scenario: Unknown mention costs nothing

- **WHEN** a tutorial mentions a library that has no entry
- **THEN** the text renders plain, the want counter for that name increments,
  and no task or issue exists anywhere as a result

#### Scenario: Demand makes a want eligible, not mandatory

- **WHEN** a name is wanted by 3 distinct pages
- **THEN** it becomes eligible for minting under the new-writing budget and
  is minted only when the loop selects it; it never blocks anything by
  remaining unminted

### Requirement: Entries are tiered, and only worthy pages are indexed

Every entry is either a **stub** (structured data only, no prose body) or
**full** (has a prose body). Stubs SHALL exist freely at zero inference cost:
they render a page from their data (identity, facts, timeline, backlinks),
they appear in site search and in the open dataset, but they carry `noindex`
and appear in no browse listing.

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
- **THEN** its page renders, is searchable on-site, carries `noindex`, and
  appears in no browse listing

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
