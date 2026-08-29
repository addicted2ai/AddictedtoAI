# Tasks — harden-seed-wave-guardrails

**Ground rules for every implementing session and every subagent brief (each one
stopped a real unattended run; repeat them in any sub-brief you write):** never
use `cd` in any command, anywhere; keep shell command strings short (write a
script file and run it by absolute path instead of a long one-liner); prefer the
Read/Write/Edit/Grep/Glob tools over `cat`, `sed -i`, `echo >`, `grep`, `find`;
**never `git push`, `bd dolt push`, `gh pr create`/`merge`, `vercel deploy`, or
anything that transmits this repository off this machine** — the remote
publishes `www.addictedtoai.net` on push and the tree was deliberately emptied;
never manipulate credentials on a command line; never print a secret or the
contents of `.env.local`; if a tool call is blocked, report it and stop. Never
edit `package.json` — a new prebuild step goes in the `STEPS` array in
`scripts/prebuild.mjs`. Never run two builds concurrently (`addictedtoai-6s7`):
run every verification step serially. Commit locally after every task group.

Requirements referenced below live in
`openspec/changes/harden-seed-wave-guardrails/specs/`; the requirements they
extend live in `openspec/changes/build-initial-site/specs/`. Clause ids (C1…C47)
are defined in the traceability table in section 6 — **every normative clause in
this change's spec deltas appears there exactly once, against the task that
implements it and the check that measures it.**

Nothing in section 5 of `design.md` — the D7, D8 and D9 draft blocks — is tasked
here. Those are the maintainer's open decisions and no task in this list
implements one.

## 1. Bind a review record to the bytes it reviewed (specs/review, `addictedtoai-zlq`)

- [ ] 1.1 Add the reviewed-surface hash to `lib/`: a `reviewedSurface(doc)` that
      returns the canonical bytes a hash is taken over — the front matter with
      every key in a new exported `MECHANICAL_FRONT_MATTER_KEYS` removed,
      serialised deterministically with sorted keys, then the body verbatim —
      and a `reviewedHash(doc)` returning its SHA-256 hex. `timeline` is the
      whole of the mechanical list today; `pulse` appends to it under the review
      exemption. Implements **C2, C3**.
      Verify: a new `lib/review-hash.test.mjs` asserts (a) two documents
      differing only in `timeline` hash equal, (b) documents differing in the
      body, in a `facts[].value`, or in a `source_url` hash differently, and (c)
      reordering front-matter keys does not change the hash.
- [ ] 1.2 In `loop/lib/review.mjs`, extend the merge-time write so the same
      measurement that produces `subject:` also produces `reviewed:` — a mapping
      from each joinable content path to that file's `reviewedHash` read from the
      merged tree. One call, one measurement, two keys. The serialisation of
      `subject:` (a bare string for one path, a YAML list for several) does not
      change, and the surgical front-matter rewrite keeps the reviewer's own
      keys, notes and byte-for-byte `would-cite`. Implements **C1, C6**.
      Verify: a case in `loop/tests/review.test.mjs` merges a job touching one
      content file and a second touching three, and asserts both records carry
      `reviewed:` with one hash per subject; plus a golden-record assertion that
      `subjectsOf()` returns exactly what it returned before this change for a
      one-path record, a many-path record and a hand-written `subject:` record.
- [ ] 1.3 In `mergeGate()`, refuse a record whose set of `reviewed:` paths
      differs from the set of joinable paths written to `subject:`, in the same
      place and with the same shape of message as the empty/duplicate
      `would-cite` refusal, naming both sets. Implements **C4, C5**.
      Verify: `loop/tests/review.test.mjs` — a record with an extra
      `reviewed:` path, one with a missing path, and one whose paths match; the
      first two are refused with both sets named, the third merges.
- [ ] 1.4 In `lib/reviews.mjs`, give `resolveReviews()`/`reviewJoin()` a
      per-piece `state` of `recorded` | `mismatched` | `unbound` | `missing`,
      computed from whether a record joins, whether it carries a hash for that
      path, and whether that hash equals the piece's current `reviewedHash`.
      Implements **C7**.
      Verify: `lib/reviews.test.mjs` builds a throwaway corpus producing all
      four states in one run and asserts the exact classification of each piece,
      including that a record carrying a hash for a *different* path than the
      piece is `unbound` for that piece and not `mismatched`.
