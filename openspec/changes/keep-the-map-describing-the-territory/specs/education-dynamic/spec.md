# education-dynamic — delta for keep-the-map-describing-the-territory

One requirement added. The four existing requirements — the declared perishable
surface, the always-visible verification state, demotion and archival, and
upkeep's priority over growth — are untouched.

What is added is the decision `addictedtoai-kat1` asks for, and the map that
decision requires. Measured 2026-09-06: `content/tutorials/` publishes four
tutorials; `QUEUE_PRODUCIBLE_TYPES` in `pulse/lib/queue.mjs` holds six types and
`tutorial` is not one of them; there is no `item('tutorial', …)` call anywhere in
that file. The surface's only triggers are `tutorial-stale` and
`tutorial-demoted`, which produce `verify` jobs about tutorials that already
exist. Nothing anywhere can decide that a tutorial ought to be written.

The decision is that the surface gets a map, for reasons recorded beside this
delta: two normative sentences in the requirement below this one already
arbitrate a competition between new tutorials and upkeep that nothing can enter;
the declared-coverage derivation is a set difference between two committed files,
which is the only trigger shape here that is falsifiable by reading two directory
listings; and the two hazards a tutorial producer carries — starving upkeep, and
enumerating a walkthrough nobody can execute — are both answerable by a
mechanism rather than by a person.

Serves `addictedtoai-kat1`.

## ADDED Requirements

### Requirement: The tutorial surface has a curriculum of record

The tutorial surface SHALL be grown against a written map of what the site
intends to teach by doing. The curriculum of record is
`openspec/curriculum/tutorials.md` — a path outside `openspec/specs/`, which is
reserved and would make the map uneditable, and outside any change directory,
which moves on archiving and would leave a permanent obligation pointing into an
archive.

- The map SHALL enumerate every tutorial the site intends to publish, in a
  catalog section, one entry per intended tutorial. Each entry SHALL declare its
  slug, its title, the wiki entry ids of the subjects the walkthrough depends
  on, the outcome a reader gets from completing it, what the walkthrough must
  cover, what it must not drift into, and the `reverify_days` the published
  tutorial will carry.
- **Admission test.** An entry SHALL NOT be enumerated unless its steps can be
  executed in this environment without a paid account or special hardware, or
  the entry names in advance exactly which steps will go unexecuted and why.
  Verification on this surface means the steps were actually run, so an entry
  that fails this test enumerates work that can only ever end blocked.
- A tutorial SHALL NOT publish unless the map enumerates it. A tutorial worth
  writing that the map lacks SHALL be added to the map — with its subjects,
  outcome, bounds and interval — in the same change that adds the tutorial.
- That prohibition SHALL be enforced by the build. A published tutorial whose
  slug appears in no entry of the map's catalog section SHALL fail the build,
  naming the tutorial's file, the slug, and the path of the map, before any page
  renders. The check SHALL read the catalog section and no other part of the
  document, so that prose elsewhere cannot be mistaken for a declaration. Where
  the map cannot be read at all, or carries no catalog section, the build SHALL
  fail with **one** error naming that file rather than one error per tutorial:
  a reader who has lost the map needs telling once.
- A tutorial that departs from its entry's clauses SHALL amend that entry in the
  same diff, on the terms `education-static` states for a learn page, and review
  SHALL reject as `spec-violation` — naming the clause and the tutorial — a
  departure the same diff leaves unrecorded in the map. A walkthrough is a
  claim about what the site teaches by doing, and a claim the map contradicts is
  the same defect on either surface.

#### Scenario: A tutorial outside the map amends the map first

- **WHEN** a job proposes a tutorial that appears in no entry of the map
- **THEN** review requires the map amended — subjects, outcome, bounds,
  interval — before the tutorial can merge, and rejects it as `spec-violation`
  otherwise

#### Scenario: An undeclared tutorial stops the build

- **WHEN** a tutorial is published whose slug appears in no entry of the map's
  catalog section
- **THEN** the build fails naming the tutorial's file, the slug and the map's
  path, and no page renders

#### Scenario: A lost map is one error, not four

- **WHEN** the map is missing or its catalog section cannot be found
- **THEN** the build fails with a single error naming the map's path, and does
  not report every published tutorial as undeclared

#### Scenario: A walkthrough nobody can run is not enumerated

- **WHEN** a proposed entry's steps require a paid account and the entry does not
  say which steps will go unexecuted and why
- **THEN** the entry is not added to the map, and the reason recorded is the
  admission test rather than the topic's merit

#### Scenario: A tutorial that departs from its entry amends it

- **WHEN** a job re-verifying a declared tutorial finds that a "must cover" step
  no longer exists in the tool and writes the walkthrough without it
- **THEN** its diff also amends that clause in the map, dated and with its
  reasoning, and review judges the amendment on its merits
