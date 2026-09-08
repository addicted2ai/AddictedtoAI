# review — delta for two-desks-work-orders-and-trains

Nothing about the review gate itself moves: the reviewer is still a separate
invocation with fresh context, its tree is still discarded unconditionally, the
merge still refuses without an `approve`, and the reason list is still closed.

Four changes. The forced-judgment field goes **per subject**, because a work
order can carry several pieces and one sentence answering for all of them is the
1/N attention problem written down. Carried findings must name a subject and are
counted on the ledger, but **no numeric cap is placed on them** — the
distribution was measured and a cap of two would have suppressed 10.8% of the
entries, which by this repository's own standard prevents nothing, so the inflow
argument moves onto the deferral rule instead. A review of
pages that were read and correctly left unchanged is defined, so that an honest
"no edit needed" can succeed — and defined so that the reviewer is handed the
pages rather than an empty diff fence. And the review a train gets is sealed from
the per-job verdicts, so that what the per-job reviews missed is a number rather
than an impression.

## ADDED Requirements

### Requirement: A review of unchanged pages is a review of the pages, never of an empty diff

A work order may end by reporting that the declared pages were read, judged
sound, and correctly left unchanged. That outcome writes a record binding the
current bytes, so it is a real approval and SHALL be produced by a real reading.
Everything below exists because the obvious implementation of it approves pages
nobody was shown.

- The review brief for such an outcome SHALL carry **the reviewed surface of each
  declared page**, and SHALL NOT carry a diff section. Where the diff is empty by
  construction, a section headed as the thing under review containing an empty
  fenced block is worse than no section: an empty fence does not read as "nothing
  here", it reads as "nothing changed, fine" — an affirmative answer to the
  question the reviewer was supposed to ask.
- The gates section of such a brief SHALL state that the gates ran on a tree
  identical to the merge base, and that they are therefore evidence that the base
  is green and **not** evidence about the pages under review. Every word a
  gates section prints on this outcome is otherwise true and every implication
  false.
- The checklist SHALL be the checklist for each declared page's **kind**, not for
  the job's type, because there is no diff whose type is the subject.
- The outcome SHALL be keyed on the job's committed declared subjects and the
  executor's declared paths, and SHALL NOT be keyed on any string match against
  the brief, the task text or a source file's prose. A brief names paths in order
  to forbid them as readily as to assign them, and a directives-style file's prose
  discusses re-reviewing in lines that are not re-reviews.
- The page bytes the brief carries SHALL be **machine-generated from the tree**,
  and the brief SHALL print the hash of each. The loop SHALL record each declared
  page's reviewed-surface hash **on the branch** at the moment the review brief is
  assembled, and SHALL re-measure each at merge. **The hash the record binds SHALL
  equal the hash of the bytes the brief carried**, and the merge SHALL be refused
  and the run settled `failed` naming the path where they differ. Equality, not
  containment: a check that the brief merely *contained* a surface passes on a
  stale surface, on a placeholder, and on the bytes of a different revision of the
  same page — which is the review appearing to show a page while the record binds
  a different byte set, the exact escape this outcome was designed against.
  Binding the new bytes would record an approval of something nobody read; binding
  the old bytes would write a record that is mismatched the moment it lands. Both
  are wrong, so the only correct behaviour is to detect the move and stop.
- Such a record SHALL carry a `would-cite` for each declared page, on the same
  terms as any other approving record, and SHALL be bound by `subject:` and
  `reviewed:` exactly as a merging job's record is.

#### Scenario: The reviewer is shown the page, not an empty fence

- **WHEN** a work order reports one declared page read and correctly unchanged
- **THEN** the review brief contains that page's reviewed surface and contains no
  diff section at all, empty or otherwise

#### Scenario: The bytes reviewed and the bytes bound are the same bytes

- **WHEN** a `reviewed:` outcome merges and its record binds a hash for each
  declared page
- **THEN** each bound hash equals the hash of the page bytes the review brief
  carried, and a brief carrying a stale copy of a page makes the same check red

#### Scenario: The gates section says what it is evidence of

