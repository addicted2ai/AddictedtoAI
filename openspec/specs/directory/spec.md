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
by objective, stated criteria only (name, date, price, status, category,
domain). This
is the trust position every surveyed competitor forfeits; it is not adjustable
without an OpenSpec change.

A category ordering is not objective the way an alphabet is — someone chooses
which category leads, and that choice is exactly the placement this requirement
forbids selling. So where a directory surface orders by category:

- The order SHALL be a **pure function of the category names**, and SHALL NOT
  be derived from the order in which the categories are declared. A
  hand-ordered list of categories is a placement decision wearing a
  configuration file's clothes.
- The order SHALL NOT be by listing count. Ordering by count moves whenever a
  listing is added, so a tool's placement would depend on how many neighbours
  it has — a quantity an interested party can change by asking for more
  listings beside it.
- The closed list of categories SHALL live in the build's schema, so changing
  it is a reviewed schema change rather than a front-matter edit.
- Where a page presents more than one ordering, **each ordering SHALL state its
  own criterion** on the page, through the same mechanism every other ordered
  surface uses, and the criterion the page is actually ordered by SHALL be
  stated first.

**A domain grouping is a category ordering by another name, and it inherits
every clause above.** Wherever any surface on this site groups or sections by
domain — the directory's own pages, and equally the frontier surface, which is
where the pressure will actually come from — then:

- Sections SHALL be ordered by a **pure function of the domain ids**, computed
  from the ids themselves. Not the order the closed vocabulary happens to be
  written in, not the number of members a domain holds, and not any index
  score, ranking, recency or measure of a domain's importance.
- The closed vocabulary SHALL live in the build's source tree in exactly one
  place, so changing it is a reviewed change rather than a front-matter edit.
- The ordering criterion SHALL be stated on the page, in the same form every
  other ordered surface uses.

The last of those bullets is the one with a live temptation behind it, so it is
written as a prohibition rather than left to inference. "Order the domains by
how important they are" is not a sort; it is a placement decision, made by
whoever holds the pen, about which field of AI a reader sees first. That it
would be made in good faith by someone with no money involved does not change
what it is, and a surface that has quietly established an importance order is a
surface that has something to sell later.

#### Scenario: Ordering is explainable

- **WHEN** any directory listing page renders
- **THEN** its sort order is one of the stated objective criteria and the
  page says which

#### Scenario: Both orderings on one page say which they are

- **WHEN** the tools directory renders its grouped default and its
  alphabetical alternative
- **THEN** both carry a stated criterion in the site's standard sort-note form,
  and the grouped criterion — the one the page body is in — comes first

#### Scenario: The category order cannot be hand-arranged

- **WHEN** someone reorders the closed category list to move a category up the
  page
- **THEN** the page is unchanged, because the render sorts by name

#### Scenario: Reordering the domain vocabulary changes nothing

- **WHEN** the closed domain vocabulary is rewritten in a different order —
  even reversed — to move a domain's section up a page
- **THEN** every domain-grouped surface renders in exactly the same order as
  before, because the render sorts by domain id

#### Scenario: A busy domain does not lead the page

- **WHEN** one domain accumulates more tagged records than every other
- **THEN** its section stays in the same position, because member count is not
  a permitted ordering criterion

#### Scenario: A domain's section order is not a ranking of domains

- **WHEN** a domain-grouped surface renders
- **THEN** the page states that its sections are ordered by domain id, so that
  the first section is not read as the most important domain

### Requirement: The machine-readable payloads are a published contract

Every machine-readable payload the site publishes SHALL be usable as a
dependency by someone who did not write it, which requires saying what may be
depended on.

- Each payload SHALL carry a **schema version** and a URL pointing at the
  written statement of what the version means. Payloads describing different
  shapes SHALL carry independent version numbers, so a change to one is not
  reported as a change to the other.
- The written statement SHALL say what is stable **and what is not**, in that
  order. Stating only what is stable produces a promise the site cannot keep,
  because the values in these files are expected to move.
- **Stable** SHALL mean: the URL, the licence and its presence inside the
  payload, the top-level key names, every existing field name on a row and its
  meaning, that the stated row count equals the number of rows, and that rows
  are in the order the payload's stated sort criterion names.
