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

- [x] 1.1 Add the reviewed-surface hash to `lib/`: a `reviewedSurface(doc)` that
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
- [x] 1.2 In `loop/lib/review.mjs`, extend the merge-time write so the same
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
- [x] 1.3 In `mergeGate()`, refuse a record whose set of `reviewed:` paths
      differs from the set of joinable paths written to `subject:`, in the same
      place and with the same shape of message as the empty/duplicate
      `would-cite` refusal, naming both sets. Implements **C4, C5**.
      Verify: `loop/tests/review.test.mjs` — a record with an extra
      `reviewed:` path, one with a missing path, and one whose paths match; the
      first two are refused with both sets named, the third merges.
- [x] 1.4 In `lib/reviews.mjs`, give `resolveReviews()`/`reviewJoin()` a
      per-piece `state` of `recorded` | `mismatched` | `unbound` | `missing`,
      computed from whether a record joins, whether it carries a hash for that
      path, and whether that hash equals the piece's current `reviewedHash`.
      Implements **C7**.
      Verify: `lib/reviews.test.mjs` builds a throwaway corpus producing all
      four states in one run and asserts the exact classification of each piece,
      including that a record carrying a hash for a *different* path than the
      piece is `unbound` for that piece and not `mismatched`.
- [x] 1.5 In `scripts/verify-launch.mjs`, split the review check's output into
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
- [x] 1.6 Extend the prebuild's review summary line in `lib/build-content.mjs`
      to print all four counts every build, so the number to watch — unbound,
      which can only fall — is on the screen. Implements **C8** (the prebuild
      half).
      Verify: `npm run build` prints a line carrying all four counts; a fixture
      build with a deliberately edited approved piece shows `mismatched 1`.
- [x] 1.7 Leave `entryReviewGate()` reading the verdict alone, and pin that with
      a test rather than a comment: a mismatched piece keeps exactly the
      indexability its verdict alone would give it. Implements **C13**.
      Verify: `lib/reviews.test.mjs` — an approved entry whose body is edited
      after approval still returns true from `hasApprovedReview`, and the
      rendered page's robots meta is byte-identical to the unedited case.
- [x] 1.8 In `lib/reviews.mjs`, order multiple records naming one piece by a
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

- [x] 2.1 In `lib/schema.mjs`, declare the classification: exported
      `PROSE_FIELDS` and `NON_PROSE_FIELDS` giving, per content type, the field
      paths of every string-valued field (the table in `design.md` D5 is the
      proposed split), plus an `assertFieldsClassified()` that walks each schema's
      string-valued fields and throws naming any field in neither list. Call it
      from the content build step so it runs every build. Implements **C20,
      C21**.
      Verify: `lib/schema.test.mjs` — the assertion passes on today's six
      schemas; a fixture schema with an added unclassified string field makes it
      throw naming that field; a field listed in both lists also throws.
- [x] 2.2 In `lib/currency.mjs`, add `findFrontMatterLiterals(data, paths)`
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
- [x] 2.3 Add the coverage counts to the content build step's summary: per
      content type, how many documents had at least one author-prose field
      scanned and how many had none. Implements **C24**.
      Verify: `npm run build` prints one line per content type carrying both
      numbers; a test over a fixture corpus asserts the split for a type where it
      is known by construction (a fixture with two scannable and three
      fully-exempt documents reports 2 and 3).

**Measured 2026-08-29, after sections 1 and 2 landed** — measurements, not
expectations, each taken by running the named command on this tree:

