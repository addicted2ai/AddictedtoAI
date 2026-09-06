# review Specification

## Purpose
Mandatory review: every change the loop proposes and every piece of content
it produces is reviewed before it publishes. Review was the highest-value
part of the previous machinery — on one representative day nine review rounds
each found something real that no automated check had caught — and it is
designed here to be light enough that it never becomes the bottleneck that
stops entries shipping.

## Requirements

### Requirement: Nothing model-written publishes unreviewed, and no run reviews its own output

Every job whose diff contains model-written or model-edited content (prose,
entry data changes beyond feed binding, machinery code) SHALL be reviewed
before merge. The reviewer SHALL be a separate invocation with a fresh
context and no edit rights — a different model where `runners.yml` clears
one for `reviewer`, otherwise the same model freshly invoked. "No edit
rights" is a mechanism, not an instruction: the loop SHALL discard any
change a reviewer invocation makes to the reviewed tree, and the only
output it accepts from a reviewer is the verdict record, written to a
designated path outside the reviewed worktree. The authoring run and the
reviewing run are never the same session; self-review is not review.

**The one exemption:** deterministic outputs of already-reviewed machinery —
Pulse feed refreshes, derived tables, computed banners, the derived queue —
publish without per-run review, because the machinery that produces them was
reviewed when it merged and they contain no model judgment. Anything a model
wrote in the run is never inside this exemption.

#### Scenario: Fresh eyes or no merge

- **WHEN** a job finishes with a diff containing model-written prose
- **THEN** the merge is blocked until a separate reviewer invocation returns
  an explicit verdict on that diff

#### Scenario: The Pulse publishes data without review

- **WHEN** the Pulse's scheduled run updates the model catalog from a feed
  and rebuilds
- **THEN** no review is required, because no model wrote anything in that
  run

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

### Requirement: What is checked depends on what the work is

The reviewer SHALL work from the checklist for the job's kind — reviewing a
wiki entry, a tutorial, and a machinery change are not the same job:

- **Wiki entry**: every cited fact has a reachable source and the source
  says what the fact says (fetch and confirm — do not assume); volatile
  values are transclusions or feed-bound, not literals; aliases sanely
  classed; prose adds something beyond the data.
- **Tutorial**: evidence the steps were actually executed (transcript or
  reproduced outputs) — plausibility is not verification; `subjects`,
  `verified_against`, `verified_on` complete and honest; unexecuted steps
  disclosed; perishables all declared.
- **Blog post**: every external claim source-checked by fetching; title and
  excerpt read against the body for overclaim; company-conduct claims held
  to the news-fact-checking standard; dates explicit. Additionally, the
  reviewer SHALL identify the post's form (news note or synthesis — see
  `blog`) and apply that form's finish line: for a note, the declared
  anchor holds (external anchors fetched and confirmed to document the
  event and its date), the affected party is named where one exists, and
  brevity alone is never a defect; for a synthesis, the derivation method
  is stated and the evidence enumerable. The reviewer SHALL judge the
  prose against the voice document `blog` names, rejecting
  `reads-as-generated` where it reads machine-made — the advisory voice
  lint's build warnings MAY be cited as evidence, but the judgment is the
  reviewer's, not the count's — and SHALL answer the
  send question in the record's `would-cite` field — who would send this,
  and to whom — in its own words.
- **Scout run**: the charge's failure condition applied first — a run
  whose candidates could all have been written without leaving the
  repository fails it; evidence URLs spot-checked by fetching; every
  candidate carries slug, type, `expires:`, why-now, retrieval-dated
  evidence, and done-when lines; every declined story has a drop record
  naming the failed test and a refile condition; at most three candidates
  filed.
- **Education page**: no perishable literals; prerequisites and the
  "after this you will understand" statement honest; beats the obvious
  alternative.
- **Directory/curated data**: spot-check changed rows against their sources.
- **Machinery change**: run the changed check or script and confirm the
  claimed behavior — red before, green after where applicable; every claim
  about what the change does verified by executing, not by reading; guard
  rails tested by attempting what they forbid.

