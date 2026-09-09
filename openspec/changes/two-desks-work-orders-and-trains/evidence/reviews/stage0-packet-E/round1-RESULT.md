# RESULT1

## 1. Commits

- `2808f42` — loop: record ledger telemetry and refuse forced worktree cleanup
- `db10eac` — loop: clear result protocol before worktree removal

Output of `git -C D:/addictedtoai-worktrees/fleet6-stage0-E log --oneline main..HEAD`:

```text
db10eac loop: clear result protocol before worktree removal
2808f42 loop: record ledger telemetry and refuse forced worktree cleanup
```

## 2. What changed, per file

- `loop/lib/ledger.mjs`: `makeLedgerLine` accepts and emits optional
  `brief_chars`, `gate_seconds`, and `authority_sha`. The required
  `LEDGER_FIELDS` eight-key list is unchanged, so old lines still validate.
  The doc comment identifies all three measurements.
- `loop/lib/runners.mjs`: `loadRunners` accepts an optional `effort` property,
  requiring a non-empty string when present. An omitted property remains
  `undefined` on the registry entry.
- `loop/run.mjs`: every phase entry now carries `runner` and
  `effort: who.effort ?? null`; review entries carry `carried` equal to the
  parsed `carry` list length when a record exists. The outcome line passes
  `brief_chars: briefText.length`, the final gate run's one-decimal
  `gate_seconds` map, and the full `mergeBaseSha` as `authority_sha`.
  Cleanup clears only the protocol `RESULT.md` first, then calls
  `removeWorktree`; recursive `rmSync` runs only when that call returns
  `{ok: true}`, and the final `git worktree prune` runs in every case.
- `loop/tests/ledger.test.mjs`: new throwaway-repository tests cover all four
  phase positions, null and declared effort, review carried counts, brief and
  authority telemetry, last-run gate timing, and legacy eight-key validation.
- `loop/lib/git.mjs`: `removeWorktree(repo, dir)` now invokes
  `git worktree remove <dir>` without force, prunes, and returns exactly
  `{ ok: true }` on removal success or
  `{ ok: false, reason: <git stderr or stdout> }` on refusal. It never retries
  with force or deletes the directory itself.
- `loop/lib/review.mjs`: the detached reviewer worktree is recursively
  removed only after the non-forcing git removal succeeds; a refusal is logged
  with its reason and the directory is left standing.
- `loop/conformance.mjs`: setup and teardown inspect the new removal result and
  log refusals. A refused owned setup worktree is reset and cleaned before one
  more non-forcing removal attempt; a refused teardown is left standing.
- `loop/tests/worktree-cleanup.test.mjs`: the existing cleanup arms now use the
  refusal result, add a real dirty-worktree refusal with an `rmSync` seam
  assertion, retain a clean-worktree positive control, and statically pin the
  reviewer/conformance caller guards.
- `scripts/verify-launch.mjs`: `BUILD_INPUT_EXCLUSIONS` now reads
  `.git`, `.next`, `node_modules`, `out`, `public`, `.beads`. The adjacent
  comment documents membership by build readers, exclusion only when every
  writer is inside the build, `data/derived/` remaining an input, and the
  autonomous tracker-write reason for excluding root `.beads/`.
- `scripts/verify-launch-build-reuse.test.mjs`: new throwaway git-repository
  tests prove a current export remains reusable after a later `.beads/` write
  with no spawn, while a later `content/` write makes it stale.

## 3. Tests run

Targeted packet command, before the final cleanup-only commit:

```text
node --test D:\addictedtoai-worktrees\fleet6-stage0-E\loop\tests\ledger.test.mjs D:\addictedtoai-worktrees\fleet6-stage0-E\loop\tests\worktree-cleanup.test.mjs D:\addictedtoai-worktrees\fleet6-stage0-E\scripts\verify-launch-build-reuse.test.mjs D:\addictedtoai-worktrees\fleet6-stage0-E\loop\tests\ledger-order.test.mjs D:\addictedtoai-worktrees\fleet6-stage0-E\loop\tests\ledger-before-publish.test.mjs D:\addictedtoai-worktrees\fleet6-stage0-E\loop\tests\job-budget.test.mjs
ℹ tests 37
ℹ suites 0
ℹ pass 37
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 76592.5299
```

Property enforcement command (`loop/tests/portability.test.mjs` enforces the
registry-only machinery naming rule; `scripts/no-change-dir-refs.test.mjs`
enforces the unarchived-reference rule; `selector-rules.test.mjs` covers
registry validation):

