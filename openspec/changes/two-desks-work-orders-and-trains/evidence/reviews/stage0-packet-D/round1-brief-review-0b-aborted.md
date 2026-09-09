
<!-- reasoning only -->
I need to verify whether exit-code-refusal.test.mjs actually invokes runLoop through dry runs, since the dead runner setup with conformance failures is handled earlier in the code path, so those early-return branches won't be reached anyway.

But there's a subtle issue: the escalated re-run calls selectJob twice, and the worker needs to ensure that runner health gates at the top of runLoop don't refuse the cheap runner when it's being used for escalation — the health checks happen before selection and could prevent the escalation logic from ever reaching the frontier entry where the job would actually run.

The mutation analysis confirms this is the correct design: mutation A (escalating only when sel.selected is null) would break the cheap-entry cases that select a job, and restoring the original logic where escalation keys on the top candidate's refusal type (runner:job-type) would make those cases pass again, which validates the whole approach.

For the next mutation, I'm dropping the adoption condition entirely — just taking any non-null escalated selection without checking if the top candidate was actually accepted. The spec requires the escalation only fires when the top candidate itself passes, not when a lower-ranked candidate gets selected by the escalation entry. So (d) goes red because the scout gets adopted without proper validation, while (a) and (b) stay green since they don't have the same escalation dynamics.

The third mutation returns null unconditionally from escalationTarget, breaking the registry lookup and causing (a) and (c) to fail. The fix restores the proper condition that escal