For a job that originated from a proposal, the checklist additionally
includes the rejection index (`data/proposals/rejected/`): the reviewer
confirms the piece is not a differently-worded re-tread of a rejected
proposal — this is the judgment half of duplicate suppression, whose
mechanical half is the exact slug match in `loop`.

In every kind, the reviewer's standing instruction is: **for every claim
about what something does, run the cheap direct check; for every sourced
claim, confirm the source supports it.** The defect class this review exists
to catch is the claim written from intent rather than measurement — found
repeatedly by skeptical readers on the previous site and never once by an
automated check.

#### Scenario: The reviewer measures instead of reading

- **WHEN** a machinery diff claims "this makes X impossible"
- **THEN** the reviewer attempts X against the changed code and the verdict
  cites the attempt's observed result, not the diff's description

#### Scenario: A scout run is checked against its charge

- **WHEN** a scout run's diff arrives for review with three candidates and
  two drop records
- **THEN** the reviewer verifies the candidates carry externally retrieved,
  retrieval-dated evidence, spot-fetches it, and rejects the run as
  `spec-violation` if everything filed could have been written from the
  repository alone

### Requirement: Rejection has mechanics and an end

A `revise` or `reject` verdict SHALL name the reason(s) from the list and
the specific locations at issue. What happens next:

1. `revise`: the authoring side (same job, fresh or resumed run) gets
   exactly one revision pass against the named findings, then a delta
   review of only what changed.
2. A second non-approval SHALL discard the job: branch closed, one-line
   record of the reasons kept. No third pass, no indefinite loop.
3. A discarded piece may return only as a new job with new evidence or a
   changed approach; the record of the prior rejection travels with it.

Disagreement resolves in the reviewer's favor by default: the author never
overrules the reviewer, and nothing publishes on a tie. If the authoring
side believes the rejection itself violates these specs, it MAY file a beads
issue for the maintainer; the work stays unpublished meanwhile. Review is
bounded by construction — one review, one revision, one delta review — so it
can never become an unbounded gate that stops entries shipping; a review
that delays publication indefinitely has failed exactly as review skipped.

#### Scenario: Two strikes and the branch closes

- **WHEN** a revised draft fails its delta review
- **THEN** the job is discarded with reasons recorded, and the loop moves on

### Requirement: Review survives a model swap, and its limits are stated

Review MUST keep working when the reviewer is a weaker model than the
author, or the same model twice:

