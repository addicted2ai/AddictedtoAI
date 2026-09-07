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

### Requirement: A timeline date may be bound to the feed that records it

A timeline event SHALL take one of two forms, distinguished by an optional
`source` key:

- **cited** — `date`, `event` and `source_url`: a date an author read on a page
  a reader can open. An event declaring no `source` key is a cited event, so
  every event written under the single-form rule stays valid exactly as it
  stands and no entry is migrated.
- **feed** — `event`, the named source and a declared path, and **no `date`**:
  the date is computed from the instant at that path on the joined row.

```yaml
timeline:
  - event: listed in the OpenRouter catalog
    source: feed
    feed: openrouter-models
    path: created
```

**The join is declared, exactly as a feed-bound fact's is.** The entry SHALL
carry the row id in its `feeds` map, and the event SHALL name the source and
the field path within the joined row. An event naming a source the entry's
`feeds` map does not carry SHALL fail the build, naming the entry and the
event. Nothing is matched by name.

A feed-bound event declaring its own `date` SHALL fail the build, naming the
entry and the event: a typed date beside a bound one is the restatement the
binding exists to remove, and the two cannot be kept in step by anything.

**The instant is read as a UTC calendar date.** This repository's local-date
convention governs dates *authored on the machine that writes them* — a fact's
`accessed`, a review record's `date`, a tutorial's `verified_on` — and a
publisher's timestamp is not one of those. Feed instants are already read in
UTC where the build computes the days between two catalog rows, and one
convention for feed instants is what makes those numbers comparable with these
dates.

**The date SHALL be resolved before anything consumes the timeline**, so that
every consumer — the entry page's ordering, the published dataset's rows, the
indexability count, the dormant stamp — sees one shape and no consumer learns
that binding exists. The exported dataset row SHALL carry a resolved date and a
reachable source for both forms.

A feed-bound event whose declared row is absent from the current snapshot SHALL
render its last-known date with a visible as-of date, and a repair finding
enters the derived queue — the same treatment a vanished row's facts receive.
It SHALL NOT disappear from the timeline: an event that happened does not
un-happen because the row was delisted.

#### Scenario: A listing date is bound rather than transcribed

- **WHEN** an entry joined to a catalog row declares a timeline event bound to
  that row's listing instant
- **THEN** the entry page shows the listing date computed from the snapshot,
  with the source named, and no date appears in the entry's front matter

#### Scenario: An event with no source key is a cited event

- **WHEN** an entry carries a timeline event declaring `date`, `event` and
  `source_url` and no `source` key
- **THEN** it validates and renders exactly as it did before the two forms
  existed

#### Scenario: A feed-bound event carrying a date fails the build

- **WHEN** a timeline event declares the feed form and also declares `date`
- **THEN** the build fails naming the entry and the event

#### Scenario: A feed-bound event on an undeclared source fails the build

- **WHEN** a timeline event names a source the entry's `feeds` map does not
  carry
- **THEN** the build fails naming the entry and the event, before any page
  renders

#### Scenario: A vanished row keeps the event it dated

- **WHEN** the row a timeline event binds to is absent from the latest snapshot
- **THEN** the event renders its last-known date with a visible as-of date, a
  repair finding appears in the derived queue, and the event stays on the
  timeline

## MODIFIED Requirements

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