- **Review binding**, `node scripts/verify-launch.mjs --no-build` and the
  prebuild's own line, over all **119** reviewable pieces: `recorded 0,
  mismatched 0, unbound 119, missing 0`. Every one of the 129 records predates
  the `reviewed:` key, so every piece is **unbound**, and the launch check
  passes — *"14 check(s) passed … The launch minimums are met."* `unbound` is
  the number to watch; it can only fall.
- **A mismatch really fails**, measured rather than reasoned: `verify-launch`
  run against `lib/fixtures/review-states/` with a throwaway data dir reports
  `recorded 1, mismatched 1, unbound 5, missing 0`, names the piece and its
  record under `REVIEWED THEN CHANGED`, and **exits 1**. The five unbound
  pieces contribute nothing to the failure.
- **Multi-record binding** is a no-op on today's corpus: measured before the
  change, **0** of 119 pieces had more than one candidate record, and 129/129
  records carry `job:` with 128/129 also carrying `date:` — so the supersede
  rule has recency to read from wherever it is ever needed.
- **Volatile-literal coverage**, per type, from the prebuild's own line:
  `delta 27 scanned / 0 none`, `learn 10 / 0`, `entry 0 / 495`, `post 0 / 5`,
  `tool 0 / 35`, `tutorial 0 / 4`. The check was **vacuous on 23 of 29 deltas**;
  every delta's `capability` is now scanned. The zeros are the date-anchor
  exemption working exactly as design D5 predicted — after it, the fields
  actually scanned are `delta.capability` and `learn.outcome`, and no other.
- **Nothing correct was newly warned about**: front-matter currency warnings on
  the live corpus = **0**, body warnings unchanged at 5. The four files the
  originating reviewer report flagged stay clean, which is the correction
  `addictedtoai-48r` records against its own premise.
- **The classification is exhaustive today**: `classificationProblems()` returns
  `[]` over all six schemas. It caught `facts[].corroborates` as unclassified
  the moment section 3 added it — the mechanism firing on its first real case.

## 3. Compare a feed-bound fact against a cited one (specs/wiki + specs/pulse, `addictedtoai-473`)

- [x] 3.1 In `lib/schema.mjs`, add an optional `corroborates` field to both fact
      variants, and a build failure — naming the entry and the field — when its
      value names no fact on that entry or names the declaring fact itself.
      Change no rendering path. Implements **C25, C26**.
      Verify: `lib/schema.test.mjs` and `lib/facts.test.mjs` — a fixture entry
      with a valid declared pair builds, and its rendered fact block is
      byte-identical to the same entry with the key removed; a fixture naming a
      field the entry does not declare fails the build naming entry and field; a
      self-referencing declaration fails.
- [x] 3.2 Add `pulse/lib/corroboration.mjs`: resolve the feed side from the
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
- [x] 3.3 Emit the finding into the derived queue as a `corroboration` item
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

      **Measured 2026-08-29** (section 3 implemented; sections 1, 2, 4 were not
      touched by this pass):
      - `node --test pulse/tests/corroboration.test.mjs` — 17 pass, 0 fail.
      - `node --test pulse/tests/queue.test.mjs` — 12 pass, 0 fail, including
        the four new cases: one item carrying entry, both fields, both values,
        the feed's registry id and the cited `source_url`; the entry file and
        the snapshot file byte-identical across a run; two consecutive runs
        byte-identical; agreement emptying the item; and a vanished row
        producing no corroboration item.
      - `node --test lib/schema.test.mjs` — 17 pass, 0 fail;
        `node --test lib/facts.test.mjs` — 17 pass, 0 fail (the byte-identical
        render assertion for C26).
      - `npm run build` was NOT run: other agents share one build lock and
        `addictedtoai-6s7` makes concurrent builds fail confusingly. Substituted
        the same `lib/` validation over the real corpus — 495 entries, 27
        deltas, 10 learn, 4 tutorials, 5 posts, 643 aliases, **0 errors, 0
        warnings** — which measures "the schema change fails no build" but does
        not measure the export. The build gate still needs running once for 3.3.

      **One choice the spec left open, made here and recorded:** the queue rank
      for a `corroboration` item. Every queue item needs one (`item()` defaults
      an unknown reason to rank 0, which would bury it below everything and
      effectively never be selected). Set to **68** in `pulse/lib/queue.mjs`:
      above every timer in the table (`overdue-fact-fast` 65,
      `listing-verification-due` 60) because a measured contradiction between
      two sources is stronger evidence than an elapsed interval, and below every
      confirmed breakage (`tutorial-demoted` 70, `reference-drift` 72) because
      nothing on the page is yet wrong to a reader.

## 4. The undisputed floor of the three open loop gaps (specs/loop)

- [x] 4.1 Audit the runtime-refusal requirement clause by clause against
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

      **The audit, run 2026-08-29.** Every case named below is in
      `loop/tests/runner-health.test.mjs`. "Before" is the state this pass found;
      "after" names what now asserts it.

      | Clause | Before | Case that asserts it now |
      |---|---|---|
      | C35 a no-output run is evidence about the runner, carried as a ledger signal | asserted | `a run that produces nothing at all is still \`interrupted\`, and says so on the ledger` (asserts `line.signal`), with the negative in `a run that produced real work carries no no-output signal, however it ended` and `detection does not depend on a declared pattern` |
      | C36 refuse after three, for the `author` **and `reviewer`** roles | **author half asserted; reviewer half neither asserted nor implemented** | author: `a dead runner is refused rather than resumed forever`; reviewer: **new** `C36 the refusal covers the reviewer role, not only the author role` (task 4.1 fix, below) |
      | C37 applied before invoking **and before resuming** | selector half asserted; resume half asserted only incidentally — the four-run case never checked that a resumption was *available* at the moment of refusal, so a refusal beating an empty queue would have satisfied it | selector: `the selector refuses a dead runner too, before any candidate is considered`; resume: **new** `C37 the refusal preempts a resumption that was genuinely available` |
      | C38 names the cause and the exact clearing command | asserted | `a dead runner is refused rather than resumed forever`, `runner-health.test.mjs:109` |
      | C39 one productive run clears the streak | asserted | `one run that produces anything clears the streak` |
      | C40 non-invocation lines neither count toward the streak nor end it | asserted | `the 14-day abandon sweep does not re-arm the runner it just swept`, and `refusing a runner does not stop the 14-day abandon sweep` |
      | C41 refusal writes no `HOLD.md` | **not asserted anywhere** | task 4.2, below |

      **The audit's substantive finding, measured rather than reasoned.** C36
      says the loop refuses the runner "for the `author` and `reviewer` roles".
      Only the author-role pick was gated. Measured on a throwaway repository
      with a healthy author and a reviewer holding a three-run no-output streak:
      the loop selected a job, spent the author's whole run producing a diff,
      invoked the dead reviewer, received no verdict record and failed the job at
      `no-record` — every one of those minutes buying work that could not merge,
      because nothing merges without a review. `loop/run.mjs` now applies the
      existing `runnerHealthGate` to both role picks at the same point, before any
      executor is invoked and after the abandon sweep, and the refusal names which
      role it refused.

      **Reported, not fixed — a residual limitation of C36.** A ledger line's
      `runner` field records the *author* runner, so `noOutputStreak` can only
      ever accumulate for a runner that has served as author. A runner used
      **only** as a reviewer therefore accrues no streak and can never reach the
      refusal, whatever this gate does. Closing that needs a no-output detection
      for reviewer invocations, which does not exist — a reviewer that produces
      nothing is caught as `no-record`, a different signal — and inventing one is
      new mechanism, not this change's undisputed floor. Filed as
      `addictedtoai-g8a`, discovered-from `addictedtoai-pfv`.
