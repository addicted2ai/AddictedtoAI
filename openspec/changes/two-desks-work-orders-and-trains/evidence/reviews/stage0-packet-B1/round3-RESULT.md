done

# Stage 0 packet B1 — round 3

Authority: the frozen `047e9bf` task/spec blobs. Merge base: `fbe1306`.
Third commit: `cef399d` (`stage0/b1-brief-diet`). The committed code changes
are limited to the permitted files `loop/lib/specs.mjs`, `loop/lib/brief.mjs`,
and `loop/tests/brief-excerpt-budget.test.mjs`; the permitted config file was
unchanged in this round. `RESULT.md` is intentionally uncommitted.

## Task 5 — only named requirements, with an empty Stage 0 subject list

- `loop/lib/specs.mjs:290-315` keeps the governing capabilities first, accepts
  explicit subject capabilities for the existing overload, and makes a pending
  delta candidate set empty when its constitution has no named requirement.
  The old positive-scoring fallback is gone.
- `loop/lib/brief.mjs:664` passes `subjects: []` directly. It does not derive a
  subject from `subjects`, `declared_subjects`, `raw`, `target`, or `id` on the
  job.
- The focused test `loop/tests/brief-excerpt-budget.test.mjs` passed `21/21`
  (`tests 21`, `pass 21`, `fail 0`). The relevant arms are `:201` (Stage 0
  job-field isolation), `:220` (zero-score pending section), and `:231`
  (positive pending section with no constitutional heading).
- Mutation evidence: rows 1, 2, 13, 14, 15, and 16 of the table below.

## Task 6 — one total allocation and the tight-cap floor

- `loop/lib/specs.mjs:194-216` emits an intact marker that names both the
  requirement heading and its source file; a partial floor keeps the marker.
- `loop/lib/specs.mjs:255` measures a constitution floor by its full content or
  its marker, whichever is the smaller representation.
- `loop/lib/specs.mjs:328-340` sums the floor minimums and throws an explicit
  configuration error with `marker shortfall=<n>` before allocating anything
  when the cap cannot hold all floor markers.
- `loop/lib/specs.mjs:352-360` reserves only later floor minimums and allocates
  the remaining content in floor order. No later content can displace an
  earlier floor.
- Amendments still run only after the constitution floor, at
  `loop/lib/specs.mjs:365-382`, under the same total `used` counter.
- `loop/tests/brief-excerpt-budget.test.mjs:334` checks the ordinary floor with
  three pending amendments; `:344` is the pinned tight-cap arm; `:359` is the
  loud-error arm. The focused test passed `21/21`.
- Mutation evidence: rows 3–12, 20, and 21 below.

## Task 7 — the measured ceiling

- `loop/lib/config.mjs:304` is `BRIEF_EXCERPT_MAX_CHARS = 24000`, retaining the
  dated fifth measurement and prior history.
- `loop/tests/brief-excerpt-budget.test.mjs:174-175` checks the constant, while
  the wired `assembleBrief` and binding-fixture arms check that the value is
  actually passed and bounds the assembled artifact.
- Focused result: `tests 21`, `pass 21`, `fail 0`.
- Restoring the ceiling to `88000` was mutation row 12 and produced
  `tests 21`, `pass 18`, `fail 3`; the failures named the ceiling assertion,
  the binding cut-marker assertion, and the bounded-guidance assertion.

## Task 8 — pinned corpus, opposite mutations, and source list

- `loop/tests/brief-excerpt-budget.test.mjs:59-129` constructs the pinned
  corpus for every capability in `JOB_TYPES`, the three-change allocation and
  ceiling corpora, and the tight-cap corpus. Pending files live under the
  synthetic `fixture-amendments` root, not the live archived-change directory
  shape. `ctx.pendingRoot` injects that root into the real source reader.
- `:244-266` compares whole heading sets without filtering unrelated or surplus
  headings; `:268-310` asserts the 30,000-character fixture bound and its
  opposite binding/surplus conditions.
