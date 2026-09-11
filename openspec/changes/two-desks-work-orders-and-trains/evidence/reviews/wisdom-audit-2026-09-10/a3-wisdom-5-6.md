# Reviewer A3 (sonnet, sealed) — wisdom items 5 & 6

All commits listed were read via `git -C D:/AddictedtoAI show <sha>`, dumped to scratchpad rev-a3/, and read whole. HEAD confirmed `1334b9b` on `main`; `d319a31` verified an ancestor of HEAD.

## P0 findings

**1. Item 6's live-sweep instrument has no non-vacuity assertion — could pass on an empty `DECLARED` set.** `scripts/figure-provenance.test.mjs`, test `'live sweep: every declared figure is sourced where the tree restates it'` (line ~404 at `b05a903`, unchanged at HEAD) does only `assert.deepEqual(violations, [], ...)`. `sweepLiveRestatements()` loops `for (const figure of DECLARED)`; if `DECLARED` were empty (or every figure's `patterns` array emptied, as Mutation A does for one figure), the function trivially returns `[]` and this test passes. Mutation A/B were only applied to *one* figure at a time, and the RESULT itself records the outcome as still RED ("A14 ... RED, 5 named (machinery :45 gone)") because the other three declared figures still fired — so the suite never exercises the "all patterns gone" case, which is exactly the case where the check goes silently green. Nothing anywhere asserts `DECLARED.length > 0` or a floor on figures/candidates scanned. Wrong world: a future gating bound is added to `data/config.json` and never added to `DECLARED` — the sweep never notices, and the whole-tree walk gives false confidence that "the sweep" covers it.

**2. Item 5's judgment engine (`classifyClaim`/`recordMeasurement`) is called nowhere in production.** Repo-wide grep for `classifyClaim|recordMeasurement` matches only `loop/lib/lineage.mjs` (definitions), `loop/tests/lineage.test.mjs`, and prose in the evidence/brief files — never `loop/run.mjs`, `loop/lib/review.mjs`, or any other live-path module. `loop/run.mjs:1519-1520` (per `e0d7839`) only threads an optional value through: `const jobLineage = job.lineage ?? undefined;` … `// No selector sets one today, so this is absent in practice`. So while lineage.mjs's own tests are 10/10 green, no real measurement anywhere in the loop is ever actually classified independent-vs-consistent. Wrong world: two jobs genuinely reproduce one finding via one computation and a real review calls it independent corroboration — the mechanism that exists to catch exactly this is never invoked on that claim.

## P1 findings

**3. Item 5b (the corroboration reader question) is prose, not a mechanism, and its answer is unverifiable — correctly disclosed but still a gap.** `loop/lib/lineage.mjs:118-146` defines `CORROBORATION_QUESTION`/`CORROBORATION_DISPOSITION`/`corroborationSection()` as static strings; `loop/lib/review.mjs:440,448` interpolates the section into `assembleReviewBrief`. This *is* wired into the live review path (verified by arm 6 reading `review.mjs` source and asserting the seam string), but nothing checks that a reviewer model answers the question correctly — a reviewer that rubber-stamps "different instruments" for a genuinely shared-instrument pair is undetected. The brief is honest about this ("stays judgment by design... a regex cannot see that"), so this is a disclosed limitation, not a false claim.

**4. The `3936ae8` residual is NOT lost.** "Residual: a restatement written ENTIRELY in backticks with no prose number escapes capture" is recorded in three places: the test file's own comment (`scripts/figure-provenance.test.mjs`, added in `3936ae8`), `RESULT1.md` §1 note and §4, and the sealed REVIEW.md. Verified good.

## Verified OK

- **03e2207 story accurate.** Confirmed this session: `git rev-parse HEAD:data/launch.json` → `9c272f425a1204a6da87aad34b5c85657adaf029`; `git cat-file -t 03e2207` → `fatal: Not a valid object name`; `git cat-file -t 9c272f4` → `blob`. The banked note states these exact verification commands.
- **`ledger.mjs`'s 13 lines**: purely additive/optional (`if (lineage !== undefined) line.lineage = lineage;`), matching the commit's own claim that it validates nothing; in fact zero ledger writes carry lineage today.
- **Counts**: `loop/tests/lineage.test.mjs` has exactly 10 `test(` blocks matching "10/10"; `scripts/figure-provenance.test.mjs` has exactly 15 `test(` blocks at HEAD, matching "15/15" after `a777067`+`3936ae8`. "9 arms" in item 5's brief = 9 properties; arm 2 implemented as two blocks (2 and 2b) per the brief's own split — not a discrepancy.
- **S5**: keyed on exact line **text** (`EXEMPTIONS` entries require `file`+`line`+`figure`+`exactLineText` all matching in `exempted()`); arm A15 proves a `45%→46%` tamper re-fires. Tamper-proof as claimed.
- **S6**: dispositioned in `RESULT1.md` §4 as "(observation, excluded scope) evidence report stale-with-pointer, desk-mech-report.md:207-208 — fix belongs to the change author" — recorded with reason, correctly left unedited.
- **AGENTS.md** (`b2abfaa`) changes exactly one line — a pointer to `data/config.json` `budget.window_days` added, no rule text changed. **data/README.md** attaches `budget.bounds.*` key-path pointers to three bounds and corrects machinery ceiling from stale `10%` to live `30%` (matching `data/config.json`) — a figure correction plus sourcing, not a policy change.
- **Corroboration wiring** confirmed live via source read of `review.mjs`.

## Not checked
Whether git author "Andrew" is formally recorded as holding the orchestrator role for the AGENTS.md/data/README.md edits (the successor's board claims the role). No tests run.
