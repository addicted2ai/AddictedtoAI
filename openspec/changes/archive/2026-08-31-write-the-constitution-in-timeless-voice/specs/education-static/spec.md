# education-static — delta for write-the-constitution-in-timeless-voice

One requirement, one scenario, prose only. The body below reproduces the live
requirement verbatim except for the last scenario, whose WHEN read *"every task
in this change's spine is complete"* — a condition naming the task list of the
change that introduced the requirement, which archiving moved into
`openspec/changes/archive/`. A reader who finds that scenario in the
constitution cannot evaluate its WHEN, because they cannot reach the spine it
names.

The condition is restated as what it always meant: every page the curriculum
enumerates has been published. That is the same condition, checkable from the
curriculum and `content/learn/` alone, which is precisely what the THEN already
says the check is.

**The scenario heading is preserved verbatim, and that is not an oversight.**
`openspec validate --strict` treats a scenario heading as the scenario's
identity: a `MODIFIED` block that renames one is refused as *omitting a scenario
the current spec still has*, because the archive cannot tell a rename from a
deletion. So "the spine" stays in the heading and the reader gets its meaning
from the WHEN beneath it — the curriculum's enumerated pages — which is the line
they have to evaluate anyway. Restating the WHEN is the whole fix; renaming the
heading is not available at any price worth paying.

Nothing normative changes. No SHALL is added, removed or altered.

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
