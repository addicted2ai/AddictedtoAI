# Stage 0 packet F — round 1 — VERDICT: revise

## Sealing

This was packet F's first review. A filename sweep found no `REVIEW*.md` in
this worktree before this report, and no earlier packet-F round report exists.
I opened no earlier packet-F review or report. For format and class-label
context only, I opened the historical packet-D files
`openspec/changes/two-desks-work-orders-and-trains/evidence/reviews/stage0-packet-D/round1-REVIEW.md`
and `round2-REVIEW.md`, plus packet E's
`stage0-packet-E/round1-REVIEW.md`; none is F material. I also read the current
`.agent-brief.md` and `RESULT1.md`.

## Findings

1. `loop/lib/select.mjs:170-183` does not surface the conformance record count
   on the successful path. It loads the gate, trusts `conformance.ok`, and
   continues selecting without logging or returning `conformance.entries`;
   the selector's documented return shape at `:110-112` has no count. A
   two-entry throwaway history selected a repair with selector keys
   `selected, topRanked, refusals, warnings, notes, shares, shed, lane,
   considered` and `selectorHasEntries: false`. `run.mjs` logs the initial
   author's count, but that does not make the exported programmatic selector
   reader report the count, and it does not report the count for an allowed
   escalation re-read. This violates task 21(b), the requirement that a reader
   report its count before trusting any verdict, and the resolved count clause
   outside its refusal-only case. The existing tests assert only that the
   selector is blocked; changing `reason: conformance.reason` to the generic
   string `conformance failure` stayed green at 19/19, so the required
   selector count surface is not pinned. Surface the count before the selector
   acts on both allowed and unrecorded histories (or carry it in the selector
   result and print it at the caller), and assert the count-bearing refusal and
   allowed paths. CLASS: COUNT-SURFACE / TEST-COVERAGE.

2. `scripts/no-change-dir-refs.test.mjs:19` weakens the enforcement detector
   for a valid terminal directory reference. The old pattern matches
   `openspec/changes/foo`; the new pattern requires the change-name segment to
   be followed by `/`. Direct evaluation gave `old=1 new=0` for the exact
   string `openspec/changes/foo`. That is an input the old check rejected and
   the new check permits, contrary to the no-unarchived-change-directory
   property and task 22(b)'s requirement to make the check stricter. Add a
   terminal-name/boundary form to the detector while retaining the full span
   for paths that continue below the change directory, and add a test for both
   forms. CLASS: ENFORCEMENT-REGRESSION.

3. `loop/tests/conformance.test.mjs:116-201` has no history containing two
   distinct failed check names with different later histories. The gate code
   at `loop/lib/runners.mjs:203-229` is intended to track every failed check
   independently, but mutating the name collector from
   `seen.has(check.name)` to `seen.size > 0` (track only the first failed name)
   stayed green at 14/14. A runner with check A superseded and check B still
   failing would therefore be allowed by the mutated implementation while the
   suite passed. This violates task 21(iii)/(vi)'s per-check-name rule and the
   requirement that every unsuperseded check be named. Add a two-or-more-check
   history with divergent FAIL/PASS sequences and assert the complete failed
   set and refusal. CLASS: TEST-COVERAGE / PER-CHECK-HISTORY.

4. `loop/tests/conformance.test.mjs:228-243` tests omission by making the
   whole entry's `checks` array empty. It does not omit the failed check while
   another check is present. The gate lookup at `loop/lib/runners.mjs:217-225`
   therefore has no arm against falling back to another check's result. I
   mutated it to use the first available check when the named check was absent;
   the full conformance file stayed green at 14/14. In the wrong world, A has
   a standing FAIL, a later entry omits A but carries B=PASS, and B's PASS
   incorrectly counts toward A. This violates the explicit “ABSENCE IS NOT A
   PASS” clause. Add a fixture where the failed check is omitted from an entry
   that contains a different check, assert the run resets, and keep the
   whole-array omission control. CLASS: TEST-COVERAGE / ABSENT-CHECK-SHAPE.