- **Not stable, and never claimed to be** SHALL mean: which rows are present,
  their values, how many there are, and the generation date.
- A **new** key MAY be added to a payload or a row without the version
  changing. The version SHALL increase only when an existing key is renamed or
  removed; that is the only thing it means.
- Every such payload SHALL be served with a permissive cross-origin header, so
  a page in a browser can read it directly. The set of routes carrying that
  header SHALL be derived from the set of assets the build writes, never
  maintained by hand.

#### Scenario: A consumer reads an unfamiliar key

- **WHEN** a payload gains a field a reader does not recognise
- **THEN** the schema version is unchanged and a reader that ignores unknown
  keys is unaffected

#### Scenario: A field is renamed

- **WHEN** an existing key on a payload or a row is renamed or removed
- **THEN** the schema version increases

#### Scenario: A new machine-readable asset is published

- **WHEN** the build begins writing an asset it did not write before
- **THEN** that asset is served with the cross-origin header without anyone
  adding it to a list

#### Scenario: A browser fetches the catalog from another origin

- **WHEN** a page on an unrelated origin fetches a standing table's JSON
- **THEN** the request succeeds and the payload states its schema version and
  where the contract is written

### Requirement: Every tool listing declares the job it is for

A visitor arrives at the tools directory wanting a tool that does a **job**.
Grouping by job is only possible if the job is recorded, so every curated tool
listing SHALL declare a `category` naming the job it is for.

- The set of categories SHALL be a **closed list**, validated at build time. A
  listing carrying a value outside the list SHALL fail the build, naming the
  file, the field, the offending value, and the values that are allowed — the
  same treatment an unknown `kind` receives, for the same reason: an open field
  drifts into `coding` / `code` / `Coding` and the grouping stops being a
  partition.
- The field SHALL be **required**, with no default and no catch-all category. A
  default would be a catch-all by another name, and a catch-all that collected
  a third of the directory would defeat the point of grouping at all.
- A listing's category SHALL be **declared data**, and SHALL NOT be inferred
  from the listing's title, URL, pricing or description by any heuristic. This
  is the rule `lib/units.mjs` already states for units and the alias registry
  already states for alias classes: a heuristic that is right most of the time
  is silently wrong the rest of the time, and nothing downstream can tell which
  case it is looking at.
- A listing SHALL carry **exactly one** category, so the grouping is a
  partition of the directory and the group counts sum to the number of
  listings.
- Every category in the closed list SHALL carry a one-clause note saying what
  job it covers, and a category with no note SHALL fail the build. A one-word
  heading the reader cannot act on is not grouping by job; it is grouping by
  vocabulary.

#### Scenario: An unknown category stops the build

- **WHEN** a listing declares a category that is not in the closed list
- **THEN** the build fails naming the file, the field, the offending value and
  the allowed values, and no page is published

#### Scenario: A listing with no category does not build

- **WHEN** a new listing is added without a `category` key
- **THEN** the build fails naming the missing field, rather than filing the
  listing under a default

#### Scenario: The counts sum

- **WHEN** the directory renders
- **THEN** every listing appears in exactly one group and the group counts sum
  to the total number of listings

### Requirement: The tools directory is grouped by the job each tool does

The tools directory's **default** order SHALL be by category, and the
alphabetical order SHALL remain available on the same page.

- Categories SHALL be ordered **alphabetically by category name**, and that
  order SHALL be computed from the names themselves — never taken from the
  order the closed list happens to be written in, and never from the number of
  listings a category holds.
- Within a category, listings SHALL be ordered **alphabetically by listing
  name**, which is the ordering the flat page has always made.
- A category holding no listings SHALL render no heading, no note and no jump
  link. An empty group is a promise the directory is not keeping.
- Every listing SHALL appear exactly once in the grouped body, including
  listings marked could-not-verify or discontinued, which keep their place with
  their markers. Grouping SHALL NOT become a way for a listing to be dropped.
- The complete alphabetical ordering SHALL remain reachable on the same page,
  and SHALL be reachable **without JavaScript**, consistent with the site's
  static export.

#### Scenario: The reader arrives with a job