- **WHEN** the gates ran green on a tree identical to the merge base
- **THEN** the brief states that the gates are evidence the base is green and not
  evidence about the pages under review

#### Scenario: A page that moved between reading and binding stops the merge

- **WHEN** a declared page's reviewed surface changes on `main` between the
  assembly of the review brief and the merge
- **THEN** the merge is refused naming that path, the run is settled `failed`, and
  no record is written binding either version

### Requirement: The train review is sealed from the per-job verdicts and reports what they missed

A per-job review sees one diff. A defect that exists only in the interaction
between two merges is invisible to every one of them, and a batch review over
five changes once found three instances of a class that thirteen sealed
per-change reviews had all missed. The review a train gets exists for that class,
and its own value is measurable only if it is sealed.

- Before `main` advances, a train SHALL be reviewed by a separate invocation with
  fresh context and no edit rights, over the train's **whole** diff, on a runner
  entry at or above the rung declared for review (see `loop`). Its worktree is
  discarded unconditionally, exactly as any reviewer's is.
- The content and code the merges changed SHALL be presented **in full**. The
  **recomputed derived data** SHALL be presented as a **summary** — the paths that
  changed and their line counts, with every file openable — because it is a
  deterministic output of already-reviewed machinery and exempt from the reading
  requirement on those terms. It is produced before this review and shown rather
  than counted, so that a derived change nobody expected is visible; requiring it
  to be read in full would make the size of a regenerated table the thing that
  decides how much reviewed work a train may carry.
- **The train review SHALL produce a verdict record on the same protocol every
  other review produces one**: a verdict from the closed reason list, a non-empty
  and non-duplicated `would-cite` per prose piece among the train's subjects, and
  the same refusals. **An absent, empty or malformed train-review record SHALL
  fail closed** — the train does not advance `main` and does not publish. A review
  whose absence is indistinguishable from its approval is not a gate, and it is
  the one shape by which an implementation could turn a missing result into a
  green path.
- **The train reviewer SHALL write its findings before it is shown any per-job
  verdict record**, and its brief SHALL NOT contain one. A reviewer told what
  earlier reviewers concluded is measuring their conclusions, not the diff.
- After its findings are written, the loop SHALL compare them against the per-job
  records the train carries and SHALL record the count of train-review findings
  that appear in **none** of them, on the train's own record. That count is the
  only measurement anyone has of what per-job review misses, and it is the reason
  the sealing is a requirement rather than a habit.
- The train review SHALL NOT replace per-job review: nothing merges without one,
  and the train review is an additional gate rather than a substituted one.
- A non-approving train review SHALL stop that train from advancing `main`. Each
  finding SHALL name the merge or merges it concerns; those merges are evicted and
  the train re-runs its gates **and this review** on the resulting diff, per
  `loop`. A finding naming no merge rejects the whole train. **A subset of a
  reviewed diff is not itself reviewed**, which is why the re-run is required
  rather than optional: the surviving combination is a combination no reviewer has
  seen.
- **Two consecutive non-approvals of a train whose merges have not changed in
  between SHALL reject the whole train**: every merge reverted, every affected
  issue reopened, nothing published. Review is bounded by construction everywhere
  else in these specifications, and an unbounded train review would be a gate that
  stops work shipping, which has already been ruled to fail exactly as review
  skipped.

#### Scenario: The train reviewer does not see the verdicts it is measuring

- **WHEN** a train of four merges is reviewed
- **THEN** the train review brief contains the train's whole diff and none of the
  four verdict records, and the findings are written before any of them is read

#### Scenario: An absent train-review record is not an approval

- **WHEN** a train review invocation returns without writing a verdict record
- **THEN** the train does not advance `main`, nothing is published, and the
  absence is reported as a failed review rather than passing as a green path

#### Scenario: The regenerated tree is shown but not counted

- **WHEN** a train's recomputation changes 40,000 lines of derived data and its
  merges changed 9,000 bytes of content
- **THEN** the train review is assembled with the content in full and the derived
  change as a summary of paths and line counts with the files openable, and the
  train's reviewed-bytes bound is measured on the 9,000 bytes alone