```text
node --test D:\addictedtoai-worktrees\fleet6-stage0-E\loop\tests\portability.test.mjs D:\addictedtoai-worktrees\fleet6-stage0-E\scripts\no-change-dir-refs.test.mjs D:\addictedtoai-worktrees\fleet6-stage0-E\loop\tests\selector-rules.test.mjs
ℹ tests 33
ℹ suites 0
ℹ pass 33
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 16224.6974
```

Additional owning and regression suites:

```text
node --test D:\addictedtoai-worktrees\fleet6-stage0-E\loop\tests\conformance.test.mjs
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 29380.9608

node --test D:\addictedtoai-worktrees\fleet6-stage0-E\loop\tests\review.test.mjs D:\addictedtoai-worktrees\fleet6-stage0-E\loop\tests\review-blog-bar.test.mjs
ℹ tests 78
ℹ suites 0
ℹ pass 78
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 104225.1114

node --test D:\addictedtoai-worktrees\fleet6-stage0-E\loop\tests\branch-cleanup.test.mjs
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 19272.8541

node --test D:\addictedtoai-worktrees\fleet6-stage0-E\loop\tests\breakers.test.mjs D:\addictedtoai-worktrees\fleet6-stage0-E\loop\tests\gate-transport-retry.test.mjs
ℹ tests 49
ℹ suites 0
ℹ pass 47
ℹ fail 2
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 97215.3409
```

The completed final full-suite iteration was run on committed tip `db10eac`
with a 700-second timeout. Wall time was about 432.2 seconds; the test
runner reported 429739.2321 ms:

```text
npm --prefix D:/addictedtoai-worktrees/fleet6-stage0-E test
ℹ tests 1782
ℹ suites 0
ℹ pass 1780
ℹ fail 2
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 429739.2321
```

The two final failures are listed in section 7. No build command or whole
verification script was run separately, per the packet restrictions.

## 4. Mutation table

Each red tail below is verbatim from the mutation run. Restored values are
`pass/fail` counts.