- **WHEN** the tools directory renders
- **THEN** the listings are presented under category headings in alphabetical
  order of category name, each heading stating in one clause what job the
  category covers

#### Scenario: Reordering the closed list changes nothing

- **WHEN** the closed category list is rewritten in a different order — even
  reversed
- **THEN** the rendered page presents the categories in exactly the same order
  as before

#### Scenario: Adding listings never moves a category

- **WHEN** listings are added to one category until it is the largest
- **THEN** every category is still in the same position on the page

#### Scenario: Alphabetical is still there

- **WHEN** a reader wants the A-to-Z order
- **THEN** the page offers the complete alphabetical list of every listing,
  with its own stated criterion, and it works with JavaScript disabled

#### Scenario: A dead listing keeps its place inside its group

- **WHEN** a listing has failed two consecutive rolling checks
- **THEN** it renders inside its category with its could-not-verify marker,
  exactly as it did on the flat page

### Requirement: A tool listing may declare the domains it serves

A listing's `category` is **the job the tool is for** — `inference`,
`observability`, `training`. A listing's `domains` are **the fields of AI it
serves**. These are different questions and neither answers the other, which is
why the facet is added rather than folded into the category list.

The measurement that settles it: of the 35 curated listings under
`content/directory/tools/` on 2026-09-05, **23 map to no domain at all**.
Their categories — `local` (5), `inference` (5), `training` (3),
`observability` (3), `data` (3), `frameworks` (2), `evaluation` (2) — describe
jobs that are performed across every domain and belong to none. That count
follows `loops/ui-loop/graph/knowledge/EN-domain-facet.md` §4's own mapping,
under which `retrieval` (3) → `research`; treating `retrieval` as unmapped gives
26 instead. An inference server is not less of an inference server for being
domain-neutral.

*(The upstream artifacts all state 28 here — DESK-ORDER-001 §3,
`loops/ui-loop/graph/knowledge/EN-domain-facet.md` §4, and
`loops/ui-loop/graph/knowledge/SPEC-REVIEW-GUIDE.md` row 36. Recounted from the
tree on 2026-09-05, the seven domain-neutral categories hold 23 listings; 28 is
35 minus the seven category names. The conclusion those artifacts draw is
unaffected.)*

Therefore:

- `domains` on a tool listing SHALL be **optional**, and the empty set SHALL be
  the common case rather than an omission to be chased. A required field here
  would force a wrong answer onto 23 of the 35.
- It SHALL be **set-valued**, drawing on the same closed vocabulary, with the
  same single definition in the source tree and the same build-time gate, as
  the domain facet in `wiki`. There is not a second vocabulary for tools.
- It SHALL be **editorial and declared**, never inferred from the listing's
  title, URL, pricing or blurb, and never derived from its `category` by a
  lookup table. A category-to-domain mapping is a heuristic wearing a
  configuration file's clothes: `coding` the category and `coding` the domain
  agree by coincidence of naming, and `retrieval` → `research` is a judgment
  someone has to make and be accountable for.
- It SHALL NOT change what `category` means, how many a listing carries, or
  that a listing with no `category` fails the build.

A listing's `domains` SHALL NOT be exempted from its reviewed surface, for the
reason the `wiki` delta gives at length: no feed seeds a tool listing, so every
value here is a judgment, and a judgment publishes through review.

#### Scenario: A domain-neutral tool needs no domain

- **WHEN** a listing in the `inference` category declares no `domains`
- **THEN** it validates and renders exactly as before, and nothing marks the
  absence as incomplete

#### Scenario: A domain does not replace the category

- **WHEN** a listing declares `category: retrieval` and `domains: [research]`
- **THEN** both validate, the listing appears under `retrieval` in the
  category grouping exactly as it did before, and the counts of the category
  grouping still sum to the number of listings

#### Scenario: An unknown domain stops the build

- **WHEN** a listing declares a `domains` value outside the closed vocabulary
- **THEN** the build fails naming the file, the field, the offending value and
  the allowed values — the same treatment an unknown `category` receives

#### Scenario: The category list is not a domain list

- **WHEN** a listing in the `image` category declares no `domains`
- **THEN** the build does not infer `image`, because a domain is declared and
  never derived — the category and the domain having the same spelling is a
  coincidence of naming, not a mapping