- `:312-320` asserts that `excerptsFor(...).files` includes every constitution
  and pending source, including sources whose sections are not emitted.
- `:322-332` requires a constitution source and no cut for every capability used
  by every job type. The missing-`blog` mutation below made `post` fail.
- The alternate fixture source-root plumbing is exercised by both direct
  excerpt calls and `assembleBrief`; it leaves the production default unchanged.
- The focused result was `tests 21`, `pass 21`, `fail 0`. The independent
  change-directory check was also green: `tests 3`, `pass 3`, `fail 0`.

## Task 9 — truncation guidance

- `loop/lib/brief.mjs:720` now tells the executor that relevant material was
  “omitted or cut” and points to the complete files.
- `loop/tests/brief-excerpt-budget.test.mjs:368-378` verifies the wording on a
  bounded assembled brief; `:381-391` verifies that `truncated` is true while
  empty source chunks are not rendered.
- Focused result: `tests 21`, `pass 21`, `fail 0`.
- Reverting the wording was mutation row 17 and produced `tests 21`, `pass 20`,
  `fail 1`, with the bounded-guidance assertion red.

## The tight-cap behaviour

The pinned `tightCapCorpus` uses three 9,000-character constitution
requirements and `maxChars: 600`, so the live tree cannot make this state
vacuous.

1. Marker-only floor minimum: the reserve at `specs.mjs:352` uses the marker
   minimum from `floorMinimum`, never the full later requirement. The arm at
   test `:344` saw all three intact markers; replacing the reserve with later
   content made that same assertion red (`1` marker instead of `3`).
2. First-come priority: the output markers occur in `pulse`, `site`, `review`
   order, and the earlier `pulse` floor contains `PULSE_FIRST_CONTENT` before
   its marker. Reversing the allocation order made the first-content assertion
   red while the final rendered order stayed unchanged.
3. A floor whose full content does not fit is still represented: the same arm
   finds `CUT: requirement "pulse governing rule"`, `site governing rule`, and
   `review governing rule`. The later floors are markers, and the earlier floor
   takes the available content first; no floor is silently skipped. Making the
   floor use its complete text made the tight-cap arm red on both marker count
   and the excerpt bound.
4. Loud failure below the marker sum: test `:359` calls the same fixture with
   `maxChars: 1` and requires an exception matching
   `excerpt configuration error: marker shortfall=<positive number>; maxChars=1
   is below the ... constitution marker minimum for "pulse governing rule",
   "site governing rule", "review governing rule`. Removing the throw produced
   `Missing expected exception` with `tests 21`, `pass 20`, `fail 1`.

The valid tight-cap result has `ex.chars <= 600`; the invalid result fails
before rendering, rather than silently continuing or returning a truncated
constitution set.

## What the subjects parameter receives in Stage 0

`assembleBrief` passes exactly `subjects: []` at `loop/lib/brief.mjs:664`.
Consequently the production Stage 0 excerpt set is the governing type's named
constitution requirement and matching pending amendments, and nothing derived
from a job target, raw subject, id, or undeclared field. The explicit subject
normalizer and array/object overload remain on `excerptsFor` for callers that
actually declare subjects; test `:178` proves the path overload still maps an
explicit specification path to `site`, while test `:201` proves that job fields
do not feed it in Stage 0. No fallback remains in the caller.

## MUTATION TABLE

All mutation runs used:

    node --test D:\addictedtoai-worktrees\fleet6-stage0-B1\loop\tests\brief-excerpt-budget.test.mjs

Every run reported `tests 21`; exit 1 is the expected red mutation result, not
an inferred result. The final focused restoration was `tests 21`, `pass 21`,
`fail 0`. Hashes in the last column are before-mutation → after-restoration;
the identical values prove byte restoration.

Baseline hashes:

