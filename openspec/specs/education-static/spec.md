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

Static education SHALL be organized as an ordered ladder from orientation
(no code, no math) through advanced mechanics (transformer internals,
training, adaptation, inference economics, interpretability). Every page
SHALL declare: its level, what the reader will understand or be able to do
after reading (stated at the top), and which pages it assumes (rendered as
prerequisite links). The ladder's index page SHALL be generated from these
declarations, never hand-maintained.

#### Scenario: A reader can see where a page sits

- **WHEN** a visitor opens any static education page
- **THEN** the page shows its level, an explicit "after this you will
  understand X" statement, and links to its declared prerequisites

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