5. `loop/tests/portability.test.mjs:32,162-165` derives the expected per-root
   set from the same `RUNNER_SCAN_ROOTS` list that constructs `runnerTargets`.
   The external fixture only covers `lib/`, `app/`, and `tools/`. Removing
   `loop` from `RUNNER_SCAN_ROOTS` made the runner-ID enforcement test remain
   green at 15/15: the root disappears from both the scan and its expectation,
   and no fixture covers it. This leaves the machinery's most relevant root
   silently unscanned, contrary to task 22(vi)(a)'s six-root coverage contract
   and the packet's requirement that a changed enforcement line have a red
   mutation. Use an independent expected six-root set, assert the scan output
   contains files contributed by every expected root, and/or plant independent
   fixtures for all six roots. CLASS: TEST-COVERAGE / EXPECTATION-SCOPE.

## The mutations I ran

I reran all fourteen named author mutations, one at a time, with the smallest
affected TAP test file(s), restoring each immediately. I also ran four probes
of the weakest links: the self-derived runner-root list, a missing-check
fallback, a first-failed-name-only gate, and the selector's count-bearing
refusal reason. All inverse patches were applied immediately. The final
SHA-256 values are recorded in the table; the final Git diff against `HEAD`
was empty for tracked files.

## The mutation table, judged

Every row used `node --test --test-reporter=tap`; the TAP plan and the three
required totals were checked. Rows M1–M14 are the author's named mutations.
Rows O1–O4 are my probes; the green rows are the findings above.