- `specs.mjs` (`S`): `106279FCA88E005223E3704BF4C36856E59F0C1657A5C57DE3C59ADC97B68FEF`
- `brief.mjs` (`B`): `B3B1EA731CBDFD31C1903C364B70CF18F9F41FA564EC3A435F6401EB994B45FE`
- `config.mjs` (`C`): `F54F4E28F1604A5DCD55FBED1DBC81191DCCA185D9B7AF6AC2B960D6ABC9303C`
- `brief-excerpt-budget.test.mjs` (`T`): `A23205BA8773E9655271ACF652EECDFD5F6DCD111B1313C7CCD2A42197EC00CC`

| # | Mutation applied | Actual red output | Restoration hash |
|---:|---|---|---|
| 1 | `specs.mjs:313` used the positive-scoring pending fallback when no constitutional heading existed | `pass 19`, `fail 2`: positive pending section emitted; empty-source truncation arm reported the wrong state | S → S |
| 2 | `specs.mjs:313` admitted the first non-preamble delta regardless of score | `pass 18`, `fail 3`: zero-score pending assertion, positive pending-only assertion, and truncation assertion | S → S |
| 3 | `specs.mjs:352` reserved later full requirement text instead of marker minimums | `pass 20`, `fail 1`: `a tight cap keeps every constitution marker in priority order`, actual 1 vs expected 3 | S → S |
| 4 | `specs.mjs:255` returned `section.text.length` as every floor minimum | `pass 17`, `fail 4`: old-default cut precondition, no-default wiring, tight-cap, and bounded-guidance arms | S → S |
| 5 | Removed the `marker shortfall` throw at `specs.mjs:330` | `pass 20`, `fail 1`: `a cap below the constitution marker minimum fails with its shortfall`, missing expected exception | S → S |
| 6 | Reversed the floor allocation loop at `specs.mjs:349` | `pass 20`, `fail 1`: tight-cap assertion lacked `PULSE_FIRST_CONTENT` | S → S |
| 7 | Replaced `cutTo(...)` with complete `candidate.text` at `specs.mjs:356` | `pass 17`, `fail 4`: old cut precondition, no-default wiring, tight-cap, and guidance arms | S → S |
| 8 | Removed the requirement heading from `cutMarker` at `specs.mjs:194` | `pass 20`, `fail 1`: tight-cap marker-heading assertion | S → S |
| 9 | Changed `budget < marker.length` to `budget <= marker.length` at `specs.mjs:204` | `pass 20`, `fail 1`: tight-cap marker count was 2 instead of 3 | S → S |
| 10 | Replaced `cutTail`'s named marker at `specs.mjs:208` with an unnamed pending-text marker | `pass 20`, `fail 1`: binding fixture lacked `CUT: requirement "pulse governing rule"` | S → S |
| 11 | Reintroduced per-capability division with `Math.floor(maxChars / caps.length)` at `specs.mjs:353` | `pass 15`, `fail 6`: total-budget, default-wiring, binding-size, all-type-cut, floor, and tight-cap arms | S → S |
| 12 | Restored `BRIEF_EXCERPT_MAX_CHARS` to `88000` at `config.mjs:304` | `pass 18`, `fail 3`: ceiling, binding marker, and guidance assertions | C → C |
| 13 | Forwarded `job.subjects` from `brief.mjs:664` | `pass 20`, `fail 1`: `Stage 0 passes no job-field fallback as a subject list` | B → B |
| 14 | Removed `options.pendingRoot` forwarding at `specs.mjs:290` | `pass 17`, `fail 4`: pending-only, binding pending, `files` count, and truncation arms | S → S |
| 15 | Removed `ctx.pendingRoot` forwarding at `brief.mjs:665` | `pass 20`, `fail 1`: binding fixture lacked `PENDING AMENDMENT` | B → B |
| 16 | Disabled specification-path normalization in `capabilityFromSubject` at `specs.mjs:242` | `pass 20`, `fail 1`: explicit declared-subject path arm lacked `specs/site` | S → S |
| 17 | Returned only candidate-bearing plan items instead of `allFiles` at `specs.mjs:413` | `pass 20`, `fail 1`: `files` expected 12, received 3 | S → S |
| 18 | Replaced the truncation calculation at `specs.mjs:389` with `false` | `pass 20`, `fail 1`: bounded excerpt guidance was absent | S → S |
| 19 | Removed `.filter(Boolean)` from rendered output at `specs.mjs:410` | `pass 19`, `fail 2`: both empty-source arms returned `\n\n---\n\n` instead of empty text | S → S |
| 20 | Admitted every positive-scoring pending section at `specs.mjs:314` | `pass 19`, `fail 2`: surplus heading equality and surplus artifact bound (`34386`) | S → S |
| 21 | Removed constitution floor collection at `specs.mjs:324-327` | `pass 12`, `fail 9`: old-cut, default-wiring, subject, named-set, binding-size, all-type, floor, tight-cap, and loud-error arms | S → S |
| 22 | Omitted `blog` from the pinned constitution constructor at test `:66` | `pass 20`, `fail 1`: `post is missing blog` at test `:327` | T → T |