- [x] 4.2 Add the one assertion the audit finds missing, measured rather than
      assumed: nothing anywhere in `loop/tests/` asserts that refusing a runner
      writes **no** `HOLD.md`, which is the clause that keeps D7 open — without
      it, adopting a fifth breaker later would silently satisfy the old test
      suite. Implements **C41**.
      Verify: `loop/tests/runner-health.test.mjs` — after three no-output runs on
      the one configured runner in a throwaway repository, no `HOLD.md` exists at
      its root and the run's own log says the runner was refused.

      **Done 2026-08-29** as `C41 refusing a runner writes no HOLD.md — a refusal
      is not a halt`. It checks the absence after each of the three streak-building
      runs *and* after the refusing run, asserts the log carries
      `REFUSED [runner:produced-nothing]`, and asserts the next run still starts
      rather than finding a hold left behind.

      **Proved by mutation, because a negative assertion passes on a tree that
      never had the behaviour.** Making the refusal write `HOLD.md` — one line,
      the shape D7's Option B would take — turns this test red with the message
      naming D7. Reverted; the suite is green with the mutation removed. That is
      the whole point of the assertion: it goes red the moment a fifth breaker is
      adopted without amending the spec, which is exactly when the clause stops
      being true.
- [x] 4.3 In `loop/lib/budget.mjs` and the selector's refusal path, carry
      `category_mm`, `denominator` and `denominator_origin` on every ceiling and
      floor refusal, print all three, and state the substitution explicitly
      whenever the denominator is not the tier's observed rolling total.
      Implements **C42, C43** (`addictedtoai-tr8`, settled half — it does not
      choose the denominator; D8 does).
      Verify: `loop/tests/budget.test.mjs` — a refusal on a ledger below the
      warm-up names the substituted denominator, its origin, and says it was
      substituted; a refusal on a ledger above it names the observed rolling
      total as the origin; both carry the category's MM.

      **Done 2026-08-29.** `refusalArithmetic()` in `loop/lib/budget.mjs` returns
      `category_mm`, `denominator_mm`, `denominator_substituted` and
      `denominator_origin`; both `budgetGate()` (ceilings) and `applyUpkeepFloor()`
      (the floor) spread it onto their refusal and append one sentence stating the
      numerator, the denominator and the origin, so it is printed wherever `reason`
      is printed. `loop/lib/select.mjs` now spreads the gate result instead of
      copying three named fields, which is how a recorded value comes to exist
      nowhere anyone reads it. `largestCapMinutes(cfg)` was extracted from
      `warmUpMm()` so the origin string can name the same number the warm-up is
      derived from rather than a second copy of it.

      Four new cases in `loop/tests/budget.test.mjs`, **each measured red before
      the source change and green after**: `C42 a ceiling refusal carries and
      prints its numerator, denominator and origin` (450 ÷ 1000, origin =
      observed); `C43 a substituted denominator announces itself, names what it
      replaced, and says why` (60 ÷ 600, `SUBSTITUTED`, naming the 60 MM observed
      total it replaced and the `100 / 10% tightest ceiling × 60-minute largest
      per-type cap` derivation); `C42 the upkeep floor refusal states its
      arithmetic too, and never claims a substitution` (the floor reads the
      observed total at n=1 as well); `C42 the arithmetic survives the selector`
      (the fields are still on the object `formatRefusals` prints, which is the
      only place an operator sees them). The 13 pre-existing cases in the file
      passed before and after — the added sentence extends each refusal rather
      than rewording it.

      **It decides nothing about D8.** Which denominator is correct is untouched;
      the ceiling still reads `max(observed, warm-up)` and the floor still reads
      the observed total. What changed is that the reading now announces itself.
