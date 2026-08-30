# editorial — delta for build-initial-site

## Purpose

The quality bar. Content carries no per-item change artifact, so this spec is
the only place the standard for "is this worth publishing" lives. The
previous site's review contract had no word for *boring* and produced a site
that was accurate and unread. This one does.

## ADDED Requirements

### Requirement: Every published prose piece must earn its reader

Before any prose piece (wiki entry body, education page, tutorial, blog
post) publishes, it MUST satisfy all three:

1. **It gives an enthusiast something.** At least one of: a thing they
   likely did not know; scattered things assembled in one place for the
   first time; a live, derived view no one else shows. A piece that a
   daily AI-follower would skim and learn nothing from has not earned
   publication.
2. **It is specific.** Dates, numbers, names, sources, mechanisms — never
   "many believe", "rapidly evolving", "in recent years". Every paragraph
   survives the question "what exactly is this telling me?"
3. **It would be worth linking.** The would-cite test: a reasonable person
   arguing about this topic online could paste this URL as support. Pages
   that answer a question completely pass; pages that gesture at a topic
   fail.

*Dull, derivative, padded, obvious,* and *self-referential* are real defect
names, usable as-is in review. Rejecting a piece as boring requires no
disguise as a factual objection.

#### Scenario: Accurate but empty

- **WHEN** a draft post correctly summarizes an announcement every newsletter
  already covered, adding no assembly, no data, and no angle
- **THEN** it is rejected as `not-worth-reading` — accuracy alone does not
  publish

#### Scenario: The would-cite test in review

- **WHEN** a reviewer cannot articulate who would link the piece and in what
  argument
- **THEN** that is sufficient grounds for a `not-worth-reading` rejection,
  recorded in those words

### Requirement: Breadth lives in the data layer; the bar applies to prose

"Everything about AI" and "only publish what is worth reading" coexist by
construction, not by compromise:

- **Breadth is delivered by the structured layer.** Records, facts,
  timelines, catalog rows, and stubs MAY exist for anything real, cost no
  reader anything, and SHALL be exempt from the prose bar — a stub publishes
  data, not claims on a reader's time (its indexing is governed by `wiki`).
- **The bar applies to every page that asks to be read.** Prose SHALL be
  published only when it clears the Requirement above.

Neither rule bends toward the other: the corpus may be vast while the read
surface stays sharp. "Everything, badly" — broad thin prose to simulate
coverage — is the named failure this split exists to prevent.

#### Scenario: Coverage without slop

- **WHEN** the corpus holds a stub for an obscure library nobody has written
  about
- **THEN** the stub renders its data and no prose is generated for it merely
  to look covered

### Requirement: The cut list is enforced, not aspirational

The following SHALL be cut wherever found, by authors before review and by
reviewers on sight:

- filler openers and closers ("In the rapidly evolving world of AI…", "In
  conclusion…", "It remains to be seen…");
- hedging boilerplate that conveys no probability ("it could be argued");
- restating in prose what an adjacent table or transclusion already shows;
- listicle padding — enumeration without judgment;
- self-reference outside the colophon (the site discussing its own process,
  machinery, or history);
- unsupported superlatives ("game-changing", "revolutionary") — a
  superlative requires a measurement or a source;
- any sentence written to fill space rather than to inform.

#### Scenario: Filler is a defect, not a style choice

- **WHEN** a draft opens with a paragraph that could open any AI article
- **THEN** review names it under the cut list and the piece does not publish
  until it is gone

### Requirement: The subject carries the awe; the voice stays plain

The site's wonder comes from what the field actually contains — capability
shifts, dated deltas, things that were research results becoming commodity
calls — demonstrated with receipts, never asserted with adjectives. There
SHALL be no "does this make AI look good" consideration anywhere: a story
about a failed promise or a safety incident is exactly as in-mission as a
capability story. Enthusiasm without evidence and cynicism without evidence
are the same defect.

#### Scenario: Awe as a finding

- **WHEN** a piece wants to convey that progress is fast
- **THEN** it shows dated evidence (what was impossible on date A, routine
  on date B, with sources) rather than intensifiers