- [ ] 1.5 In `scripts/verify-launch.mjs`, split the review check's output into
      the four states, fail on any `mismatched` piece naming the piece, the
      record and that the reviewed surface changed after the verdict, and count
      and print `unbound` without failing on it. Extract the report into a pure
      function so it is testable without a build. Implements **C8, C9, C10,
      C11, C12**.
      Verify: a test over a fixture join containing one piece in each state
      asserts the report lists the four separately, that the mismatched piece is
      not reported under missing, that the returned failure set contains the
      mismatched piece and not the unbound one, and that the unbound count is
      printed; then `node scripts/verify-launch.mjs` on this repository prints
      the four counts.
- [ ] 1.6 Extend the prebuild's review summary line in `lib/build-content.mjs`
      to print all four counts every build, so the number to watch — unbound,
      which can only fall — is on the screen. Implements **C8** (the prebuild
      half).
      Verify: `npm run build` prints a line carrying all four counts; a fixture
      build with a deliberately edited approved piece shows `mismatched 1`.
- [ ] 1.7 Leave `entryReviewGate()` reading the verdict alone, and pin that with
      a test rather than a comment: a mismatched piece keeps exactly the
      indexability its verdict alone would give it. Implements **C13**.
      Verify: `lib/reviews.test.mjs` — an approved entry whose body is edited
      after approval still returns true from `hasApprovedReview`, and the
      rendered page's robots meta is byte-identical to the unedited case.
- [ ] 1.8 In `lib/reviews.mjs`, order multiple records naming one piece by a
      value read from the record — its own `date`, else its `job` id, whose
      `j-<yyyymmdd>-<seq>` form sorts chronologically as a string — bind the most
      recent, exclude the superseded ones from both the orphan list and the
      contention list, and keep today's contention report for a pair that cannot
      be ordered. Read nothing from the filesystem's modification time.
      Implements **C14, C15, C16, C17, C18, C19**.
      Verify: `lib/reviews.test.mjs` — (a) two dated records on one piece: the
      newer binds and the older is in neither `orphans` nor `contended`; (b) two
      job-id-only records: the later id binds; (c) two records with neither: the
      contention is reported and neither binds; (d) a source assertion that the
      module references no `mtime`/`statSync`, since a join that varies per clone
      is the defect this avoids.

## 2. Make the volatile-literal check non-vacuous (specs/wiki, `addictedtoai-48r`)

- [ ] 2.1 In `lib/schema.mjs`, declare the classification: exported
      `PROSE_FIELDS` and `NON_PROSE_FIELDS` giving, per content type, the field
      paths of every string-valued field (the table in `design.md` D5 is the
      proposed split), plus an `assertFieldsClassified()` that walks each schema's
      string-valued fields and throws naming any field in neither list. Call it
      from the content build step so it runs every build. Implements **C20,
      C21**.
      Verify: `lib/schema.test.mjs` — the assertion passes on today's six
      schemas; a fixture schema with an added unclassified string field makes it
      throw naming that field; a field listed in both lists also throws.
- [ ] 2.2 In `lib/currency.mjs`, add `findFrontMatterLiterals(data, paths)`
      applying the existing `RULES` to the declared author-prose fields, with the
      exemption that a hit is dropped when the object directly containing the
      field has a sibling key whose value matches `ISO_DATE_RE`. Wire it into
      `warnCurrencyLiterals` so a front-matter hit warns in the same form as a
      body hit — file, field, literal, rule — and at the same severity.
      Implements **C22, C23**.
      Verify: `lib/currency.test.mjs` — (a) a `learn.outcome` containing
      `$20/month` warns naming the file, `outcome`, the literal and the
      `per-month` rule; (b) the same literal in a delta end's `metric`, whose end
      carries its required `date`, produces no warning; (c) a blog
      `corrections[].text` with a price and a sibling `date` produces none;
      (d) the build still exits 0 with a hit present, because this warns.
- [ ] 2.3 Add the coverage counts to the content build step's summary: per
      content type, how many documents had at least one author-prose field
      scanned and how many had none. Implements **C24**.
      Verify: `npm run build` prints one line per content type carrying both
      numbers; a test over a fixture corpus asserts the split for a type where it
      is known by construction (a fixture with two scannable and three
      fully-exempt documents reports 2 and 3).