| Mutation | File and line | Command | Red tail | Restored |
|---|---|---|---|---|
| Add `gate_seconds` to `LEDGER_FIELDS` | `loop/lib/ledger.mjs:30` | `node --test D:\addictedtoai-worktrees\fleet6-stage0-E\loop\tests\ledger.test.mjs` | `ℹ tests 4`<br>`ℹ suites 0`<br>`ℹ pass 2`<br>`ℹ fail 2`<br>`ℹ cancelled 0`<br>`ℹ skipped 0`<br>`ℹ todo 0`<br>`ℹ duration_ms 6511.5798` | 4/0 |
| Restore `--force` on worktree removal | `loop/lib/git.mjs:117` | `node --test D:\addictedtoai-worktrees\fleet6-stage0-E\loop\tests\worktree-cleanup.test.mjs` | `ℹ tests 10`<br>`ℹ suites 0`<br>`ℹ pass 9`<br>`ℹ fail 1`<br>`ℹ cancelled 0`<br>`ℹ skipped 0`<br>`ℹ todo 0`<br>`ℹ duration_ms 16516.5513` | 10/0 |
| Run `rmSync` after a refused git removal | `loop/run.mjs:929` | `node --test D:\addictedtoai-worktrees\fleet6-stage0-E\loop\tests\worktree-cleanup.test.mjs` | `ℹ tests 10`<br>`ℹ suites 0`<br>`ℹ pass 8`<br>`ℹ fail 2`<br>`ℹ cancelled 0`<br>`ℹ skipped 0`<br>`ℹ todo 0`<br>`ℹ duration_ms 22051.1824` | 10/0 |
| Remove `.beads` from the reuse exclusions | `scripts/verify-launch.mjs:201` | `node --test D:\addictedtoai-worktrees\fleet6-stage0-E\scripts\verify-launch-build-reuse.test.mjs` | `ℹ tests 2`<br>`ℹ suites 0`<br>`ℹ pass 1`<br>`ℹ fail 1`<br>`ℹ cancelled 0`<br>`ℹ skipped 0`<br>`ℹ todo 0`<br>`ℹ duration_ms 2028.3758` | 2/0 |
| Record phase effort as `null` instead of the registry value | `loop/run.mjs:275` | `node --test D:\addictedtoai-worktrees\fleet6-stage0-E\loop\tests\ledger.test.mjs` | `ℹ tests 4`<br>`ℹ suites 0`<br>`ℹ pass 3`<br>`ℹ fail 1`<br>`ℹ cancelled 0`<br>`ℹ skipped 0`<br>`ℹ todo 0`<br>`ℹ duration_ms 6922.9454` | 4/0 |
| Omit `carried` from review phases | `loop/run.mjs:678` | `node --test D:\addictedtoai-worktrees\fleet6-stage0-E\loop\tests\ledger.test.mjs` | `ℹ tests 4`<br>`ℹ suites 0`<br>`ℹ pass 3`<br>`ℹ fail 1`<br>`ℹ cancelled 0`<br>`ℹ skipped 0`<br>`ℹ todo 0`<br>`ℹ duration_ms 7003.9485` | 4/0 |
| Disable optional effort validation | `loop/lib/runners.mjs:80` | `node --test D:\addictedtoai-worktrees\fleet6-stage0-E\loop\tests\ledger.test.mjs` | `ℹ tests 4`<br>`ℹ suites 0`<br>`ℹ pass 3`<br>`ℹ fail 1`<br>`ℹ cancelled 0`<br>`ℹ skipped 0`<br>`ℹ todo 0`<br>`ℹ duration_ms 6940.3175` | 4/0 |
| Replace one-decimal gate timing with zero | `loop/run.mjs:267` | `node --test D:\addictedtoai-worktrees\fleet6-stage0-E\loop\tests\ledger.test.mjs` | `ℹ tests 5`<br>`ℹ suites 0`<br>`ℹ pass 4`<br>`ℹ fail 1`<br>`ℹ cancelled 0`<br>`ℹ skipped 0`<br>`ℹ todo 0`<br>`ℹ duration_ms 12470.1675` | 5/0 |
| Remove the review caller's `removed.ok` guard | `loop/lib/review.mjs:1216` | `node --test D:\addictedtoai-worktrees\fleet6-stage0-E\loop\tests\worktree-cleanup.test.mjs` | `ℹ tests 11`<br>`ℹ suites 0`<br>`ℹ pass 10`<br>`ℹ fail 1`<br>`ℹ cancelled 0`<br>`ℹ skipped 0`<br>`ℹ todo 0`<br>`ℹ duration_ms 22758.5983` | 11/0 |
| Omit conformance cleanup before the retry | `loop/conformance.mjs:331` | `node --test D:\addictedtoai-worktrees\fleet6-stage0-E\loop\tests\conformance.test.mjs` | `ℹ tests 6`<br>`ℹ suites 0`<br>`ℹ pass 5`<br>`ℹ fail 1`<br>`ℹ cancelled 0`<br>`ℹ skipped 0`<br>`ℹ todo 0`<br>`ℹ duration_ms 24752.4873` | 6/0 |
| Omit `authority_sha` in `makeLedgerLine` | `loop/lib/ledger.mjs:135` | `node --test D:\addictedtoai-worktrees\fleet6-stage0-E\loop\tests\ledger.test.mjs` | `ℹ tests 5`<br>`ℹ suites 0`<br>`ℹ pass 3`<br>`ℹ fail 2`<br>`ℹ cancelled 0`<br>`ℹ skipped 0`<br>`ℹ todo 0`<br>`ℹ duration_ms 11664.4757` | 5/0 |
| Omit the protocol-file unlink before removal | `loop/run.mjs:1931` | `node --test D:\addictedtoai-worktrees\fleet6-stage0-E\loop\tests\branch-cleanup.test.mjs` | `ℹ tests 6`<br>`ℹ suites 0`<br>`ℹ pass 4`<br>`ℹ fail 2`<br>`ℹ cancelled 0`<br>`ℹ skipped 0`<br>`ℹ todo 0`<br>`ℹ duration_ms 19072.7788` | 6/0 |

## 5. The registry half

The orchestrator must add these exact lines under the corresponding four
Codex entries in `runners.yml`:

```text
# under id: codex-gpt-luna
    effort: max
# under id: codex-gpt-luna-medium
    effort: medium
# under id: codex-gpt-luna-high
    effort: high
# under id: codex-gpt-luna-xhigh
    effort: xhigh
```

Until those reserved-file edits land, the code records `effort: null` for
those registry entries. Claude and OpenCode entries remain without an effort
rung until their harnesses expose one.

## 6. Blocked or refused calls

none

## 7. Findings not fixed

- `loop/tests/breakers.test.mjs:178` compares two independently-created
  throwaway repositories field-for-field but does not exempt the newly required
  `authority_sha`; each valid brief authority commit differs, so the assertion
  fails.
- `loop/tests/gate-transport-retry.test.mjs:876` asserts that `phases` is the
  only additive key, but the packet requires `brief_chars` and
  `authority_sha` on the outcome line; the assertion fails before considering
  the phase telemetry.

Both test files are outside this packet's allowed Files list and were not
edited. The final full suite therefore remains red at 1,780/2. Updating those
legacy expectations is required before merge. The OpenSpec task checkboxes in
`openspec/changes/two-desks-work-orders-and-trains/tasks.md` were also left
untouched because that reserved path is outside the allowed Files list.
