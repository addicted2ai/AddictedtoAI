# review — delta for say-what-a-review-record-covers

Two requirements modified, and neither is loosened. The verdict list, the
`would-cite` rule, the `reads-human` rule and its two refusals, the reviewed
surface, the mechanical-key exclusion, the `subject:`/`reviewed:` equality check
and the `subject:` value shape are all unchanged, byte for byte.

What is added is the answer to one question asked of both requirements: **what
does a review record actually cover, as against what it is read as covering.**
Two holes, measured in this tree on 2026-09-06, and they are the same hole in
two places.

**A field inside a record that is not bound to bytes.** `reviewed:` binds a
record to the text it judged, so a piece whose bytes moved after review reads as
mismatched and mismatched fails the launch check. That closes the case where
nobody re-reviewed. It does not close the case where somebody did: a repair job
rewrites a post's prose, its own reviewer approves the diff, the merge writes a
fresh `reviewed:` hash, and the piece is bound and clean — while the only
reviewer that ever answered "does this read like a human wrote it" read the
older version. Observed on `content/blog/glm-5-3-license-revenue-gate.md`, which
took repair jobs `j-20260902-22` and `-23` after its post review.

**A class of piece the binding never covers at all.** The join's reviewable set
filters entries on `hasBody`, so every body-less entry is outside it. A
body-less entry still carries sourced facts, in front matter, which is inside
the reviewed surface — and a fact-only edit to one produces no signal in any of
the four states, because the piece is not in the set the states are computed
over.

The fix is one idea applied twice: the binding covers the piece, and the record
says which reviewer answered for which bytes.

## MODIFIED Requirements

### Requirement: The reviewer judges quality with full standing, from a named reason list

The reviewer SHALL return exactly one verdict — `approve`, `revise` (with
the required changes named), or `reject` — with one or more reasons from
this closed list:

- `false-or-unsupported-claim` — a claim the cited source does not support,
  or no source where one is required;
- `intent-not-measurement` — a claim written from what something was meant
  to do rather than a measurement of what it does;
- `not-worth-reading` — dull, derivative, padded, or otherwise not worth a
  reader's time (see `editorial`). **This is a complete rejection reason in
  its own right and never needs to be dressed up as a factual defect.**
- `reads-as-generated` — the prose reads machine-made: uniform rhythm and
  paragraph shape, structure signposted rather than felt, meta-commentary
  narrating its own method, no willingness to be blunt (see `blog` and the
  voice document it names). A complete reason in its own right, and the
  voice bar's one gate — the voice lint only advises, so this verdict is
  where machine-made prose actually stops;
- `overclaiming-summary` — title/excerpt claims more than the body proves;
- `spec-violation` — violates a named requirement in these specs;
- `broken-reference` — a transclusion, mention, or link that does not hold;
- `scope-violation` — the diff exceeds the job's stated outcome or touches
  paths it should not.

Verdicts are categorical, never numeric — scores drift and become targets.

**The quality question is asked, not merely available.** For every verdict
on a prose piece, the review record SHALL contain a required, non-empty
`would-cite` field: the reviewer's own-words answer to "who would link
this, and in what argument?" An `approve` whose `would-cite` field is
empty, or exactly identical (after whitespace trimming) to the
`would-cite` field of any existing review record, is not a valid verdict
and the merge SHALL refuse it. Both checks are exact and mechanical; a
reviewer writing a fresh-but-vacuous sentence each time passes them, which
is accepted — no mechanical check can compel judgment, and the field's job
is to make the question asked. Making the quality objection sayable fixed the
old failure; this field makes it asked — a reviewer that approves
everything without ever confronting the would-cite test produces the same
unread site as one that could not object at all.

**For a blog post, the voice question is asked the same way.** A verdict
on a `post` SHALL additionally contain a required, non-empty `reads-human`
field: the reviewer's own-words answer to "where does this read
machine-made, or why does it not?" The merge SHALL refuse a post verdict
whose `reads-human` field is empty or exactly duplicates an existing
record's, on the same terms and at the same point it refuses a blank
`would-cite`. Same mechanics, same honesty about their limit: the field
compels the asking, not the judgment.

**A later verdict that lands on a post SHALL settle the voice question rather
than inherit it.** A `reads-human` answers for the bytes its writer read. A
repair, a revision or any later job may rewrite those bytes and be approved by a
reviewer of its own, and the piece is then bound and clean while the only
reviewer that ever answered the voice question read an older version. **The job
type does not say whether that happened.** The type says what the job was for;
the merged subjects say what it touched, and a job of any type may touch a post.
So every **approving** verdict on a job whose merged subjects include a blog
post SHALL do one of two things, for each such post, and a verdict doing
neither is refused exactly as a blank `reads-human` is refused:

- **answer the question afresh**, in a non-empty, non-duplicated
  `reads-human`, as above; or
- **carry the prior answer forward**, in a `reads-human-from` field naming the
  earlier approving record it stands on together with the reviewer's own-words
  statement of why this diff did not move the post's voice.

The two branches are not equally available to every job, and that is the point.
A `post` job is already held to the **fresh** answer by the paragraph above; the
choice is what this requirement adds for every **other** job whose diff reaches
a post, which is where the gap is — a repair reviewer is asked no voice question
today and has no field to decline one in.

The merge SHALL refuse a `reads-human-from` whose named record does not exist,
does not approve this same piece, or carries no non-empty `reads-human` of its
own, and SHALL refuse one whose statement is empty or exactly duplicates the
statement in any other record — on the same terms and at the same point it
refuses a blank `would-cite`. Any path that reports on a post's voice SHALL
follow the carry-forward to the record that answered, and SHALL report a post
whose carry-forward reaches no such record exactly as it reports one whose own
record has none.

A post whose current approving record carries neither field is not invalid where
that record predates this requirement — every record written before the merge
began asking the question is one, exactly as every record written before the
merge began writing `reviewed:` carries no `reviewed:` key. It is a distinct,
named state, and it is satisfied by any earlier approving record naming that
piece which carries a non-empty `reads-human`. A record written **after** this
requirement SHALL NOT enter that state: the merge refuses it at the point above,
so the reach-back reaches only records that could not have carried a
carry-forward. Reporting such a post as unanswered would redden a check over
records nobody may now write, which is a guardrail firing on its own history.

The two branches are not interchangeable, and neither collapses into the other.
Asking a repair reviewer to produce a voice verdict on a three-sentence licence
correction asks it of a diff with no voice in it, and the sentence it would
write is the forced-judgment field the duplicate rule already exists to catch.
Letting it write nothing is how an answer comes to speak for bytes that are
gone. Naming the record it stands on is answerable from what a repair reviewer
actually sees.

Stated with the same honesty this requirement states about `would-cite`: the
carry-forward compels the **form** — a reviewer named the record it stands on
and said why the prose did not move — and never the correctness of that
judgment. A reviewer that carries a verdict forward across a rewrite has
committed a `spec-violation` against this requirement, catchable by the next
reviewer of that piece and by nothing mechanical.

#### Scenario: An approve must answer the quality question

- **WHEN** a reviewer returns `approve` on a blog post with the
  `would-cite` field blank
- **THEN** the verdict is invalid, the merge refuses, and the reviewer must
  re-issue the verdict with the field answered

#### Scenario: Boring is a verdict

- **WHEN** a factually clean draft is judged not worth a reader's time
- **THEN** the reviewer rejects with `not-worth-reading` and the recorded
  reason says so plainly, with no manufactured factual objection

#### Scenario: A post verdict answers the voice question

- **WHEN** a reviewer returns `approve` on a post with the `reads-human`
  field blank
- **THEN** the merge refuses the verdict exactly as it would a blank
  `would-cite`, and the reviewer must re-issue it with the field answered

#### Scenario: A repair carries the voice verdict forward instead of inventing one

- **WHEN** a repair job corrects three licence sentences in an already-approved
  post and its reviewer approves the diff
- **THEN** the verdict carries `reads-human-from` naming the post's earlier
  approving record and saying why the correction did not move the post's voice,
  the merge accepts it, and no reviewer is made to write a voice verdict about a
  diff

#### Scenario: A carry-forward that stands on nothing is refused

- **WHEN** an approving post verdict carries a `reads-human-from` naming a
  record that does not approve that piece, or that carries no `reads-human` of
  its own
- **THEN** the merge refuses the verdict, naming the record it could not stand
  on, exactly as it refuses a blank `would-cite`

#### Scenario: A repair that lands on a post and answers neither way is refused

- **WHEN** a job whose type is not `post` merges an edit to a `content/blog/`
  post and its reviewer approves with neither a `reads-human` nor a
  `reads-human-from`
- **THEN** the merge refuses the verdict, because the obligation follows the
  merged subjects and not the job type, and the reviewer re-issues it naming the
  record it stands on

#### Scenario: A post approved before the carry-forward existed is a named state

- **WHEN** a post's current approving record was written before this requirement
  and carries neither field, and an earlier approving record naming that post
  carries a non-empty `reads-human`