Non-behavioural declarations: the historical rationale prose in
`config.mjs:295-301` has no runtime branch to mutate; the fixture filler and
repository constructors at `brief-excerpt-budget.test.mjs:28-129` are covered
by the capability-omission, tight-cap token, pending-root, binding, surplus,
and source-list rows rather than being production decisions; and the live
measurement collection/printing at `:393-405` is intentionally measurement-only
per task 8, with no pass/fail claim to mutate. Every behavior-bearing seam in
the changed production code has a row above.

## Live-tree measurement

The focused run's live measurement was:

    interpret: brief_chars=22066
    verify: brief_chars=27306
    entry: brief_chars=23995
    tutorial: brief_chars=22047
    post: brief_chars=35564
    education: brief_chars=22715
    scout: brief_chars=41043
    repair: brief_chars=27117
    prune: brief_chars=26081
    machinery: brief_chars=22835

`largest_assembled=41043; fixture_bound=30000; cut_types=post,repair,prune`.
The live measurement exceeds the pinned artifact bound and is reported as a
finding; it is not repaired by raising the 24,000 excerpt ceiling.

## Full suite and independent checks

- Focused excerpt test: `tests 21`, `pass 21`, `fail 0`.
- Portability/model-naming check: `tests 12`, `pass 12`, `fail 0`.
- Change-directory-reference check: `tests 3`, `pass 3`, `fail 0`.
- Full suite, run exactly once at the end with a 700,000 ms command timeout:
  `npm --prefix D:\addictedtoai-worktrees\fleet6-stage0-B1 test` exited 0 with
  `tests 1725`, `pass 1725`, `fail 0` (`duration_ms 450516.2496`; tool wall
  time 452.9 seconds).
- `git diff --check` exited 0.
- No build, Pulse, merge, push, GitHub operation, or beads mutation was run.

## Frozen text and tree findings

- The frozen task's earlier Stage 0 sentence says the caller fills subjects
  from `.job/source.json`; its later B1 resolution says the caller passes an
  empty list because the current `loop/run.mjs` source record has no subject
  list. The later resolution governs, and `loop/run.mjs` is outside this
  packet's four-file scope.
- The worktree `openspec/` artifacts were stale as warned. The authority was
  read from `git show 047e9bf:...`; the shared `D:\AddictedToAI` checkout was
  read only and never written. The branch diff was inspected from merge base
  `fbe1306`, not from `main`.
- The synthetic pending corpus now lives under `fixture-amendments`, with an
  explicit test-only root injection. The fixture adds no unarchived
  change-directory reference; the dedicated 3-test check passes with the
  repository's narrowly allowed operational reader unchanged.
- No `loop/tests/specs.test.mjs` or `package.json` was added. The live tree has
  open changes that make its assembled briefs larger and cut three job types;
  that time-dependent fact remains a measurement finding.
