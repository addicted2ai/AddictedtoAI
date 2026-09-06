# wiki — delta for tag-the-corpus-by-domain

Two requirements added. Nothing here changes what an entry is, how it is
identified, how its facts are sourced, or how it is reviewed. `kind` is
untouched and still a closed partition; `domain` is a second, orthogonal axis
that sits beside it.

The vocabulary and the two-field split are transcribed from
`loops/ui-loop/graph/knowledge/DESK-ORDER-001.md` §3 (keeper-signed 2026-09-05)
and its K44 amendment, with the three open questions answered as §3 records
them. They are not re-decided here. The research behind the vocabulary is
`loops/ui-loop/graph/knowledge/EN-domain-facet.md`; the round-by-round reason
for each clause is `loops/ui-loop/graph/knowledge/SPEC-REVIEW-GUIDE.md`, the
rubric this draft was written against.

## ADDED Requirements

### Requirement: A domain says what a thing is for, and it cuts across kinds

`kind` says what a thing **is** — `model`, `org`, `tool`, `technique`,
`benchmark`. It is a partition: exactly one value, closed, permanent, never
reused. That is the right shape for identity and the wrong shape for the
question a reader actually arrives with. "What is happening in video
generation" has no answer inside any partition by kind, because the answer is a
model, an org, a tool and a technique at once.

`domain` is that second axis. An entry MAY declare the domains it belongs to.
The facet SHALL be:

- **set-valued** — a thing may be in several domains at once, and a
  multimodal model routinely is. There is deliberately no `multimodal` value:
  that is the union of several domains, not a member of the list.
- **optional, with the empty set legal and common** — "general" is the
  **unmarked default**. There is no `general` value to declare and no `text`
  value. An entry carrying no domain is not untagged-and-pending; it is
  general, and that is a complete answer.
- **orthogonal to `kind`** — it neither replaces `kind` nor is derivable from
  it. Every kind may bear it.

The vocabulary is these eight values and no others:

`coding`, `agents`, `image`, `video`, `audio`, `research`, `science-math`,
`robotics`.

**`text` is not a value, and the reason is a measurement.** Read from
`data/sources/openrouter-models/latest.json` on 2026-09-05 (`fetched_at`
`2026-09-05T06:00:04.599Z`, `row_count` 431): every one of the 431 rows takes
text in, out, or both. A facet value carried by every member of the set it is
meant to divide discriminates nothing, and a filter that selects everything is
a filter a reader learns to distrust. Absence carries the same meaning at no
cost.

**The vocabulary SHALL have exactly one definition in the source tree.** That
definition is `lib/domains.mjs`, created by the change
`flag-what-moved-the-frontier` for the post-level frontier gate, and read
unchanged by every other surface that reads a domain — this facet included.
This specification names the eight values so that the requirement is readable
and a reviewer can check it; that is not a second definition, and a build in
which this text and `lib/domains.mjs` disagree has a defect in one of them.
Two closed lists of the same eight strings drift, and the moment they do, the
post gate and the entry gate are two different checks wearing one name — which
is the reads-as-present-and-does-nothing shape this repository keeps catching.

**A value outside the vocabulary SHALL fail the build**, naming the file, the
field, the offending value and the values that are allowed. This is the
treatment an unknown `kind` and an unknown tool `category` already receive, for
the same reason: an open field drifts into `coding` / `code` / `Coding` and the
grouping stops being a partition. It is also what keeps the ordering guarantee
in `directory` honest — an order that is a pure function of the domain ids is
only a guarantee if the set of ids is closed.

The facet is **declared data, never inferred from prose.** No heuristic over an
entry's title, body, aliases or URL may assign a domain. A domain that arrives
mechanically arrives from a named feed field under the seeding requirement
below, and from nowhere else.

#### Scenario: A domain outside the vocabulary stops the build

- **WHEN** an entry declares a domain value of `legal`
- **THEN** the build fails naming the entry file, the field, the value `legal`
  and the eight allowed values, and no page is published

#### Scenario: `text` is not a domain

- **WHEN** an entry declares a domain value of `text`
- **THEN** the build fails exactly as it does for any other value outside the
  vocabulary — general is the unmarked default, and it is expressed by carrying
  no domain rather than by carrying a value every entry would qualify for

#### Scenario: An untagged entry is general, not incomplete

- **WHEN** an entry declares no domain at all
- **THEN** it validates, it publishes, and no marker, warning or work-queue
  item treats the absence as a defect to be repaired

#### Scenario: One thing is in several domains

- **WHEN** a model takes text, image and video input and its entry declares
  `image` and `video`
- **THEN** both values validate, and the entry appears under both domains on
  any surface that groups by domain

#### Scenario: A domain does not displace a kind

- **WHEN** a `technique` entry for computer use declares the domain `agents`
- **THEN** its `kind` remains `technique`, its id is unchanged, and nothing
  about the domain makes `agents` a kind — the two axes are read independently

### Requirement: A seeded domain and an editorial domain are separate fields

Some domain values are re-derivable from the feed on every Pulse run, and some
are judgments. **They SHALL be carried in separate front-matter fields, and
never in one field with two regimes.** The reason is mechanical, and it lands
as a red build rather than as an opinion.

A piece's **reviewed surface** is its prose body together with its front matter
minus the keys in `MECHANICAL_FRONT_MATTER_KEYS`, and that list is matched by
key **name** across every content kind, with no per-kind scoping. So a single
`domains` field carrying both regimes has exactly two possible fates and both
are defects: on the mechanical list, an editorial judgment publishes unreviewed
and a **post's** editorially-assigned `domains` is silently exempted from
review along with it; off the mechanical list, every mechanical re-seed marks
the entry's review record `mismatched` and demands a fresh verdict on prose
nobody touched. Measured 2026-09-05, this repository holds 544 wiki entry files
under `content/wiki/` (plus `content/wiki/README.md`, which is the directory's
own README and carries no entry front matter), so the second fate is not a
corner case.