- **What holds regardless of models**: fresh context (the reviewer never
  sees the author's reasoning, only the diff and the checklist); no edit
  rights; the mechanical parts of every checklist (fetch the source and
  compare; run the command and read the output; check the fields exist),
  which do not require matching the author's capability; and the named
  reason list.
- **What weakens and is accepted as weakened**: subtle quality judgment from
  a weaker reviewer, and blind-spot correlation when the same model reviews
  itself (same model twice retains fresh-context independence — the
  historical record shows fresh eyes finding real defects even same-model —
  but loses family-level diversity). When `runners.yml` has only one model
  family, that thinner protection is a fact, not a failure.
- A weaker reviewer's `not-worth-reading` verdict is valid signal, not
  malfunction: if a weaker reader finds a piece dull, that is evidence about
  readers.

#### Scenario: A weaker reviewer still catches the catchable

- **WHEN** the reviewer model is weaker than the author model
- **THEN** source-fetch verification, command execution, field checks, and
  overclaim comparison still run and still block on failure — the mechanical
  floor of review does not depend on reviewer strength

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

### Requirement: Missing, unbound, and mismatched are three findings, not one

`lib/reviews.mjs`'s header already reasons that "unreviewed" and "named
something the join does not recognise" are the same observation from the join's
position, and that absence must therefore be reported rather than acted on.
Reviewed-then-changed is the third member of that family, and a check unable to
tell it from the other two would report a page whose approved text had since
moved as though it had never been reviewed at all — the one reading that loses
both the record and the change.

- The join SHALL classify every reviewable piece into exactly one of four
  states: **recorded** (a record joins and its recorded hash equals the piece's
  current reviewed-surface hash), **mismatched** (a record joins, carries a hash
  for that path, and the hashes differ), **unbound** (a record joins and carries
  no hash for that path), and **missing** (no record joins).
- Every path that reports on reviews — `scripts/verify-launch.mjs` and the
  prebuild's summary line — SHALL report the four states separately and SHALL
  NOT collapse mismatched into missing. They are opposite findings: missing
  means unreviewed, mismatched means reviewed and then changed, and only the
  second identifies both a specific record and the specific bytes that moved.
- `scripts/verify-launch.mjs` SHALL fail on any **mismatched** piece, naming the
  piece, the record, and the fact that the reviewed surface changed after the
  verdict.
- **Unbound** SHALL be counted and reported and SHALL NOT fail anything. Every
  record written before the merge began binding hashes is unbound, so failing on
  unbound would refuse the whole corpus of records that predate the mechanism —
  and an unbound record is exactly as informative as a record was before binding
  existed, no worse. The number to watch is that it only ever falls.
- A **mismatched** state SHALL NOT change a page's indexability. The build's
  review gate continues to read the verdict alone. Suppressing a page because
  its bytes moved would silently de-index approved work over a whitespace edit,
  which is the response `lib/reviews.mjs` already refuses to give to absence,
  for the same reason.

#### Scenario: An edited approved page is a named finding

- **WHEN** an approved entry's prose is edited after its verdict and the launch
  check runs
- **THEN** the check fails, naming that piece as mismatched against its record,
  and does not report it as missing a review

#### Scenario: A pre-existing record is unbound, not broken

- **WHEN** a seed record carrying no `reviewed:` key joins its piece
- **THEN** the piece reports as unbound, the count of unbound pieces is printed,
  and nothing fails

#### Scenario: A mismatch does not unpublish anything

- **WHEN** a piece is mismatched against its record
- **THEN** its rendered page's indexability is exactly what the verdict alone
  would produce, and no page is de-indexed by the mismatch

### Requirement: A re-review supersedes the record it replaces

A mismatch has to have a way to clear, and today it does not. Re-reviewing a
piece writes a second record naming the same path, and the join binds the wrong
one: candidate filenames are tried before front-matter subjects, so a seed
record claims its piece before any loop-written record is consulted, and among
front-matter subjects the first record in directory order wins. A piece that has
genuinely been re-reviewed would stay mismatched forever, which would make the
previous requirement a wall rather than a gate.

- Where more than one record names one piece, the join SHALL bind the **most
  recent** record and SHALL derive recency from a value recorded inside the
  record — its own date, else its job id — and SHALL NOT read the filesystem's
  modification time, which is not committed and differs on every clone.
- Records superseded this way SHALL NOT be reported as orphans, and SHALL NOT be
  reported as contended. An orphan report means a naming mismatch worth a human
  look; a superseded record is the expected residue of a re-review and reporting
  it as a defect would train the reader to ignore the report.
- Where two records naming one piece cannot be ordered — no date, no job id, or
  an exact tie — the join SHALL keep today's behaviour of reporting the
  contention rather than picking, because a tie-break invented at that point is
  a guess about which review is current.

#### Scenario: Re-review clears a mismatch

- **WHEN** a mismatched piece is re-reviewed and the new record carries a later
  date and the current reviewed-surface hash
- **THEN** the join binds the new record, the piece reports as recorded, and the
  older record is neither claimed nor reported as an orphan

#### Scenario: An unorderable pair is still reported

- **WHEN** two records name the same piece and neither carries a date or a job
  id
- **THEN** the join reports the contention and binds neither by guesswork

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
  a `title`, a `detail`, and an optional `subject` naming the file the finding
  is about. Implemented by `parseCarry` in `loop/lib/verdict.mjs`; measured by
  the verdict parser's tests.
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
- The reviewer's brief SHALL document both fields, because a mechanism a
  reviewer is not told about is a mechanism that does not run. Implemented in
  `loop/lib/review.mjs`; measured by the brief-text tests.
- A carried finding SHALL NOT be a second route to publication. It becomes a
  queue item and is then subject to every rule an item from any other source
  is: selection, budget, the review gate on whatever job takes it.

#### Scenario: An approval carries a finding it did not block on

- **WHEN** a reviewer approves a piece and records a finding it judged not worth
  blocking on
- **THEN** the verdict is `approve`, unchanged, and the finding is written into
  the record as a `carry:` entry rather than lost with the discarded worktree

#### Scenario: A finding cannot become a rejection by another name

- **WHEN** a verdict record carries `carry:` entries alongside an `approve`
- **THEN** the merge treats the verdict as `approve` and the entries change
  nothing about it

### Requirement: A claim record is judged against the bytes of the source it quotes

A claim record is a verbatim quotation, a host, a date and a verification state,
transcribed by a model from a page the reviewer can fetch. Every one of those is
checkable, and each has a failure mode that a reader of the diff alone would
miss. Where a diff contains claim records, the reviewer SHALL additionally:

**The build can check every field of this record except the one that matters.**
`source_host` is a string comparison, `subject` is a corpus lookup, `accessed` is
a date, `verified: true` is a shape — all of them gates. `quote` is none of them:
verbatim-ness is a comparison against a document the build never fetches, and a
build that did fetch it would make every rebuild depend on a third party's
uptime and on the page not having changed since. So this one clause belongs to
the reviewer and to nobody else, and there is no gate to fall back on if the
reviewer skips it.

- **Fetch `source_url` and confirm `quote` is present in the fetched bytes,
  verbatim.** Plausibility is not verification. The instrument SHALL be ruled out
  before absence is concluded — inflate compressed streams and read
  parenthesised text literals, expect ligatures and escaping, and search
  fragments that straddle neither. A quote that is genuinely absent from the
  document is `false-or-unsupported-claim`; a quote absent from one representation
  of a document is a misattribution to be traced before it is called anything
  worse.
- **Confirm `source_host` equals the host of `source_url`,** and judge the vendor
  test's *input* rather than its output: is this host really a place the subject
  publishes from? The check itself is mechanical, but what it compares against is
  a declaration somebody made, and a wrong `publishes_from` value attributes a
  stranger's words to a named company. Where the diff adds a `publishes_from`
  value, the reviewer SHALL confirm the domain independently and say how.
- **Read `verified` for what it asserts.** A record claiming more than was done
  is `intent-not-measurement`: `verified: {by, url, date}` requires that the named
  document actually supports the confirmation, fetched and confirmed, not
  described. A `verified: false` requires that a check happened and failed, and
  the reviewer SHALL reject a `false` written as a placeholder for "nobody
  looked" — absence is how that is spelled, and the difference is the whole point
  of the three states.
- **Check that nothing in the diff turns a fact into a claim.** A cited fact
  moved into a claim record, or a claim record filed for a value that is a
  measurement by a third party rather than an assertion by the subject, is
  `spec-violation` against the requirements in `wiki` — and it is the specific
  defect this record type was created to end, found twice in shipped work by two
  independent builders.

The standing instruction is unchanged and applies here in its sharpest form: for
every claim about what something does, run the cheap direct check; for every
sourced claim, confirm the source supports it. A claim record is the one content
shape in this corpus whose entire content is a sourced claim.

#### Scenario: The quote is confirmed against the document, not the diff

- **WHEN** a diff files a claim record quoting a vendor's launch post
- **THEN** the reviewer fetches that post and the verdict cites the fetch and
  what was found in it, not the record's own description of the source

#### Scenario: A verification state that outruns the work is rejected

- **WHEN** a record declares `verified: {by, url, date}` and the named URL does
  not support the claim
- **THEN** the reviewer returns a non-approval citing `intent-not-measurement`,
  naming the record and the URL

#### Scenario: A placeholder negative is not a finding

- **WHEN** a record declares `verified: false` and nothing in the diff or the
  job's evidence shows that a check was attempted
- **THEN** the reviewer requires the key removed rather than left, because absent
  means nobody looked and `false` means somebody looked and failed

#### Scenario: A measurement filed as a claim is a spec violation

- **WHEN** a diff files a claim record whose source is a third party's
  measurement of the subject's product rather than the subject's own statement
- **THEN** the reviewer returns a non-approval citing `spec-violation`, naming
  the requirement in `wiki` that a claim is the subject's own only when the
  source is
