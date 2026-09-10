# RESULT1 — wisdom item 5 (round 1): independence claimed without lineage

Worktree `D:/addictedtoai-worktrees/item5-lineage`, branch `wisdom/item5-lineage`
based at `03d1f87` (not rebased). Dates below are machine-local; today is
2026-09-10. Direct runner total: `node --test` on
`loop/tests/lineage.test.mjs` → tests 10, pass 10, fail 0 (read from the
runner's own `ℹ` summary lines). The whole-suite total is not taken here — no
`node_modules` in this worktree, and the brief reserves that total to the
merge target.

## 1. Baseline and post-mutation colour of every assertion

Baseline (pristine tree, first run): 10 tests, 10 pass, 0 fail. Each arm names
the property it enforces:

- Arm 1 (constructed two-method-names): same helper over one input under
  `count-tokens-v1` vs `count-tokens-v2` — second claim DEPENDENT,
  `consistencyOf` the first, both method names in the reason, both records
  present. PASS.
- Arm 2 (wild digest pair): `03e2207` REFUSED with code
  `digest-unresolvable`, reason quoting the re-run output; `9c272f4` accepted
  and normalised to `9c272f42…f029`; full form accepted; refused shape leaves
  no record. PASS.
- Arm 2b (validity reasons): explicitly-empty resolver refuses under
  `lineage-resolver-missing` (never the unresolvable code — never one rule
  with two compliant readings); malformed form refuses on its own terms.
  PASS.
- Arm 3 (refuse-and-record): matching-lineage independent-marked claim returns
  `{ independent: false, consistencyOf: <first id> }`; both records present;
  the earlier record byte-unchanged. PASS.
- Arm 4 (constructed Luna-47 mirror): two claims both reading value 47 over
  different producers and different digests classify INDEPENDENT — the check
  judges lineage, never value. PASS.
- Arm 5 (5b twin, both directions): shared instrument → `agreement` (never
  corroboration); different instruments → `corroboration`; non-boolean
  `sharedInstrument` throws. PASS.
- Arm 6 (brief seam): constants equal the brief's sentences; the section
  carries both verbatim; `review.mjs` imports the section builder and the
  `assembleReviewBrief` template interpolates it. PASS.
- Arm 7 (mutation A): PASS — see post-mutation colours below.
- Arm 8 (mutation B): PASS — see below.
- Arm 9 (liveness): ledger line without lineage refuses at classify time with
  `lineage-missing`; the same writer with a lineage key judges cleanly; a
  lineless line keeps the exact pinned key shape. PASS.

Post-mutation colours (each applied, observed under a cache-busting
re-import, reverted, revert verified byte-identical by sha256, behaviour
re-asserted after revert):

- Mutation A — `recordMeasurement` neutered to store `producer: undefined`:
  the arm-1 pair goes green as `independent: true`, and that green is the
  defect (a second computation over the same bytes under a new method name
  reading as corroboration — the machine form of the class). Revert hash
  matches; post-revert pair classifies dependent again.
- Mutation B — disposition branch weakened to return `corroboration` for a
  shared instrument: the twin's agreement direction goes green as
  corroboration, and that green is the defect (the reader form of the class).
  Revert hash matches; post-revert shared pair records agreement again.

One line on mutation discipline, per the pattern: both mutations touch only
this round's own new file `loop/lib/lineage.mjs`, which no other file's tests
rewrite, so no lock was held; the lock module
(`loop/tests/lib-mutate.mjs`) was read first and its pattern (read, mutate,
observe fresh, revert, hash-compare) copied without editing it.

## 2. Which half of each control is wild and which is constructed

- `03e2207` / `9c272f4`: WILD and banked. Read the banking file at
  `openspec/changes/two-desks-work-orders-and-trains/evidence/wisdom-5-6/03e2207-banked.md`,
  re-ran its commands in `D:/AddictedtoAI` on 2026-09-10, quoting outputs:
  `git cat-file -t 9c272f4` → `blob`;
  `git cat-file -t 03e2207` → `fatal: Not a valid object name 03e2207`;
  additionally `git rev-parse --verify 9c272f42…f029` → itself and
  `git cat-file -t` on the full id → `blob`. Nothing copied: the test's
  resolver stub mirrors these outputs, and the note lines were read, never
  copied into fixtures.
- Luna's 47: WILD incident, CONSTRUCTED mirror. The incident
  (`wisdom/timeline-notes/timeline-note-03.md` lines 92 and 114 — the struck
  "independent confirmation" of 47 over a different quantity) cannot be
  re-executed — its bytes are gone and its value pair survives only as prose —
  so arm 4 builds a constructed same-value/different-digest pair and declares
  it as such.
- Shared instrument (3/112 vs 10/111, comparison
  corroboration-not-agreement): WILD citations
  (`timeline-note-07.md:225`, `timeline-note-08.md:206`), CONSTRUCTED twin
  detail strings in arm 5, declared. A wild pair cannot be imported as a
  fixture: the notes hold prose about derivations, not runnable derivations.
- Two method names: CONSTRUCTED, stated. No wild pair of this exact shape
  (one helper, one input, two method names) exists on record — the banking
  caveat says exactly this about future instrument tests — which is why it is
  built here, with both names asserted in the reason.

## 3. The lineage comment, quoted from the file

From `loop/lib/lineage.mjs`, header comment, verbatim:

> The class this round exists for is one thing with two forms: an independence
> claim with no lineage behind it. In the machine form a measurement carries no
> producer, input digest or method, so a second computation over the same bytes
> under a new method name reads as corroboration. In the reader form two
> findings sharing one instrument are called corroboration instead of
> agreement.
>
> What makes a digest valid, with the reason named per digest. A digest is
> valid when it has the form of bytes (short or full hex, 4-40 chars) AND a
> resolver is stated AND that resolver resolves it. Form without bytes refuses:
> `03e2207` is well-formed hex that resolves to nothing (banked: `git
> cat-file -t 03e2207` answers `fatal: Not a valid object name 03e2207`), so a
> claim carrying it is refused with code `digest-unresolvable`. Bytes without a
> stated resolver refuse for the different reason: a digest nobody says how to
> resolve is a path masquerading as a digest, refused with code
> `lineage-resolver-missing` even if the bytes exist somewhere. Never one rule
> with two compliant readings: the codes and the reasons differ because the
> defects differ. The brief words the two valid shapes as an OR (a resolvable
> object id, short or full, via the stated resolver, OR a 40-hex content hash
> with a resolver check); the two wordings overlap, since every full object id
> IS 40-hex, so this module implements the single check both wordings end at —
> form plus stated resolver plus resolution — and keeps the per-digest refusal
> reasons the brief requires.
>
> Why the downgrade records instead of deleting. `classifyClaim` never throws
> away the earlier record: a second claim over the same (producer, digest)
> pair returns `{ independent: false, consistencyOf }` AND is itself appended
> to the store, so both records stay present. Consistency is information — the
> second run reproduced the first — and deleting it destroys the reproduction
> record. Refused-as-independent plus recorded-as-consistency is the honest
> form; silent acceptance invents corroboration and silent deletion invents a
> single clean run, and those are the two defects.
>
> Why the reader half cannot live in the linter. Whether two derivations share
> an instrument — same helper, same fixture, same derivation path — is a
> judgment about derivation paths, and the one measured attempt at mechanising
> it false-fired on legitimate shared fixtures: the 3/112-vs-10/111
> agreement-on-zero pair (timeline-note-07) shares fields and patterns yet
> agrees only on zero for different reasons. A regex cannot see that, so this
> half is a reader question plus a disposition rule, committed below as prompt
> text and wired into `assembleReviewBrief`, not a pattern.
>
> Why strictness here cannot false-fire on reworded methods the way a
> name-blocklist would. The check compares (producer, digest) pairs and never
> method-name strings: renaming a method changes nothing (same pair, still
> consistency) and copying a pipeline under a fresh producer changes everything
> (different pair, independent). The constructed two-method-names arm proves
> the first half; the Luna-47 mirror proves the check judges lineage, never
> value.
>
> Source snapshot (the README's fourth field) is narrowed out here with the
> reason stated: lineage answers which computation ran over which bytes, which
> is enough to judge independence and to re-check the bytes; which source the
> bytes came from is provenance, and that half belongs to item 6.

## 4. The sweep — class *independence claimed without lineage*, every site dispositioned

Method: every `appendLedger`/`makeLedgerLine`/record-writing call site found
by searching `loop/*.mjs` and `loop/lib/*.mjs` (not assumed — the telemetry
call sites live in `loop/run.mjs` at three `appendLedger` sites, while
`ledger.mjs` only defines the functions; verified, not assumed), plus every
prompt-assembly seam. The stop rule: the sweep ends when every found site has
a disposition. No site is declined; nothing below is an unstated scope
decision.

BIND (carries lineage / carries the question after this round):

- `loop/lib/ledger.mjs` `makeLedgerLine`/`appendLedger` — BIND. New optional
  additive `lineage` key (producer, digest, method, resolver); `LEDGER_FIELDS`
  deliberately not extended; the writer validates nothing (judging is
  `lineage.mjs`'s work — a recording ledger that refused entries would be a
  second judge of the same claim).
- `loop/run.mjs` `recordOutcome` (the ledger write carrying measured
  quantities: `mm` total, `phases`, `brief_chars`, `gate_seconds`,
  `authority_sha`) — BIND. Threads `job.lineage` additively; omitted when
  undefined, so lines without one keep their exact shape. No selector sets one
  today — stated, not hidden.
- `loop/lib/review.mjs` `assembleReviewBrief` (the review-brief assembly seam,
  `:531`) — BIND. Interpolates `corroborationSection()` after the checklist,
  so every sealed review carries the question and the disposition verbatim.
  Read, never retyped: the prompt text has one definition.

TRUE-BUT-UNTOUCHED (already carries what the round requires):

- `loop/lib/review.mjs` `writeRecordSubjects` (called from the merge path in
  `run.mjs`) — TRUE-BUT-UNTOUCHED. Already writes `subject:` plus `reviewed:`
  SHA-256 hashes of each reviewed file's surface: the review's own lineage of
  which bytes were judged. Nothing added.

DELETE (not a measurement, not a prompt seam — reason stated each):

- `loop/run.mjs` 14-day abandon sweep and budget-exhaustion abandon sweep —
  DELETE. Both write `mm: 0` with no invocation run: no measured quantity, no
  independence claim, nothing lineage could attach to.
- `loop/lib/exec.mjs` `runExecutor` `mm`/`ms` return — DELETE. Wall-clock
  duration of an invocation by the loop's own clock, not a computation over
  bytes; no digest applies. Its minutes reach the ledger through the bound
  `recordOutcome`.
- `loop/lib/gates.mjs` gate results (`durationMs`) and the `gate_seconds`
  map — DELETE. Gate-run durations, not byte-computations; they ride the bound
  ledger line.
- `loop/lib/gates.mjs` `writeBuildSuccessRecord` — DELETE. Copies the
  prebuild-produced status stamp; a copy, not a new measurement.
- `loop/lib/budget.mjs` shares/ceilings/warm-up arithmetic — DELETE. Derived
  percentages over ledger sums, rendered with their formula; claims no
  independence.
- `loop/lib/health.mjs` — DELETE. Pure read of the ledger; the file states
  nothing is stored.
- `loop/conformance.mjs` record writer (`data/conformance.json`) — DELETE.
  Verdict records (PASS/FAIL with evidence) from model-involved checks, not
  byte-computations.
- `loop/lib/review.mjs` `writeVerdictRecord` — DELETE. Judgment record, not
  measurement; the reader half governs it through the brief question, not
  through lineage fields.
- `loop/lib/proposals.mjs` `recordDiscardedAttempt` and the drop/reject
  writers — DELETE. Curation records stamped onto proposals, not measurements.
- `loop/lib/carry.mjs` carry-file writer — DELETE. Finding carry-forwards,
  not measurements.
- `loop/lib/directives.mjs` done-marker writer — DELETE. Maintainer-directive
  bookkeeping, not a measurement.
- `loop/lib/breakers.mjs` `writeHold` — DELETE. Halt record, not a
  measurement.
- `loop/run.mjs` `.job/brief.md` and `.job/source.json` writers — DELETE. Job
  scaffolding, removed from the branch before merge and never reaching main;
  the brief is prose and `source.json` records where the job came from rather
  than measuring anything.
- `loop/lib/result.mjs` RESULT-protocol reader — DELETE. Parses the
  executor's self-report over the one channel the loop explicitly does not
  trust; not a machine measurement.
- `loop/lib/runners.mjs` `conformanceHistory`, `loop/lib/queue.mjs`,
  `loop/lib/rederive.mjs`, `loop/lib/select.mjs`, `loop/lib/resume.mjs`,
  `loop/lib/specs.mjs`, `loop/lib/issues.mjs`, `loop/lib/verdict.mjs`,
  `loop/lib/surfaces.mjs`, `loop/lib/publish.mjs`, `loop/lib/config.mjs`,
  `loop/lib/dates.mjs`, `loop/lib/paths.mjs`, `loop/lib/git.mjs` — DELETE as
  readers, selectors, parsers, infrastructure or the transmit step; none writes
  a measurement. `exec.mjs` prompt/log writes and the conformance scratch
  seeds are transcripts and disposable scratch, likewise DELETE.
- `data/reviews/evidence/` contents — considered and out of scope: written by
  job executors (diffs), not by `loop/` code, so not a `loop/` writing site.
- `assembleBrief` (author) and `assembleRevisionBrief` — DELETE. Author and
  revision prompts, not reviews; the corroboration question is a reviewer's
  pair-judgment, and seating it in the author's brief would ask the author to
  pre-answer its own review.
- `conformanceBrief` — DELETE. Conformance executor prompt with its own four
  pass criteria; not a finding-pair review.
- `GROUND_RULES`, `gatesSection`, `runShapeSection` — DELETE. Shared rules
  and measurement-reporting fragments; they report what ran and what it cost,
  they ask nothing.
- `checklistFor` / `CHECKLISTS` — DELETE. Kind-indexed checklists; the
  corroboration question spans kinds (any pair of findings), so it lives in
  the shared section rather than in per-kind lists.
- `rejectionIndexText` — DELETE. The proposal duplicate-judgment half (slug
  identity), a different question from finding-pair corroboration.

Packet-E closure for this diff: the four exact-shape pins
(`breakers.test.mjs:172-178`, `issues.test.mjs:241-244`,
`portability.test.mjs:429-443`, `gate-transport-retry.test.mjs:878-882`) are
byte-identical in this diff — no wiring invalidated them, because no fixture
or production path carries a lineage key today and a line without one keeps
its exact shape. Proven by execution, not by reading: a probe importing the
edited `ledger.mjs` asserted the portability key order, the issues
`LEDGER_FIELDS` literal, the gate-transport three additive keys, the breakers
varies-set comparison, and the absent-when-undefined rule —
`E-CLOSURE-PROBE-OK`. The four pin files could not be executed here (no
`node_modules` in this worktree); their assertions were re-proven against the
edited module instead, and the whole-suite run on the merge target re-runs
them for real.

## 5. Item 6 follows with its own brief; beyond that sentence it is out of scope here.

## 6. What the brief got wrong

Two findings, both handled without widening scope:

- The digest-validity OR is not disjoint, and the brief demands "never one
  rule with two compliant readings" in the same passage. "A resolvable object
  id, short or full, via the stated resolver, OR a 40-hex content hash with a
  resolver check" reads as two paths, but every full object id IS 40-hex, so
  the two wordings overlap and a reader cannot tell which path a full id took.
  Implemented as the single check both wordings end at — form plus stated
  resolver plus resolution — with the per-digest refusal reasons the brief
  requires (`digest-unresolvable` for form-without-bytes like `03e2207`,
  `lineage-resolver-missing` for bytes-without-a-stated-resolver). The module
  comment states the collapse and the reason; no behaviour the brief's arms
  require changes.
- The pin citation `loop/tests/issues.test.mjs:241–243` is one line short:
  the `LEDGER_FIELDS` pin test (`occ0 (5c)`) spans lines 241–244. Trivial, but
  a wrong line range in a brief is how a later reader checks the wrong lines
  and reports back wrong.

Left out, plainly, and why (no silent narrowing):

- A live `assembleReviewBrief` import inside arm 6: impossible in this
  worktree, which carries no `node_modules`, while `review.mjs`'s chain
  requires registry packages through `proposals.mjs`/`verdict.mjs`. The arm
  reads the template and asserts the text — the brief's own words for it —
  and the full-suite run on the merge target executes the same assertions with
  the same file. Stated, not taken.
- The whole-suite total: the brief reserves it to the merge target; taking a
  partial-suite total here would be measuring a different suite.
- Lineage on the two abandon ledger writes: dispositioned DELETE (no
  measurement), not wired. A measurement that needed a file outside the nine
  listed Files never arose; had one, it would have come back as a scope
  decision with the file and the reason.