#### Scenario: What the per-job reviews missed is a number

- **WHEN** the train review records three findings and one of them appears in no
  per-job record
- **THEN** the train's record carries the count 1, and that count is recoverable
  from the repository without reading any brief

#### Scenario: A twice-refused train is rejected rather than held forever

- **WHEN** a train review returns a non-approval, no merge on the train changes,
  and the next train review of the same content returns a non-approval too
- **THEN** every merge in the train is reverted, every affected issue is reopened,
  and nothing is published

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

**The quality question is asked, not merely available, and it is asked once per
prose piece.** A **prose piece**, for this requirement, is a merged subject whose
kind's body is prose — a wiki entry, a learn page, a tutorial, a blog post. A
directory row or a data-shaped page is not one. The predicate SHALL be the
schema's own classification of kinds and SHALL NOT be "any file under the content
tree", because the merge refuses on this distinction and a category no two
implementers enumerate the same way is a refusal nobody can reproduce.

For every verdict on a prose piece, the review record SHALL contain the
reviewer's own-words answer to "who would link this, and in what argument?", in a
required, non-empty `would-cite`. Where the merged subjects hold **more than
one** prose piece, the record SHALL carry a `would-cite-for` **list of entries**,
each naming its piece and carrying that piece's own answer, and a piece among the
merged subjects left with no entry and no record-wide `would-cite` is refused
exactly as a blank `would-cite` is refused. A work order carries several pieces
by design, and one sentence standing for all of them is the 1/N attention problem
in the one field that exists to prevent it.

**A verdict SHALL name the requirements it relied on, structurally.** A record
MAY carry a `cites:` list of requirement headings, validated against the live
specification's headings on the same terms the verdict's reasons are validated
against the closed reason list, and a heading that resolves to no requirement
SHALL be refused. The field exists because a downstream step reads it: a revision
brief carries the excerpts for exactly those headings (see `loop`). Left as
prose, "the excerpts the verdict cited" is satisfied equally by re-sending
everything, by sending an unrelated section, and by omitting the one the reviewer
actually leant on, and no check can tell the three apart.

An `approve` whose `would-cite` field is empty, or exactly identical (after
whitespace trimming) to the `would-cite` field or entry of any **other** existing
review record, is not a valid verdict and the merge SHALL refuse it; the same
applies entry by entry to `would-cite-for`. Two entries in the **same** record
may carry the same statement: one job making the same trivial correction to two
pieces has one honest sentence to write about both, and the duplicate rule exists
to catch a sentence recycled across reviews. Both checks are exact and
mechanical; a reviewer writing a fresh-but-vacuous sentence each time passes
them, which is accepted — no mechanical check can compel judgment, and the
field's job is to make the question asked. Making the quality objection sayable
fixed the old failure; this field makes it asked — a reviewer that approves
everything without ever confronting the would-cite test produces the same unread
site as one that could not object at all.

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
post SHALL answer for **each such post**, in one of two ways, and a post among
those subjects that is left unanswered is refused exactly as a blank
`reads-human` is refused:

- **answer the question afresh**, in a non-empty, non-duplicated
  `reads-human`, as above. One such field answers for every post among the
  merged subjects that the record carries no carry-forward entry for — it is
  one reviewer's own-words judgment of the prose that reviewer read, and this
  requirement does not divide it per post; or
- **carry the prior answer forward**, in a `reads-human-from` entry naming the
  post it answers for, the earlier approving record it stands on, and the
  reviewer's own-words statement of why this diff did not move that post's
  voice.

`reads-human-from` SHALL be a **list of entries** — each naming its post, its
record and its statement — and not a single record-wide field. A job's merged
subjects may hold more than one blog post, each post's voice verdict lives in a
record of its own, and a single carry-forward could therefore approve one post
while leaving another bound and unanswered. An entry naming a path that is not
among the merged subjects is refused on the same terms as one whose record does
not hold up. `would-cite-for` SHALL take the same entry shape and be read by the
same code path, so the two forced-judgment fields cannot drift apart.