- **THEN** the voice question counts as answered by that earlier record, no
  check fails on the post, and a record written after this requirement in the
  same shape is refused at merge instead of joining that state

### Requirement: A review record names the bytes it reviewed

A record that named only a *piece*, and never the *text* it judged, would leave
an approval surviving the thing it approved. The join in `lib/reviews.mjs`
matches a record to a piece by the canonical URL-derived filename, three
accepted alternates, or a front-matter subject key, and the merge gate then
checks that the record carries a verdict from the closed list and a non-empty,
non-duplicated `would-cite`. Every one of those checks would pass unchanged
after the reviewed text had been edited. Binding the record to the bytes is
what closes that gap.

Binding is done by the one step that already knows what landed — the loop's
merge step, which writes `subject:` for exactly this reason:

- On merging a job, the loop SHALL write into that job's verdict record a
  `reviewed:` mapping from each merged content path to the SHA-256 of that
  file's **reviewed surface**, derived from the same measurement of the branch
  that produces `subject:` — one measurement, two fields, so the two can never
  describe different diffs.
- A piece's **reviewed surface** SHALL be its prose body together with its front
  matter with every mechanically-maintained key removed, and the list of
  mechanically-maintained keys SHALL live in exactly one declared place in
  `lib/`. The exclusion is not a convenience: `pulse` appends dated lifecycle
  events to an entry's `timeline` mechanically, under the review exemption, so a
  hash over whole file bytes would mark every entry mismatched the first time
  the world changed a status — a guardrail that fires on its own machinery is
  noise, and noise is how a guardrail gets switched off.
- The set of paths in `reviewed:` SHALL equal the set of joinable content paths
  written to `subject:`, and the merge SHALL refuse a record where they differ,
  in the same place and on the same terms it refuses an `approve` with an empty
  `would-cite`.
- The value shape of `subject:` SHALL NOT change. It is read by nine accepted
  key names in `lib/reviews.mjs` and by hand-written records; carrying the hash
  inside it would break the join for every record that already exists, which is
  the opposite of the outcome this requirement is for.

- The set of pieces this binding covers SHALL be every wiki entry, **whether or
  not it has a prose body**, alongside the pieces the set already carries. A
  body-less entry's reviewed surface is its front matter, which is where its
  sourced facts live, so a fact-only edit to one moves that surface exactly as a
  prose edit moves a page's. Excluding it leaves that class of edit with no
  review-completeness signal at any layer: not missing, not unbound, not
  mismatched, absent from the count entirely. **Tool listings stay outside the
  set**, unchanged and deliberately: they are data rows rather than entry facts,
  the set has excluded them since it was written, and admitting every file the
  merge can hash — which is every `content/**.md` — would extend the binding
  past the class this requirement is about.
- Extending the binding SHALL NOT extend the requirement to **have** a record.
  Which pieces the launch check refuses to launch without a record is unchanged
  and is decided by its own prose bar; a body-less piece reporting **missing**
  SHALL fail nothing, on the same terms and for the same reason **unbound**
  fails nothing.

A record with no `reviewed:` key is not invalid — every record written before
the merge began writing that key is one. It is a distinct, reported state,
defined in the next requirement.

#### Scenario: The merge binds the record to what it merged

- **WHEN** a job merges `content/wiki/org/moonshot-ai.md` with an approving
  verdict
- **THEN** the verdict record carries both `subject:` naming that path and
  `reviewed:` giving that path's reviewed-surface hash, written from the same
  branch measurement

#### Scenario: A mechanical timeline append is not an edit to reviewed text

- **WHEN** the Pulse appends a dated status event to an approved entry's
  `timeline` and nothing else in the file changes
- **THEN** the entry's reviewed-surface hash is unchanged and the record still
  reads as bound

#### Scenario: A record that names one thing and hashes another does not merge

- **WHEN** a verdict record's `reviewed:` paths differ from the joinable paths
  the merge measured for `subject:`
- **THEN** the merge refuses the record and names both sets

#### Scenario: A fact-only edit to a body-less entry is a named finding

- **WHEN** a body-less wiki entry whose record binds its reviewed surface has a
  sourced fact's value changed, and the launch check runs
- **THEN** the check fails, naming that entry as mismatched against its record,
  exactly as it does for an edited prose body

#### Scenario: Body-less entries with no record fail nothing

- **WHEN** the join runs over a corpus whose body-less entries have no review
  records at all
- **THEN** they are counted and reported as missing, no check fails on them, and
  the set of pieces the launch check requires a record for is unchanged
