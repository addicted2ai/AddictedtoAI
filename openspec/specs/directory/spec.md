# directory Specification

## Purpose
The discovery layer: what exists, what it costs, and whether it is still
alive. A feed-fed model catalog with standing tables (prices, context
windows, deprecations, retirements) plus a curated tools directory — every
row sourced, dated, and re-verified, because every other directory only adds
and never re-checks.

## Requirements

### Requirement: The model catalog is fed by structured feeds, not written

The model catalog SHALL be generated from the Pulse's data layer (free,
structured, machine-readable sources — at build time these include the
OpenRouter models API and llm-releases.com; the source registry in `pulse`
governs the actual set). Model rows are data, not prose: no inference is
spent producing or refreshing them. Each row SHALL show at minimum: model
name (linked to its wiki entry when one exists), provider/org, input and
output price, context window, status, and the date the row's source was last
fetched. A field the feed does not provide renders as absent — never guessed,
never filled by a model.

#### Scenario: Catalog refresh costs zero inference

- **WHEN** the Pulse fetches its model sources and rebuilds
- **THEN** the catalog reflects the new data with no model invocation
  anywhere in the path

#### Scenario: Missing data renders as missing

- **WHEN** a feed row lacks a context window value
- **THEN** the catalog cell renders as absent (an em dash or "not published"),
  never as an estimated number

### Requirement: Standing tables answer recurring questions

The directory SHALL include standing pages that are each the complete answer
to one recurring question, generated from the data layer:

1. **Every model you can call today** — the full catalog with price and
   context window, filterable, with the fetch date visible.
2. **Deprecations and retirements** — every model whose status is
   `deprecated`, `retired`, or `dead`, with dates and sources. Retirements
   are first-class data here, not footnotes; vendors delete this record and
   this site keeps it.
3. **What changed recently** — price moves, status changes, new arrivals in
   the last 30 days, derived from the Pulse's diff history.

Each standing table SHALL have a stable URL and a machine-readable
counterpart (JSON) at a sibling URL.

#### Scenario: A retirement persists after the vendor deletes it

- **WHEN** a vendor removes a retired model from its own pages
- **THEN** the deprecations table still lists it with its dated lifecycle
  and the archived source reference

### Requirement: Curated tool listings are sourced and re-verified

The tools directory SHALL consist of curated entries, each linked to a wiki
entry, each showing: what it is, its canonical URL, its pricing model, and a
`last_verified` date. The Pulse SHALL re-check each listing's canonical URL
on a rolling cadence (every listing at least every 45 days). A listing whose
URL fails or whose subject is known dead SHALL be visibly marked ("could not
verify since <date>" or "discontinued <date>") — dead listings are marked
and kept as record, never silently dropped and never left looking alive.

#### Scenario: A dead tool is marked, not hidden

- **WHEN** a listed tool's site stops resolving across two consecutive Pulse
  checks
- **THEN** the listing renders a visible could-not-verify marker with the
  date, and a repair job appears in the derived work queue

### Requirement: No placement is ever sold

The directory SHALL contain no paid placement, no affiliate links, no
sponsored ordering, and no field whose value depends on payment. Ordering is
by objective, stated criteria only (name, date, price, status). This is the
trust position every surveyed competitor forfeits; it is not adjustable
without an OpenSpec change.

#### Scenario: Ordering is explainable

- **WHEN** any directory listing page renders
- **THEN** its sort order is one of the stated objective criteria and the
  page says which