## 3. Compare a feed-bound fact against a cited one (specs/wiki + specs/pulse, `addictedtoai-473`)

- [ ] 3.1 In `lib/schema.mjs`, add an optional `corroborates` field to both fact
      variants, and a build failure — naming the entry and the field — when its
      value names no fact on that entry or names the declaring fact itself.
      Change no rendering path. Implements **C25, C26**.
      Verify: `lib/schema.test.mjs` and `lib/facts.test.mjs` — a fixture entry
      with a valid declared pair builds, and its rendered fact block is
      byte-identical to the same entry with the key removed; a fixture naming a
      field the entry does not declare fails the build naming entry and field; a
      self-referencing declaration fails.
- [ ] 3.2 Add `pulse/lib/corroboration.mjs`: resolve the feed side from the
      latest snapshot through the entry's declared row id and the fact's field
      path, resolve the cited side from its written value, and compare — trim,
      collapse whitespace, case-fold, then extract each side's first numeric
      magnitude with its optional currency symbol and `K`/`M`/`B`/`T` suffix;
      equal magnitudes agree, and where either side yields no magnitude the
      normalised strings must be equal. Where either side does not resolve, make
      no comparison and produce no finding. No tolerance. Implements **C27,
      C28, C29, C30**.
      Verify: a new `pulse/tests/corroboration.test.mjs` — `284B total` vs
      `304B params` disagree; `284B total` vs `304B params` where the feed row is
      absent produces no comparison at all (not an agreement); `$3` vs `$3.00`
      agree; `284B total` vs `284B params` agree; `active` vs `deprecated`
      disagree by the string path; a field path absent from the row produces no
      comparison.
- [ ] 3.3 Emit the finding into the derived queue as a `corroboration` item
      proposing a `verify` job, naming the entry, both fields, both resolved
      values, the feed's registry id and the cited `source_url`. Recompute it
      from state every run like every other queue item, edit no fact, mark no
      source authoritative, and fail no build. Implements **C31, C32, C33,
      C34**.
      Verify: `pulse/tests/queue.test.mjs` — a disagreeing fixture yields exactly
      one item carrying all six named values; two consecutive runs over unchanged
      state produce byte-identical queues; making the values agree removes the
      item with no close action; and a byte comparison of the fixture's content
      files plus a `npm run build` exit 0 confirm the run changed no fact and
      failed no build.

## 4. The undisputed floor of the three open loop gaps (specs/loop)

- [ ] 4.1 Audit the runtime-refusal requirement clause by clause against
      `loop/lib/health.mjs`, `loop/lib/select.mjs` and `loop/run.mjs`, and record
      which clauses the existing `loop/tests/runner-health.test.mjs` already
      asserts. Measured on 2026-08-28, before this change: the no-output ledger
      signal, refusal at the third empty run, refusal at the selector before any
      candidate is considered, the abandon sweep neither counting nor re-arming,
      one productive run clearing the streak, **and** the refusal string carrying
      the exact `node loop/conformance.mjs --runner <id>` command
      (`runner-health.test.mjs:107`) are all asserted. Add an assertion for any
      clause that is not. Implements **C35, C36, C37, C38, C39, C40**
      (`addictedtoai-pfv`, settled half).
      Verify: `npm test` green, and the audit records one line per clause naming
      the test file and case that asserts it — a clause with no named case is not
      audited, it is unimplemented.
- [ ] 4.2 Add the one assertion the audit finds missing, measured rather than
      assumed: nothing anywhere in `loop/tests/` asserts that refusing a runner
      writes **no** `HOLD.md`, which is the clause that keeps D7 open — without
      it, adopting a fifth breaker later would silently satisfy the old test
      suite. Implements **C41**.
      Verify: `loop/tests/runner-health.test.mjs` — after three no-output runs on
      the one configured runner in a throwaway repository, no `HOLD.md` exists at
      its root and the run's own log says the runner was refused.
- [ ] 4.3 In `loop/lib/budget.mjs` and the selector's refusal path, carry
      `category_mm`, `denominator` and `denominator_origin` on every ceiling and
      floor refusal, print all three, and state the substitution explicitly
      whenever the denominator is not the tier's observed rolling total.
      Implements **C42, C43** (`addictedtoai-tr8`, settled half — it does not
      choose the denominator; D8 does).
      Verify: `loop/tests/budget.test.mjs` — a refusal on a ledger below the
      warm-up names the substituted denominator, its origin, and says it was
      substituted; a refusal on a ledger above it names the observed rolling
      total as the origin; both carry the category's MM.