Three fields, and only the first is machine-written:

- **`domains_seeded`** — machine-maintained. Written and extended only by the
  Pulse's data-layer update step, from named feed fields, with no model
  invocation. It SHALL be listed in `MECHANICAL_FRONT_MATTER_KEYS` beside
  `timeline`, so a re-seed is not an edit to what was reviewed. It publishes
  under the review exemption for deterministic outputs of already-reviewed
  machinery, exactly as a mechanical timeline append does.
- **`domains`** — editorial. A human or a reviewed job asserts that the thing
  belongs to a domain. `research`, `science-math` and `robotics` can only ever
  be this: no feed field carries them.
- **`domains_excluded`** — editorial. Suppresses a seeded value the editor
  judges wrong.

`domains` and `domains_excluded` SHALL NOT be listed in
`MECHANICAL_FRONT_MATTER_KEYS`. Adding or changing either on an entry that
carries a bound review record is an edit to the reviewed surface, that record
reports `mismatched`, and it is corrected by a fresh verdict rather than by an
exemption. Tagging an entry editorially is a review event and the cost is the
correct one — what a thing is for is a judgment, and a judgment that publishes
unreviewed is what `review` exists to stop.

No schema that accepts an editorially-assigned domain SHALL also accept
`domains_seeded`. Because the mechanical filter matches by name across kinds,
a content kind that could carry the seeded key would have that key exempted
from review whether or not a machine wrote it.

**The effective set** a surface renders is
`(domains_seeded ∪ domains) − domains_excluded`. A value appearing in both
`domains` and `domains_excluded` SHALL fail the build naming the entry and the
value: that is a contradiction, not a precedence question, and resolving it
silently in either direction would hide an editing mistake.

**A `domains_excluded` value that is not currently seeded SHALL be legal and
inert** — not a build error and not a warning. The opposite rule would couple
an editorial key to the feed's current contents, so a publisher dropping a
signal would turn a green build red on an entry nobody touched, which is the
coupling this whole requirement exists to prevent.

**Seeding SHALL be append-only.** A signal appearing in the snapshot adds a
value to `domains_seeded`; a signal disappearing SHALL NOT remove one. This is
the treatment `timeline` already receives, and it is required by measurement
rather than by symmetry. Between the two committed OpenRouter snapshots —
`data/sources/openrouter-models/previous.json` (`fetched_at`
`2026-09-04T06:00:03.738Z`, `row_count` 427) and `latest.json` (`fetched_at`
`2026-09-05T06:00:04.599Z`, `row_count` 431) — the count of rows carrying a
numeric `benchmarks.artificial_analysis.agentic_index` fell from 166 to 99
across the publisher's own index rebase. Under a recomputing rule, one
publisher's rescoring would have silently deleted an `agents` tag from 67
entries overnight, with no editorial decision anywhere and nothing on any page
saying so. Removal of a seeded value is therefore an editorial act, spelled
`domains_excluded`, and it goes through review like any other judgment.

The consequence is stated rather than discovered: `domains_seeded` accumulates,
so it is a record of every signal ever observed and not a snapshot of the
current feed. A re-seed from an empty corpus would produce a smaller set than
the accumulated file. That is true of `timeline` for the same reason and is
accepted on the same terms.

Seeding SHALL derive values only from named feed fields, and SHALL derive them
from a field's **presence or contents**, never by republishing an index value
to a page. Reading that a row carries an index is not rendering what the index
says, so seeding is unaffected by the rights question that governs index
values; no index value renders anywhere in consequence of this requirement.

#### Scenario: A re-seed is not an edit

- **WHEN** the Pulse adds a value to an entry's `domains_seeded` and the entry
  carries an approved review record
- **THEN** the record still reports the entry as matching, because
  `domains_seeded` is outside the reviewed surface, and no re-review is
  demanded of prose nobody touched

#### Scenario: An editorial tag goes back through review

- **WHEN** `research` is added to the `domains` of an entry that already
  carries an approved review record
- **THEN** that record reports `mismatched` and the entry is not cleared until
  a new verdict is recorded against the changed bytes

#### Scenario: A publisher's rescoring does not untag the corpus

- **WHEN** a snapshot arrives in which a row no longer carries the feed field
  that seeded one of its domains
- **THEN** the entry keeps that value in `domains_seeded`, the Pulse removes
  nothing, and any removal is made editorially through `domains_excluded`

#### Scenario: An editorial exclusion suppresses a seeded value

- **WHEN** an entry has `image` in `domains_seeded` and `image` in
  `domains_excluded`
- **THEN** the effective set omits `image`, the entry does not appear under
  that domain on any surface, and `domains_seeded` is left as the machine wrote
  it

#### Scenario: An exclusion that suppresses nothing is inert

- **WHEN** an entry declares `domains_excluded: [video]` and no run has ever
  seeded `video` on it
- **THEN** the build passes with no error and no warning, and the key stays in
  place against a future seed

#### Scenario: Asserting and excluding the same domain fails the build

- **WHEN** an entry declares `audio` in both `domains` and `domains_excluded`
- **THEN** the build fails naming the entry and the value, rather than
  applying a precedence rule that would hide the mistake

#### Scenario: A post cannot carry the machine key

- **WHEN** a blog post declares `domains_seeded`
- **THEN** the build fails on the unknown key, because the post schema does not
  accept it — a post's `domains` is editorial and must stay inside the reviewed
  surface