- [x] 4.4 In `loop/lib/ledger.mjs`, record a job's model-minutes broken down by
      invocation phase — `author`, `revision`, and each `review` pass — so the
      job total is the sum of recorded measurements. Implements **C44**
      (`addictedtoai-o5t`, settled half).
      Verify: `loop/tests/review.test.mjs` — a job driven through an author run,
      one revision and two review passes writes four phase entries, and their sum
      equals the line's `mm`; a job with one invocation writes one.

      **Already implemented, verified rather than rebuilt.** The per-phase record
      landed under `addictedtoai-59s` before this change: `loop/run.mjs` records a
      `{role, runner, mm, killed, code, outcome}` entry per invocation and
      `loop/lib/ledger.mjs` writes it as the optional additive `phases` key, with
      `mm` left as the job total that `budget.mjs` sums. The four-phase half is
      asserted by `59s the ledger records model-minutes PER INVOCATION`.

      **The half that was missing** — "a job with one invocation writes one" — is
      new: `C44 a job that makes one invocation records one phase, and it is the
      whole total` in `loop/tests/review.test.mjs`, driven through a real
      `blocked:` outcome, which ends a job after the author run with no review and
      no revision. It catches a `phases` array padded with roles the loop did not
      invoke, which the four-phase case cannot.

      **Proved by mutation**, since the mechanism predates the task and the new
      assertion is green on arrival: suppressing the `phases` write in
      `makeLedgerLine` turns both `C44` and `59s` red. Reverted.