- [ ] 4.4 In `loop/lib/ledger.mjs`, record a job's model-minutes broken down by
      invocation phase — `author`, `revision`, and each `review` pass — so the
      job total is the sum of recorded measurements. Implements **C44**
      (`addictedtoai-o5t`, settled half).
      Verify: `loop/tests/review.test.mjs` — a job driven through an author run,
      one revision and two review passes writes four phase entries, and their sum
      equals the line's `mm`; a job with one invocation writes one.
- [ ] 4.5 In `loop/lib/brief.mjs` and `runShapeSection()` in
      `loop/lib/review.mjs`, state the cap as this invocation's limit, state the
      job's total spend so far and how many invocations have already run, and
      remove any wording that presents the cap as the job's budget. Implements
      **C45, C46, C47**.
      Verify: a test asserts that the assembled author brief and the assembled
      reviewer brief each contain the per-invocation phrasing, a running-total
      figure and an invocation count; and that neither matches a regex for the
      budget-implying phrasings being removed (a golden list of the exact strings
      replaced, so the assertion cannot pass by the phrase merely moving).

## 5. Integrated verification

- [ ] 5.1 Run the gates serially, never concurrently: `npm test`, then
      `npm run build`, then `node scripts/verify-launch.mjs`, then
      `openspec validate harden-seed-wave-guardrails --type change --strict
      --no-interactive`. Record the measured review-state counts
      (recorded/mismatched/unbound/missing) and the per-type coverage counts in
      this file beside this task, as measurements with the date — not as
      expectations.
- [ ] 5.2 Re-run the traceability audit in section 6 against the implemented
      tree: every normative clause in this change's four spec deltas maps to a
      task in this file and to a check that measures it, and the count of
      clauses equals the count of table rows. A clause whose check exists only as
      a sentence in this file is not measured; name the test file and the case.
- [ ] 5.3 Update `addictedtoai-pfv`, `-tr8` and `-o5t` in beads with a pointer to
      `design.md` D7, D8 and D9 and the recommendation each carries, and note on
      each that only its settled floor was implemented. Do not implement a draft
      block. Close `addictedtoai-zlq`, `-48r` and `-473`'s machinery half against
      sections 1–3.

## 6. Traceability — every normative clause, its task, its check

47 normative clauses across four spec deltas; 47 rows. The eight normative
sentences elsewhere in this change all sit inside the fenced **DRAFT — NOT
ADOPTED** blocks in `design.md` D7–D9, are not requirements of this change, and
are deliberately absent from this table.

