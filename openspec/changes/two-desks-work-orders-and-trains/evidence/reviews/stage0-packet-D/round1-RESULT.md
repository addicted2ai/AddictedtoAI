# RESULT1 — Packet D, tasks 23–24

## 1. Commits

- `8f5e14fc45f3452e8b6fefe75b3f2fa73b58be9f` — `loop: add declared runner escalation`

Output of `git -C D:/addictedtoai-worktrees/fleet6-stage0-D log --oneline main..HEAD`:

```text
8f5e14f loop: add declared runner escalation
```

## 2. What changed, per file

- `loop/lib/select.mjs`: `selectJob` now returns `topRanked: { candidate, rule } | null`. It is the first candidate in the sorted `gatherCandidates` list plus the first refusal rule, including an upkeep-floor refusal; it is `null` when that candidate is eligible and on the conformance, health, and lane-paused early returns. `escalationTarget(registry, runner, sel)` returns `registry.byId.get(runner.escalates_to) ?? null` only when `sel.topRanked.rule === 'runner:job-type'` and `runner.escalates_to` is declared; otherwise it returns `null`.
- `loop/lib/runners.mjs`: `loadRunners` accepts the optional `escalates_to` string. Its exact load-time errors are:
  - `${where}: "escalates_to" must be a non-empty string when present`;
  - `${where}: "escalates_to" names unknown runner "${r.escalates_to}"`;
  - `${where}: "escalates_to" must name a different runner than itself`;
  - `${where}: "escalates_to" target "${target.id}" is not cleared for the author role`.
  An absent field remains `undefined`. A declared destination must be a registered entry other than the source and its roles must include `author`.
- `loop/run.mjs`: the author `runner` and selection `sel` are mutable for one escalation attempt. The adoption condition is exactly:

  ```js
  if (escalated.topRanked === null && escalated.selected !== null) {
  ```

  The two escalation log templates are:

  ```text
  escalation: top-ranked ${top.type} candidate refused [${sel.topRanked.rule}] on runner "${runner.id}"; re-running selection on declared runner "${escalation.id}"
  escalation adopted: top-ranked ${top.type} candidate selected on runner "${runner.id}"
  ```

  A non-adoption uses the corresponding second line beginning `escalation refused:` and includes the escalation entry's refusal and the retained original selection. The rerun is single-step only; the escalation entry's own destination is never followed.
- `loop/tests/runner-policy.test.mjs`: new throwaway-repository tests cover a clearance-only scout escalation, budget-ceiling non-escalation, the overdue-scout/lower-ranked-repair control, refusal at the escalation entry, pure-helper behavior, and unknown/self/reviewer-only registry destinations. All fixture identifiers use the generic `mock-*` form.

## 3. Tests run

Commands with no TAP output:

- `node --check D:/addictedtoai-worktrees/fleet6-stage0-D/loop/lib/select.mjs; node --check D:/addictedtoai-worktrees/fleet6-stage0-D/loop/lib/runners.mjs; node --check D:/addictedtoai-worktrees/fleet6-stage0-D/loop/run.mjs` — exit 0.
- `openspec validate two-desks-work-orders-and-trains --type change --strict --no-interactive` — `Change 'two-desks-work-orders-and-trains' is valid`.
- `node D:/addictedtoai-worktrees/fleet6-stage0-D/scripts/check-spec-deltas.mjs --strict` — `STRICT: 0 error(s), 1 warning(s)`; the warning is recorded under section 7.

The final standalone policy test after all restores ended with:

```text
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 4022.7727
```

Targeted/regression command:

```text
node --test D:/addictedtoai-worktrees/fleet6-stage0-D/loop/tests/runner-policy.test.mjs D:/addictedtoai-worktrees/fleet6-stage0-D/loop/tests/selector-rules.test.mjs D:/addictedtoai-worktrees/fleet6-stage0-D/loop/tests/budget.test.mjs D:/addictedtoai-worktrees/fleet6-stage0-D/loop/tests/expiring-proposal-precedence.test.mjs D:/addictedtoai-worktrees/fleet6-stage0-D/loop/tests/runner-health.test.mjs
```

Final targeted iteration:

```text
ℹ tests 71
ℹ suites 0
ℹ pass 71
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 70207.5736
```

The same targeted command was also run before the final test-file adjustment: 71 pass, 0 fail, `duration_ms 62154.4025`.

Property enforcement:

