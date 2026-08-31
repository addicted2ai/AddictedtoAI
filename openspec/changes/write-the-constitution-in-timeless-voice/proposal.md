# Proposal: write-the-constitution-in-timeless-voice

## Why

A requirement body in `openspec/specs/` is read by someone who will never see
the change that wrote it. By the time they find it, that change is one of dozens
of directories under `openspec/changes/archive/`, reachable by a name they do
not have and would have no reason to guess. So a body saying *"this change"*,
*"drafted in this change's `design.md`"* or *"that is D8 in `design.md`"* tells
that reader nothing they can act on. In the worst case it points at a file the
archive itself moved, or cites a sentence that no longer exists anywhere.

This is a defect the repository has already paid for once. On 2026-08-31
`record-state-before-anything-reads-it` was archived carrying a `MODIFIED` block
whose body opened with a paragraph of pure change narration. A `MODIFIED` block
replaces the **whole** requirement body, so the archive wrote that paragraph
straight into `openspec/specs/pulse/spec.md`, citing a sentence the same archive
had removed. It was caught by counting occurrences afterwards, undone while
still uncommitted, rewritten in the constitution's voice, and re-archived. The
mechanism built out of that incident — `scripts/check-spec-deltas.mjs`
(`addictedtoai-vl9`) — now refuses the same defect in any *unarchived* delta.

It cannot reach what is already merged. Six bodies still carry it
(`addictedtoai-n2g`), all of them entered through deltas archived before the
check existed, and `openspec/specs/` is a reserved path no direct edit and no
Desk job may touch. The only legitimate route to them is a change carrying
`MODIFIED` blocks — which is this one.

**Nothing is wrong with the machine.** Every rule involved is correct and stays
correct. This is legibility of the constitution to its future readers, which is
exactly the class of defect that never gets fixed unless someone gives it an id.

## What Changes

**Six requirement bodies, rewritten in the constitution's own voice — what the
system does, not what an edit did to it.** Measured on 2026-08-31 by running
`scripts/check-spec-deltas.mjs`'s own `narrationHits()` over every live
requirement body, which is the same instrument that guards new deltas:

| capability | requirement | markers |
|---|---|---|
| `education-static` | The surface is grown against a written map of the whole subject | `this-change` |
| `loop` | A runner proven unable to run is refused, and refusal is not a halt | `this-change` ×2, `bare-change-artifact` |
| `loop` | A budget refusal states the arithmetic it refused on | `bare-change-artifact` |
| `loop` | A job's total spend is measured, and the cap is named for what it is | `bare-change-artifact` |
| `review` | A review record names the bytes it reviewed | `this-change` |
| `review` | Missing, unbound, and mismatched are three findings, not one | `this-change` |

Eight marker hits across six bodies. `addictedtoai-n2g` enumerated seven *lines*;
two of them (`loop/spec.md:426` and `:452`) sit inside one requirement body, and
`:452` — *"drafted in this change's `design.md`"* — trips two markers at once. The
six bodies here are the same seven lines, counted by the unit a `MODIFIED` block
actually replaces.

**Three dead pointers are replaced by live ones, not deleted.** Three of the
narrations pointed at open questions recorded in a change's `design.md`: which
denominator a budget share is measured against (D8), whether a job's total spend
should be bounded (D9), and whether a Desk with no usable runner should halt.
Those questions are all still open and all still worth a reader knowing about.
Each already has a beads issue — `addictedtoai-tr8`, `addictedtoai-o5t` and
`addictedtoai-pfv` respectively — so each `design.md` reference becomes the beads
id. A beads id resolves under `bd show` for as long as the repository exists;
an archived `design.md` resolves for as long as nobody archives it. The
constitution already carries one such citation (`addictedtoai-ps3` in
`openspec/specs/pulse/spec.md`), so this follows a precedent rather than setting
one.

**Nothing normative changes.** No SHALL is added, removed, weakened or
strengthened. No scenario is added, removed or renamed, and no WHEN/THEN pair
changes what it asserts. One WHEN is *restated*, in `education-static`: *"every
task in this change's spine is complete"* becomes *"every page the curriculum
enumerates has been published"* — the same condition, named so a reader who
cannot reach the originating change's task list can still evaluate it.

Its scenario heading is left exactly as it stands, deliberately.
`openspec validate --strict` treats a scenario heading as the scenario's
identity and refuses a `MODIFIED` block that renames one, reporting it as
*omitting a scenario the current spec still has* — the archive cannot tell a
rename from a deletion, and errs toward not silently dropping a scenario. That
is the right default and this change lives within it.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `education-static`: one modified requirement — *"The surface is grown against
  a written map of the whole subject"*. Prose only, in one scenario.
- `loop`: three modified requirements — *"A runner proven unable to run is
  refused, and refusal is not a halt"*, *"A budget refusal states the arithmetic
  it refused on"*, *"A job's total spend is measured, and the cap is named for
  what it is"*. Prose only, in the framing paragraph of each and in one bullet
  of the first.
- `review`: two modified requirements — *"A review record names the bytes it
  reviewed"*, *"Missing, unbound, and mismatched are three findings, not one"*.
  Prose only, in one closing paragraph and one bullet respectively.

No other capability is touched. `pulse`, `wiki`, `site`, `blog`, `editorial`,
`directory`, `education-dynamic` and `analytics` carry no narration: the scan
that produced the table above read all eleven live specs.

## Impact

- **Machinery**: none. No file under `lib/`, `pulse/`, `loop/`, `scripts/` or
  `app/` changes. No dependency, no script, no edit to `package.json`.
- **Content**: none.
- **Data**: none.
- **Tests**: none added. The behaviour that would catch a regression of this
  defect already exists and is already tested — `scripts/check-spec-deltas.mjs`
  refuses `narration` findings under `--strict` and warns on them in the
  prebuild. This change is that check applied retroactively to text it could not
  reach.
- **Specs**: `openspec/specs/education-static/spec.md`,
  `openspec/specs/loop/spec.md`, `openspec/specs/review/spec.md` — on archiving.
- **Collisions**: none. Checked on 2026-08-31 by enumerating every requirement
  heading touched by every unarchived change. `make-the-blog-worth-sending`
  modifies three `loop` headings and two `review` headings, and
  `group-tool-listings-by-category` modifies one `directory` heading; **none of
  them is one of the six here**. Archive order between the three changes is
  therefore free.
- **Deployment**: nothing here pushes and nothing here is executable. Archiving
  is the maintainer's or the orchestrator's act, not a job's.
