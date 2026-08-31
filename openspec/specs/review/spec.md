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

#### Scenario: An approve must answer the quality question

- **WHEN** a reviewer returns `approve` on a blog post with the
  `would-cite` field blank
- **THEN** the verdict is invalid, the merge refuses, and the reviewer must
  re-issue the verdict with the field answered

#### Scenario: Boring is a verdict

- **WHEN** a factually clean draft is judged not worth a reader's time
- **THEN** the reviewer rejects with `not-worth-reading` and the recorded
  reason says so plainly, with no manufactured factual objection

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
  to the news-fact-checking standard; dates explicit.
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

A verdict record today names a *piece*; it does not name the *text* it judged.
The join in `lib/reviews.mjs` matches a record to a piece by the canonical
URL-derived filename, three accepted alternates, or a front-matter subject key,
and the merge gate then checks that the record carries a verdict from the closed
list and a non-empty, non-duplicated `would-cite`. Every one of those checks
passes unchanged after the reviewed text is edited. An approval therefore
survives the thing it approved.

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
Reviewed-then-changed is the third member of that family, and today the check
cannot tell it from the other two.

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