- `node --test D:/addictedtoai-worktrees/fleet6-stage0-D/loop/tests/portability.test.mjs`

  ```text
  ℹ tests 13
  ℹ suites 0
  ℹ pass 13
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 985.0622
  ```

  This is the machinery model/provider/harness and runner-id boundary check.
- `node --test D:/addictedtoai-worktrees/fleet6-stage0-D/scripts/no-change-dir-refs.test.mjs`

  ```text
  ℹ tests 3
  ℹ suites 0
  ℹ pass 3
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 456.8481
  ```

  This is the repository source check for unarchived change-directory references.
- `selector-rules.test.mjs` in both targeted runs loads the real registry and checks every declared clearance. `budget.test.mjs`, `expiring-proposal-precedence.test.mjs`, and `runner-health.test.mjs` were included in both targeted runs; all passed.

Mutation-test command for every row below:

```text
node --test D:/addictedtoai-worktrees/fleet6-stage0-D/loop/tests/runner-policy.test.mjs
```

The final mandatory committed-tip suite was:

```text
npm --prefix D:/addictedtoai-worktrees/fleet6-stage0-D test
```

It completed, rather than hitting the cap, in 477.5 seconds wall time. Its final lines were:

```text
ℹ tests 1790
ℹ suites 0
ℹ pass 1790
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 475043.938
```

## 4. Mutation table

All red runs used the policy-test command above. Every restored run returned `ℹ tests 6`, `ℹ pass 6`, `ℹ fail 0`.

| Mutation | File and line | Red result, final TAP counts | Restored result |
|---|---|---|---|
| Key escalation on `sel.selected === null` | `loop/run.mjs:1286` | `ℹ tests 6` / `ℹ pass 4` / `ℹ fail 2`; the lower-ranked control and escalation-entry refusal arms failed | 6 pass / 0 fail |
| Drop the escalation adoption condition, adopting any non-null escalated selection | `loop/run.mjs:1293` | `ℹ tests 6` / `ℹ pass 5` / `ℹ fail 1`; the escalation-entry refusal arm adopted the frontier repair | 6 pass / 0 fail |
| Make `escalationTarget` return `null` unconditionally | `loop/lib/select.mjs:266` | `ℹ tests 6` / `ℹ pass 3` / `ℹ fail 3`; clearance helper and call-site arms failed | 6 pass / 0 fail |
| Accept a self-referencing `escalates_to` | `loop/lib/runners.mjs:111` | `ℹ tests 6` / `ℹ pass 5` / `ℹ fail 1`; the self-target registry assertion lost its expected load error | 6 pass / 0 fail |
| Do not rerun `selectJob` at the call site | `loop/run.mjs:1292` | `ℹ tests 6` / `ℹ pass 4` / `ℹ fail 2`; the runLoop dry-run control arms retained the repair and reported the wrong escalation refusal | 6 pass / 0 fail |
| Do not populate `topRanked` for a candidate refusal | `loop/lib/select.mjs:233` | `ℹ tests 6` / `ℹ pass 2` / `ℹ fail 4`; all four selection arms lost the top-ranked refusal data | 6 pass / 0 fail |

## 5. The registry half

The orchestrator must add this line to the `codex-gpt-luna-medium` entry in `runners.yml`:

```yaml
    escalates_to: codex-gpt-luna
```

Until that reserved-file edit lands, no real registry entry declares `escalates_to`, so the loop escalates nothing. The orchestrator handover also needs to retire the caller-side grep escalation and rewrite the max entry's note that routing belongs to the caller. Those reserved/out-of-scope changes were not made here.

## 6. Blocked or refused calls

The first documented CLI form was rejected by the installed OpenSpec CLI; it was corrected immediately with the task's positional form:

```text
openspec validate --change "two-desks-work-orders-and-trains" --strict --no-interactive
error: unknown option '--change'
(Did you mean --changes?)
```

No other tool call was blocked or refused.

## 7. Findings not fixed

- `openspec/changes/keep-the-map-describing-the-territory/specs/education-dynamic/spec.md`: the strict delta checker reports one pre-existing `stale-id` warning because `openspec/curriculum/tutorials.md` is absent from the scanned source roots. The checker reports 0 errors; this path is outside the five-file packet allowlist and was not changed.
- The shipped `runners.yml` has no `escalates_to:` line yet by design. Until the orchestrator adds the exact line in section 5, production escalation remains intentionally inactive.