| # | Mutation | Red or surviving output | Restored output and SHA-256 |
|---|---|---|---|
| M1 | `loop/conformance.mjs:415`: restore overwrite assignment | `# tests 14`; `# pass 11`; `# fail 3` | `# tests 14`; `# pass 14`; `# fail 0`; `conformance.mjs` `9885BACD9E4D4ECD68FD3B4E4488FB76792131EA9730B3CE0519900AE5268DCB` |
| M2 | `loop/lib/runners.mjs:195`: default threshold `3` → `1` | `# tests 14`; `# pass 11`; `# fail 3` | `# tests 14`; `# pass 14`; `# fail 0`; `runners.mjs` `D46721C90B239F3FDC9B66E25406DA82EDEA50293F102A0642F4C7D7DBDCB706` |
| M3 | `loop/lib/runners.mjs:218`: absent check treated as `PASS` | `# tests 14`; `# pass 13`; `# fail 1` | `# tests 14`; `# pass 14`; `# fail 0`; `runners.mjs` `D46721C90B239F3FDC9B66E25406DA82EDEA50293F102A0642F4C7D7DBDCB706` |
| M4 | Drop disabled refusal in `run.mjs:945` and `select.mjs:154` | `# tests 19`; `# pass 16`; `# fail 3` | `# tests 19`; `# pass 19`; `# fail 0`; `run.mjs` `3266AC71821E042466C960D44C16E0DA9D12F79724163DADCC42A7F05938F037`; `select.mjs` `D6C66C604188B63B9C7B1548479C12051DE6CEBCBDB6C628601452C5412D1BBD` |
| M5 | Default absent enablement to disabled at the runner, selector, and run sites | `# tests 19`; `# pass 11`; `# fail 8` | `# tests 19`; `# pass 19`; `# fail 0`; `runners.mjs` `D46721C90B239F3FDC9B66E25406DA82EDEA50293F102A0642F4C7D7DBDCB706`; `select.mjs` `D6C66C604188B63B9C7B1548479C12051DE6CEBCBDB6C628601452C5412D1BBD`; `run.mjs` `3266AC71821E042466C960D44C16E0DA9D12F79724163DADCC42A7F05938F037` |
| M6 | Drop `escalationTarget`'s disabled-target check | `# tests 19`; `# pass 18`; `# fail 1` | `# tests 19`; `# pass 19`; `# fail 0`; `select.mjs` `D6C66C604188B63B9C7B1548479C12051DE6CEBCBDB6C628601452C5412D1BBD` |
| M7 | Drop `pickRunner`'s disabled-entry skips | `# tests 19`; `# pass 18`; `# fail 1` | `# tests 19`; `# pass 19`; `# fail 0`; `runners.mjs` `D46721C90B239F3FDC9B66E25406DA82EDEA50293F102A0642F4C7D7DBDCB706` |
| M8 | Remove `enabled`'s boolean validation | `# tests 19`; `# pass 18`; `# fail 1` | `# tests 19`; `# pass 19`; `# fail 0`; `runners.mjs` `D46721C90B239F3FDC9B66E25406DA82EDEA50293F102A0642F4C7D7DBDCB706` |
| M9 | Make `conformanceHistory` discard arrays | `# tests 14`; `# pass 6`; `# fail 8` | `# tests 14`; `# pass 14`; `# fail 0`; `runners.mjs` `D46721C90B239F3FDC9B66E25406DA82EDEA50293F102A0642F4C7D7DBDCB706` |
| M10 | Remove both `.ts` and `.tsx` from runner-ID scan extensions | `# tests 15`; `# pass 14`; `# fail 1` | `# tests 15`; `# pass 15`; `# fail 0`; `portability.test.mjs` `294E378558AAD076D7BB9A8A93B04218D5C37AA7896F22481D0D13D43C2FF033` |
| M11 | Change `meetsScanFloor` to `scanned >= 0` | `# tests 15`; `# pass 14`; `# fail 1` | `# tests 15`; `# pass 15`; `# fail 0`; `portability.test.mjs` `294E378558AAD076D7BB9A8A93B04218D5C37AA7896F22481D0D13D43C2FF033` |
| M12 | Stop recursive `skipTests` propagation | `# tests 15`; `# pass 14`; `# fail 1` | `# tests 15`; `# pass 15`; `# fail 0`; `portability.test.mjs` `294E378558AAD076D7BB9A8A93B04218D5C37AA7896F22481D0D13D43C2FF033` |
| M13 | Test the allow-list against the whole source line | `# tests 4`; `# pass 3`; `# fail 1` | `# tests 4`; `# pass 4`; `# fail 0`; `no-change-dir-refs.test.mjs` `418E182507311317F79A7D11E16A2313120CB8DD543FA1E4625AC30A564C7BAE` |
| M14 | Add `authority_sha` to `LEDGER_FIELDS` | `# tests 60`; `# pass 57`; `# fail 3` | `# tests 60`; `# pass 60`; `# fail 0`; `ledger.mjs` `9B828ED3D4BF83B66B08ECF49A9341CCC5C13A0D988ED7B5AD93022E80B46480` |
| O1 | Remove `loop` from `RUNNER_SCAN_ROOTS` | **GREEN**: `# tests 15`; `# pass 15`; `# fail 0` — finding 5 | `# tests 15`; `# pass 15`; `# fail 0`; `portability.test.mjs` `294E378558AAD076D7BB9A8A93B04218D5C37AA7896F22481D0D13D43C2FF033` |
| O2 | When a named check is absent, fall back to the first available check | **GREEN**: `# tests 14`; `# pass 14`; `# fail 0` — finding 4 | `# tests 14`; `# pass 14`; `# fail 0`; `runners.mjs` `D46721C90B239F3FDC9B66E25406DA82EDEA50293F102A0642F4C7D7DBDCB706` |
| O3 | Track only the first failed check name | **GREEN**: `# tests 14`; `# pass 14`; `# fail 0` — finding 3 | `# tests 14`; `# pass 14`; `# fail 0`; `runners.mjs` `D46721C90B239F3FDC9B66E25406DA82EDEA50293F102A0642F4C7D7DBDCB706` |
| O4 | Replace the selector's count-bearing refusal reason with `conformance failure` | **GREEN**: `# tests 19`; `# pass 19`; `# fail 0` — finding 1 | `# tests 19`; `# pass 19`; `# fail 0`; `select.mjs` `D6C66C604188B63B9C7B1548479C12051DE6CEBCBDB6C628601452C5412D1BBD` |

## The two enforcement checks, judged against their old form

The portability check keeps the same six roots as the old explicit
`runnerTargets` list and expands the old extension set
`.mjs/.md/.json/.yml` with `.ts/.tsx`; its `scan` behavior is unchanged. Thus
the extension change has no old-flagged/new-pass case: the new file set is a
superset of the old one. The final per-root counts on the real tree were
`loop/ 33`, `pulse/ 22`, `scripts/ 16`, `lib/ 227`, `app/ 28`, and `tools/ 11`.
The check still has a scope weakness, however: O1 showed that deleting one
root from the shared list makes the expectation delete itself too. The new
check is therefore not strictly stronger as an enforcement instrument until
its expected scope is independent.

