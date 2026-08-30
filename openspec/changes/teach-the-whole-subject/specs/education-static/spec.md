# education-static — delta for teach-the-whole-subject

Every normative sentence below names, in `tasks.md` §7, the task that
implements it and the check that measures it. This repository has been bitten
by the alternative: a SHALL with no task is invisible twice over — a literal
implementer never builds it and the verification passes without it.

## MODIFIED Requirements

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

## ADDED Requirements

### Requirement: The surface is grown against a written map of the whole subject

The learn surface SHALL be developed against a written curriculum that
divides the subject into named areas and enumerates every planned page with
its level, outcome, prerequisites, and coverage bounds (what it must cover,
what it must not drift into). The curriculum of record is
`curriculum.md` in this change. A learn page SHALL NOT publish unless it
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

- **WHEN** every task in this change's spine is complete
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
