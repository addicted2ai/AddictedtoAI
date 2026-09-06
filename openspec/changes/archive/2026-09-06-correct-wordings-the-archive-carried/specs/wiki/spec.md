# wiki — delta for correct-wordings-the-archive-carried

Wording only. This delta changes no requirement, no gate, no field and no
behaviour: the MODIFIED block below is the live requirement copied whole, with
one sentence corrected. It exists because the sentence sat INSIDE a requirement
block when `tag-the-corpus-by-domain` was archived on 2026-09-06, so the archive merged it into
this constitution, and a live spec is only editable through a change.

The finding, the re-measurement and why each correction is wording rather than
substance are in this change's `proposal.md`.

**The correction:** the volume sentence gains one clause — "3 of them rows
that left the snapshot altogether". Re-measured over the same two snapshots
(`previous.json` 2026-09-04, 427 rows; `latest.json` 2026-09-05, 431 rows), 3
of the 71 number→absent transitions are rows that left the snapshot entirely
rather than surviving rows that dropped the field: `qwen/qwen3.8-max` (both
indices) and `ibm-granite/granite-4.1-8b` (`coding_index`). A vanished row is
handled by the separate last-known-value rule in this capability, not by a
seeding-signal disappearance, so counting it as one is field churn described
over row churn. The 71 and the 182 are both reproduced exactly and neither
changes; the conclusion the requirement draws is untouched.

## MODIFIED Requirements

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

**A `domains_excluded` value that appears in neither `domains_seeded` nor
`domains` SHALL fail the build**, naming the entry file, the field and the
value. An exclusion that removes nothing is a **stale edit**: a value that was
seeded or asserted once, then stopped being either, leaving behind a
suppression nobody can see doing anything. It reads as deliberate and does
nothing, which is the shape this repository keeps catching, and this gate is
what keeps `domains_excluded` meaning what it says.

Stated over the union although one branch of it is already covered: a value in
both `domains` and `domains_excluded` fails as the contradiction above, so a
legal exclusion in practice names a value in `domains_seeded`. The union is the
form written down because it is the property that has to hold — an exclusion
suppresses something — rather than the leftovers of another rule, and it stays
true if the contradiction clause is ever restated.

**The gate does not couple an editorial key to the feed, and the append-only
rule below is what makes that true.** `domains_seeded` is an accumulated record
in the entry's own front matter, not a view of the current snapshot: a publisher
dropping a signal removes nothing from it, so no exclusion goes stale because a
feed moved, and no entry nobody touched turns from green to red. Both fields
this gate reads live in the file being validated, and the check is therefore a
pure function of that file.

The ordering it imposes is stated rather than discovered: an exclusion follows
the value it suppresses and never precedes it. Writing `domains_excluded`
against a seed that has not landed yet fails the build, and the remedy is to
write it after the seeding run — not to loosen the gate.

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

**A disappearing signal writes no change line either.** The Pulse SHALL NOT
append a line to `data/changes.jsonl` on account of a feed field that once
seeded a domain ceasing to appear on a row. This governs seeding and nothing
else: a field the source registry independently declares material keeps
whatever change lines that declaration already produces, and what is forbidden
is a second emitter that fires on seeding signals.

The reason is that the source registry has already decided this exact block is
not an event, and a second emitter would overturn that decision without ever
reading it. `data/sources/registry.json` records, dated `2026-09-05`, that
`benchmarks.artificial_analysis` is *"not carried"* — *"Not a column, not a
fact, not an event"* — on the measurement that across the 2026-09-04 and
2026-09-05 fetches *"181 values went number->null with 0 going null->number"*
and that *"56 of the carrying row ids are `:batch`/`:free` twins of a
canonical_slug already counted"*. A disappearance line would re-admit one
publisher act to the changed feed through a second path that never reads that
decision, and `pulse/lib/diff.mjs:377-378` states the principle it would break:
a field *"is an event in one place or in neither"*. The volume is that one
publisher act counted directly: across those two snapshots there were 71
number→absent transitions on the two index fields whose presence is the proposed
seeding signal for `coding` and `agents`, 3 of them rows that left the snapshot
altogether — one line each — against the 182 lines
`data/changes.jsonl` held on 2026-09-05. Nothing is lost by the silence,
because seeding is append-only and the value stays on the entry.

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
  nothing, no line is appended to `data/changes.jsonl` for the disappearance,
  and any removal is made editorially through `domains_excluded`

#### Scenario: An editorial exclusion suppresses a seeded value

- **WHEN** an entry has `image` in `domains_seeded` and `image` in
  `domains_excluded`
- **THEN** the effective set omits `image`, the entry does not appear under
  that domain on any surface, and `domains_seeded` is left as the machine wrote
  it

#### Scenario: An exclusion that suppresses nothing stops the build

- **WHEN** an entry declares `domains_excluded: [video]` and `video` appears in
  neither its `domains_seeded` nor its `domains`
- **THEN** the build fails naming the entry file, the field and the value,
  because an exclusion that removes nothing is a stale edit — it reads as a
  decision and enacts none

#### Scenario: Asserting and excluding the same domain fails the build

- **WHEN** an entry declares `audio` in both `domains` and `domains_excluded`
- **THEN** the build fails naming the entry and the value, rather than
  applying a precedence rule that would hide the mistake

#### Scenario: A post cannot carry the machine key

- **WHEN** a blog post declares `domains_seeded`
- **THEN** the build fails on the unknown key, because the post schema does not
  accept it — a post's `domains` is editorial and must stay inside the reviewed
  surface