- [x] 4.5 In `loop/lib/brief.mjs` and `runShapeSection()` in
      `loop/lib/review.mjs`, state the cap as this invocation's limit, state the
      job's total spend so far and how many invocations have already run, and
      remove any wording that presents the cap as the job's budget. Implements
      **C45, C46, C47**.
      Verify: a test asserts that the assembled author brief and the assembled
      reviewer brief each contain the per-invocation phrasing, a running-total
      figure and an invocation count; and that neither matches a regex for the
      budget-implying phrasings being removed (a golden list of the exact strings
      replaced, so the assertion cannot pass by the phrase merely moving).

      **Done 2026-08-29.** `invocationAccounting({capMinutes, mmSoFar,
      invocations})` in `loop/lib/brief.mjs` is the one place the three figures are
      worded, and `assembleBrief()` uses it in place of the bare cap bullet;
      `runShapeSection()` in `loop/lib/review.mjs` states the same three for the
      reviewer. The golden list, asserted **absent** from every brief:
      `**Wall-clock cap**:` and `under a **wall-clock cap of` — each pattern
      written so its replacement cannot match it, so the assertion cannot pass by
      the phrase merely moving.

      **Two briefs the task did not name had to be fixed too, because C46 says
      *every* brief the loop assembles.** The revision brief is the author brief
      plus the findings, and the resumed brief is the *committed* brief plus a
      preamble — both would have restated figures frozen before anything ran,
      telling the third invocation of a job that the job had spent nothing. That
      is the precise misreading `addictedtoai-o5t` reported, arriving by a second
      road. `loop/run.mjs` now appends the current accounting to the revision
      brief and `resumeBrief()` takes it as an argument, each saying plainly that
      it supersedes the stale figures it sits beside. `jobSpendSoFar()` in
      `loop/lib/ledger.mjs` measures the prior spend for a resumed job from its
      earlier ledger lines; where a line predates `phases` it contributes 1
      invocation if it recorded minutes and 0 if it did not, which is a floor on
      the count and never a guess — the brief says "recorded on the ledger" for
      that reason.

      Three new cases in `loop/tests/review.test.mjs`, **all three measured red
      under a mutation restoring the two old phrasings, green with it reverted**:
      the author brief case (via `--dry-run`, which returns the assembled brief),
      the reviewer brief case (which also asserts the count is a measurement, not
      a constant — by the delta review of a revised job it reads 3, and the ledger
      line carries 4 phases), and the revision-brief case. Two pre-existing
      assertions were updated to the new wording, not deleted:
      `review.test.mjs`'s `/per-invocation wall-clock cap of\s+60 minutes/` (the
      old regex failed only on the new line wrap) and `portability.test.mjs`'s
      brief-shape check, which now also asserts the running total is present.

      **It decides nothing about D9.** No total budget, no derived per-invocation
      cap, no abandon path. The 480-minute worst case is intact; it is now stated
      instead of implied.

## 5. Integrated verification

- [x] 5.1 Run the gates serially, never concurrently: `npm test`, then
      `npm run build`, then `node scripts/verify-launch.mjs`, then
      `openspec validate harden-seed-wave-guardrails --type change --strict
      --no-interactive`. Record the measured review-state counts
      (recorded/mismatched/unbound/missing) and the per-type coverage counts in
      this file beside this task, as measurements with the date — not as
      expectations.

      **Measured 2026-08-29, after sections 4 and 5.** Serially, one at a time,
      nothing else running (`addictedtoai-6s7`):

      - `npm test` — **410 pass, 0 fail** (92s). The loop's own directory is 112
        of those, also run alone: 112 pass, 0 fail.
      - `npm run build` — **exit 0**, full static export.
      - `node scripts/verify-launch.mjs` — **15 check(s) passed, "The launch
        minimums are met."** Run WITHOUT `--no-build`, so the build row is a
        measurement (`PASS npm run build exit 0 in 23s`) rather than a SKIP.
      - `openspec validate harden-seed-wave-guardrails --type change --strict
        --no-interactive` — **exit 0**, "Change 'harden-seed-wave-guardrails' is
        valid".

      **Review-state counts, from the prebuild's own line and from
      verify-launch, over all 119 reviewable pieces**: `recorded 0, mismatched
      0, unbound 119, missing 0`. Unchanged by sections 4 and 5, which is
      correct — nothing in them writes a review record. 129 records, 10 claimed
      by no piece.

      **Per-type volatile-literal coverage, from the prebuild's own line**:
      `delta 27 scanned / 0 none`, `learn 10 / 0`, `entry 0 / 495`, `post 0 /
      5`, `tool 0 / 35`, `tutorial 0 / 4`. Also unchanged, and for the same
      reason.
