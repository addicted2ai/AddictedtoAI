# Tasks

- [x] 1. `loop/lib/select.mjs`: in `gatherCandidates`, rank a ripe proposal
      carrying an expiry above the derived queue and leave a proposal without
      one below it. `priority` is read nowhere else in `loop/` (verified), so
      the band may be renumbered.
- [x] 2. Update the `gatherCandidates` doc comment, which currently states the
      old order as fact.
- [x] 3. Test: an expiring proposal outranks a queue item.
- [x] 4. Test: a proposal WITHOUT an expiry still ranks below a queue item —
      the control that proves the rule is narrow rather than "proposals first".
- [x] 5. Test: directives still outrank an expiring proposal.
- [x] 6. Test: the reordering does not bypass the budget — an expiring proposal
      over the new-writing ceiling is still refused.
- [x] 7. `openspec validate let-dated-news-outrank-the-queue --type change --strict --no-interactive`.
- [x] 8. Gates: `npm test`, `npm run build`, verify-launch, verify-design,
      verify-surfaces, verify-analytics.

## Mutation test (2026-09-02)

The fix reverted to the old single-band ordering, `expiring-proposal-precedence`
re-run, tree restored and verified byte-identical by sha256:

```
FAILS  an expiring proposal is reached BEFORE the derived queue
passes THE CONTROL: a proposal with NO expiry still ranks below the queue
passes the soonest deadline wins inside the expiring band
passes the maintainer's directives still outrank dated news
passes the reordering does NOT buy a budget exemption — the ceiling still refuses
```

Exactly one test measures the change, and the three asserting UNCHANGED
behaviour pass in both worlds — which is what makes the control meaningful
rather than vacuous.

## Two existing tests the change broke, and why the fixtures moved

Both failed for the same legitimate reason — their job was sourced from the
queue while an EXPIRING proposal sat in the directory, which is exactly the
precedence this change inverts. Neither assertion was weakened; both fixtures
were made to express what the test already claimed to be testing.

- `proposal-consumed.test.mjs` — "a merged job that came from the queue retires
  nothing" planted a proposal carrying `expires:`, which now outranks the queue,
  so the job came from the PROPOSAL and consumed it. The candidate is now
  undated and backdated 30 days past cooling: still a live candidate, but one
  that genuinely loses to the queue. Deliberately ripe rather than cooling — a
  candidate the selector never considered would make the assertion vacuous.
- `proposal-merge.test.mjs` — the expiry-sweep run drove its job from a queue
  item while `live-news` (the control that must survive the sweep) carried an
  expiry, so the run selected and consumed the control and `active` came back
  empty. The job is now sourced from a DIRECTIVE, which outranks proposals and
  the queue alike, removing selection as a confound from a test that measures
  the sweep. Every original assertion is unchanged and passing.
