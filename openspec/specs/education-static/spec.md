# education-static Specification

## Purpose
Evergreen education: what AI is and how it works, basics through advanced,
written once to stay true. Depth an enthusiast can dive into — not an on-ramp
the front page funnels everyone through.

## Requirements

### Requirement: Static education pages are built not to rot

Every static education page SHALL be written so that nothing on it perishes
with the news cycle:

- No model names, prices, versions, vendor rankings, or benchmark scores as
  literal prose. Where a current example is genuinely needed, it SHALL be a
  transclusion from a wiki entry (so it updates from the data layer) or an
  explicitly dated aside ("as of <date>").
- Mechanisms, math, and concepts are stated timelessly ("attention computes a
  weighted mixture" — not "today's models use").
- Every page carries a `mentions` list connecting it to the concept and
  technique entries it teaches.

Revisions to static pages are for correctness and clarity only; a static page
being old is not a defect and SHALL NOT generate re-verification work.

#### Scenario: A static page survives a model generation unchanged

- **WHEN** a new frontier model generation ships
- **THEN** no static education page requires an edit; any current-model
  example it shows updates via transclusion at the next build

#### Scenario: Perishable literal in a static page is a review rejection

- **WHEN** a draft static page hard-codes a model's context window as prose
- **THEN** review rejects it with reason `spec-violation`, naming the literal
  and the transclusion that should replace it

### Requirement: The curriculum is a ladder with stated prerequisites

Static education SHALL be organized as an ordered ladder of levels, each
level defined by **what a page on it may assume of the reader**, not by its
topic — from orientation (assumes nothing but everyday experience) through
foundations (mechanism in prose, no notation), mechanics (the actual parts,
named and defined at first use) to advanced (load-bearing details and
disputes). Every page SHALL declare: its level, what the reader will
understand or be able to do after reading (stated at the top), and which
pages it assumes (rendered as prerequisite links). The ladder's index page
SHALL be generated from these declarations, never hand-maintained.

Two additions:

- **Prerequisites SHALL never point up the ladder.** A page's prerequisite
  SHALL be on the same or an earlier level, and a violation SHALL fail the
  build, naming the page, the prerequisite, and both levels. Together with
  the existing within-level topological order, this makes the generated
  reading order a guarantee: a reader who reads strictly in order is never
  sent forward for something they needed already.
- **Each level SHALL have a stated purpose** — the reader capability at the
  end of the rung — and an admission test for placing a page on it, recorded
  in the curriculum; the generated index SHALL state each rung's purpose in
  reader terms.

#### Scenario: A reader can see where a page sits

- **WHEN** a visitor opens any static education page
- **THEN** the page shows its level, an explicit "after this you will
  understand X" statement, and links to its declared prerequisites

#### Scenario: A prerequisite pointing up the ladder fails the build

- **WHEN** a foundations page declares an advanced page among its
  prerequisites
- **THEN** the build fails with an error naming the page, the prerequisite,
  and both levels, before any page renders

#### Scenario: The in-order reader is never sent forward

- **WHEN** a reader reads the generated ladder index strictly top to bottom
- **THEN** every prerequisite of every page they reach has already appeared
  earlier in the order

### Requirement: Each page must beat the obvious alternative

A static education page SHALL exist only where it can beat the reader's
obvious alternative (Wikipedia, a vendor's docs) on at least one of: clarity
of mechanism, honest currency via transclusion, or connectedness (the page
places the concept in the site's web of entries and surfaces). A page that
merely restates what Wikipedia says better is cut, not published — for broad
concepts Wikipedia owns, the wiki entry carries a short orienting body and an
outbound link instead of a competing education page.

#### Scenario: A redundant explainer is rejected

- **WHEN** a draft page explains a broad concept no better than its Wikipedia
  article and adds no currency or connection value
- **THEN** review rejects it with reason `not-worth-reading`, and the concept
  keeps only its wiki entry with an orienting paragraph and outbound link

### Requirement: The surface is grown against a written map of the whole subject

The learn surface SHALL be developed against a written curriculum that
divides the subject into named areas and enumerates every planned page with
its level, outcome, prerequisites, and coverage bounds (what it must cover,
what it must not drift into). The curriculum of record is
`openspec/curriculum/learn.md` — a path chosen because this requirement
outlives the change that introduces it: archiving moves a change's own files
into `openspec/changes/archive/`, so a permanent `SHALL NOT` anchored to one
would quietly start pointing into an archive directory and stop being
followed. It sits outside `openspec/specs/` as well, because that path is
reserved and the curriculum must stay editable — this requirement obliges
amending it. A learn page SHALL NOT publish unless it
appears in the curriculum; a page worth writing that the curriculum lacks
SHALL be added to the curriculum — visibly, with its area, rung and
prerequisites — in the same change that adds the page. Silent drift is the
named enemy: the map must keep describing the territory, or coverage claims
become unverifiable.

#### Scenario: A page outside the map amends the map first

- **WHEN** a job proposes a learn page that appears in no curriculum entry
- **THEN** review requires the curriculum amended — area, rung,
  prerequisites, outcome, bounds — before the page can merge, and rejects
  the page as `spec-violation` otherwise

#### Scenario: Coverage is checkable when the spine completes

- **WHEN** every page the curriculum enumerates has been published
- **THEN** every named area of the curriculum's map has published pages
  serving it, and the check is a read of the curriculum against
  `content/learn/`, not anyone's recollection

### Requirement: Every page lands for its rung's reader

Approachability is a property review can reject on, not a preference. For
every static education page:

- The page SHALL be written for its rung's named reader as defined in the
  curriculum, and SHALL assume, among learn pages, only its transitive
  prerequisites. A page that leans on a page it does not (transitively)
  declare SHALL be rejected in review as `spec-violation`, naming the
  undeclared assumption.
- On orientation and foundations pages, a term of art SHALL be given its
  meaning in the sentence that introduces it or the sentence before; pages
  below mechanics SHALL contain no equations or notation.
- Every page SHALL contain at least one sentence a reader would repeat to
  someone else — the structural surprise that makes the page worth sending.
  A reviewer who cannot name that sentence SHALL reject as
  `not-worth-reading`, in those words, consistent with the editorial
  standard.

#### Scenario: Jargon before meaning is a rejection

- **WHEN** a draft foundations page uses a term of art three paragraphs
  before anything conveys what it means
- **THEN** review rejects it as `spec-violation`, naming the term and the
  rung's admission test

#### Scenario: An unearned assumption is a rejection

- **WHEN** a draft orientation page's explanation only makes sense to
  someone who has read a mechanics page it does not declare
- **THEN** review rejects it as `spec-violation`, naming the undeclared
  assumption

#### Scenario: No sendable sentence, no publication

- **WHEN** a reviewer cannot name the sentence a reader would send to
  someone else
- **THEN** the piece is rejected as `not-worth-reading`, recorded in those
  words