- [x] 5.2 Re-run the traceability audit in section 6 against the implemented
      tree: every normative clause in this change's four spec deltas maps to a
      task in this file and to a check that measures it, and the count of
      clauses equals the count of table rows. A clause whose check exists only as
      a sentence in this file is not measured; name the test file and the case.

      **Re-audited 2026-08-29, by measuring the table rather than reading it.**
      A script parsed the rows out of this file and checked each claim against
      the tree: **47 rows, no duplicate clause ids, no gaps in C1..C47**, every
      `*.test.mjs` the table names exists at the path it resolves to, and every
      test case named for a section-4 clause is present **verbatim** in the file
      the table names it in — 19 named cases across C35–C47, **0 not found**.

      **The clause count still equals the row count, because this pass added no
      normative text.** Sections 4 and 5 implement clauses that were already in
      the four spec deltas; not one `SHALL` was written, so the deltas are
      byte-unchanged and 47 remains 47. That is the trap this section exists for
      — a round repairing untasked clauses routinely writes a fresh one while
      writing the repair — and the way it was avoided here is that every gap the
      audit found was closed with code and a test, never with a new requirement.

      **Rows updated, not invented.** C35–C47 previously named their checks in
      prose ("third-empty-run case", "brief assertion"). Each now names the test
      file and the exact case title, which is what makes the row falsifiable by
      the script above. C38's line reference moved 107 → 109 as cases were added
      above it.
- [x] 5.3 Update `addictedtoai-pfv`, `-tr8` and `-o5t` in beads with a pointer to
      `design.md` D7, D8 and D9 and the recommendation each carries, and note on
      each that only its settled floor was implemented. Do not implement a draft
      block. Close `addictedtoai-zlq`, `-48r` and `-473`'s machinery half against
      sections 1–3.

      **Verified 2026-08-29 rather than redone.** All three of `-pfv`, `-tr8` and
      `-o5t` already carry the note: each opens "UNDISPUTED FLOOR DRAFTED … THE
      DECISION IS STILL YOURS", states what was written as settled, names its
      open decision as D7 / D8 / D9 with the recommendation each carries, and
      says the draft text sits behind a `DRAFT — NOT ADOPTED` fence in
      `design.md` so adopting it is a paste. Nothing needed rewriting; the notes
      hold as written. **No draft block was implemented — see the statement at
      the end of this section.**

      `addictedtoai-zlq` and `-48r` are **already CLOSED** against sections 1–2,
      each with a close reason naming the modules and the measurements.

      `addictedtoai-473` is **deliberately left IN_PROGRESS**, with a note
      appended recording that its machinery half (3.1–3.3) is complete and that
      its content half is not. Measured, not assumed: on
      `content/wiki/model/deepseek-deepseek-v4-flash-0731.md`, line 55 still
      carries the feed-bound `284B total …` and line 61 the cited `304B params`,
      and **neither declares `corroborates:`** — so the very pair that motivated
      the mechanism is not yet declared to it, and no queue item can be raised
      for it. Closing the issue would claim a data defect was fixed when only the
      apparatus for finding it was built.

## 7. What was deliberately left to the maintainer