The change-directory check is strictly stronger for the measured same-line
case. With an allowed generic template and a named path on one line, the old
whole-line allowance lets the named path inherit the allowance; the new
matched-span allowance rejects it, and M13 made the new arm red when reverted.
The removed `loop/lib/specs.mjs` allow-list entry is genuinely stale: its
current references are to the archive form or to generic path construction
over a variable change name, not a named unarchived path. The source search
over `lib/`, `loop/`, `pulse/`, `scripts/`, `app/`, and `tools/` found no live
terminal-name instance, but the exact old/new `openspec/changes/foo` result is
still a regression in the detector's accepted language and is finding 2.

## What I checked that was sound

- `conformanceHistory` returns `[]` for an absent runner, `[record]` for the
  legacy object carrying `checks`, and the new array as-is. Both
  `recordConformance` and `conformanceGate` use it. Recording twice preserves
  the first entry and produces two entries; recording against a legacy object
  normalizes it rather than discarding it.
- The gate's current loop is oldest-to-newest and per exact check name. A FAIL
  replaces the standing failure and resets passes to zero; a non-PASS result,
  including an absent lookup whose value becomes `String(undefined).toUpperCase()`
  (`UNDEFINED`), resets the pass run; only the same check's consecutive PASSes
  can reach the threshold. Legacy FAILs still refuse, three later PASSes allow,
  and the original FAIL remains readable. The direct test cases cover the
  threshold, later FAIL reset, entry-level `pass` being ignored, legacy shape,
  and the whole-array omission control; findings 3 and 4 are the missing
  stronger multi-check forms.
- `conformanceGate` returns `entries` on absent, allowed, and refusal paths;
  absent returns `ok: true, unrecorded: true, entries: 0`. `run.mjs` logs the
  count before its refusal or unrecorded note, and a conformance refusal in
  `select.mjs` passes through the gate reason, whose suffix includes the
  count. The successful selector path is the separate count-surface finding
  above.
- The conformance record is written only after `runConformance` resolves all
  four checks; the existing killed-mid-check test keeps that evidence. The
  author report's final full-suite evidence is a completed final-tip run with
  `# tests 1814`, `# pass 1814`, `# fail 0`, and duration `473171.0778 ms`,
  which exceeds the required floor. I did not rerun that prohibited suite.
- `loadRunners` accepts an optional boolean `enabled`, rejects other present
  types with the exact required error, and leaves absent values `undefined`.
  Explicit disabled ids still resolve for reporting; implicit/default and
  alternate searches skip them. `selectJob` and `runLoop` refuse disabled
  entries with `runner:disabled`; the run-level check occurs before the
  conformance and health gates for both roles. `escalationTarget` returns
  `null` for a disabled destination. A throwaway runner that was simultaneously
  disabled, conformance-refused, and health-refused produced
  `runner:disabled` in both selector and run probes.
- The real registry has nine entries, no `enabled:` keys, and default
  `claude-code-opus` is cleared for both roles. The current absent-means-enabled
  conditions therefore preserve the pre-F selection behavior. `data/conformance.json`
  remains nine legacy single objects, with four checks each and no arrays. The
  branch diff has no `runners.yml` or `data/` path, as required; the three
  registry disablements remain the orchestrator's handover.
- The ledger comment beside `authority_sha` states both limits: the field buys
  auditability rather than prevention and does not replace re-reading/freeze,
  and the hand-driven pipeline has no ledger line until Stage 3, so its
  authority is carried in `RESULT.md` and the handover. It names no model,
  provider, or harness. M14 found all three downstream assertions.
- The direct property suites passed on the restored tree: the machinery-name
  scan, the real-registry clearance scan, the selector's budget/expiry/health
  behavior, exit-code refusal, issue ledger shape, and gate transport checks.

## Was the brief faithful to the tasks and the requirement? (and the closure)

The brief was faithful on the authority, the task quotations, the reserved
registry/data boundary, and the nine-file implementation closure. It correctly
identified `loop/lib/ledger.mjs` as comment-only and named the read-only helper,
legacy-record, real-registry, issue-field, and transport-test dependencies.
The author's scope was correct and its fourteen named mutation claims were
reproducible. Its conclusion that the registry remains entirely enabled until
the orchestrator's three lines land is also correct.

