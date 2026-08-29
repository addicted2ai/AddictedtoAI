# wiki — delta for harden-seed-wave-guardrails

## ADDED Requirements

### Requirement: Author-written front matter is prose for the volatile-literal check

*"Volatile facts travel by transclusion, never by restatement"* is unchanged by
this requirement; what changes is where its build-time warning can see. The
warning scans bodies. Deltas are almost entirely front matter — only 6 of 29
have a prose body over 40 characters — so the check is **vacuous on 23 of
them**, and the same shape holds anywhere front matter carries author sentences.

Two measurements shape this requirement and are recorded so nothing acts on the
wrong one. First: **no delta currently carries an unanchored literal.** Eight
front-matter currency literals exist across four files and every one sits inside
a delta end, which `lib/schema.mjs` requires to carry an ISO `date` — a delta end
is a dated historical claim by construction and a dated observation does not
rot. Nothing is burning; those four files are correct as written. Second: the
exposure is structural. Nothing forces a front-matter field to be scanned, and
nothing forces a *new* front-matter field to be classified at all, which is the
vector by which this recurs.

- Every string-valued field in every content schema SHALL be classified, in one
  declared place in `lib/`, as either **author prose** or **not author prose**,
  and the build SHALL fail when a string-valued field exists that is neither.
  This is the mechanism; the scan below is only its consequence. It is the same
  discipline that makes adding a content field an edit to `lib/schema.mjs` by
  design: `alias:` where `aliases:` was meant parses cleanly and nothing
  downstream notices.
- The build SHALL run the volatile-literal scan over every field classified
  author prose, reporting a hit in the same form and at the same severity as a
  body hit — a warning naming the file, the field, the literal and the rule.
  Severity matches the body scan deliberately: enforcement of the no-hard-coding
  rule is the reviewer's named checklist item, and a build that failed here would
  break every historical rebuild the moment a legitimate quoted price appeared.
- A hit SHALL be exempt when the object that directly contains the field carries
  a sibling key whose value is an ISO date. The exemption is mechanical, not a
  list of blessed fields: a delta end carries `date`, a blog correction carries
  `date`, a tool listing carries `last_verified`, and each of those is displayed
  with its date, so the value is a record of that date rather than a claim about
  now. A field with no dated sibling is an undated claim and is scanned.
- The build SHALL report, per content type, how many documents had at least one
  author-prose field scanned and how many had none. A check that runs on nothing
  reports the same clean result as a check that runs on everything, and that
  indistinguishability is the actual defect being fixed here; the count is what
  makes a future vacuum visible on the screen instead of in an audit.

#### Scenario: An undated front-matter literal is warned about

- **WHEN** a static education page's `outcome` states a price literal and no
  sibling key in that object carries an ISO date
- **THEN** the build warns, naming the file, the field, the literal and the
  rule, and does not fail

#### Scenario: A dated observation stays legal

- **WHEN** a delta's `routine` end states a price in its `metric` and that end
  carries its required ISO `date`
- **THEN** the build produces no warning for it

#### Scenario: A new field cannot arrive unclassified

- **WHEN** a string-valued field is added to a content schema and is listed in
  neither classification
- **THEN** the build fails naming that field

#### Scenario: Vacuity is visible

- **WHEN** the build completes
- **THEN** its summary states, per content type, the number of documents with at
  least one author-prose field scanned and the number with none

### Requirement: A fact may declare the fact it corroborates

An entry can carry a feed-bound fact and a cited fact that measure the same
quantity and disagree, and nothing notices. It happened: an entry carried `284B`
parameters from OpenRouter while the checkpoint's own model card and an
independently cited post both said `304B` — OpenRouter publishes the identical
sentence on the preview row and the release row. Transcribing the feed verbatim
was correct behaviour and stays correct; a verbatim fact cannot be wrong. The
prose built an argument on the count being unchanged, and that argument was
refuted by a change two other sources record.

The comparison is cheap. What is missing is a way to say *these two facts
measure the same thing* — field names differ by necessity, since the repair for
that entry named its cited facts `card_parameters` and `preview_parameters`
precisely so they would not collide with the feed-bound `parameters`.

- A fact MAY declare `corroborates: <field>`, naming another fact on the same
  entry that measures the same quantity. The join is declared, never inferred:
  name normalisation, prefix stripping and fuzzy matching are guessing, and this
  design does not guess — the same reason `feeds` binds on a declared row id.
- The build SHALL fail, naming the entry and the field, when a `corroborates`
  value names a field no fact on that entry declares, or names the declaring
  fact itself.
- `corroborates` SHALL NOT change how either fact renders, which of them is
  authoritative, or whether either is re-checked. Declaring that two sources
  disagree is not adjudicating between them, and a feed-bound fact remains what
  its source says, verbatim.

#### Scenario: A declared pair binds

- **WHEN** an entry carries a feed-bound `parameters` fact and a cited
  `card_parameters` fact declaring `corroborates: parameters`
- **THEN** the build accepts both and renders each exactly as it would without
  the declaration

#### Scenario: A corroboration that names nothing fails the build

- **WHEN** a fact declares `corroborates: parameters` and the entry has no
  `parameters` fact
- **THEN** the build fails naming the entry and the field