Sections 4 and 5 implemented the **undisputed floor** of `addictedtoai-pfv`,
`-tr8` and `-o5t` and nothing else. Nothing behind a `DRAFT — NOT ADOPTED` fence
in `design.md` was implemented, and no fenced text was moved into a spec delta:

- **D7 (a fifth breaker)** — not adopted. `HOLD.md` is still written by exactly
  four breakers. The floor built instead is the assertion that refusing a runner
  writes **no** `HOLD.md` (C41), which is the clause that keeps the question
  open: it goes red the moment Option B is adopted without amending the spec.
- **D8 (the low-n ceiling denominator)** — not adopted. Ceilings still read
  `max(observed, warm-up)` and the floor still reads the observed total; not one
  number changed. What changed is that a refusal now names its numerator, its
  denominator and where that denominator came from, and announces a substitution
  as a substitution.
- **D9 (a bound on a job's total spend)** — not adopted. No job-total budget, no
  cap derived from a remainder, no minimum-invocation floor, no abandon path, and
  **no change to `data/config.json`**, which remains a reserved path this change
  does not touch. The 480-minute worst case is intact; every brief now states it
  instead of implying otherwise.

One thing found and **reported rather than fixed**: `addictedtoai-g8a`, that a
runner used only as a reviewer can never accumulate a no-output streak, because
a ledger line attributes its `runner` to the author. Closing it needs a
no-output detection for reviewer invocations, which does not exist — new
mechanism, not this change's floor.

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
| C35 | loop: runner refusal | a no-output run is evidence about the runner | 4.1 | `runner-health.test.mjs` — `a run that produces nothing at all is still \`interrupted\`, and says so on the ledger` |
| C36 | loop: runner refusal | refuse after three, on conformance's terms, for both roles | 4.1 | `runner-health.test.mjs` — `a dead runner is refused rather than resumed forever` (author) + `C36 the refusal covers the reviewer role, not only the author role` |
| C37 | loop: runner refusal | refuse before invoking and before resuming | 4.1 | `runner-health.test.mjs` — `the selector refuses a dead runner too, before any candidate is considered` + `C37 the refusal preempts a resumption that was genuinely available` |
| C38 | loop: runner refusal | the refusal names cause and clearing command | 4.1 | `runner-health.test.mjs:109`, already asserted |
| C39 | loop: runner refusal | one productive run clears the streak | 4.1 | `runner-health.test.mjs` — `one run that produces anything clears the streak` |
| C40 | loop: runner refusal | non-invocation lines neither count nor end it | 4.1 | `runner-health.test.mjs` — `the 14-day abandon sweep does not re-arm the runner it just swept` |
| C41 | loop: runner refusal | refusal writes no `HOLD.md` | 4.2 | `runner-health.test.mjs` — `C41 refusing a runner writes no HOLD.md — a refusal is not a halt` |
| C42 | loop: budget refusal | record and print MM, denominator, origin | 4.3 | `budget.test.mjs` — `C42 a ceiling refusal carries and prints its numerator, denominator and origin`, `C42 the upkeep floor refusal states its arithmetic too`, `C42 the arithmetic survives the selector` |
| C43 | loop: budget refusal | a substituted denominator announces itself | 4.3 | `budget.test.mjs` — `C43 a substituted denominator announces itself, names what it replaced, and says why` |
| C44 | loop: job total | ledger records per-phase model-minutes | 4.4 | `review.test.mjs` — `59s the ledger records model-minutes PER INVOCATION` (four phases, sum = `mm`) + `C44 a job that makes one invocation records one phase` |
| C45 | loop: job total | the brief states the cap as per-invocation | 4.5 | `review.test.mjs` — `C45/C46/C47 the author brief states the cap per invocation` + `C45/C46/C47 the reviewer brief does the same` |
| C46 | loop: job total | the brief states total so far and invocation count | 4.5 | the two cases above + `C46 the revision brief supersedes the stale figures it inherits` |
| C47 | loop: job total | no brief calls the cap a job budget | 4.5 | `BUDGET_IMPLYING_PHRASES` in `review.test.mjs`, asserted absent from the author, reviewer and revision briefs |