The brief was not a complete proof of the enforcement closure: it reported
per-root counts but did not make the expected root set independent, and its
conformance fixtures did not cover multiple failed names or a partial check
omission. Those are findings against the packet's test obligations, not scope
violations by the author.

For closure, I searched all machinery and tests for
`loadConformance`, `conformanceGate`, `conformanceHistory`, `recordConformance`,
`conformancePath`, `checks`, and `data/conformance.json`. The only production
record readers are `loop/lib/select.mjs` and `loop/run.mjs`; the producer is
`loop/conformance.mjs`. Legacy-shape writers are
`loop/tests/exit-code-refusal.test.mjs` and the conformance arm in
`runner-policy.test.mjs`; `pulse/tests/publish.test.mjs` names the path only.
I also searched `runnersYaml`, literal `runners:` blocks, `loadRunners`,
`pickRunner`, and `enabled` across every loop test and inspected the real
`runners.yml`. The generic fixture constructor is in
`loop/tests/helpers.mjs`; packet-F's own registry construction is in
`runner-policy.test.mjs`; the real registry is loaded by
`selector-rules.test.mjs`. No additional conformance-shape reader or runner
entry construction requiring a packet-F edit was omitted. The independent
scope holes identified above were found by mutation, not by trusting that
enumeration.

## What I ran

- Read-only setup: `bd prime`; the authority `spec.md` and `tasks.md` from
  `ddbfd52`; branch, merge-base, status, diff name/stat, and `git diff --check`.
  The tracked diff is exactly the nine permitted files, one author commit
  `df448970490c7fe496317182417364a281c216ed` over
  `ddbfd52ca16ccf5cff92633d0b571e1a4ce69c91`.
- The GitNexus review tool was attempted with the worktree path, but no index
  exists for this repository and it returned `Repository ... not found`; no
  indexing command or repository mutation was run.
- Restored direct suites, each with TAP and a matching plan: conformance
  `# tests 14`, `# pass 14`, `# fail 0`; runner policy `19/19/0`; portability
  `15/15/0`; change-directory references `4/4/0`.
- Restored closure batch covering `selector-rules`, `budget`,
  `expiring-proposal-precedence`, `runner-health`, `exit-code-refusal`,
  `issues`, and `gate-transport-retry`: `# tests 119`, `# pass 119`,
  `# fail 0`, `# cancelled 0`, `# skipped 0`, `# todo 0`.
- The fourteen named mutations and four own probes are in the mutation table.
  The exact selector/count probe and disabled-plus-health-plus-conformance
  probe used throwaway repositories under the OS temp directory. The probe
  file was removed; an exact-path PowerShell removal call was blocked by
  policy, so that blocked call was not retried. Removal through the permitted
  patch mechanism succeeded and `Test-Path` for the exact probe path returned
  `False`; the `.job` directory is empty.
- Final SHA-256 audit: `conformance.mjs`
  `9885BACD9E4D4ECD68FD3B4E4488FB76792131EA9730B3CE0519900AE5268DCB`,
  `runners.mjs`
  `D46721C90B239F3FDC9B66E25406DA82EDEA50293F102A0642F4C7D7DBDCB706`,
  `select.mjs`
  `D6C66C604188B63B9C7B1548479C12051DE6CEBCBDB6C628601452C5412D1BBD`,
  `run.mjs`
  `3266AC71821E042466C960D44C16E0DA9D12F79724163DADCC42A7F05938F037`,
  `ledger.mjs`
  `9B828ED3D4BF83B66B08ECF49A9341CCC5C13A0D988ED7B5AD93022E80B46480`,
  `conformance.test.mjs`
  `325BACC4D783D88EB50C1CE2CA289FC34B520989E38EE4B5FD651925040D9B24`,
  `runner-policy.test.mjs`
  `00F1A099AA5BF372143A19C12D4CD8C223E857F43C537B791D5B6BB1330983C1`,
  `portability.test.mjs`
  `294E378558AAD076D7BB9A8A93B04218D5C37AA7896F22481D0D13D43C2FF033`,
  and `no-change-dir-refs.test.mjs`
  `418E182507311317F79A7D11E16A2313120CB8DD543FA1E4625AC30A564C7BAE`.
- I did not run `npm test`, `npm run build`, any whole `verify-*` script, the
  Pulse, the Desk against the real repository, or any push/commit/merge.