| # | Requirement | Normative clause | Task | Check |
|---|---|---|---|---|
| C1 | review: names the bytes | merge writes `reviewed:` from the `subject:` measurement | 1.2 | `loop/tests/review.test.mjs` merge cases |
| C2 | review: names the bytes | reviewed surface = body + non-mechanical front matter | 1.1 | `lib/review-hash.test.mjs` (a)(b) |
| C3 | review: names the bytes | mechanical-key list in one declared place | 1.1 | `lib/review-hash.test.mjs` (a) |
| C4 | review: names the bytes | `reviewed:` paths equal `subject:` paths | 1.3 | `loop/tests/review.test.mjs` gate cases |
| C5 | review: names the bytes | merge refuses a record where they differ | 1.3 | `loop/tests/review.test.mjs` gate cases |
| C6 | review: names the bytes | `subject:` value shape unchanged | 1.2 | golden-record `subjectsOf()` assertion |
| C7 | review: three findings | join classifies four states | 1.4 | `lib/reviews.test.mjs` four-state corpus |
| C8 | review: three findings | every reporting path reports the four separately | 1.5, 1.6 | report-function test; `npm run build` line |
| C9 | review: three findings | mismatched never collapsed into missing | 1.5 | report-function test |
| C10 | review: three findings | launch check fails on mismatched, naming it | 1.5 | report-function test + real run |
| C11 | review: three findings | unbound counted and reported | 1.5, 1.6 | report-function test; build line |
| C12 | review: three findings | unbound fails nothing | 1.5 | report-function test failure set |
| C13 | review: three findings | mismatch never changes indexability | 1.7 | `lib/reviews.test.mjs` robots-tag case |
| C14 | review: supersede | bind the most recent record | 1.8 | `lib/reviews.test.mjs` (a)(b) |
| C15 | review: supersede | recency read from inside the record | 1.8 | `lib/reviews.test.mjs` (a)(b) |
| C16 | review: supersede | never read filesystem mtime | 1.8 | `lib/reviews.test.mjs` (d) source assertion |
| C17 | review: supersede | superseded records are not orphans | 1.8 | `lib/reviews.test.mjs` (a) |
| C18 | review: supersede | superseded records are not contended | 1.8 | `lib/reviews.test.mjs` (a) |
| C19 | review: supersede | an unorderable pair is reported, not guessed | 1.8 | `lib/reviews.test.mjs` (c) |
| C20 | wiki: front-matter prose | every string field classified in one place | 2.1 | `lib/schema.test.mjs` classification cases |
| C21 | wiki: front-matter prose | build fails on an unclassified string field | 2.1 | `lib/schema.test.mjs` fixture schema |
| C22 | wiki: front-matter prose | scan author-prose fields, same form and severity | 2.2 | `lib/currency.test.mjs` (a)(d) |
| C23 | wiki: front-matter prose | exempt a hit with an ISO-date sibling | 2.2 | `lib/currency.test.mjs` (b)(c) |
| C24 | wiki: front-matter prose | report per-type coverage counts | 2.3 | build line + fixture split test |
| C25 | wiki: corroborates | build fails on a `corroborates` naming nothing | 3.1 | `lib/schema.test.mjs` missing/self cases |
| C26 | wiki: corroborates | changes no rendering, authority or re-check | 3.1 | `lib/facts.test.mjs` byte-identical render |
| C27 | pulse: corroboration | compare each declared pair every run | 3.2 | `pulse/tests/corroboration.test.mjs` |
| C28 | pulse: corroboration | no comparison when a side does not resolve | 3.2 | absent-row and absent-path cases |
| C29 | pulse: corroboration | and no finding in that case | 3.2 | absent-row case asserts no item |
| C30 | pulse: corroboration | the normalisation and agreement rule | 3.2 | magnitude and string cases |
| C31 | pulse: corroboration | disagreement enters the queue as a `verify` item | 3.3 | `pulse/tests/queue.test.mjs` item fields |
| C32 | pulse: corroboration | never edits, adjudicates, or fails the build | 3.3 | byte comparison + build exit 0 |
| C33 | pulse: corroboration | the item leaves on agreement or removal | 3.3 | agreement case |
| C34 | pulse: corroboration | it does not accumulate | 3.3 | byte-identical consecutive queues |
| C35 | loop: runner refusal | a no-output run is evidence about the runner | 4.1 | `runner-health.test.mjs` ledger-signal case |
| C36 | loop: runner refusal | refuse after three, on conformance's terms | 4.1 | third-empty-run case |
| C37 | loop: runner refusal | refuse before invoking and before resuming | 4.1 | selector case + resume case |
| C38 | loop: runner refusal | the refusal names cause and clearing command | 4.1 | `runner-health.test.mjs:107`, already asserted |
| C39 | loop: runner refusal | one productive run clears the streak | 4.1 | streak-clears case |
| C40 | loop: runner refusal | non-invocation lines neither count nor end it | 4.1 | abandon-sweep cases |
| C41 | loop: runner refusal | refusal writes no `HOLD.md` | 4.2 | new no-`HOLD.md` assertion (none exists today) |
| C42 | loop: budget refusal | record and print MM, denominator, origin | 4.3 | `loop/tests/budget.test.mjs` both cases |
| C43 | loop: budget refusal | a substituted denominator announces itself | 4.3 | below-warm-up case |
| C44 | loop: job total | ledger records per-phase model-minutes | 4.4 | four-phase sum case |
| C45 | loop: job total | the brief states the cap as per-invocation | 4.5 | brief assertion |
| C46 | loop: job total | the brief states total so far and invocation count | 4.5 | brief assertion |
| C47 | loop: job total | no brief calls the cap a job budget | 4.5 | golden removed-phrase regex |
