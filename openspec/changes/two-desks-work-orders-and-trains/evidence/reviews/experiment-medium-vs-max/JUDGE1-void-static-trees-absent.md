# Blind review of X and Y

## Findings — X

1. **Medium — the scan floor is too weak.** `loop/tests/portability.test.mjs:130` and `:149` assert only `result.scanned > 0`. Because both target builders always append `data/config.json`, a mutation that makes `filesUnder` return no files leaves `scanned === 1` and can still pass the empty-hit assertion. The brief specifically identified the `filesUnder`-returns-nothing world; this floor does not distinguish it.

2. **Medium — the allow-list grants same-line escape routes.** `scripts/no-change-dir-refs.test.mjs:36` and `:46` allow a whole violation line merely because it also contains a generic `join(...)` expression. Appending `// openspec/changes/planted-name/spec.md` to the existing `join(changesDir, e.name, ...)` line is therefore permitted. The non-mutating regex probe produced `X join+named: True`.

3. **Medium — the fixture allow-list is line-wide rather than reference-wide.** At `scripts/no-change-dir-refs.test.mjs:41`, a line containing the legitimate template `openspec/changes/${name}/...` also permits an unrelated named path on that same line. The required named-path mutation at `scripts/check-spec-deltas.test.mjs:76` would therefore stay green if the planted path is appended to that line. The probe produced `X/Y template+named: True`.

The archive-form comment change in `loop/lib/specs.mjs:23` is correct. The runner fixture does cover all three roots, and the aggregate assertion would fail when any one root is removed, but I could not execute it.

## Findings — Y

1. **Medium — the fixture allow-list is line-wide rather than reference-wide.** `scripts/no-change-dir-refs.test.mjs:41` still accepts a line containing `openspec/changes/${name}/...` wholesale. Appending `openspec/changes/planted-name/spec.md` to `scripts/check-spec-deltas.test.mjs:76` leaves `entry.match.test(v.text)` true, so the named-path mutation can pass instead of going red. The non-mutating probe produced `X/Y template+named: True`.

Y removes X's extra `join(...)` alternatives, raises the floor to two files, and checks each fixture root independently; those are improvements, but the line-scoped allow-list still leaves the stated enforcement gap.

## The mutations I ran

None could be run. Both supplied implementation trees were unavailable as testable worktrees: `fleet6-exp-medium` does not exist, and `fleet6-exp-max` contains only `RESULT.md`. The Git worktree records for both are marked prunable.

For each implementation, the identified changed-function arms were: `filesUnder`, `scan`, `modelTargets`, `runnerTargets`, the two changed portability-test callbacks, the new three-root fixture callback, `isAllowed`, and the changed allow-list test callback. Executed arms: **0; red: 0; green: 0; restored: 0**. No mutation was applied, so there is no before/after SHA-256 restoration proof to report. This is a limitation, not a claim that the arms pass.

The static probes that did run were not substitutions for mutation tests:

```text
X join+named: True
Y join+named: False
X/Y template+named: True
X model floor with only direct config (scanned=1): True
Y model floor with only direct config (scanned=1): False
X/Y floor with empty target list (scanned=0): False/False
```

No probe file was created, so no probe-file deletion was necessary.

## The five red proofs

### X

1. `lib/` runner-id fixture: **not executed**; the supplied X tree is absent.
2. `app/` runner-id fixture: **not executed**; the supplied X tree is absent.
3. `tools/` runner-id fixture: **not executed**; the supplied X tree is absent.
4. Files-scanned floor: an explicitly empty `targets` array would be red, but the relevant `filesUnder -> []` mutation is statically **green** for X because the direct config file leaves `scanned=1`.
5. Named path in an allow-listed fixture: a standalone new line would be expected to go red, but the required same-line planted-path mutation is statically **green** (`X/Y template+named: True`). No real test output or hash proof exists.

### Y

1. `lib/` runner-id fixture: **not executed**; the supplied Y tree is absent.
2. `app/` runner-id fixture: **not executed**; the supplied Y tree is absent.
3. `tools/` runner-id fixture: **not executed**; the supplied Y tree is absent.
4. Files-scanned floor: the empty-target and `filesUnder -> []` cases are statically red (`scanned=0` and `scanned=1`, both below the floor of 2), but no real test run was possible.
5. Named path in an allow-listed fixture: the same-line mutation is statically **green** (`X/Y template+named: True`), so the proof is not established and exposes the finding above.

## Which better meets the brief

**Y**, because its two-file floor and per-root assertions close gaps that remain in X, and its allow-list patterns are narrower. Neither fully meets the brief: both retain the line-wide named-path bypass, and the required runtime evidence could not be collected.

## What I ran

The brief and both supplied diff files were read in full with `Get-Content -Raw` from their specified absolute paths. The branch objects were inspected read-only with:

```text
git -C D:\addictedtoai-worktrees\fleet6-exp-judge worktree list --porcelain
git -C D:\addictedtoai-worktrees\fleet6-exp-judge diff --name-status 96e15fa f05cfb6c47221b2460165b75e106a8fca524bfde
git -C D:\addictedtoai-worktrees\fleet6-exp-judge diff --name-status 96e15fa 8abe8003f4fcc623e99db74e3ba14f8374b85b10
```

The changed-path output for both was:

```text
M	loop/lib/specs.mjs
M	loop/tests/portability.test.mjs
M	scripts/no-change-dir-refs.test.mjs
```

The four permitted targeted test commands were attempted with the TAP reporter:

```text
node --test --test-reporter=tap D:\addictedtoai-worktrees\fleet6-exp-medium\loop\tests\portability.test.mjs
node --test --test-reporter=tap D:\addictedtoai-worktrees\fleet6-exp-medium\scripts\no-change-dir-refs.test.mjs
node --test --test-reporter=tap D:\addictedtoai-worktrees\fleet6-exp-max\loop\tests\portability.test.mjs
node --test --test-reporter=tap D:\addictedtoai-worktrees\fleet6-exp-max\scripts\no-change-dir-refs.test.mjs
```

Each exited 1 with the corresponding output:

```text
Could not find 'D:\addictedtoai-worktrees\fleet6-exp-medium\loop\tests\portability.test.mjs'
Could not find 'D:\addictedtoai-worktrees\fleet6-exp-medium\scripts\no-change-dir-refs.test.mjs'
Could not find 'D:\addictedtoai-worktrees\fleet6-exp-max\loop\tests\portability.test.mjs'
Could not find 'D:\addictedtoai-worktrees\fleet6-exp-max\scripts\no-change-dir-refs.test.mjs'
```

Thus **0 tests executed** for every implementation; the 13 portability and 3 no-change test declarations visible in each branch blob are static counts, not passing test counts. The final judge worktree `git status --short` was empty. No build, full suite, verifier, Pulse, commit, merge, push, or Beads status mutation was run.
