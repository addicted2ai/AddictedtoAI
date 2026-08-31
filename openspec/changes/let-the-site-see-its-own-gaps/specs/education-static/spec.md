# education-static — delta for let-the-site-see-its-own-gaps

Every normative sentence below names, in `tasks.md`, the task that implements
it and the check that measures it. That traceability is not decoration: a
requirement nothing builds and nothing measures is invisible twice over — a
literal implementer never builds it, and the integrated verification passes
without it. **This delta exists because that failure already happened to this
very requirement**: the `SHALL NOT` below has been in force since
`teach-the-whole-subject` was archived and has never had an implementation.

## MODIFIED Requirements

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

**That `SHALL NOT` is enforced by the build, not by review alone.** A
published learn page whose slug appears in no curriculum entry SHALL fail the
build, naming the page's file, the slug, and the path of the curriculum of
record, before any page renders. The check SHALL read the curriculum's catalog
section — the enumeration of planned pages — and no other part of it, so that
prose elsewhere in the document cannot be mistaken for a declaration. Where the
curriculum of record cannot be read at all, the build SHALL fail with one error
naming that file, rather than one error per page: a reader who has lost the map
needs to be told that once.

#### Scenario: A page outside the map amends the map first

- **WHEN** a job proposes a learn page that appears in no curriculum entry
- **THEN** review requires the curriculum amended — area, rung,
  prerequisites, outcome, bounds — before the page can merge, and rejects
  the page as `spec-violation` otherwise

#### Scenario: An undeclared page stops the build

- **WHEN** a learn page is published whose slug appears in no entry of the
  curriculum's catalog
- **THEN** the build fails naming the page's file, the slug and the
  curriculum path, and no page renders

#### Scenario: A lost map is one error, not thirty-eight

- **WHEN** the curriculum of record is missing or its catalog section cannot
  be found
- **THEN** the build fails with a single error naming the curriculum path,
  and does not report every published page as undeclared

#### Scenario: Coverage is checkable when the spine completes

- **WHEN** every page the curriculum enumerates has been published
- **THEN** every named area of the curriculum's map has published pages
  serving it, and the check is a read of the curriculum against
  `content/learn/`, not anyone's recollection