The two branches are not equally available to every job, and that is the point.
A `post` job is already held to the **fresh** answer by the paragraph above; the
choice is what this requirement adds for every **other** job whose diff reaches
a post.

The merge SHALL refuse a `reads-human-from` entry whose named record does not
exist, does not approve **the post that entry names**, or carries no non-empty
`reads-human` of its own, and SHALL refuse one whose statement is empty or
exactly duplicates the statement in any **other** record — on the same terms and
at the same point it refuses a blank `would-cite`. Two entries in the **same**
record may carry the same statement: one job making the same trivial correction
to two posts has one honest sentence to write about both, and the duplicate rule
is there to catch a sentence recycled across reviews. Any path that reports on a
post's voice SHALL resolve that post's own entry — the one naming it — to the
record that answered, and SHALL report a post whose entry reaches no such record
exactly as it reports one whose own record has none.

A post whose current approving record carries neither a `reads-human` nor a
`reads-human-from` entry naming it is not invalid where that record predates
this requirement — every record written before the merge
began asking the question is one, exactly as every record written before the
merge began writing `reviewed:` carries no `reviewed:` key. It is a distinct,
named state, and it is satisfied by any earlier approving record naming that
piece which carries a non-empty `reads-human`. A record written **after** this
requirement SHALL NOT enter that state: the merge refuses it at the point above,
so the reach-back reaches only records that could not have carried a
carry-forward. Reporting such a post as unanswered would redden a check over
records nobody may now write, which is a guardrail firing on its own history.
A record carrying a record-wide `would-cite` and no `would-cite-for` entries is
in the same position and is treated the same way: where its merged subjects hold
one prose piece it is complete, and where they hold several it predates the
per-piece rule and is reported rather than failed.

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

#### Scenario: A work order on three pieces answers for each of them

- **WHEN** one work order's merged subjects hold three prose pieces and its
  approving verdict carries a record-wide `would-cite` and no `would-cite-for`
  entries
- **THEN** the merge refuses, naming the pieces left unanswered, and the reviewer
  re-issues the verdict with an entry per piece

#### Scenario: One honest sentence may answer for two pieces in one record

- **WHEN** a work order makes the same trivial correction to two pieces and its
  two `would-cite-for` entries carry the same statement
- **THEN** the merge accepts them, because the duplicate rule catches a statement
  recycled across reviews and not one repeated inside a single record

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
- **THEN** the verdict carries a `reads-human-from` entry naming that post, the
  post's earlier approving record, and why the correction did not move the
  post's voice; the merge accepts it, and no reviewer is made to write a voice
  verdict about a diff

#### Scenario: A carry-forward that stands on nothing is refused

- **WHEN** an approving post verdict carries a `reads-human-from` entry whose
  named record does not approve the post that entry names, or carries no
  `reads-human` of its own
- **THEN** the merge refuses the verdict, naming the record it could not stand
  on, exactly as it refuses a blank `would-cite`

#### Scenario: A repair that lands on a post and answers neither way is refused

- **WHEN** a job whose type is not `post` merges an edit to a `content/blog/`
  post and its reviewer approves with neither a `reads-human` nor a
  `reads-human-from` entry naming that post
- **THEN** the merge refuses the verdict, because the obligation follows the
  merged subjects and not the job type, and the reviewer re-issues it naming the
  record it stands on

#### Scenario: A job that lands on two posts answers for both

- **WHEN** one job's merged subjects hold two `content/blog/` posts and its
  approving verdict carries a `reads-human-from` entry for the first post only,
  with no `reads-human` of its own
- **THEN** the merge refuses the verdict, naming the second post as the one left
  unanswered, and the reviewer re-issues it with an entry for that post too or a
  fresh `reads-human` covering it — and every path that reports on a post's
  voice resolves each of the two posts through its own entry, so the merge and
  the launch check agree post by post

#### Scenario: A post approved before the carry-forward existed is a named state

- **WHEN** a post's current approving record was written before this requirement
  and carries neither field, and an earlier approving record naming that post
  carries a non-empty `reads-human`
- **THEN** the voice question counts as answered by that earlier record, no
  check fails on the post, and a record written after this requirement in the
  same shape is refused at merge instead of joining that state

