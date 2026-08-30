# review — delta for harden-seed-wave-guardrails

## ADDED Requirements

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
this change is one. It is a distinct, reported state, defined in the next
requirement.

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
  record from the seed wave is unbound; failing on it would mean this change
  cannot land, and an unbound record is exactly as informative as it was before
  this requirement existed — no worse. The number to watch is that it only ever
  falls.
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
