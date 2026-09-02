# Tasks: link-the-machines-work-to-beads

Every task names the requirement it implements and the check that measures it.
A requirement with no task is invisible twice — a literal implementer never
builds it and the integrated check passes without it.

## 1. One definition of the id format

- [x] 1.1 Add `loop/lib/issues.mjs`: `ISSUE_PREFIX`, `ISSUE_ID_RE`,
      `isIssueId`, `declaredIssueIds` (strict, for a declared field),
      `harvestIssueIds` (permissive, for prose) and `mergeIssueIds`. Pure — no
      process, no filesystem, no network, and no import of `bd`. Implements
      **"exactly one place"** and the **format half** of the format/existence
      split.
      Verify: `loop/tests/issues.test.mjs` cases 1a–1b assert the anchored
      format accepts the four id shapes observed in this repository and rejects
      ten malformed ones, including the substring and trailing-text cases.

## 2. The proposal key

- [x] 2.1 In `loop/lib/proposals.mjs`, read `issue:`/`issues:` in
      `readProposals` beside the `slug` and `type` checks. A malformed value
      pushes to `malformed` with a reason naming the file and the value, and the
      proposal is skipped; a well-formed one is carried onto the candidate as
      `issues: string[]`. Implements **format-checked at parse time** and
      **malformed is not selectable**.
      Verify: case 3a asserts the malformed proposal is absent from `ripe`,
      present in `malformed` with a reason naming `issue`, while a sibling
      declaring nothing stays ripe (the positive control) and one declaring a
      good id carries it forward.

## 3. The join, from source to record

- [x] 3.1 In `loop/lib/directives.mjs`, harvest ids from each directive line's
      text in `parseDirectives` and carry them onto the candidate in
      `readDirectives`. No new syntax; scanned from the body so the
      `[done …]` marker cannot hide one. Implements **no new syntax**,
      **prose cannot be malformed**, and **survives the done marker**.
      Verify: cases 4a–4d, including a line with no id (control) and the exact
      `[done 2026-08-31 j-20260831-04]` shape `markDirectiveDone` writes.
- [x] 3.2 In `loop/lib/ledger.mjs`, accept `issues` in `makeLedgerLine`, write
      it only when it is a non-empty array, leave `LEDGER_FIELDS` unchanged, and
      add `jobsForIssue(ledger, id)`. Implements **a list**, **omitted when
      empty**, **additive**.
      Verify: cases 5a–5d, including four falsy/invalid shapes that must each
      write no key, and an explicit assertion that `LEDGER_FIELDS` is unchanged.
- [x] 3.3 In `loop/run.mjs`, set `jobIssues` from the selected candidate, persist
      it into `.job/source.json`, recover it on a resumed branch, and pass it to
      the ledger line. Implements **the same issues in each run of a job**.
      Verify: task 5.3's end-to-end read of a written ledger line.
- [x] 3.4 Propagate a declared id into the retirement records written by
      `sweepExpired` and `consumeProposal`. Implements **the retirement record
      names the id**, propagating only.
      Verify: task 5.3.

## 4. The existence half, local only

- [x] 4.1 Add `scripts/verify-issue-links.mjs`: collect every referenced id from
      the ledger, from proposals in all four states, and from `DIRECTIVES.md`;
      check format; then resolve against `bd list --status all --json`. Exit 1
      naming each bad reference. Implements the **existence half** and **no
      issue is created, closed or synchronised**.
      Verify: task 4.2 and 4.3.
- [x] 4.2 The script SKIPs existence with a stated reason when `bd` cannot be
      reached, rather than failing or pretending it checked. Implements
      **usable where `bd` is absent**.
      Verify: measured on this machine — the first two spellings
      (`execFileSync('bd')` → ENOENT, `'bd.cmd'` → EINVAL under
      CVE-2024-27980) both took the SKIP path and exited 0 on a clean tree
      before the resolver was fixed.
- [x] 4.3 The script is NOT added to `scripts/prebuild.mjs`'s `STEPS`.
      Implements **the build never depends on `bd`**.
      Verify: `grep` for `proposals|ledger.jsonl` in `scripts/prebuild.mjs`
      returns nothing, so no build path reaches the join; and
      `verify-issue-links` appears in no `STEPS` array.

## 5. Measurement

- [x] 5.1 `loop/tests/issues.test.mjs` — 15 cases, each carrying a positive
      control so that a check which rejected everything could not pass.
- [x] 5.2 Mutation test, four mutations, each restored byte-identical:
      | mutation | expected to fail | result |
      |---|---|---|
      | malformed declared id silently ignored | 2b, 3a | caught |
      | malformed proposal warned but not skipped | 3a | caught |
      | ledger writes `issues` when empty | 5b | caught |
      | directive harvest loses ids after the done marker | 4a, 4b, 4d | caught |
      No mutation failed a test it should not have, and the suite passed again
      after every restore.
- [x] 5.3 Gate probe: run the thing the gate prevents and watch it stop. On the
      real tree — control PASS (exit 0); with one proposal referencing the
      well-formed but non-existent `addictedtoai-zzzz` → **FAIL exit 1** naming
      the file; with `issue: see the tracker` → **FAIL exit 1** on format
      without consulting beads; probe removed → PASS (exit 0) again.
- [x] 5.4 The change's own two deferrals filed as their own issues before
      moving on: `addictedtoai-fyd3`, `addictedtoai-fvoo`. Both verified to
      exist by the gate this change adds.

## 6. Deliberately not done

*Both items below are checked because the work each names is a DECISION, and
both decisions were made and recorded. The checkbox means "settled", not
"built" — building either is precisely what was rejected. Marked 2026-09-01 at
archive time so the change does not sit permanently at 13/15 for two entries
that were never going to be implemented.*

- [x] 6.1 **A required id on a dropped proposal — rejected, not deferred.** It
      would demand an issue per scout decline (ten in one night), which is the
      manufactured backlog noise `addictedtoai-occ0`'s own first constraint
      forbids, in service of a loss that measurement says is not occurring: all
      ten drop records are spec-compliant, naming their failed test and a refile
      condition. The real gap there is that nothing CHECKS that compliance,
      which is `addictedtoai-fyd3` and is a different requirement.
- [x] 6.2 **An `issue:` key on review records — declined on design grounds**
      (design D3), not on the hazard `addictedtoai-occ0` stated, which was
      traced and does not exist.
