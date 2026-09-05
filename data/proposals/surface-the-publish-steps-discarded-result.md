---
date: 2026-09-04
slug: surface-the-publish-steps-discarded-result
type: machinery
summary: >
  Both callers of the shared publish step throw its return value away —
  `await publishStep(ctx, { cfg, owned: staged })` at loop/run.mjs:1552 and
  `await publishStep(root, {...})` at pulse/run.mjs:284 — so `{published:
  false}` and `{published: true}` are the same event to everything downstream.
  A run that could not publish changes no exit code, writes no HOLD.md, sets no
  ledger field, and reports its job `done`. The proposed job reads the result at
  both call sites and makes a non-publish a named run outcome: the reason
  (`foreign-content`, `commit-failed`, `tree-unreadable`, `hold`, `disabled`)
  and the blocking paths in the run's LAST word, not only mid-log, and on the
  ledger line where a later reader can count how often it happens. It should
  not change the refusal itself — the refusal is correct — only whether anything
  can see it.
evidence: >
  Measured 2026-09-04 in a scratch repository under the OS temp dir, seeded with
  one stray `content/wiki/model/someone-elses-draft.md` and run with
  `--dry-run --assume-publish`: `owned: []` returns
  `{"published":false,"reason":"foreign-content","foreign":["content/wiki/model/someone-elses-draft.md"]}`
  while the undeclared caller prints `would run: git add data content`. The
  refusal emits exactly two log lines (the `commit` refusal and the `publish`
  not-pushing line, the second only when publishing is enabled) and nothing
  else. Read at loop/run.mjs:1552 and pulse/run.mjs:284 on the same date: both
  are bare `await` expressions with no assignment, so the returned `published`,
  `reason` and `foreign` fields have no consumer anywhere. Both publishers take
  the declared branch since 4f8d9a3 (the Desk) and since the Pulse's own
  `owned` list at pulse/run.mjs:279-284, and `data/config.json` has
  `publish: true`, so a single stray dirty file under `content/` silently stops
  every publisher on the machine. Filed as addictedtoai-vqp7.1; this proposal is
  the route by which the fix can reach the Desk, since beads issues do not feed
  the derived queue.
---

The issue records the condition. This proposes the work, and the distinction
matters because they are not the same fix.

The refusal is right and must stay. `pulse/lib/publish.mjs:527` exists because
the alternative — measured, not supposed — is committing and pushing an
unrelated agent's half-written entry to the live site, which is exactly what
`addictedtoai-ps3` was filed for. "A run blocked by a guardrail reports it and
stops; it does not loosen the guardrail to get past it." Nothing here asks to
relax it.

What is missing is the *reports it* half. The guardrail stops the run; it does
not report to anything that survives the run. Two lines in a green run's log are
not a report — no operator reads the log of a job that said `done`, and the job
does say `done`, because the merge succeeded and the merge is what the outcome
is computed from. The first person to notice will notice the way these things
are always noticed here: the live `/status.json` build stamp stops advancing,
and someone diagnoses from scratch what the code already knew hours earlier.

The narrow shape, in the order it earns its place:

1. Read the result at both call sites. It is already returned, already carries
   `reason`, and already carries `foreign` on the foreign-content path.
2. Put a non-publish in the run's last word. `loop/run.mjs` already prints a
   final diagnostic line for exactly this class of silent ending; a publish that
   did not happen belongs in it, with the reason and the blocking paths named.
3. Put it on the ledger line. Whether this fires once a month or three times a
   day is unknown today and unknowable without a record, and that number is what
   decides whether step 4 is worth anything.
4. Only then weigh whether N consecutive foreign-content refusals should write
   `HOLD.md`. It is already a halt in effect; the open question is whether it
   should say so. Deliberately last, because it is the only step that changes
   behaviour rather than visibility, and it should be decided from the count in
   step 3 rather than from a guess made before the count exists.

Steps 1–3 are visibility only and cannot make anything worse. Step 4 is a real
decision and should not be bundled with them.