### Requirement: A reviewer's non-blocking finding reaches work without editing anything

The reviewer has no edit rights, as a mechanism rather than as an instruction:
its worktree is discarded unconditionally, so it cannot fix what it finds. That
is the property that makes review trustworthy, and it is also what puts every
finding the reviewer does not block on at risk of dying in a file nobody reads
again. Measured before either mechanism below existed: **19.5%** of `approve`
verdict records carried a finding the reviewer recorded but did not block on,
and roughly **30%** of those were never rescued by any means at all.

A finding therefore travels as **data written into the verdict record**, which
is the one artifact the reviewer both produces and is trusted to produce.

- A verdict record MAY carry a `carry:` block of zero or more entries, each with
  a `title`, a `detail`, and a `subject` naming the file the finding is about.
- A `subject` SHALL be **required** rather than optional. A finding with no
  subject cannot be grouped with the findings already standing against that file,
  cannot be retired by the work that fixes it, and becomes an item nothing can
  close.
- Where a finding's subject already carries standing findings, it SHALL merge into
  that subject's existing queue item rather than creating a second one.
- **The number of entries a review carries SHALL be recorded on the job's ledger
  line**, so that the volume of this channel is a series anyone can read rather
  than something that has to be re-derived from the record files each time the
  question is asked.
- **No numeric cap is placed on the entries one review may carry**, and the reason
  is a measurement rather than a preference. Across all 407 records on 2026-09-08
  there are 222 entries in 143 records — 86 records carry one, 37 carry two, 17
  carry three, two carry four. A cap of two would have suppressed 24 of 222
  entries, 10.8%, in 20 of 407 records; the required subject would have refused 15
  of 222, 6.8%. Against a channel filing at 37 in three days and a tracker growing
  at 1.43, that is not a budget. These specifications delete two other mechanisms
  precisely because they never fired and would have "measurably prevented
  nothing"; a cap convicted by the same standard is not adopted merely because it
  is the bound nearest to hand. The inflow bound that the numbers do support is
  the filing rule on deferrals, which the loop's own requirement carries, and it
  is where the argument belongs.
- A verdict record MAY carry a reviewer-noted **proposal**, on the same terms
  and for the same reason. This mechanism predates `carry:` and is what `carry:`
  was modelled on. Implemented by `transcribeNotedProposal` in
  `loop/lib/proposals.mjs`.
- Neither `carry:` nor a noted proposal SHALL affect the verdict itself. A
  reviewer that could turn a finding into a rejection by writing it in a
  different field would have been given, through the back door, the editorial
  power the discarded worktree exists to withhold. The verdict remains exactly
  the value drawn from the closed list, decided on the reasons the review
  requirement already names. Implemented by `parseVerdict` in
  `loop/lib/verdict.mjs`, which reads the two independently; measured by the
  verdict parser's tests.
- The reviewer's brief SHALL document both fields and the required subject,
  because a mechanism a reviewer is not told about is a mechanism that does not
  run.
- A carried finding SHALL NOT be a second route to publication. It becomes a
  queue item and is then subject to every rule an item from any other source
  is: selection, budget, the review gate on whatever job takes it.

#### Scenario: An approval carries a finding it did not block on

- **WHEN** a reviewer approves a piece and records a finding it judged not worth
  blocking on
- **THEN** the verdict is `approve`, unchanged, and the finding is written into
  the record as a `carry:` entry rather than lost with the discarded worktree

#### Scenario: The volume of the channel is on the ledger

- **WHEN** a reviewer approves a work order and carries three findings
- **THEN** the job's ledger line records three carried entries, and the count is
  readable without opening the verdict record

#### Scenario: A finding with no subject is refused

- **WHEN** a verdict record carries a `carry:` entry with a title and a detail and
  no subject
- **THEN** the entry is refused and reported naming the record, and no item is
  queued that nothing could retire

#### Scenario: A finding cannot become a rejection by another name

- **WHEN** a verdict record carries `carry:` entries alongside an `approve`
- **THEN** the merge treats the verdict as `approve` and the entries change
  nothing about it
