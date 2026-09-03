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

## The regression this change caused, and the bound that closes it

Filed as `addictedtoai-z5dj` the night task 1 shipped, against this change's
own commit `0ee1656`, and fixed here rather than in a second change: the
precedence and its bound are one rule, and archiving them separately would
leave the constitution stating the first without the second.

- [x] 9. `loop/lib/proposals.mjs`: read `discarded_attempts` from a proposal's
      front matter and expose `preempts` — an expiry outranks the queue only
      while no attempt at it has been discarded. Sort the ripe list on
      `preempts` rather than `expires`, so the comparator and the selector's
      band cannot drift apart.
- [x] 10. `loop/lib/select.mjs`: split the bands on `preempts`.
- [x] 11. `loop/lib/proposals.mjs`: `recordDiscardedAttempt` — stamp the count
      and append the job, date, the reviewer's reasons and its prose to the
      proposal body, which is the `detail` the next brief carries.
- [x] 12. `loop/lib/carry.mjs`: `subjectMustExist` returns a finding naming a
      path the discarded branch never merged in `orphaned` instead of writing a
      queue item against a file that does not exist.
- [x] 13. `loop/run.mjs`: wire both on the discard path, commit the amended
      proposal with the job's records, and log an orphaned finding that has no
      proposal to hold it rather than dropping it silently.
- [x] 14. Tests: `loop/tests/discarded-proposal-retry.test.mjs` — 13, grouped
      as the two halves plus the orphaning, each half with its own control.
- [x] 15. `openspec validate` and the full gates, again.

## Mutation test, round two (2026-09-03)

Each half reverted separately; both files verified byte-identical afterwards by
sha256 (`12e01a30…` / `a01ae9ac…` before and after).

Reverting the demotion (`preempts: exp.present`):

```
FAILS  an expiring proposal whose last attempt was DISCARDED no longer outranks the queue
passes THE CONTROL: the SAME proposal with no discard on it still outranks the queue
FAILS  a discarded candidate is DEMOTED, not deleted — it is still selectable, behind the queue
FAILS  an unrefused dated candidate is reached ahead of a refused one
passes an unreadable discarded_attempts does not silently demote a candidate
FAILS  the recorded reason reaches the next brief
... the six record/orphan tests pass in both worlds
```

Reverting the orphan guard (`if (false && subjectMustExist && …)`):

```
FAILS  a carried finding naming a file that does not exist is orphaned
passes THE CONTROL: a finding whose subject DOES exist is transcribed on a discard
passes without the flag — the merge path — nothing is orphaned
... the ten selection/record tests pass in both worlds
```

The two mutations fail disjoint sets, which is the evidence that the halves are
independent rather than one mechanism described twice.

`loop/tests/portability.test.mjs` refused the first draft of the new test file
for naming a provider in a comment about the real motivating case. That is the
guard working — the comment was rewritten to describe the shape without the
name, and it is the reason the machinery may not name a vendor.

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
